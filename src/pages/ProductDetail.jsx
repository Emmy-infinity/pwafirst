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
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api';

// ─── Shipping configuration ──────────────────────────────────
const ZONE_RATES = {
  GULU: 4000,
  LIRA: 8000,
  ARUA: 9000,
  KLA:  12000,
};
const SAME_CITY_FEE     = 3000;
const DEFAULT_ZONE_FEE  = 10000;

const FREE_WEIGHT_KG       = 1;       // first 1 kg ships free of weight surcharge
const PER_01KG_BLOCK       = 100;     // UGX per 0.1 kg block (< 1 kg)
const PER_KG_BLOCK         = 800;     // UGX per kg block (1–1000 kg)
const PER_TONNE_BLOCK      = 600000;  // UGX per tonne block (> 1000 kg)

const FREE_SHIPPING_MIN    = 300000;  // free shipping above this cart value
const MAX_SHIPPING_FEE     = 800000;  // safety cap

// ─── Helpers ─────────────────────────────────────────────────
const getBillableWeight = (weightKg) => {
  if (!weightKg || weightKg <= 0) return 0;
  if (weightKg < 1)    return Math.ceil(weightKg * 10) / 10;      // round up to 0.1 kg
  if (weightKg <= 1000) return Math.ceil(weightKg);                // round up to 1 kg
  return Math.ceil(weightKg / 1000);                                // round up to 1 tonne
};

const getWeightBand = (weightKg) => {
  if (weightKg <= 0) return 'none';
  if (weightKg < 1) return 'sub-kg';
  if (weightKg <= 1000) return 'kg';
  return 'tonne';
};

const formatWeight = (weightKg) => {
  if (weightKg <= 0) return '0 kg';
  if (weightKg < 1) return `${(weightKg * 1000).toFixed(0)} g`;
  if (weightKg < 1000) return `${weightKg.toFixed(weightKg % 1 === 0 ? 0 : 2)} kg`;
  return `${(weightKg / 1000).toFixed(2)} t`;
};

