import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CameraAlt as CameraIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ProjectSelector from '../components/ProjectSelector';
import TimeTracker from '../components/TimeTracker';
import PhotoCapture from '../components/PhotoCapture';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTimeTracker } from '../hooks/useTimeTracker';
import employeeAPI from '../services/employeeAPI';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [employee, setEmployee] = useState(null);

  const { location, locationError, requestLocation } = useGeolocation();
  const { 
    isTracking, 
    currentSession, 
    startTracking, 
    stopTracking,
    trackingError,
    isLoading: isTrackingLoading
  } = useTimeTracker();

  // Mitarbeiter-Daten und Projekte laden
  useEffect(() => {
    if (user?.id) {
      loadEmployeeData();
    }
  }, [user?.id]);

  const loadEmployeeData = async () => {
    try {
      setIsLoadingProjects(true);
      
      // Projekte laden - verwende user.id (nicht employee.id!)
      console.log('Lade Projekte für User ID:', user.id);
      const projects = await employeeAPI.getEmployeeProjects(user.id);
      console.log('Geladene Projekte:', projects);
      
      // Mitarbeiter-Daten laden (optional, falls noch benötigt)
      const employeeData = await employeeAPI.getEmployeeByUserId(user.id);
      console.log('Employee Data:', employeeData);
      setEmployee(employeeData);
      
      setAvailableProjects(projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || 'Keine Beschreibung verfügbar',
        color: '#1976d2'
      })));
      
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      setAvailableProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Begrüßungstext basierend auf Tageszeit
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  // Aktuelles Datum formatiert
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartWork = async () => {
    if (!selectedProject) {
      alert('Bitte wählen Sie zuerst ein Projekt aus.');
      return;
    }

    await requestLocation();
    if (location) {
      startTracking(selectedProject, location);
    }
  };

  const handleStopWork = async () => {
    // GPS-Daten beim Stoppen anfordern
    await requestLocation();
    if (location) {
      stopTracking(location);
    } else {
      // Auch ohne GPS-Daten stoppen, aber warnen
      console.warn('Stoppe Zeiterfassung ohne aktuelle GPS-Daten');
      stopTracking();
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2 
    }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" color="primary">
              Mitarbeiter Dashboard
            </Typography>
            <Typography variant="h5" gutterBottom>
              {getGreeting()}, {user?.name || 'Mitarbeiter'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {getCurrentDate()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Status Alerts */}
      {locationError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          GPS-Zugriff erforderlich für die Zeiterfassung. 
          Bitte erlauben Sie den Standortzugriff in Ihrem Browser.
        </Alert>
      )}

      {trackingError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {trackingError}
        </Alert>
      )}

      {/* Aktuelle Zeiterfassung */}
      {isTracking && currentSession && (
        <Paper sx={{ p: 3, mb: 2, borderRadius: 2, bgcolor: 'success.light' }}>
          <TimeTracker session={currentSession} />
        </Paper>
      )}

      {/* Projekt auswählen - jetzt mit echten Daten */}
      {!isTracking && (
        <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Projekt auswählen
          </Typography>
          
          {isLoadingProjects ? (
            <Typography>Lade Projekte...</Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Verfügbare Projekte ({availableProjects.length}):
              </Typography>
              
              <ProjectSelector 
                projects={availableProjects}
                selectedProject={selectedProject}
                onProjectSelect={setSelectedProject}
              />
            </>
          )}
          
          {/* Link für eigenen Projektnamen */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="text" 
              color="primary"
              sx={{ textDecoration: 'underline' }}
            >
              Eigenen Projektnamen eingeben
            </Button>
          </Box>
        </Paper>
      )}

      {/* Zeiterfassung */}
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Zeiterfassung
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="success"
              startIcon={<StartIcon />}
              onClick={handleStartWork}
              disabled={isTracking || !selectedProject}
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Start
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="warning"
              startIcon={<StopIcon />}
              onClick={handleStopWork}
              disabled={!isTracking}
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Ende
            </Button>
          </Grid>
        </Grid>

        {/* Status Information */}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon 
                  color={location ? 'success' : 'disabled'} 
                  fontSize="small" 
                />
                <Typography variant="caption" color="text.secondary">
                  GPS: {location ? 'Aktiv' : 'Inaktiv'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon 
                  color={isTracking ? 'success' : 'disabled'} 
                  fontSize="small" 
                />
                <Typography variant="caption" color="text.secondary">
                  Status: {isTracking ? 'Läuft' : 'Gestoppt'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Fotos */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Fotos
        </Typography>
        
        <PhotoCapture />
      </Paper>
    </Box>
  );
};

export default EmployeeDashboard; 