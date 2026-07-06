import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import logoImg from "../assets/logo.png";
import "../partials/Header.css";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const response = await fetch("https://forecastguardai.onrender.com/api/auth/status", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.loggedIn && data.user) {
                    setUser(data.user);
                }
                else {
                    setUser(null);
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Failed to fetch auth status", error);
            }
        };
        checkAuth();
    }, [location.pathname]);
    const handleLogout = async () => {
        try {
            await fetch("https://forecastguardai.onrender.com/api/auth/logout", { method: "POST" });
            localStorage.removeItem("token"); 
            setUser(null);
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle("dark-mode");
    };
    return (
        <header className="header">
            <div className="logo" onClick={() => navigate("/")}>
                <img src={logoImg} alt="logo" className="logo-img" />
            </div>
            <div className="rightsidepart">
                <button className="themetoggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    {isDarkMode ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    )}
                </button>
                {user ? (
                    <div className="auth-group">
                        <div className="username" onClick={() => navigate("/profile")}>
                            {user.name}
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <button className="signin-btn" onClick={() => navigate("/login")}>
                        Sign In
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;