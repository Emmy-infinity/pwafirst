import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, CircularProgress, Alert, Button, Chip, 
  Paper, Grid, Divider, TextField, MenuItem, IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ScaleIcon from '@mui/icons-material/Scale';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  
  // 🌟 FIX: Initialized cleanly to true to stop synchronous rendering loops inside useEffect body
  const [loading, setLoading] = useState(true);

  // Carousel active image index tracker 
  const [activeStep, setActiveStep] = useState(0);

  // Logistics input variables
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [shippingDestination, setShippingDestination] = useState('GULU');

  useEffect(() => {
    // 🌟 FIX: Only call set states here if a user switches between listing cards
    setLoading(true);
    let isCurrentMount = true;

    api.get(`api/products/${id}/`)
      .then(response => {
        if (isCurrentMount) {
          setProduct(response.data);
          setLoading(false); // Asynchronous execution path is completely compliant
        }
      })
      .catch(err => {
        if (isCurrentMount) {
          console.error("Detail extraction failure:", err);
          setError("Could not extract advanced specifications for this hardware asset.");
          setLoading(false);
        }
      });

    return () => {
      isCurrentMount = false; // Clean up active tracking scopes to clear memory leaks
    };
  }, [id]);

  const calculateLiveLogistics = () => {
    if (!product) return { itemsTotal: 0, shippingFee: 0, finalGrandTotal: 0 };
    
    const itemPrice = parseFloat(product.price) || 0;
    const itemWeight = parseFloat(product.weight) || 0;
    const baseItemsCost = itemPrice * orderQuantity;
    
    let routeMultiplier = 1.0;
    if (product.item_location !== shippingDestination) {
      if (shippingDestination === 'KLA') routeMultiplier = 2.5; 
      else routeMultiplier = 1.8; 
    }

    const calculatedWeightFactor = itemWeight * orderQuantity * 2000;
    const baseShippingRate = 6000;
    const finalShippingFee = Math.round((baseShippingRate + calculatedWeightFactor) * routeMultiplier);

    return {
      itemsTotal: baseItemsCost,
      shippingFee: finalShippingFee,
      finalGrandTotal: baseItemsCost + finalShippingFee
    };
  };

  const getOptimizedUrl = (rawUrl) => {
    if (!rawUrl) return 'https://cloudinary.com';
    if (rawUrl.includes('cloudinary.com') && !rawUrl.includes('f_auto')) {
      return rawUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_scale/');
    }
    return rawUrl;
  };

  if (error) return (
    <Box sx={{ p: 4 }}><Alert severity="error" action={<Button color="inherit" onClick={() => navigate('/')}>Back</Button>}>{error}</Alert></Box>
  );

  // 🌟 LOADING GUARD: Safely locks component threads until active state maps populate
  if (loading || !product) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="88vh">
      <CircularProgress color="success" size={50} />
      <Typography variant="body2" sx={{ ml: 2, color: '#555', fontWeight: '500' }}>
        Loading component specifications safely...
      </Typography>
    </Box>
  );

  const logistics = calculateLiveLogistics();
  const galleryPhotos = product && product.photos && Array.isArray(product.photos) ? product.photos.slice(0, 10) : [];
  const totalSteps = galleryPhotos.length;

  const handleNextPhoto = () => setActiveStep((prev) => (prev + 1) % totalSteps);
  const handlePrevPhoto = () => setActiveStep((prev) => (prev - 1 + totalSteps) % totalSteps);
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')} 
        sx={{ mb: 3, fontWeight: 'bold', textTransform: 'none' }}
      >
        Back to Marketplace Spares Feed
      </Button>

      <Grid container spacing={{ xs: 3, md: 5 }}>
        
        {/* LEFT COLUMN: SWIPEABLE COMPONENT PHOTO SLIDER GALLERY */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fdfdfd', 
                position: 'relative', border: '1px solid #eaeaea', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', minHeight: '350px', md: '450px'
              }}
            >
              <img 
                src={totalSteps > 0 ? getOptimizedUrl(galleryPhotos[activeStep]?.image_url) : 'https://cloudinary.com'} 
                alt={`${product.title} layout frame`} 
                style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'contain', display: 'block' }}
              />

              {product.is_featured && (
                <Chip 
                  icon={<StarIcon style={{ color: '#fff' }} />}
                  label="PREMIUM VERIFIED" color="warning"
                  sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 'bold', px: 1, zIndex: 10 }}
                />
              )}

              {totalSteps > 1 && (
                <>
                  <IconButton onClick={handlePrevPhoto} sx={{ position: 'absolute', left: 16, bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' } }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
                  <IconButton onClick={handleNextPhoto} sx={{ position: 'absolute', right: 16, bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' } }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
                </>
              )}
            </Paper>

            {/* Slider progress navigation indicator dots */}
            {totalSteps > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                {galleryPhotos.map((_, index) => (
                  <Box
                    key={index} onClick={() => setActiveStep(index)}
                    sx={{ width: activeStep === index ? 24 : 8, height: 8, borderRadius: '4px', backgroundColor: activeStep === index ? '#2e7d32' : '#ccc', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* RIGHT COLUMN: REPAIR COMPONENT SPEC SHEET DETAILS */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Chip label={product.condition_display || product.condition} color={product.condition === 'NEW' ? 'success' : 'warning'} sx={{ fontWeight: '700', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: '800', lineHeight: 1.2, mb: 1 }}>{product.title}</Typography>
              <Typography variant="h5" sx={{ fontWeight: '800', color: '#2e7d32' }}>UGX {Number(product.price).toLocaleString()}</Typography>
            </Box>

            <Divider />
            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{product.description || "No customized product descriptions provided by the wholesaler."}</Typography>
            <Divider />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#fdfdfd', p: 2, borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><InventoryIcon color="action" /><Typography variant="body2">Current Available Stock: <strong>{product.stock_count} units</strong></Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><ScaleIcon color="action" /><Typography variant="body2">Physical Unit Weight: <strong>{product.weight ? `${product.weight} KG` : 'Not Specified'}</strong></Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><LocationOnIcon color="error" /><Typography variant="body2">Primary Storage Hub: <strong>{product.item_location_display || product.item_location}</strong> ({product.seller_location_details})</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><VerifiedUserIcon color="primary" /><Typography variant="body2">Wholesale Vendor: <strong>@{product.seller_username || 'Verified Wholesaler'}</strong></Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><CalendarMonthIcon color="action" /><Typography variant="body2">Marketplace Visibility Age: <strong>{product.days_since_listing || 0} days active online</strong></Typography></Box>
            </Box>

            {/* Regional Freight Delivery Rate Calculator */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', mt: 1, bgcolor: '#fafffa', borderColor: '#e0f2f1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><LocalShippingIcon color="success" /> Regional Delivery Rate Estimator</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}><TextField type="number" label="Quantity" size="small" fullWidth value={orderQuantity} onChange={(e) => setOrderQuantity(Math.max(1, Math.min(product.stock_count || 99, parseInt(e.target.value) || 1)))} /></Grid>
                <Grid item xs={6}>
                  <TextField select label="Ship To" size="small" fullWidth value={shippingDestination} onChange={(e) => setShippingDestination(e.target.value)}>
                    <MenuItem value="GULU">Gulu City</MenuItem>
                    <MenuItem value="LIRA">Lira City</MenuItem>
                    <MenuItem value="KLA">Kampala Hub</MenuItem>
                    <MenuItem value="ARUA">Arua City</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Spares Total Cost:</Typography><Typography variant="body2">UGX {logistics.itemsTotal.toLocaleString()}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Estimated Shipping Fee:</Typography><Typography variant="body2">UGX {logistics.shippingFee.toLocaleString()}</Typography></Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Est. Grand Invoice Total:</Typography><Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>UGX {logistics.finalGrandTotal.toLocaleString()}</Typography></Box>
              </Box>
            </Paper>

            {/* Inbound lead button shortcuts */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button variant="contained" color="success" size="large" fullWidth startIcon={<PhoneIcon />} href={`tel:${product.contact_phone || ''}`} sx={{ fontWeight: 'bold', borderRadius: '8px', textTransform: 'none' }}>Place Phone Call Order</Button>
              <Button variant="outlined" color="success" size="large" fullWidth startIcon={<WhatsAppIcon />} href={`https://wa.me{product.contact_phone?.replace('+', '') || ''}?text=Hello, I need ${orderQuantity} units of your listed component: ${encodeURIComponent(product.title)}.`} target="_blank" sx={{ fontWeight: 'bold', borderRadius: '8px', textTransform: 'none' }}>Order via WhatsApp</Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
