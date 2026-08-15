import React, { useState, useEffect } from 'react';
import { 
  ImageList, 
  ImageListItem, 
  Typography, 
  CircularProgress, 
  Box, 
  Alert 
} from '@mui/material';
import api from '../api';

const Gallery = () => {
  // Use a clean array initializer to avoid parsing issues
  const [images, setImages] = useState(new Array()); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('api/images/')
      .then(response => {
        // Safe condition structure: replaces broken ternary operators entirely
        if (Array.isArray(response.data)) {
          setImages(response.data);
        } else {
          setImages(new Array());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gallery Fetch failed:", err);
        setError("Could not load gallery images from cloud storage.");
        setLoading(false);
      });
  }, []); // Run exactly once on element layout mounting

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Gallery Showcase
      </Typography>
      
      <ImageList 
        sx={{ width: '100%', height: 'auto', minHeight: 450 }} 
        cols={3} 
        rowHeight={300} 
        gap={12}
      >
        {images.map((item) => (
          <ImageListItem key={item.id}>
            <img
              src={item.image_url} 
              alt={item.title || 'Cloudinary asset'}
              loading="lazy" // Native browser lazy loading optimization
              style={{ 
                height: '100%', 
                width: '100%', 
                objectFit: 'cover', 
                borderRadius: '8px' 
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      {images.length === 0 && (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
          No images available in storage.
        </Typography>
      )}
    </Box>
  );
};

export default Gallery;
