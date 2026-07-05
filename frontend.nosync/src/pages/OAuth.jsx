import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            navigate("/"); 
        } else {
            navigate("/login"); 
        }
    }, [searchParams, navigate]);
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <h2>Authenticating...</h2>
        </div>
    );
};

export default OAuthSuccess;