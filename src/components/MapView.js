import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Button,
  IconButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  WorkOutline as ProjectIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import locationService from '../services/locationService';
import projectService from '../services/projectService';

// Leaflet CSS wird über index.css importiert

// Fix für Leaflet-Icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Material-UI Icons als Leaflet DivIcons
const createMaterialIcon = (IconComponent, color, backgroundColor = 'white') => {
  const iconHtml = renderToString(
    <div style={{
      backgroundColor: backgroundColor,
      border: `3px solid ${color}`,
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }}>
      <IconComponent style={{ color: color, fontSize: '24px' }} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const companyIcon = createMaterialIcon(BusinessIcon, '#1976d2');
const employeeIcon = createMaterialIcon(PersonIcon, '#4caf50');

const MapView = ({ employees = [], weekTimeLogs = [], onRefresh }) => {
  const [companyAddress, setCompanyAddress] = useState({
    lat: 47.3769, // Zürich als Standard
    lng: 8.5417,
    address: 'Bahnhofstrasse 1, 8001 Zürich'
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('individual');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [radius, setRadius] = useState(50); // Radius in Metern
  const [showRadius, setShowRadius] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [showEmployeeLocations, setShowEmployeeLocations] = useState(true);

  // Projekte laden
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectsData = await projectService.getProjects();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Extrahiere echte Mitarbeiterstandorte aus weekTimeLogs
  const employeeLocations = React.useMemo(() => {
    const locationMap = new Map();
    
    // Verarbeite alle TimeLog-Einträge
    weekTimeLogs.forEach(timeLog => {
      if (timeLog.start_latitude && timeLog.start_longitude && timeLog.employee_id) {
        // Suche den entsprechenden Mitarbeiter
        const employee = employees.find(emp => emp.id === timeLog.employee_id);
        if (employee) {
          const employeeName = employee.user ? 
            (employee.user.surname ? 
              `${employee.user.surname} ${employee.user.name}` : 
              employee.user.name
            ) : 
            `Mitarbeiter ${employee.id}`;
          
          const key = `${timeLog.employee_id}`;
          const lat = parseFloat(timeLog.start_latitude);
          const lng = parseFloat(timeLog.start_longitude);
          
          // Verwende nur gültige Koordinaten
          if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            // Wenn bereits ein Eintrag für diesen Mitarbeiter existiert, nimm den neueren
            const existingEntry = locationMap.get(key);
            const currentDate = new Date(timeLog.date);
            
            if (!existingEntry || currentDate > existingEntry.timestamp) {
              locationMap.set(key, {
                employeeId: timeLog.employee_id,
                name: employeeName,
                lat: lat,
                lng: lng,
                timestamp: currentDate,
                accuracy: timeLog.start_accuracy ? parseFloat(timeLog.start_accuracy) : null,
                timeLogId: timeLog.id,
                isWithinRadius: false // Wird später berechnet
              });
            }
          }
        }
      }
    });
    
    return Array.from(locationMap.values());
  }, [weekTimeLogs, employees]);

  // Berechne Entfernung zwischen zwei Punkten
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Erdradius in Metern
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Aktualisiere isWithinRadius für alle Mitarbeiterstandorte
  const employeeLocationsWithRadius = React.useMemo(() => {
    return employeeLocations.map(emp => ({
      ...emp,
      isWithinRadius: calculateDistance(
        companyAddress.lat, 
        companyAddress.lng, 
        emp.lat, 
        emp.lng
      ) <= radius
    }));
  }, [employeeLocations, companyAddress, radius]);

  // Filtere Mitarbeiterstandorte basierend auf Auswahl
  const filteredEmployeeLocations = selectedEmployee === 'all' 
    ? employeeLocationsWithRadius 
    : employeeLocationsWithRadius.filter(emp => emp.employeeId.toString() === selectedEmployee);

  // Adresse basierend auf Projektauswahl aktualisieren
  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    
    if (projectId === 'individual') {
      // Individuelle Adresse - zurück zu Standard-Adresse
      setCompanyAddress({
        lat: 47.3769,
        lng: 8.5417,
        address: 'Bahnhofstrasse 1, 8001 Zürich'
      });
    } else if (projectId) {
      // Projekt ausgewählt - verwende Projektadresse
      const project = projects.find(p => p.id === projectId);
      if (project && project.address) {
        try {
          const result = await locationService.geocodeAddress(project.address);
          setCompanyAddress({
            lat: result.lat,
            lng: result.lng,
            address: project.address
          });
        } catch (error) {
          console.error('Fehler beim Geocoding der Projektadresse:', error);
          // Fallback auf Projektadresse als Text
          setCompanyAddress(prev => ({
            ...prev,
            address: project.address
          }));
        }
      }
    }
  };

  // Adresse geocodieren
  const handleAddressChange = (newAddress) => {
    setCompanyAddress(prev => ({
      ...prev,
      address: newAddress
    }));
  };

  // Adresse geocodieren und Karte aktualisieren
  const handleGeocodeAddress = async () => {
    try {
      const result = await locationService.geocodeAddress(companyAddress.address);
      setCompanyAddress(prev => ({
        ...prev,
        lat: result.lat,
        lng: result.lng,
        address: result.display_name || prev.address
      }));
    } catch (error) {
      console.error('Geocoding fehlgeschlagen:', error);
      alert('Adresse konnte nicht gefunden werden. Bitte überprüfen Sie die Eingabe.');
    }
  };

  // Refresh-Handler
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Daten:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Box>
      {/* Steuerungsbereich */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Karteneinstellungen
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
          >
            {refreshing ? 'Aktualisiere...' : 'Aktualisieren'}
          </Button>
        </Box>
        
        <Grid container spacing={3} alignItems="flex-end">
          {/* Erste Reihe - Projektauswahl (viel breiter) */}
          <Grid item xs={12} sm={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Standort auswählen</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                label="Standort auswählen"
                disabled={loadingProjects}
                startAdornment={<ProjectIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="individual">
                  🏢 Individuelle Adresse eingeben
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    🏗️ {project.name} {project.address && `- ${project.address}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Adressfeld nur bei individueller Adresse */}
          {selectedProject === 'individual' && (
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Individuelle Adresse"
                  value={companyAddress.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleGeocodeAddress();
                    }
                  }}
                />
                <IconButton 
                  onClick={handleGeocodeAddress}
                  size="small"
                  color="primary"
                  title="Adresse suchen"
                  sx={{ mt: 0 }}
                >
                  <SearchIcon />
                </IconButton>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={selectedProject === 'individual' ? 3 : 6}>
            <FormControl fullWidth size="small">
              <InputLabel>Mitarbeiter anzeigen</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Mitarbeiter anzeigen"
              >
                <MenuItem value="all">Alle Mitarbeiter</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id.toString()}>
                    {emp.user ? 
                      (emp.user.surname ? 
                        `${emp.user.surname} ${emp.user.name}` : 
                        emp.user.name
                      ) : 
                      'Unbekannt'
                    }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Zweite Zeile - Radius und Switches */}
        <Grid container spacing={3} alignItems="center" sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                Radius: {radius}m
              </Typography>
              <Slider
                value={radius}
                onChange={(e, newValue) => setRadius(newValue)}
                min={10}
                max={200}
                step={10}
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showRadius}
                    onChange={(e) => setShowRadius(e.target.checked)}
                    size="small"
                  />
                }
                label="Radius anzeigen"
                sx={{ mr: 0 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showEmployeeLocations}
                    onChange={(e) => setShowEmployeeLocations(e.target.checked)}
                    size="small"
                  />
                }
                label="Mitarbeiter anzeigen"
                sx={{ mr: 0 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Zusätzliche Informationen bei Projektauswahl */}
        {selectedProject && selectedProject !== 'individual' && (
          <Alert severity="info" sx={{ mt: 2, mb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ProjectIcon fontSize="small" />
              <Typography variant="body2">
                Ausgewähltes Projekt: <strong>{projects.find(p => p.id === selectedProject)?.name}</strong>
                {projects.find(p => p.id === selectedProject)?.description && 
                  ` - ${projects.find(p => p.id === selectedProject)?.description}`
                }
              </Typography>
            </Box>
          </Alert>
        )}
      </Paper>

      {/* Informationen über Datenquelle */}
      {filteredEmployeeLocations.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Angezeigt werden die GPS-Koordinaten aus den Zeiterfassungen der aktuellen Woche. 
          Standorte basieren auf den Startpositionen der letzten Zeiterfassungen der Mitarbeiter.
        </Alert>
      )}

      {/* Kompakte Statistiken */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="h6">
                  {filteredEmployeeLocations.length}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Mit GPS-Daten
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={4} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <LocationIcon color="success" fontSize="small" />
                <Typography variant="h6">
                  {filteredEmployeeLocations.filter(emp => emp.isWithinRadius).length}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Im Radius
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={4} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <LocationIcon color="error" fontSize="small" />
                <Typography variant="h6">
                  {filteredEmployeeLocations.filter(emp => !emp.isWithinRadius).length}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Außerhalb Radius
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Karte */}
      <Paper sx={{ height: '600px', overflow: 'hidden' }}>
        <MapContainer
          center={[companyAddress.lat, companyAddress.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Firmenstandort */}
          <Marker 
            position={[companyAddress.lat, companyAddress.lng]} 
            icon={companyIcon}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedProject ? (
                    <>
                      <ProjectIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Projektstandort
                    </>
                  ) : (
                    <>
                      <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Standort
                    </>
                  )}
                </Typography>
                <Typography variant="body2">
                  {companyAddress.address}
                </Typography>
                {selectedProject && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Projekt: {projects.find(p => p.id === selectedProject)?.name}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
          
          {/* Radius-Kreis */}
          {showRadius && (
            <Circle
              center={[companyAddress.lat, companyAddress.lng]}
              radius={radius}
              pathOptions={{
                color: '#1976d2',
                fillColor: '#1976d2',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          )}
          
          {/* Mitarbeiterstandorte */}
          {showEmployeeLocations && filteredEmployeeLocations.map((emp) => (
            <Marker
              key={emp.employeeId}
              position={[emp.lat, emp.lng]}
              icon={employeeIcon}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {emp.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Zeiterfassung vom: {emp.timestamp.toLocaleDateString('de-DE')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Koordinaten: {emp.lat.toFixed(6)}, {emp.lng.toFixed(6)}
                  </Typography>
                  {emp.accuracy && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      GPS-Genauigkeit: ±{Math.round(emp.accuracy)}m
                    </Typography>
                  )}
                  <Chip
                    label={emp.isWithinRadius ? 'Im Arbeitsbereich' : 'Außerhalb Arbeitsbereich'}
                    color={emp.isWithinRadius ? 'success' : 'error'}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Entfernung: {Math.round(calculateDistance(
                      companyAddress.lat, 
                      companyAddress.lng, 
                      emp.lat, 
                      emp.lng
                    ))}m
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>

      {/* Mitarbeiterliste */}
      {filteredEmployeeLocations.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Mitarbeiter-Standorte
          </Typography>
          <Grid container spacing={2}>
            {filteredEmployeeLocations.map((emp) => (
              <Grid item xs={12} md={6} lg={4} key={emp.employeeId}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {emp.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {emp.timestamp.toLocaleDateString('de-DE')} um {emp.timestamp.toLocaleTimeString('de-DE')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Koordinaten: {emp.lat.toFixed(6)}, {emp.lng.toFixed(6)}
                    </Typography>
                    {emp.accuracy && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Genauigkeit: ±{Math.round(emp.accuracy)}m
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={emp.isWithinRadius ? 'Im Bereich' : 'Außerhalb'}
                        color={emp.isWithinRadius ? 'success' : 'error'}
                        size="small"
                      />
                      <Typography variant="caption">
                        {Math.round(calculateDistance(
                          companyAddress.lat, 
                          companyAddress.lng, 
                          emp.lat, 
                          emp.lng
                        ))}m
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default MapView; 