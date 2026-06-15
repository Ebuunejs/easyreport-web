import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  GetApp as GetAppIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import api from '../api/axios';


const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [description, setDescription] = useState('');
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Lade Mitarbeiter beim Komponenten-Mount
  useEffect(() => {
    loadEmployees();
    loadReports();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/public/employees');
      setEmployees(response.data.data || response.data);
      console.log('Mitarbeiter geladen:', response.data.data || response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      setError('Fehler beim Laden der Mitarbeiter: ' + error.message);
    }
  };

  const loadReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.data || response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Berichte:', error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGenerateReport = async () => {
    if (!selectedEmployee || !reportType) {
      setError('Bitte wählen Sie einen Mitarbeiter und einen Berichtstyp aus.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const reportData = {
        employee_id: selectedEmployee,
        report_type: reportType,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        description: description
      };

      const response = await api.post('/reports', reportData);
      
      setSuccess('Bericht erfolgreich generiert!');
      loadReports(); // Lade Berichte neu
      
      // Formular zurücksetzen
      setSelectedEmployee('');
      setReportType('');
      setDescription('');
      
    } catch (error) {
      console.error('Fehler beim Generieren des Berichts:', error);
      setError('Fehler beim Generieren des Berichts: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/preview`);
      setPreviewData(response.data);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Fehler beim Laden der Vorschau:', error);
      setError('Fehler beim Laden der Vorschau');
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      // Erstelle Download-Link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Fehler beim Herunterladen:', error);
      setError('Fehler beim Herunterladen des Berichts');
    }
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      'hours': 'Stundenbericht',
      'vacation': 'Urlaubsbericht',
      'sick_leave': 'Krankheitsbericht',
      'project_summary': 'Projektzusammenfassung',
      'employee_summary': 'Mitarbeiterzusammenfassung'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'generated': 'success',
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'generated': 'Generiert',
      'pending': 'Ausstehend',
      'approved': 'Genehmigt',
      'rejected': 'Abgelehnt'
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Berichte
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Gespeicherte Berichte" />
          <Tab label="Neuen Bericht erstellen" />
        </Tabs>
        
        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mitarbeiter</TableCell>
                  <TableCell>Berichtstyp</TableCell>
                  <TableCell>Zeitraum</TableCell>
                  <TableCell>Erstellt am</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Keine Berichte vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {report.employee?.user ? 
                          `${report.employee.user.name} ${report.employee.user.surname}` : 
                          'Unbekannt'
                        }
                      </TableCell>
                      <TableCell>{getReportTypeLabel(report.report_type)}</TableCell>
                      <TableCell>
                        {report.start_date && report.end_date ? 
                          `${format(new Date(report.start_date), 'dd.MM.yyyy')} - ${format(new Date(report.end_date), 'dd.MM.yyyy')}` :
                          format(new Date(report.report_date), 'dd.MM.yyyy')
                        }
                      </TableCell>
                      <TableCell>
                        {report.generated_at ? 
                          format(new Date(report.generated_at), 'dd.MM.yyyy HH:mm') :
                          format(new Date(report.created_at), 'dd.MM.yyyy HH:mm')
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(report.status)} 
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handlePreview(report.id)}
                            variant="outlined"
                            color="secondary"
                          >
                            Vorschau
                          </Button>
                          {report.pdf_path && (
                            <Button
                              size="small"
                              startIcon={<GetAppIcon />}
                              onClick={() => handleDownload(report.id)}
                              variant="outlined"
                            >
                              PDF
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Mitarbeiter</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Mitarbeiter"
                  startAdornment={<PersonIcon sx={{ mr: 1 }} />}
                  disabled={employees.length === 0}
                >
                  {employees.length === 0 ? (
                    <MenuItem disabled>
                      Keine Mitarbeiter verfügbar
                    </MenuItem>
                  ) : (
                    employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.user ? `${employee.user.name} ${employee.user.surname}` : `Mitarbeiter ${employee.id}`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Berichtstyp</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Berichtstyp"
                >
                  <MenuItem value="hours">Stundenbericht</MenuItem>
                  <MenuItem value="vacation">Urlaubsbericht</MenuItem>
                  <MenuItem value="sick_leave">Krankheitsbericht</MenuItem>
                  <MenuItem value="project_summary">Projektzusammenfassung</MenuItem>
                  <MenuItem value="employee_summary">Mitarbeiterzusammenfassung</MenuItem>
                </Select>
              </FormControl>
              
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <DatePicker
                    label="Startdatum"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: { sx: { mr: 2, flex: 1 } }
                    }}
                  />
                  <DatePicker
                    label="Enddatum"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: { sx: { flex: 1 } }
                    }}
                  />
                </Box>
              </LocalizationProvider>
              
              <TextField
                fullWidth
                label="Beschreibung (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                helperText="Zusätzliche Notizen zum Bericht"
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <DescriptionIcon />}
                onClick={handleGenerateReport}
                disabled={loading || !selectedEmployee || !reportType}
                sx={{ mt: 2 }}
                fullWidth
              >
                {loading ? 'Generiere Bericht...' : 'Bericht generieren'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Berichtsvorschau
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Wählen Sie einen Mitarbeiter und Berichtstyp aus, um einen neuen Bericht zu erstellen.
                </Typography>
                
                {selectedEmployee && reportType && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Ausgewählte Parameter:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Mitarbeiter:</strong> {
                        employees.find(emp => emp.id == selectedEmployee)?.user ? 
                        `${employees.find(emp => emp.id == selectedEmployee).user.name} ${employees.find(emp => emp.id == selectedEmployee).user.surname}` :
                        `Mitarbeiter ${selectedEmployee}`
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Berichtstyp:</strong> {getReportTypeLabel(reportType)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Zeitraum:</strong> {format(startDate, 'dd.MM.yyyy')} - {format(endDate, 'dd.MM.yyyy')}
                    </Typography>
                    {description && (
                      <Typography variant="body2">
                        <strong>Beschreibung:</strong> {description}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {!selectedEmployee && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bitte wählen Sie einen Mitarbeiter aus der Liste aus.
                    </Typography>
                  </Box>
                )}
                
                {selectedEmployee && !reportType && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bitte wählen Sie einen Berichtstyp aus.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Vorschau Modal */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Berichtsvorschau</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewData ? (
            <Box 
              sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 1, 
                p: 2,
                backgroundColor: '#fff',
                minHeight: '500px'
              }}
              dangerouslySetInnerHTML={{ __html: previewData }}
            />
          ) : (
            <Typography>Lade Vorschau...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 