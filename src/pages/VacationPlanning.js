import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
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
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, parseISO, differenceInCalendarDays } from 'date-fns';
import { de } from 'date-fns/locale';
import vacationService from '../api/vacationService';
import employeeService from '../api/employeeService';
import { useAuth } from '../context/AuthContext';

// Beispieldaten für Ferienanträge (nicht mehr verwendet - echte Daten aus API)
/*
const mockVacationRequests = [
  { id: 1, employeeId: 1, employeeName: 'Max Mustermann', startDate: '2023-07-15', endDate: '2023-07-28', days: 10, status: 'Genehmigt', type: 'Urlaub', notes: 'Sommerurlaub' },
  { id: 2, employeeId: 2, employeeName: 'Anna Schmidt', startDate: '2023-07-20', endDate: '2023-07-25', days: 4, status: 'Genehmigt', type: 'Urlaub', notes: 'Kurzurlaub' },
  { id: 3, employeeId: 3, employeeName: 'Erika Müller', startDate: '2023-08-01', endDate: '2023-08-14', days: 10, status: 'Ausstehend', type: 'Urlaub', notes: 'Familienurlaub' },
  { id: 4, employeeId: 4, employeeName: 'Thomas Weber', startDate: '2023-07-05', endDate: '2023-07-08', days: 4, status: 'Genehmigt', type: 'Krank', notes: 'Erkältung' },
  { id: 5, employeeId: 5, employeeName: 'Lisa Becker', startDate: '2023-07-06', endDate: '2023-07-08', days: 3, status: 'Ausstehend', type: 'Urlaub', notes: 'Verlängertes Wochenende' },
  { id: 6, employeeId: 1, employeeName: 'Max Mustermann', startDate: '2023-08-25', endDate: '2023-08-25', days: 1, status: 'Ausstehend', type: 'Sonderurlaub', notes: 'Behördengang' },
  { id: 7, employeeId: 2, employeeName: 'Anna Schmidt', startDate: '2023-09-10', endDate: '2023-09-24', days: 10, status: 'Ausstehend', type: 'Urlaub', notes: 'Herbsturlaub' },
  { id: 8, employeeId: 6, employeeName: 'Michael Schneider', startDate: '2023-07-24', endDate: '2023-08-04', days: 10, status: 'Genehmigt', type: 'Urlaub', notes: 'Sommerurlaub mit Familie' },
  { id: 9, employeeId: 8, employeeName: 'Peter Hoffmann', startDate: '2023-08-07', endDate: '2023-08-18', days: 10, status: 'Genehmigt', type: 'Urlaub', notes: 'Ferienhaus am See' },
  { id: 10, employeeId: 9, employeeName: 'Julia Wagner', startDate: '2023-10-10', endDate: '2023-10-20', days: 9, status: 'Ausstehend', type: 'Urlaub', notes: 'Herbsturlaub' },
];

// Ferienansprüche der Mitarbeiter (nicht mehr verwendet - echte Daten aus API)
const mockVacationBalances = [
  { employeeId: 1, employeeName: 'Max Mustermann', totalDays: 30, usedDays: 11, plannedDays: 1, remainingDays: 18 },
  { employeeId: 2, employeeName: 'Anna Schmidt', totalDays: 28, usedDays: 9, plannedDays: 10, remainingDays: 9 },
  { employeeId: 3, employeeName: 'Erika Müller', totalDays: 30, usedDays: 5, plannedDays: 10, remainingDays: 15 },
  { employeeId: 4, employeeName: 'Thomas Weber', totalDays: 28, usedDays: 15, plannedDays: 0, remainingDays: 13 },
  { employeeId: 5, employeeName: 'Lisa Becker', totalDays: 25, usedDays: 10, plannedDays: 3, remainingDays: 12 },
  { employeeId: 6, employeeName: 'Michael Schneider', totalDays: 25, usedDays: 5, plannedDays: 10, remainingDays: 10 },
  { employeeId: 8, employeeName: 'Peter Hoffmann', totalDays: 28, usedDays: 8, plannedDays: 10, remainingDays: 10 },
  { employeeId: 9, employeeName: 'Julia Wagner', totalDays: 30, usedDays: 11, plannedDays: 9, remainingDays: 10 },
];

// Liste der Mitarbeiter (nicht mehr verwendet - echte Daten aus API)
const mockEmployees = [
  { id: 1, name: 'Max Mustermann', department: 'Entwicklung' },
  { id: 2, name: 'Anna Schmidt', department: 'Entwicklung' },
  { id: 3, name: 'Erika Müller', department: 'Marketing' },
  { id: 4, name: 'Thomas Weber', department: 'Finanzen' },
  { id: 5, name: 'Lisa Becker', department: 'HR' },
  { id: 6, name: 'Michael Schneider', department: 'Entwicklung' },
  { id: 8, name: 'Peter Hoffmann', department: 'IT' },
  { id: 9, name: 'Julia Wagner', department: 'Projektmanagement' },
];
*/

