import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardMedia,
  Chip, CircularProgress, Alert, TextField, MenuItem,
  Slider, InputAdornment, Paper, Button, IconButton,
  Rating, useMediaQuery, useTheme,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ScaleIcon from '@mui/icons-material/Scale';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../api';

// Helper to generate/retrieve a session key for anonymous users
const getSessionKey = () => {
  let key = localStorage.getItem('marketplace_session_key');
  if (!key) {
    key = 'sess-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('marketplace_session_key', key);
  }
  return key;
};

// ─── WEIGHT FORMATTING ────────────────────────────────────────────
const toKilograms = (value, unit) => {
  const u = String(unit || 'kg').trim().toLowerCase();
  if (['g', 'gram', 'grams', 'gm', 'gms'].includes(u)) return value / 1000;
  if (['t', 'ton', 'tons', 'tonne', 'tonnes'].includes(u)) return value * 1000;
  return value;
};

const trimNumber = (n) => Number(n.toFixed(2)).toString();

export const formatWeight = (value, unit = 'kg') => {
  const raw = parseFloat(value);
  if (raw === null || isNaN(raw) || raw <= 0) return null;

  const kg = toKilograms(raw, unit);
  if (!isFinite(kg) || kg <= 0) return null;

  if (kg >= 1000) {
    const tonnes = kg / 1000;
    return `${trimNumber(tonnes)} tonne${tonnes === 1 ? '' : 's'}`;
  }
  if (kg >= 1) {
    return `${trimNumber(kg)} kg`;
  }
  const grams = Math.round(kg * 1000);
  if (grams >= 1000) return '1 kg';
  return `${grams} g`;
};

// ─── PRICE BOUNDS FALLBACK ────────────────────────────────────────
const FALLBACK_BOUNDS = { min: 0, max: 5_000_000 };

