import React, { useState, useEffect } from "react";
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
  AlertTitle,
  Chip,
  IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScaleIcon from "@mui/icons-material/Scale";
import PhoneIcon from "@mui/icons-material/Phone";
import LoginIcon from '@mui/icons-material/Login';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from "../api";

const CATEGORY_ICONS = {
  LAPTOP: "💻",
  POWER: "⚡",
  BATTERY: "🔋",
  IC: "🧩",
  SCREEN: "🖥️",
  NET: "📶",
  ACCESS: "🔌"
};

export default function ProductFormUploader() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  // Unified form states
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
  
  // File upload state trackers
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // 🛡️ MEMORY ESCAPE OVERLOAD ACCELERATOR: Releases local storage URL states elegantly
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Product title is required";
    if (!description.trim()) newErrors.description = "Description field cannot be left blank";
    if (!price || parseFloat(price) <= 0) newErrors.price = "A valid positive price specification is required";
    if (!contactPhone.trim()) newErrors.contactPhone = "Wholesale contact phone parameter is required";
    if (selectedFiles.length === 0) newErrors.images = "At least one item diagnostic asset photo is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMultiFileChange = (e) => {
    const files = Array.from(e.target.files);
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    
    if (files.length > 0) {
      const selectedBatch = files.slice(0, 10);
      setSelectedFiles(selectedBatch);
      const previewUrls = selectedBatch.map(file => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
      if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
    } else {
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    if (imagePreviews[indexToRemove]?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[indexToRemove]);
    }
    setSelectedFiles(selectedFiles.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, idx) => idx !== indexToRemove));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/upload' } });
      return;
    }

    if (!validateForm()) {
      setStatusMessage({ type: 'error', text: 'Please resolve the parameter formatting errors highlighted below.' });
      return;
    }

    setUploading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const masterFormPayload = new FormData();
      masterFormPayload.append("title", title.trim());
      masterFormPayload.append("description", description.trim());
      masterFormPayload.append("price", String(parseFloat(price)));
      masterFormPayload.append("condition", condition);
      masterFormPayload.append("category", category);
      masterFormPayload.append("stock_count", String(Math.max(1, parseInt(stockCount, 10) || 1)));
      masterFormPayload.append("item_location", itemLocation);
      
      if (sellerLocationDetails.trim()) {
        masterFormPayload.append("seller_location_details", sellerLocationDetails.trim());
      }
      if (weight && parseFloat(weight) > 0) {
        masterFormPayload.append("weight", String(parseFloat(weight)));
      }
      masterFormPayload.append("contact_phone", contactPhone.trim());

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((fileItem) => {
          masterFormPayload.append("image", fileItem);
        });
      }

      // 📡 Dispatches to your Django viewset router core instance smoothly
      await api.post("api/products/", masterFormPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
        }
      });

      setStatusMessage({ type: 'success', text: `🎉 Wholesale stock "${title}" published live successfully!` });
      
      // Wipe parameter contexts clean from application layer
      setTitle(''); setDescription(''); setPrice(''); setWeight(''); setSellerLocationDetails(''); setContactPhone(''); setStockCount(1);
      imagePreviews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
      setSelectedFiles([]); setImagePreviews([]);

      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      console.error("💥 Submission failure tracer stack:", err.response?.data || err.message);
      let detailedErrorMessage = "Wholesale network parameter verification mismatch. Review input types.";
      
      if (err.response) {
        if (err.response.status === 400) {
          const data = err.response.data;
          if (typeof data === 'object') {
            detailedErrorMessage = Object.entries(data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');
          }
        } else if (err.response.status === 401) {
          detailedErrorMessage = "Your active trader session has expired. Re-authenticate.";
        }
      }
      setStatusMessage({ type: 'error', text: detailedErrorMessage });
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: '650px', mx: 'auto', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: '16px', textAlign: 'center', backgroundColor: '#fff' }}>
          <Alert severity="warning" variant="filled" icon={<LoginIcon />} sx={{ mb: 3, borderRadius: '12px' }}>
            Trader Authentication Required
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Northern Market secures wholesale listings via secure tokens. Sign in to post stock.
          </Typography>
          <Button variant="contained" color="success" onClick={() => navigate('/login', { state: { from: '/upload' } })} sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '8px', px: 4 }}>Sign In Securely Now</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', boxSizing: 'border-box', maxWidth: '1300px', mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2, fontWeight: 'bold', textTransform: 'none' }} disabled={uploading}>
        Back to Marketplace Feed
      </Button>
      
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: "16px", border: "1px solid #eaeaea", backgroundColor: "#fff" }}>
        <Typography variant="h4" sx={{ fontWeight: "900", mb: 1, letterSpacing: "-0.5px" }}>
          Publish New Wholesale Inventory
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the advanced parameter matrix below to sync live items.
        </Typography>

        {statusMessage.text && <Alert severity={statusMessage.type} sx={{ mb: 4, borderRadius: '8px' }}>{statusMessage.text}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            
            {/* LEFT COMPONENT LAYER: MULTIPLE PHOTO DISPATCH CONTAINER */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#555', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  Component Presentation Media ({selectedFiles.length}/10)
                </Typography>
                
                <Paper variant="outlined" sx={{ borderRadius: '16px', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', p: 2.5, border: errors.images ? '2px dashed #d32f2f' : '2px dashed #ccc' }}>
                  {imagePreviews.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 2, width: '100%' }}>
                      {imagePreviews.map((url, idx) => (
                        <Box key={idx} sx={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eaeaea', bgcolor: '#fff' }}>
                          <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <IconButton size="small" onClick={() => handleRemoveImage(idx)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#ffebee', color: '#d32f2f' } }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#aaa', mb: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>Drop or Select Presentation Images</Typography>
                      {errors.images && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, fontWeight: 'bold' }}>{errors.images}</Typography>}
                    </Box>
                  )}
                </Paper>

                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} color={errors.images ? "error" : "success"} sx={{ p: 1.6, fontWeight: "bold", textTransform: "none", borderRadius: "10px", borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}>
                  Choose Diagnostics Pictures
                  <input type="file" accept="image/*" multiple hidden onChange={handleMultiFileChange} disabled={uploading} />
                </Button>
              </Box>
            </Grid>

            {/* RIGHT COMPONENT LAYER: TECHNICAL SPECS SPECIFICATION LEDGER */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#555', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  Technical Specifications Details
                </Typography>

                <TextField error={Boolean(errors.title)} helperText={errors.title} label="Product Part Title" size="small" variant="outlined" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading} />
                <TextField error={Boolean(errors.description)} helperText={errors.description} label="Compatibility Compatibility Descriptions" size="small" variant="outlined" multiline rows={3} fullWidth required value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField select label="Inventory Category" size="small" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><span style={{ fontSize: '16px' }}>{CATEGORY_ICONS[category]}</span></InputAdornment> }}>
                      {categoryChoices.map((opt) => (<MenuItem key={option.value} value={opt.value}>{opt.label}</MenuItem>))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField error={Boolean(errors.price)} helperText={errors.price} label="Price (UGX)" size="small" variant="outlined" type="number" fullWidth required value={price} onChange={(e) => setPrice(e.target.value)} disabled={uploading} />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField select label="Condition Quality" size="small" value={condition} onChange={(e) => setCondition(e.target.value)} fullWidth>

  