// Urlaubsarten
const vacationTypes = [
  'Urlaub',
  'Krank',
  'Sonderurlaub',
  'Weiterbildung',
  'Homeoffice'
];

// Tabs-Konstanten
const TABS = {
  CALENDAR: 0,
  REQUESTS: 1,
  BALANCES: 2
};

const VacationPlanning = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CALENDAR);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newVacationRequest, setNewVacationRequest] = useState({
    employeeId: '',
    startDate: new Date(),
    endDate: new Date(),
    type: 'Urlaub',
    notes: ''
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [allVacationRequests, setAllVacationRequests] = useState([]); // Alle Ferienanträge aller Mitarbeiter
  const [allVacationBalances, setAllVacationBalances] = useState([]); // Alle Urlaubssalden aller Mitarbeiter
  const [vacationBalance, setVacationBalance] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Lade Ferienanträge und Urlaubssaldo beim Komponentenstart
  useEffect(() => {
    console.log('VacationPlanning useEffect triggered');
    console.log('User object:', user);
    console.log('User employee ID:', user?.employee?.id);
    console.log('User ID:', user?.id);
    
    if (user?.employee?.id || user?.id) {
      console.log('Loading vacation data...');
      loadVacationData();
    } else {
      console.log('No user ID found, skipping data load');
    }
  }, [user]);

  const loadVacationData = async () => {
    console.log('=== NEUE VERSION loadVacationData ===');
    console.log('User employee ID:', user?.employee?.id);
    console.log('User ID:', user?.id);
    
    setLoading(true);
    
    // Lade Mitarbeiter zuerst
    console.log('Lade Mitarbeiter...');
    try {
      const employeesResponse = await employeeService.getActiveEmployees();
      console.log('Mitarbeiter erfolgreich geladen:', employeesResponse);
      
      if (employeesResponse && employeesResponse.length > 0) {
        setEmployees(employeesResponse);
        console.log('Mitarbeiterliste gesetzt:', employeesResponse.length, 'Mitarbeiter');
        
        // Verwende den ersten Mitarbeiter als Standard
        setNewVacationRequest(prev => ({
          ...prev,
          employeeId: employeesResponse[0].id
        }));
        
        // Lade Ferienanträge von ALLEN Mitarbeitern für den Kalender
        await loadAllVacationRequests(employeesResponse);
        
        // Lade Urlaubssalden von ALLEN Mitarbeitern für den Saldo-Tab
        await loadAllVacationBalances(employeesResponse);
        
        // Lade Feriendaten für den ersten Mitarbeiter (für Details und Saldo)
        console.log('Lade Feriendaten für ersten Mitarbeiter:', employeesResponse[0].id);
        try {
          const [requestsResponse, balanceResponse] = await Promise.all([
            vacationService.getVacationRequests(employeesResponse[0].id),
            vacationService.getVacationBalance(employeesResponse[0].id)
          ]);
          
          setVacationRequests(requestsResponse.vacationRequests || []);
          setVacationBalance(balanceResponse.balance || null);
          console.log('Ferienanträge für ersten Mitarbeiter geladen:', requestsResponse.vacationRequests?.length || 0);
        } catch (error) {
          console.error('Fehler beim Laden der Feriendaten:', error);
          setVacationRequests([]);
          setVacationBalance(null);
        }
      } else {
        console.log('Keine Mitarbeiter erhalten, verwende Fallback');
        const fallbackEmployee = {
          id: user?.id || 1,
          user: { name: user?.name || 'Admin User' },
          department: null
        };
        setEmployees([fallbackEmployee]);
        setNewVacationRequest(prev => ({
          ...prev,
          employeeId: fallbackEmployee.id
        }));
        setAllVacationRequests([]);
        setAllVacationBalances([]);
        setVacationRequests([]);
        setVacationBalance(null);
      }
    } catch (employeeError) {
      console.error('Fehler beim Laden der Mitarbeiter:', employeeError);
      console.log('Verwende Fallback für Mitarbeiter');
      const fallbackEmployee = {
        id: user?.id || 1,
        user: { name: user?.name || 'Admin User' },
        department: null
      };
      setEmployees([fallbackEmployee]);
      setNewVacationRequest(prev => ({
        ...prev,
        employeeId: fallbackEmployee.id
      }));
      setAllVacationRequests([]);
      setAllVacationBalances([]);
      setVacationRequests([]);
      setVacationBalance(null);
    }
    
    setLoading(false);
    console.log('=== loadVacationData beendet ===');
  };
  
  // Lade Ferienanträge von allen Mitarbeitern für den Kalender
  const loadAllVacationRequests = async (employeesList) => {
    console.log('Lade Ferienanträge von allen Mitarbeitern...');
    const allRequests = [];
    
    try {
      // Lade Ferienanträge von allen Mitarbeitern parallel
      const promises = employeesList.map(async (employee) => {
        try {
          const response = await vacationService.getVacationRequests(employee.id);
          const requests = response.vacationRequests || [];
          // Füge Mitarbeiter-Informationen zu jedem Ferienantrag hinzu
          return requests.map(request => ({
            ...request,
            employee: {
              id: employee.id,
              name: getFullEmployeeName(employee),
              department: employee.department?.name || 'Unbekannt'
            }
          }));
        } catch (error) {
          console.error(`Fehler beim Laden der Ferienanträge für Mitarbeiter ${employee.id}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(promises);
      results.forEach(requests => {
        allRequests.push(...requests);
      });
      
      setAllVacationRequests(allRequests);
      console.log('Alle Ferienanträge geladen:', allRequests.length, 'Anträge von', employeesList.length, 'Mitarbeitern');
    } catch (error) {
      console.error('Fehler beim Laden aller Ferienanträge:', error);
      setAllVacationRequests([]);
    }
  };
  
  // Lade Urlaubssalden von allen Mitarbeitern
  const loadAllVacationBalances = async (employeesList) => {
    console.log('Lade Urlaubssalden von allen Mitarbeitern...');
    const allBalances = [];
    
    try {
      // Lade Urlaubssalden von allen Mitarbeitern parallel
      const promises = employeesList.map(async (employee) => {
        try {
          const response = await vacationService.getVacationBalance(employee.id);
          const balance = response.balance || {
            total: 25,
            used: 0,
            pending: 0,
            remaining: 25
          };
          
          return {
            employee: {
              id: employee.id,
              name: getFullEmployeeName(employee),
              department: employee.department?.name || 'Unbekannt'
            },
            ...balance
          };
        } catch (error) {
          console.error(`Fehler beim Laden des Urlaubssaldos für Mitarbeiter ${employee.id}:`, error);
          // Fallback für Mitarbeiter ohne Urlaubssaldo
          return {
            employee: {
              id: employee.id,
              name: getFullEmployeeName(employee),
              department: employee.department?.name || 'Unbekannt'
            },
            total: 25,
            used: 0,
            pending: 0,
            remaining: 25
          };
        }
      });
      
      const results = await Promise.all(promises);
      setAllVacationBalances(results);
      console.log('Alle Urlaubssalden geladen:', results.length, 'Salden von', employeesList.length, 'Mitarbeitern');
    } catch (error) {
      console.error('Fehler beim Laden aller Urlaubssalden:', error);
      setAllVacationBalances([]);
    }
  };
  
  // Formatiere den vollständigen Namen eines Mitarbeiters
  const getFullEmployeeName = (employee) => {
    if (!employee) return 'Unbekannt';
    
    const firstName = employee.user?.name || employee.first_name || '';
    const lastName = employee.user?.surname || employee.last_name || employee.name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return 'Unbekannt';
    }
  };
  
  // Generiere eine schöne Farbe für einen Mitarbeiter basierend auf der ID
  const getEmployeeColor = (employeeId) => {
    const colors = [
      '#6366f1', // Indigo - modern und elegant
      '#10b981', // Emerald - frisches Grün
      '#f59e0b', // Amber - warmes Orange
      '#ef4444', // Red - klares Rot
      '#8b5cf6', // Violet - elegantes Lila
      '#06b6d4', // Cyan - frisches Blau
      '#84cc16', // Lime - lebendiges Grün
      '#f97316', // Orange - warmes Orange
      '#ec4899', // Pink - modernes Pink
      '#6b7280', // Gray - neutrales Grau
      '#14b8a6', // Teal - beruhigendes Blau-Grün
      '#a855f7', // Purple - tiefes Lila
    ];
    return colors[employeeId % colors.length];
  };
  
  // Berechne Monatsanfang und -ende
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Gruppiere Urlaubsanträge nach Datum für Kalenderansicht (alle Mitarbeiter)
  const vacationsByDate = {};
  allVacationRequests.forEach(vacation => {
    const start = parseISO(vacation.start_date);
    const end = parseISO(vacation.end_date);
    
    for (let day = start; day <= end; day = addDays(day, 1)) {
      const dateKey = format(day, 'yyyy-MM-dd');
      if (!vacationsByDate[dateKey]) {
        vacationsByDate[dateKey] = [];
      }
      vacationsByDate[dateKey].push(vacation);
    }
  });
  
  // Zum nächsten Monat wechseln
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Zum vorherigen Monat wechseln
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Dialog zum Hinzufügen eines neuen Ferienantrags öffnen
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  // Dialog schließen
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    resetForm();
  };
  
  // Formular zurücksetzen
  const resetForm = () => {
    setNewVacationRequest({
      employeeId: employees.length > 0 ? employees[0].id : '',
      startDate: new Date(),
      endDate: new Date(),
      type: 'Urlaub',
      notes: ''
    });
    setCalculatedDays(0);
  };
  
  // Ferienantrag hinzufügen
  const handleAddVacationRequest = async () => {
    // Überprüfen, ob alle erforderlichen Felder ausgefüllt sind
    if (!newVacationRequest.employeeId || !newVacationRequest.startDate || !newVacationRequest.endDate) {
      setSnackbar({
        open: true,
        message: 'Bitte füllen Sie alle erforderlichen Felder aus',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Konvertiere die Typen für das Backend
      const typeMapping = {
        'Urlaub': 'vacation',
        'Krank': 'special',
        'Sonderurlaub': 'special',
        'Weiterbildung': 'special',
        'Homeoffice': 'special'
      };
      
      const vacationData = {
        start_date: format(newVacationRequest.startDate, 'yyyy-MM-dd'),
        end_date: format(newVacationRequest.endDate, 'yyyy-MM-dd'),
        type: typeMapping[newVacationRequest.type] || 'vacation',
        reason: newVacationRequest.notes
      };
      
      console.log('Sende Ferienantrag-Daten:', vacationData);
      console.log('Mitarbeiter ID:', newVacationRequest.employeeId);
      
      const response = await vacationService.createVacationRequest(
        newVacationRequest.employeeId, 
        vacationData
      );
      
      // Lade die Daten neu für den ausgewählten Mitarbeiter
      await loadEmployeeVacationBalance(newVacationRequest.employeeId);
      
      // Schließe den Dialog und zeige Erfolgsmeldung
      handleCloseAddDialog();
      setSnackbar({
        open: true,
        message: 'Ferienantrag erfolgreich erstellt!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Fehler beim Erstellen des Ferienantrags:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Zeige spezifische Validierungsfehler
      let errorMessage = 'Fehler beim Erstellen des Ferienantrags';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Input-Änderungen verarbeiten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVacationRequest(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Wenn der Mitarbeiter geändert wird, lade das entsprechende Urlaubssaldo
    if (name === 'employeeId' && value) {
      loadEmployeeVacationBalance(value);
    }
  };

  // Urlaubssaldo und Ferienanträge für einen bestimmten Mitarbeiter laden
  const loadEmployeeVacationBalance = async (employeeId) => {
    try {
      const [requestsResponse, balanceResponse] = await Promise.all([
        vacationService.getVacationRequests(employeeId),
        vacationService.getVacationBalance(employeeId)
      ]);
      
      setVacationRequests(requestsResponse.vacationRequests || []);
      setVacationBalance(balanceResponse.balance || null);
      console.log('Ferienanträge für Mitarbeiter', employeeId, 'geladen:', requestsResponse.vacationRequests?.length || 0);
      
      // Lade auch alle Ferienanträge und Urlaubssalden neu für Kalender und Saldo-Tab
      if (employees.length > 0) {
        await Promise.all([
          loadAllVacationRequests(employees),
          loadAllVacationBalances(employees)
        ]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Feriendaten:', error);
      // Bei Fehler die ursprünglichen Daten beibehalten
    }
  };
  
  // Datumsauswahl verarbeiten und Anzahl der Tage berechnen
  const handleDateChange = (field, date) => {
    setNewVacationRequest(prev => {
      const updated = {
        ...prev,
        [field]: date
      };
      
      // Berechne die Anzahl der Tage, wenn sowohl Start- als auch Enddatum vorhanden sind
      if (updated.startDate && updated.endDate) {
        const days = calculateBusinessDays(updated.startDate, updated.endDate);
        setCalculatedDays(days);
      }
      
      return updated;
    });
  };
  
  // Berechne die Anzahl der Arbeitstage (ohne Wochenenden)
  const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let day = start; day <= end; day = addDays(day, 1)) {
      if (!isWeekend(day)) {
        count++;
      }
    }
    
    return count;
  };
  
  // Tab-Wechsel
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Ferienantrag-Details anzeigen
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setOpenDetailsDialog(true);
  };
  
  // Dialog mit Ferienantrag-Details schließen
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedRequest(null);
  };
  
  // Ferienantrag genehmigen
  const handleApproveRequest = async (id) => {
    console.log('Antrag genehmigen:', id);
    try {
      // Echter API-Aufruf für Genehmigung
      await vacationService.approveVacationRequest(id);
      
      // Finde den Antrag vor dem Entfernen für Saldo-Updates
      const requestToApprove = allVacationRequests.find(r => r.id === id);
      
      // Entferne den Antrag aus der Liste der ausstehenden Anträge
      setAllVacationRequests(prev => prev.filter(request => request.id !== id));
      
      // Aktualisiere auch die spezifischen Ferienanträge des Mitarbeiters
      setVacationRequests(prev => prev.filter(request => request.id !== id));
      
      // Aktualisiere die Urlaubssalden lokal (verschiebe von pending zu used)
      if (requestToApprove) {
        setAllVacationBalances(prev => prev.map(balance => {
          if (balance.employee.id === requestToApprove.employee?.id) {
            return {
              ...balance,
              pending: Math.max(0, balance.pending - (requestToApprove.days || 0)),
              used: balance.used + (requestToApprove.days || 0),
              remaining: balance.remaining - (requestToApprove.days || 0)
            };
          }
          return balance;
        }));
      }
      
      handleCloseDetailsDialog();
      setSnackbar({
        open: true,
        message: 'Ferienantrag wurde erfolgreich genehmigt!',
        severity: 'success'
      });
      
      // Kein Neuladen der Daten - die lokalen Updates reichen aus
    } catch (error) {
      console.error('Fehler beim Genehmigen des Antrags:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Genehmigen des Antrags',
        severity: 'error'
      });
    }
  };
  
  // Ferienantrag ablehnen
  const handleRejectRequest = async (id) => {
    console.log('Antrag ablehnen:', id);
    try {
      // Echter API-Aufruf für Ablehnung
      await vacationService.rejectVacationRequest(id, 'Antrag abgelehnt');
      
      // Entferne den Antrag aus der Liste der ausstehenden Anträge
      setAllVacationRequests(prev => prev.filter(request => request.id !== id));
      
      // Aktualisiere auch die spezifischen Ferienanträge des Mitarbeiters
      setVacationRequests(prev => prev.filter(request => request.id !== id));
      
      handleCloseDetailsDialog();
      setSnackbar({
        open: true,
        message: 'Ferienantrag wurde erfolgreich abgelehnt!',
        severity: 'success'
      });
      
      // Kein Neuladen der Daten - die lokalen Updates reichen aus
    } catch (error) {
      console.error('Fehler beim Ablehnen des Antrags:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Ablehnen des Antrags',
        severity: 'error'
      });
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ferienplanung
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Kalender" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Anträge" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Urlaubssalden" icon={<EventBusyIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {activeTab === TABS.CALENDAR && (
        <>
          {/* Monatsnavigation */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={prevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6">
                {format(currentMonth, 'MMMM yyyy', { locale: de })}
              </Typography>
              <IconButton onClick={nextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Ferien beantragen
            </Button>
          </Paper>
          
          {/* Gantt-Chart Kalenderansicht */}
          <Paper sx={{ p: 2, overflow: 'auto' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              minWidth: 'fit-content'
            }}>
              {/* Header mit Datumsspalten */}
              <Box sx={{ 
                display: 'flex', 
                borderBottom: '2px solid #e5e7eb',
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                zIndex: 10
              }}>
                {/* Leere Zelle für Mitarbeiter-Header */}
                <Box sx={{ 
                  width: 200, 
                  minWidth: 200,
                  p: 2,
                  borderRight: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#374151' }}>
                    Mitarbeiter
                  </Typography>
                </Box>
                
                {/* Datumsspalten */}
                {monthDays.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const isWeekendDay = isWeekend(day);
                  
                  return (
                    <Box
                      key={i}
                      sx={{
                        width: 40,
                        minWidth: 40,
                        p: 1,
                        borderRight: '1px solid #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday 
                          ? 'rgba(99, 102, 241, 0.1)' 
                          : isWeekendDay 
                            ? 'rgba(0, 0, 0, 0.02)' 
                            : 'white',
                        opacity: isCurrentMonth ? 1 : 0.4,
                        border: isToday ? '2px solid rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: isToday ? 'bold' : '500',
                          color: isToday 
                            ? '#6366f1' 
                            : isWeekendDay 
                              ? '#6b7280' 
                              : '#374151',
                          fontSize: '0.7rem'
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isWeekendDay ? '#6b7280' : '#9ca3af',
                          fontSize: '0.6rem'
                        }}
                      >
                        {format(day, 'EEE', { locale: de }).substring(0, 2)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              
              {/* Mitarbeiter-Zeilen mit Urlaubspunkten */}
              {employees.map((employee) => (
                <Box 
                  key={employee.id}
                  sx={{ 
                    display: 'flex',
                    borderBottom: '1px solid #f3f4f6',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.02)'
                    }
                  }}
                >
                  {/* Mitarbeiter-Name */}
                  <Box sx={{ 
                    width: 200, 
                    minWidth: 200,
                    p: 2,
                    borderRight: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'white'
                  }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getEmployeeColor(employee.id),
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#374151' }}>
                      {getFullEmployeeName(employee)}
                    </Typography>
                  </Box>
                  
                  {/* Urlaubspunkte für jeden Tag */}
                  {monthDays.map((day, dayIndex) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayVacations = vacationsByDate[dateKey] || [];
                    const employeeVacation = dayVacations.find(v => 
                      v.employee?.id === employee.id || v.employee_id === employee.id
                    );
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());
                    const isWeekendDay = isWeekend(day);
                    
                    return (
                      <Box
                        key={dayIndex}
                        sx={{
                          width: 40,
                          minWidth: 40,
                          height: 50,
                          borderRight: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isToday 
                            ? 'rgba(99, 102, 241, 0.05)' 
                            : isWeekendDay 
                              ? 'rgba(0, 0, 0, 0.01)' 
                              : 'white',
                          opacity: isCurrentMonth ? 1 : 0.3,
                          position: 'relative',
                          cursor: employeeVacation ? 'pointer' : 'default',
                          '&:hover': {
                            backgroundColor: employeeVacation 
                              ? 'rgba(99, 102, 241, 0.1)' 
                              : 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                        onClick={() => employeeVacation && handleViewRequest(employeeVacation)}
                      >
                        {employeeVacation && (
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: getEmployeeColor(employee.id),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.2)',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                              }
                            }}
                            title={`${getFullEmployeeName(employeeVacation.employee)} - ${format(parseISO(employeeVacation.start_date), 'dd.MM.yyyy')} bis ${format(parseISO(employeeVacation.end_date), 'dd.MM.yyyy')}`}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'white', 
                                fontSize: '0.6rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {employeeVacation.type === 'vacation' ? 'U' : 
                               employeeVacation.type === 'special' ? 'S' : 
                               employeeVacation.type === 'unpaid' ? 'N' : '?'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
            
            {/* Legende */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: '600', mb: 1 }}>
                Legende:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#6366f1' }} />
                  <Typography variant="caption">U = Urlaub</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                  <Typography variant="caption">S = Sonderurlaub</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#6b7280' }} />
                  <Typography variant="caption">N = Unbezahlt</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Klicken Sie auf einen Punkt für Details
                </Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}
      
      {activeTab === TABS.REQUESTS && (
        <>
          {/* Steuerleiste für Anträge */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: '600', mb: 0.5 }}>
                Ausstehende Ferienanträge
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {allVacationRequests.filter(request => request.status === 'pending' || !request.status).length} ausstehende Anträge von {employees.length} Mitarbeitern
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                backgroundColor: '#6366f1',
                '&:hover': {
                  backgroundColor: '#4f46e5'
                }
              }}
            >
              Ferien beantragen
            </Button>
          </Paper>
          
          {/* Tabelle der Ferienanträge */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>Mitarbeiter</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Abteilung</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Von</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Bis</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Tage</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Typ</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Notizen</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allVacationRequests
                  .filter(request => request.status === 'pending' || !request.status) // Nur ausstehende Anträge anzeigen
                  .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                  .map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getEmployeeColor(request.employee?.id || request.employee_id || 0),
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                          {getFullEmployeeName(request.employee)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {request.employee?.department || 'Keine Abteilung'}
                      </Typography>
                    </TableCell>
                    <TableCell>{format(parseISO(request.start_date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                    <TableCell>{format(parseISO(request.end_date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.type === 'vacation' ? 'Urlaub' : 
                               request.type === 'special' ? 'Sonderurlaub' : 
                               request.type === 'unpaid' ? 'Unbezahlt' : request.type} 
                        size="small"
                        sx={{
                          backgroundColor: request.type === 'vacation' ? '#6366f1' :
                                         request.type === 'special' ? '#8b5cf6' :
                                         request.type === 'unpaid' ? '#6b7280' : '#10b981',
                          color: 'white',
                          fontWeight: '500',
                          fontSize: '0.75rem',
                          height: 24,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status === 'approved' ? 'Genehmigt' :
                               request.status === 'rejected' ? 'Abgelehnt' :
                               request.status === 'pending' ? 'Ausstehend' : request.status} 
                        size="small"
                        sx={{
                          backgroundColor: request.status === 'approved' ? '#10b981' :
                                         request.status === 'rejected' ? '#ef4444' :
                                         request.status === 'pending' ? '#f59e0b' : '#6b7280',
                          color: 'white',
                          fontWeight: '500',
                          fontSize: '0.75rem',
                          height: 24,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewRequest(request)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="Genehmigen">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Ablehnen">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === TABS.BALANCES && (
        <>
          {/* Steuerleiste für Urlaubssalden */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: '600', mb: 0.5 }}>
                Urlaubssalden aller Mitarbeiter
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {allVacationBalances.length} Mitarbeiter mit Urlaubssalden
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                backgroundColor: '#6366f1',
                '&:hover': {
                  backgroundColor: '#4f46e5'
                }
              }}
            >
              Ferien beantragen
            </Button>
          </Paper>
          
          {/* Übersicht der Urlaubssalden */}
          <Paper sx={{ p: 2, mb: 3 }}>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '600' }}>Mitarbeiter</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Abteilung</TableCell>
                    <TableCell align="center" sx={{ fontWeight: '600' }}>Gesamt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: '600' }}>Verwendet</TableCell>
                    <TableCell align="center" sx={{ fontWeight: '600' }}>Geplant</TableCell>
                    <TableCell align="center" sx={{ fontWeight: '600' }}>Verbleibend</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allVacationBalances
                    .sort((a, b) => getFullEmployeeName(a.employee).localeCompare(getFullEmployeeName(b.employee)))
                    .map((balance) => (
                    <TableRow key={balance.employee.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getEmployeeColor(balance.employee.id),
                              flexShrink: 0
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {getFullEmployeeName(balance.employee)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {balance.employee.department}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                          {balance.total || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: '500' }}>
                          {balance.used || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: '500' }}>
                          {balance.pending || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={balance.remaining || 0}
                          sx={{
                            backgroundColor: (balance.remaining || 0) > 10 ? '#10b981' :
                                           (balance.remaining || 0) > 5 ? '#f59e0b' : '#ef4444',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.75rem',
                            height: 24,
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            handleOpenAddDialog();
                            setNewVacationRequest(prev => ({
                              ...prev,
                              employeeId: balance.employee.id
                            }));
                          }}
                          sx={{
                            color: '#6366f1',
                            borderColor: '#6366f1',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              borderColor: '#4f46e5'
                            }
                          }}
                        >
                          Urlaub beantragen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* Jahresübersicht */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Teamauslastung
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Diese Grafik zeigt die Anzahl der genehmigten und geplanten Urlaubstage pro Monat für das gesamte Team.
            </Typography>
            
            <Grid container spacing={2}>
              {['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'].map((month, index) => {
                // Simulierte Daten
                const approved = Math.round(Math.random() * 20);
                const pending = Math.round(Math.random() * 10);
                const total = approved + pending;
                const maxHeight = 150;
                const approvedHeight = (approved / 30) * maxHeight;
                const pendingHeight = (pending / 30) * maxHeight;
                
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={month}>
                    <Paper elevation={1} sx={{ p: 1 }}>
                      <Typography variant="body2" align="center" gutterBottom>
                        {month}
                      </Typography>
                      <Box sx={{ 
                        height: maxHeight, 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        alignItems: 'center',
                        position: 'relative'
                      }}>
                        {pending > 0 && (
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              bottom: 0,
                              width: '60%', 
                              height: pendingHeight,
                              bgcolor: 'warning.light',
                              borderTopLeftRadius: 2,
                              borderTopRightRadius: 2,
                              zIndex: 1
                            }}
                          />
                        )}
                        {approved > 0 && (
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              bottom: pendingHeight,
                              width: '60%', 
                              height: approvedHeight,
                              bgcolor: 'success.light',
                              borderTopLeftRadius: 2,
                              borderTopRightRadius: 2,
                              zIndex: 2
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" align="center" display="block">
                        {total} Tage
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
            
            {/* Legende */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, bgcolor: 'success.light', mr: 1, borderRadius: 1 }} />
                <Typography variant="caption">Genehmigt</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, bgcolor: 'warning.light', mr: 1, borderRadius: 1 }} />
                <Typography variant="caption">Ausstehend</Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}
      
      {/* Dialog zum Hinzufügen eines neuen Ferienantrags */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ferien beantragen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Bitte füllen Sie das Formular aus, um einen neuen Ferienantrag zu stellen.
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth required>
                <InputLabel id="employee-label">Mitarbeiter</InputLabel>
                <Select
                  labelId="employee-label"
                  name="employeeId"
                  value={newVacationRequest.employeeId}
                  onChange={handleInputChange}
                  label="Mitarbeiter"
                  sx={{ minWidth: 200 }}
                >
                  {employees.length > 0 ? (
                    employees.map(employee => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.user?.name || employee.name || `Mitarbeiter ${employee.id}`}
                        {employee.department && (
                          <span style={{ color: '#666', fontSize: '0.8em', marginLeft: '8px' }}>
                            ({employee.department.name})
                          </span>
                        )}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      {loading ? 'Lade Mitarbeiter...' : 'Keine Mitarbeiter gefunden'}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Von"
                  value={newVacationRequest.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Bis"
                  value={newVacationRequest.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                  minDate={newVacationRequest.startDate || new Date()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="type-label">Typ</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={newVacationRequest.type}
                  onChange={handleInputChange}
                  label="Typ"
                >
                  {vacationTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Arbeitstage"
                value={calculatedDays}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                helperText="Automatisch berechnet (ohne Wochenenden)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                name="notes"
                value={newVacationRequest.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Zusätzliche Informationen zu Ihrem Antrag..."
              />
            </Grid>
            
            {newVacationRequest.employeeId && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Urlaubssaldo
                  </Typography>
                  {vacationBalance && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Verbleibende Tage:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {vacationBalance.remaining || 0} Tage
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Abbrechen</Button>
          <Button 
            onClick={handleAddVacationRequest} 
            variant="contained"
            disabled={
              !newVacationRequest.employeeId || 
              !newVacationRequest.startDate || 
              !newVacationRequest.endDate || 
              calculatedDays <= 0
            }
          >
            Beantragen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für Ferienantrag-Details */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>
              Ferienantragsdetails
              <Chip 
                label={selectedRequest.status === 'approved' ? 'Genehmigt' :
                       selectedRequest.status === 'rejected' ? 'Abgelehnt' :
                       selectedRequest.status === 'pending' ? 'Ausstehend' : selectedRequest.status} 
                size="small"
                color={
                  selectedRequest.status === 'approved' ? 'success' :
                  selectedRequest.status === 'rejected' ? 'error' :
                  'warning'
                }
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedRequest.employee?.name || user?.name || 'Unbekannt'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(selectedRequest.start_date), 'dd.MM.yyyy', { locale: de })} bis {format(parseISO(selectedRequest.end_date), 'dd.MM.yyyy', { locale: de })}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Typ</Typography>
                  <Typography variant="body1">
                    {selectedRequest.type === 'vacation' ? 'Urlaub' : 
                     selectedRequest.type === 'special' ? 'Sonderurlaub' : 
                     selectedRequest.type === 'unpaid' ? 'Unbezahlt' : selectedRequest.type}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Anzahl Tage</Typography>
                  <Typography variant="body1">{selectedRequest.days} Tage</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Notizen</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="body1">
                      {selectedRequest.reason || 'Keine Notizen vorhanden'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Schließen</Button>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button 
                    color="success" 
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                  >
                    Genehmigen
                  </Button>
                  <Button 
                    color="error" 
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                  >
                    Ablehnen
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VacationPlanning; 