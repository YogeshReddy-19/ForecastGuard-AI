import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const Profile = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            try {
                const response = await fetch("https://forecastguardai.onrender.com/api/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load profile");
                }
                setProfileData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);
    if (loading) {
        return (
            <div className="page loader">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="page">
                <div className="error">{error}</div>
            </div>
        );
    }
    return (
        <div className="page">
            <div className="intro">
                <h1>My Profile</h1>
            </div>
            <div className="card profile">
                <div className="group">
                    <span className="label">Name</span>
                    <strong>{profileData.user.name}</strong>
                </div>
                <div className="group">
                    <span className="label">Email Address</span>
                    <strong>{profileData.user.email}</strong>
                </div>
                <div className="group">
                    <span className="label">Member Since</span>
                    <strong>{new Date(profileData.user.created_at).toLocaleDateString()}</strong>
                </div>
            </div>
            <div className="history">
                <h2>Prediction History</h2>
                {profileData.history.length === 0 ? (
                    <div className="card empty">
                        <p>You haven't run any predictions yet.</p>
                        <button className="action" onClick={() => navigate("/predict")}>
                            Run Your First Analysis
                        </button>
                    </div>
                ) : (
                    <div className="wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Asset</th>
                                    <th>Current</th>
                                    <th>Predicted</th>
                                    <th>Direction</th>
                                    <th>Reliability Score</th>
                                    <th>Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profileData.history.map((item) => (
                                    <tr key={item.id || item.created_at}>
                                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td><strong>AAPL</strong></td>
                                        <td>${Number(item.current_price).toFixed(2)}</td>
                                        <td>${Number(item.predicted_price).toFixed(2)}</td>
                                        <td>
                                            <span className={`tag ${item.direction.toLowerCase()}`}>
                                                {item.direction}
                                            </span>
                                        </td>
                                        <td>{Number(item.reliability_score).toFixed(1)}%</td>
                                        <td>
                                            <span className={`tag ${item.risk_level.toLowerCase()}`}>
                                                {item.risk_level}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;