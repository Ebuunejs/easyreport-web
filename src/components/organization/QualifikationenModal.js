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

const QualifikationenModal = ({ open, onClose, onSave, editItem }) => {
  const [qualification, setQualification] = useState({ 
    name: '', 
    description: '' 
  });
  
  // Daten bei Änderung des zu bearbeitenden Items aktualisieren
  useEffect(() => {
    if (editItem) {
      setQualification({
        name: editItem.name || '',
        description: editItem.description || ''
      });
    } else {
      setQualification({ name: '', description: '' });
    }
  }, [editItem, open]);
  
  const handleChange = (e) => {
    setQualification({ ...qualification, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    onSave(qualification);
  };
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {editItem ? 'Qualifikation bearbeiten' : 'Neue Qualifikation hinzufügen'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name der Qualifikation"
          fullWidth
          variant="outlined"
          value={qualification.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Beschreibung"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={qualification.description}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QualifikationenModal; 