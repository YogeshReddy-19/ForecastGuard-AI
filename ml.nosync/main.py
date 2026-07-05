from fastapi import FastAPI,HTTPException
import pandas as pd 
import numpy as np 
import yfinance as yf 
import joblib 
from datetime import datetime,timezone
from fastapi.middleware.cors import CORSMiddleware
import os
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
Lookback = 30
features = [
    "return",
    "log_return",
    "dist_MA5",
    "dist_MA10",
    "dist_MA20",
    "volatility",
    "price_range",
    "lag_return_1",
    "lag_return_2",
    "lag_return_3",
    "lag_return_4",
    "lag_return_5",
    "rsi_14",
    "bb_pos",
    "vol_ratio"
]
directionm = tf.keras.models.load_model(os.path.join(MODEL_DIR, "direction.keras"))
pricem = tf.keras.models.load_model(os.path.join(MODEL_DIR,"price.keras"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler-3.pkl"))
reliabilitym = joblib.load(os.path.join(MODEL_DIR, "xgb_reliability_model-2.pkl"))
app = FastAPI(title = "AI Reliability System ml API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173","https://forecastguardai.vercel.app"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

def rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / (loss + 1e-9)
    return 100 - (100 / (1 + rs))

def reliability_label(score):
    if score >= 80:
        return "Very High"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Medium"
    else:
        return "Low"

def getrisk(agreement,reliability):
    if agreement == 0:
        return ("HIGH","Models disagree. No trade.")
    if reliability >= 62:
        return ("LOW","Order approved")
    if reliability >= 48:
        return ("MEDIUM","Proceed with caution")
    return ("HIGH","Low confidence. No trade.")

def build_features(df):
    df["return"] = df["Close"].pct_change()
    df["log_return"] = np.log(df["Close"]).diff()
    df["MA5"] = df["Close"].rolling(5).mean()
    df["MA10"] = df["Close"].rolling(10).mean()
    df["MA20"] = df["Close"].rolling(20).mean()
    df["dist_MA5"] = ((df["Close"] - df["MA5"])/ df["MA5"])
    df["dist_MA10"] = ((df["Close"] - df["MA10"])/ df["MA10"])
    df["dist_MA20"] = ((df["Close"] - df["MA20"])/ df["MA20"])
    df["volatility"] = (df["return"].rolling(10).std())
    df["price_range"] = ((df["High"] - df["Low"])/ df["Close"])
    for i in range(1, 6):
        df[f"lag_return_{i}"] = (df["return"].shift(i))
    df["rsi_14"] = rsi(df["Close"])
    bb_mid = df["Close"].rolling(20).mean()
    bb_std = df["Close"].rolling(20).std()
    df["bb_pos"] = ((df["Close"] - (bb_mid - 2 * bb_std))/ (4 * bb_std + 1e-9))
    df["vol_ratio"] = (df["Volume"]/ df["Volume"].rolling(20).mean())
    return df.dropna().reset_index(drop=True)

@app.get("/")
def home():
    return {"message":"API is running"}

@app.post("/predict")
def predict():
    try:
        df = yf.download("AAPL",period="6mo",progress=False,auto_adjust=False)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        if df.empty:
            raise HTTPException(status_code=500,detail="Could not fetch market data")
        df = df.reset_index()
        df = build_features(df)
        if len(df) < Lookback:
            raise HTTPException(
                status_code=500,
                detail="Not enough data for prediction"
            )
        latest_features = scaler.transform(df[features])
        latest_features = latest_features[-30:]

        X_direction = latest_features.reshape(1,Lookback,len(features))

        direction_prob = float(directionm.predict(X_direction,verbose=0)[0][0])

        direction_text = ("UP" if direction_prob > 0.5 else "DOWN")

        latest_price_window = (df["Close"].values[-30:])
        w_min = latest_price_window.min()
        w_max = latest_price_window.max()

        if w_max == w_min:
            w_max += 1e-8

        latest_price_scaled = ((latest_price_window - w_min)/ (w_max - w_min))

        X_price = (latest_price_scaled.reshape(1, 30, 1))

        pred_scaled_price = float(pricem.predict(X_price,verbose=0)[0][0])

        predicted_price = (pred_scaled_price* (w_max - w_min)+ w_min)

        current_price = float(df["Close"].iloc[-1])

        price_direction = int(predicted_price > current_price)

        direction_class = int(direction_prob > 0.5)

        agreement = int(price_direction == direction_class)

        direction_confidence = (abs(direction_prob - 0.5)* 2)

        predicted_return = (predicted_price - current_price) / current_price
        price_move_pct = abs(predicted_price - current_price) / current_price

        reliability_features = pd.DataFrame({
            "direction_prob": [direction_prob],
            "agreement": [agreement],
            "move_strength": [np.clip(price_move_pct * 20,0,1)],
            "vol_factor": [1.0],
            "direction_conf": [direction_confidence],
            "predicted_return": [predicted_return]
        })

        reliability_score = float(reliabilitym.predict_proba(reliability_features)[0][1]* 100)

        risk_level, risk_message = getrisk(agreement,reliability_score)

        return {
            "ticker": "AAPL",
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "direction": direction_text,
            "direction_probability": round(direction_prob, 4),
            "models_agree": bool(agreement),
            "direction_conf": round(direction_confidence,4),
            "predicted_return": round(predicted_return,4),
            "move_strength": round(price_move_pct * 20,4),
            "reliability_score": round(reliability_score, 2),
            "reliability_label": reliability_label(reliability_score),
            "risk_level": risk_level,
            "risk_message": risk_message,
            "data_source": "live",
            "timestamp": datetime.now(timezone.utc).isoformat() 
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )