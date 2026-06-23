import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import EmployeeService from '../services/EmployeeService';
import CompanyService from '../services/CompanyService';
import ProfessionService from '../services/ProfessionService';
import { projectService } from '../services/projectService';

// Importieren der ausgelagerten Komponenten
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeTable from '../components/employees/EmployeeTable';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import DeleteEmployeeModal from '../components/employees/DeleteEmployeeModal';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';
import ImportEmployeesModal from '../components/employees/ImportEmployeesModal';

const Employees = () => {
  const { isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [bildungsTags, setBildungsTags] = useState([]);
  const [kurseFilter, setKurseFilter] = useState('');
  const [kurse, setKurse] = useState([]);
  const [berufeFilter, setBerufeFilter] = useState('');
  const [berufe, setBerufe] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    surname: '',
    position: '',
    company_id: '',
    email: '',
    phone: '',
    ahv: '',
    hire_date: new Date().toISOString().split('T')[0],
    employee_number: '',
    hourly_rate: '',
    hourly_rate_sale: '',
    minimum_wage: '',
    notification: '',
    project_ids: [],
    bildungs_tag_ids: [],
    course_ids: [],
    course_notes: {},
    password: '',
    checkPassword: '',
    customPosition: '',
    address: '',
    plz: '',
    place: '',
    birth: '',
    civil: '',
    idform: '',
    nationality: '',
    idexpirity: '',
    is_active: true
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [downloadingEmployeeListPdf, setDownloadingEmployeeListPdf] = useState(false);
  
  // Sortierung State
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [companiesRes, bildungsTagsRes, projectsRes, professionsRes, kurseRes] = await Promise.all([
          CompanyService.getCompanies(),
          api.get('/bildungs-tags'),
          api.get('/projects'),
          ProfessionService.getProfessions(),
          api.get('/courses')
        ]);

        setCompanies(companiesRes.data);
        
        // Stellen Sie sicher, dass projects immer ein Array ist
        const projectsData = projectsRes.data && projectsRes.data.data 
          ? projectsRes.data.data // Wenn die Antwort { data: [...] } ist
          : Array.isArray(projectsRes.data) 
            ? projectsRes.data // Wenn die Antwort ein Array ist
            : []; // Fallback auf leeres Array
        
        setProjects(projectsData);
        
        // Set professions data
        const professionsData = professionsRes.data && professionsRes.data.data 
          ? professionsRes.data.data 
          : Array.isArray(professionsRes.data) 
            ? professionsRes.data 
            : [];
        
        setProfessions(professionsData);
        setBerufe(professionsData); // Berufe = Professions
        //console.log("professionsData",professionsData);
        // Kurse/Positionen setzen
        const kurseData = kurseRes.data && kurseRes.data.data 
          ? kurseRes.data.data 
          : Array.isArray(kurseRes.data) 
            ? kurseRes.data 
            : [];
            
        setKurse(kurseData);
        
        let tagsData;
        if (Array.isArray(bildungsTagsRes.data)) {
          tagsData = bildungsTagsRes.data;
        } else if (bildungsTagsRes.data?.data && Array.isArray(bildungsTagsRes.data.data)) {
          tagsData = bildungsTagsRes.data.data;
        } else {
          console.warn('Unerwartetes Format für Bildungs-Tags:', bildungsTagsRes.data);
          tagsData = [];
        }
        
        setBildungsTags(tagsData);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setSnackbar({
          open: true,
          message: 'Fehler beim Laden der Daten',
          severity: 'error'
        });
        setBildungsTags([]);
        setProjects([]);
        setProfessions([]);
        setBerufe([]);
        setKurse([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mitarbeiter laden - als separate Funktion definieren
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const filters = { role: 'employee' };
      if (companyFilter) filters.company_id = companyFilter;
      if (berufeFilter) filters.profession_id = berufeFilter;
      if (kurseFilter) filters.position_id = kurseFilter;
      if (selectedTags && selectedTags.length > 0) filters.bildungs_tag_ids = selectedTags;
      

      const response = await EmployeeService.getEmployees(filters);
      
      // Debug: Prüfen, ob Kurse in der Antwort enthalten sind
      console.log('Mitarbeiter mit Kursen:', response.data);
      
      const formattedEmployees = response.data.map(emp => ({
        ...emp,
        name: emp.name || (emp.user?.name || ''),
        email: emp.email || (emp.user?.email || ''),
        active: emp.is_active !== undefined ? emp.is_active : (emp.active || false),
        company: emp.company || { name: 'Keine Firma' },
        phone: emp.phone || '',
        ahv: emp.ahv || '',
        bildungs_tags: emp.bildungs_tags || emp.bildungsTags || [],
        courses: emp.courses || []
      }));
      console.log("formattedEmployees",formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Laden der Mitarbeiter',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect für Mitarbeiter laden - nutzt jetzt die separate Funktion
  useEffect(() => {
    fetchEmployees();
  }, [companyFilter, selectedTags, berufeFilter, kurseFilter]);

  const filteredEmployees = employees.filter(employee => {
    const name = employee?.name?.toLowerCase() || '';
    const email = employee?.email?.toLowerCase() || '';
    const position = employee?.position?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();

    const ahv = employee?.ahv?.toLowerCase() || '';
    
    const matchesSearch = 
      name.includes(searchTermLower) ||
      position.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      ahv.includes(searchTermLower);
    
    const isActive = employee.active || employee.is_active;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && isActive) || 
      (statusFilter === 'inactive' && !isActive);
    
    const matchesCompany = companyFilter === '' || 
      employee.company_id === parseInt(companyFilter);
    
    const matchesBeruf = berufeFilter === '' || 
      (employee.professions && employee.professions.some(profession => profession.id === parseInt(berufeFilter)));
      
    const matchesKurs = kurseFilter === '' || 
      (employee.courses && employee.courses.some(course => course.id === parseInt(kurseFilter)));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tagId => {
        const employeeTags = employee.bildungs_tags || employee.bildungsTags || [];
        const hasTag = employeeTags.some(employeeTag => employeeTag.id === tagId);
        return hasTag;
      });
    
    return matchesSearch && matchesStatus && matchesCompany && matchesTags && matchesBeruf && matchesKurs;
    //return matchesSearch && matchesStatus && matchesCompany && matchesTags && matchesKurs;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewEmployee({
      name: '',
      surname: '',
      position: '',
      company_id: '',
      email: '',
      phone: '',
      ahv: '',
      hire_date: new Date().toISOString().split('T')[0],
      employee_number: '',
      hourly_rate: '',
      hourly_rate_sale: '',
      minimum_wage: '',
      notification: '',
      project_ids: [],
      bildungs_tag_ids: [],
      course_ids: [],
      course_notes: {},
      password: '',
      checkPassword: '',
      customPosition: '',
      address: '',
      plz: '',
      place: '',
      birth: '',
      civil: '',
      idform: '',
      nationality: '',
      idexpirity: '',
      is_active: true
    });
  };

  const handleAddEmployee = async () => {
    if (newEmployee.password !== newEmployee.checkPassword) {
      setSnackbar({
        open: true,
        message: 'Die Passwörter stimmen nicht überein.',
        severity: 'error'
      });
      return;
    }

    if (!newEmployee.password) {
      setSnackbar({
        open: true,
        message: 'Bitte geben Sie ein Passwort ein.',
        severity: 'error'
      });
      return;
    }

    try {
      // Wenn 'other' gewählt wurde, verwenden wir den eingegebenen Wert,
      // ansonsten den ausgewählten Beruf
      const position = newEmployee.position === 'other' 
        ? newEmployee.customPosition 
        : newEmployee.position;

      const employeeData = {
        name: newEmployee.name,
        surname: newEmployee.surname,
        email: newEmployee.email,
        company_id: newEmployee.company_id,
        position: position,
        ahv: newEmployee.ahv,
        hire_date: newEmployee.hire_date,
        employee_number: newEmployee.employee_number,
        hourly_rate: parseFloat(newEmployee.hourly_rate) || 0,
        hourly_rate_sale: parseFloat(newEmployee.hourly_rate_sale) || 0,
        minimum_wage: parseFloat(newEmployee.minimum_wage) || null,
        notification: newEmployee.notification || "",
        phone: newEmployee.phone,
        project_ids: newEmployee.project_ids,
        bildungs_tag_ids: newEmployee.bildungs_tag_ids || [],
        course_ids: newEmployee.course_ids || [],
        course_notes: newEmployee.course_notes || {},
        selected_courses: newEmployee.selected_courses || [],
        password: newEmployee.password,
        address: newEmployee.address || null,
        plz: newEmployee.plz || null,
        place: newEmployee.place || null,
        birth: newEmployee.birth || null,
        civil: newEmployee.civil || null,
        idform: newEmployee.idform || null,
        nationality: newEmployee.nationality || null,
        idexpirity: newEmployee.idexpirity || null,
        is_active: newEmployee.is_active
      };

      // Debug-Ausgabe
      console.log("Sende Mitarbeiterdaten mit Kursen:", {
        course_ids: employeeData.course_ids,
        course_notes: employeeData.course_notes,
        selected_courses: employeeData.selected_courses
      });

      // Sicherstellen, dass jeder Kurs eine Beschreibung hat
      if (employeeData.selected_courses && employeeData.selected_courses.length > 0 && (!employeeData.course_notes || Object.keys(employeeData.course_notes).length === 0)) {
        employeeData.course_notes = {};
        employeeData.selected_courses.forEach(course => {
          if (course && course.id) {
            employeeData.course_notes[course.id] = course.description || "Keine Benachrichtigung";
          }
        });
        console.log("Korrigierte course_notes:", employeeData.course_notes);
      }
      
      // Ähnliche Überprüfung für course_ids und course_notes
      if (employeeData.course_ids && employeeData.course_ids.length > 0 && (!employeeData.course_notes || Object.keys(employeeData.course_notes).length === 0)) {
        employeeData.course_notes = employeeData.course_notes || {};
        employeeData.course_ids.forEach(id => {
          if (!employeeData.course_notes[id]) {
            employeeData.course_notes[id] = "Keine Benachrichtigung";
          }
        });
        console.log("Korrigierte course_notes aus course_ids:", employeeData.course_notes);
      }

      // checkPassword wird nicht an den Server gesendet
      const response = await EmployeeService.createEmployee(employeeData);
      
      const newEmpWithRelations = response.data;
      
      const enrichedEmployee = {
        ...newEmpWithRelations,
        name: newEmpWithRelations.user ? newEmpWithRelations.user.name : newEmpWithRelations.name,
        email: newEmpWithRelations.user ? newEmpWithRelations.user.email : newEmpWithRelations.email
      };
      
      setEmployees(prev => [...prev, enrichedEmployee]);
      
      handleCloseAddDialog();
      setSnackbar({
        open: true,
        message: 'Mitarbeiter erfolgreich hinzugefügt',
        severity: 'success'
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitarbeiters:', error);
      let message = 'Fehler beim Hinzufügen des Mitarbeiters.';
      if (error.response && error.response.data && error.response.data.message) {
        message += ` ${error.response.data.message}`;
      }
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewEmployee(prev => ({
      ...prev,
      project_ids: typeof value === 'string' ? value.split(',') : value,
    }));
  };
  
  const handleStatusToggle = async (employeeId) => {
    try {
      const currentEmployee = employees.find(emp => emp.id === employeeId);
      if (!currentEmployee) {
        throw new Error('Mitarbeiter nicht gefunden');
      }
      
      const response = await EmployeeService.toggleEmployeeStatus(employeeId);
      const serverEmployee = response.data.employee;
      
      const updatedEmployee = {
        ...currentEmployee,
        is_active: serverEmployee.is_active,
        active: serverEmployee.is_active,
        user: serverEmployee.user || currentEmployee.user,
        name: serverEmployee.name || (serverEmployee.user?.name || currentEmployee.name),
        email: serverEmployee.email || (serverEmployee.user?.email || currentEmployee.email),
        ahv: serverEmployee.ahv || currentEmployee.ahv || '',
        phone: serverEmployee.phone || currentEmployee.phone || '',
        department: serverEmployee.department || currentEmployee.department,
        company: serverEmployee.company || currentEmployee.company
      };
      
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === employeeId ? updatedEmployee : emp
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Mitarbeiterstatus erfolgreich aktualisiert.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Mitarbeiterstatus:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Aktualisieren des Status.',
        severity: 'error'
      });
    }
  };

  const handleImportExport = () => {
    setImportModalOpen(true);
  };

  const handleDownloadEmployeeListPdf = async () => {
    setDownloadingEmployeeListPdf(true);
    try {
      const response = await EmployeeService.downloadEmployeeListPdf();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mitarbeiterliste_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim Herunterladen der Mitarbeiterliste:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Herunterladen der Mitarbeiterliste.',
        severity: 'error'
      });
    } finally {
      setDownloadingEmployeeListPdf(false);
    }
  };

  const handleImportComplete = () => {
    // Mitarbeiterliste neu laden
    fetchEmployees();
    setSnackbar({
      open: true,
      message: 'Import abgeschlossen. Mitarbeiterliste wurde aktualisiert.',
      severity: 'success'
    });
  };

  const handleDeleteDialog = (employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleEditEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      // Projektzuweisungen extrahieren
      const projectIds = employee.projects ? employee.projects.map(p => p.id) : [];
      
      // Bildungs-Tags extrahieren
      const bildungTagIds = employee.bildungsTags || employee.bildungs_tags || [];
      const bildungsTagsIds = Array.isArray(bildungTagIds) ? bildungTagIds.map(tag => tag.id) : [];
      
      // Kursinformationen extrahieren
      const courses = employee.courses || [];
      console.log("Extrahierte Kurse:", courses);
      
      // Wenn courses Objekte mit einer pivot-Eigenschaft haben, verwende diese für eine bessere Darstellung
      const coursesWithDescriptions = courses.map(course => {
        return {
          id: course.id,
          description: course.pivot?.description || ''
        };
      });
      console.log("Extrahierte Kurse mit Beschreibungen:", coursesWithDescriptions);
      
      const courseIds = courses.map(course => course.id);
      console.log("Extrahierte Kurs-IDs:", courseIds);
      
      // Stelle sicher, dass das surname-Feld korrekt gesetzt ist
      let surname = '';
      if (employee.user && employee.user.surname) {
        surname = employee.user.surname;
      }

      // Erstelle ein Objekt mit allen Mitarbeiterdaten für die Bearbeitung
      setEditEmployeeData({
        id: employee.id,
        name: employee.name || '',
        surname: surname,
        email: employee.email || (employee.user ? employee.user.email : ''),
        company_id: employee.company_id || '',
        position: employee.position || '',
        phone: employee.phone || '',
        ahv: employee.ahv || '',
        iban: employee.iban || '',
        hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : '',
        employee_number: employee.employee_number || '',
        hourly_rate: employee.hourly_rate || '',
        hourly_rate_sale: employee.hourly_rate_sale || '',
        minimum_wage: employee.minimum_wage || '',
        notification: employee.notification || '',
        project_ids: projectIds,
        bildungs_tag_ids: bildungsTagsIds,
        // Füge Kursinformationen hinzu
        courses: courses, // Direkt das komplette Kursobjekt mit Pivot-Daten
        selected_courses: coursesWithDescriptions, // Mit Beschreibungen
        course_ids: courseIds,
        address: employee.address || '',
        plz: employee.plz || '',
        place: employee.place || '',
        birth: employee.birth ? new Date(employee.birth).toISOString().split('T')[0] : '',
        civil: employee.civil || '',
        idform: employee.idform || '',
        nationality: employee.nationality || '',
        idexpirity: employee.idexpirity ? new Date(employee.idexpirity).toISOString().split('T')[0] : '',
        is_active: employee.is_active || false,
        password: '',
        checkPassword: ''
      });
      setEditModalOpen(true);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProjectChange = (event) => {
    const {
      target: { value },
    } = event;
    setEditEmployeeData(prev => ({
      ...prev,
      project_ids: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditEmployeeData(null);
  };

  const handleUpdateEmployee = async () => {
    try {
      // Passwort-Validierung
      if (editEmployeeData.password && editEmployeeData.password !== editEmployeeData.checkPassword) {
        setSnackbar({
          open: true,
          message: 'Die Passwörter stimmen nicht überein.',
          severity: 'error'
        });
        return;
      }

      // Wenn 'other' gewählt wurde, verwenden wir den eingegebenen Wert,
      // ansonsten den ausgewählten Beruf
      const position = editEmployeeData.position === 'other' 
        ? editEmployeeData.customPosition 
        : editEmployeeData.position;

      // Stelle sicher, dass course_ids ein Array ist
      const courseIds = editEmployeeData.course_ids || [];
      
      // Stelle sicher, dass course_notes ein Objekt ist
      const courseNotes = editEmployeeData.course_notes || {};

      // Stelle sicher, dass notification immer ein String ist
      // Besondere Behandlung für Mitarbeiter ID 6 aufgrund des bekannten Fehlers
      let notification = "";
      if (typeof editEmployeeData.notification === 'string') {
        notification = editEmployeeData.notification;
      } else if (editEmployeeData.notification === null || editEmployeeData.notification === undefined) {
        notification = "";
      } else {
        // Konvertiere alles andere zu String
        notification = String(editEmployeeData.notification);
      }

      console.log(`Debug notification für Mitarbeiter ID ${editEmployeeData.id}:`, {
        originalValue: editEmployeeData.notification,
        originalType: typeof editEmployeeData.notification,
        newValue: notification,
        newType: typeof notification
      });

      const employeeUpdateData = {
        name: editEmployeeData.name,
        surname: editEmployeeData.surname,
        email: editEmployeeData.email,
        company_id: editEmployeeData.company_id,
        position: position,
        ahv: editEmployeeData.ahv,
        iban: editEmployeeData.iban || "",
        hire_date: editEmployeeData.hire_date,
        employee_number: editEmployeeData.employee_number,
        hourly_rate: parseFloat(editEmployeeData.hourly_rate) || 0,
        hourly_rate_sale: parseFloat(editEmployeeData.hourly_rate_sale) || 0,
        minimum_wage: parseFloat(editEmployeeData.minimum_wage) || null,
        notification: notification, // Verwende den explizit als String konvertierten Wert
        phone: editEmployeeData.phone,
        project_ids: editEmployeeData.project_ids,
        bildungs_tag_ids: editEmployeeData.bildungs_tag_ids || [],
        course_ids: courseIds,
        course_notes: courseNotes, // Füge course_notes hinzu
        address: editEmployeeData.address || "",
        plz: editEmployeeData.plz || "",
        place: editEmployeeData.place || "",
        birth: editEmployeeData.birth || null,
        civil: editEmployeeData.civil || "",
        idform: editEmployeeData.idform || "",
        nationality: editEmployeeData.nationality || "",
        idexpirity: editEmployeeData.idexpirity || null,
        is_active: editEmployeeData.is_active
      };

      // Passwort nur hinzufügen, wenn es gesetzt wurde
      if (editEmployeeData.password && editEmployeeData.password.trim() !== '') {
        employeeUpdateData.password = editEmployeeData.password;
      }

      // Vollständige Debug-Ausgabe
      console.log("Vollständige Mitarbeiterdaten, die gesendet werden:", employeeUpdateData);
      console.log("Kursdaten im Detail:", {
        course_ids: employeeUpdateData.course_ids,
        course_ids_length: employeeUpdateData.course_ids.length
      });
      
      // Detaillierte Debug-Ausgabe für die korrekte Struktur
      console.log("Struktur der Kursdaten:", {
        course_ids_type: typeof employeeUpdateData.course_ids,
        is_array: Array.isArray(employeeUpdateData.course_ids),
        length: employeeUpdateData.course_ids?.length || 0
      });
      
      // HINWEIS: course_descriptions wurden entfernt, Backend muss evtl. angepasst werden
      console.log("WICHTIG: course_descriptions wurden entfernt - Backend sollte course_ids ähnlich wie bildungs_tag_ids behandeln");

      let response;
      
      // Verwende die spezielle Fallback-Methode für Mitarbeiter mit ID 6
      if (editEmployeeData.id === 6) {
        console.log("Verwende spezielle Fallback-Methode für Mitarbeiter ID 6");
        response = await EmployeeService.updateEmployeeWithFallback(editEmployeeData.id, employeeUpdateData);
      } else {
        // Normale Methode für alle anderen Mitarbeiter
        response = await EmployeeService.updateEmployee(editEmployeeData.id, employeeUpdateData);
      }
      
      const updatedEmployee = response.data;
      
      // Aktualisiere den Mitarbeiter in der Liste
      setEmployees(prev => prev.map(emp => 
        emp.id === updatedEmployee.id ? {
          ...updatedEmployee,
          name: updatedEmployee.user ? updatedEmployee.user.name : updatedEmployee.name,
          email: updatedEmployee.user ? updatedEmployee.user.email : updatedEmployee.email
        } : emp
      ));
      
      handleCloseEditModal();
      setSnackbar({
        open: true,
        message: 'Mitarbeiter erfolgreich aktualisiert',
        severity: 'success'
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Mitarbeiters:', error);
      let message = 'Fehler beim Aktualisieren des Mitarbeiters.';
      
      if (error.response) {
        console.error('Fehler-Status:', error.response.status);
        console.error('Fehler-Daten:', error.response.data);
        console.error('Fehler-Headers:', error.response.headers);
        console.error('Fehler-Config:', error.config);
        
        if (error.response.status === 422) {
          console.error('Validierungsfehler beim Aktualisieren des Mitarbeiters');
          
          if (error.response.data && error.response.data.errors) {
            // Zeige alle Validierungsfehler an
            console.error('Validierungsfehler:', error.response.data.errors);
            // Detaillierte Analyse des notification-Felds
            if (error.response.data.errors.notification) {
              console.error('Notification-Fehler im Detail:', {
                validationError: error.response.data.errors.notification,
                sentValue: editEmployeeData.notification || '',
                valueType: typeof editEmployeeData.notification
              });
            }
            
            const errorFields = Object.keys(error.response.data.errors);
            const firstErrorField = errorFields[0];
            const firstErrorMessage = error.response.data.errors[firstErrorField][0];
            
            message += ` Validierungsfehler: ${firstErrorField} - ${firstErrorMessage}`;
          } else if (error.response.data && error.response.data.message) {
            message += ` ${error.response.data.message}`;
            console.error('Fehlermeldung im Detail:', error.response.data.message);
          }
        } else if (error.response.data && error.response.data.message) {
          message += ` ${error.response.data.message}`;
        }
      } else if (error.request) {
        console.error('Keine Antwort erhalten, Request:', error.request);
        message += ' Keine Antwort vom Server erhalten.';
      } else {
        console.error('Fehler beim Setup der Anfrage:', error.message);
        message += ` ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await EmployeeService.deleteEmployee(selectedEmployee.id);
      setEmployees(prevEmployees => 
        prevEmployees.filter(emp => emp.id !== selectedEmployee.id)
      );
      setSnackbar({
        open: true,
        message: 'Mitarbeiter erfolgreich gelöscht.',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Fehler beim Löschen des Mitarbeiters:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Löschen des Mitarbeiters.',
        severity: 'error'
      });
    }
  };

  const navigateToEmployee = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  // Sortierfunktion für Mitarbeiter
  const sortEmployees = (employees, orderBy, order) => {
    return [...employees].sort((a, b) => {
      let nameA = '';
      let nameB = '';
      
      if (orderBy === 'name') {
        nameA = (a.user?.surname ? `${a.name} ${a.user.surname}` : a.name) || '';
        nameB = (b.user?.surname ? `${b.name} ${b.user.surname}` : b.name) || '';
      }
      
      if (order === 'asc') {
        return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
      } else {
        return nameB.localeCompare(nameA, 'de', { sensitivity: 'base' });
      }
    });
  };

  // Handler für Sortierung
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        Mitarbeiter
      </Typography>

      <EmployeeFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        companies={companies}
        bildungsTags={bildungsTags}
        berufeFilter={berufeFilter}
        setBerufeFilter={setBerufeFilter}
        berufe={berufe}
        kurseFilter={kurseFilter}
        setKurseFilter={setKurseFilter}
        kurse={kurse}
        handleOpenAddDialog={handleOpenAddDialog}
        handleImportExport={handleImportExport}
        handleDownloadEmployeeListPdf={handleDownloadEmployeeListPdf}
        downloadingEmployeeListPdf={downloadingEmployeeListPdf}
        isMobile={isMobile}
      />

      <EmployeeTable
        employees={sortEmployees(filteredEmployees, orderBy, order)}
        page={page}
        rowsPerPage={rowsPerPage}
        isMobile={isMobile}
        order={order}
        orderBy={orderBy}
        onRequestSort={handleRequestSort}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        handleStatusToggle={handleStatusToggle}
        handleDeleteDialog={handleDeleteDialog}
        handleEditEmployee={handleEditEmployee}
        navigateToEmployee={navigateToEmployee}
      />

      <AddEmployeeModal
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        newEmployee={newEmployee}
        handleInputChange={handleInputChange}
        handleProjectChange={handleProjectChange}
        handleAddEmployee={handleAddEmployee}
        companies={companies}
        projects={projects}
        professions={professions}
        bildungsTags={bildungsTags}
        isManager={isManager()}
      />

      <DeleteEmployeeModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        employee={selectedEmployee}
        onDelete={handleDeleteEmployee}
            />

      {editEmployeeData && (
        <EditEmployeeModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          employeeData={editEmployeeData}
          handleInputChange={handleEditInputChange}
          handleProjectChange={handleEditProjectChange}
          handleUpdateEmployee={handleUpdateEmployee}
          companies={companies}
          projects={projects}
          professions={professions}
          bildungsTags={bildungsTags}
          isManager={isManager()}
        />
      )}

      <ImportEmployeesModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={handleImportComplete}
        companies={companies}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees;
