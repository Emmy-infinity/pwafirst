import React, { useState } from "react";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom"; 
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation(); // 🌟 Read memory handshakes passed by other pages during roadblocks

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 📡 Dispatches secure login credentials straight to your Django endpoint cluster
      const res = await api.post("api/token/", { username, password });
      
      // Saves keys to memory using clean, consistent quotes to avoid lookup conflicts
      localStorage.setItem("ACCESS_TOKEN", res.data.access);
      if (res.data.refresh) {
        localStorage.setItem("REFRESH_TOKEN", res.data.refresh);
      }
      localStorage.setItem("USERNAME", username);

      // 🧠 THE REDIRECTION ENGINE: Extracts memory vector link, otherwise defaults to home (/)
      const targetRedirectPath = location.state?.from || "/";
      
      console.log(`🚀 Authentication success! Memory vector caught. Forwarding to: ${targetRedirectPath}`);
      
      // Execute fast interface state forward pass
      navigate(targetRedirectPath);

    } catch (err) {
      console.error("💥 Core Authentication failure trace details:", err.response?.data || err.message);
      
      // 🌟 AUTOMATED EXPLICIT PARSER ENGINE INJECTION: Exposes exactly why Django rejected the handshake
      let detailedErrorMessage = "Invalid username or password credentials configuration.";
      if (err.response && err.response.data) {
        detailedErrorMessage = typeof err.response.data === 'object' 
          ? JSON.stringify(err.response.data) 
          : String(err.response.data);
      } else if (err.message) {
        detailedErrorMessage = err.message;
      }
      
      setError(`Login Blocked: ${detailedErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', p: 2 }}>
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
      </Paper>
    </Box>
  );
}

export default Login;
