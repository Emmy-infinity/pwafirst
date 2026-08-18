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

export default function ProductFormUploader() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  // ─── Form fields ──────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('USED');
  const [category, setCategory] = useState(''); // will hold category ID
  const [location, setLocation] = useState(''); // will hold location ID
  const [stockCount, setStockCount] = useState(1);
  const [sellerLocationDetails, setSellerLocationDetails] = useState('');
  const [weight, setWeight] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // ─── Image upload ─────────────────────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // ─── Dynamic categories & locations ──────────────────────────
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // ─── Fetch categories and locations ──────────────────────────
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('api/categories/'),
          api.get('api/locations/')
        ]);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);
        // Set default first values if available
        if (catRes.data.length) setCategory(catRes.data[0].id);
        if (locRes.data.length) setLocation(locRes.data[0].id);
      } catch (err) {
        console.error("Failed to load categories/locations:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // ─── Condition choices (still hardcoded – they are model choices) ──
  const conditionChoices = [
    { value: 'NEW', label: 'Brand New / Sealed' },
    { value: 'REFURB', label: 'Refurbished / Tested' },
    { value: 'USED', label: 'Used / Working' },
    { value: 'SCRAP', label: 'Scrap / For Spare Parts' },
  ];

  // ─── Validation ────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Product title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price || parseFloat(price) <= 0) newErrors.price = "Price must be a positive number";
    if (!contactPhone.trim()) newErrors.contactPhone = "Contact phone is required";
    if (!category) newErrors.category = "Please select a category";
    if (!location) newErrors.location = "Please select a location";
    if (selectedFiles.length === 0) newErrors.images = "Please upload at least one image";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Image handlers ────────────────────────────────────────────
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

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/upload' } });
      return;
    }
    if (!validateForm()) {
      setStatusMessage({ type: 'error', text: 'Please fix the errors highlighted below.' });
      return;
    }

    setUploading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", String(parseFloat(price)));
      formData.append("condition", condition);
      formData.append("category", String(category)); // send ID
      formData.append("location", String(location)); // send ID
      formData.append("stock_count", String(Math.max(1, parseInt(stockCount, 10) || 1)));
      if (sellerLocationDetails.trim()) {
        formData.append("seller_location_details", sellerLocationDetails.trim());
      }
      if (weight && parseFloat(weight) > 0) {
        formData.append("weight", String(parseFloat(weight)));
      }
      formData.append("contact_phone", contactPhone.trim());

      selectedFiles.forEach((file) => {
        formData.append("image", file);
      });

      await api.post("api/products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
        }
      });

      setStatusMessage({ type: 'success', text: `🎉 Product "${title}" published successfully!` });
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setWeight('');
      setSellerLocationDetails('');
      setContactPhone('');
      setStockCount(1);
      imagePreviews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
      setSelectedFiles([]);
      setImagePreviews([]);
      if (categories.length) setCategory(categories[0].id);
      if (locations.length) setLocation(locations[0].id);

      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      let errorMsg = "Something went wrong. Please check your inputs.";
      if (err.response) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const errorsList = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMsg = errorsList || errorMsg;
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
        if (err.response.status === 401) {
          errorMsg = "Your session has expired. Please login again.";
        }
      }
      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  // ─── Not authenticated view ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: '650px', mx: 'auto', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: '16px', textAlign: 'center', backgroundColor: '#fff' }}>
          <Alert severity="warning" variant="filled" icon={<LoginIcon />} sx={{ mb: 3, borderRadius: '12px' }}>
            Authentication Required
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            You need to sign in to list products on Northern Market.
          </Typography>
          <Button variant="contained" color="success" onClick={() => navigate('/login', { state: { from: '/upload' } })} sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '8px', px: 4 }}>
            Sign In Now
          </Button>
        </Paper>
      </Box>
    );
  }

  // ─── Loading config ────────────────────────────────────────────
  if (loadingConfig) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', boxSizing: 'border-box', maxWidth: '1300px', mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2, fontWeight: 'bold', textTransform: 'none' }} disabled={uploading}>
        Back to Marketplace
      </Button>
      
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: "16px", border: "1px solid #eaeaea", backgroundColor: "#fff" }}>
        <Typography variant="h4" sx={{ fontWeight: "900", mb: 1, letterSpacing: "-0.5px" }}>
          List a New Product
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the details below to publish your item.
        </Typography>

        {statusMessage.text && <Alert severity={statusMessage.type} sx={{ mb: 4, borderRadius: '8px' }}>{statusMessage.text}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            
            {/* ─── Image upload section ─────────────────────────────── */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#555', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  Product Images ({selectedFiles.length}/10)
                </Typography>
                
                <Paper variant="outlined" sx={{ borderRadius: '16px', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', p: 2.5, border: errors.images ? '2px dashed #d32f2f' : '2px dashed #ccc' }}>
                  {imagePreviews.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 2, width: '100%' }}>
                      {imagePreviews.map((url, idx) => (
                        <Box key={idx} sx={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eaeaea', bgcolor: '#fff' }}>
                          <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <IconButton size="small" onClick={() => handleRemoveImage(idx)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#ffebee', color: '#d32f2f' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#aaa', mb: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>Drop or select images</Typography>
                      {errors.images && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, fontWeight: 'bold' }}>{errors.images}</Typography>}
                    </Box>
                  )}
                </Paper>

                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} color={errors.images ? "error" : "success"} sx={{ p: 1.6, fontWeight: "bold", textTransform: "none", borderRadius: "10px", borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}>
                  Choose Images
                  <input type="file" accept="image/*" multiple hidden onChange={handleMultiFileChange} disabled={uploading} />
                </Button>
              </Box>
            </Grid>

            {/* ─── Product details ───────────────────────────────────── */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#555', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  Product Details
                </Typography>

                <TextField error={Boolean(errors.title)} helperText={errors.title} label="Product Title" size="small" variant="outlined" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading} />
                <TextField error={Boolean(errors.description)} helperText={errors.description} label="Description" size="small" variant="outlined" multiline rows={3} fullWidth required value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Category"
                      size="small"
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); if (errors.category) setErrors(prev => ({ ...prev, category: '' })); }}
                      fullWidth
                      error={Boolean(errors.category)}
                      helperText={errors.category}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField error={Boolean(errors.price)} helperText={errors.price} label="Price (UGX)" size="small" variant="outlined" type="number" fullWidth required value={price} onChange={(e) => setPrice(e.target.value)} disabled={uploading} />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Condition"
                      size="small"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      fullWidth
                    >
                      {conditionChoices.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Location"
                      size="small"
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); if (errors.location) setErrors(prev => ({ ...prev, location: '' })); }}
                      fullWidth
                      error={Boolean(errors.location)}
                      helperText={errors.location}
                    >
                      {locations.map(loc => (
                        <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Stock Count" size="small" variant="outlined" type="number" fullWidth value={stockCount} onChange={(e) => setStockCount(Math.max(1, parseInt(e.target.value, 10) || 1))} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><InventoryIcon color="action" /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField error={Boolean(errors.contactPhone)} helperText={errors.contactPhone} label="Contact Phone" size="small" variant="outlined" fullWidth required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }} placeholder="e.g., 256770000000" />
                  </Grid>
                </Grid>

                <TextField label="Seller Location Details" variant="outlined" size="small" fullWidth value={sellerLocationDetails} onChange={(e) => setSellerLocationDetails(e.target.value)} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="error" /></InputAdornment> }} placeholder="e.g., Shop 12, Gulu Main Market" />

                <TextField label="Weight (kg)" variant="outlined" size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} disabled={uploading} InputProps={{ startAdornment: <InputAdornment position="start"><ScaleIcon /></InputAdornment> }} placeholder="e.g., 2.5" />

                <Button type="submit" variant="contained" color="success" size="large" fullWidth disabled={uploading} sx={{ fontWeight: "bold", py: 1.8, mt: 1, fontSize: '16px', textTransform: 'none', borderRadius: '8px' }}>
                  {uploading ? <CircularProgress size={24} color="inherit" /> : "📦 Publish Listing"}
                </Button>
              </Box>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
