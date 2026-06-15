import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import ContractService from '../services/ContractService';

const ContractModal = ({ 
  open, 
  onClose, 
  onUpload, 
  uploading = false, 
  uploadProgress = 0,
  onProgressUpdate = null 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [employees, setEmployees] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Employees und DocumentTypes laden
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await ContractService.getContractFormData();
        setEmployees(result.employees);
        setDocumentTypes(result.documentTypes);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError('Fehler beim Laden der Formulardaten. Bitte versuchen Sie es erneut.');
      } finally {
        setLoading(false);
      }
    };

      fetchData();
  }, [open]);

  // Mitarbeiter nach Abteilungen gruppieren
  const groupedEmployees = employees.reduce((acc, employee) => {
    const departmentName = employee.department?.name || 'Keine Abteilung';
    if (!acc[departmentName]) {
      acc[departmentName] = [];
    }
    acc[departmentName].push(employee);
    return acc;
  }, {});

  // Formular zurücksetzen
  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedType('');
    setSelectedFile(null);
    setValidFrom('');
    setValidTo('');
    setError(null);
  };

  // Modal schließen
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Datei auswählen
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  // Datei-Icon je nach Dateityp
  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return <PdfIcon />;
    } else if (fileType?.startsWith('image/')) {
      return <ImageIcon />;
    } else {
      return <DocIcon />;
    }
  };

  // Vertrag hochladen
  const handleUpload = async () => {
    // Validation
    if (!selectedEmployee || !selectedType || !selectedFile || !validFrom) {
      setError('Bitte füllen Sie alle erforderlichen Felder aus');
      return;
    }

    // contractData außerhalb des try-catch definieren für besseren Scope
    const contractData = {
      employeeId: selectedEmployee,
      type: selectedType,
      file: selectedFile,
      validFrom,
      validTo
    };

    try {
      setError(null);
      setIsUploading(true);
      setLocalProgress(0);

      console.log('Starte Upload für Vertrag:', {
        mitarbeiter: selectedEmployee,
        dokumenttyp: selectedType,
        dateiname: selectedFile.name,
        dateigröße: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        gültigAb: validFrom,
        gültigBis: validTo || 'Unbefristet'
      });

      // Verwende den Service für den Upload mit Progress-Tracking
      const result = await ContractService.uploadContract(
        contractData,
        (progress) => {
          console.log('Upload Progress:', progress + '%');
          setLocalProgress(progress);
          
          // Informiere Parent-Komponente über Progress
          if (onProgressUpdate) {
            onProgressUpdate(progress);
          }
        }
      );

      console.log('Vertrag erfolgreich in der Datenbank gespeichert:', result);

      // Erfolg an Parent-Komponente weiterleiten
      if (onUpload) {
        onUpload({
          success: true,
          data: result.data,
          message: result.message,
          contractData: {
            ...contractData,
            fileName: selectedFile.name,
            fileSize: selectedFile.size
          }
        });
      }

      // Kurze Erfolgsanzeige bei 100%
      setLocalProgress(100);
      
      // Nach kurzem Delay Modal schließen
      setTimeout(() => {
        resetForm();
        onClose();
        setIsUploading(false);
        setLocalProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Fehler beim Speichern des Vertrags in der DB:', error);
      
      let errorMessage = 'Fehler beim Hochladen des Vertrags. Bitte versuchen Sie es erneut.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Validierungsfehler vom Backend
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsUploading(false);
      setLocalProgress(0);
      
      // Informiere Parent über Fehler
      if (onUpload) {
        onUpload({
          success: false,
          error: errorMessage,
          contractData
        });
      }
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>Vertrag hochladen</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Bitte wählen Sie einen Mitarbeiter und laden Sie den entsprechenden Vertrag hoch.
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="employee-label">Mitarbeiter</InputLabel>
                <Select
                  labelId="employee-label"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Mitarbeiter *"
                >
                  {Object.entries(groupedEmployees).map(([department, departmentEmployees]) => [
                    <MenuItem key={department} disabled divider>
                      <strong>{department}</strong>
                    </MenuItem>,
                    ...departmentEmployees
                      .filter(emp => emp.is_active !== false)
                      .map(emp => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.user ? `${emp.user.surname || ''} ${emp.user.name}`.trim() : `Employee ${emp.id}`}
                        </MenuItem>
                      ))
                  ]).flat()}
                </Select>
              </FormControl>
              
              <FormControl fullWidth required>
                <InputLabel id="contract-type-label">Vertragstyp</InputLabel>
                <Select
                  labelId="contract-type-label"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Vertragstyp *"
                >
                  {documentTypes
                    .filter(type => type.is_active !== false)
                    .map(type => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Gültig ab"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
              />

              <TextField
                label="Gültig bis"
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                helperText="Optional - leer lassen für unbefristete Verträge"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                height: { xs: 'auto', md: '100%' },
                minHeight: { xs: '200px', md: 'auto' },
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
              }}
            >
              {!selectedFile ? (
                <>
                  <UploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
                  <Typography variant="body1" gutterBottom align="center">
                    {isMobile ? 'Tippen zum Hochladen' : 'Ziehen Sie die Datei hierher oder klicken Sie zum Hochladen'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center" gutterBottom>
                    Unterstützte Formate: PDF, DOC, DOCX, JPG, JPEG, PNG
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    Durchsuchen
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </Button>
                </>
              ) : (
                <>
                  {getFileIcon(selectedFile.type)}
                  <Typography variant="body1" sx={{ mt: 2 }} gutterBottom>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setSelectedFile(null)}
                    sx={{ mt: 2 }}
                  >
                    Entfernen
                  </Button>
                </>
              )}
              
              {(isUploading || uploading) && (
                <Box sx={{ width: '100%', mt: 3 }}>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={localProgress || uploadProgress}
                      size={40}
                      color={localProgress === 100 ? "success" : "primary"}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {`${Math.round(localProgress || uploadProgress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    {localProgress === 100 ? 'Upload erfolgreich!' : 'Vertrag wird in der Datenbank gespeichert...'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
        <Button 
          onClick={handleClose} 
          disabled={isUploading || uploading}
        >
          Abbrechen
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained"
          disabled={!selectedEmployee || !selectedType || !selectedFile || !validFrom || isUploading || uploading}
        >
          {isUploading || uploading ? 'Wird hochgeladen...' : 'Hochladen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractModal; 