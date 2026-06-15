import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const DeleteEmployeeModal = ({ open, onClose, employee, onDelete }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Mitarbeiter löschen</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Möchten Sie den Mitarbeiter {employee?.name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={onDelete} variant="contained" color="error">
          Löschen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteEmployeeModal; 