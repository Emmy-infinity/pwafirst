import React, { useState } from "react";
import { 
  AppBar, Toolbar, Typography, Box, Button, Avatar, Menu, MenuItem, 
  IconButton, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Link, styled 
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import LoginIcon from '@mui/icons-material/Login';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import api from "../api";

// 🌟 ORANGE THEME STYLES
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: "sticky", 
  top: 0, 
  zIndex: theme.zIndex.drawer + 1,
  // Vibrant orange gradient background for a highlighted look
  background: "linear-gradient(90deg, #f57c00 0%, #ef6c00 100%)",
  color: "#ffffff", 
  boxShadow: "0 4px 15px rgba(245, 124, 0, 0.3)",
  borderBottom: "3px solid #e65100" // Slightly darker orange bottom border
}));

const Navbar = ({ onFilterClick }) => {
  const navigate = useNavigate();
  const activeToken = localStorage.getItem("ACCESS_TOKEN");
  const traderUsername = localStorage.getItem("USERNAME") || "Trader";

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSessionLogout = () => {
    localStorage.clear();
    handleMenuClose();
    window.location.href = '/login'; 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const response = await api.post("api/token/", { username, password });
      localStorage.setItem("ACCESS_TOKEN", response.data.access);
      if (response.data.refresh) localStorage.setItem("REFRESH_TOKEN", response.data.refresh);
      localStorage.setItem("USERNAME", username);
      setLoginModalOpen(false);
      window.location.reload();
    } catch (err) {
      setLoginError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <StyledAppBar>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: "64px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
            
            {/* Mobile Filter Button - White for contrast on orange */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={onFilterClick} sx={{ mr: 1, color: '#ffffff' }}>
                <FilterListIcon />
              </IconButton>
            </Box>

            {/* Logo - Highlighted with White & Drop Shadow */}
            <Box sx={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="src/images/logo.png" alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = "🏪"; }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: "900", 
                color: "#ffffff", // White text for maximum highlighting
                textShadow: "2px 2px 4px rgba(0,0,0,0.4)", // Drop shadow to pop out
                letterSpacing: "-0.5px",
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Northern Market
            </Typography>
          </Box>

          {/* Desktop Actions */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: "center", gap: "16px" }}>
            {activeToken ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: "600", color: "#ffffff", opacity: 0.9 }}>
                  Welcome, <strong>{traderUsername}</strong>
                </Typography>
                {/* White bordered avatar to stand out */}
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, border: "2px solid #ffffff" }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "#ffffff", color: "#ef6c00", fontWeight: "bold", fontSize: "15px" }}>
                    {traderUsername.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{ elevation: 3, sx: { width: 220, mt: 1.5, borderRadius: "12px", border: "1px solid #f0f0f0" } }}
                >
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/upload"); }}>
                    <StoreIcon fontSize="small" sx={{ mr: 1.5, color: "#f57c00" }} />
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>List New Component</Typography>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleSessionLogout} sx={{ color: "#d32f2f" }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: "600" }}>Sign Out Securely</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // White button with orange text to pop against the orange bar
              <Button 
                variant="contained" 
                startIcon={<LoginIcon />} 
                onClick={() => setLoginModalOpen(true)} 
                sx={{ 
                  fontWeight: "bold", 
                  textTransform: "none", 
                  borderRadius: "8px", 
                  px: 3, 
                  bgcolor: "#ffffff", 
                  color: "#ef6c00", 
                  '&:hover': { bgcolor: "#f5f5f5" }
                }}
              >
                Trader Sign‑In
              </Button>
            )}
          </Box>

          {/* Mobile Action Button (Avatar/Login shortcut) - White icon */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {!activeToken ? (
              <IconButton color="inherit" onClick={() => setLoginModalOpen(true)} sx={{ color: '#ffffff' }}>
                <LoginIcon />
              </IconButton>
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#ffffff", color: "#ef6c00", fontWeight: "bold", fontSize: "14px" }}>
                {traderUsername.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Login Modal - Unchanged */}
      <Dialog open={loginModalOpen} onClose={() => setLoginModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="800">Welcome Back</Typography>
          <IconButton onClick={() => setLoginModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleLogin}>
          <DialogContent sx={{ pt: 0 }}>
            {loginError && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{loginError}</Alert>}
            <TextField label="Username" variant="outlined" fullWidth required value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 2 }} size="small" />
            <TextField label="Password" type="password" variant="outlined" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} size="small" />
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Link component="button" variant="body2" onClick={() => { setLoginModalOpen(false); navigate("/register"); }}>Don't have an account? Register</Link>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button type="submit" variant="contained" color="success" fullWidth disabled={loginLoading} sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "8px", py: 1.2 }}>
              {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In Securely"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Navbar;
