import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const BildungsTagModal = ({ open, onClose, onSave, editItem }) => {
  const [bildungsTag, setBildungsTag] = useState({ name: '', description: '' });
  
  // Daten bei Änderung des zu bearbeitenden Items aktualisieren
  useEffect(() => {
    if (editItem) {
      setBildungsTag({
        name: editItem.name || '',
        description: editItem.description || ''
      });
    } else {
      setBildungsTag({ name: '', description: '' });
    }
  }, [editItem, open]);
  
  const handleChange = (e) => {
    setBildungsTag({ ...bildungsTag, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    onSave(bildungsTag);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editItem ? 'Bildungs-Tag bearbeiten' : 'Neuen Bildungs-Tag hinzufügen'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name des Bildungs-Tags"
          fullWidth
          variant="outlined"
          value={bildungsTag.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          margin="dense"
          name="description"
          label="Beschreibung"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={bildungsTag.description}
          onChange={handleChange}
          helperText="Detaillierte Beschreibung des Bildungs-Tags (optional)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!bildungsTag.name.trim()}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BildungsTagModal; 