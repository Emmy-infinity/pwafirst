import React, { useState } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  MenuItem, 
  Typography, 
  CircularProgress, 
  Paper,
  Grid,
  Divider,
  InputAdornment,
  Alert,
  AlertTitle
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScaleIcon from "@mui/icons-material/Scale";
import PhoneIcon from "@mui/icons-material/Phone";
import LoginIcon from '@mui/icons-material/Login';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import api from "../api";

export default function ProductFormUploader() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('USED');
  const [category, setCategory] = useState('LAPTOP');
  
  const [stockCount, setStockCount] = useState(1);
  const [itemLocation, setItemLocation] = useState('GULU');
  const [sellerLocationDetails, setSellerLocationDetails] = useState('');
  const [weight, setWeight] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const conditionChoices = [
    { value: 'NEW', label: 'Brand New / Sealed' },
    { value: 'REFURB', label: 'Refurbished / Tested' },
    { value: 'USED', label: 'Used / Working' },
    { value: 'SCRAP', label: 'Scrap / For Spare Parts' },
  ];

  const locationChoices = [
    { value: 'GULU', label: 'Gulu City' },
    { value: 'LIRA', label: 'Lira City' },
    { value: 'KLA', label: 'Kampala Road / Hub' },
    { value: 'ARUA', label: 'Arua City' },
  ];

  const categoryChoices = [
    { value: 'LAPTOP', label: 'Laptop Components' },
    { value: 'POWER', label: 'Inverters & Solar Spares' },
    { value: 'BATTERY', label: 'Power Packs & Batteries' },
    { value: 'IC', label: 'Microchips & Motherboards' },
    { value: 'SCREEN', label: 'Replacement Displays' },
    { value: 'NET', label: 'Networking & Modems' },
    { value: 'ACCESS', label: 'Cables & Adaptors' },
  ];

  const handleMultiFileChange = (e) => {
    const files = Array.from(e.target.files); 
    if (files.length > 0) {
      const selectedBatch = files.slice(0, 10);
      setSelectedFiles(selectedBatch);
      const previewUrls = selectedBatch.map(file => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setUploading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const masterFormPayload = new FormData();
      masterFormPayload.append("title", title);
      masterFormPayload.append("description", description);
      masterFormPayload.append("price", String(parseFloat(price)));
      masterFormPayload.append("condition", condition);
      masterFormPayload.append("category", category);
      masterFormPayload.append("stock_count", String(parseInt(stockCount, 10) || 1));
      masterFormPayload.append("item_location", itemLocation);
      masterFormPayload.append("seller_location_details", sellerLocationDetails);
      if (weight) masterFormPayload.append("weight", String(parseFloat(weight)));
      masterFormPayload.append("contact_phone", contactPhone);

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((fileItem) => {
          masterFormPayload.append("image", fileItem);
        });
      }

      await api.post("api/products/", masterFormPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
        }
      });

      setStatusMessage({ type: 'success', text: `🎉 Product published successfully!` });
      
      setTitle(''); setDescription(''); setPrice(''); setWeight(''); setSellerLocationDetails(''); setContactPhone(''); setStockCount(1); setSelectedFiles([]); setImagePreviews([]);
      navigate('/');

    } catch (err) {
      console.error("💥 Pipeline execution crash tracer:", err.response?.data || err.message);
      let detailedErrorMessage = "Field formatting alignment issue.";
      if (err.response && err.response.data) {
        detailedErrorMessage = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : String(err.response.data);
      } else if (err.message) {
        detailedErrorMessage = err.message;
      }
      setStatusMessage({ type: 'error', text: `Upload Blocked: ${detailedErrorMessage}` });
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: '650px', mx: 'auto', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: '16px', border: '1px solid #ffe0b2', backgroundColor: '#fffde7', textAlign: 'center' }}>
          <Alert severity="warning" variant="filled" icon={<LoginIcon sx={{ fontSize: 32 }} />} sx={{ mb: 3, borderRadius: '12px' }}>
            <AlertTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>Trader Authentication Required</AlertTitle>
            You must be logged into a verified dealer profile before you can submit hardware assets.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: '8px' }}>Return to Feed</Button>
            <Button variant="contained" color="warning" startIcon={<LoginIcon />} onClick={() => navigate('/login', { state: { from: '/upload' } })} sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: '8px', px: 4, color: '#fff' }}>Sign In Securely Now</Button>
          </Box>
        </Paper>
      </Box>
    );
  }
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', boxSizing: 'border-box', maxWidth: '1400px', mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2, fontWeight: 'bold', textTransform: 'none' }} disabled={uploading}>
        Back to Feed
      </Button>
      
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: "16px", border: "1px solid #eaeaea", backgroundColor: "#fff" }}>
        <Typography variant="h4" sx={{ fontWeight: "800", mb: 1, letterSpacing: "-0.5px" }}>
          Publish New Wholesale Inventory
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Logged in as verified wholesaler profile. Your inventory updates cross-regional catalogs instantly.
        </Typography>

        {statusMessage.text && <Alert severity={statusMessage.type} sx={{ mb: 3, borderRadius: '8px', fontWeight: '500' }}>{statusMessage.text}</Alert>}
        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            
            {/* LEFT COLUMN: MULTI-IMAGE CAROUSEL PREVIEW DRAWER */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#555', textTransform: 'uppercase', fontSize: '12px' }}>
                  Component Presentation Media ({selectedFiles.length} Selected)
                </Typography>
                
                <Paper elevation={0} sx={{ borderRadius: '16px', border: '2px dashed #ccc', minHeight: '350px', md: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', p: 2 }}>
                  {imagePreviews.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 2, width: '100%' }}>
                      {imagePreviews.map((url, idx) => (
                        <Box key={idx} sx={{ aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', bgcolor: '#fff' }}>
                          <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 3 }}>
                      <CloudUploadIcon sx={{ fontSize: 56, color: '#aaa', mb: 2, mx: 'auto', display: 'block' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#666' }} align="center">No Images Selected Yet</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} align="center">Select up to 10 pictures to build out your slider carousel spec sheet</Typography>
                    </Box>
                  )}
                </Paper>

                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} color={selectedFiles.length > 0 ? "success" : "primary"} sx={{ p: 1.8, fontWeight: "bold", textTransform: "none", borderRadius: "8px", borderWidth: 2 }}>
                  {selectedFiles.length > 0 ? `Change Batch (${selectedFiles.length} files)` : "Choose Multiple Component Pictures"}
                  <input type="file" accept="image/*" multiple hidden onChange={handleMultiFileChange} />
                </Button>
              </Box>
            </Grid>

            {/* RIGHT COLUMN: ADVANCED TECHNICAL PARAMETERS SPEC SHEET */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#555', textTransform: 'uppercase', fontSize: '12px' }}>
                  Technical Parameters Spec Ledger
                </Typography>

                <TextField label="Product Title / Part Name" variant="outlined" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading} placeholder="e.g., HP ProBook 450 G8 Replacement Battery" />
                <TextField label="Detailed Technical Description" variant="outlined" multiline rows={4} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} placeholder="List compatibility model strings, voltage codes..." />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField select label="Inventory Spares Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><CategoryIcon color="action" /></InputAdornment> }}>
                      {categoryChoices.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Wholesale Price (UGX)" variant="outlined" type="number" fullWidth required value={price} onChange={(e) => setPrice(e.target.value)} disabled={uploading} />
                  </Grid>
                  <Grid item xs={6}>
                    {/* 🌟 FIXED: Cleaned and corrected tag matching arrays to ensure 100% Babel compliance */}
                    <TextField 
                      label="Unit Weight" variant="outlined" type="number" inputProps={{ step: "0.01" }} fullWidth 
                      value={weight} onChange={(e) => setWeight(e.target.value)} disabled={uploading} 
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><ScaleIcon color="action" /></InputAdornment>, 
                        endAdornment: <InputAdornment position="end">KG</InputAdornment> 
                      }} 
                      placeholder="e.g., 0.45" 
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField select label="Hardware Condition" value={condition} onChange={(e) => setCondition(e.target.value)} fullWidth>
                      {conditionChoices.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Stock Count" variant="outlined" type="number" fullWidth value={stockCount} onChange={(e) => setStockCount(parseInt(e.target.value, 10) || 1)} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><InventoryIcon color="action" /></InputAdornment> }} />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField select label="Primary Storage Hub" value={itemLocation} onChange={(e) => setItemLocation(e.target.value)} fullWidth>
                      {locationChoices.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Contact Hotline" variant="outlined" fullWidth required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }} placeholder="e.g., 256770000000" />
                  </Grid>
                </Grid>

                <TextField label="Seller Specific Location Details" variant="outlined" fullWidth value={sellerLocationDetails} onChange={(e) => setSellerLocationDetails(e.target.value)} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="error" /></InputAdornment> }} placeholder="e.g., Shop 12, Gulu Main Market Upper Block" />

                <Button type="submit" variant="contained" color="success" size="large" fullWidth disabled={uploading} sx={{ fontWeight: "bold", py: 1.8, mt: 2, fontSize: '16px', textTransform: 'none', borderRadius: '8px' }}>
                  {uploading ? <CircularProgress size={26} color="inherit" /> : "Publish Listing Stock Live"}
                </Button>
              </Box>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
