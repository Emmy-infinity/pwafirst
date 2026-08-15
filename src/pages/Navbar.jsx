// Open your project ──> src/pages/Navbar.jsx
import React, { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton, 
  Divider,
  styled 
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from "react-router-dom";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#ffffff",
  color: "#111111",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  borderBottom: "1px solid #eaeaea",
  borderRadius: "0px"
}));

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "70px",
  padding: "0 24px"
});

const VendorActionBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px"
});

const Navbar = () => {
  const navigate = useNavigate();
  
  // 🌟 RETRIEVES IDENTITY: Pulls live JWT tokens and username variables from localStorage cache automatically
  const activeToken = localStorage.getItem("ACCESS_TOKEN");
  const traderUsername = localStorage.getItem("USERNAME") || "Trader";

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSessionLogout = () => {
    localStorage.clear(); // Wipes access, refresh tokens, and identity records instantly
    handleMenuClose();
    window.location.href = '/login'; 
  };

  return (
    <StyledAppBar>
      <StyledToolbar>
        
        <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
          <Box sx={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img 
              src="src/images/logo.png" 
              alt="Northern Market logo" 
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = "🏪"; 
              }}
            />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: "900", 
              letterSpacing: "-0.5px", 
              background: "linear-gradient(45deg, #1e88e5 30%, #f57c00 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Northern Market
          </Typography>
        </Box>

        <VendorActionBox>
          {activeToken ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" }, fontWeight: "600", color: "#444" }}>
                Welcome, <strong>{traderUsername}</strong>
              </Typography>
              
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, border: "2px solid #eaeaea" }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#f57c00", fontWeight: "bold", fontSize: "15px" }}>
                  {traderUsername.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: { width: 220, mt: 1.5, borderRadius: "12px", border: "1px solid #f0f0f0" }
                }}
              >
                {/* 🌟 FIXED ROUTE: Routes directly to your actual full-screen uploader path */}
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "8px", px: 3 }}
            >
              Trader Sign-In
            </Button>
          )}
        </VendorActionBox>

      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;
