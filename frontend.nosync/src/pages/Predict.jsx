import React, {useState,useEffect} from "react";
import {useNavigate} from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/Predict.css";

const Predict = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState("");
    const [liveData, setLiveData] = useState(null);
   useEffect(() => {
        const socket = io("https://forecastguardai.onrender.com", {
            transports: ["websocket"] 
        });
        socket.on("connect", () => {
            console.log("Successfully connected via WebSockets");
        });
        socket.on("connect_error", (err) => {
            console.error("Connection failed:", err.message);
        });
        socket.on("PRICE_UPDATE", (data) => {
            setLiveData(data);
        });
        return () => socket.disconnect();
    }, []);
    const runPrediction = async () => {
        setLoading(true);
        setError("");
        setPrediction(null);
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in to run a prediction.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch("https://forecastguardai.onrender.com/api/predict", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch prediction");
            }
            setPrediction(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="page">
            <div className="intro">
                <h1>AI Market Analysis</h1>
                <p>Run the predictive model on real-time market data.</p>
            </div>
            {liveData ? (
                <div className={`live-banner ${liveData.status?.toLowerCase()}`}>
                    <p>
                        Live AAPL Price: <strong>${liveData.live_price?.toFixed(2) ?? "0.00"}</strong> 
                        {" "} vs Baseline: ${liveData.baseline_price?.toFixed(2) ?? "0.00"}
                    </p>
                    <span className="status-tag">{liveData.status}</span>
                </div>
            ) : (
                <div className="live-banner" style={{ background: "#f1f5f9", color: "#64748b" }}>
                    <p>Waiting for real-time market updates...</p>
                </div>
            )}
            {!prediction && !loading && (
                <div className="ticker">
                    <div className="ticker-box">
                        <h2>Apple Inc. (AAPL)</h2>
                        <button className="btn-run" onClick={runPrediction}>
                            Run Analysis
                        </button>
                    </div>
                    {error && <div className="error-box">{error}</div>}
                </div>
            )}

            {loading && (
                <div className="loading-box">
                    <div className="spinner"></div>
                    <p>Fetching market data & running models...</p>
                </div>
            )}

            {prediction && !loading && (
                <div className="results">
                    
                    <div className="row">
                        <div className="card highlight">
                            <span className="label">Asset</span>
                            <strong>{prediction.ticker}</strong>
                        </div>
                        <div className="card highlight">
                            <span className="label">Current Price</span>
                            <strong>${prediction.current_price.toFixed(2)}</strong>
                        </div>
                        <div className="card highlight">
                            <span className="label">Predicted Price</span>
                            <strong>${prediction.predicted_price.toFixed(2)}</strong>
                        </div>
                        <div className={`card highlight ${prediction.direction.toLowerCase()}`}>
                            <span className="label">Direction</span>
                            <strong>{prediction.direction}</strong>
                        </div>
                    </div>

                    <div className="grid">
                        {liveData && (
                        <div className="card live-comparison">
                            <span className="label">Live Market Status</span>
                            <strong className={liveData.status === "ON_TRACK" ? "text-green" : "text-red"}>
                                {liveData.status}
                            </strong>
                        </div>
                        )}
                        <div className="card">
                            <span className="label">Reliability Score</span>
                            <div className="split">
                                <span className="value">{prediction.reliability_score.toFixed(1)}%</span>
                                <span className="tag">{prediction.reliability_label}</span>
                            </div>
                        </div>

                        <div className="card">
                            <span className="label">Model Agreement</span>
                            <div className="split">
                                <span className="value">{prediction.models_agree ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`risk-box risk-${prediction.risk_level.toLowerCase()}`}>
                        <div className="title">Risk Assessment: {prediction.risk_level}</div>
                        <p className="message">{prediction.risk_message}</p>
                    </div>

                    <div className="bottom-bar">
                        <button className="btn-clear" onClick={() => setPrediction(null)}>
                            Clear Results
                        </button>
                        <span className="time">Data updated: {new Date(prediction.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Predict;