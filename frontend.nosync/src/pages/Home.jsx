import React from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Home.css"

const Home = () => {
    const navigate = useNavigate();
    const handlepredictionclick = ()=>{
        navigate('/predict');
    };
    return(
        <div className="home">
            <div className="top">
                <h2 className="subtitle">Check a stock prediction and see how much confidence the model actually has.</h2>
                <p className="point">ForecastGuard AI combines price forecasting, direction prediction, and a reliability model to estimate whether a prediction should be trusted.</p>
                <button className="predict-btn" onClick={handlepredictionclick}>Get prediction</button>
            </div>
            <div className="models">
                <h2>What Makes It Different</h2>
                <div className="grid">
                    <div className="card">
                        <h3>Price Forecast</h3>
                        <p>Predicts the next closing price using an LSTM model.</p>
                    </div>
                    <div className="card">
                        <h3>Direction Model</h3>
                        <p>Predicts whether price is more likely to move UP or DOWN.</p>
                    </div>
                    <div className="card">
                        <h3>Reliability Engine</h3>
                        <p>Scores prediction confidence based on model agreement and historical behavior.</p>
                    </div>
                </div>
            </div>
            <div className="workflow">
                <div className="process">
                    <h2>How It Works</h2>
                    <div className="timeline">
                        <div className="step">Market Data</div>
                        <div className="arrow">↓</div>
                        <div className="step">Feature Engineering</div>
                        <div className="arrow-row">
                            <span>↙</span>
                            <span>↘</span>
                        </div>
                        <div className="parallel-nodes">
                            <div className="step">LSTM Price Model</div>
                            <div className="step">Direction Model</div>
                        </div>
                        <div className="arrow-row">
                            <span>↘</span>
                            <span>↙</span>
                        </div>
                        <div className="step">Reliability Model</div>
                        <div className="arrow">↓</div>
                        <div className="step">Risk Assessment</div>
                    </div>
                </div>
            </div>
            <div className="demo">
                <h2>Example Output</h2>
                <div className="output">
                    <div className="ticker">
                        <h3>AAPL</h3>
                    </div>
                    <div className="details">
                        <div className="stats">
                            <div className="stat">
                                <span>Current Price</span>
                                <strong>$298.01</strong>
                            </div>
                            <div className="stat">
                                <span>Predicted Price</span>
                                <strong>$298.37</strong>
                            </div>
                            <div className="stat">
                                <span>Direction</span>
                                <strong className="up">UP</strong>
                            </div>
                            <div className="stat">
                                <span>Reliability</span>
                                <strong className="medium">43.15%</strong>
                            </div>
                        </div>
                        <div className="risk">
                            <span>Risk Level</span>
                            <strong className="high">HIGH</strong>
                        </div>
                    </div>
                </div>
            </div>
            <div className="Note">
                <p>Price data: 15-minute delay via Yahoo Finance</p>
                <p>Model trained on AAPL data 1980–2020</p>
                <p>Not financial advice</p>
            </div>
        </div>
    );
};

export default Home;