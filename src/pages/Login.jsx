import React, { useState } from "react";
import api from "../api";
import { useNavigate, useLocation, Link } from "react-router-dom"; 
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Dispatch credentials to Django
      const res = await api.post("api/token/", { username, password });
      
      // 2. Save tokens to Local Storage
      localStorage.setItem("ACCESS_TOKEN", res.data.access);
      if (res.data.refresh) {
        localStorage.setItem("REFRESH_TOKEN", res.data.refresh);
      }
      localStorage.setItem("USERNAME", username);

      // 3. Redirect to the page they were trying to access, or the home feed
      const targetRedirectPath = location.state?.from || "/";
      console.log(`🚀 Auth success! Forwarding to: ${targetRedirectPath}`);
      
      navigate(targetRedirectPath, { replace: true });

    } catch (err) {
      console.error("💥 Auth failure:", err.response?.data || err.message);
      
      // Robust error parsing for Django responses
      let detailedErrorMessage = "Invalid username or password.";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "object") {
          detailedErrorMessage = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" | ");
        } else {
          detailedErrorMessage = String(err.response.data);
        }
      } else if (err.message) {
        detailedErrorMessage = err.message;
      }
      
      setError(`Login Blocked: ${detailedErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', p: 2, backgroundColor: "#fbfbfb" }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid #eaeaea', backgroundColor: '#fff' }}>
        
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')} 
          size="small" 
          sx={{ mb: 2, textTransform: 'none', fontWeight: 'bold' }}
          disabled={loading}
        >
          Back to Feed
        </Button>

        <Typography variant="h5" sx={{ fontWeight: '800', mb: 1, letterSpacing: '-0.5px', color: '#111' }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your wholesale dealer session profile.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontWeight: '500' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Username" 
              variant="outlined" 
              fullWidth 
              required
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={loading}
            />
            <TextField
              label="Password" 
              type="password" 
              variant="outlined" 
              fullWidth 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={loading}
            />
            <Button
              type="submit" 
              variant="contained" 
              color="success" 
              size="large" 
              fullWidth
              startIcon={!loading && <LoginIcon />} 
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 'bold', textTransform: 'none', borderRadius: '8px', fontSize: '15px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In Securely"}
            </Button>
          </Box>
        </form>

        {/* Added a link to Register for better UX */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: "bold", textDecoration: "none", color: "#2e7d32" }}>
              Create one here
            </Link>
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
}

export default Login;
