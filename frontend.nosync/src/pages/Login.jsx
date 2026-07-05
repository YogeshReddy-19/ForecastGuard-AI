import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("https://forecastguardai.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({email,password}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            localStorage.setItem("token", data.token);
            window.location.href = "/"; 
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("https://forecastguardai.onrender.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");
            setIsFlipped(false);
            setError("Registration successful! Please log in.");
            setPassword(""); 
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = "https://forecastguardai.onrender.com/api/auth/google";
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className={`auth-card ${isFlipped ? "flipped" : ""}`}>
                    <div className="auth-face auth-front">
                        <h2>Welcome Back</h2>
                        <p className="auth-subtitle">Sign in to continue to ForecastGuard AI</p>
                        
                        {error && !isFlipped && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleLogin} className="auth-form">
                            <input 
                                type="email" placeholder="Email Address" required
                                value={email} onChange={(e) => setEmail(e.target.value)} 
                            />
                            <input 
                                type="password" placeholder="Password" required
                                value={password} onChange={(e) => setPassword(e.target.value)} 
                            />
                            <button type="submit" className="auth-submit">Log In</button>
                        </form>

                        <div className="auth-divider"><span>or</span></div>

                        <button className="google-btn" onClick={handleGoogleAuth}>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Continue with Google
                        </button>

                        <p className="auth-switch">
                            Don't have an account? <span onClick={() => {setIsFlipped(true); setError("");}}>Register</span>
                        </p>
                    </div>

                    <div className="auth-face auth-back">
                        <h2>Create Account</h2>
                        <p className="auth-subtitle">Join ForecastGuard AI today</p>
                        {error && isFlipped && <div className="auth-error">{error}</div>}
                        <form onSubmit={handleRegister} className="auth-form">
                            <input 
                                type="text" placeholder="Full Name" required
                                value={name} onChange={(e) => setName(e.target.value)} 
                            />
                            <input 
                                type="email" placeholder="Email Address" required
                                value={email} onChange={(e) => setEmail(e.target.value)} 
                            />
                            <input 
                                type="password" placeholder="Password" required
                                value={password} onChange={(e) => setPassword(e.target.value)} 
                            />
                            <button type="submit" className="auth-submit">Sign Up</button>
                        </form>
                        <div className="auth-divider"><span>or</span></div>
                        <button className="google-btn" onClick={handleGoogleAuth}>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Sign up with Google
                        </button>
                        <p className="auth-switch">
                            Already have an account? <span onClick={() => {setIsFlipped(false); setError("");}}>Log In</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;