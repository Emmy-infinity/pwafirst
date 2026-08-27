import React, { useState } from "react";
import { 
  AppBar, Toolbar, Typography, Box, Button, Avatar, Menu, MenuItem, 
  IconButton, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Link, styled 
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import api from "../api";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: "sticky", top: 0, zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#ffffff", color: "#111111", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  borderBottom: "1px solid #eaeaea"
}));

const StyledToolbar = styled(Toolbar)({
  display: "flex", justifyContent: "space-between", alignItems: "center",
  minHeight: "70px", padding: "0 16px"
});

const Navbar = ({ onFilterClick }) => {
  const navigate = useNavigate();
  
  const activeToken = localStorage.getItem("ACCESS_TOKEN");
  const traderUsername = localStorage.getItem("USERNAME") || "Trader";

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleSessionLogout = () => {
    localStorage.clear();
    handleMenuClose();
    setMobileOpen(false);
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

  const drawerContent = (
    <Box sx={{ width: 250, p: 2 }} role="presentation">
      <List>
        {activeToken ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setMobileOpen(false); navigate("/upload"); }}>
                <ListItemIcon><StoreIcon /></ListItemIcon>
                <ListItemText primary="List New Component" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleSessionLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Sign Out Securely" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setMobileOpen(false); setLoginModalOpen(true); }}>
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Trader Sign-In" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <StyledAppBar>
        <StyledToolbar>
          <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
            {/* Mobile Buttons */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 0.5, color: '#444' }}>
                <MenuIcon />
              </IconButton>
              {/* NEW FILTER BUTTON */}
              <IconButton color="inherit" edge="start" onClick={onFilterClick} sx={{ mr: 1, color: '#444' }}>
                <FilterListIcon />
              </IconButton>
            </Box>

            <Box sx={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img 
                src="src/images/logo.png" 
                alt="Northern Market logo" 
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = "🏪"; }}
              />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: "900", letterSpacing: "-0.5px", 
                background: "linear-gradient(45deg, #1e88e5 30%, #f57c00 90%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
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
                <Typography variant="body2" sx={{ fontWeight: "600", color: "#444" }}>
                  Welcome, <strong>{traderUsername}</strong>
                </Typography>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, border: "2px solid #eaeaea" }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "#f57c00", fontWeight: "bold", fontSize: "15px" }}>
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
                    <StoreIcon fontSize="small" sx={{ mr: 1.5, color: "#555" }} />
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
              <Button variant="contained" color="primary" startIcon={<LoginIcon />} onClick={() => setLoginModalOpen(true)} sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "8px", px: 3 }}>
                Trader Sign‑In
              </Button>
            )}
          </Box>

          {/* Mobile Action Button */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {!activeToken ? (
              <IconButton color="primary" onClick={() => setLoginModalOpen(true)}>
                <LoginIcon />
              </IconButton>
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#f57c00", fontWeight: "bold", fontSize: "14px" }}>
                {traderUsername.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawerContent}
      </Drawer>

      {/* Login Modal */}
      <Dialog open={loginModalOpen} onClose={() => setLoginModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        {/* ... same dialog code as before ... */}
      </Dialog>
    </>
  );
};

export default Navbar;
