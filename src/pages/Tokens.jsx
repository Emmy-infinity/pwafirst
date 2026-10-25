import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, Paper, Button, CircularProgress, Alert } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';

export default function Tokens() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pesapal usually appends the tracking ID to the URL
  const orderTrackingId = searchParams.get("OrderTrackingId");
  
  const [status, setStatus] = useState("processing"); // 'processing', 'success', 'error'

  useEffect(() => {
    // Pesapal redirects here immediately. The webhook (backend) 
    // takes a few seconds to confirm the payment with Pesapal.
    // We wait 4 seconds to give the webhook time to update the database.
    
    const timer = setTimeout(() => {
      if (orderTrackingId) {
        setStatus("success");
      } else {
        // If there's no tracking ID in the URL, something might be wrong
        setStatus("error");
      }
    }, 4000); // 4-second delay

    return () => clearTimeout(timer);
  }, [orderTrackingId]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Paper elevation={4} sx={{ p: 5, maxWidth: '500px', width: '100%', textAlign: 'center', borderRadius: '16px' }}>
        
        {status === "processing" && (
          <>
            <CircularProgress size={60} sx={{ mb: 3, color: '#2e7d32' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Verifying Payment...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we confirm your transaction with Pesapal. Do not close this page.
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon sx={{ fontSize: 70, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your listing has been successfully boosted. It will now appear at the top of the feed.
            </Typography>
            <Button 
              variant="contained" 
              color="success" 
              size="large" 
              fullWidth
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{ py: 1.5, fontWeight: 'bold', borderRadius: '8px' }}
            >
              Return to Home Feed
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon sx={{ fontSize: 70, color: '#d32f2f', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Payment Verification Issue
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We could not automatically verify your payment reference. If you were charged, please contact support.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large" 
              fullWidth
              onClick={() => navigate("/")}
              sx={{ py: 1.5, fontWeight: 'bold', borderRadius: '8px' }}
            >
              Back to Home
            </Button>
          </>
        )}

      </Paper>
    </Box>
  );
}
