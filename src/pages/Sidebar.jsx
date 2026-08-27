import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Paper, Divider, 
  styled, CircularProgress, Button, Link, Drawer
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import LaptopIcon from '@mui/icons-material/Laptop';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import MemoryIcon from '@mui/icons-material/Memory';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import RouterIcon from '@mui/icons-material/Router';
import CableIcon from '@mui/icons-material/Cable';
import SellIcon from '@mui/icons-material/Sell';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StyledSidebarContainer = styled(Box)({
  backgroundColor: '#ffffff',
  borderRight: '1px solid #eaeaea',
  width: '280px',
  minWidth: '280px',
  boxSizing: 'border-box',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const TaxonomyCard = styled(Paper)({
  padding: '8px 0',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0'
});

const Sidebar = ({ currentCategory = 'ALL', onCategoryChange, mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await api.get('api/categories/');
        if (isMounted) {
          const data = response?.data || [];
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Could not load categories.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  const getCategoryIcon = (categoryName) => {
    // ... (Your icon mapping logic) ...
  };

  const handleCategoryClick = (slug) => {
    if (onCategoryChange) onCategoryChange(slug);
    if (onMobileClose) onMobileClose(); // Close the drawer on click
  };

  const renderSidebarContent = () => {
    if (loading) return <StyledSidebarContainer><Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress size={30} /></Box></StyledSidebarContainer>;
    
    return (
      <StyledSidebarContainer>
        {/* ... (Your seller card and category list code here) ... */}
      </StyledSidebarContainer>
    );
  };

  return (
    <>
      {/* Mobile Drawer - Controlled by the Navbar via App.js state */}
      <Drawer anchor="left" open={Boolean(mobileOpen)} onClose={onMobileClose}>
        <Box sx={{ width: 280 }}>{renderSidebarContent()}</Box>
      </Drawer>

      {/* Desktop Sidebar - Hidden entirely on mobile using MUI's sx prop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, width: 280, minWidth: 280, height: '100%' }}>
        {renderSidebarContent()}
      </Box>
    </>
  );
};

export default Sidebar;
