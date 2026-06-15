import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Divider, 
  Card, 
  CardContent, 
  CardActions, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SubcontractorProjects = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projectEmployees, setProjectEmployees] = useState([]);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    surname: '',
    email: '',
    position: '',
    phone: '',
    address: '',
    plz: '',
    place: '',
    birth: '',
    civil: '',
    idform: '',
    nationality: '',
    hire_date: '',
    idexpirity: '',
    password: '',
    checkPassword: '',
    employee_number: '',
  });
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lade alle Projekte des Subunternehmers
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Annahme: Es gibt einen Endpunkt, der alle Projekte zurückgibt, an denen der Subunternehmer beteiligt ist
        const response = await api.get(`/subcontractor/projects/${user.id}`);
        setProjects(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Projekte:', err);
        setError('Projekte konnten nicht geladen werden.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Lade alle Mitarbeiter des Subunternehmers
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user || !user.id) return;
      
      try {
        // Zuerst den aktuellen Mitarbeiter laden, um die company_id zu erhalten
        const employeeResponse = await api.get(`/employees/by-user/${user.id}`);
        const companyId = employeeResponse.data.company_id;

        // Dann alle Mitarbeiter dieser Firma laden
        const response = await api.get(`/companies/${companyId}/employees`);
        console.log("response", response.data);
        setEmployees(response.data || []);
      } catch (err) {
        console.error('Fehler beim Laden der Mitarbeiter:', err);
      }
    };

    fetchEmployees();
  }, [user]);

  // Lade Projektmitarbeiter wenn ein Projekt ausgewählt wurde
  useEffect(() => {
    const fetchProjectEmployees = async () => {
      if (selectedProject) {
        try {
          const response = await api.get(`/subcontractor/projects/${selectedProject.id}/employees`);
          console.log('Projektmitarbeiter-Antwort:', response.data);
          // Stelle sicher, dass immer ein Array gesetzt wird
          const employees = Array.isArray(response.data) ? response.data : 
                           (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
          console.log('Projektmitarbeiter-Array:', employees);
          setProjectEmployees(employees);
        } catch (err) {
          console.error('Fehler beim Laden der Projektmitarbeiter:', err);
          setProjectEmployees([]);
        }
      } else {
        setProjectEmployees([]);
      }
    };

    fetchProjectEmployees();
  }, [selectedProject]);

  // Lade Dokumente eines bestimmten Mitarbeiters
  const fetchEmployeeDocuments = async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}/documents`);
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Dokumente:', err);
    }
  };

  // Projektauswahl ändern
  const handleProjectChange = (event) => {
    const projectId = event.target.value;
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
  };

  // Dialog zum Hinzufügen eines neuen Mitarbeiters öffnen
  const handleOpenEmployeeDialog = () => {
    setNewEmployee({
      name: '',
      surname: '',
      email: '',
      position: '',
      phone: '',
      address: '',
      plz: '',
      place: '',
      birth: '',
      civil: '',
      idform: '',
      nationality: '',
      hire_date: '',
      idexpirity: '',
      password: '',
      checkPassword: '',
      employee_number: '',
    });
    setOpenEmployeeDialog(true);
  };

  // Dialog zum Hinzufügen eines neuen Mitarbeiters schließen
  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };

  // Dialog zum Hochladen von Dokumenten öffnen
  const handleOpenDocumentDialog = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeDocuments(employee.id);
    setOpenDocumentDialog(true);
  };

  // Dialog zum Hochladen von Dokumenten schließen
  const handleCloseDocumentDialog = () => {
    setSelectedEmployee(null);
    setSelectedFile(null);
    setDocumentType('');
    setUploadProgress(0);
    setOpenDocumentDialog(false);
  };

  // Änderungen am neuen Mitarbeiter verfolgen
  const handleEmployeeChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value
    });
  };

  // Neuen Mitarbeiter erstellen
  const handleCreateEmployee = async () => {
    if (newEmployee.password !== newEmployee.checkPassword) {
      alert('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (!newEmployee.password) {
      alert('Bitte geben Sie ein Passwort ein.');
      return;
    }

    try {
      // checkPassword-Feld entfernen, da es nicht in die Datenbank gespeichert werden soll
      const { checkPassword, ...employeeData } = newEmployee;
      
      let response;
      
      if (selectedProject) {
        // Wenn ein Projekt ausgewählt ist: Mitarbeiter erstellen und direkt dem Projekt zuweisen
        response = await api.post(`/subcontractor/projects/${selectedProject.id}/employees`, employeeData);
        console.log('Mitarbeiter erstellt und Projekt zugewiesen:', response.data);
        
        // Aktualisiere die Listen
        setEmployees([...employees, response.data]);
        
        // Lade die Projektmitarbeiter neu
        const projectResponse = await api.get(`/subcontractor/projects/${selectedProject.id}/employees`);
        // Stelle sicher, dass immer ein Array gesetzt wird
        const projectEmployeeList = Array.isArray(projectResponse.data) ? projectResponse.data : 
                        (projectResponse.data && Array.isArray(projectResponse.data.data)) ? projectResponse.data.data : [];
        setProjectEmployees(projectEmployeeList);
      } else {
        // Kein Projekt ausgewählt: Nur Mitarbeiter erstellen
        response = await api.post('/subcontractor/employees', employeeData);
        setEmployees([...employees, response.data]);
      }
      
      handleCloseEmployeeDialog();
    } catch (err) {
      console.error('Fehler beim Erstellen des Mitarbeiters:', err);
      alert('Mitarbeiter konnte nicht erstellt werden.');
    }
  };

  // Mitarbeiter zum Projekt hinzufügen
  const handleAddEmployeeToProject = async (employeeId) => {
    if (!selectedProject) return;
    
    try {
      // Verwende die neue Subcontractor-Route zum Hinzufügen eines Mitarbeiters
      const response0 = await api.post(`/subcontractor/projects/${selectedProject.id}/assign-employee`, { employee_id: employeeId });
      console.log("Mitarbeiter zum Projekt hinzugefügt:", response0.data);

      // Aktualisiere die Liste der Projektmitarbeiter
      const response = await api.get(`/subcontractor/projects/${selectedProject.id}/employees`);
      // Stelle sicher, dass immer ein Array gesetzt wird
      const employees = Array.isArray(response.data) ? response.data : 
                       (response.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setProjectEmployees(employees);
    } catch (err) {
      console.error('Fehler beim Hinzufügen des Mitarbeiters zum Projekt:', err);
      alert('Mitarbeiter konnte nicht zum Projekt hinzugefügt werden.');
    }
  };

  // Mitarbeiter vom Projekt entfernen
  const handleRemoveEmployeeFromProject = async (employeeId) => {
    if (!selectedProject) return;
    
    try {
      await api.delete(`/projects/${selectedProject.id}/employees/${employeeId}`);
      // Aktualisiere die Liste der Projektmitarbeiter
      setProjectEmployees(projectEmployees.filter(e => e.id !== employeeId));
    } catch (err) {
      console.error('Fehler beim Entfernen des Mitarbeiters vom Projekt:', err);
      alert('Mitarbeiter konnte nicht vom Projekt entfernt werden.');
    }
  };

  // Datei für Upload auswählen
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Dokument hochladen
  const handleUploadDocument = async () => {
    if (!selectedEmployee || !selectedFile || !documentType) {
      alert('Bitte wählen Sie einen Mitarbeiter, eine Datei und einen Dokumenttyp aus.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', documentType);

    try {
      await api.post(`/employees/${selectedEmployee.id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Aktualisiere die Dokumente
      fetchEmployeeDocuments(selectedEmployee.id);
      setSelectedFile(null);
      setDocumentType('');
      setUploadProgress(0);
    } catch (err) {
      console.error('Fehler beim Hochladen des Dokuments:', err);
      alert('Dokument konnte nicht hochgeladen werden.');
    }
  };

  // Dokument löschen
  const handleDeleteDocument = async (documentId) => {
    try {
      await api.delete(`/documents/${documentId}`);
      // Aktualisiere die Dokumente
      fetchEmployeeDocuments(selectedEmployee.id);
    } catch (err) {
      console.error('Fehler beim Löschen des Dokuments:', err);
      alert('Dokument konnte nicht gelöscht werden.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="medium">
          Projektverwaltung
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
          Projekt auswählen
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Projekt</InputLabel>
          <Select
            value={selectedProject ? selectedProject.id : ''}
            onChange={handleProjectChange}
            label="Projekt"
          >
            <MenuItem value="">
              <em>Bitte wählen</em>
            </MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProject && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#f8f9fa', 
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Beschreibung
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedProject.description || 'Keine Beschreibung verfügbar'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  label={selectedProject.status} 
                  color={selectedProject.status === 'active' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 'medium' }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Zeitraum
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(selectedProject.start_date).toLocaleDateString()} - 
                  {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'unbefristet'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {selectedProject && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Projektmitarbeiter
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonIcon />}
              onClick={handleOpenEmployeeDialog}
            >
              Neuer Mitarbeiter
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
                  Verfügbare Mitarbeiter
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {employees
                    .filter(e => {
                      if (!Array.isArray(projectEmployees)) {
                        return true;
                      }
                      return !projectEmployees.some(pe => pe.id === e.id);
                    })
                    .map(employee => (
                      <Card key={employee.id} sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {employee.user.name}
                                {' '}
                                {employee.user.surname}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {employee.position}
                              </Typography>
                            </Box>
                            <Button 
                              variant="outlined" 
                              size="small"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddEmployeeToProject(employee.id)}
                              sx={{ ml: 2, flexShrink: 0 }}
                            >
                              Hinzufügen
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  {employees
                    .filter(e => {
                      if (!Array.isArray(projectEmployees)) {
                        return true;
                      }
                      return !projectEmployees.some(pe => pe.id === e.id);
                    })
                    .length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography variant="body1">Keine weiteren Mitarbeiter verfügbar</Typography>
                      </Box>
                    )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
                  Zugewiesene Mitarbeiter
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {projectEmployees.map(employee => (
                    <Card key={employee.id} sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {employee.user?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {employee.position}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, flexShrink: 0 }}>
                            <IconButton 
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDocumentDialog(employee)}
                              sx={{ mr: 1 }}
                            >
                              <CloudUploadIcon />
                            </IconButton>
                            <IconButton 
                              color="error"
                              size="small"
                              onClick={() => handleRemoveEmployeeFromProject(employee.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  {projectEmployees.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body1">Keine Mitarbeiter zugewiesen</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Dialog zum Erstellen eines neuen Mitarbeiters */}
      <Dialog open={openEmployeeDialog} onClose={handleCloseEmployeeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            {selectedProject 
              ? `Neuen Mitarbeiter anlegen und Projekt "${selectedProject.name}" zuweisen` 
              : "Neuen Mitarbeiter anlegen"}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Vorname"
                fullWidth
                variant="outlined"
                value={newEmployee.name}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="surname"
                label="Nachname"
                fullWidth
                variant="outlined"
                value={newEmployee.surname}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="E-Mail"
                type="email"
                fullWidth
                variant="outlined"
                value={newEmployee.email}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="position"
                label="Position"
                fullWidth
                variant="outlined"
                value={newEmployee.position}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Telefon"
                fullWidth
                variant="outlined"
                value={newEmployee.phone}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="address"
                label="Adresse"
                fullWidth
                variant="outlined"
                value={newEmployee.address}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="plz"
                label="PLZ"
                fullWidth
                variant="outlined"
                value={newEmployee.plz}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="place"
                label="Ort"
                fullWidth
                variant="outlined"
                value={newEmployee.place}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="birth"
                label="Geburtsdatum"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEmployee.birth}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="civil"
                label="Zivilstand"
                fullWidth
                variant="outlined"
                value={newEmployee.civil}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="idform"
                label="Ausweistyp"
                fullWidth
                variant="outlined"
                value={newEmployee.idform}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="nationality"
                label="Nationalität"
                fullWidth
                variant="outlined"
                value={newEmployee.nationality}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="hire_date"
                label="Einstellungsdatum"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEmployee.hire_date}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="idexpirity"
                label="Ablaufdatum ID"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newEmployee.idexpirity}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="employee_number"
                label="Mitarbeiter-Nummer"
                fullWidth
                variant="outlined"
                value={newEmployee.employee_number}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="password"
                label="Passwort"
                type="password"
                fullWidth
                variant="outlined"
                value={newEmployee.password}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="checkPassword"
                label="Passwort bestätigen"
                type="password"
                fullWidth
                variant="outlined"
                value={newEmployee.checkPassword}
                onChange={handleEmployeeChange}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleCloseEmployeeDialog} 
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreateEmployee} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 1 }}
            disabled={!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.checkPassword || !newEmployee.employee_number}
          >
            {selectedProject ? 'Erstellen & Zuweisen' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zum Hochladen und Verwalten von Dokumenten */}
      <Dialog open={openDocumentDialog} onClose={handleCloseDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Dokumente für {selectedEmployee?.user?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Neues Dokument hochladen
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel>Dokumenttyp</InputLabel>
                  <Select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    label="Dokumenttyp"
                  >
                    <MenuItem value="">
                      <em>Bitte wählen</em>
                    </MenuItem>
                    <MenuItem value="identity">Ausweis</MenuItem>
                    <MenuItem value="work_permit">Arbeitserlaubnis</MenuItem>
                    <MenuItem value="qualification">Qualifikation</MenuItem>
                    <MenuItem value="insurance">Versicherung</MenuItem>
                    <MenuItem value="certificate">Zertifikat</MenuItem>
                    <MenuItem value="other">Sonstiges</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  Datei wählen
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUploadDocument}
                  disabled={!selectedFile || !documentType}
                  fullWidth
                >
                  Hochladen
                </Button>
              </Grid>
              {uploadProgress > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">{`${Math.round(uploadProgress)}%`}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom>
            Vorhandene Dokumente
          </Typography>
          
          {documents.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Typ</TableCell>
                    <TableCell>Dateiname</TableCell>
                    <TableCell>Hochgeladen am</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Chip 
                          label={doc.document_type} 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>{doc.file_name}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Keine Dokumente vorhanden</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocumentDialog}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubcontractorProjects; 