const formatPhone = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('256') && digits.length === 12) {
    return `+256 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return raw;
};

const getWaNumber = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('0')) return `256${digits.slice(1)}`;
  if (digits.startsWith('256')) return digits;
  return digits;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStep, setActiveStep] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [shippingDestination, setShippingDestination] = useState('GULU');
  const [fulfillmentMode, setFulfillmentMode] = useState('DELIVERY'); // 'DELIVERY' | 'PICKUP'

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

  // ─── Live logistics calculator ──────────────────────────────
  const calculateLiveLogistics = () => {
    if (!product) {
      return {
        itemsTotal: 0, shippingFee: 0, finalGrandTotal: 0,
        totalWeightKg: 0, billableWeight: 0, weightBand: 'none',
        weightFee: 0, zoneFee: 0, freeShippingApplied: false,
        isPickup: false,
      };
    }

    const itemPrice   = parseFloat(product.price)  || 0;
    const unitWeight  = parseFloat(product.weight) || 0;
    const itemsTotal  = itemPrice * orderQuantity;
    const totalWeightKg = unitWeight * orderQuantity;

    // Pickup = zero shipping, no calculation needed
    if (fulfillmentMode === 'PICKUP') {
      return {
        itemsTotal,
        shippingFee: 0,
        finalGrandTotal: itemsTotal,
        totalWeightKg,
        billableWeight: 0,
        weightBand: 'none',
        weightFee: 0,
        zoneFee: 0,
        freeShippingApplied: false,
        isPickup: true,
      };
    }

    // Zone fee
    const origin = product.item_location || 'GULU';
    const sameCity = origin === shippingDestination;
    const zoneFee = sameCity ? SAME_CITY_FEE : (ZONE_RATES[shippingDestination] ?? DEFAULT_ZONE_FEE);

    // Weight fee — tiered
    const weightBand = getWeightBand(totalWeightKg);
    const chargeableWeight = Math.max(0, totalWeightKg - FREE_WEIGHT_KG);
    let weightFee = 0;

    if (chargeableWeight > 0) {
      if (weightBand === 'sub-kg' || (totalWeightKg < 1)) {
        // Entire shipment under 1 kg → charge per 0.1 kg block
        const blocks = Math.ceil(chargeableWeight * 10);
        weightFee = blocks * PER_01KG_BLOCK;
      } else if (weightBand === 'kg') {
        const blocks = Math.ceil(chargeableWeight);
        weightFee = blocks * PER_KG_BLOCK;
      } else {
        const blocks = Math.ceil(chargeableWeight / 1000);
        weightFee = blocks * PER_TONNE_BLOCK;
      }
    }

    // Free shipping threshold
    const freeShippingApplied = itemsTotal >= FREE_SHIPPING_MIN;
    let shippingFee = freeShippingApplied ? 0 : zoneFee + weightFee;
    shippingFee = Math.min(shippingFee, MAX_SHIPPING_FEE);

    return {
      itemsTotal,
      shippingFee,
      finalGrandTotal: itemsTotal + shippingFee,
      totalWeightKg,
      billableWeight: chargeableWeight,
      weightBand,
      weightFee,
      zoneFee,
      freeShippingApplied,
      isPickup: false,
    };
  };

  const getOptimizedUrl = (rawUrl) => {
    if (!rawUrl) return 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    if (rawUrl.includes('cloudinary.com') && !rawUrl.includes('f_auto')) {
      return rawUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_scale/');
    }
    return rawUrl;
  };

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error" action={<Button color="inherit" onClick={() => navigate('/')}>Back</Button>}>
        {error}
      </Alert>
    </Box>
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
  const galleryPhotos = product?.photos && Array.isArray(product.photos) ? product.photos.slice(0, 10) : [];
  const totalSteps = galleryPhotos.length;

  const handleNextPhoto = () => setActiveStep((prev) => (prev + 1) % totalSteps);
  const handlePrevPhoto = () => setActiveStep((prev) => (prev - 1 + totalSteps) % totalSteps);

  const waNumber = getWaNumber(product.contact_phone);
  const waMessage = encodeURIComponent(
    `Hello wholesaler, I am interested in buying ${orderQuantity} unit(s) of "${product.title}" ` +
    `listed from ${product.item_location_display || product.item_location}. ` +
    `Delivery to: ${shippingDestination}. Mode: ${fulfillmentMode}.`
  );

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

        {/* ─── LEFT COLUMN: CAROUSEL ────────────────────────────── */}
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
                src={totalSteps > 0 ? getOptimizedUrl(galleryPhotos[activeStep]?.image_url) : getOptimizedUrl(null)}
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
                  <IconButton
                    onClick={handlePrevPhoto}
                    sx={{
                      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' }
                    }}
                  >
                    <ArrowBackIosNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleNextPhoto}
                    sx={{
                      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: '#fff' }
                    }}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Paper>

            {totalSteps > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                {galleryPhotos.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setActiveStep(index)}
                    sx={{
                      width: activeStep === index ? 24 : 8, height: 8, borderRadius: '4px',
                      backgroundColor: activeStep === index ? '#2e7d32' : '#ccc',
                      cursor: 'pointer', transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* ─── RIGHT COLUMN: SPEC SHEET ─────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Chip
                label={product.condition_display || product.condition}
                color={product.condition === 'NEW' ? 'success' : 'warning'}
                sx={{ fontWeight: '700', mb: 1, borderRadius: '6px' }}
              />
              <Typography variant="h4" sx={{ fontWeight: '900', lineHeight: 1.2, mb: 1, letterSpacing: '-0.5px' }}>
                {product.title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: '800', color: '#2e7d32' }}>
                UGX {Number(product.price).toLocaleString()}
              </Typography>
            </Box>

            <Divider />
            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {product.description || "No customized product descriptions provided by the wholesaler."}
            </Typography>
            <Divider />

            {/* TECHNICAL SPECS */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#fafafa', p: 2.5, borderRadius: '12px', border: '1px solid #eaeaea' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <InventoryIcon color="action" />
                <Typography variant="body2">Current Available Stock: <strong>{product.stock_count} units</strong></Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOnIcon color="error" />
                <Typography variant="body2">Storage Hub Origin: <strong>{product.item_location_display || product.item_location}</strong></Typography>
              </Box>
              {product.weight && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ScaleIcon color="action" />
                  <Typography variant="body2">Unit Module Weight: <strong>{product.weight} KG</strong></Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <VerifiedUserIcon color="success" />
                <Typography variant="body2">Wholesale Merchant Contact: <strong>{formatPhone(product.contact_phone) || 'Verified Wholesaler'}</strong></Typography>
              </Box>
            </Box>

            {/* ─── LIVE LOGISTICS ESTIMATOR ─────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #eaeaea' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocalShippingIcon color="success" />
                <Typography variant="subtitle2" sx={{ fontWeight: '800' }}>Instant Logistics Calculator</Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    type="number" label="Order Qty" size="small" fullWidth
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select label="Fulfillment Mode" size="small" fullWidth
                    value={fulfillmentMode}
                    onChange={(e) => setFulfillmentMode(e.target.value)}
                  >
                    <MenuItem value="DELIVERY">Delivery</MenuItem>
                    <MenuItem value="PICKUP">Self Pickup (Free)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {fulfillmentMode === 'DELIVERY' && (
                <TextField
                  select label="Delivery Target" size="small" fullWidth
                  value={shippingDestination}
                  onChange={(e) => setShippingDestination(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="GULU">Gulu City</MenuItem>
                  <MenuItem value="LIRA">Lira City</MenuItem>
                  <MenuItem value="KLA">Kampala Hub</MenuItem>
                  <MenuItem value="ARUA">Arua City</MenuItem>
                </TextField>
              )}

              {/* Weight summary line */}
              {logistics.totalWeightKg > 0 && fulfillmentMode === 'DELIVERY' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 1 }}>
                  <ScaleIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Total shipment weight: <strong>{formatWeight(logistics.totalWeightKg)}</strong>
                    {logistics.billableWeight > 0 && ` · billable ${formatWeight(logistics.billableWeight)}`}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, bgcolor: '#f9f9f9', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Components Total:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    UGX {logistics.itemsTotal.toLocaleString()}
                  </Typography>
                </Box>

                {logistics.isPickup ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Fulfillment:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StorefrontIcon fontSize="inherit" /> Self Pickup (Free)
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {logistics.freeShippingApplied ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Shipping Fee:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          FREE (order ≥ UGX {FREE_SHIPPING_MIN.toLocaleString()})
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Route Fee:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            UGX {logistics.zoneFee.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Weight Surcharge ({logistics.weightBand}):
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            UGX {logistics.weightFee.toLocaleString()}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </>
                )}

                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: '900' }}>Invoice Grand Total:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: '900', color: '#2e7d32' }}>
                    UGX {logistics.finalGrandTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* ─── ACTION PANEL ────────────────────────────────── */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                variant="contained" color="success" fullWidth size="large" startIcon={<WhatsAppIcon />}
                disabled={!waNumber}
                onClick={() => window.open(`https://wa.me/${waNumber}?text=${waMessage}`, '_blank')}
                sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '10px', py: 1.4 }}
              >
                Chat via WhatsApp
              </Button>
              <Button
                variant="outlined" color="primary" size="large" startIcon={<PhoneIcon />}
                disabled={!waNumber}
                onClick={() => window.open(`tel:+${waNumber}`)}
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
