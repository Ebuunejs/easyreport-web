import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography
} from '@mui/material';

const DokumentTypenModal = ({ open, onClose, onSave, editItem }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editItem) {
            setFormData({
                name: editItem.name || '',
                description: editItem.description || ''
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
        setErrors({});
    }, [editItem, open]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name ist erforderlich';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name muss mindestens 2 Zeichen lang sein';
        }

        if (formData.description.trim().length > 500) {
            newErrors.description = 'Beschreibung darf maximal 500 Zeichen lang sein';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        
        // Fehler für dieses Feld löschen wenn der Benutzer etwas eingibt
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim()
            };
            
            onSave(submitData, editItem?.id);
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle>
                <Typography variant="h6" component="div">
                    {editItem ? 'Dokumenttyp bearbeiten' : 'Neuen Dokumenttyp erstellen'}
                </Typography>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Name"
                        value={formData.name}
                        onChange={handleChange('name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                        placeholder="z.B. Arbeitsvertrag, Zeugnis, etc."
                    />
                    
                    <TextField
                        label="Beschreibung"
                        value={formData.description}
                        onChange={handleChange('description')}
                        error={!!errors.description}
                        helperText={errors.description || `${formData.description.length}/500 Zeichen`}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Optionale Beschreibung des Dokumenttyps..."
                    />
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={handleClose}
                    color="inherit"
                >
                    Abbrechen
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.name.trim()}
                >
                    {editItem ? 'Aktualisieren' : 'Erstellen'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DokumentTypenModal; 