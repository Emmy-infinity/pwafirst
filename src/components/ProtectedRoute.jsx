import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { Box, CircularProgress, Typography } from "@mui/material";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        // 🌟 SYNCHRONIZED STORAGE KEY: Clean string quotes match your active login cache keys layout rule
        const currentRefreshToken = localStorage.getItem("REFRESH_TOKEN");
        if (!currentRefreshToken) {
            setIsAuthorized(false);
            return;
        }

        try {
            // Note: SimpleJWT endpoints expect the exact path mapping layout rule string
            const res = await api.post("api/token/refresh/", {
                refresh: currentRefreshToken,
            });
            
            if (res.status === 200) {
                localStorage.setItem("ACCESS_TOKEN", res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("💥 JWT Token refresh failure:", error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        // 🌟 SYNCHRONIZED STORAGE KEY: Clean string quotes match your active login cache keys layout rule
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000; // Convert to seconds

            if (tokenExpiration < now) {
                console.warn("🔐 JWT Access Token expired. Dispatching background rotation refresh...");
                await refreshToken();
            } else {
                setIsAuthorized(true);
            }
        } catch (err) {
            console.error("💥 JWT Decoder crash:", err);
            setIsAuthorized(false);
        }
    };

    if (isAuthorized === null) {
        // 🌟 SOTA LOADER INTERCEPT: Material UI progress indicator layout matching your corporate template
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#fbfbfb">
                <CircularProgress color="success" size={40} />
                <Typography variant="body2" sx={{ ml: 2, mt: 2, color: '#666', fontWeight: '500' }}>
                    Authenticating safe terminal keys...
                </Typography>
            </Box>
        );
    }

    return isAuthorized ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
