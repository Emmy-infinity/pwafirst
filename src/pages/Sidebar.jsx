// Open your project ──> src/pages/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Paper, 
  Divider,
  Chip,
  styled,
  CircularProgress 
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StyledSidebarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRight: '1px solid #eaeaea',
  width: '280px',
  minWidth: '280px',
  boxSizing: 'border-box',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
}));

const TaxonomyCard = styled(Paper)({
  padding: '8px 0',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
});

const Sidebar = ({ currentCategory, onCategoryChange }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  // ─── State ──────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Fetch categories from backend ─────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get('api/categories/')
      .then(response => {
        if (isMounted) {
          setCategories(response.data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch categories:", err);
        if (isMounted) {
          setError("Could not load categories.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  // ─── Helper: get icon for category ─────────────────────────────
  const getCategoryIcon = (categoryName) => {
    // You can customize this mapping based on category names or slugs
    const name = categoryName.toLowerCase();
    if (name.includes('laptop')) return <LaptopIcon />;
    if (name.includes('inverter') || name.includes('solar')) return <ElectricalServicesIcon />;
    if (name.includes('battery') || name.includes('power')) return <BatteryChargingFullIcon />;
    if (name.includes('microchip') || name.includes('motherboard')) return <MemoryIcon />;
    if (name.includes('display') || name.includes('screen')) return <ScreenShareIcon />;
    if (name.includes('network') || name.includes('modem')) return <RouterIcon />;
    if (name.includes('cable') || name.includes('adaptor')) return <CableIcon />;
    return <CategoryIcon />;
  };

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <StyledSidebarContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={30} />
        </Box>
      </StyledSidebarContainer>
    );
  }

  if (error) {
    return (
      <StyledSidebarContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Typography color="error" variant="caption">{error}</Typography>
      </StyledSidebarContainer>
    );
  }

  return (
    <StyledSidebarContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
      
      {/* 🌟 SELLER UPLOAD CARD */}
      <Paper 
        elevation={0} 
        variant="outlined" 
        onClick={() => navigate('/upload')}
        sx={{ 
          p: 2, borderRadius: '12px', cursor: 'pointer', backgroundColor: '#fafffa', borderColor: '#c8e6c9',
          transition: 'all 0.2s ease', '&:hover': { backgroundColor: '#e8f5e9', borderColor: '#81c784' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <CloudUploadIcon color="success" />
          <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#1b5e20' }}>
            Sell Components Live
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Upload new electronic spares directly into regional dealer search engines.
        </Typography>
        
        {isAuthenticated ? (
          <Chip icon={<VerifiedUserIcon style={{ color: '#2e7d32', fontSize: '14px' }} />} label="Access Unlocked" size="small" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
        ) : (
          <Chip icon={<LockIcon style={{ fontSize: '14px' }} />} label="Sign-In Required to Sell" size="small" color="warning" variant="outlined" sx={{ fontWeight: 'bold' }} />
        )}
      </Paper>

      <Divider />

      <Box sx={{ px: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px' }}>
          Spares Categories
        </Typography>
      </Box>

      <TaxonomyCard variant="outlined">
        <List sx={{ p: 0 }}>
          {/* ─── "All" category ──────────────────────────────────── */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => onCategoryChange && onCategoryChange('ALL')}
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

          {/* ─── Dynamic categories from backend ──────────────────── */}
          {categories.map((category) => {
            const isSelected = currentCategory === category.slug;
            return (
              <ListItem key={category.id} disablePadding>
                <ListItemButton 
                  onClick={() => onCategoryChange && onCategoryChange(category.slug)}
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
          })}
        </List>
      </TaxonomyCard>

    </StyledSidebarContainer>
  );
};

export default Sidebar;
