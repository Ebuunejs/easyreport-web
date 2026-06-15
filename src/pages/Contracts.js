import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ContractModal from '../components/ContractModal';
import ContractService from '../services/ContractService';
import api from '../api/axios';

const Contracts = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [typeFilter, setTypeFilter] = useState('Alle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [viewPdfDialogOpen, setViewPdfDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractTypes, setContractTypes] = useState([]);
  
  // Neue States für echte DB-Daten
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States für Status-Update
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Theme und Media Queries für Responsive Design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Hilfsfunktion für dynamische View-URL
  const getViewUrl = (contractId) => {
    return `${api.defaults.baseURL}/public/contracts/${contractId}/view`;
  };

  // Verträge aus der Datenbank laden
  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ContractService.getContracts();
      console.log('Geladene Verträge:', result.data);
      
      // Debug: Überprüfe documentType für jeden Vertrag
      result.data.forEach((contract, index) => {
        console.log(`Vertrag ${index + 1}:`, {
          id: contract.id,
          name: contract.name,
          document_type: contract.document_type,
          documentTypeName: contract.document_type?.name,
          employee: contract.employee
        });
      });
      
      setContracts(result.data);
    } catch (error) {
      console.error('Fehler beim Laden der Verträge:', error);
      setError('Fehler beim Laden der Verträge. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Vertragstypen laden
  const loadContractTypes = async () => {
    try {
      const result = await ContractService.getDocumentTypes();
      console.log("Dokumenttypen: ", result);
      setContractTypes(result.data);
    } catch (error) {
      console.error('Fehler beim Laden der Vertragstypen:', error);
    }
  };

  // Daten beim Component-Mount laden
  useEffect(() => {
    loadContracts();
    loadContractTypes();
  }, []);

  // Helper-Funktion: Status basierend auf Gültigkeitsdatum bestimmen
  const getContractStatus = (contract) => {
    if (!contract.valid_until) return 'Aktiv';
    const now = new Date();
    const validUntil = new Date(contract.valid_until);
    return validUntil >= now ? 'Aktiv' : 'Inaktiv';
  };

  // Helper-Funktion: Mitarbeitername extrahieren
  const getEmployeeName = (contract) => {
    if (contract.employee?.user) {
      const { name, surname } = contract.employee.user;
      return `${surname || ''} ${name || ''}`.trim();
    }
    return `Employee ${contract.employee_id}`;
  };
  
  // Formatierung des Datums
  const formatDate = (dateString) => {
    if (!dateString) return 'Unbefristet';
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };
  
  // Helper-Funktion: Vertragstyp anzeigen mit Fallback
  const getContractTypeName = (contract) => {
    // Backend sendet als 'document_type' mit Unterstrich
    if (contract.document_type?.name) {
      return contract.document_type.name;
    }
    
    // Fallback: Versuche aus contractTypes zu matchen
    const documentType = contractTypes.find(type => type.id === contract.document_type_id);
    if (documentType) {
      return documentType.name;
    }
    
    // Last resort: ID anzeigen
    return `Typ ${contract.document_type_id}`;
  };

  // Filterung der Verträge
  const filteredContracts = contracts.filter(contract => {
    const employeeName = getEmployeeName(contract);
    const contractStatus = getContractStatus(contract);
    const contractType = getContractTypeName(contract);
    
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Alle' || contractStatus === statusFilter;
    const matchesType = typeFilter === 'Alle' || contractType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Datei-Icon je nach Dateityp (basierend auf Dateiendung)
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <PdfIcon />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <ImageIcon />;
    } else {
      return <DocIcon />;
    }
  };
  
  // Dialog zum Hinzufügen eines neuen Vertrags öffnen
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  // Dialog schließen
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setUploadProgress(0);
    setUploading(false);
  };
  
  // Vertrag hochladen
  const handleUploadContract = async (result) => {
    console.log('Upload-Ergebnis erhalten:', result);
    
    if (result.success) {
      console.log('Vertrag erfolgreich in DB gespeichert:', result.data);
      console.log('Vertragsdaten:', result.contractData);
      
      alert(`Vertrag erfolgreich hochgeladen!\n\nDatei: ${result.contractData.fileName}\nMitarbeiter: ${result.contractData.employeeId}\nTyp: ${result.contractData.type}`);
      
      // Vertragsliste neu laden nach erfolgreichem Upload
      await loadContracts();
      
    } else {
      console.error('Upload fehlgeschlagen:', result.error);
      alert('Fehler beim Hochladen: ' + result.error);
    }
  };

  // Vertrag herunterladen
  const handleDownloadContract = async (contract) => {
    try {
      console.log('Downloading contract:', contract.name);
      const result = await ContractService.downloadContract(contract.id);
      console.log('Download completed:', result.filename || contract.name);
    } catch (error) {
      console.error('Fehler beim Herunterladen:', error);
      alert('Fehler beim Herunterladen des Vertrags');
    }
  };

  // Vertrag löschen
  const handleDeleteContract = async (contract) => {
    if (window.confirm(`Möchten Sie den Vertrag "${contract.name}" wirklich löschen?`)) {
      try {
        await ContractService.deleteContract(contract.id);
        alert('Vertrag erfolgreich gelöscht');
        await loadContracts(); // Liste neu laden
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Löschen des Vertrags');
      }
    }
  };
  
  // Vertrag anzeigen
  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setViewPdfDialogOpen(true);
  };
  
  // Dialog zum Anzeigen eines Vertrags schließen
  const handleCloseViewDialog = () => {
    setViewPdfDialogOpen(false);
    setSelectedContract(null);
  };

  // Status togglen (direkt zwischen Aktiv/Inaktiv wechseln)
  const handleStatusToggle = async (contract) => {
    try {
      setUpdatingStatus(true);
      
      // Aktuellen Status ermitteln
      const currentStatus = getContractStatus(contract);
      const newStatus = currentStatus === 'Aktiv' ? 'inactive' : 'active';
      
      // Status-Daten für API vorbereiten
      const statusData = { status: newStatus };
      
      // API-Aufruf
      const result = await ContractService.updateContractStatus(contract.id, statusData);
      
      // Lokalen State aktualisieren
      setContracts(prevContracts => 
        prevContracts.map(c => 
          c.id === contract.id 
            ? { ...c, valid_until: result.data.valid_until }
            : c
        )
      );
      
      console.log('Status erfolgreich getoggelt:', result.message);
      
    } catch (error) {
      console.error('Fehler beim Togglen des Status:', error);
      alert('Fehler beim Ändern des Status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Klickbarer Status-Chip Komponente (Toggle-Funktionalität)
  const StatusChip = ({ contract }) => {
    const contractStatus = getContractStatus(contract);
    const isUpdating = updatingStatus;
    
    return (
      <Chip 
        label={contractStatus} 
        color={contractStatus === 'Aktiv' ? 'success' : 'default'} 
        size="small"
        onClick={() => handleStatusToggle(contract)}
        icon={isUpdating ? <CircularProgress size={16} /> : <EditIcon />}
        disabled={isUpdating}
        sx={{ 
          cursor: isUpdating ? 'not-allowed' : 'pointer', 
          '&:hover': { opacity: isUpdating ? 1 : 0.8 },
          '&:disabled': { opacity: 0.6 }
        }}
      />
    );
  };

  // PDF-Viewer für Dialog
  const renderPdfViewer = (contract) => {
    if (!contract) return null;

    const fileExtension = contract.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      // PDF via iframe anzeigen (VIEW Route für Vorschau, nicht Download)
      const pdfViewUrl = getViewUrl(contract.id);
      
      return (
        <Box sx={{ height: { xs: '50vh', sm: '70vh' }, position: 'relative' }}>
          <iframe
            src={pdfViewUrl}
            title={contract.name}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            onError={(e) => {
              console.error('PDF loading error:', e);
            }}
          />
          {/* Fallback für iframe-Probleme */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            p: 1,
            borderRadius: 1
          }}>
            <Typography variant="caption">
              Probleme mit der Vorschau? 
              <Button 
                size="small" 
                color="inherit" 
                onClick={() => handleDownloadContract(contract)}
                sx={{ ml: 1 }}
              >
                Herunterladen
              </Button>
            </Typography>
          </Box>
        </Box>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      // Bild anzeigen (VIEW Route verwenden)
      const imageViewUrl = getViewUrl(contract.id);
      
      return (
        <Box sx={{ textAlign: 'center', p: 2, height: { xs: '50vh', sm: '70vh' }, overflow: 'auto' }}>
          <img 
            src={imageViewUrl} 
            alt={contract.name}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain' 
            }}
            onError={(e) => {
              console.error('Image loading error:', e);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <Box sx={{ display: 'none', mt: 4 }}>
            <Typography variant="body1" color="error">
              Fehler beim Laden des Bildes
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadContract(contract)}
              sx={{ mt: 2 }}
            >
              Datei herunterladen
            </Button>
          </Box>
        </Box>
      );
    } else {
      // Andere Dateiformate
      return (
        <Box sx={{ 
          height: { xs: '50vh', sm: '70vh' }, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          bgcolor: '#f5f5f5',
          gap: 2
        }}>
          <DocIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary" align="center">
            Vorschau für {fileExtension?.toUpperCase()}-Dateien nicht verfügbar.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Bitte laden Sie die Datei herunter, um sie zu öffnen.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadContract(contract)}
            sx={{ mt: 2 }}
          >
            Jetzt herunterladen
          </Button>
        </Box>
      );
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        Verträge
      </Typography>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filterleiste - responsive */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 2 
      }}>
        <TextField
          placeholder="Suchen..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
        
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="Alle">Alle</MenuItem>
            <MenuItem value="Aktiv">Aktiv</MenuItem>
            <MenuItem value="Inaktiv">Inaktiv</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel id="type-filter-label">Vertragstyp</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Vertragstyp"
          >
            <MenuItem value="Alle">Alle Typen</MenuItem>
            {contractTypes.map(type => (
              <MenuItem key={type.id} value={type.name}>{type.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{ 
            ml: { sm: 'auto' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Vertrag hochladen
        </Button>
      </Paper>
      
      {/* Loading Indicator */}
      {loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Verträge werden geladen...</Typography>
        </Paper>
      ) : (
        <>
          {/* Vertragstabelle für Desktop und Tablet */}
          {!isMobile && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mitarbeiter</TableCell>
                    <TableCell>Vertragstyp</TableCell>
                    <TableCell>Gültig ab</TableCell>
                    {!isTablet && <TableCell>Gültig bis</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell>Datei</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const contractStatus = getContractStatus(contract);
                    const employeeName = getEmployeeName(contract);
                    const contractTypeName = getContractTypeName(contract);
                    
                    return (
                      <TableRow key={contract.id}>
                        <TableCell>{employeeName}</TableCell>
                        <TableCell>{contractTypeName}</TableCell>
                        <TableCell>{formatDate(contract.valid_from)}</TableCell>
                        {!isTablet && <TableCell>{formatDate(contract.valid_until)}</TableCell>}
                        <TableCell>
                          <StatusChip contract={contract} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getFileIcon(contract.name)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {contract.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Anzeigen">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewContract(contract)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Herunterladen">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleDownloadContract(contract)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Löschen">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteContract(contract)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredContracts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Keine Verträge gefunden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Kartenansicht für Mobile */}
          {isMobile && (
            <Stack spacing={2}>
              {filteredContracts.map((contract) => {
                const contractStatus = getContractStatus(contract);
                const employeeName = getEmployeeName(contract);
                const contractTypeName = getContractTypeName(contract);
                
                return (
                  <Card key={contract.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{employeeName}</Typography>
                      
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Vertragstyp</Typography>
                          <Typography variant="body2">{contractTypeName}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Box>
                            <StatusChip contract={contract} />
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Gültig ab</Typography>
                          <Typography variant="body2">{formatDate(contract.valid_from)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Gültig bis</Typography>
                          <Typography variant="body2">{formatDate(contract.valid_until)}</Typography>
                        </Grid>
                      </Grid>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">Datei</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getFileIcon(contract.name)}
                            <Typography variant="body2" sx={{ ml: 1, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                              {contract.name}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewContract(contract)}
                      >
                        Anzeigen
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadContract(contract)}
                      >
                        Herunterladen
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteContract(contract)}
                      >
                        Löschen
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
              {filteredContracts.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Keine Verträge gefunden</Typography>
                </Paper>
              )}
            </Stack>
          )}
        </>
      )}

      {/* ContractModal für das Hochladen neuer Verträge */}
      <ContractModal
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onUpload={handleUploadContract}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />
      
      {/* Dialog zum Anzeigen eines Vertrags */}
      <Dialog
        open={viewPdfDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedContract?.name}
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            &times;
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {renderPdfViewer(selectedContract)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Schließen</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => selectedContract && handleDownloadContract(selectedContract)}
          >
            Herunterladen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contracts; 