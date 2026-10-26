import React, { useState } from 'react';
import { 
  Box, Typography, Container, Grid, Link, 
  Divider, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, styled, Tooltip 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#111315', // Deeper, richer dark background
  color: '#eaeaea',
  paddingTop: '64px',
  paddingBottom: '32px',
  marginTop: 'auto', 
  borderTop: '4px solid #2e7d32', 
  position: 'relative',
}));

const FooterLink = styled(Link)({
  color: '#9ca3af',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  display: 'block',
  marginBottom: '12px',
  cursor: 'pointer',
  '&:hover': {
    color: '#ffffff',
    transform: 'translateX(4px)', // Subtle hover animation
  }
});

// ✅ SOTA Payment Tile Component
const PaymentTile = ({ name, src, alt }) => (
  <Tooltip title={`Pay securely with ${name}`} arrow placement="top">
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#ffffff', 
        px: 2, 
        py: 1, 
        borderRadius: '8px',
        height: '44px', // Larger, more tappable
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s ease, boxShadow 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      <img 
        src={src} 
        alt={alt} 
        style={{ height: '24px', width: 'auto', objectFit: 'contain' }} 
      />
    </Box>
  </Tooltip>
);

const Footer = () => {
  const [legalModal, setLegalModal] = useState({ open: false, title: '', content: '' });

  const closeLegalModal = () => setLegalModal({ open: false, title: '', content: '' });

  const launchPrivacyPolicy = () => {
    setLegalModal({
      open: true,
      title: "🛡️ Privacy Policy & Data Protection",
      content: `In strict compliance with the Uganda Data Protection and Privacy Act, Northern Market is committed to securing your account and transaction data:\n\n` +
               `1. DATA COLLECTION: We collect user account details, mobile money numbers, and product listing metadata strictly to facilitate B2B and B2C commerce.\n\n` +
               `2. PAYMENT SECURITY: All transactions are processed through our secure, PCI-DSS compliant payment gateway partners (Pesapal). Northern Market does not view or store your mobile wallet PINs or full card numbers.\n\n` +
               `3. CONTACT INFORMATION: Seller phone contacts are published to allow direct communication between buyers and sellers.`
    });
  };

  const launchTermsOfService = () => {
    setLegalModal({
      open: true,
      title: "⚖️ Terms of Service",
      content: `Please read these trading terms carefully before using the platform:\n\n` +
               `1. PRODUCT LIABILITY: Sellers bear sole responsibility for the accuracy of their listings, including condition, pricing, and stock availability. Buyers are encouraged to inspect goods before finalizing offline transactions.\n\n` +
               `2. PROMOTIONAL FEES: Fees applied to feature items on the platform are finalized immediately upon successful payment. Featured promotions are non-refundable.\n\n` +
               `3. ACCOUNT SUSPENSION: Publishing fraudulent listings or violating our community guidelines will result in immediate account suspension.`
    });
  };

  return (
    <FooterWrapper component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6, textAlign: { xs: 'center', sm: 'left' } }}>
          
          {/* COLUMN 1: Brand */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ fontWeight: '900', color: '#ffffff', mb: 2, letterSpacing: '-0.5px' }}>
              Northern Market
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', lineHeight: 1.7, pr: { md: 4 } }}>
              A modern B2B and B2C e-commerce platform connecting buyers and sellers across Uganda. Discover, trade, and grow your business securely.
            </Typography>
          </Grid>

          {/* COLUMN 2: Legal */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#ffffff', mb: 2, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
              Legal & Compliance
            </Typography>
            <FooterLink onClick={launchPrivacyPolicy}>
              Privacy & Data Policy
            </FooterLink>
            <FooterLink onClick={launchTermsOfService}>
              Terms of Service
            </FooterLink>
          </Grid>

          {/* COLUMN 3: Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#ffffff', mb: 2, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
              Contact Us
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, color: '#9ca3af', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <PhoneIcon fontSize="small" sx={{ color: '#4caf50' }} />
              <Typography variant="body2" sx={{ fontWeight: '500' }}>0789814925</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, color: '#9ca3af', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <EmailIcon fontSize="small" sx={{ color: '#1976d2' }} />
              <Typography variant="body2" sx={{ fontWeight: '500' }}>emmymatidiopakrwot@gmail.com</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#9ca3af', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <LocationOnIcon fontSize="small" sx={{ color: '#d32f2f' }} />
              <Typography variant="body2" sx={{ fontWeight: '500' }}>Gulu City, Uganda</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ✅ SOTA TRUST BAR: Highlighting Payment Methods */}
        <Box sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.03)', // Very subtle background to separate it
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          p: 3,
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3
        }}>
          {/* Trust Text */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockIcon sx={{ color: '#4caf50', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 'bold', lineHeight: 1.2 }}>
                100% Secure Checkout
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Processed via PCI-DSS compliant Pesapal gateway
              </Typography>
            </Box>
          </Box>

          {/* Highly Visible Payment Logos */}
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', justifyContent: 'center' }}>
            <PaymentTile 
              name="Visa" 
              src="https://cdn.simpleicons.org/visa/1a1f71" 
              alt="Visa" 
            />
            <PaymentTile 
              name="Mastercard" 
              src="https://cdn.simpleicons.org/mastercard/eb001b" 
              alt="Mastercard" 
            />
            <PaymentTile 
              name="MTN Mobile Money" 
              src="https://cdn.simpleicons.org/mtn/ffcc00" 
              alt="MTN Mobile Money" 
            />
            <PaymentTile 
              name="Airtel Money" 
              src="https://cdn.simpleicons.org/airtel/ff0000" 
              alt="Airtel Money" 
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 3 }} />

        {/* Bottom Bar: Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#6b7280', textAlign: 'center', fontWeight: '500' }}>
            © {new Date().getFullYear()} Northern Market. All Rights Reserved.
          </Typography>
        </Box>
      </Container>

      {/* Legal Modal */}
      <Dialog open={legalModal.open} onClose={closeLegalModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: '900', fontSize: '20px', color: '#111' }}>
          {legalModal.title}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#e5e7eb' }}>
          <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '15px' }}>
            {legalModal.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeLegalModal} color="success" variant="contained" sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: '8px', px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </FooterWrapper>
  );
};

export default Footer;
