"""
BRICKSBRAIN-AI — LSTM Price Forecast Model Training Script
===================================================

Trains a 2-layer LSTM on historical city price data for 5-year forecasting.

Usage:
    python notebooks/train_lstm_forecast.py

Replace synthetic_historical_data() with real data from your MongoDB or CSV exports.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import joblib
import warnings
warnings.filterwarnings('ignore')

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models_store")
os.makedirs(MODELS_DIR, exist_ok=True)


def synthetic_historical_data() -> pd.DataFrame:
    """
    Generate synthetic annual price data per city (2010–2024).
    Replace with real data: export from MongoDB → CSV → load here.
    """
    np.random.seed(42)
    rows = []
    CITY_RATES_2010 = {
        "Mumbai": 9500, "Delhi": 4500, "Bengaluru": 4800,
        "Hyderabad": 3200, "Pune": 4000, "Chennai": 3500,
        "Noida": 3000, "Gurugram": 5000,
    }
    GROWTH = {
        "Mumbai": 0.08, "Delhi": 0.07, "Bengaluru": 0.10,
        "Hyderabad": 0.11, "Pune": 0.09, "Chennai": 0.07,
        "Noida": 0.09, "Gurugram": 0.10,
    }
    for city, base in CITY_RATES_2010.items():
        for year in range(2010, 2025):
            i     = year - 2010
            noise = np.random.uniform(0.95, 1.05)
            price = base * (1 + GROWTH[city]) ** i * noise
            rows.append({"city": city, "year": year, "pricePerSqft": round(price)})

    return pd.DataFrame(rows)


def train_lstm():
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
        from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
        from sklearn.preprocessing import MinMaxScaler
    except ImportError:
        print("❌ TensorFlow not installed. Run: pip install tensorflow")
        return

    print("📊 Loading historical price data...")
    df = synthetic_historical_data()
    print(f"   {len(df)} records | {df['city'].nunique()} cities | {df['year'].min()}–{df['year'].max()}")

    SEQ_LEN = 6  # Use 6 years of history to predict next year
    X_all, y_all = [], []

    scaler = MinMaxScaler()

    for city in df["city"].unique():
        city_df = df[df["city"] == city].sort_values("year")
        prices  = city_df["pricePerSqft"].values.reshape(-1, 1)
        p_sc    = scaler.fit_transform(prices)

        for i in range(SEQ_LEN, len(p_sc)):
            X_all.append(p_sc[i - SEQ_LEN:i])
            y_all.append(p_sc[i])

    X = np.array(X_all)
    y = np.array(y_all)
    print(f"   Training sequences: {len(X)}")

    split   = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print("\n🧠 Building LSTM model...")
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, 1)),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1),
    ])
    model.compile(optimizer=tf.keras.optimizers.Adam(0.001), loss="mse", metrics=["mae"])
    model.summary()

    callbacks = [
        EarlyStopping(patience=15, restore_best_weights=True),
        ReduceLROnPlateau(patience=8, factor=0.5, min_lr=1e-5),
    ]

    print("\n🚀 Training LSTM...")
    history = model.fit(
        X_train, y_train,
        epochs=100, batch_size=16,
        validation_data=(X_test, y_test),
        callbacks=callbacks, verbose=1,
    )

    val_mae = min(history.history["val_mae"])
    print(f"\n📊 Best validation MAE: {val_mae:.4f} (normalized)")

    # Save
    model_path  = os.path.join(MODELS_DIR, "lstm_forecast.h5")
    scaler_path = os.path.join(MODELS_DIR, "forecast_scaler.pkl")
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    print(f"✅ LSTM model saved to {model_path}")
    print(f"✅ Scaler saved to {scaler_path}")


if __name__ == "__main__":
    train_lstm()
