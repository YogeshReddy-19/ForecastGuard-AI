import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import "../partials/Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-logo">
                    <img src={logoImg} alt="logo" className="logo-img" />
                    <span className="logo-text">ForecastGuard AI</span>
                </div>
                <div className="footer-links">
                    <Link to="/help">Help</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} ForecastGuard AI. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;