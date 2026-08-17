import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Paper, 
  Grid, InputAdornment, Alert, CircularProgress, 
  Card, CardContent, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import api from '../api';

export default function MoMoCheckoutModal() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract contextual data payloads passed forward by Feedtwo grid nodes
  const targetProductId = location.state?.targetProductId || null;
  const promoAmount = location.state?.promoAmount || 5000; // Default promotional rate 20k UGX
  const itemTitle = location.state?.itemTitle || "Wholesale Hardware Component";

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Dynamic carrier classification engine block
  const detectCarrierNetwork = (num) => {
    const cleanNum = num.replace(/\s+/g, '');
    if (cleanNum.startsWith('25677') || cleanNum.startsWith('25678') || cleanNum.startsWith('077') || cleanNum.startsWith('078')) {
      return { name: 'MTN Mobile Money', color: '#ffcc00', text: '#000' };
    }
    if (cleanNum.startsWith('25670') || cleanNum.startsWith('25675') || cleanNum.startsWith('070') || cleanNum.startsWith('075')) {
      return { name: 'Airtel Money', color: '#ff0000', text: '#fff' };
    }
    return { name: 'Detecting Carrier...', color: '#f5f5f5', text: '#666' };
  };

  const carrier = detectCarrierNetwork(phoneNumber);

  const handlePaymentSubmission = async (e) => {
    e.preventDefault();
    if (!targetProductId) {
      setError("Missing product reference tracking keys. Return to feed and retry.");
      return;
    }

    // Format localized numbers to international 256 structural layouts
    let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (formattedPhone.startsWith('07')) {
      formattedPhone = '256' + formattedPhone.substring(1);
    }

    if (!formattedPhone.startsWith('256') || formattedPhone.length !== 12) {
      setError("Invalid Ugandan mobile wallet length. Must match format: 077XXXXXXX or 25677XXXXXXX");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const paymentPayload = {
        product: targetProductId,
        amount: parseFloat(promoAmount),
        phone_number: formattedPhone
      };

      const response = await api.post('api/payments/', paymentPayload);
      console.log("💰 Handshake Successful:", response.data);
      
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => navigate('/'), 3000);

    } catch (err) {
      console.error("💥 Billing compilation failure details:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to trigger automated Mobile Money prompt. Verify connection rules.");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '500px', width: '100%', mx: 'auto', p: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')} 
        sx={{ mb: 2, fontWeight: 'bold', textTransform: 'none', color: '#555' }}
        disabled={loading}
      >
        Cancel and Return
      </Button>

      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', border: '1px solid #eaeaea', backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <FlashOnIcon sx={{ color: '#d32f2f', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: '900', letterSpacing: '-0.5px' }}>
            Boost Listing Visibility
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Promote your stock to the regional top-200 grid rail instantly via secure mobile wallet checkouts.
        </Typography>

        <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f9f9f9', borderRadius: '12px' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Target Component</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: '800', mb: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{itemTitle}</Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Sponsorship Rate:</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: '900', color: '#2e7d32' }}>UGX {promoAmount.toLocaleString()}</Typography>
            </Box>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>🎉 <strong>STK Push Initialized!</strong> Check your phone handset and enter your Mobile Money PIN code to authorize listing promotion.</Alert>}

        <form onSubmit={handlePaymentSubmission}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Mobile Money Registered Number" variant="outlined" fullWidth required type="tel"
                value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={loading}
                placeholder="e.g., 0770000000"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneAndroidIcon color="action" /></InputAdornment>
                }}
                helperText="MTN Mobile Money or Airtel Money phone lines accepted natively."
              />
            </Grid>

            {phoneNumber.trim().length >= 3 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: carrier.color + '15', p: 1.5, borderRadius: '8px', border: `1px solid ${carrier.color}` }}>
                  <AccountBalanceWalletIcon style={{ color: carrier.text === '#fff' ? '#ff0000' : '#b28900' }} />
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Network Operator: <strong>{carrier.name}</strong>
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Button
                type="submit" variant="contained" color="error" size="large" fullWidth
                sx={{ height: '50px', fontWeight: 'bold', textTransform: 'none', borderRadius: '10px', fontSize: '15px' }}
                disabled={loading || phoneNumber.trim().length < 9}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : `Authorize UGX ${promoAmount.toLocaleString()} Boost`}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
