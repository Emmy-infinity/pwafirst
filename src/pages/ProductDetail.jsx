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
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [shippingDestination, setShippingDestination] = useState('GULU');

  useEffect(() => {
    setLoading(true);
    api.get(`api/products/${id}/`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Detail extraction failure:", err);
        setError("Could not extract advanced specifications for this hardware asset.");
        setLoading(false);
      });
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

  if (loading || !product) return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="88vh">
      <CircularProgress color="success" size={50} />
      <Typography variant="body2" sx={{ ml: 2, mt: 2, color: '#555', fontWeight: '500' }}>
        Loading component specifications...
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
        
        {/* LEFT COLUMN: SWIPEABLE CAROUSEL VIEWER STAGE */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fdfdfd', 
                position: 'relative', border: '1px solid #eaeaea', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', minHeight: { xs: '350px', md: '450px' }
              }}
            >
              <img 
                src={totalSteps > 0 ? getOptimizedUrl(galleryPhotos[activeStep]?.image_url) : 'https://cloudinary.com'} 
                alt={`${product.title} snapshot`} 
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
                  <IconButton onClick={handlePrevPhoto} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',切换: true, bcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' } }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
                  <IconButton onClick={handleNextPhoto} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' } }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
                </>
              )}
            </Paper>

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Chip label={product.condition_display || product.condition} color={product.condition === 'NEW' ? 'success' : 'warning'} sx={{ fontWeight: '700', mb: 1, borderRadius: '6px' }} />
              <Typography variant="h4" sx={{ fontWeight: '900', lineHeight: 1.2, mb: 1, letterSpacing: '-0.5px' }}>{product.title}</Typography>
              <Typography variant="h5" sx={{ fontWeight: '800', color: '#2e7d32' }}>UGX {Number(product.price).toLocaleString()}</Typography>
            </Box>

            <Divider />
            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {product.description || "No customized product descriptions provided by the wholesaler."}
            </Typography>
            <Divider />

            {/* TECHNICAL SPECS OVERVIEW BOX */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#fafafa', p: 2.5, borderRadius: '12px', border: '1px solid #eaeaea' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><InventoryIcon color="action" /><Typography variant="body2">Current Available Stock: <strong>{product.stock_count} units</strong></Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><LocationOnIcon color="error" /><Typography variant="body2">Storage Hub Origin: <strong>{product.item_location_display || product.item_location}</strong></Typography></Box>
              {product.weight && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><ScaleIcon color="action" /><Typography variant="body2">Unit Module Weight: <strong>{product.weight} KG</strong></Typography></Box>}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><VerifiedUserIcon color="success" /><Typography variant="body2">Wholesale Merchant Contact: <strong>{product.contact_phone || 'Verified Wholesaler'}</strong></Typography></Box>
            </Box>

            {/* LIVE LOGISTICS ESTIMATOR CARD */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #eaeaea' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><LocalShippingIcon color="success" /><Typography variant="subtitle2" sx={{ fontWeight: '800' }}>Instant Logistics Calculator</Typography></Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField type="number" label="Order Qty" size="small" fullWidth value={orderQuantity} onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} inputProps={{ min: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField select label="Delivery Target" size="small" fullWidth value={shippingDestination} onChange={(e) => setShippingDestination(e.target.value)}>
                    <MenuItem value="GULU">Gulu City</MenuItem>
                    <MenuItem value="LIRA">Lira City</MenuItem>
                    <MenuItem value="KLA">Kampala Hub</MenuItem>
                    <MenuItem value="ARUA">Arua City</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, bgcolor: '#f9f9f9', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Components Total:</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>UGX {logistics.itemsTotal.toLocaleString()}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Est. Route Shipping Fee:</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>UGX {logistics.shippingFee.toLocaleString()}</Typography></Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}><Typography variant="body2" sx={{ fontWeight: '900' }}>Invoice Grand Total:</Typography><Typography variant="body1" sx={{ fontWeight: '900', color: '#2e7d32' }}>UGX {logistics.finalGrandTotal.toLocaleString()}</Typography></Box>
              </Box>
            </Paper>

            {/* SELLER ENGAGEMENT ACTION PANEL */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button 
                variant="contained" color="success" fullWidth size="large" startIcon={<WhatsAppIcon />}
                onClick={() => window.open(`https://wa.me{product.contact_phone || ''}?text=Hello wholsaler, I am interested in buying ${orderQuantity} units of "${product.title}" listed from ${product.item_location_display || product.item_location}.`)}
                sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '10px', py: 1.4 }}
              >
                Chat via WhatsApp
              </Button>
              <Button 
                variant="outlined" color="primary" size="large" startIcon={<PhoneIcon />}
                onClick={() => window.open(`tel:${product.contact_phone || ''}`)}
                sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '10px', px: 3 }}
              >
                Call
              </Button>
            </Box>

          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}

