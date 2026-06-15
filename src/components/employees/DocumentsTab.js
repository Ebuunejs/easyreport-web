import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Alert,
  Box,
  CircularProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import DocumentService from '../../services/DocumentService';

const DocumentsTab = ({ documents = [], loading = false, error = null, onRefresh, employeeId }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [downloading, setDownloading] = useState({});
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de });
    } catch (e) {
      return dateString; // Fallback für ungültige Datumsformate
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeChip = (type) => {
    const typeMap = {
      'application/pdf': { label: 'PDF', color: 'error' },
      'application/zip': { label: 'ZIP', color: 'warning' },
      'application/msword': { label: 'DOC', color: 'info' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', color: 'info' },
      'image/jpeg': { label: 'JPG', color: 'success' },
      'image/png': { label: 'PNG', color: 'success' },
      'text/plain': { label: 'TXT', color: 'default' }
    };

    const fileType = typeMap[type] || { label: type?.split('/')[1]?.toUpperCase() || 'FILE', color: 'default' };
    
    return (
      <Chip 
        label={fileType.label} 
        color={fileType.color} 
        size="small" 
        variant="outlined"
      />
    );
  };

  const getFileIcon = (fileName, type) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (type === 'application/pdf' || extension === 'pdf') {
      return <PdfIcon sx={{ color: 'error.main' }} />;
    } else if (type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <ImageIcon sx={{ color: 'success.main' }} />;
    } else {
      return <FileIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const handleDownload = async (doc) => {
    if (!doc.id) {
      console.error('Dokument hat keine ID für Download');
      return;
    }

    try {
      setDownloading(prev => ({ ...prev, [doc.id]: true }));
      await DocumentService.downloadDocument(doc.id, doc.name);
      console.log('Dokument erfolgreich heruntergeladen:', doc.name);
    } catch (error) {
      console.error('Fehler beim Herunterladen:', error);
      alert('Fehler beim Herunterladen des Dokuments');
    } finally {
      setDownloading(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handleView = (doc) => {
    if (!doc.id) {
      console.error('Dokument hat keine ID für Vorschau');
      return;
    }
    
    setSelectedDocument(doc);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedDocument(null);
  };

  const renderDocumentViewer = (doc) => {
    if (!doc) return null;

    const fileExtension = doc.name?.split('.').pop()?.toLowerCase();
    const isImage = doc.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    const isPdf = doc.type === 'application/pdf' || fileExtension === 'pdf';
    
    if (isPdf) {
      const pdfViewUrl = DocumentService.getViewUrl(doc.id);
      
      return (
        <Box sx={{ height: { xs: '50vh', sm: '70vh' }, position: 'relative' }}>
          <iframe
            src={pdfViewUrl}
            title={doc.name}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            onError={(e) => {
              console.error('PDF loading error:', e);
            }}
          />
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
                onClick={() => handleDownload(doc)}
                sx={{ ml: 1 }}
              >
                Herunterladen
              </Button>
            </Typography>
          </Box>
        </Box>
      );
    } else if (isImage) {
      const imageViewUrl = DocumentService.getViewUrl(doc.id);
      
      return (
        <Box sx={{ textAlign: 'center', p: 2, height: { xs: '50vh', sm: '70vh' }, overflow: 'auto' }}>
          <img 
            src={imageViewUrl} 
            alt={doc.name}
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
              onClick={() => handleDownload(doc)}
              sx={{ mt: 2 }}
            >
              Datei herunterladen
            </Button>
          </Box>
        </Box>
      );
    } else {
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
          {getFileIcon(doc.name, doc.type)}
          <Typography variant="body1" color="text.secondary" align="center">
            Vorschau für {fileExtension?.toUpperCase()}-Dateien nicht verfügbar.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Bitte laden Sie die Datei herunter, um sie zu öffnen.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload(doc)}
            sx={{ mt: 2 }}
          >
            Jetzt herunterladen
          </Button>
        </Box>
      );
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dokumente
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Dokumente werden geladen...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Dokumente ({documents.length})
          </Typography>
          {onRefresh && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
            >
              Aktualisieren
            </Button>
          )}
        </Box>
        
        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {documents.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Typ</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Hochgeladen am</TableCell>}
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Größe</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold' }}>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map(doc => (
                  <TableRow 
                    key={doc.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                      } 
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getFileIcon(doc.name, doc.type)}
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {doc.name}
                          </Typography>
                          {isMobile && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(doc.upload_date)} • {formatFileSize(doc.size)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getFileTypeChip(doc.type)}
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(doc.upload_date)}
                        </Typography>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(doc.size)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleDownload(doc)}
                          disabled={downloading[doc.id]}
                          title="Dokument herunterladen"
                        >
                          {downloading[doc.id] ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DownloadIcon />
                          )}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="secondary"
                          onClick={() => handleView(doc)}
                          title="Dokument anzeigen"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" icon={<DescriptionIcon />}>
            <Typography variant="body1">
              Keine Dokumente vorhanden.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Dokumente wie Arbeitsverträge, Zeugnisse oder andere wichtige Unterlagen 
              werden hier angezeigt, sobald sie hochgeladen wurden.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Dokument-Vorschau Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedDocument && getFileIcon(selectedDocument.name, selectedDocument.type)}
            <Typography variant="h6">
              {selectedDocument?.name || 'Dokument'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedDocument && renderDocumentViewer(selectedDocument)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>
            Schließen
          </Button>
          {selectedDocument && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedDocument)}
              disabled={downloading[selectedDocument.id]}
            >
              {downloading[selectedDocument.id] ? 'Wird heruntergeladen...' : 'Herunterladen'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentsTab; 