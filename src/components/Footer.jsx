import React, { useState } from 'react';
import { 
  Box, Typography, Container, Grid, Link, 
  Divider, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, styled 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#1a1d20',
  color: '#eaeaea',
  paddingTop: '48px',
  paddingBottom: '24px',
  marginTop: 'auto', 
  borderTop: '4px solid #2e7d32', 
}));

const FooterLink = styled(Link)({
  color: '#b0bec5',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'color 0.2s ease',
  display: 'block',
  marginBottom: '8px',
  cursor: 'pointer',
  '&:hover': {
    color: '#ffffff',
    textDecoration: 'underline'
  }
});

// ✅ Brand Logo Component using Simple Icons CDN
const PaymentLogo = ({ name, src, alt }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5, 
      bgcolor: '#ffffff', 
      px: 1.5, 
      py: 0.5, 
      borderRadius: '4px',
      height: '32px'
    }}
  >
    <img src={src} alt={alt} style={{ height: '20px', width: 'auto' }} />
    <Typography variant="caption" sx={{ color: '#333', fontWeight: 'bold', fontSize: '11px' }}>
      {name}
    </Typography>
  </Box>
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
        <Grid container spacing={4} sx={{ mb: 4, textAlign: { xs: 'center', sm: 'left' } }}>
          
          {/* COLUMN 1: Brand */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: '900', color: '#ffffff', mb: 2, letterSpacing: '-0.3px' }}>
              Northern Market
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0bec5', lineHeight: 1.6, pr: { sm: 2 } }}>
              A modern B2B and B2C e-commerce platform connecting buyers and sellers across Uganda. Discover, trade, and grow your business securely.
            </Typography>
          </Grid>

          {/* COLUMN 2: Legal */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#ffffff', mb: 2, textTransform: 'uppercase', fontSize: '12px' }}>
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
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#ffffff', mb: 2, textTransform: 'uppercase', fontSize: '12px' }}>
              Contact Us
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#b0bec5', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <PhoneIcon fontSize="small" sx={{ color: '#4caf50' }} />
              <Typography variant="body2">0789814925</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#b0bec5', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <EmailIcon fontSize="small" sx={{ color: '#1976d2' }} />
              <Typography variant="body2">emmymatidiopakrwot@gmail.com</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b0bec5', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <LocationOnIcon fontSize="small" sx={{ color: '#d32f2f' }} />
              <Typography variant="body2">Gulu City, Uganda</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        {/* Bottom Bar: Copyright & Payment Methods */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#777', textAlign: { xs: 'center', sm: 'left' } }}>
            © {new Date().getFullYear()} Northern Market. All Rights Reserved.
          </Typography>
          
          {/* Payment Method Logos */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4caf50', mr: 1 }}>
              <LockIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Secure</Typography>
            </Box>

            <PaymentLogo 
              name="Visa" 
              src="https://cdn.simpleicons.org/visa/1a1f71" 
              alt="Visa" 
            />
            <PaymentLogo 
              name="Mastercard" 
              src="https://cdn.simpleicons.org/mastercard/eb001b" 
              alt="Mastercard" 
            />
            <PaymentLogo 
              name="MTN MoMo" 
              src="https://cdn.simpleicons.org/mtn/ffcc00" 
              alt="MTN Mobile Money" 
            />
            <PaymentLogo 
              name="Airtel" 
              src="https://cdn.simpleicons.org/airtel/ff0000" 
              alt="Airtel Money" 
            />
          </Box>
        </Box>
      </Container>

      {/* Legal Modal */}
      <Dialog open={legalModal.open} onClose={closeLegalModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>
          {legalModal.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {legalModal.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLegalModal} color="success" variant="contained" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </FooterWrapper>
  );
};

export default Footer;
