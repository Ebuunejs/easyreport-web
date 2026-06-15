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

const KurseModal = ({ open, onClose, onSave, editItem }) => {
  const [course, setCourse] = useState({ name: '', description: '' });
  
  // Daten bei Änderung des zu bearbeitenden Items aktualisieren
  useEffect(() => {
    if (editItem) {
      setCourse({
        name: editItem.name || '',
        description: editItem.description || ''
      });
    } else {
      setCourse({ name: '', description: '' });
    }
  }, [editItem, open]);
  
  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    onSave(course);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editItem ? 'Kurs bearbeiten' : 'Neuen Kurs hinzufügen'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Kursname"
          fullWidth
          variant="outlined"
          value={course.name}
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
          value={course.description}
          onChange={handleChange}
          helperText="Detaillierte Beschreibung des Kurses (optional)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!course.name.trim()}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KurseModal; 