export default function GalleryView({ selectedCategory }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [promoFee, setPromoFee] = useState(20000);
  const [configLoading, setConfigLoading] = useState(true);

  // ─── Price bounds (dynamic from backend) ─────────────────────────
  const [priceBounds, setPriceBounds] = useState(FALLBACK_BOUNDS);
  // null = "user hasn't touched the slider"; falls back to priceBounds.max in the filter
  const [maxPrice, setMaxPrice] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  // ─── SEARCH TRACKING (debounced) ──────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(() => {
      api.post('api/track-search/', {
        query: searchQuery.trim(),
        session_key: getSessionKey(),
      }).catch(err => console.error('Search tracking failed:', err));
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Fetch categories, locations, promotion fee, and price bounds
  useEffect(() => {
    let isMounted = true;
    setConfigLoading(true);
    const fetchConfig = async () => {
      try {
        const [feeRes, catRes, locRes, boundsRes] = await Promise.all([
          api.get('api/site-config/'),
          api.get('api/categories/'),
          api.get('api/locations/'),
          // Non-fatal: if this endpoint isn't wired yet, fall back gracefully
          api.get('api/products/price-bounds/')
            .catch(() => ({ data: FALLBACK_BOUNDS })),
        ]);

        if (!isMounted) return;

        const fetchedBounds = {
          min: Number(boundsRes.data?.min_price) || 0,
          max: Number(boundsRes.data?.max_price) || FALLBACK_BOUNDS.max,
        };

        setPromoFee(feeRes.data.promotion_fee || 20000);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);
        setPriceBounds(fetchedBounds);

        // ─── Initialize slider from URL, else from the real ceiling ──
        const urlMax = Number(searchParams.get('max_price'));
        const effectiveMax =
          urlMax > 0 && urlMax <= fetchedBounds.max
            ? urlMax
            : fetchedBounds.max;
        setMaxPrice(effectiveMax);

        setConfigLoading(false);
      } catch (err) {
        if (isMounted) {
          setPromoFee(20000);
          setCategories([]);
          setLocations([]);
          setPriceBounds(FALLBACK_BOUNDS);
          setMaxPrice(FALLBACK_BOUNDS.max);
          setConfigLoading(false);
        }
      }
    };
    fetchConfig();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Persist maxPrice to the URL (debounced) ─────────────────────
  useEffect(() => {
    if (maxPrice == null) return;
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (maxPrice < priceBounds.max) next.set('max_price', String(Math.round(maxPrice)));
        else next.delete('max_price');
        return next;
      }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [maxPrice, priceBounds.max, setSearchParams]);

  // Effective filter value — if user hasn't touched slider, no price cap
  const effectiveMaxPrice = maxPrice ?? priceBounds.max;

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory && selectedCategory !== 'ALL') {
      result = result.filter(p =>
        String(p.category_slug || '').toUpperCase() === String(selectedCategory).toUpperCase()
      );
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    if (categoryFilter !== 'ALL') result = result.filter(p => p.category_slug === categoryFilter);
    if (locationFilter !== 'ALL') result = result.filter(p => p.location_code === locationFilter);
    if (conditionFilter !== 'ALL') result = result.filter(p => p.condition === conditionFilter);
    result = result.filter(p => (parseFloat(p.price) || 0) <= effectiveMaxPrice);
    return result;
  }, [
    products, selectedCategory, searchQuery,
    categoryFilter, locationFilter, conditionFilter,
    effectiveMaxPrice
  ]);

  // ─── CLOUDINARY SMART CROP ────────────────────────────────────────
  const getOptimizedThumbnail = (photosArray) => {
    if (!photosArray || !Array.isArray(photosArray) || photosArray.length === 0) {
      return 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    }
    const firstPhotoObject = photosArray[0];
    const rawUrl = firstPhotoObject?.image_url || firstPhotoObject?.image;
    if (rawUrl && rawUrl.includes('cloudinary.com')) {
      const parts = rawUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_auto,q_auto,w_600,c_limit/${parts[1]}`;
      }
    }
    return rawUrl || 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
  };

  // ─── PRODUCT CLICK HANDLER ────────────────────────────────────────
  const handleProductClick = (productId) => {
    api.post('api/track-click/', {
      product: productId,
      search_query: searchQuery.trim() || null,
      session_key: getSessionKey(),
      is_detail_view: true,
    }).catch(err => console.error('Click tracking failed:', err));

    navigate(`/product/${productId}`);
  };

  // ─── Reset price filter to the real ceiling ───────────────────────
  const handleResetPrice = () => {
    setMaxPrice(priceBounds.max);
  };

  const isPriceFiltered = maxPrice != null && maxPrice < priceBounds.max;

  if (loading || configLoading) return (
    <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress color="success" size={40} />
      <Typography variant="body2" sx={{ mt: 2, color: '#666', fontWeight: '500' }}>
        {loading ? 'Loading products...' : 'Loading options...'}
      </Typography>
    </Box>
  );

  if (error) return <Box flexGrow={1} sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>;

  // Slider step: ~500 buckets across the full range, minimum 5,000 UGX
  const sliderStep = Math.max(5000, Math.floor(priceBounds.max / 500));

  return (
    <Box sx={{
      flexGrow: 1,
      width: '100%',
      px: { xs: 1, sm: 2, md: 2 },
      py: { xs: 1.5, sm: 2, md: 2 },
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, sm: 2.5, md: 2 }
    }}>

      {/* Compact Filter Bar */}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2, md: 1.5 }, borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.5, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="success" sx={{ fontSize: '1.2rem' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: '900', color: '#111', fontSize: '1rem' }}>Filter Items</Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              size="small" label="Search for anything..." fullWidth
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
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

          {/* ─── DYNAMIC MAX-PRICE SLIDER ─── */}
          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ px: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: '800', color: '#444', fontSize: '0.7rem' }}>
                  Max Price:{' '}
                  <strong style={{ color: '#2e7d32' }}>
                    UGX {Math.round(effectiveMaxPrice).toLocaleString()}
                  </strong>
                  {isPriceFiltered && (
                    <Typography component="span" variant="caption" sx={{ color: '#999', ml: 0.5 }}>
                      / {priceBounds.max.toLocaleString()}
                    </Typography>
                  )}
                </Typography>
                {isPriceFiltered && (
                  <Button
                    size="small" variant="text" color="success"
                    startIcon={<RefreshIcon sx={{ fontSize: '12px !important' }} />}
                    onClick={handleResetPrice}
                    sx={{ fontSize: '0.65rem', textTransform: 'none', minWidth: 0, py: 0 }}
                  >
                    Reset
                  </Button>
                )}
              </Box>
              <Slider
                value={effectiveMaxPrice}
                min={priceBounds.min}
                max={priceBounds.max}
                step={sliderStep}
                onChange={(e, val) => setMaxPrice(val)}
                color="success"
                size="small"
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `UGX ${Number(v).toLocaleString()}`}
                sx={{
                  color: '#2e7d32',
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                  '& .MuiSlider-valueLabel': { fontSize: '0.7rem' },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid of products */}
      {filteredProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: '8px', border: '1px dashed #ccc', bgcolor: '#fafafa' }}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ fontWeight: 'bold' }}>No products found</Typography>
          {isPriceFiltered && (
            <Button size="small" color="success" onClick={handleResetPrice} sx={{ mt: 1, textTransform: 'none' }}>
              Clear price filter
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' },
          gap: '10px'
        }}>
          {filteredProducts.map((item) => {
            const isFeatured = item.is_featured === true;
            const hasDiscount = item.original_price && parseFloat(item.original_price) > parseFloat(item.price);
            const discountPercent = hasDiscount
              ? Math.round(((parseFloat(item.original_price) - parseFloat(item.price)) / parseFloat(item.original_price)) * 100)
              : 0;
            const weightLabel = formatWeight(
              item.weight ?? item.weight_kg ?? item.weight_value,
              item.weight_unit || item.unit || 'kg'
            );

            return (
              <Card
                key={item.id}
                elevation={0}
                onClick={() => handleProductClick(item.id)}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: isFeatured ? '#f57c00' : '#eaeaea',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 6px 15px rgba(0,0,0,0.1)' },
                }}
              >
                {/* 4:3 Aspect Ratio Box */}
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  bgcolor: '#f7f7f7',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CardMedia
                    component="img"
                    image={getOptimizedThumbnail(item.photos)}
                    alt={item.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '6px'
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

                <CardContent sx={{
                  p: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  gap: '4px',
                  overflow: 'hidden'
                }}>
                  <Typography variant="subtitle2" title={item.title} sx={{
                    fontWeight: '600', color: '#333', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    minHeight: '2.6em',
                    fontSize: '0.85rem'
                  }}>
                    {item.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.5, minHeight: '24px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '900', color: '#d32f2f', fontSize: '1rem' }}>
                      UGX {Number(item.price).toLocaleString()}
                    </Typography>
                    {hasDiscount && <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999', fontSize: '0.7rem' }}>UGX {Number(item.original_price).toLocaleString()}</Typography>}
                  </Box>

                  <Box sx={{ minHeight: '18px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {item.rating && (
                      <>
                        <Rating value={item.rating} readOnly size="small" sx={{ fontSize: '12px' }} />
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>({item.rating_count || 0})</Typography>
                      </>
                    )}
                  </Box>

                  {weightLabel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#555' }}>
                      <ScaleIcon sx={{ fontSize: '12px', color: '#2e7d32' }} />
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        {weightLabel}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto', pt: 1, color: '#777' }}>
                    <LocationOnIcon sx={{ fontSize: '12px', color: '#d32f2f' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.location_name || item.location_code || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: '10px', pt: '2px' }}>
                  {isFeatured ? (
                    <Button variant="contained" size="small" fullWidth disabled startIcon={<VerifiedIcon style={{ fontSize: '14px' }} />} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'none', height: '30px', '&.Mui-disabled': { bgcolor: '#e8f5e9', color: '#2e7d32', opacity: 0.8 } }}>
                      Featured
                    </Button>
                  ) : (
                    <Button
                      variant="outlined" color="error" size="small" fullWidth
                      startIcon={<FlashOnIcon style={{ fontSize: '14px' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/payment', { state: { targetProductId: item.id, promoAmount: promoFee, itemTitle: item.title } });
                      }}
                      sx={{
                        fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'none', height: '30px',
                        borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' },
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.7 }, '100%': { opacity: 1 } }
                      }}
                    >
                      Boost
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
