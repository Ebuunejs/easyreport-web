import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import TimeLogs from '../components/TimeLogs';
import EmployeeService from '../services/EmployeeService';
import DocumentService from '../services/DocumentService';
import api from '../api/axios';

// Importiere Unterkomponenten
import EmployeeHeader from '../components/employees/EmployeeHeader';
import ProfileTab from '../components/employees/ProfileTab';
import DocumentsTab from '../components/employees/DocumentsTab';
import VacationTab from '../components/employees/VacationTab';
import BildungstagTab from '../components/employees/BildungstagTab';

// Tab-Konstanten
const TABS = {
  PROFILE: 0,
  DOCUMENTS: 1,
  TIME_TRACKING: 2,
  VACATION: 3,
  AUSBILDUNGEN: 4
};

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [documents, setDocuments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [vacationBalance, setVacationBalance] = useState(null);
  
  // States für Bildungs-Tags
  const [bildungsTags, setBildungsTags] = useState([]);
  const [employeeBildungsTags, setEmployeeBildungsTags] = useState([]);
  const [selectedBildungsTags, setSelectedBildungsTags] = useState([]);
  const [loadingBildungsTags, setLoadingBildungsTags] = useState(false);
  
  // Loading states für verschiedene Datentypen
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingTimeLogs, setLoadingTimeLogs] = useState(false);
  const [loadingVacation, setLoadingVacation] = useState(false);
  
  // Fehler states für verschiedene Datentypen
  const [documentsError, setDocumentsError] = useState(null);
  const [timeLogsError, setTimeLogsError] = useState(null);
  const [vacationError, setVacationError] = useState(null);
  
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mitarbeiterdaten laden
        const response = await EmployeeService.getEmployeeById(id);
        if (response.data) {
          setEmployee(response.data);
          console.log('Mitarbeiterdaten geladen:', response.data);
        }
        
      } catch (error) {
        console.error('Fehler beim Laden der Mitarbeiterdaten:', error);
        if (error.response?.status === 404) {
          setError('Mitarbeiter nicht gefunden.');
        } else {
          setError('Fehler beim Laden der Mitarbeiterdaten.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [id]);

  // Separate Funktion zum Laden der Bildungs-Tags
  const fetchBildungsTags = async () => {
    try {
      setLoadingBildungsTags(true);
      const bildungsTagsResponse = await EmployeeService.getBildungsTags(id);
      setBildungsTags(bildungsTagsResponse.data.all_tags || []);
      const employeeTags = bildungsTagsResponse.data.employee_tags || [];
      setEmployeeBildungsTags(employeeTags);
      setSelectedBildungsTags(employeeTags.map(tag => tag.id));
    } catch (bildungsError) {
      console.error('Fehler beim Laden der Bildungs-Tags:', bildungsError);
    } finally {
      setLoadingBildungsTags(false);
    }
  };

  // Separate Funktion zum Laden der Dokumente - jetzt mit DocumentService
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setDocumentsError(null);
      
      const docsResponse = await DocumentService.getEmployeeDocuments(id);
      setDocuments(docsResponse.data || []);
      console.log('Dokumente geladen:', docsResponse.data);
      
    } catch (docError) {
      console.error('Fehler beim Laden der Dokumente:', docError);
      
      // 404 oder ähnliche "Keine Daten"-Fehler nicht als Fehler behandeln
      if (docError.response?.status === 404 || 
          docError.response?.status === 204 || 
          docError.response?.data?.message?.includes('nicht gefunden')) {
        // Keine Dokumente vorhanden - das ist normal, kein Fehler
        setDocuments([]);
        setDocumentsError(null); // Kein Fehler anzeigen
        console.log('Keine Dokumente vorhanden - das ist normal');
      } else {
        // Nur echte Server-/Netzwerkfehler als Fehler behandeln
        setDocuments([]);
        setDocumentsError('Fehler beim Laden der Dokumente');
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Separate Funktion zum Laden der Zeitlogs
  const fetchTimeLogs = async () => {
    try {
      setLoadingTimeLogs(true);
      setTimeLogsError(null);
      
      const timeLogsResponse = await api.get(`/employees/${id}/time-logs`);
      setTimeLogs(timeLogsResponse.data || []);
      console.log('Zeitlogs geladen:', timeLogsResponse.data);
      
    } catch (timeError) {
      console.error('Fehler beim Laden der Zeiterfassung:', timeError);
      
      // 404 oder ähnliche "Keine Daten"-Fehler nicht als Fehler behandeln
      if (timeError.response?.status === 404 || 
          timeError.response?.status === 204 || 
          timeError.response?.data?.message?.includes('nicht gefunden')) {
        // Keine Zeitlogs vorhanden - das ist normal, kein Fehler
        setTimeLogs([]);
        setTimeLogsError(null); // Kein Fehler anzeigen
        console.log('Keine Zeitlogs vorhanden - das ist normal');
      } else {
        // Nur echte Server-/Netzwerkfehler als Fehler behandeln
        setTimeLogs([]);
        setTimeLogsError('Fehler beim Laden der Zeiterfassung');
      }
    } finally {
      setLoadingTimeLogs(false);
    }
  };

  // Separate Funktion zum Laden der Urlaubsdaten
  const fetchVacationData = async () => {
    try {
      setLoadingVacation(true);
      setVacationError(null);
      
      // Urlaubsanträge laden
      const vacationResponse = await api.get(`/employees/${id}/vacation-requests`);
      setVacationRequests(vacationResponse.data || []);
      
      // Urlaubssaldo laden
      const balanceResponse = await api.get(`/employees/${id}/vacation-balance`);
      setVacationBalance(balanceResponse.data || null);
      
      console.log('Urlaubsdaten geladen:', { requests: vacationResponse.data, balance: balanceResponse.data });
      
    } catch (vacationError) {
      console.error('Fehler beim Laden der Urlaubsdaten:', vacationError);
      
      // 404 oder ähnliche "Keine Daten"-Fehler nicht als Fehler behandeln
      if (vacationError.response?.status === 404 || 
          vacationError.response?.status === 204 || 
          vacationError.response?.data?.message?.includes('nicht gefunden')) {
        // Keine Daten vorhanden - das ist normal, kein Fehler
        setVacationRequests([]);
        setVacationBalance(null);
        setVacationError(null); // Kein Fehler anzeigen
        console.log('Keine Urlaubsdaten vorhanden - das ist normal');
      } else {
        // Nur echte Server-/Netzwerkfehler als Fehler behandeln
        setVacationRequests([]);
        setVacationBalance(null);
        setVacationError('Fehler beim Laden der Urlaubsdaten');
      }
    } finally {
      setLoadingVacation(false);
    }
  };
  
  // Tab wechseln und entsprechende Daten laden
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Lade Daten nur bei Bedarf (lazy loading)
    switch (newValue) {
      case TABS.DOCUMENTS:
        if (documents.length === 0 && !loadingDocuments) {
          fetchDocuments();
        }
        break;
      case TABS.TIME_TRACKING:
        if (timeLogs.length === 0 && !loadingTimeLogs) {
          fetchTimeLogs();
        }
        break;
      case TABS.VACATION:
        if (vacationRequests.length === 0 && !loadingVacation) {
          fetchVacationData();
        }
        break;
      case TABS.AUSBILDUNGEN:
        if (bildungsTags.length === 0 && !loadingBildungsTags) {
          fetchBildungsTags();
        }
        break;
      default:
        break;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ mt: 2 }}
        >
          Zurück zur Mitarbeiterliste
        </Button>
      </Box>
    );
  }
  
  if (!employee) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          Mitarbeiter nicht gefunden. Der gesuchte Mitarbeiter mit ID {id} existiert nicht.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ mt: 2 }}
        >
          Zurück zur Mitarbeiterliste
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 4 }}>
      {/* Zurück-Button */}
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/employees')}
        sx={{ mb: 3 }}
      >
        Zurück zur Übersicht
      </Button>
      
      {/* Header-Bereich */}
      <EmployeeHeader employee={employee} />
      
      {/* Tabs für verschiedene Sektionen */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Profil" id="tab-0" />
        <Tab label="Dokumente" id="tab-1" />
        <Tab label="Zeiterfassung" id="tab-2" />
        <Tab label="Urlaubsplanung" id="tab-3" />
        <Tab label="Ausbildungen" id="tab-4" />
      </Tabs>
      
      {/* Profilbereich */}
      {activeTab === TABS.PROFILE && <ProfileTab employee={employee} />}
      
      {/* Dokumentenbereich */}
      {activeTab === TABS.DOCUMENTS && (
        <DocumentsTab 
          documents={documents} 
          loading={loadingDocuments}
          error={documentsError}
          onRefresh={fetchDocuments}
          employeeId={id}
        />
      )}
      
      {/* Zeiterfassungsbereich */}
      {activeTab === TABS.TIME_TRACKING && (
        <TimeLogs 
          employeeId={id} 
          initialData={timeLogs}
          loading={loadingTimeLogs}
          error={timeLogsError}
        />
      )}
      
      {/* Urlaubsbereich */}
      {activeTab === TABS.VACATION && (
        <VacationTab 
          vacationRequests={vacationRequests} 
          vacationBalance={vacationBalance}
          loading={loadingVacation}
          error={vacationError}
          onRefresh={fetchVacationData}
        />
      )}
      
      {/* Ausbildungen-Bereich */}
      {activeTab === TABS.AUSBILDUNGEN && (
        <BildungstagTab 
          bildungsTags={bildungsTags}
          selectedBildungsTags={selectedBildungsTags}
          loadingBildungsTags={loadingBildungsTags}
          onRefresh={fetchBildungsTags}
        />
      )}
    </Box>
  );
};

export default EmployeeDetail; 