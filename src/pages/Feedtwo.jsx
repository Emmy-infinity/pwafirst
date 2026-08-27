import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, CardMedia,
  Chip, CircularProgress, Alert, TextField, MenuItem,
  Slider, InputAdornment, Paper, Button, useMediaQuery, useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '../api';

export default function GalleryView({ selectedCategory }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic data from backend
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
          setError("Could not load products. Please try again later.");
          setLoading(false);
        }
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
        console.error("Failed to fetch configuration data:", err);
        if (isMounted) {
          setPromoFee(20000);
          setCategories([]);
          setLocations([]);
          setConfigLoading(false);
        }
      }
    };

    fetchConfig();

    return () => { isMounted = false; };
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory && selectedCategory !== 'ALL') {
      result = result.filter(p => String(p.category_slug || '').toUpperCase() === String(selectedCategory).toUpperCase());
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter(p => p.category_slug === categoryFilter);
    }

    if (locationFilter !== 'ALL') {
      result = result.filter(p => p.location_code === locationFilter);
    }

    if (conditionFilter !== 'ALL') {
      result = result.filter(p => p.condition === conditionFilter);
    }

    result = result.filter(p => (parseFloat(p.price) || 0) <= maxPrice);

    return result;
  }, [products, selectedCategory, searchQuery, categoryFilter, locationFilter, conditionFilter, maxPrice]);

  // Thumbnail helper
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

  // Loading states
  if (loading || configLoading) return (
    <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress color="success" size={40} />
      <Typography variant="body2" sx={{ mt: 2, color: '#666', fontWeight: '500' }}>
        {loading ? 'Loading products...' : 'Loading options...'}
      </Typography>
    </Box>
  );

  if (error) return (
    <Box flexGrow={1} sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>
  );

  return (
    <Box sx={{
      flexGrow: 1,
      width: '100%',
      maxWidth: '1600px',
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 1.5, sm: 2, md: 3 },
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, sm: 2.5, md: 3 },
    }}>
      {/* Filter Controls */}
      <Paper variant="outlined" sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2, md: 2.5 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="success" />
          <Typography variant="subtitle1" sx={{
            fontWeight: '900',
            color: '#111',
            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
          }}>
            Filter Items
          </Typography>
        </Box>

        {/* Responsive Filter Grid: Stacks on mobile */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              size="small"
              label="Search for anything..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              size="small"
              label="Category"
              fullWidth
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.slug}>{cat.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              size="small"
              label="Location"
              fullWidth
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Locations</MenuItem>
              {locations.map(loc => (
                <MenuItem key={loc.id} value={loc.code}>{loc.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              size="small"
              label="Condition"
              fullWidth
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Conditions</MenuItem>
              <MenuItem value="NEW">Brand New / Sealed</MenuItem>
              <MenuItem value="REFURB">Refurbished / Tested</MenuItem>
              <MenuItem value="USED">Used / Working</MenuItem>
              <MenuItem value="SCRAP">Scrap / For Spares</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ px: { xs: 0.5, sm: 1 } }}>
              <Typography variant="caption" sx={{
                fontWeight: '800',
                color: '#444',
                mb: 1,
                display: 'block',
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' },
              }}>
                Max Price: <strong style={{ color: '#2e7d32' }}>UGX {maxPrice.toLocaleString()}</strong>
              </Typography>
              <Slider
                value={maxPrice}
                min={5000}
                max={5000000}
                step={5000}
                onChange={(e, val) => setMaxPrice(val)}
                color="success"
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Cards - EXPLICIT GRID RESPONSIVENESS */}
      {filteredProducts.length === 0 ? (
        <Paper elevation={0} sx={{
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px dashed #ccc',
          bgcolor: '#fafafa',
        }}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
          }}>
            No products found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} alignItems="stretch">
          {filteredProducts.map((item) => {
            const isFeatured = item.is_featured === true;
            return (
              // 1 Column on Mobile (xs), 2 on Tablet (sm), 3 on Laptop (md), 4 on Large Desktop (lg)
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} style={{ display: 'flex' }}>
                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: '1px solid #eaeaea',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-6px)' },
                      boxShadow: { xs: 'none', md: '0 12px 30px rgba(0,0,0,0.08)' },
                    },
                  }}
                >
                  {/* Image container */}
                  <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: '200px', sm: '220px', md: 'auto' }, 
                    paddingTop: { xs: '0', sm: '0', md: '56.25%' },
                    bgcolor: '#f7f7f7',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: { xs: 'flex', md: 'block' },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    alignItems: { xs: 'center', md: 'flex-start' },
                  }} onClick={() => navigate(`/product/${item.id}`)}>
                    <CardMedia
                      component="img"
                      image={getOptimizedThumbnail(item.photos)}
                      alt={item.title}
                      style={{
                        objectFit: isMobile ? 'contain' : 'cover',
                        position: { xs: 'relative', md: 'absolute' },
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                    />
                    <Chip
                      label={item.condition_display || item.condition}
                      color={item.condition === 'NEW' ? 'success' : 'warning'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontWeight: '800',
                        fontSize: { xs: '10px', sm: '11px' },
                        borderRadius: '6px',
                        zIndex: 10,
                      }}
                    />
                    {isFeatured && (
                      <Chip
                        icon={<VerifiedIcon style={{ color: '#fff', fontSize: '13px' }} />}
                        label="FEATURED"
                        color="success"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontWeight: '900',
                          fontSize: { xs: '9px', sm: '10px' },
                          px: 0.5,
                          borderRadius: '6px',
                          zIndex: 10,
                        }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{
                    p: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flexGrow: 1,
                    overflow: 'hidden',
                  }}>
                    <Typography
                      variant="subtitle1"
                      title={item.title}
                      sx={{
                        fontWeight: '800',
                        color: '#111',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography variant="h6" sx={{
                      fontWeight: '900',
                      color: '#2e7d32',
                      mt: 0.5,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                    }}>
                      UGX {Number(item.price).toLocaleString()}
                    </Typography>

                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8,
                      mt: 'auto',
                      pt: 1,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555' }}>
                        <LocationOnIcon sx={{ fontSize: '16px', color: '#d32f2f' }} />
                        <Typography variant="caption" sx={{
                          fontWeight: '600',
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.location_name || item.location_code || 'No location'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555' }}>
                        <InventoryIcon sx={{ fontSize: '16px' }} />
                        <Typography variant="caption" sx={{
                          fontWeight: '600',
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        }}>
                          Stock: <strong>{item.stock_count} units</strong>
                        </Typography>
                      </Box>
                      {item.category_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555' }}>
                          <Typography variant="caption" sx={{
                            fontWeight: '600',
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            Category: <strong>{item.category_name}</strong>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <Box sx={{
                    px: { xs: 1.5, sm: 2 },
                    pb: { xs: 1.5, sm: 2 },
                    pt: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flexShrink: 0,
                  }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      fullWidth
                      onClick={() => navigate(`/product/${item.id}`)}
                      endIcon={<DoubleArrowIcon />}
                      sx={{
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        textTransform: 'none',
                        py: { xs: 0.8, sm: 1 },
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      }}
                    >
                      View Details
                    </Button>

                    {!isFeatured ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        startIcon={<FlashOnIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/payment', {
                            state: {
                              targetProductId: item.id,
                              promoAmount: promoFee,
                              itemTitle: item.title
                            }
                          });
                        }}
                        sx={{
                          fontWeight: '800',
                          borderRadius: '8px',
                          textTransform: 'none',
                          py: { xs: 0.7, sm: 0.8 },
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          borderWidth: '1.5px',
                          '&:hover': {
                            borderWidth: '1.5px',
                            bgcolor: 'rgba(211,47,47,0.03)',
                          },
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                            '100%': { opacity: 1 },
                          }
                        }}
                      >
                        <FlashOnIcon sx={{ mr: 0.5, fontSize: '16px' }} />
                        Boost this Item
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        fullWidth
                        disabled
                        startIcon={<VerifiedIcon />}
                        sx={{
                          fontWeight: '800',
                          borderRadius: '8px',
                          textTransform: 'none',
                          py: { xs: 0.7, sm: 0.8 },
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          opacity: 0.8,
                          bgcolor: '#e8f5e9',
                          color: '#2e7d32',
                          '&.Mui-disabled': {
                            bgcolor: '#e8f5e9',
                            color: '#2e7d32',
                            opacity: 0.8,
                          }
                        }}
                      >
                        ✅ Already Featured
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
