import React, { useState } from "react";
import api from "../api"; // Ensure this path is correct relative to your Register.jsx
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Link,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function Register() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Frontend Validation: Check if passwords match
    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Send data to Django Backend (matches CreateUserView)
      // Note: Django's UserSerializer usually expects password2 for confirmation
      await api.post("api/user/register/", formData);

      setSuccess("Account created successfully! Redirecting to login...");
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);

      // Automated Error Parser (Similar to Login)
      let detailedErrorMessage = "Registration failed. Please try again.";
      if (err.response && err.response.data) {
        detailedErrorMessage = typeof err.response.data === "object"
          ? Object.entries(err.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" | ")
          : String(err.response.data);
      } else if (err.message) {
        detailedErrorMessage = err.message;
      }

      setError(detailedErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        backgroundColor: "#fbfbfb",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          width: "100%",
          maxWidth: "600px",
          borderRadius: "16px",
          border: "1px solid #eaeaea",
          backgroundColor: "#fff",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          size="small"
          sx={{ mb: 2, textTransform: "none", fontWeight: "bold" }}
          disabled={loading}
        >
          Back to Feed
        </Button>

        <Typography
          variant="h5"
          sx={{ fontWeight: "800", mb: 1, letterSpacing: "-0.5px", color: "#111" }}
        >
          Create an Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Join the wholesale dealer network.
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px", fontWeight: "500" }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: "8px", fontWeight: "500" }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Username */}
            <Grid item xs={12}>
              <TextField
                label="Username"
                name="username"
                variant="outlined"
                fullWidth
                required
                value={formData.username}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                variant="outlined"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>

            {/* First & Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="first_name"
                variant="outlined"
                fullWidth
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="last_name"
                variant="outlined"
                fullWidth
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                name="password2"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={formData.password2}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={!loading && <PersonAddIcon />}
                disabled={loading || success}
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  mt: 1,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up Securely"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Link to Login */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/login")}
              sx={{ fontWeight: "bold", textDecoration: "none", color: "success.main" }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
