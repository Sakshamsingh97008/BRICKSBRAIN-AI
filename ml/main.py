"""
BRICKSBRAIN-AI ML Service — FastAPI + Scikit-learn + XGBoost + TensorFlow (LSTM)
========================================================================

Endpoints:
  POST /predict/price          — XGBoost flat/plot price prediction
  POST /predict/construction   — construction cost estimation
  GET  /predict/forecast       — LSTM 5-year price forecast
  POST /recommend              — property recommendation engine
  POST /train/price            — retrain XGBoost model with new data
  POST /train/forecast         — retrain LSTM model
  GET  /health                 — service health check

Run:
  pip install -r requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BRICKSBRAIN-AI ML Service",
    description="AI/ML backend for BRICKSBRAIN-AI Smart Real Estate Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model registry ─────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models_store")
os.makedirs(MODELS_DIR, exist_ok=True)

price_model    = None
price_scaler   = None
forecast_model = None

# City base rates (₹/sqft) — used as feature + fallback
CITY_RATES = {
    "Mumbai": 18000, "Pune": 8500, "Bengaluru": 9500, "Hyderabad": 7500,
    "Chennai": 7000, "Delhi": 8000, "Gurugram": 9200, "Noida": 6000,
    "Kolkata": 6500, "Ahmedabad": 5500, "Jaipur": 4800, "Chandigarh": 7200,
    "Lucknow": 4500, "Indore": 4200, "Kochi": 6800, "Surat": 5000,
    "Nagpur": 4000, "Visakhapatnam": 5500, "Bhopal": 3800, "Goa": 12000,
}


@app.on_event("startup")
async def load_models():
    """Load pre-trained models if they exist."""
    global price_model, price_scaler, forecast_model

    price_path    = os.path.join(MODELS_DIR, "xgb_price.pkl")
    scaler_path   = os.path.join(MODELS_DIR, "price_scaler.pkl")
    forecast_path = os.path.join(MODELS_DIR, "lstm_forecast.h5")

    if os.path.exists(price_path):
        price_model  = joblib.load(price_path)
        logger.info("✅ XGBoost price model loaded")
    if os.path.exists(scaler_path):
        price_scaler = joblib.load(scaler_path)
        logger.info("✅ Price scaler loaded")
    if os.path.exists(forecast_path):
        try:
            from tensorflow import keras
            forecast_model = keras.models.load_model(forecast_path)
            logger.info("✅ LSTM forecast model loaded")
        except Exception as e:
            logger.warning(f"⚠️  LSTM not loaded: {e}")


# ── Request / Response Schemas ─────────────────────────────────────────────────

class PricePredictRequest(BaseModel):
    area:          float = Field(..., gt=0,    description="Area in sqft")
    floor:         int   = Field(1,  ge=0,    description="Floor number")
    ageYears:      int   = Field(0,  ge=0,    description="Age of property in years")
    metroDistKm:   float = Field(1.0, ge=0,   description="Distance to nearest metro in km")
    localityScore: float = Field(75.0, ge=0, le=100)
    city:          str   = Field("Delhi")
    bedrooms:      int   = Field(2, ge=0)
    bathrooms:     int   = Field(2, ge=0)
    furnished:     str   = Field("Unfurnished")

class PricePredictResponse(BaseModel):
    price:       float
    lo:          float
    hi:          float
    confidence:  float
    pricePerSqft: float
    source:      str

class ConstructionRequest(BaseModel):
    plotAreaSqyd: float = Field(..., gt=0)
    floors:       int   = Field(1, ge=0, le=5)
    quality:      str   = Field("standard")
    city:         str   = Field("Delhi")

class ForecastRequest(BaseModel):
    city:      str   = Field("Delhi")
    basePrice: float = Field(78.0)
    years:     int   = Field(6, ge=1, le=10)

class TrainRequest(BaseModel):
    data: List[Dict[str, Any]]

class RecommendRequest(BaseModel):
    userId:       Optional[str] = None
    budget:       float
    city:         str
    propertyType: str           = "Flat"
    bedrooms:     int           = 2
    listType:     str           = "Sale"


# ── Price Prediction ────────────────────────────────────────────────────────────

def build_features(req: PricePredictRequest) -> np.ndarray:
    """Build feature vector for ML model."""
    city_rate = CITY_RATES.get(req.city, 5500)
    furnished_enc = {"Unfurnished": 0, "Semi-Furnished": 1, "Fully Furnished": 2}.get(req.furnished, 0)
    return np.array([[
        req.area,
        req.floor,
        req.ageYears,
        req.metroDistKm,
        req.localityScore,
        req.bedrooms,
        req.bathrooms,
        city_rate,
        furnished_enc,
    ]])

def fallback_predict(req: PricePredictRequest) -> dict:
    """Formula-based fallback when ML model not available."""
    rate      = CITY_RATES.get(req.city, 5500)
    f_bonus   = 1.04 if req.floor > 5 else 1.0
    a_penalty = max(0.85, 1 - req.ageYears * 0.005)
    m_penalty = max(0.90, 1 - req.metroDistKm * 0.03)
    s_bonus   = 0.9 + (req.localityScore / 100) * 0.2
    raw       = req.area * rate * f_bonus * a_penalty * m_penalty * s_bonus
    price     = round(raw / 10_000_000, 1)
    return {
        "price":        price,
        "lo":           round(price * 0.94, 1),
        "hi":           round(price * 1.06, 1),
        "confidence":   0.72,
        "pricePerSqft": rate,
        "source":       "fallback_formula",
    }

@app.post("/predict/price", response_model=PricePredictResponse)
async def predict_price(req: PricePredictRequest):
    """Predict property price using XGBoost model."""
    if price_model is not None and price_scaler is not None:
        try:
            features  = build_features(req)
            scaled    = price_scaler.transform(features)
            ppsf      = float(price_model.predict(scaled)[0])
            price     = round(req.area * ppsf / 10_000_000, 1)
            return PricePredictResponse(
                price=price, lo=round(price*0.94,1), hi=round(price*1.06,1),
                confidence=0.88, pricePerSqft=round(ppsf), source="xgboost_ml"
            )
        except Exception as e:
            logger.error(f"ML prediction failed: {e}")

    result = fallback_predict(req)
    return PricePredictResponse(**result)


# ── Construction Cost Estimation ───────────────────────────────────────────────

QUALITY_RATES = {"standard": 1800, "premium": 2400, "luxury": 3200}

@app.post("/predict/construction")
async def estimate_construction(req: ConstructionRequest):
    """Estimate construction cost based on plot area and finish quality."""
    rate   = QUALITY_RATES.get(req.quality, 1800)
    sqft   = req.plotAreaSqyd * 9 * (req.floors + 1)
    total  = round(sqft * rate / 100_000, 1)

    # City-specific labour adjustment
    city_multipliers = {"Mumbai": 1.3, "Delhi": 1.1, "Bengaluru": 1.15, "Goa": 1.25}
    multiplier = city_multipliers.get(req.city, 1.0)
    total_adj  = round(total * multiplier, 1)

    return {
        "success":     True,
        "totalLakhs":  total_adj,
        "sqft":        round(sqft),
        "ratePerSqft": rate,
        "cityMultiplier": multiplier,
        "breakdown": {
            "cement": round(total_adj * 0.30, 1),
            "steel":  round(total_adj * 0.25, 1),
            "bricks": round(total_adj * 0.18, 1),
            "labour": round(total_adj * 0.20, 1),
            "other":  round(total_adj * 0.07, 1),
        },
        "brands": {
            "cement": ["UltraTech", "ACC", "Ambuja"],
            "steel":  ["TATA Steel", "SAIL", "JSW"],
            "paint":  ["Asian Paints", "Berger", "Dulux"],
            "tiles":  ["Kajaria", "Somany", "RAK"],
        },
        "source": "rule_based",
    }


# ── 5-Year Price Forecast ──────────────────────────────────────────────────────

@app.get("/predict/forecast")
async def predict_forecast(city: str = "Delhi", basePrice: float = 78.0, years: int = 6):
    """Predict 5-year price appreciation using LSTM (or ARIMA fallback)."""
    years = max(1, min(years, 10))
    req = ForecastRequest(city=city, basePrice=basePrice, years=years)
    years_list = list(range(2025, 2025 + req.years))

    if forecast_model is not None:
        try:
            # LSTM expects [batch, timesteps, features]
            seq        = np.array([[[req.basePrice + i * 5] for i in range(req.years)]])
            preds      = forecast_model.predict(seq, verbose=0).flatten()
            forecast   = [{"year": y, "price": round(float(p), 1)} for y, p in zip(years_list, preds)]
            return {"success": True, "forecast": forecast, "city": req.city, "source": "lstm"}
        except Exception as e:
            logger.error(f"LSTM forecast failed: {e}")

    # ARIMA-like exponential growth fallback (8% annual)
    city_growth = {"Mumbai": 0.09, "Bengaluru": 0.10, "Hyderabad": 0.11, "Delhi": 0.08, "Gurugram": 0.10}
    growth_rate = city_growth.get(req.city, 0.08)
    forecast    = [{"year": y, "price": round(req.basePrice * (1 + growth_rate) ** i, 1)} for i, y in enumerate(years_list)]
    return {"success": True, "forecast": forecast, "city": req.city, "growthRate": growth_rate, "source": "arima_fallback"}


# ── Recommendation Engine ───────────────────────────────────────────────────────

@app.post("/recommend")
async def recommend_properties(req: RecommendRequest):
    """
    Content-Based + Collaborative Filtering recommendation.
    In production: use Surprise library with MongoDB property data.
    """
    # Stub: returns ranked property IDs with scores
    # Replace with real model using: from surprise import SVD, Dataset
    mock_recommendations = [
        {"propertyId": "p001", "score": 0.94, "reason": "Matches budget & locality preference"},
        {"propertyId": "p003", "score": 0.89, "reason": "High ROI in preferred city"},
        {"propertyId": "p007", "score": 0.82, "reason": "Similar users also saved this"},
        {"propertyId": "p009", "score": 0.78, "reason": "New listing matching your criteria"},
    ]
    return {"success": True, "recommendations": mock_recommendations, "model": "content_based_filtering"}


# ── Model Training Endpoints ────────────────────────────────────────────────────

@app.post("/train/price")
async def train_price_model(req: TrainRequest, background_tasks: BackgroundTasks):
    """
    Retrain XGBoost price model with new labelled transaction data.
    Expects: [{ area, floor, ageYears, metroDistKm, localityScore, bedrooms, bathrooms, cityRate, pricePerSqft }]
    """
    if len(req.data) < 50:
        raise HTTPException(status_code=400, detail="Need at least 50 data points to train")

    def do_train():
        global price_model, price_scaler
        try:
            import xgboost as xgb
            from sklearn.preprocessing import StandardScaler
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import mean_absolute_error

            df   = pd.DataFrame(req.data)
            feat = ["area", "floor", "ageYears", "metroDistKm", "localityScore", "bedrooms", "bathrooms", "cityRate"]
            X    = df[feat].values
            y    = df["pricePerSqft"].values

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            sc    = StandardScaler()
            X_tr  = sc.fit_transform(X_train)
            X_te  = sc.transform(X_test)

            model = xgb.XGBRegressor(
                n_estimators=300, max_depth=6, learning_rate=0.05,
                subsample=0.8, colsample_bytree=0.8, random_state=42,
            )
            model.fit(X_tr, y_train, eval_set=[(X_te, y_test)], verbose=False)

            mae = mean_absolute_error(y_test, model.predict(X_te))

            joblib.dump(model, os.path.join(MODELS_DIR, "xgb_price.pkl"))
            joblib.dump(sc,    os.path.join(MODELS_DIR, "price_scaler.pkl"))

            price_model  = model
            price_scaler = sc
            logger.info(f"✅ Model retrained | MAE: ₹{mae:.0f}/sqft | Samples: {len(df)}")
        except Exception as e:
            logger.error(f"Training failed: {e}")

    background_tasks.add_task(do_train)
    return {"success": True, "message": "Training started in background", "samples": len(req.data)}


@app.post("/train/forecast")
async def train_forecast_model(req: TrainRequest, background_tasks: BackgroundTasks):
    """
    Train LSTM model with historical price time-series data.
    Expects: [{ city, year, pricePerSqft }] sorted by year
    """
    def do_train():
        try:
            import tensorflow as tf
            from tensorflow.keras.models import Sequential
            from tensorflow.keras.layers import LSTM, Dense, Dropout
            from sklearn.preprocessing import MinMaxScaler

            df = pd.DataFrame(req.data).sort_values("year")
            sc = MinMaxScaler()

            prices    = df["pricePerSqft"].values.reshape(-1, 1)
            prices_sc = sc.fit_transform(prices)

            SEQ_LEN = 6
            X, y    = [], []
            for i in range(SEQ_LEN, len(prices_sc)):
                X.append(prices_sc[i-SEQ_LEN:i])
                y.append(prices_sc[i])
            X, y = np.array(X), np.array(y)

            model = Sequential([
                LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, 1)),
                Dropout(0.2),
                LSTM(32),
                Dropout(0.2),
                Dense(1),
            ])
            model.compile(optimizer="adam", loss="mse")
            model.fit(X, y, epochs=50, batch_size=16, verbose=0)

            model.save(os.path.join(MODELS_DIR, "lstm_forecast.h5"))
            joblib.dump(sc, os.path.join(MODELS_DIR, "forecast_scaler.pkl"))
            logger.info("✅ LSTM forecast model trained")
        except Exception as e:
            logger.error(f"LSTM training failed: {e}")

    background_tasks.add_task(do_train)
    return {"success": True, "message": "LSTM training started in background"}


# ── Health Check ────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status":    "ok",
        "service":   "BRICKSBRAIN-AI ML Service",
        "version":   "1.0.0",
        "models": {
            "price_model":    price_model    is not None,
            "price_scaler":   price_scaler   is not None,
            "forecast_model": forecast_model is not None,
        },
    }

@app.get("/")
async def root():
    return {"message": "BRICKSBRAIN-AI ML Service is running. See /docs for API documentation."}
