import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Translate as TranslateIcon,
  ColorLens as ColorLensIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import api from '../api/axios';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('de');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [companySaveSuccess, setCompanySaveSuccess] = useState('');
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    address: '',
    zip: '',
    city: '',
    email: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setCompanyLoading(true);
        const response = await api.get('/companies');
        const companies = response.data;
        const mainCompany = Array.isArray(companies)
          ? companies.find(c => !c.subcontractor) || companies[0]
          : null;
        if (mainCompany) {
          setCompanyId(mainCompany.id);
          setCompanyInfo({
            name: mainCompany.name || '',
            address: mainCompany.address || '',
            zip: mainCompany.zip || '',
            city: mainCompany.city || '',
            email: mainCompany.email || '',
            phone: mainCompany.phone || '',
            website: mainCompany.website || ''
          });
        }
      } catch (err) {
        setCompanyError('Firmeninformationen konnten nicht geladen werden.');
      } finally {
        setCompanyLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleCompanySave = async () => {
    if (!companyId) return;
    try {
      setCompanySaving(true);
      setCompanyError('');
      await api.post(`/companies/${companyId}`, companyInfo);
      setCompanySaveSuccess('Firmeninformationen erfolgreich gespeichert.');
      setTimeout(() => setCompanySaveSuccess(''), 3000);
    } catch (err) {
      setCompanyError('Fehler beim Speichern der Firmeninformationen.');
    } finally {
      setCompanySaving(false);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.');
      return;
    }
    
    // Hier würde die tatsächliche Passwortänderung stattfinden
    setPasswordError('');
    setSuccess('Passwort erfolgreich geändert!');
    setTimeout(() => {
      setSuccess('');
      setOpenPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Einstellungen
      </Typography>
      
      <Grid container spacing={3}>
        {/* Anzeige & Benachrichtigungen */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Anzeige & Benachrichtigungen
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ColorLensIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Dunkelmodus" 
                  secondary="Ändert das Erscheinungsbild der Anwendung"
                />
                <Switch
                  edge="end"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="E-Mail-Benachrichtigungen" 
                  secondary="Erhalten Sie Benachrichtigungen per E-Mail"
                />
                <Switch
                  edge="end"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <TranslateIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Sprache" 
                  secondary="Wählen Sie die Sprache der Anwendung"
                />
                <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ ml: 2 }}
                  >
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="en">Englisch</MenuItem>
                    <MenuItem value="fr">Französisch</MenuItem>
                    <MenuItem value="it">Italienisch</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            </List>
          </Paper>
          
          {/* Sicherheit */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sicherheit
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Passwort ändern" 
                  secondary="Ändern Sie Ihr Anmeldepasswort"
                />
                <Button 
                  variant="outlined" 
                  onClick={() => setOpenPasswordDialog(true)}
                  size="small"
                >
                  Ändern
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Zwei-Faktor-Authentifizierung" 
                  secondary="Erhöhen Sie die Sicherheit Ihres Kontos"
                />
                <Button 
                  variant="outlined" 
                  size="small"
                >
                  Einrichten
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <BackupIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Datensicherung" 
                  secondary="Sichern oder wiederherstellen Sie Ihre Daten"
                />
                <Button 
                  variant="outlined" 
                  size="small"
                >
                  Backup
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Firmeneinstellungen */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Firmeninformationen
            </Typography>
            {companyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box component="form" sx={{ mt: 2 }}>
                {companyError && <Alert severity="error" sx={{ mb: 2 }}>{companyError}</Alert>}
                {companySaveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{companySaveSuccess}</Alert>}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Firmenname"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                      InputProps={{
                        startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                      InputProps={{
                        startAdornment: <ApartmentIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="PLZ"
                      value={companyInfo.zip}
                      onChange={(e) => setCompanyInfo({...companyInfo, zip: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Ort"
                      value={companyInfo.city}
                      onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-Mail"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                      InputProps={{
                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 1 }}
                      onClick={handleCompanySave}
                      disabled={companySaving}
                    >
                      {companySaving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                      Änderungen speichern
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
          
          {/* Zahlungseinstellungen */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Zahlungseinstellungen
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">
                    Zahlungsmethode
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Kreditkarte (VISA) **** **** **** 4512
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Ändern</Button>
                <Button size="small">Entfernen</Button>
              </CardActions>
            </Card>
            
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<CreditCardIcon />}>
                Neue Zahlungsmethode hinzufügen
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Passwort-Änderungsdialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Passwort ändern</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bitte geben Sie Ihr aktuelles Passwort und danach Ihr neues Passwort ein.
          </DialogContentText>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Aktuelles Passwort"
            type="password"
            fullWidth
            variant="outlined"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Neues Passwort"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Neues Passwort bestätigen"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Abbrechen</Button>
          <Button onClick={handlePasswordChange} variant="contained">Ändern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 