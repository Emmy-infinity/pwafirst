import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Typography, Card, CardContent, CardMedia, 
  Chip, CircularProgress, Alert, TextField, MenuItem, 
  Slider, InputAdornment, Paper, Divider, Button 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import StarIcon from '@mui/icons-material/Star';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import api from '../api';

export default function GalleryView({ selectedCategory }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(5000000); 

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // 📡 Fetches records from your active live Django web service container
    api.get('api/products/')
      .then(response => {
        if (isMounted) {
          // 🌟 THE SAFE STRUCTURAL FALLBACK: Natively parses both loose arrays and paginated results objects
          const rawData = response.data;
          if (Array.isArray(rawData)) {
            setProducts(rawData);
          } else if (rawData && Array.isArray(rawData.results)) {
            setProducts(rawData.results);
          } else {
            setProducts([]);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Storefront marketplace catalog grid sync failure:", err);
        if (isMounted) {
          setError("Could not parse the streamed real-time data payload from the backend container.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; }; 
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory && selectedCategory !== 'ALL') {
      result = result.filter(p => String(p.category || '').toUpperCase() === String(selectedCategory).toUpperCase());
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(query)) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (locationFilter !== 'ALL') {
      result = result.filter(p => p.item_location === locationFilter);
    }

    if (conditionFilter !== 'ALL') {
      result = result.filter(p => p.condition === conditionFilter);
    }

    result = result.filter(p => (parseFloat(p.price) || 0) <= maxPrice);

    return result;
  }, [products, selectedCategory, searchQuery, locationFilter, conditionFilter, maxPrice]);

  const getOptimizedThumbnail = (photosArray) => {
    if (!photosArray || !Array.isArray(photosArray) || photosArray.length === 0) {
      return 'https://cloudinary.com';
    }
    const firstPhotoObject = photosArray[0];
    const rawUrl = firstPhotoObject?.image_url || firstPhotoObject?.image;
    
    if (rawUrl && rawUrl.includes('cloudinary.com') && !rawUrl.includes('f_auto')) {
      return rawUrl.replace('/upload/', '/upload/f_auto,q_auto,w_400,c_scale/');
    }
    return rawUrl || 'https://cloudinary.com';
  };

  if (loading) return (
    <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress color="success" size={40} />
      <Typography variant="body2" sx={{ mt: 2, color: '#666', fontWeight: '500' }}>Streaming wholesale component rows...</Typography>
    </Box>
  );

  if (error) return (
    <Box flexGrow={1} sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>
  );
  return (
    <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* 🎛️ REFINED INPUT CONTROL DECK */}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="success" />
          <Typography variant="subtitle1" sx={{ fontWeight: '900', color: '#111' }}>Refine Hardware Catalog Index</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              size="small" label="Search parts or models..." fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={4}>
            <TextField select size="small" label="Storage Hub" fullWidth value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <MenuItem value="ALL">All Regional Hubs</MenuItem>
              <MenuItem value="GULU">Gulu City</MenuItem>
              <MenuItem value="LIRA">Lira City</MenuItem>
              <MenuItem value="KLA">Kampala Hub</MenuItem>
              <MenuItem value="ARUA">Arua City</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={3} md={4}>
            <TextField select size="small" label="Quality Condition" fullWidth value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
              <MenuItem value="ALL">All Conditions</MenuItem>
              <MenuItem value="NEW">Brand New / Sealed</MenuItem>
              <MenuItem value="REFURB">Refurbished / Tested</MenuItem>
              <MenuItem value="USED">Used / Working</MenuItem>
              <MenuItem value="SCRAP">Scrap / For Spares</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Divider />

        <Box sx={{ px: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: '800', color: '#444', mb: 1, display: 'block' }}>
            Max Price Threshold: <strong style={{ color: '#2e7d32' }}>UGX {maxPrice.toLocaleString()}</strong>
          </Typography>
          <Slider value={maxPrice} min={5000} max={5000000} step={5000} onChange={(e, val) => setMaxPrice(val)} color="success" size="small" />
        </Box>
      </Paper>

      {/* 🏪 SYSTEM SHOWCASE RAIL */}
      {filteredProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlignment: 'center', borderRadius: '16px', border: '1px dashed #ccc', bgcolor: '#fafafa' }}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ fontWeight: 'bold' }}>No components match criteria</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: '16px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', height: '100%', 
                  backgroundColor: '#ffffff', overflow: 'hidden', transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                }}
              >
                <Box sx={{ position: 'relative', pt: '75%', bgcolor: '#f7f7f7', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.id}`)}>
                  <CardMedia component="img" image={getOptimizedThumbnail(item.photos)} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Chip label={item.condition_display || item.condition} color={item.condition === 'NEW' ? 'success' : 'warning'} size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: '800', fontSize: '11px', borderRadius: '6px' }} />
                  
                  {item.is_featured && (
                    <Chip icon={<StarIcon style={{ color: '#fff', fontSize: '13px' }} />} label="FEATURED" color="error" size="small" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: '900', fontSize: '10px', px: 0.5, borderRadius: '6px' }} />
                  )}
                </Box>

                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: '800', color: '#111', lineHeight: 1.4, height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.title}
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: '900', color: '#2e7d32', mt: 0.5 }}>
                    UGX {Number(item.price).toLocaleString()}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 'auto', pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555' }}>
                      <LocationOnIcon sx={{ fontSize: '16px', color: '#d32f2f' }} />
                      <Typography variant="caption" sx={{ fontWeight: '600' }}>{item.item_location_display || item.item_location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555' }}>
                      <InventoryIcon sx={{ fontSize: '16px' }} />
                      <Typography variant="caption" sx={{ fontWeight: '600' }}>Stock Counter: <strong>{item.stock_count} units</strong></Typography>
                    </Box>
                  </Box>
                </CardContent>

                {/* DUAL ACTION LINK MATRIX BUTTON SECTIONS */}
                <Box sx={{ px: 2, pb: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant="contained" color="success" size="small" fullWidth onClick={() => navigate(`/product/${item.id}`)} endIcon={<DoubleArrowIcon />} 
                    sx={{ fontWeight: 'bold', borderRadius: '8px', textTransform: 'none', py: 1 }}
                  >
                    View Specifications Sheet
                  </Button>

                  <Button 
                    variant="outlined" color="error" size="small" fullWidth startIcon={<FlashOnIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/payment', { state: { targetProductId: item.id, promoAmount: 20000, itemTitle: item.title } });
                    }}
                    sx={{ fontWeight: '800', borderRadius: '8px', textTransform: 'none', py: 0.8, borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px', bgcolor: 'rgba(211,47,47,0.03)' } }}
                  >
                    Boost Listing via Mobile Money
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}



  
