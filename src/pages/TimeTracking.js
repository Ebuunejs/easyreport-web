import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
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
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isToday, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { timeLogService } from '../services/timeLogService';
import EmployeeService from '../services/EmployeeService';
import { projectService } from '../services/projectService';
import WeekViewTable from '../components/WeekViewTable';
import MapView from '../components/MapView';

// Hilfsfunktion für die Formatierung von Stunden
const formatHours = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return '0.00';
  }
  return Number(hours).toFixed(2);
};

// Berechnet Endzeit aus Startzeit + Pause + normale Arbeitszeit
const calculateEndTime = (startTime, breakMinutes, normalHours) => {
  if (!startTime) return '16:00';
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + parseInt(breakMinutes || 0) + Math.round(parseFloat(normalHours) * 60);
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

// Hilfsfunktion zur Berechnung der Gesamtstunden
const calculateTotalHours = (startTime, endTime, breakTime = 0) => {
  if (!startTime || !endTime) {
    return 0;
  }
  
  try {
    const [startHour, startMinute] = startTime.split(':').map(num => parseInt(num));
    const [endHour, endMinute] = endTime.split(':').map(num => parseInt(num));
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    let totalMinutes = endMinutes - startMinutes;
    
    // Wenn Endzeit vor Startzeit liegt (über Mitternacht)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    // Pause abziehen
    totalMinutes -= parseInt(breakTime) || 0;
    
    // In Stunden umwandeln
    return Math.max(0, totalMinutes / 60);
  } catch (error) {
    console.error('Fehler bei der Zeitberechnung:', error);
    return 0;
  }
};

// Tabs-Konstanten
const TABS = {
  WEEK_VIEW: 0,
  LIST_VIEW: 1,
  APPROVAL: 2,
  MAP_VIEW: 3,
  EMPLOYEE_OVERVIEW: 4
};

const TimeTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [activeTab, setActiveTab] = useState(TABS.WEEK_VIEW);
  const [newTimeLog, setNewTimeLog] = useState({
    project_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '07:00',
    endTime: '16:00',
    breakTime: 60,
    notes: '',
    totalHours: calculateTotalHours('07:00', '16:00', 60)
  });

  // State für Edit-Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTimeLog, setEditingTimeLog] = useState(null);
  const [editTimeLog, setEditTimeLog] = useState({
    date: '',
    startTime: '',
    endTime: '',
    breakTime: 0,
    notes: '',
    totalHours: 0
  });

  // State für Delete-Dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingTimeLog, setDeletingTimeLog] = useState(null);

  // State für dynamische Daten
  const [timeLogs, setTimeLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [weekTimeLogs, setWeekTimeLogs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Mitarbeiterübersicht: separater State
  const [selectedOverviewEmployee, setSelectedOverviewEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [employeeMonthLogs, setEmployeeMonthLogs] = useState([]);
  const employeeOverviewRef = useRef(null);
  
  // Berechne Wochenstart und -ende mit useMemo für Performance
  const weekStart = selectedWeekStart;
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  
  // Erstelle Array mit Wochentagen
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Lade Mitarbeiter und Projekte beim Komponenten-Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lade Mitarbeiter
        console.log('Lade Mitarbeiter...');
        // Nur Mitarbeiter mit Rolle 'employee' laden
        const employeesResponse = await EmployeeService.getEmployees({ role: 'employee' });
        console.log('Mitarbeiter-Response:', employeesResponse);
        console.log('Mitarbeiter-Daten:', employeesResponse.data);
        const employeesData = employeesResponse.data || [];
        console.log('Verarbeitete Mitarbeiter:', employeesData);
        setEmployees(employeesData);
        
        // Lade Projekte
        const projectsResponse = await projectService.getProjects();
        console.log('Projekte geladen:', projectsResponse);
        setProjects(projectsResponse.data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        console.error('Fehler-Details:', error.response?.data);
        setError('Daten konnten nicht geladen werden.');
      }
    };

    fetchData();
  }, []);

  // Lade Zeiterfassungen für die aktuelle Woche
  useEffect(() => {
    let isMounted = true;
    
    const fetchWeekTimeLogs = async () => {
      try {
        if (activeTab === TABS.WEEK_VIEW && isMounted) {
          setLoading(true);
          const startDate = format(weekStart, 'yyyy-MM-dd');
          const endDate = format(weekEnd, 'yyyy-MM-dd');
          
          const response = await timeLogService.getTimeLogsForWeek(startDate, endDate);
          
          if (isMounted) {
            setWeekTimeLogs(response.data || []);
            setError(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Fehler beim Laden der Wochendaten:', error);
          setError('Zeiterfassungen konnten nicht geladen werden.');
          setWeekTimeLogs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeekTimeLogs();
    
    return () => {
      isMounted = false;
    };
  }, [weekStart, activeTab]);

  // Lade alle Zeiterfassungen für die Listenansicht
  useEffect(() => {
    let isMounted = true;
    
    const fetchAllTimeLogs = async () => {
      if (activeTab === TABS.LIST_VIEW && isMounted) {
        try {
          setLoading(true);
          const response = await timeLogService.getAllTimeLogs();
          
          if (isMounted) {
            setTimeLogs(response.data || []);
            setError(null);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Fehler beim Laden aller Zeiterfassungen:', error);
            setError('Zeiterfassungen konnten nicht geladen werden.');
            setTimeLogs([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchAllTimeLogs();
    
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Lade ausstehende Genehmigungen
  useEffect(() => {
    let isMounted = true;
    
    const fetchPendingApprovals = async () => {
      if (activeTab === TABS.APPROVAL && isMounted) {
        try {
          setLoading(true);
          const response = await timeLogService.getPendingApprovals();
          
          if (isMounted) {
            setPendingApprovals(response.data || []);
            setError(null);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Fehler beim Laden der ausstehenden Genehmigungen:', error);
            setError('Ausstehende Genehmigungen konnten nicht geladen werden.');
            setPendingApprovals([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchPendingApprovals();
    
    return () => {
      isMounted = false;
    };
  }, [activeTab]);
  
  // Berechnet die Gesamtstunden für einen bestimmten Tag
  const getHoursForDate = (date) => {
    return weekTimeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + (log.total_hours || 0), 0);
  };

  // Berechnet die Gesamtstunden für einen Mitarbeiter an einem bestimmten Tag
  const getEmployeeHoursForDate = (employeeId, date) => {
    return weekTimeLogs
      .filter(log => log.employee_id === employeeId && isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + (log.total_hours || 0), 0);
  };
  
  // Mitarbeiter nach Abteilungen gruppieren
  const groupedEmployees = useMemo(() => {
    return employees.reduce((acc, employee) => {
      const department = employee.position || 'Unbekannt';
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(employee);
      return acc;
    }, {});
  }, [employees]);
  
  // Zur vorherigen Woche wechseln
  const goToPreviousWeek = () => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  };
  
  // Zur nächsten Woche wechseln
  const goToNextWeek = () => {
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  };
  
  // Zur aktuellen Woche wechseln
  const goToCurrentWeek = () => {
    setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Daten für Mitarbeiterübersicht (Monatsansicht) laden
  useEffect(() => {
    let isMounted = true;
    const fetchEmployeeMonthLogs = async () => {
      if (activeTab !== TABS.EMPLOYEE_OVERVIEW) return;
      if (!selectedOverviewEmployee || !selectedMonth) {
        setEmployeeMonthLogs([]);
        return;
      }
      try {
        setLoading(true);
        const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
        let response;
        try {
          response = await timeLogService.getTimeLogsForDateRange(startDate, endDate, { employee_id: selectedOverviewEmployee });
        } catch (e) {
          // Fallback auf öffentlichen Endpunkt mit Filtern (falls unterstützt)
          response = await timeLogService.getAllTimeLogs({ start_date: startDate, end_date: endDate, employee_id: selectedOverviewEmployee });
        }
        const allLogs = response?.data || [];
        // Clientseitig absichern/filtern
        const filtered = allLogs.filter(log => {
          const d = new Date(log.date);
          return String(log.employee_id) === String(selectedOverviewEmployee) && d >= startOfMonth(selectedMonth) && d <= endOfMonth(selectedMonth);
        });
        if (isMounted) {
          setEmployeeMonthLogs(filtered);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fehler beim Laden der Monatsdaten:', err);
          setEmployeeMonthLogs([]);
          setError('Monatsdaten konnten nicht geladen werden.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchEmployeeMonthLogs();
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedOverviewEmployee, selectedMonth]);

  // Hilfswerte für Mitarbeiterübersicht
  const employeeMonthTotalHours = useMemo(() => {
    return employeeMonthLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
  }, [employeeMonthLogs]);


  const resolveProjectName = (log) => {
    if (log.project_name) return log.project_name;
    const p = projects.find(pr => String(pr.id) === String(log.project_id));
    return p ? p.name : 'Unbekannt';
  };

  const printEmployeeOverview = () => {
    if (!employeeOverviewRef.current) return;
    const content = employeeOverviewRef.current.innerHTML;
    
    // Mitarbeitername für Titel ermitteln
    const selectedEmployee = employees.find(emp => String(emp.id) === String(selectedOverviewEmployee));
    let employeeName = 'Unbekannt';
    if (selectedEmployee && selectedEmployee.user) {
      if (selectedEmployee.user.surname) {
        employeeName = `${selectedEmployee.user.surname} ${selectedEmployee.user.name}`;
      } else {
        employeeName = selectedEmployee.user.name;
      }
    }
    
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8" />
      <title>Mitarbeiterübersicht - ${employeeName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1, h2, h3 { margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f5f5f5; text-align: left; }
        .summary { margin-top: 16px; }
        .employee-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
      </style>
    </head><body>
      <div class="employee-title">Mitarbeiterübersicht - ${employeeName}</div>
      ${content}
    </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // Optional: printWindow.close();
  };
  
  // Dialog zum Hinzufügen einer neuen Zeiterfassung öffnen
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  // Dialog schließen
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Zurücksetzen der Formularfelder
    setNewTimeLog({
      project_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '07:00',
      endTime: '16:00',
      breakTime: 60,
      notes: '',
      totalHours: calculateTotalHours('07:00', '16:00', 60)
    });
    setSelectedEmployee('');
  };
  
  // Neue Zeiterfassung hinzufügen
  const handleAddTimeLog = async () => {
    try {
      if (!selectedEmployee) {
        alert('Bitte wählen Sie einen Mitarbeiter aus.');
        return;
      }

      if (!newTimeLog.project_id) {
        alert('Bitte wählen Sie ein Projekt aus.');
        return;
      }

      const timeLogData = {
        project_id: newTimeLog.project_id,
        date: newTimeLog.date,
        start_time: newTimeLog.startTime,
        end_time: newTimeLog.endTime,
        break_time: newTimeLog.breakTime,
        description: newTimeLog.notes,
        is_approved: true  // Manuelle Zeiterfassung wird automatisch genehmigt
      };

      await timeLogService.createTimeLog(selectedEmployee, timeLogData);
      
      // Daten neu laden
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      const response = await timeLogService.getTimeLogsForWeek(startDate, endDate);
      setWeekTimeLogs(response.data || []);
      
      handleCloseAddDialog();
      alert('Zeiterfassung erfolgreich hinzugefügt!');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Zeiterfassung:', error);
      alert('Fehler beim Hinzufügen der Zeiterfassung: ' + (error.response?.data?.message || error.message));
    }
  };

  // Zeiterfassung genehmigen
  const handleApproveTimeLog = async (timeLogId) => {
    try {
      await timeLogService.approveTimeLog(timeLogId);
      
      // Ausstehende Genehmigungen neu laden
      const response = await timeLogService.getPendingApprovals();
      setPendingApprovals(response.data || []);
      
      // Popup entfernt - Genehmigung erfolgt still im Hintergrund
    } catch (error) {
      console.error('Fehler beim Genehmigen der Zeiterfassung:', error);
      alert('Fehler beim Genehmigen der Zeiterfassung: ' + (error.response?.data?.message || error.message));
    }
  };

  // Zeiterfassung ablehnen
  const handleRejectTimeLog = async (timeLogId, reason = '') => {
    try {
      await timeLogService.rejectTimeLog(timeLogId, reason);
      
      // Ausstehende Genehmigungen neu laden
      const response = await timeLogService.getPendingApprovals();
      setPendingApprovals(response.data || []);
      
      alert('Zeiterfassung erfolgreich abgelehnt!');
    } catch (error) {
      console.error('Fehler beim Ablehnen der Zeiterfassung:', error);
      alert('Fehler beim Ablehnen der Zeiterfassung: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Input-Änderungen verarbeiten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimeLog(prev => {
      const updated = { ...prev, [name]: value };

      const selectedProject = projects.find(p => String(p.id) === String(prev.project_id));
      const normalHours = selectedProject?.normal_working_hours
        ? parseFloat(selectedProject.normal_working_hours)
        : null;

      if (normalHours && (name === 'startTime' || name === 'breakTime')) {
        // Endzeit automatisch aus Startzeit + Pause + normale Arbeitszeit berechnen
        const startTime = name === 'startTime' ? value : updated.startTime;
        const breakTime = name === 'breakTime' ? value : updated.breakTime;
        updated.endTime = calculateEndTime(startTime, breakTime, normalHours);
        updated.totalHours = normalHours;
      } else if (name === 'startTime' || name === 'endTime' || name === 'breakTime') {
        updated.totalHours = calculateTotalHours(
          name === 'startTime' ? value : updated.startTime,
          name === 'endTime' ? value : updated.endTime,
          name === 'breakTime' ? value : updated.breakTime
        );
      }

      return updated;
    });
  };
  
  // Datumsauswahl im Dialog
  const handleDateChange = (date) => {
    setNewTimeLog(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
  };
  
  // Tab-Wechsel
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setLoading(false);
    setError(null);
  };

  // Handler für Edit-Funktionalität
  const handleOpenEditDialog = (timeLog) => {
    setEditingTimeLog(timeLog);
    const initialTotalHours = calculateTotalHours(timeLog.start_time, timeLog.end_time, timeLog.break_time);
    setEditTimeLog({
      date: timeLog.date,
      startTime: timeLog.start_time,
      endTime: timeLog.end_time,
      breakTime: timeLog.break_time,
      notes: timeLog.notes || '',
      totalHours: initialTotalHours
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingTimeLog(null);
    setEditTimeLog({
      date: '',
      startTime: '',
      endTime: '',
      breakTime: 0,
      notes: '',
      totalHours: 0
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTimeLog(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Gesamtstunden automatisch neu berechnen bei Änderung der Zeit oder Pause
      if (name === 'startTime' || name === 'endTime' || name === 'breakTime') {
        updated.totalHours = calculateTotalHours(
          name === 'startTime' ? value : updated.startTime,
          name === 'endTime' ? value : updated.endTime,
          name === 'breakTime' ? value : updated.breakTime
        );
      }
      
      return updated;
    });
  };

  const handleEditDateChange = (date) => {
    if (date) {
      setEditTimeLog(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const handleUpdateTimeLog = async () => {
    if (!editingTimeLog) return;

    try {
      await timeLogService.updateTimeLog(editingTimeLog.employee_id, editingTimeLog.id, {
        project_id: 1, // Default-Projekt
        date: editTimeLog.date,
        start_time: editTimeLog.startTime,
        end_time: editTimeLog.endTime,
        break_duration: parseInt(editTimeLog.breakTime),
        description: editTimeLog.notes
      });

      // Zeiterfassungen neu laden
      if (activeTab === TABS.LIST_VIEW) {
        const response = await timeLogService.getAllTimeLogs();
        setTimeLogs(response.data || []);
      }

      handleCloseEditDialog();
      setError(null);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Zeiterfassung:', error);
      setError('Zeiterfassung konnte nicht aktualisiert werden.');
    }
  };

  // Handler für Delete-Funktionalität
  const handleOpenDeleteDialog = (timeLog) => {
    setDeletingTimeLog(timeLog);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingTimeLog(null);
  };

  const handleDeleteTimeLog = async () => {
    if (!deletingTimeLog) return;

    try {
      await timeLogService.deleteTimeLog(deletingTimeLog.employee_id, deletingTimeLog.id);

      // Zeiterfassungen neu laden
      if (activeTab === TABS.LIST_VIEW) {
        const response = await timeLogService.getAllTimeLogs();
        setTimeLogs(response.data || []);
      }

      handleCloseDeleteDialog();
      setError(null);
    } catch (error) {
      console.error('Fehler beim Löschen der Zeiterfassung:', error);
      setError('Zeiterfassung konnte nicht gelöscht werden.');
    }
  };

  // Refresh-Handler für Kartenansicht
  const refreshMapData = async () => {
    try {
      setLoading(true);
      
      // Mitarbeiter neu laden
      console.log('Lade Mitarbeiter für Kartenansicht...');
      const employeesResponse = await EmployeeService.getEmployees({ role: 'employee' });
      console.log('Kartenansicht Mitarbeiter-Response:', employeesResponse);
      setEmployees(employeesResponse.data || []);
      
      // Wochendaten neu laden (gleiche Logik wie im useEffect)
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      
      const weekResponse = await timeLogService.getTimeLogsForWeek(startDate, endDate);
      setWeekTimeLogs(weekResponse.data || []);
      
      setError(null);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kartendaten:', error);
      setError('Kartendaten konnten nicht aktualisiert werden.');
    } finally {
      setLoading(false);
    }
  };

  // Loading-Anzeige nur für den ersten Load
  if (loading && activeTab === TABS.WEEK_VIEW && weekTimeLogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading && activeTab === TABS.LIST_VIEW && timeLogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading && activeTab === TABS.APPROVAL && pendingApprovals.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Zeiterfassung
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Wochenansicht" />
          <Tab label="Listenansicht" />
          <Tab label="Genehmigungen" />
          <Tab label="Kartenansicht" />
          <Tab label="Mitarbeiterübersicht" />
        </Tabs>
      </Paper>
      
      {activeTab === TABS.WEEK_VIEW && (
        <>
          {/* Wochensteuerung */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={goToPreviousWeek}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6">
                {format(weekStart, 'dd.MM.yyyy', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
              </Typography>
              <IconButton onClick={goToNextWeek}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                onClick={goToCurrentWeek}
                sx={{ mr: 2 }}
              >
                Aktuelle Woche
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Zeit eintragen
              </Button>
            </Box>
          </Paper>
          
          {/* Wochenansicht */}
          <WeekViewTable 
            employees={employees}
            weekTimeLogs={weekTimeLogs}
            weekDays={weekDays}
            getEmployeeHoursForDate={getEmployeeHoursForDate}
            getHoursForDate={getHoursForDate}
          />
        </>
      )}
      
      {activeTab === TABS.LIST_VIEW && (
        <>
          {/* Filteroptionen für Listenansicht */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Datum auswählen"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </LocalizationProvider>
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="employee-filter-label">Mitarbeiter</InputLabel>
              <Select
                labelId="employee-filter-label"
                label="Mitarbeiter"
                value=""
              >
                <MenuItem value="">Alle Mitarbeiter</MenuItem>
                {Object.entries(groupedEmployees).map(([department, employeeList]) => [
                  <MenuItem key={department} disabled divider>{department}</MenuItem>,
                  ...employeeList.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.user ? 
                        (emp.user.surname ? 
                          `${emp.user.surname} ${emp.user.name}` : 
                          emp.user.name
                        ) : 
                        'Unbekannt'
                      }
                    </MenuItem>
                  ))
                ]).flat()}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{ ml: 'auto' }}
            >
              Zeit eintragen
            </Button>
          </Paper>
          
          {/* Listenansicht der Zeiterfassungen */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Mitarbeiter</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Ende</TableCell>
                  <TableCell>Pause</TableCell>
                  <TableCell>Gesamt</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start GPS</TableCell>
                  <TableCell>End GPS</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                    <TableCell>{log.employee_name}</TableCell>
                    <TableCell>{log.project_name || 'Unbekannt'}</TableCell>
                    <TableCell>{log.start_time}</TableCell>
                    <TableCell>{log.end_time}</TableCell>
                    <TableCell>{log.break_time} min</TableCell>
                    <TableCell>{formatHours(log.total_hours)} h</TableCell>
                    <TableCell>
                      {log.status === 'Bestätigt' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                          <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {log.status}
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                          <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {log.status}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.start_latitude && log.start_longitude ? (
                        <Box sx={{ fontSize: '0.75rem' }}>
                          <div>Lat: {parseFloat(log.start_latitude).toFixed(6)}</div>
                          <div>Lng: {parseFloat(log.start_longitude).toFixed(6)}</div>
                          {log.start_accuracy && <div>±{Math.round(log.start_accuracy)}m</div>}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.end_latitude && log.end_longitude ? (
                        <Box sx={{ fontSize: '0.75rem' }}>
                          <div>Lat: {parseFloat(log.end_latitude).toFixed(6)}</div>
                          <div>Lng: {parseFloat(log.end_longitude).toFixed(6)}</div>
                          {log.end_accuracy && <div>±{Math.round(log.end_accuracy)}m</div>}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditDialog(log)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(log)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === TABS.APPROVAL && (
        <>
          {/* Genehmigungsansicht */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Offene Genehmigungen
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Hier sehen Sie alle Zeiterfassungen, die noch auf Ihre Genehmigung warten.
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Mitarbeiter</TableCell>
                    <TableCell>Projekt</TableCell>
                    <TableCell>Stunden</TableCell>
                    <TableCell>Notizen</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApprovals.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                      <TableCell>{log.employee_name}</TableCell>
                      <TableCell>{log.project_name || 'Unbekannt'}</TableCell>
                      <TableCell>
                        {log.start_time} - {log.end_time} ({formatHours(log.total_hours)} h)
                      </TableCell>
                      <TableCell>{log.notes}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Genehmigen">
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success" 
                              startIcon={<CheckIcon />}
                              onClick={() => handleApproveTimeLog(log.id)}
                            >
                              Genehmigen
                            </Button>
                          </Tooltip>
                          <Tooltip title="Ablehnen">
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              startIcon={<ClearIcon />}
                              onClick={() => handleRejectTimeLog(log.id)}
                            >
                              Ablehnen
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Keine offenen Genehmigungen vorhanden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Genehmigte Einträge (letzte 7 Tage)
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Mitarbeiter</TableCell>
                    <TableCell>Projekt</TableCell>
                    <TableCell>Stunden</TableCell>
                    <TableCell>Notizen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeLogs
                    .filter(log => log.status === 'Bestätigt')
                    .slice(0, 5)
                    .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell>{log.employee_name}</TableCell>
                        <TableCell>{log.project_name || 'Unbekannt'}</TableCell>
                        <TableCell>
                          {log.start_time} - {log.end_time} ({formatHours(log.total_hours)} h)
                        </TableCell>
                        <TableCell>{log.notes}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
      
      {activeTab === TABS.MAP_VIEW && (
        <MapView 
          employees={employees}
          weekTimeLogs={weekTimeLogs}
          onRefresh={refreshMapData}
        />
      )}

      {activeTab === TABS.EMPLOYEE_OVERVIEW && (
        <>
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 260 }} size="small">
              <InputLabel id="employee-overview-select-label">Mitarbeiter</InputLabel>
              <Select
                labelId="employee-overview-select-label"
                label="Mitarbeiter"
                value={selectedOverviewEmployee}
                onChange={(e) => setSelectedOverviewEmployee(e.target.value)}
              >
                {Object.entries(groupedEmployees).map(([department, employeeList]) => [
                  <MenuItem key={department} disabled divider>{department}</MenuItem>,
                  ...employeeList.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.user ? 
                        (emp.user.surname ? 
                          `${emp.user.surname} ${emp.user.name}` : 
                          emp.user.name
                        ) : 
                        'Unbekannt'
                      }
                    </MenuItem>
                  ))
                ]).flat()}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Monat"
                views={["year", "month"]}
                value={selectedMonth}
                onChange={(d) => d && setSelectedMonth(d)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </LocalizationProvider>

            <Button 
              variant="outlined"
              onClick={printEmployeeOverview}
              sx={{ ml: 'auto' }}
              disabled={!selectedOverviewEmployee || employeeMonthLogs.length === 0}
            >
              Als PDF drucken
            </Button>
          </Paper>

          <div ref={employeeOverviewRef}>
            <Typography variant="h6" gutterBottom>
              Mitarbeiterübersicht {selectedMonth ? format(selectedMonth, 'MMMM yyyy', { locale: de }) : ''}
            </Typography>
            {!selectedOverviewEmployee && (
              <Alert severity="info" sx={{ mb: 2 }}>Bitte wählen Sie oben einen Mitarbeiter.</Alert>
            )}
            {selectedOverviewEmployee && employeeMonthLogs.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>Keine Einträge im ausgewählten Monat.</Alert>
            )}

            {selectedOverviewEmployee && employeeMonthLogs.length > 0 && (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Datum</TableCell>
                        <TableCell>Projekt</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>Ende</TableCell>
                        <TableCell>Pause</TableCell>
                        <TableCell>Gesamt</TableCell>
                        <TableCell>Notizen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeeMonthLogs
                        .slice()
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                            <TableCell>{resolveProjectName(log)}</TableCell>
                            <TableCell>{log.start_time}</TableCell>
                            <TableCell>{log.end_time}</TableCell>
                            <TableCell>{log.break_time} min</TableCell>
                            <TableCell>{formatHours(log.total_hours)} h</TableCell>
                            <TableCell>{log.notes || ''}</TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={5} align="right"><strong>Monatssumme</strong></TableCell>
                        <TableCell><strong>{formatHours(employeeMonthTotalHours)} h</strong></TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </div>
        </>
      )}
      
      {/* Dialog zum Hinzufügen einer neuen Zeiterfassung */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Zeit eintragen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bitte geben Sie die Arbeitszeitdetails ein.
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">Mitarbeiter</InputLabel>
              <Select
                labelId="employee-select-label"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Mitarbeiter"
                required
              >
                {Object.entries(groupedEmployees).map(([department, employeeList]) => [
                  <MenuItem key={department} disabled divider>{department}</MenuItem>,
                  ...employeeList.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.user ? 
                        (emp.user.surname ? 
                          `${emp.user.surname} ${emp.user.name}` : 
                          emp.user.name
                        ) : 
                        'Unbekannt'
                      }
                    </MenuItem>
                  ))
                ]).flat()}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="project-select-label">Projekt/Baustelle</InputLabel>
              <Select
                labelId="project-select-label"
                value={newTimeLog.project_id}
                onChange={(e) => {
                  const projectId = e.target.value;
                  const selectedProject = projects.find(p => String(p.id) === String(projectId));
                  const normalHours = selectedProject?.normal_working_hours
                    ? parseFloat(selectedProject.normal_working_hours)
                    : null;
                  setNewTimeLog(prev => {
                    const updated = { ...prev, project_id: projectId };
                    if (normalHours) {
                      updated.endTime = calculateEndTime(prev.startTime, prev.breakTime, normalHours);
                      updated.totalHours = normalHours;
                    }
                    return updated;
                  });
                }}
                label="Projekt/Baustelle"
                required
              >
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Datum"
                value={new Date(newTimeLog.date)}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Startzeit"
                  type="time"
                  name="startTime"
                  value={newTimeLog.startTime}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 Minuten
                  }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Endzeit"
                  type="time"
                  name="endTime"
                  value={newTimeLog.endTime}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 Minuten
                  }}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Pause (Minuten)"
                  type="number"
                  name="breakTime"
                  value={newTimeLog.breakTime}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                  }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Gesamtstunden"
                  value={formatHours(newTimeLog.totalHours)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">h</InputAdornment>,
                    readOnly: true,
                  }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Notizen/Projekte"
              name="notes"
              value={newTimeLog.notes}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Abbrechen</Button>
          <Button 
            onClick={handleAddTimeLog} 
            variant="contained"
            disabled={!selectedEmployee || !newTimeLog.project_id || !newTimeLog.date || !newTimeLog.startTime || !newTimeLog.endTime}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zum Bearbeiten einer Zeiterfassung */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Zeiterfassung bearbeiten</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bitte geben Sie die aktualisierten Daten ein.
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Datum"
                value={new Date(editTimeLog.date)}
                onChange={handleEditDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Startzeit"
                  type="time"
                  name="startTime"
                  value={editTimeLog.startTime}
                  onChange={handleEditInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 Minuten
                  }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Endzeit"
                  type="time"
                  name="endTime"
                  value={editTimeLog.endTime}
                  onChange={handleEditInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 Minuten
                  }}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Pause (Minuten)"
                  type="number"
                  name="breakTime"
                  value={editTimeLog.breakTime}
                  onChange={handleEditInputChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                  }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Gesamtstunden"
                  value={formatHours(editTimeLog.totalHours)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">h</InputAdornment>,
                    readOnly: true,
                  }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Notizen/Projekte"
              name="notes"
              value={editTimeLog.notes}
              onChange={handleEditInputChange}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Abbrechen</Button>
          <Button 
            onClick={handleUpdateTimeLog} 
            variant="contained"
            disabled={!editTimeLog.date || !editTimeLog.startTime || !editTimeLog.endTime}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zum Löschen einer Zeiterfassung */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Zeiterfassung löschen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sind Sie sicher, dass Sie diese Zeiterfassung löschen möchten?
          </DialogContentText>
          <Typography variant="body2" color="text.secondary">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Abbrechen</Button>
          <Button 
            onClick={handleDeleteTimeLog} 
            variant="contained"
            color="error"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTracking; 