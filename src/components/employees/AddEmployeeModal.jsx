import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  ListItemText,
  Grid,
  Typography,
  Divider,
  Paper,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  useTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Chip,
  ListSubheader
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Close as CloseIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  EventNote as EventNoteIcon,
  Badge as BadgeIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import CourseService from '../../services/CourseService';

// Gemeinsame Stil-Definitionen für Auswahlfelder
const selectStyles = {
  minWidth: '100%',
  '& .MuiSelect-select': { 
    paddingRight: '32px'
  },
  '& .MuiInputLabel-outlined': {
    width: 'auto',
    overflow: 'visible',
    fontWeight: 500
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.23)'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.87)'
  }
};

const labelStyles = { 
  whiteSpace: 'nowrap', 
  fontWeight: 500,
  fontSize: '0.9rem'
};

const AddEmployeeModal = ({ 
  open, 
  onClose, 
  newEmployee, 
  handleInputChange, 
  handleProjectChange, 
  handleAddEmployee, 
  companies, 
  projects,
  professions,
  bildungsTags = []
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  
  const steps = [
    'Persönliche Daten',
    'Arbeitsinformationen',
    'Kontaktdaten',
    'Zusatzinformationen',
    'Qualifikationen & Kurse'
  ];

  const [courses, setCourses] = useState([]);
  
  // State für ausgewählte Kurse mit Beschreibungen (im gleichen Format wie EditEmployeeModal)
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  // Lade Kurse, wenn das Modal geöffnet wird – und setze Stepper immer auf Schritt 1 zurück
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      const fetchCourses = async () => {
        try {
          const response = await CourseService.getAllCourses();
          setCourses(response.data || []);
        } catch (error) {
          console.error('Fehler beim Laden der Kurse:', error);
          setCourses([]);
        }
      };

      fetchCourses();
    }
  }, [open]);

  // Initialisiere oder aktualisiere selectedCourses, wenn newEmployee sich ändert
  useEffect(() => {
    if (newEmployee && newEmployee.course_ids && newEmployee.course_ids.length > 0) {
      // Nur aktualisieren, wenn selectedCourses leer ist oder sich course_ids geändert hat
      const hasSelectedCourses = selectedCourses.length > 0;
      
      // Prüfe, ob die IDs unterschiedlich sind (nicht nur Reihenfolge, sondern tatsächlich andere IDs)
      const selectedCourseIds = selectedCourses.map(course => course.id);
      const hasDifferentIds = newEmployee.course_ids.some(id => !selectedCourseIds.includes(id)) || 
                              selectedCourseIds.some(id => !newEmployee.course_ids.includes(id));
      
      if (!hasSelectedCourses || hasDifferentIds) {
        // Wir verwenden vorhandene courseNotes oder initialisieren mit dem Standardwert
        const courseNotes = newEmployee.course_notes || {};
        
        const coursesArray = newEmployee.course_ids.map(id => {
          // Stelle sicher, dass die ID als String für den Vergleich verwendet wird
          const idStr = String(id);
          
          // Hole die Beschreibung aus courseNotes oder verwende den Standardwert
          let description = courseNotes[id] || courseNotes[idStr];
          
          // Wenn die Beschreibung leer, null oder undefined ist, setze den Standardwert
          if (description === undefined || description === null || description === '') {
            description = "Keine Benachrichtigung";
          }
          
          return {
            id: id,
            description: description
          };
        });
        
        setSelectedCourses(coursesArray);
        
        // Aktualisiere auch selected_courses im newEmployee, wenn noch nicht vorhanden
        // und nur in diesem speziellen Fall, um Rekursion zu verhindern
        if (!newEmployee.selected_courses && !hasDifferentIds) {
          handleInputChange({
            target: {
              name: 'selected_courses',
              value: coursesArray
            }
          });
          
          // Stelle sicher, dass auch course_notes korrekt initialisiert wird
          const newCourseNotes = {};
          coursesArray.forEach(course => {
            newCourseNotes[course.id] = course.description;
          });
          
          handleInputChange({
            target: {
              name: 'course_notes',
              value: newCourseNotes
            }
          });
        }
      }
    } else if (selectedCourses.length > 0 && (!newEmployee.course_ids || newEmployee.course_ids.length === 0)) {
      // Keine Kurse ausgewählt, setze selectedCourses zurück
      setSelectedCourses([]);
    }
  }, [newEmployee]); // Entferne selectedCourses aus den Abhängigkeiten

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Erstelle handleProfessionChange Funktion
  const handleProfessionChange = (event) => {
    const { value } = event.target;
    handleInputChange({
      target: {
        name: 'position',
        value: value
      }
    });
  };

  // Prüft, ob der aktuelle Schritt vollständig ist
  const isStepComplete = () => {
    if (activeStep === 0) {
      return newEmployee.name && newEmployee.surname && newEmployee.email && 
             newEmployee.password && newEmployee.password === newEmployee.checkPassword;
    }
    if (activeStep === 1) {
      return newEmployee.company_id && newEmployee.position && newEmployee.employee_number && 
             newEmployee.hire_date && newEmployee.hourly_rate;
    }
    if (activeStep === 2) {
      // Bei Kontaktdaten und persönlichen Informationen nur Basisvalidierung
      return true; // Alle Felder optional außer die bereits validierten
    }
    return true; // Andere Schritte haben keine Pflichtfelder
  };
  
  // Funktion zum Aktualisieren der Kurs-Auswahl
  const handleCourseSelection = (event) => {
    const selectedIds = event.target.value;
    
    // Aktualisiere course_ids im newEmployee
    handleInputChange({
      target: {
        name: 'course_ids',
        value: selectedIds
      }
    });
    
    // Aktualisiere selectedCourses
    // Behalte vorhandene Kurse und deren Beschreibungen
    const existingCourses = selectedCourses.filter(course => selectedIds.includes(course.id));
    
    // Füge neue Kurse hinzu
    const newCourseIds = selectedIds.filter(id => !selectedCourses.some(course => course.id === id));
    const newCourses = newCourseIds.map(id => ({ 
      id: id, 
      description: "Keine Benachrichtigung" // Konsistenter Standardwert anstelle eines Leerzeichens
    }));
    
    const updatedCourses = [...existingCourses, ...newCourses];
    
    setSelectedCourses(updatedCourses);
    
    // Aktualisiere auch selected_courses im newEmployee
    handleInputChange({
      target: {
        name: 'selected_courses',
        value: updatedCourses
      }
    });
    
    // Für Abwärtskompatibilität auch course_notes aktualisieren
    const courseNotesObj = {};
    updatedCourses.forEach(course => {
      // Stelle sicher, dass keine NULL-Werte übermittelt werden
      courseNotesObj[course.id] = course.description || "Keine Benachrichtigung";
    });
    
    handleInputChange({
      target: {
        name: 'course_notes',
        value: courseNotesObj
      }
    });
  };
  
  // Funktion zum Aktualisieren der Kurs-Notizen
  const handleCourseNoteChange = (courseId, note) => {
    // Stelle sicher, dass die Notiz nie leer oder null ist
    const safeNote = note || "Keine Benachrichtigung";
    
    const updatedCourses = selectedCourses.map(course => 
      course.id === courseId ? { ...course, description: safeNote } : course
    );
    
    setSelectedCourses(updatedCourses);
    
    // Aktualisiere den Hauptstate des Elternkomponente
    handleInputChange({
      target: {
        name: 'selected_courses',
        value: updatedCourses
      }
    });
    
    // Für Abwärtskompatibilität auch course_notes aktualisieren
    const courseNotesObj = {};
    updatedCourses.forEach(course => {
      courseNotesObj[course.id] = course.description || "Keine Benachrichtigung";
    });
    
    handleInputChange({
      target: {
        name: 'course_notes',
        value: courseNotesObj
      }
    });
  };

  // Füge Logging-Funktion für den Submit-Prozess hinzu
  const logBeforeSubmit = () => {
    console.log("Vor dem Hinzufügen: Ausgewählte Kurse", selectedCourses);
    console.log("Vor dem Hinzufügen: course_notes Objekt", newEmployee.course_notes);
    console.log("Vor dem Hinzufügen: course_ids", newEmployee.course_ids);
    console.log("Vor dem Hinzufügen: selected_courses", newEmployee.selected_courses);
    
    // Prüfe auf NULL oder leere Werte
    if (selectedCourses.length > 0) {
      // Aktualisiere beide, selectedCourses und course_notes
      let hasChanges = false;
      const updatedCourses = selectedCourses.map(course => {
        if (course.description === null || course.description === undefined || course.description === '') {
          console.warn(`WARNUNG: Kurs ${course.id} hat leere Beschreibung - wird korrigiert`);
          hasChanges = true;
          return {
            ...course,
            description: "Keine Benachrichtigung"
          };
        }
        return course;
      });
      
      if (hasChanges) {
        console.log("Kursbeschreibungen wurden aktualisiert:", updatedCourses);
        setSelectedCourses(updatedCourses);
        
        // Aktualisiere den Hauptstate 
        handleInputChange({
          target: {
            name: 'selected_courses',
            value: updatedCourses
          }
        });
        
        // Stelle sicher, dass course_notes auch aktualisiert wird
        const updatedNotes = {};
        updatedCourses.forEach(course => {
          updatedNotes[course.id] = course.description;
        });
        
        handleInputChange({
          target: {
            name: 'course_notes',
            value: updatedNotes
          }
        });
        
        console.log("Aktualisierte course_notes:", updatedNotes);
      }
    }
    
    // Stelle sicher, dass course_notes und selectedCourses übereinstimmen
    if (newEmployee.course_ids && newEmployee.course_ids.length > 0) {
      if (!newEmployee.course_notes) {
        const notes = {};
        newEmployee.course_ids.forEach(id => {
          const course = selectedCourses.find(c => c.id === id);
          notes[id] = course ? course.description : "Keine Benachrichtigung";
        });
        
        console.log("Erstelle fehlende course_notes:", notes);
        handleInputChange({
          target: {
            name: 'course_notes',
            value: notes
          }
        });
      }
    }
    
    // Stelle sicher, dass selected_courses existiert und korrekt ist
    if (newEmployee.course_ids && (!newEmployee.selected_courses || newEmployee.selected_courses.length === 0)) {
      const courses = newEmployee.course_ids.map(id => {
        const description = newEmployee.course_notes && newEmployee.course_notes[id] 
          ? newEmployee.course_notes[id] 
          : "Keine Benachrichtigung";
          
        return { id, description };
      });
      
      console.log("Erstelle fehlende selected_courses:", courses);
      handleInputChange({
        target: {
          name: 'selected_courses',
          value: courses
        }
      });
    }
    
    // Weiterleitung an die eigentliche handleAddEmployee Funktion
    handleAddEmployee();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'primary.main',
        color: 'white',
        py: 2
      }}>
        <Box display="flex" alignItems="center">
          <PersonAddIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Neuen Mitarbeiter hinzufügen</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box sx={{ mb: 4, width: '100%' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3, 
          px: 2,
          minHeight: '380px'
        }}>
          {/* SCHRITT 1: Persönliche Daten */}
          {activeStep === 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                  <PersonAddIcon />
                </Avatar>
                <Typography variant="h6">Bitte geben Sie die grundlegenden Informationen ein</Typography>
              </Box>
              
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="name"
                      label="Nachname"
                      fullWidth
                      value={newEmployee.name || ''}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Nachname des Mitarbeiters"
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="surname"
                      label="Vorname"
                      fullWidth
                      value={newEmployee.surname || ''}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Vorname des Mitarbeiters"
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      label="E-Mail"
                      type="email"
                      fullWidth
                      value={newEmployee.email || ''}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="E-Mail-Adresse des Mitarbeiters (wird als Anmeldename verwendet)"
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="password"
                      label="Passwort"
                      type="password"
                      fullWidth
                      value={newEmployee.password || ''}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Mindestens 6 Zeichen"
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="checkPassword"
                      label="Passwort bestätigen"
                      type="password"
                      fullWidth
                      value={newEmployee.checkPassword || ''}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      error={newEmployee.password !== newEmployee.checkPassword && newEmployee.checkPassword !== ''}
                      helperText={newEmployee.password !== newEmployee.checkPassword && newEmployee.checkPassword !== '' 
                        ? "Passwörter stimmen nicht überein" 
                        : "Passwort zur Bestätigung wiederholen"}
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
          
          {/* SCHRITT 2: Arbeitsinformationen */}
          {activeStep === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Arbeitsinformationen</Typography>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel id="company-label" sx={labelStyles}>
                        Firma auswählen
                      </InputLabel>
                      <Select
                        labelId="company-label"
                        name="company_id"
                        value={newEmployee.company_id || ''}
                        onChange={handleInputChange}
                        label="Firma auswählen"
                        sx={selectStyles}
                        startAdornment={
                          <InputAdornment position="start">
                            <BusinessIcon color="action" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>Keine Firma auswählen</em>
                        </MenuItem>
                        {companies.map((company) => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        Firma, bei der der Mitarbeiter angestellt ist
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel id="profession-label" sx={labelStyles}>Beruf</InputLabel>
                      <Select
                        labelId="profession-label"
                        name="profession"
                        value={newEmployee.position || ''}
                        onChange={handleProfessionChange}
                        label="Beruf"
                        displayEmpty
                        sx={selectStyles}
                        startAdornment={
                          <InputAdornment position="start">
                            <WorkIcon color="action" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>Beruf auswählen</em>
                        </MenuItem>
                        {professions && professions.length > 0 ? (
                          professions.map((profession) => (
                            <MenuItem key={profession.id} value={profession.name}>
                              {profession.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">
                            <em>Keine Berufe verfügbar</em>
                          </MenuItem>
                        )}
                        <MenuItem value="other">
                          <em>Andere Position...</em>
                        </MenuItem>
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        Beruf oder Position des Mitarbeiters
                      </Typography>
                    </FormControl>
                  </Grid>
                  {newEmployee.position === 'other' && (
                    <Grid item xs={12}>
                      <TextField
                        name="customPosition"
                        label="Benutzerdefinierte Position"
                        fullWidth
                        value={newEmployee.customPosition || ''}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        helperText="Geben Sie eine benutzerdefinierte Position ein"
                        InputLabelProps={{
                          sx: { fontWeight: 500 }
                        }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="employee_number"
                      label="Mitarbeiternummer"
                      fullWidth
                      value={newEmployee.employee_number || ''}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Eindeutige Mitarbeiternummer"
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="hire_date"
                      label="Einstellungsdatum"
                      type="date"
                      fullWidth
                      value={newEmployee.hire_date || ''}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                        sx: { fontWeight: 500 }
                      }}
                      required
                      variant="outlined"
                      helperText="Datum der Einstellung"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="hourly_rate"
                      label="Stundensatz (CHF) - Einkauf"
                      type="number"
                      fullWidth
                      value={newEmployee.hourly_rate || ''}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">CHF</InputAdornment>,
                        inputProps: { step: 0.01, min: 0 }
                      }}
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                      required
                      variant="outlined"
                      helperText="Stundensatz für Einkauf des Mitarbeiters"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="hourly_rate_sale"
                      label="Stundensatz (CHF) - Verkauf"
                      type="number"
                      fullWidth
                      value={newEmployee.hourly_rate_sale || ''}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">CHF</InputAdornment>,
                        inputProps: { step: 0.01, min: 0 }
                      }}
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                      required
                      variant="outlined"
                      helperText="Stundensatz für Verkauf des Mitarbeiters"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="minimum_wage"
                      label="Mindestlohn (CHF)"
                      type="number"
                      fullWidth
                      value={newEmployee.minimum_wage || ''}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">CHF</InputAdornment>,
                        inputProps: { step: 0.01, min: 0 }
                      }}
                      InputLabelProps={{
                        sx: { fontWeight: 500 }
                      }}
                      variant="outlined"
                      helperText="Optionaler Mindestlohn"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
          
          {/* SCHRITT 3: Kontaktdaten */}
          {activeStep === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Kontaktdaten und Adresse</Typography>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="phone"
                      label="Telefon"
                      fullWidth
                      value={newEmployee.phone || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="Telefonnummer des Mitarbeiters"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><HomeIcon color="action" fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="ahv"
                      label="AHV-Nummer"
                      fullWidth
                      value={newEmployee.ahv || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="AHV-Nummer des Mitarbeiters"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="iban"
                      label="IBAN"
                      fullWidth
                      value={newEmployee.iban || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="IBAN für Lohnzahlung (z.B. CH56 0483 5012 3456 7800 9)"
                      inputProps={{ maxLength: 34 }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{ mb: 2 }}>Adressinformationen</Typography>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="address"
                      label="Straße und Hausnummer"
                      fullWidth
                      value={newEmployee.address || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="Vollständige Adresse des Mitarbeiters"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><HomeIcon color="action" fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="plz"
                      label="Postleitzahl"
                      fullWidth
                      value={newEmployee.plz || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="PLZ des Wohnorts"
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      name="place"
                      label="Ort"
                      fullWidth
                      value={newEmployee.place || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="Wohnort des Mitarbeiters"
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <Typography variant="h6" sx={{ mb: 2 }}>Persönliche Informationen</Typography>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="birth"
                      label="Geburtsdatum"
                      type="date"
                      fullWidth
                      value={newEmployee.birth || ''}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                        sx: { fontWeight: 500 }
                      }}
                      variant="outlined"
                      helperText="Geburtsdatum des Mitarbeiters"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><EventNoteIcon color="action" fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="civil-label" sx={{ fontWeight: 500 }}>Zivilstand</InputLabel>
                      <Select
                        labelId="civil-label"
                        name="civil"
                        value={newEmployee.civil || ''}
                        onChange={handleInputChange}
                        label="Zivilstand"
                        sx={selectStyles}
                      >
                        <MenuItem value="">
                          <em>Bitte wählen...</em>
                        </MenuItem>
                        <MenuItem value="ledig">Ledig</MenuItem>
                        <MenuItem value="verheiratet">Verheiratet</MenuItem>
                        <MenuItem value="geschieden">Geschieden</MenuItem>
                        <MenuItem value="verwitwet">Verwitwet</MenuItem>
                        <MenuItem value="eingetragene-partnerschaft">Eingetragene Partnerschaft</MenuItem>
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        Aktueller Zivilstand des Mitarbeiters
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="idform"
                      label="Ausweistyp"
                      fullWidth
                      value={newEmployee.idform || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="Art des Ausweises (z.B. ID-Karte, Pass)"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><BadgeIcon color="action" fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="idexpirity"
                      label="Ausweis gültig bis"
                      type="date"
                      fullWidth
                      value={newEmployee.idexpirity || ''}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                        sx: { fontWeight: 500 }
                      }}
                      variant="outlined"
                      helperText="Ablaufdatum des Ausweises"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="nationality"
                      label="Nationalität"
                      fullWidth
                      value={newEmployee.nationality || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      helperText="Nationalität des Mitarbeiters"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
          
          {/* SCHRITT 4: Zusatzinformationen */}
          {activeStep === 3 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Projekte und Benachrichtigungen</Typography>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 3 }}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                  <InputLabel id="project-label">Projekte</InputLabel>
                  <Select
                    labelId="project-label"
                    id="project-select"
                    multiple
                    value={newEmployee.project_ids || []}
                    onChange={handleProjectChange}
                    input={<OutlinedInput label="Projekte" />}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <em>Keine Projekte ausgewählt</em>;
                      }
                      
                      const selectedProjects = projects
                        .filter(project => selected.includes(project.id))
                        .map(project => project.name);
                        
                      return selectedProjects.join(', ');
                    }}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        <Checkbox checked={(newEmployee.project_ids || []).indexOf(project.id) > -1} />
                        <ListItemText primary={project.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  name="notification"
                  label="Benachrichtigung"
                  fullWidth
                  value={newEmployee.notification === null || newEmployee.notification === undefined ? '' : String(newEmployee.notification)}
                  onChange={(e) => {
                    // Stelle sicher, dass notification immer als String gesetzt wird
                    handleInputChange({
                      target: {
                        name: 'notification',
                        value: e.target.value || ''
                      }
                    });
                  }}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Optionale Benachrichtigungen oder Hinweise"
                />
              </Paper>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Bereit zum Hinzufügen des neuen Mitarbeiters!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Klicken Sie auf "Hinzufügen", um den Mitarbeiter zu speichern.
                </Typography>
              </Box>
            </>
          )}
          
          {/* SCHRITT 5: Qualifikationen & Kurse */}
          {activeStep === 4 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Typography variant="h6">Qualifikationen und Kurse</Typography>
              </Box>
              
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Grid container spacing={3}>
                  {/* Bildungs-Tags/Qualifikationen */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Qualifikationen
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="bildungs-tags-label" sx={{ whiteSpace: 'nowrap', overflow: 'visible' }}>Qualifikationen auswählen</InputLabel>
                      <Select
                        labelId="bildungs-tags-label"
                        multiple
                        value={newEmployee.bildungs_tag_ids || []}
                        onChange={(e) => handleInputChange({
                          target: {
                            name: 'bildungs_tag_ids',
                            value: e.target.value
                          }
                        })}
                        input={<OutlinedInput label="Qualifikationen auswählen" sx={{ minWidth: '250px' }} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const tag = bildungsTags.find(tag => tag.id === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={tag ? tag.name : value} 
                                  size="small" 
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {bildungsTags.map((tag) => (
                          <MenuItem key={tag.id} value={tag.id}>
                            <Checkbox checked={(newEmployee.bildungs_tag_ids || []).indexOf(tag.id) > -1} />
                            <ListItemText 
                              primary={tag.name}
                              secondary={tag.description}
                              primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Kurse */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Kurse
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="courses-label" sx={{ whiteSpace: 'nowrap', overflow: 'visible' }}>Kurse auswählen</InputLabel>
                      <Select
                        labelId="courses-label"
                        multiple
                        value={newEmployee.course_ids || []}
                        onChange={handleCourseSelection}
                        input={<OutlinedInput label="Kurse auswählen" sx={{ minWidth: '250px' }} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const course = courses.find(course => course.id === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={course ? course.name : value} 
                                  size="small" 
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            <Checkbox checked={(newEmployee.course_ids || []).indexOf(course.id) > -1} />
                            <ListItemText 
                              primary={course.name}
                              secondary={course.description}
                              primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Kursnotizen */}
                  {selectedCourses.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                        Kursnotizen
                      </Typography>
                      <Box sx={{ mt: 2, mb: 2 }}>
                        {selectedCourses.map(selectedCourse => {
                          const course = courses.find(c => c.id === selectedCourse.id);
                          return (
                            <Box key={selectedCourse.id} sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {course ? course.name : `Kurs ID: ${selectedCourse.id}`}
                              </Typography>
                              <TextField
                                fullWidth
                                label="Notiz zum Kurs"
                                multiline
                                rows={2}
                                value={selectedCourse.description || "Keine Benachrichtigung"}
                                onChange={(e) => handleCourseNoteChange(selectedCourse.id, e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                                placeholder="Geben Sie hier eine Notiz zum Kurs ein..."
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 4, py: 3, justifyContent: 'space-between' }}>
        <Box>
          {activeStep > 0 && (
            <Button 
              onClick={handleBack}
              startIcon={<BackIcon />}
              variant="outlined"
            >
              Zurück
            </Button>
          )}
        </Box>
        <Box>
          <Button 
            onClick={onClose} 
            color="inherit" 
            sx={{ mr: 1 }}
          >
            Abbrechen
          </Button>
          
          {activeStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext}
              variant="contained" 
              endIcon={<NextIcon />}
              disabled={!isStepComplete()}
            >
              Weiter
            </Button>
          ) : (
            <Button 
              onClick={logBeforeSubmit} 
              variant="contained" 
              startIcon={<SaveIcon />}
              color="success"
              disabled={!newEmployee.name || !newEmployee.surname || !newEmployee.email || !newEmployee.position || !newEmployee.employee_number || !newEmployee.company_id || !newEmployee.password || !newEmployee.checkPassword}
            >
              Mitarbeiter hinzufügen
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployeeModal; 