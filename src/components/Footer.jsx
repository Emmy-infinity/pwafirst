import React, { useState } from 'react';
import { 
  Box, Typography, Container, Grid, Link, 
  Divider, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, styled 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import ShieldIcon from '@mui/icons-material/Shield';

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

const Footer = () => {
  const [legalModal, setLegalModal] = useState({ open: false, title: '', content: '' });

  const closeLegalModal = () => setLegalModal({ open: false, title: '', content: '' });

  const launchPrivacyPolicy = () => {
    setLegalModal({
      open: true,
      title: "🛡️ Privacy Policy & Data Protection Ledger",
      content: `In strict compliance with the Uganda Data Protection and Privacy Act, Northern Market is committed to securing your commercial merchant records:\n\n` +
               `1. COLLECTION: We log user accounts, mobile money numbers (MTN/Airtel), and product listing metadata strictly to execute B2B handshake discoveries.\n\n` +
               `2. MO MO TRANSACTION SECURITY: Your STK Push phone payment interactions are processed entirely via Flutterwave's PCI-DSS compliant secure vaults. Northern Market never views or caches your mobile wallet PIN codes.\n\n` +
               `3. REGIONAL DISCOVERY WEBPAGES: Wholesaler phone contacts and specific business numbers are published openly to unblock direct WhatsApp and call orders across Gulu, Lira, and Arua hubs.`
    });
  };

  const launchTermsOfService = () => {
    setLegalModal({
      open: true,
      title: "⚖️ Terms of Service & Escrow Liabilities",
      content: `Please read these B2B trading terms carefully before deploying listings:\n\n` +
               `1. SPARES COMPATIBILITY VERIFICATION: Wholesalers bear sole structural liability for the operational status of listed spares (motherboards, batteries, display panels). Buyers are strongly encouraged to run physical compatibility verification metrics before changing currency handshakes.\n\n` +
               `2. MOBLE MONEY SPONSORSHIPS: Promotional fees (UGX 20,000) applied to feature items in the Top 200 grid are finalized immediately upon Flutterwave STK completion hooks. Featured promotions are non-refundable.\n\n` +
               `3. DEFIANT MERCHANT BANS: Publishing scrap hardware falsified as sealed new inventory, or listing unauthorized communication networks will result in an immediate token session revocation.`
    });
  };

  return (
    <FooterWrapper component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4, textAlign: { xs: 'center', sm: 'left' } }}>
          {/* COLUMN 1 */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: '900', color: '#ffffff', mb: 2, letterSpacing: '-0.3px' }}>
              Northern Market
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0bec5', lineHeight: 1.6, pr: { sm: 2 } }}>
              The premium full-stack marketplace routing high-efficiency computing parts and industrial electronic spares across Gulu, Lira, and Arua wholesale trading hubs.
            </Typography>
          </Grid>

          {/* COLUMN 2 */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#ffffff', mb: 2, textTransform: 'uppercase', fontSize: '12px' }}>
              Legal & Compliance
            </Typography>
            <FooterLink onClick={launchPrivacyPolicy}>
              Privacy & Data Policy (Uganda Act Compliant)
            </FooterLink>
            <FooterLink onClick={launchTermsOfService}>
              Terms of Service & Trader Liabilities
            </FooterLink>
          </Grid>

          {/* COLUMN 3 */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#ffffff', mb: 2, textTransform: 'uppercase', fontSize: '12px' }}>
              Marketplace Hub Contacts
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#b0bec5', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <LocationOnIcon fontSize="small" sx={{ color: '#d32f2f' }} />
              <Typography variant="body2">Gulu City Main Hub, Uganda</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b0bec5', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <EmailIcon fontSize="small" sx={{ color: '#1976d2' }} />
              <Typography variant="body2">support@northernmarket.co.ug</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#777', textAlign: { xs: 'center', sm: 'left' } }}>
            © {new Date().getFullYear()} Northern Market. Engineered natively for certified B2B wholesale electronics networks. All Rights Reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              size="small" 
              icon={<ShieldIcon style={{ color: '#4caf50' }} />} 
              label="Flutterwave Sandbox Vetted" 
              sx={{ bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50', fontWeight: 'bold', border: '1px solid rgba(76,175,80,0.2)' }} 
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
            I Accept and Agree
          </Button>
        </DialogActions>
      </Dialog>
    </FooterWrapper>
  );
};

export default Footer;
