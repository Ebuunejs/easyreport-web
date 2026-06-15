import React, { useEffect, useState } from 'react';
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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  Avatar,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CloudUpload as UploadIcon,
  Business as BusinessIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import api from '../api/axios';
import { API_URL } from '../config';
import config from '../config';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
//// Verwendung der backendUrl
const BASE_URL = config.backendUrl;

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    website: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    status: true,
    logo: null,
    token: '',
    isSubcompany: false,
    subcontractor: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainCompanies, setMainCompanies] = useState([]);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const addMenuOpen = Boolean(addMenuAnchor);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
      
      // Filtern der Hauptfirmen (ohne 'subcontractor' Wert)
      const mainComps = res.data.filter(company => !company.subcontractor);
      setMainCompanies(mainComps);
    } catch (error) {
      setSnackbar({ open: true, message: 'Fehler beim Laden der Subunternehmer.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCompany({
      name: '',
      email: '',
      website: '',
      phone: '',
      address: '',
      zip: '',
      city: '',
      status: true,
      logo: null,
      token: '',
      isSubcompany: false,
      subcontractor: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    setNewCompany((prev) => ({ ...prev, logo: e.target.files[0] }));
  };

  const handleStatusChange = (id, value) => {
    // Status-Änderung (optional: API-Aufruf)
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: value } : c))
    );
  };

  const handleIsSubcompanyChange = (e) => {
    setNewCompany((prev) => ({ 
      ...prev, 
      isSubcompany: e.target.checked,
      subcontractor: e.target.checked ? prev.subcontractor : null
    }));
  };

  const handleSubcontractorChange = (e) => {
    setNewCompany((prev) => ({ ...prev, subcontractor: e.target.value }));
  };

  const handleAddCompany = async () => {
    try {
      const formData = new FormData();
      
      // Alle Felder außer isSubcompany (das ist nur für die UI)
      Object.entries(newCompany).forEach(([key, value]) => {
        if (key === 'status') {
          formData.append('status', value ? '1' : '0');
        } else if (key === 'isSubcompany') {
          // Überspringen, da dies nur im Frontend verwendet wird
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      await api.post('/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnackbar({ open: true, message: 'Subunternehmen erfolgreich hinzugefügt.', severity: 'success' });
      handleCloseDialog();
      fetchCompanies();
    } catch (error) {
      setSnackbar({ open: true, message: 'Fehler beim Hinzufügen.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Wirklich löschen?')) return;
    try {
      await api.delete(`/companies/${id}`);
      setSnackbar({ open: true, message: 'Subunternehmen gelöscht.', severity: 'success' });
      fetchCompanies();
    } catch (error) {
      setSnackbar({ open: true, message: 'Fehler beim Löschen.', severity: 'error' });
    }
  };

  const handleEditClick = (company) => {
    setEditCompany({
      ...company,
      isSubcompany: company.subcontractor !== null
    });
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditLogoChange = (e) => {
    setEditCompany((prev) => ({ ...prev, logo: e.target.files[0] }));
  };

  const handleEditIsSubcompanyChange = (e) => {
    setEditCompany((prev) => ({ 
      ...prev, 
      isSubcompany: e.target.checked,
      subcontractor: e.target.checked ? prev.subcontractor : null
    }));
  };

  const handleEditSubcontractorChange = (e) => {
    setEditCompany((prev) => ({ ...prev, subcontractor: e.target.value }));
  };

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      
      // Alle Felder außer isSubcompany (das ist nur für die UI)
      Object.entries(editCompany).forEach(([key, value]) => {
        if (key === 'status') {
          formData.append('status', value ? '1' : '0');
        } else if (key === 'isSubcompany' || key === 'employee_count' || key === 'employees') {
          // Überspringen, da diese nur im Frontend verwendet werden
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Wenn die Firma kein Subunternehmen mehr sein soll, setze subcontractor auf null
      if (!editCompany.isSubcompany) {
        formData.append('subcontractor', '');
      }
      
      await api.post(`/companies/${editCompany.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnackbar({ open: true, message: 'Subunternehmen erfolgreich bearbeitet.', severity: 'success' });
      setEditDialogOpen(false);
      setEditCompany(null);
      fetchCompanies();
    } catch (error) {
      setSnackbar({ open: true, message: 'Fehler beim Bearbeiten.', severity: 'error' });
    }
  };

  const handleAddMenuClick = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddMainCompany = () => {
    setNewCompany({
      ...newCompany,
      isSubcompany: false,
      subcontractor: null
    });
    setOpenDialog(true);
    handleAddMenuClose();
  };

  const handleAddSubcompany = () => {
    setNewCompany({
      ...newCompany,
      isSubcompany: true
    });
    setOpenDialog(true);
    handleAddMenuClose();
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        Firmen
      </Typography>
      
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Firma suchen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: { xs: 1.5, sm: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              endIcon={<ArrowDownIcon />}
              onClick={handleAddMenuClick}
              aria-controls={addMenuOpen ? 'add-company-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={addMenuOpen ? 'true' : undefined}
            >
              {isMobile ? 'Neue Firma' : 'Neue Firma hinzufügen'}
            </Button>
            <Menu
              id="add-company-menu"
              anchorEl={addMenuAnchor}
              open={addMenuOpen}
              onClose={handleAddMenuClose}
              MenuListProps={{
                'aria-labelledby': 'add-button',
              }}
            >
              <MenuItem onClick={handleAddMainCompany}>Firma hinzufügen</MenuItem>
              <MenuItem onClick={handleAddSubcompany}>Subunternehmen hinzufügen</MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }} aria-label="Firmentabelle">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableCell width="50px"></TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Firmenname</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Typ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Adresse</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>E-Mail</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mitarbeiter</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <TableRow 
                  key={company.id}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: theme.palette.action.hover }
                  }}
                  onClick={() => setSelectedCompany(company)}
                >
                  <TableCell>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'white',
                        width: 36, 
                        height: 36
                      }}
                      alt={company.name}
                      src={company.logo ? `${BASE_URL}${company.logo}` : null}
                    >
                     {company.name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {company.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {company.subcontractor ? (
                      <Box>
                        <Chip 
                          label="Subunternehmen" 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          von: {
                            companies.find(c => c.id === company.subcontractor)?.name || 
                            'Unbekannte Hauptfirma'
                          }
                        </Typography>
                      </Box>
                    ) : (
                      <Chip 
                        label="Hauptfirma" 
                        size="small" 
                        color="primary" 
                        sx={{ backgroundColor: theme.palette.success.main }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {company.address ? (
                      <Typography variant="body2">
                        {company.address}
                        {company.zip || company.city ? (
                          <>, {company.zip} {company.city}</>
                        ) : null}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.email ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">{company.email}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.phone ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">{company.phone}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {company.employee_count || '0'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Bearbeiten">
                      <IconButton onClick={() => handleEditClick(company)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton onClick={() => handleDelete(company.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    Keine Firmen gefunden
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog zum Hinzufügen - mit klarem Toggle-Button */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {newCompany.isSubcompany ? 'Subunternehmen hinzufügen' : 'Firma hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Toggle für Subunternehmen - prominent positioniert */}
            <FormControlLabel
              control={
                <Switch
                  checked={newCompany.isSubcompany}
                  onChange={handleIsSubcompanyChange}
                  color="primary"
                  size="medium"
                />
              }
              label={<Typography variant="subtitle1" fontWeight="medium">Subunternehmen erstellen</Typography>}
              sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: 1, 
                backgroundColor: newCompany.isSubcompany ? 'rgba(25, 118, 210, 0.08)' : 'transparent' 
              }}
            />

            {newCompany.isSubcompany && (
              <FormControl fullWidth>
                <InputLabel id="main-company-label">Hauptfirma</InputLabel>
                <Select
                  labelId="main-company-label"
                  id="main-company-select"
                  value={newCompany.subcontractor || ''}
                  label="Hauptfirma"
                  onChange={handleSubcontractorChange}
                  required
                >
                  {mainCompanies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Logo hochladen
              <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
            </Button>
            {newCompany.logo && (
              <Avatar
                src={URL.createObjectURL(newCompany.logo)}
                alt="Logo"
                sx={{ width: 56, height: 56 }}
              />
            )}
            <TextField name="name" label="Name" value={newCompany.name} onChange={handleInputChange} fullWidth required />
            <TextField name="email" label="E-Mail" value={newCompany.email} onChange={handleInputChange} fullWidth />
            <TextField name="website" label="WWW" value={newCompany.website} onChange={handleInputChange} fullWidth />
            <TextField name="phone" label="Telefon" value={newCompany.phone} onChange={handleInputChange} fullWidth />
            <TextField name="address" label="Adresse" value={newCompany.address} onChange={handleInputChange} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField name="zip" label="PLZ" value={newCompany.zip} onChange={handleInputChange} fullWidth />
              <TextField name="city" label="Ort" value={newCompany.city} onChange={handleInputChange} fullWidth />
            </Box>
            <TextField name="token" label="Token" value={newCompany.token} onChange={handleInputChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button 
            onClick={handleAddCompany} 
            variant="contained"
            disabled={newCompany.isSubcompany && !newCompany.subcontractor}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zum Bearbeiten - mit klarem Toggle-Button */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editCompany?.isSubcompany ? 'Subunternehmen bearbeiten' : 'Firma bearbeiten'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Toggle für Subunternehmen - prominent positioniert */}
            <FormControlLabel
              control={
                <Switch
                  checked={editCompany?.isSubcompany || false}
                  onChange={handleEditIsSubcompanyChange}
                  color="primary"
                  size="medium"
                />
              }
              label={<Typography variant="subtitle1" fontWeight="medium">Subunternehmen</Typography>}
              sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: 1, 
                backgroundColor: editCompany?.isSubcompany ? 'rgba(25, 118, 210, 0.08)' : 'transparent' 
              }}
            />

            {editCompany?.isSubcompany && (
              <FormControl fullWidth>
                <InputLabel id="edit-main-company-label">Hauptfirma</InputLabel>
                <Select
                  labelId="edit-main-company-label"
                  id="edit-main-company-select"
                  value={editCompany?.subcontractor || ''}
                  label="Hauptfirma"
                  onChange={handleEditSubcontractorChange}
                  required
                >
                  {mainCompanies.map((company) => (
                    <MenuItem 
                      key={company.id} 
                      value={company.id}
                      disabled={company.id === editCompany?.id} // Verhindere Selbstreferenzierung
                    >
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Logo hochladen
              <input type="file" hidden accept="image/*" onChange={handleEditLogoChange} />
            </Button>
            {editCompany?.logo && typeof editCompany.logo === 'object' ? (
              <Avatar src={URL.createObjectURL(editCompany.logo)} alt="Logo" sx={{ width: 56, height: 56 }} />
            ) : editCompany?.logo ? (
              <Avatar src={typeof editCompany.logo === 'string' ? `${BASE_URL}${editCompany.logo}` : editCompany.logo} alt="Logo" sx={{ width: 56, height: 56 }} />
            ) : null}
            <TextField name="name" label="Name" value={editCompany?.name || ''} onChange={handleEditInputChange} fullWidth required />
            <TextField name="email" label="E-Mail" value={editCompany?.email || ''} onChange={handleEditInputChange} fullWidth />
            <TextField name="website" label="WWW" value={editCompany?.website || ''} onChange={handleEditInputChange} fullWidth />
            <TextField name="phone" label="Telefon" value={editCompany?.phone || ''} onChange={handleEditInputChange} fullWidth />
            <TextField name="address" label="Adresse" value={editCompany?.address || ''} onChange={handleEditInputChange} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField name="zip" label="PLZ" value={editCompany?.zip || ''} onChange={handleEditInputChange} fullWidth />
              <TextField name="city" label="Ort" value={editCompany?.city || ''} onChange={handleEditInputChange} fullWidth />
            </Box>
            <TextField name="token" label="Token" value={editCompany?.token || ''} onChange={handleEditInputChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained"
            disabled={editCompany?.isSubcompany && !editCompany?.subcontractor}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {selectedCompany && (
        <CompanyDetail company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
    </Box>
  );
};

const CompanyDetail = ({ company, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentCompany, setParentCompany] = useState(null);
  const [subcompanies, setSubcompanies] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!company || !company.id) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/companies/${company.id}/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyRelations = async () => {
      if (!company || !company.id) return;
      
      setLoadingRelations(true);
      try {
        // Lade Hauptfirma, falls es ein Subunternehmen ist
        if (company.subcontractor) {
          const parentResponse = await api.get(`/companies/${company.subcontractor}`);
          setParentCompany(parentResponse.data);
        }
        
        // Lade Subunternehmen, falls vorhanden
        const subResponse = await api.get(`/companies/${company.id}/subcompanies`);
        if (subResponse.data && subResponse.data.data) {
          setSubcompanies(subResponse.data.data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Firmenbeziehungen:', error);
      } finally {
        setLoadingRelations(false);
      }
    };

    fetchEmployees();
    fetchCompanyRelations();
  }, [company]);

  return (
    <Dialog open={!!company} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{company?.name} – Details</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Stammdaten" />
          <Tab label="Mitarbeiter" />
          <Tab label="Verträge" />
          <Tab label="Firmenbeziehungen" />
        </Tabs>
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1">Typ: {company.subcontractor ? 'Subunternehmen' : 'Hauptfirma'}</Typography>
            <Typography variant="subtitle1">E-Mail: {company.email}</Typography>
            <Typography variant="subtitle1">Telefon: {company.phone}</Typography>
            <Typography variant="subtitle1">Adresse: {company.address}, {company.zip} {company.city}</Typography>
            <Typography variant="subtitle1">Token: {company.token}</Typography>
          </Box>
        )}
        {activeTab === 1 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Mitarbeiter</Typography>
              <Button variant="contained">Mitarbeiter hinzufügen</Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length > 0 ? (
                    employees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.user?.name || emp.name || '-'}</TableCell>
                        <TableCell>{emp.user?.email || emp.email || '-'}</TableCell>
                        <TableCell>{emp.position || '-'}</TableCell>
                        <TableCell>
                          <Button size="small">Bearbeiten</Button>
                          <Button size="small" color="error">Löschen</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Keine Mitarbeiter gefunden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}
        {activeTab === 2 && (
          <Box>
            <Typography>Verträge-Tab (hier können Verträge angezeigt werden)</Typography>
          </Box>
        )}
        {activeTab === 3 && (
          <Box>
            {loadingRelations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {company.subcontractor && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>Hauptfirma</Typography>
                      {parentCompany ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ bgcolor: 'white' }}
                            src={parentCompany.logo ? `${BASE_URL}${parentCompany.logo}` : null}
                          >
                            {parentCompany.name.charAt(0)}
                          </Avatar>
                          <Typography>{parentCompany.name}</Typography>
                        </Box>
                      ) : (
                        <Typography color="text.secondary">Keine Hauptfirma gefunden</Typography>
                      )}
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Subunternehmen</Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<AddIcon />}
                      >
                        Subunternehmen hinzufügen
                      </Button>
                    </Box>
                    
                    {subcompanies.length > 0 ? (
                      <Grid container spacing={2}>
                        {subcompanies.map(sub => (
                          <Grid item xs={12} sm={6} md={4} key={sub.id}>
                            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar 
                                sx={{ bgcolor: 'white', width: 32, height: 32 }}
                                src={sub.logo ? `${BASE_URL}${sub.logo}` : null}
                              >
                                {sub.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">{sub.name}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary">Keine Subunternehmen vorhanden</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Companies; 