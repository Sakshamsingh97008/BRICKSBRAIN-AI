"""
BRICKSBRAIN-AI — XGBoost Price Prediction Model Training Script
=======================================================

Usage:
    python notebooks/train_price_model.py

This script:
1. Generates synthetic training data (replace with real NCR/India transaction data)
2. Trains XGBoost regressor
3. Saves model + scaler to models_store/
4. Prints feature importances and evaluation metrics
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import joblib
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models_store")
os.makedirs(MODELS_DIR, exist_ok=True)

# ── City Base Rates ────────────────────────────────────────────────────────────
CITY_RATES = {
    "Mumbai": 18000, "Pune": 8500, "Bengaluru": 9500, "Hyderabad": 7500,
    "Chennai": 7000, "Delhi": 8000, "Gurugram": 9200, "Noida": 6000,
    "Kolkata": 6500, "Ahmedabad": 5500, "Jaipur": 4800, "Chandigarh": 7200,
    "Lucknow": 4500, "Kochi": 6800, "Goa": 12000,
}
CITIES = list(CITY_RATES.keys())

# ── Synthetic Data Generation ──────────────────────────────────────────────────
def generate_synthetic_data(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic property transaction data.
    Replace this with real scraped data from 99acres / MagicBricks / Housing.com
    """
    np.random.seed(seed)
    records = []

    for _ in range(n_samples):
        city       = np.random.choice(CITIES)
        base_rate  = CITY_RATES[city]

        area       = np.random.randint(400, 3000)
        floor      = np.random.randint(0, 30)
        age        = np.random.randint(0, 25)
        metro_dist = round(np.random.uniform(0.1, 8.0), 1)
        loc_score  = np.random.randint(50, 100)
        bedrooms   = np.random.choice([1, 2, 2, 3, 3, 3, 4, 5])
        bathrooms  = max(1, bedrooms - 1 + np.random.randint(-1, 2))
        furnished  = np.random.choice([0, 1, 2])  # 0=unfurnished, 1=semi, 2=full

        # Price formula with noise
        f_bonus    = 1.04 if floor > 5 else 1.0
        a_penalty  = max(0.85, 1 - age * 0.005)
        m_penalty  = max(0.90, 1 - metro_dist * 0.03)
        s_bonus    = 0.9 + (loc_score / 100) * 0.2
        fur_bonus  = 1 + furnished * 0.05

        ppsf_true  = base_rate * f_bonus * a_penalty * m_penalty * s_bonus * fur_bonus
        ppsf_noisy = ppsf_true * np.random.uniform(0.85, 1.15)  # ±15% market noise

        records.append({
            "area":          area,
            "floor":         floor,
            "ageYears":      age,
            "metroDistKm":   metro_dist,
            "localityScore": loc_score,
            "bedrooms":      bedrooms,
            "bathrooms":     bathrooms,
            "cityRate":      base_rate,
            "furnished":     furnished,
            "pricePerSqft":  round(ppsf_noisy),
            "city":          city,
        })

    return pd.DataFrame(records)


# ── Feature Engineering ────────────────────────────────────────────────────────
FEATURE_COLS = [
    "area", "floor", "ageYears", "metroDistKm",
    "localityScore", "bedrooms", "bathrooms", "cityRate", "furnished",
]

def prepare_features(df: pd.DataFrame):
    X = df[FEATURE_COLS].values
    y = df["pricePerSqft"].values
    return X, y


# ── Train ─────────────────────────────────────────────────────────────────────
def train(n_samples: int = 5000):
    print("🏗️  Generating synthetic training data...")
    df = generate_synthetic_data(n_samples)
    print(f"   Generated {len(df)} samples across {df['city'].nunique()} cities")

    X, y = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale
    scaler  = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test  = scaler.transform(X_test)

    print("\n🚀 Training XGBoost regressor...")
    model = xgb.XGBRegressor(
        n_estimators    = 400,
        max_depth       = 6,
        learning_rate   = 0.05,
        subsample       = 0.8,
        colsample_bytree= 0.8,
        min_child_weight= 3,
        gamma           = 0.1,
        reg_alpha       = 0.1,
        reg_lambda      = 1.0,
        random_state    = 42,
        n_jobs          = -1,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)

    # Evaluate
    y_pred = model.predict(X_test)
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)
    mape   = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

    print(f"\n📊 Model Performance:")
    print(f"   MAE:  ₹{mae:.0f}/sqft")
    print(f"   MAPE: {mape:.1f}%")
    print(f"   R²:   {r2:.3f}")

    # Feature importance
    print(f"\n🔑 Feature Importances:")
    for feat, imp in sorted(zip(FEATURE_COLS, model.feature_importances_), key=lambda x: -x[1]):
        bar = "█" * int(imp * 40)
        print(f"   {feat:<20} {bar} {imp:.3f}")

    # Save
    model_path  = os.path.join(MODELS_DIR, "xgb_price.pkl")
    scaler_path = os.path.join(MODELS_DIR, "price_scaler.pkl")
    joblib.dump(model,  model_path)
    joblib.dump(scaler, scaler_path)
    print(f"\n✅ Model saved to {model_path}")
    print(f"✅ Scaler saved to {scaler_path}")

    # Sample prediction
    sample = np.array([[1050, 8, 3, 0.4, 88, 3, 2, 8000, 0]])
    sample_sc = scaler.transform(sample)
    pred_ppsf = model.predict(sample_sc)[0]
    pred_price = round(1050 * pred_ppsf / 10_000_000, 1)
    print(f"\n🏠 Sample: 1050sqft, Floor 8, 3yr, 0.4km metro, Delhi → ₹{pred_price}L")

    return model, scaler


if __name__ == "__main__":
    train(n_samples=5000)
