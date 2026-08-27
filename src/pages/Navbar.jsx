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

const Navbar = ({ onFilterClick }) => {
  const navigate = useNavigate();
  const activeToken = localStorage.getItem("ACCESS_TOKEN");
  const traderUsername = localStorage.getItem("USERNAME") || "Trader";

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // ... rest of your login modal logic ...

  return (
    <>
      <StyledAppBar>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: "64px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
            
            {/* Mobile Buttons */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#444' }}>
                <MenuIcon />
              </IconButton>
              
              {/* THE FILTER BUTTON - NOW DIRECTLY CALLS onFilterClick */}
              <IconButton color="inherit" edge="start" onClick={onFilterClick} sx={{ mr: 1, color: '#444' }}>
                <FilterListIcon />
              </IconButton>
            </Box>

            <Box sx={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="src/images/logo.png" alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = "🏪"; }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "900", display: { xs: 'none', sm: 'block' }, background: "linear-gradient(45deg, #1e88e5 30%, #f57c00 90%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Northern Market
            </Typography>
          </Box>

          {/* ... (Keep Desktop Actions and Mobile Avatar Logic as before) ... */}
        </Toolbar>
      </StyledAppBar>
      
      {/* ... (Keep Drawer and Login Modal as before) ... */}
    </>
  );
};

export default Navbar;
