import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Checkbox
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import ExcelImportService from '../../services/ExcelImportService';

const ImportEmployeesModal = ({ open, onClose, onImportComplete, companies }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('Bitte wählen Sie eine Excel-Datei (.xlsx oder .xls)');
      return;
    }

    setFile(selectedFile);
    
    try {
      // Excel-Daten laden und für Bearbeitung vorbereiten
      const excelData = await ExcelImportService.parseExcelFile(selectedFile);
      const employees = ExcelImportService.convertExcelDataToEmployees(excelData);
      
      // Alle Zeilen standardmäßig auswählen
      const allRowIndices = new Set(employees.map((_, index) => index));
      setSelectedRows(allRowIndices);
      
      setPreviewData(employees);
    } catch (error) {
      console.error('Fehler beim Lesen der Excel-Datei:', error);
      alert('Fehler beim Lesen der Excel-Datei: ' + error.message);
      setFile(null);
    }
  };

  const handleEditRow = (index) => {
    setEditingRow(index);
    setEditingData({ ...previewData[index] });
  };

  const handleSaveEdit = () => {
    const updatedData = [...previewData];
    updatedData[editingRow] = { ...editingData };
    setPreviewData(updatedData);
    setEditingRow(null);
    setEditingData(null);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData(null);
  };

  const handleDeleteRow = (index) => {
    const updatedData = previewData.filter((_, i) => i !== index);
    setPreviewData(updatedData);
    
    // Ausgewählte Zeilen aktualisieren
    const newSelectedRows = new Set();
    selectedRows.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelectedRows.add(selectedIndex);
      } else if (selectedIndex > index) {
        newSelectedRows.add(selectedIndex - 1);
      }
    });
    setSelectedRows(newSelectedRows);
  };

  const handleInputChange = (field, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRowSelect = (index) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === previewData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(previewData.map((_, index) => index)));
    }
  };

  const handleImport = async () => {
    if (!previewData || selectedRows.size === 0) return;

    setImporting(true);
    setImportResults(null);

    try {
      // Nur ausgewählte Mitarbeiter importieren
      const selectedEmployees = previewData.filter((_, index) => selectedRows.has(index));
      
      // Company-Mapping erstellen
      const companyMapping = {};
      companies.forEach(company => {
        companyMapping[company.name] = company.id;
      });

      const results = await ExcelImportService.importEmployees(selectedEmployees, companyMapping);
      setImportResults(results);
      
      if (results.success.length > 0) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Import-Fehler:', error);
      setImportResults({
        success: [],
        errors: [{ name: 'Allgemeiner Fehler', error: error.message }]
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setEditingData(null);
    setEditingRow(null);
    setSelectedRows(new Set());
    setImportResults(null);
    setImporting(false);
    onClose();
  };

  const renderEditableCell = (field, value, type = 'text') => {
    if (type === 'select' && field === 'company_name') {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={value || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.name}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        type={type}
        value={value || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        Mitarbeiter aus Excel importieren
      </DialogTitle>
      
      <DialogContent>
        {!file && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Excel-Datei auswählen
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Unterstützte Formate: .xlsx, .xls
            </Typography>
            <Button
              component="label"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Datei auswählen
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        )}

        {file && previewData && !importing && !importResults && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Datenvorschau - {previewData.length} Mitarbeiter gefunden
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedRows.size} von {previewData.length} ausgewählt
                </Typography>
              </Box>
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Überprüfen und bearbeiten Sie die Daten vor dem Import. Sie können einzelne Zeilen bearbeiten oder löschen.
            </Alert>
            
            <TableContainer component={Paper} sx={{ maxHeight: 600, mb: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.size === previewData.length && previewData.length > 0}
                        indeterminate={selectedRows.size > 0 && selectedRows.size < previewData.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Vorname</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Firma</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>AHV-Nr.</TableCell>
                    <TableCell>Eintritt</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((employee, index) => (
                    <TableRow 
                      key={index}
                      selected={selectedRows.has(index)}
                      sx={{ 
                        backgroundColor: editingRow === index ? 'action.hover' : 'inherit'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.has(index)}
                          onChange={() => handleRowSelect(index)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('name', editingData.name) : 
                          employee.name
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('surname', editingData.surname) : 
                          employee.surname
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('email', editingData.email, 'email') : 
                          employee.email
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('position', editingData.position) : 
                          employee.position
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('company_name', editingData.company_name, 'select') : 
                          employee.company_name
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('phone', editingData.phone) : 
                          employee.phone
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('ahv', editingData.ahv) : 
                          employee.ahv
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? 
                          renderEditableCell('hire_date', editingData.hire_date, 'date') : 
                          employee.hire_date
                        }
                      </TableCell>
                      
                      <TableCell>
                        {editingRow === index ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Speichern">
                              <IconButton size="small" onClick={handleSaveEdit} color="primary">
                                <SaveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Abbrechen">
                              <IconButton size="small" onClick={handleCancelEdit}>
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small" onClick={() => handleEditRow(index)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Löschen">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteRow(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Alert severity="warning">
              Alle Mitarbeiter erhalten das temporäre Passwort "TempPass123!" und müssen es beim ersten Login ändern.
            </Alert>
          </Box>
        )}

        {importing && (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom align="center">
              Importiere {selectedRows.size} Mitarbeiter...
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" align="center" color="text.secondary">
              Bitte warten Sie, während die Mitarbeiter importiert werden.
            </Typography>
          </Box>
        )}

        {importResults && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Import-Ergebnisse
            </Typography>
            
            {importResults.success.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="success" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SuccessIcon sx={{ mr: 1 }} />
                    {importResults.success.length} Mitarbeiter erfolgreich importiert
                  </Box>
                </Alert>
                <List dense>
                  {importResults.success.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item.name} />
                      <Chip label="Erfolgreich" color="success" size="small" />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {importResults.errors.length > 0 && (
              <Box>
                <Alert severity="error" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon sx={{ mr: 1 }} />
                    {importResults.errors.length} Fehler beim Import
                  </Box>
                </Alert>
                <List dense>
                  {importResults.errors.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={item.name}
                        secondary={item.error}
                      />
                      <Chip label="Fehler" color="error" size="small" />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {importResults ? 'Schließen' : 'Abbrechen'}
        </Button>
        {file && previewData && !importing && !importResults && (
          <Button 
            onClick={handleImport} 
            variant="contained"
            disabled={selectedRows.size === 0 || editingRow !== null}
            startIcon={<SaveIcon />}
          >
            {selectedRows.size} Mitarbeiter importieren
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportEmployeesModal; 