// Open your project ──> src/pages/Sidebar.jsx
import React from 'react';
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
  styled 
} from '@mui/material';
import LaptopIcon from '@mui/icons-material/Laptop';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import MemoryIcon from '@mui/icons-material/Memory';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import RouterIcon from '@mui/icons-material/Router';
import CableIcon from '@mui/icons-material/Cable';
import CategoryIcon from '@mui/icons-material/Category';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';

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

  const electronicCategories = [
    { id: 'ALL', label: 'All Spares & Modules', icon: <CategoryIcon /> },
    { id: 'LAPTOP', label: 'Laptop Components', icon: <LaptopIcon /> },
    { id: 'POWER', label: 'Inverters & Solar Spares', icon: <ElectricalServicesIcon /> },
    { id: 'BATTERY', label: 'Power Packs & Batteries', icon: <BatteryChargingFullIcon /> },
    { id: 'IC', label: 'Microchips & Motherboards', icon: <MemoryIcon /> },
    { id: 'SCREEN', label: 'Replacement Displays', icon: <ScreenShareIcon /> },
    { id: 'NET', label: 'Networking & Modems', icon: <RouterIcon /> },
    { id: 'ACCESS', label: 'Cables & Adaptors', icon: <CableIcon /> },
  ];

  return (
    <StyledSidebarContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
      
      {/* 🌟 SOTA PORTAL ACTION LINK: Enforces security check before allowing uploads */}
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
          {electronicCategories.map((category) => {
            const isSelected = currentCategory === category.id;
            return (
              <ListItem key={category.id} disablePadding>
                <ListItemButton 
                  onClick={() => onCategoryChange && onCategoryChange(category.id)}
                  sx={{
                    py: 1.2, px: 2.5,
                    borderLeft: isSelected ? '4px solid #2e7d32' : '4px solid transparent',
                    backgroundColor: isSelected ? '#f1f8e9' : 'transparent',
                    color: isSelected ? '#2e7d32' : '#333333',
                    '&:hover': { backgroundColor: isSelected ? '#f1f8e9' : '#f9f9f9' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '36px', color: isSelected ? '#2e7d32' : '#777777' }}>
                    {category.icon}
                  </ListItemIcon>
                  <ListItemText primary={category.label} primaryTypographyProps={{ fontSize: '13.5px', fontWeight: isSelected ? '700' : '500' }} />
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
