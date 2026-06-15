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

const KurseModal = ({ open, onClose, onSave, editItem, departments }) => {
  const [position, setPosition] = useState({ name: '', department_id: '' });
  
  // Daten bei Änderung des zu bearbeitenden Items aktualisieren
  useEffect(() => {
    if (editItem) {
      setPosition({
        name: editItem.name || '',
        department_id: editItem.department_id || ''
      });
    } else {
      setPosition({ name: '', department_id: '' });
    }
  }, [editItem, open]);
  
  const handleChange = (e) => {
    setPosition({ ...position, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    onSave(position);
  };
  
  return (
    <Dialog open={open} onClose={onClose}>
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
          value={position.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          margin="dense"
          name="department_id"
          label="Beruf"
          fullWidth
          variant="outlined"
          value={position.department_id}
          onChange={handleChange}
          SelectProps={{
            native: true,
          }}
        >
          <option value="">Bitte wählen</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </TextField>
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

export default KurseModal; 