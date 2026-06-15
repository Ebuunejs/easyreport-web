import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import deLocale from 'date-fns/locale/de';
import OrganizationService from '../../services/OrganizationService';

const BaustellenModal = ({ open, onClose, onSave, editItem, companies }) => {
  const [projekt, setProjekt] = useState({
    name: '',
    description: '',
    address: '',
    start_date: new Date(),
    end_date: null,
    status: 'active',
    budget: 0,
    normal_working_hours: 8.0,
    max_working_hours: 8.0
  });
  
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Daten bei Änderung des zu bearbeitenden Items aktualisieren
  useEffect(() => {
    const loadData = async () => {
      if (open) {
        setLoading(true);
        
        try {
          // Lade alle Firmen (inklusive Subunternehmen)
          const allCompaniesResponse = await OrganizationService.getAllCompanies();
          setAllCompanies(allCompaniesResponse.data || []);
          
          if (editItem) {
            // Setze die Projektdaten wenn ein Item zum Bearbeiten vorhanden ist
            setProjekt({
              name: editItem.name || '',
              description: editItem.description || '',
              address: editItem.address || '',
              start_date: editItem.start_date ? new Date(editItem.start_date) : null,
              end_date: editItem.end_date ? new Date(editItem.end_date) : null,
              status: editItem.status || 'active',
              budget: parseFloat(editItem.budget) || 0,
              normal_working_hours: parseFloat(editItem.normal_working_hours) || 8.0,
              max_working_hours: parseFloat(editItem.max_working_hours) || 8.0,
            });
            
            // Setze die ausgewählten Firmen basierend auf dem companies Array
            if (editItem.companies && editItem.companies.length > 0) {
              const companyIds = editItem.companies.map(company => company.id);
              setSelectedCompanies(companyIds);
            } else {
              // Fallback: Lade Partnerfirmen über die API
              try {
                const partnerCompaniesResponse = await OrganizationService.getProjectPartnerCompanies(editItem.id);
                const partnerCompanies = partnerCompaniesResponse.data?.data || [];
                setSelectedCompanies(partnerCompanies.map(company => company.id));
              } catch (error) {
                console.error('Fehler beim Laden der Partnerfirmen:', error);
                setSelectedCompanies([]);
              }
            }
          } else {
            // Setze Standardwerte für ein neues Projekt
            setProjekt({ 
              name: '', 
              description: '', 
              address: '',
              start_date: new Date(),
              end_date: null,
              status: 'active',
              budget: 0,
              normal_working_hours: 8.0,
              max_working_hours: 8.0
            });
            setSelectedCompanies([]);
          }
        } catch (error) {
          console.error('Fehler beim Laden der Daten:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [editItem, open]);
  
  const handleChange = (e) => {
    setProjekt({ ...projekt, [e.target.name]: e.target.value });
  };
  
  const handleDateChange = (field, value) => {
    setProjekt({ ...projekt, [field]: value });
  };
  
  const handleToggleCompany = (companyId) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };
  
  const handleSubmit = () => {
    // Formatiere die Daten für den API-Call
    const formattedProject = {
      ...projekt,
      start_date: projekt.start_date ? projekt.start_date.toISOString().split('T')[0] : null,
      end_date: projekt.end_date ? projekt.end_date.toISOString().split('T')[0] : null,
    };
    
    onSave(formattedProject, selectedCompanies);
    console.log("formattedProject", formattedProject);
    console.log("selectedCompanies", selectedCompanies);
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editItem ? 'Baustelle bearbeiten' : 'Neue Baustelle hinzufügen'}
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
          <Box sx={{ mt: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              name="name"
              label="Baustellenname"
              fullWidth
              variant="outlined"
              value={projekt.name}
              onChange={handleChange}
              required
              sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={projekt.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Aktiv</MenuItem>
                <MenuItem value="completed">Abgeschlossen</MenuItem>
                <MenuItem value="on_hold">Pausiert</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="budget"
              label="Budget (Fr.)"
              type="number"
              fullWidth
              variant="outlined"
              value={projekt.budget}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
            />
            
            <TextField
              name="normal_working_hours"
              label="Normale Arbeitszeit (h/Tag)"
              type="number"
              fullWidth
              variant="outlined"
              value={projekt.normal_working_hours}
              onChange={handleChange}
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              helperText="Reguläre Arbeitszeit pro Tag in Stunden"
            />

            <TextField
              name="max_working_hours"
              label="Max. Arbeitszeit (h/Tag)"
              type="number"
              fullWidth
              variant="outlined"
              value={projekt.max_working_hours}
              onChange={handleChange}
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              helperText="Maximale Arbeitszeit pro Tag in Stunden"
            />
            
            <DatePicker
              label="Startdatum"
              value={projekt.start_date}
              onChange={(date) => handleDateChange('start_date', date)}
              sx={{ width: '100%' }}
            />
            
            <DatePicker
              label="Enddatum"
              value={projekt.end_date}
              onChange={(date) => handleDateChange('end_date', date)}
              sx={{ width: '100%' }}
            />
            
            <TextField
              name="address"
              label="Adresse"
              fullWidth
              variant="outlined"
              value={projekt.address}
              onChange={handleChange}
              placeholder="z.B. Musterstrasse 123, 8001 Zürich"
              sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}
            />
            
            <TextField
              name="description"
              label="Beschreibung"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={projekt.description}
              onChange={handleChange}
              sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}
            />
            
            {/* Firmen Tabelle */}
            <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' }, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Firmen für diese Baustelle
              </Typography>
              
              {loading ? (
                <Alert severity="info">Lade Firmen...</Alert>
              ) : allCompanies.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>Name</TableCell>
                        <TableCell>Adresse</TableCell>
                        <TableCell>Stadt</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Typ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allCompanies.map((company) => (
                        <TableRow 
                          key={company.id} 
                          hover
                          onClick={() => handleToggleCompany(company.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedCompanies.includes(company.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleCompany(company.id);
                              }}
                            />
                          </TableCell>
                          <TableCell>{company.name}</TableCell>
                          <TableCell>{company.address || '-'}</TableCell>
                          <TableCell>{company.city || '-'}</TableCell>
                          <TableCell>{company.phone || '-'}</TableCell>
                          <TableCell>
                            {company.subcontractor ? 'Subunternehmen' : 'Hauptfirma'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Keine Firmen verfügbar.</Alert>
              )}
            </Box>
          </Box>
        </LocalizationProvider>
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

export default BaustellenModal; 