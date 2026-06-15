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

const BerufeModal = ({ open, onClose, onSave, editItem }) => {
  const [beruf, setBeruf] = useState({ name: '', code: '', description: '' });
  
  // Daten bei Änderung des zu bearbeitenden Items aktualisieren
  useEffect(() => {
    if (editItem) {
      setBeruf({
        name: editItem.name || '',
        code: editItem.code || '',
        description: editItem.description || ''
      });
    } else {
      setBeruf({ name: '', code: '', description: '' });
    }
  }, [editItem, open]);
  
  const handleChange = (e) => {
    setBeruf({ ...beruf, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    onSave(beruf);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editItem ? 'Beruf bearbeiten' : 'Neuer Beruf hinzufügen'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Berufsname"
          fullWidth
          variant="outlined"
          value={beruf.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          margin="dense"
          name="code"
          label="Berufscode"
          fullWidth
          variant="outlined"
          value={beruf.code}
          onChange={handleChange}
          helperText="Eindeutiger Kurzcode für den Beruf (optional)"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Beschreibung"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={beruf.description}
          onChange={handleChange}
          helperText="Detaillierte Beschreibung des Berufs (optional)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!beruf.name.trim()}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BerufeModal; 