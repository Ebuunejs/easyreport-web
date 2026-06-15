import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const PhotoCapture = () => {
  const [photos, setPhotos] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const fileInputRef = useRef(null);

  const handleTakePhoto = () => {
    // Für PWA nutzen wir den File Input mit Camera-Attribut
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            timestamp: new Date(),
            file: file
          };
          setPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    event.target.value = '';
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleDownloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `foto_${photo.timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
    link.click();
  };

  return (
    <Box>
      {/* Versteckter File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment" // Rückkamera bevorzugen
        multiple
        onChange={handleFileSelect}
      />

      {/* Foto-Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={<CameraIcon />}
        onClick={handleTakePhoto}
        sx={{ 
          py: 2,
          mb: 2,
          bgcolor: 'info.main',
          '&:hover': {
            bgcolor: 'info.dark'
          }
        }}
      >
        Foto aufnehmen
      </Button>

      {/* Error Message */}
      {cameraError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {cameraError}
        </Alert>
      )}

      {/* Foto-Galerie */}
      {photos.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Aufgenommene Fotos ({photos.length})
          </Typography>
          
          <Grid container spacing={2}>
            {photos.map((photo) => (
              <Grid item xs={6} sm={4} key={photo.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="120"
                    image={photo.url}
                    alt="Aufgenommenes Foto"
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    p: 1
                  }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleDownloadPhoto(photo)}
                      title="Herunterladen"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeletePhoto(photo.id)}
                      title="Löschen"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ px: 1, pb: 1, display: 'block' }}
                    color="text.secondary"
                  >
                    {photo.timestamp.toLocaleTimeString('de-DE')}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {photos.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Noch keine Fotos aufgenommen
        </Typography>
      )}
    </Box>
  );
};

export default PhotoCapture; 