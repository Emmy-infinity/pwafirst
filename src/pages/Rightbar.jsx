import React from "react";
import ImageUploader from "./UploadImage"; // Securely imports your local image form module
import { 
  Avatar, 
  Box, 
  AvatarGroup, 
  Typography, 
  Paper, 
  Divider, 
  styled 
} from "@mui/material";

// 🌟 SOTA SIDEBAR VIEWPORT LAYER (Clean, minimal material panels with layout grid limits)
const SidebarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderLeft: "1px solid #eaeaea",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  width: "320px",
  boxSizing: "border-box"
}));

const ActionCard = styled(Paper)({
  padding: "20px",
  borderRadius: "16px",
  backgroundColor: "#fdfdfd",
  border: "1px solid #f0f0f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
});

const Rightbar = () => {
  return (
    <SidebarContainer sx={{ display: { xs: "none", md: "block" } }}>
      
      {/* SECTION 1: CORE SPARES SUBMISSION TERMINAL FORM */}
      <ActionCard variant="outlined">
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ fontWeight: "800", color: "#111", mb: 2, letterSpacing: "-0.3px" }}
        >
          Publish Wholesale Stock
        </Typography>
        <ImageUploader />
      </ActionCard>

      <Divider sx={{ my: 1 }} />

      {/* SECTION 2: REGIONAL MERCHANT DIRECTORIES DISCOVERY LISTS */}
      <Box>
        <Typography 
          variant="subtitle2" 
          sx={{ fontWeight: "700", color: "#555", mb: 1.5, textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.5px" }}
        >
          Top Verified Regional Wholesalers
        </Typography>
        
        <Box sx={{ display: "flex", pl: 0.5 }}>
          <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 36, height: 36, fontSize: 14, fontWeight: "bold" } }}>
            <Avatar alt="Emmy Spares" src="src/images/emmy2.jpg">E</Avatar>
            <Avatar alt="Nelly Logistics" src="src/images/nelly.jpg">N</Avatar>
            <Avatar alt="Gulu Spares" src="src/images/emmy1.jpg">G</Avatar>
            <Avatar alt="Lira Electronics" src="src/images/emmy1.jpg">L</Avatar>
            <Avatar alt="Arua Components" src="src/images/emmy2.jpg">A</Avatar>
            <Avatar alt="Kampala Hub Master">K</Avatar>
          </AvatarGroup>
        </Box>
      </Box>

    </SidebarContainer>
  );
};

export default Rightbar;
