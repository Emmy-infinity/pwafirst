// src/pages/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Paper, Divider, Chip, 
  styled, CircularProgress, Button, Link 
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
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

// ─── Styled components ─────────────────────────────────────────────
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

// ─── Component ──────────────────────────────────────────────────────
const Sidebar = ({ currentCategory = 'ALL', onCategoryChange }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Fetch categories ─────────────────────────────────────────────
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
        console.error('❌ Failed to fetch categories:', err);
        if (isMounted) {
          setError(err.message || 'Could not load categories.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // ─── Icon mapping (safe) ─────────────────────────────────────────
  const getCategoryIcon = (categoryName) => {
    try {
      if (!categoryName) return <CategoryIcon />;
      const name = categoryName.toLowerCase();
      if (name.includes('laptop')) return <LaptopIcon />;
      if (name.includes('inverter') || name.includes('solar')) return <ElectricalServicesIcon />;
      if (name.includes('battery') || name.includes('power')) return <BatteryChargingFullIcon />;
      if (name.includes('microchip') || name.includes('motherboard')) return <MemoryIcon />;
      if (name.includes('display') || name.includes('screen')) return <ScreenShareIcon />;
      if (name.includes('network') || name.includes('modem')) return <RouterIcon />;
      if (name.includes('cable') || name.includes('adaptor')) return <CableIcon />;
      return <CategoryIcon />;
    } catch {
      return <CategoryIcon />;
    }
  };

  const handleCategoryClick = (slug) => {
    if (onCategoryChange) {
      onCategoryChange(slug);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <StyledSidebarContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={30} />
        </Box>
      </StyledSidebarContainer>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────
  try {
    return (
      <StyledSidebarContainer>
        {/* 🌟 SELLER CARD WITH REGISTER LINK */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 8px 30px rgba(46,125,50,0.4)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            }
          }}
        >
          <SellIcon sx={{ fontSize: 48, color: '#fff', opacity: 0.9 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Start Selling Today
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.85, mb: 1 }}>
            List your items and reach thousands of buyers.
          </Typography>

          {isAuthenticated ? (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/upload')}
              sx={{
                bgcolor: '#fff',
                color: '#1b5e20',
                fontWeight: 'bold',
                borderRadius: '30px',
                textTransform: 'none',
                py: 1.5,
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }}
            >
              📦 Start Selling
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#fff',
                  color: '#1b5e20',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  textTransform: 'none',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'scale(1.03)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
              >
                🔑 Sign In
              </Button>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                Don't have an account?{' '}
                <Link
                  component="button"
                  onClick={() => navigate('/register')}
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    fontSize: 'inherit',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  Register here
                </Link>
              </Typography>
            </>
          )}
        </Paper>

        <Divider />

        {/* ─── CATEGORY LIST ────────────────────────────────────────── */}
        <Box sx={{ px: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px' }}>
            Categories
          </Typography>
        </Box>

        <TaxonomyCard variant="outlined">
          <List sx={{ p: 0 }}>
            {/* "All" */}
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => handleCategoryClick('ALL')}
                sx={{
                  py: 1.2, px: 2.5,
                  borderLeft: currentCategory === 'ALL' ? '4px solid #2e7d32' : '4px solid transparent',
                  backgroundColor: currentCategory === 'ALL' ? '#f1f8e9' : 'transparent',
                  color: currentCategory === 'ALL' ? '#2e7d32' : '#333333',
                  '&:hover': { backgroundColor: currentCategory === 'ALL' ? '#f1f8e9' : '#f9f9f9' }
                }}
              >
                <ListItemIcon sx={{ minWidth: '36px', color: currentCategory === 'ALL' ? '#2e7d32' : '#777777' }}>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText primary="All Categories" primaryTypographyProps={{ fontSize: '13.5px', fontWeight: currentCategory === 'ALL' ? '700' : '500' }} />
              </ListItemButton>
            </ListItem>

            {/* Dynamic categories */}
            {error ? (
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="⚠️ Could not load categories" primaryTypographyProps={{ fontSize: '13px', color: '#999' }} />
                </ListItemButton>
              </ListItem>
            ) : categories.length === 0 ? (
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="No categories added yet" primaryTypographyProps={{ fontSize: '13px', color: '#999' }} />
                </ListItemButton>
              </ListItem>
            ) : (
              categories.map((category) => {
                const isSelected = currentCategory === category.slug;
                return (
                  <ListItem key={category.id} disablePadding>
                    <ListItemButton 
                      onClick={() => handleCategoryClick(category.slug)}
                      sx={{
                        py: 1.2, px: 2.5,
                        borderLeft: isSelected ? '4px solid #2e7d32' : '4px solid transparent',
                        backgroundColor: isSelected ? '#f1f8e9' : 'transparent',
                        color: isSelected ? '#2e7d32' : '#333333',
                        '&:hover': { backgroundColor: isSelected ? '#f1f8e9' : '#f9f9f9' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '36px', color: isSelected ? '#2e7d32' : '#777777' }}>
                        {getCategoryIcon(category.name)}
                      </ListItemIcon>
                      <ListItemText primary={category.name} primaryTypographyProps={{ fontSize: '13.5px', fontWeight: isSelected ? '700' : '500' }} />
                    </ListItemButton>
                  </ListItem>
                );
              })
            )}
          </List>
        </TaxonomyCard>
      </StyledSidebarContainer>
    );
  } catch (err) {
    console.error('🔥 Sidebar render error:', err);
    return (
      <StyledSidebarContainer>
        <Typography color="error" variant="body2" sx={{ p: 2 }}>
          Something went wrong. Please check the console.
        </Typography>
      </StyledSidebarContainer>
    );
  }
};

export default Sidebar;
