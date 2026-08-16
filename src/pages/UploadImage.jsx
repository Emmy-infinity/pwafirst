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
  IconButton,
  Badge
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
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate } from 'react-router-dom';
import api from "../api";

// 🌟 Category Icons Mapping
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

  // Form state
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
  
  // File state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  
  // Validation state
  const [errors, setErrors] = useState({});

  // Cleanup blob URLs on unmount
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
    { value: 'NEW', label: 'Brand New / Sealed', color: 'success' },
    { value: 'REFURB', label: 'Refurbished / Tested', color: 'info' },
    { value: 'USED', label: 'Used / Working', color: 'warning' },
    { value: 'SCRAP', label: 'Scrap / For Spare Parts', color: 'error' },
  ];

  const locationChoices = [
    { value: 'GULU', label: 'Gulu City', region: 'North' },
    { value: 'LIRA', label: 'Lira City', region: 'North' },
    { value: 'KLA', label: 'Kampala Road / Hub', region: 'Central' },
    { value: 'ARUA', label: 'Arua City', region: 'North' },
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

  // 🌟 Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = "Product title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price || parseFloat(price) <= 0) newErrors.price = "Valid price is required";
    if (!contactPhone.trim()) newErrors.contactPhone = "Contact phone is required";
    if (selectedFiles.length === 0) newErrors.images = "At least one product image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMultiFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Clean up old blob URLs
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    
    if (files.length > 0) {
      const selectedBatch = files.slice(0, 10);
      setSelectedFiles(selectedBatch);
      const previewUrls = selectedBatch.map(file => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
      
      // Clear image error if exists
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    } else {
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    // Revoke the blob URL
    if (imagePreviews[indexToRemove]?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[indexToRemove]);
    }
    
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/upload' } });
      return;
    }

    // Validate before submission
    if (!validateForm()) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Please fix the errors highlighted below before publishing.' 
      });
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

      // 🌟 FIXED: Removed trailing slash from endpoint
      await api.post("api/products", masterFormPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
        }
      });

      setStatusMessage({ 
        type: 'success', 
        text: `🎉 "${title}" published successfully! Redirecting to marketplace...` 
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setWeight('');
      setSellerLocationDetails('');
      setContactPhone('');
      setStockCount(1);
      
      // Clean up and reset images
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      
      // Redirect after short delay
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      console.error("💥 Upload error:", err.response?.data || err.message);
      
      let detailedErrorMessage = "Failed to publish product. Please check your inputs and try again.";
      
      if (err.response) {
        if (err.response.status === 400) {
          const data = err.response.data;
          if (typeof data === 'object') {
            const messages = Object.entries(data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');
            detailedErrorMessage = `Validation error: ${messages}`;
          }
        } else if (err.response.status === 401) {
          detailedErrorMessage = "Your session has expired. Please log in again.";
          localStorage.removeItem("ACCESS_TOKEN");
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 413) {
          detailedErrorMessage = "Images are too large. Please compress them and try again.";
        } else {
          detailedErrorMessage = `Server error (${err.response.status}). Please try again later.`;
        }
      } else if (err.request) {
        detailedErrorMessage = "Network error. Please check your internet connection.";
      }
      
      setStatusMessage({ type: 'error', text: detailedErrorMessage });
    } finally {
      setUploading(false);
    }
  };

  // 🌟 Authentication guard
  if (!isAuthenticated) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: '650px', mx: 'auto', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: '16px', border: '1px solid #ffe0b2', backgroundColor: '#fffde7', textAlign: 'center' }}>
          <Alert severity="warning" variant="filled" icon={<LoginIcon sx={{ fontSize: 32 }} />} sx={{ mb: 3, borderRadius: '12px' }}>
            <AlertTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>Trader Authentication Required</AlertTitle>
            You must be logged into a verified dealer profile before you can submit hardware assets.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: '8px' }}>
              Return to Feed
            </Button>
            <Button variant="contained" color="warning" startIcon={<LoginIcon />} onClick={() => navigate('/login', { state: { from: '/upload' } })} sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: '8px', px: 4, color: '#fff' }}>
              Sign In Securely Now
            </Button>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: "800", letterSpacing: "-0.5px" }}>
            Publish New Wholesale Inventory
          </Typography>
          <Chip 
            icon={<PreviewIcon />} 
            label="Preview Mode" 
            color="info" 
            variant="outlined"
            onClick={() => {/* Show preview modal */}}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Logged in as verified wholesaler profile. Your inventory updates cross-regional catalogs instantly.
        </Typography>

        {statusMessage.text && (
          <Alert 
            severity={statusMessage.type} 
            sx={{ mb: 3, borderRadius: '8px', fontWeight: '500' }}
            onClose={() => setStatusMessage({ type: '', text: '' })}
          >
            {statusMessage.text}
          </Alert>
        )}
        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            
            {/* LEFT COLUMN: IMAGE UPLOAD */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#555', textTransform: 'uppercase', fontSize: '12px' }}>
                    Component Presentation Media ({selectedFiles.length}/10 Selected)
                  </Typography>
                  {errors.images && (
                    <Typography color="error" variant="caption">{errors.images}</Typography>
                  )}
                </Box>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    borderRadius: '16px', 
                    border: `2px dashed ${errors.images ? '#d32f2f' : '#ccc'}`,
                    minHeight: { xs: '300px', md: '400px' },
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#fafafa', 
                    p: 2,
                    transition: 'border-color 0.3s'
                  }}
                >
                  {imagePreviews.length > 0 ? (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
                      gap: 2, 
                      width: '100%',
                      maxHeight: '350px',
                      overflowY: 'auto'
                    }}>
                      {imagePreviews.map((url, idx) => (
                        <Box key={idx} sx={{ 
                          position: 'relative',
                          aspectRatio: '4/3', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid #eaeaea',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                          bgcolor: '#fff',
                          '&:hover .delete-btn': { opacity: 1 }
                        }}>
                          <img 
                            src={url} 
                            alt={`Preview ${idx + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <IconButton
                            className="delete-btn"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '&:hover': { bgcolor: 'rgba(211,47,47,0.8)' }
                            }}
                            onClick={() => handleRemoveImage(idx)}
                            disabled={uploading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Chip 
                            label={`#${idx + 1}`} 
                            size="small" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 4, 
                              right: 4, 
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              fontSize: '10px',
                              height: 20
                            }} 
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 56, color: '#aaa', mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#666' }}>
                        No Images Selected Yet
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {errors.images ? '⚠️ Required!' : 'Select up to 10 pictures to build your slider carousel'}
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <Button 
                  component="label" 
                  variant="outlined" 
                  startIcon={<CloudUploadIcon />} 
                  color={selectedFiles.length > 0 ? "success" : "primary"}
                  sx={{ 
                    p: 1.8, 
                    fontWeight: "bold", 
                    textTransform: "none", 
                    borderRadius: "8px", 
                    borderWidth: 2,
                    borderColor: errors.images ? '#d32f2f' : undefined
                  }}
                  disabled={uploading}
                >
                  {selectedFiles.length > 0 ? `Change Batch (${selectedFiles.length} files)` : "Choose Multiple Component Pictures"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    hidden 
                    onChange={handleMultiFileChange}
                    disabled={uploading}
                  />
                </Button>
                
                {selectedFiles.length === 10 && (
                  <Alert severity="info" sx={{ fontSize: '12px' }}>
                    Maximum 10 images reached. Remove some to add more.
                  </Alert>
                )}
              </Box>
            </Grid>

            {/* RIGHT COLUMN: FORM FIELDS */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#555', textTransform: 'uppercase', fontSize: '12px' }}>
                  Technical Parameters Spec Ledger
                </Typography>

                <TextField 
                  label="Product Title / Part Name" 
                  variant="outlined" 
                  fullWidth 
                  required 
                  value={title} 
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  disabled={uploading}
                  placeholder="e.g., HP ProBook 450 G8 Replacement Battery"
                  error={!!errors.title}
                  helperText={errors.title}
                />
                
                <TextField 
                  label="Detailed Technical Description" 
                  variant="outlined" 
                  multiline 
                  rows={4} 
                  fullWidth 
                  value={description} 
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  disabled={uploading}
                  placeholder="List compatibility model strings, voltage codes, dimensions, and other technical specs..."
                  error={!!errors.description}
                  helperText={errors.description}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      select 
                      label="Inventory Spares Category" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      fullWidth 
                      disabled={uploading}
                      InputProps={{ 
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontSize: '20px' }}>
                              {CATEGORY_ICONS[category] || "📦"}
                            </Typography>
                          </InputAdornment>
                        ) 
                      }}
                    >
                      {categoryChoices.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '18px' }}>
                              {CATEGORY_ICONS[option.value] || "📦"}
                            </Typography>
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      label="Wholesale Price (UGX)" 
                      variant="outlined" 
                      type="number" 
                      fullWidth 
                      required 
                      value={price} 
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                      }}
                      disabled={uploading}
                      error={!!errors.price}
                      helperText={errors.price}
                      inputProps={{ min: 0, step: 100 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      label="Unit Weight (KG)" 
                      variant="outlined" 
                      type="number" 
                      inputProps={{ step: "0.01", min: 0 }}
                      fullWidth 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)} 
                      disabled={uploading}
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
                    <TextField 
                      select 
                      label="Hardware Condition" 
                      value={condition} 
                      onChange={(e) => setCondition(e.target.value)} 
                      fullWidth
                      disabled={uploading}
                    >
                      {conditionChoices.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={option.label} 
                              color={option.color} 
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      label="Stock Count" 
                      variant="outlined" 
                      type="number" 
                      fullWidth 
                      value={stockCount} 
                      onChange={(e) => setStockCount(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                      disabled={uploading} 
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><InventoryIcon color="action" /></InputAdornment> 
                      }}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      select 
                      label="Primary Storage Hub" 
                      value={itemLocation} 
                      onChange={(e) => setItemLocation(e.target.value)} 
                      fullWidth
                      disabled={uploading}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LocationOnIcon color="error" /></InputAdornment>
                      }}
                    >
                      {locationChoices.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={option.region} 
                              size="small" 
                              color={option.region === 'North' ? 'warning' : 'info'}
                              variant="outlined"
                            />
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      label="Contact Hotline" 
                      variant="outlined" 
                      fullWidth 
                      required 
                      value={contactPhone} 
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        if (errors.contactPhone) setErrors(prev => ({ ...prev, contactPhone: '' }));
                      }}
                      disabled={uploading}
                      error={!!errors.contactPhone}
                      helperText={errors.contactPhone}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> 
                      }} 
                      placeholder="e.g., 256770000000" 
                    />
                  </Grid>
                </Grid>

                <TextField 
                  label="Seller Specific Location Details" 
                  variant="outlined" 
                  fullWidth 
                  value={sellerLocationDetails} 
                  onChange={(e) => setSellerLocationDetails(e.target.value)} 
                  disabled={uploading} 
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><LocationOnIcon color="error" /></InputAdornment> 
                  }} 
                  placeholder="e.g., Shop 12, Gulu Main Market Upper Block" 
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  fullWidth 
                  disabled={uploading} 
                  sx={{ 
                    fontWeight: "bold", 
                    py: 1.8, 
                    mt: 2, 
                    fontSize: '16px', 
                    textTransform: 'none', 
                    borderRadius: '8px',
                    background: uploading ? undefined : 'linear-gradient(135deg, #2e7d32, #388e3c)'
                  }}
                >
                  {uploading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} color="inherit" />
                      Publishing to Regional Catalog...
                    </Box>
                  ) : (
                    "🚀 Publish Listing Stock Live"
                  )}
                </Button>

                <Typography variant="caption" color="text.secondary" align="center">
                  By publishing, you agree to our Merchant Terms of Service. Your listing will be visible to all regional buyers within 5 minutes.
                </Typography>
              </Box>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
