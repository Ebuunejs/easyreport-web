import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import api from '../api/axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseIcon from '@mui/icons-material/Pause';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const ProjectCosts = () => {
  const [costs, setCosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const [statusMenu, setStatusMenu] = useState({ anchorEl: null, cost: null });
  const [filters, setFilters] = useState({
    project_id: '',
    category: '',
    status: '',
    start_date: '',
    end_date: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    cost_date: '',
    invoice_number: '',
    vendor: '',
    project_id: '',
    company_id: '',
    notes: ''
  });

  const categories = [
    'Material',
    'Arbeitszeit',
    'Transport',
    'Ausrüstung',
    'Dienstleistungen',
    'Bürobedarf',
    'Kommunikation',
    'Sonstiges'
  ];

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };

  const statusLabels = {
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt'
  };

  const statusOptions = [
    { key: 'approved', label: statusLabels.approved, icon: <CheckCircleIcon color="success" fontSize="small" /> },
    { key: 'pending', label: statusLabels.pending, icon: <PauseIcon sx={{ color: theme.palette.warning.main }} fontSize="small" /> },
    { key: 'rejected', label: statusLabels.rejected, icon: <HighlightOffIcon color="error" fontSize="small" /> },
  ];

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Token aus localStorage holen
      const authHeader = localStorage.getItem('user-token') || localStorage.getItem('token');
      const axiosConfig = authHeader
        ? { headers: { Authorization: `Bearer ${authHeader}` }, params: filters }
        : { params: filters };

      const [costsRes, projectsRes, companiesRes] = await Promise.all([
        api.get('/project-costs', axiosConfig),
        api.get('/projects', { headers: axiosConfig.headers }),
        api.get('/companies', { headers: axiosConfig.headers })
      ]);

      setCosts(costsRes.data.data || costsRes.data);
      setProjects(projectsRes.data.data || projectsRes.data);
      setCompanies(companiesRes.data.data || companiesRes.data);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      showSnackbar(`Fehler beim Laden der Daten: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (cost = null) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({
        title: cost.title,
        description: cost.description || '',
        amount: cost.amount,
        category: cost.category,
        cost_date: cost.cost_date,
        invoice_number: cost.invoice_number || '',
        vendor: cost.vendor || '',
        project_id: cost.project_id,
        company_id: cost.company_id || '',
        notes: cost.notes || ''
      });
    } else {
      setEditingCost(null);
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: '',
        cost_date: format(new Date(), 'yyyy-MM-dd'),
        invoice_number: '',
        vendor: '',
        project_id: '',
        company_id: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCost(null);
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: '',
      cost_date: '',
      invoice_number: '',
      vendor: '',
      project_id: '',
      company_id: '',
      notes: ''
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingCost ? `/project-costs/${editingCost.id}` : '/project-costs';
      const method = editingCost ? 'put' : 'post';

      const response = await api[method](url, formData);

      if (response.status === 200 || response.status === 201) {
        showSnackbar(
          editingCost ? 'Kosten erfolgreich aktualisiert' : 'Kosten erfolgreich erstellt',
          'success'
        );
        handleCloseDialog();
        fetchData();
      } else {
        showSnackbar('Fehler beim Speichern', 'error');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      showSnackbar('Fehler beim Speichern', 'error');
    }
  };

  const handleDelete = async (costId) => {
    if (!window.confirm('Möchten Sie diese Kosten wirklich löschen?')) {
      return;
    }

    try {
      const response = await api.delete(`/project-costs/${costId}`);

      if (response.status === 200) {
        showSnackbar('Kosten erfolgreich gelöscht', 'success');
        fetchData();
      } else {
        showSnackbar('Fehler beim Löschen', 'error');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      showSnackbar('Fehler beim Löschen', 'error');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getTotalCosts = () => {
    return costs.reduce((total, cost) => {
      return total + (cost.status === 'approved' ? parseFloat(cost.amount) : 0);
    }, 0);
  };

  const getPendingCosts = () => {
    return costs.reduce((total, cost) => {
      return total + (cost.status === 'pending' ? parseFloat(cost.amount) : 0);
    }, 0);
  };

  const cycleStatus = (current) => {
    if (current === 'pending') return 'approved';
    if (current === 'approved') return 'rejected';
    return 'pending';
  };

  const openStatusMenu = (event, cost) => {
    setStatusMenu({ anchorEl: event.currentTarget, cost });
  };

  const closeStatusMenu = () => {
    setStatusMenu({ anchorEl: null, cost: null });
  };

  const handleSelectStatus = async (newStatus) => {
    const cost = statusMenu.cost;
    if (!cost) return;
    try {
      setCosts((prev) => prev.map((c) => c.id === cost.id ? { ...c, status: newStatus } : c));
      await api.put(`/project-costs/${cost.id}`, { status: newStatus });
      showSnackbar(`Status aktualisiert: ${statusLabels[newStatus]}`, 'success');
    } catch (error) {
      console.error('Fehler beim Status-Update:', error);
      showSnackbar('Fehler beim Aktualisieren des Status', 'error');
      fetchData();
    } finally {
      closeStatusMenu();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Projektkosten
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Neue Kosten erfassen
        </Button>
      </Box>

      {/* Statistiken */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Genehmigte Kosten
                  </Typography>
                  <Typography variant="h5">
                    CHF {getTotalCosts().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ausstehende Kosten
                  </Typography>
                  <Typography variant="h5">
                    CHF {getPendingCosts().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CategoryIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Gesamtkosten
                  </Typography>
                  <Typography variant="h5">
                    {costs.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <FormControl fullWidth sx={{ minWidth: 300 }}>
                <InputLabel>Projekt</InputLabel>
                <Select
                  value={filters.project_id}
                  onChange={(e) => handleFilterChange('project_id', e.target.value)}
                  sx={{
                    '& .MuiSelect-select': {
                      minWidth: '280px',
                      width: '100%'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 'auto',
                        minWidth: 350
                      }
                    }
                  }}
                >
                  <MenuItem value="">Alle Projekte</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id} sx={{ minWidth: '320px' }}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  sx={{
                    '& .MuiSelect-select': {
                      minWidth: '180px',
                      width: '100%'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 'auto',
                        minWidth: 250
                      }
                    }
                  }}
                >
                  <MenuItem value="">Alle Kategorien</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category} sx={{ minWidth: '220px' }}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{
                    '& .MuiSelect-select': {
                      minWidth: '130px',
                      width: '100%'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 'auto',
                        minWidth: 200
                      }
                    }
                  }}
                >
                  <MenuItem value="">Alle Status</MenuItem>
                  <MenuItem value="pending" sx={{ minWidth: '180px' }}>Ausstehend</MenuItem>
                  <MenuItem value="approved" sx={{ minWidth: '180px' }}>Genehmigt</MenuItem>
                  <MenuItem value="rejected" sx={{ minWidth: '180px' }}>Abgelehnt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                fullWidth
                label="Von Datum"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                fullWidth
                label="Bis Datum"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Kosten-Tabelle */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titel</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Betrag</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cost.title}
                      </Typography>
                      {cost.description && (
                        <Typography variant="caption" color="textSecondary">
                          {cost.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cost.project?.name || 'Nicht zugewiesen'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cost.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        CHF {parseFloat(cost.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(cost.cost_date), 'dd.MM.yyyy', { locale: de })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Status ändern">
                        <Chip
                          label={statusLabels[cost.status]}
                          size="small"
                          color={statusColors[cost.status]}
                          onClick={(e) => openStatusMenu(e, cost)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cost.vendor || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Bearbeiten">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(cost)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(cost.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Menu
            anchorEl={statusMenu.anchorEl}
            open={Boolean(statusMenu.anchorEl)}
            onClose={closeStatusMenu}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.key} onClick={() => handleSelectStatus(opt.key)}>
                <ListItemIcon>
                  {opt.icon}
                </ListItemIcon>
                <ListItemText>{opt.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </CardContent>
      </Card>

      {/* Dialog für Kosten-Erfassung/Bearbeitung */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCost ? 'Kosten bearbeiten' : 'Neue Kosten erfassen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Titel"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Betrag"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Beschreibung"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Datum"
                type="date"
                value={formData.cost_date}
                onChange={(e) => setFormData({ ...formData, cost_date: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Projekt</InputLabel>
                <Select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Firma</InputLabel>
                <Select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                >
                  <MenuItem value="">Keine Firma</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Rechnungsnummer"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Lieferant/Anbieter"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notizen"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCost ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectCosts;
