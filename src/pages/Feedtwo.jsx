import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, CardMedia,
  Chip, CircularProgress, Alert, TextField, MenuItem,
  Slider, InputAdornment, Paper, Button, IconButton,
  Rating, useMediaQuery, useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import api from '../api';

export default function GalleryView({ selectedCategory }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [promoFee, setPromoFee] = useState(20000);
  const [configLoading, setConfigLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(5000000);

  // Fetch products
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.get('api/products/')
      .then(response => {
        if (isMounted) {
          const rawData = response.data;
          if (Array.isArray(rawData)) setProducts(rawData);
          else if (rawData && Array.isArray(rawData.results)) setProducts(rawData.results);
          else setProducts([]);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Storefront marketplace catalog grid sync failure:", err);
        if (isMounted) { setError("Could not load products. Please try again later."); setLoading(false); }
      });
    return () => { isMounted = false; };
  }, []);

  // Fetch categories, locations, and promotion fee
  useEffect(() => {
    let isMounted = true;
    setConfigLoading(true);
    const fetchConfig = async () => {
      try {
        const [feeRes, catRes, locRes] = await Promise.all([
          api.get('api/site-config/'),
          api.get('api/categories/'),
          api.get('api/locations/')
        ]);
        if (isMounted) {
          setPromoFee(feeRes.data.promotion_fee || 20000);
          setCategories(catRes.data || []);
          setLocations(locRes.data || []);
          setConfigLoading(false);
        }
      } catch (err) {
        if (isMounted) { setPromoFee(20000); setCategories([]); setLocations([]); setConfigLoading(false); }
      }
    };
    fetchConfig();
    return () => { isMounted = false; };
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory && selectedCategory !== 'ALL') result = result.filter(p => String(p.category_slug || '').toUpperCase() === String(selectedCategory).toUpperCase());
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => (p.title && p.title.toLowerCase().includes(query)) || (p.description && p.description.toLowerCase().includes(query)));
    }
    if (categoryFilter !== 'ALL') result = result.filter(p => p.category_slug === categoryFilter);
    if (locationFilter !== 'ALL') result = result.filter(p => p.location_code === locationFilter);
    if (conditionFilter !== 'ALL') result = result.filter(p => p.condition === conditionFilter);
    result = result.filter(p => (parseFloat(p.price) || 0) <= maxPrice);
    return result;
  }, [products, selectedCategory, searchQuery, categoryFilter, locationFilter, conditionFilter, maxPrice]);

  // ─── UPDATED CLOUDINARY SMART CROP FUNCTION ───────────────────────────────
  const getOptimizedThumbnail = (photosArray) => {
    if (!photosArray || !Array.isArray(photosArray) || photosArray.length === 0) return 'https://cloudinary.com';
    const firstPhotoObject = photosArray[0];
    const rawUrl = firstPhotoObject?.image_url || firstPhotoObject?.image;
    if (rawUrl && rawUrl.includes('cloudinary.com')) {
      const parts = rawUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_auto,q_auto,w_500,h_500,c_fill,g_auto/${parts[1]}`;
      }
    }
    return rawUrl || 'https://cloudinary.com';
  };

  if (loading || configLoading) return (
    <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress color="success" size={40} />
      <Typography variant="body2" sx={{ mt: 2, color: '#666', fontWeight: '500' }}>
        {loading ? 'Loading products...' : 'Loading options...'}
      </Typography>
    </Box>
  );

  if (error) return <Box flexGrow={1} sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '1800px', mx: 'auto', px: { xs: 1, sm: 2, md: 2 }, py: { xs: 1.5, sm: 2, md: 2 }, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5, md: 2 } }}>
      
      {/* Compact Filter Bar */}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2, md: 1.5 }, borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.5, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="success" sx={{ fontSize: '1.2rem' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: '900', color: '#111', fontSize: '1rem' }}>Filter Items</Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField size="small" label="Search for anything..." fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField select size="small" label="Category" fullWidth value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map(cat => <MenuItem key={cat.id} value={cat.slug}>{cat.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField select size="small" label="Location" fullWidth value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <MenuItem value="ALL">All Locations</MenuItem>
              {locations.map(loc => <MenuItem key={loc.id} value={loc.code}>{loc.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TextField select size="small" label="Condition" fullWidth value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
              <MenuItem value="ALL">All Conditions</MenuItem>
              <MenuItem value="NEW">Brand New / Sealed</MenuItem>
              <MenuItem value="REFURB">Refurbished / Tested</MenuItem>
              <MenuItem value="USED">Used / Working</MenuItem>
              <MenuItem value="SCRAP">Scrap / For Spares</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: '800', color: '#444', fontSize: '0.7rem' }}>
                Max Price: <strong style={{ color: '#2e7d32' }}>UGX {maxPrice.toLocaleString()}</strong>
              </Typography>
              <Slider value={maxPrice} min={5000} max={5000000} step={5000} onChange={(e, val) => setMaxPrice(val)} color="success" size="small" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* JUMIA STYLE 6-COLUMN UNIFORM GRID */}
      {filteredProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: '8px', border: '1px dashed #ccc', bgcolor: '#fafafa' }}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ fontWeight: 'bold' }}>No products found</Typography>
        </Paper>
      ) : (
        <Grid container spacing={1} columns={{ xs: 2, sm: 3, md: 4, lg: 6, xl: 6 }} alignItems="stretch">
          {filteredProducts.map((item) => {
            const isFeatured = item.is_featured === true;
            const hasDiscount = item.original_price && parseFloat(item.original_price) > parseFloat(item.price);
            const discountPercent = hasDiscount ? Math.round(((parseFloat(item.original_price) - parseFloat(item.price)) / parseFloat(item.original_price)) * 100) : 0;

            return (
              <Grid item xs={1} sm={1} md={1} lg={1} xl={1} key={item.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Card
                  elevation={0}
                  onClick={() => navigate(`/product/${item.id}`)}
                  sx={{
                    width: '100%',
                    height: '100%', // Forces all cards to be equal height
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    border: isFeatured ? '2px solid #f57c00' : '1px solid #eaeaea',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': { boxShadow: '0 6px 15px rgba(0,0,0,0.1)' },
                  }}
                >
                  {/* FIXED HEIGHT IMAGE CONTAINER */}
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: { xs: '140px', sm: '160px', md: '180px', lg: '200px' }, 
                    bgcolor: '#f7f7f7', 
                    overflow: 'hidden', 
                    flexShrink: 0
                  }}>
                    <CardMedia
                      component="img"
                      image={getOptimizedThumbnail(item.photos)}
                      alt={item.title}
                      style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        objectFit: 'cover' // Fills the entire box perfectly
                      }}
                    />
                    
                    <Box sx={{ position: 'absolute', top: 8, left: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {isFeatured && <Chip label="SPONSORED" size="small" sx={{ bgcolor: '#f57c00', color: '#fff', fontWeight: 'bold', fontSize: '9px', borderRadius: '0 4px 4px 0', height: '18px' }} />}
                      {hasDiscount && <Chip label={`-${discountPercent}%`} size="small" sx={{ bgcolor: '#d32f2f', color: '#fff', fontWeight: 'bold', fontSize: '9px', borderRadius: '0 4px 4px 0', height: '18px' }} />}
                    </Box>
                    <IconButton size="small" sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' } }}>
                      <FavoriteBorderIcon fontSize="small" sx={{ color: '#666' }} />
                    </IconButton>
                  </Box>

                  {/* EQUAL PADDING AND EQUAL SIZED CONTENT AREA */}
                  <CardContent sx={{ 
                    p: { xs: 1, sm: 1.5 }, // Equal padding everywhere
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1, 
                    gap: 0.75, 
                    overflow: 'hidden' 
                  }}>
                    {/* Fixed height for Title (2 lines always) */}
                    <Typography variant="subtitle2" title={item.title} sx={{
                      fontWeight: '600', color: '#333', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      minHeight: '42px', // Ensures exactly 2 lines of space
                      fontSize: { xs: '0.8rem', md: '0.85rem' }
                    }}>
                      {item.title}
                    </Typography>

                    {/* Fixed height for Price */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.5, minHeight: '24px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: '900', color: '#d32f2f', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        UGX {Number(item.price).toLocaleString()}
                      </Typography>
                      {hasDiscount && <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999', fontSize: '0.7rem' }}>UGX {Number(item.original_price).toLocaleString()}</Typography>}
                    </Box>

                    {/* Fixed height for Rating (even if missing) */}
                    <Box sx={{ minHeight: '20px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.rating && (
                        <>
                          <Rating value={item.rating} readOnly size="small" sx={{ fontSize: '12px' }} />
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>({item.rating_count || 0})</Typography>
                        </>
                      )}
                    </Box>

                    {/* mt: auto pushes this to the bottom, keeping all buttons aligned */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto', pt: 1, color: '#777' }}>
                      <LocationOnIcon sx={{ fontSize: '12px', color: '#d32f2f' }} />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.location_name || item.location_code || 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* EQUAL PADDING FOR BUTTON BOX */}
                  <Box sx={{ p: { xs: 1, sm: 1.5 }, pt: 0 }}>
                    {isFeatured ? (
                      <Button variant="contained" size="small" fullWidth disabled startIcon={<VerifiedIcon style={{ fontSize: '14px' }} />} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'none', height: '30px', '&.Mui-disabled': { bgcolor: '#e8f5e9', color: '#2e7d32', opacity: 0.8 } }}>
                        Featured
                      </Button>
                    ) : (
                      <Button variant="outlined" color="error" size="small" fullWidth startIcon={<FlashOnIcon style={{ fontSize: '14px' }} />} onClick={(e) => { e.stopPropagation(); navigate('/payment', { state: { targetProductId: item.id, promoAmount: promoFee, itemTitle: item.title } }); }} sx={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'none', height: '30px', borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' }, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.7 }, '100%': { opacity: 1 } } }}>
                        Boost
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
