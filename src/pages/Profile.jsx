import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, CircularProgress, Alert, Button, Divider } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // api.js automatically attaches the Access Token
        const res = await api.get("api/user/profile/");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("Could not load profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const username = localStorage.getItem("USERNAME");

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 4, backgroundColor: "#fbfbfb", minHeight: "90vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: "500px", borderRadius: "16px" }}>
        
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ mb: 2 }}>
          Back to Feed
        </Button>

        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          My Profile
        </Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {profile && !loading && (
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Username:</strong> {username}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Phone Number:</strong> {profile.phone_number || "Not provided"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>WhatsApp Number:</strong> {profile.whatsapp_number || "Not provided"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth 
              onClick={() => navigate("/logout")}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Profile;
