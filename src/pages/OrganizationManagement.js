import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import OrganizationService from '../services/OrganizationService';
import ProfessionService from '../services/ProfessionService';
import CourseService from '../services/CourseService';
import BildungsTagService from '../services/BildungsTagService';
import DocumentTypeService from '../services/DocumentTypeService';
import BerufeTab from '../components/organization/BerufeTab';
import KurseTab from '../components/organization/KurseTab';
import BildungsTagTab from '../components/organization/BildungsTagTab';
import BaustellenTab from '../components/organization/BaustellenTab';
import QualifikationenTab from '../components/organization/QualifikationenTab';
import DokumentTypenTab from '../components/organization/DokumentTypenTab';
import BerufeModal from '../components/organization/BerufeModal';
import KurseModal from '../components/organization/KurseModal';
import BildungsTagModal from '../components/organization/BildungsTagModal';
import BaustellenModal from '../components/organization/BaustellenModal';
import QualifikationenModal from '../components/organization/QualifikationenModal';
import DokumentTypenModal from '../components/organization/DokumentTypenModal';

// Tab-Konstanten
const TABS = {
  PROJECTS: 0,
  DEPARTMENTS: 1,
  POSITIONS: 2,
  BILDUNGS_TAGS: 3,
  DOCUMENT_TYPES: 4
};

const OrganizationManagement = () => {
  const [activeTab, setActiveTab] = useState(TABS.PROJECTS);
  const [departments, setDepartments] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bildungsTags, setBildungsTags] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog-States
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openPosDialog, setOpenPosDialog] = useState(false);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openBildungsTagDialog, setOpenBildungsTagDialog] = useState(false);
  const [openDocumentTypeDialog, setOpenDocumentTypeDialog] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [openQualificationDialog, setOpenQualificationDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Paginierung und Sortierung
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Daten laden
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Professions (Berufe) laden
        const professionsResponse = await ProfessionService.getProfessions();
        console.log('Professions API Response:', professionsResponse);
        console.log('Professions Response Data:', professionsResponse.data);
        
        const professionsData = professionsResponse.data || [];
        console.log('Professions Data before validation:', professionsData);
        console.log('Is professionsData an array?', Array.isArray(professionsData));
        
        // Sicherstellen, dass professionsData ein Array ist
        const validProfessionsData = Array.isArray(professionsData) ? professionsData : [];
        console.log('Valid Professions Data:', validProfessionsData);
        
        const formattedProfessions = validProfessionsData.map(profession => ({
          ...profession,
          code: profession.code || profession.name?.substring(0, 3).toUpperCase() || '',
          description: profession.description || '',
          employee_count: profession.employee_count || 0
        }));
        
        setProfessions(formattedProfessions);
        setDepartments(formattedProfessions); // Für Kompatibilität mit BerufeTab
        setPositions([]); // Leeres Array für Positionen setzen
        
        // Firmen laden
        const companyResponse = await OrganizationService.getAllCompanies();
        console.log('Companies API Response:', companyResponse);
        const companiesData = companyResponse.data || [];
        
        // Sicherstellen, dass companiesData ein Array ist
        const validCompaniesData = Array.isArray(companiesData) ? companiesData : [];
        
        setCompanies(validCompaniesData);
        
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Organisationsdaten:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        setError('Daten konnten nicht geladen werden.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Projekte basierend auf ausgewählter Firma laden
  useEffect(() => {
    const fetchProjects = async () => {
      if (activeTab === TABS.PROJECTS) {
        try {
          setLoading(true);
          let response;
          
          if (selectedCompany) {
            response = await OrganizationService.getProjectsByCompany(selectedCompany);
          } else {
            response = await OrganizationService.getAllProjects();
          }
          
          const projectsData = response.data?.data || [];
          setProjects(Array.isArray(projectsData) ? projectsData : []);
          
          setLoading(false);
        } catch (error) {
          console.error('Fehler beim Laden der Projekte:', error);
          setError('Projekte konnten nicht geladen werden.');
          setLoading(false);
        }
      }
    };
    
    fetchProjects();
  }, [activeTab, selectedCompany]);

  // Professions laden wenn Berufe-Tab aktiv wird
  useEffect(() => {
    const fetchProfessions = async () => {
      if (activeTab === TABS.DEPARTMENTS) {
        try {
          setLoading(true);
          const professionsResponse = await ProfessionService.getProfessions();
          console.log('Professions Tab API Response:', professionsResponse);
          
          const professionsData = professionsResponse.data || [];
          console.log('Professions Tab Data before validation:', professionsData);
          
          // Sicherstellen, dass professionsData ein Array ist
          const validProfessionsData = Array.isArray(professionsData) ? professionsData : [];
          
          const formattedProfessions = validProfessionsData.map(profession => ({
            ...profession,
            code: profession.code || profession.name?.substring(0, 3).toUpperCase() || '',
            description: profession.description || '',
            employee_count: profession.employee_count || 0
          }));
          
          setProfessions(formattedProfessions);
          setDepartments(formattedProfessions); // Für Kompatibilität mit BerufeTab
          setLoading(false);
        } catch (error) {
          console.error('Fehler beim Laden der Berufe:', error);
          console.error('Berufe Error details:', {
            message: error.message,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data
          });
          setError('Berufe konnten nicht geladen werden.');
          setLoading(false);
        }
      }
    };
    
    fetchProfessions();
  }, [activeTab]);

  // Courses laden wenn Kurse-Tab aktiv wird
  useEffect(() => {
    const fetchCourses = async () => {
      if (activeTab === TABS.POSITIONS) {
        try {
          setLoading(true);
          const coursesResponse = await CourseService.getAllCourses();
          const coursesData = coursesResponse.data || [];
          
          // Sicherstellen, dass coursesData ein Array ist
          const validCoursesData = Array.isArray(coursesData) ? coursesData : [];
          
          setCourses(validCoursesData);
          setLoading(false);
        } catch (error) {
          console.error('Fehler beim Laden der Kurse:', error);
          setError('Kurse konnten nicht geladen werden.');
          setLoading(false);
        }
      }
    };
    
    fetchCourses();
  }, [activeTab]);

  // BildungsTags laden wenn Bildungs-Tags-Tab aktiv wird
  useEffect(() => {
    const fetchBildungsTags = async () => {
      if (activeTab === TABS.BILDUNGS_TAGS) {
        try {
          setLoading(true);
          const bildungsTagsResponse = await BildungsTagService.getAllBildungsTags();
          const bildungsTagsData = bildungsTagsResponse.data || [];
          
          // Sicherstellen, dass bildungsTagsData ein Array ist
          const validBildungsTagsData = Array.isArray(bildungsTagsData) ? bildungsTagsData : [];
          
          setBildungsTags(validBildungsTagsData);
          setLoading(false);
        } catch (error) {
          console.error('Fehler beim Laden der Bildungs-Tags:', error);
          setError('Bildungs-Tags konnten nicht geladen werden.');
          setLoading(false);
        }
      }
    };
    
    fetchBildungsTags();
  }, [activeTab]);

  // DocumentTypes laden wenn Dokumenttypen-Tab aktiv wird
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      if (activeTab === TABS.DOCUMENT_TYPES) {
        try {
          setLoading(true);
          const documentTypesResponse = await DocumentTypeService.getDocumentTypes();
          const documentTypesData = documentTypesResponse.data || [];
          
          // Sicherstellen, dass documentTypesData ein Array ist
          const validDocumentTypesData = Array.isArray(documentTypesData) ? documentTypesData : [];
          
          setDocumentTypes(validDocumentTypesData);
          setLoading(false);
        } catch (error) {
          console.error('Fehler beim Laden der Dokumenttypen:', error);
          setError('Dokumenttypen konnten nicht geladen werden.');
          setLoading(false);
        }
      }
    };
    
    fetchDocumentTypes();
  }, [activeTab]);
  
  // Tab wechseln
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Firma wechseln
  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };
  
  // Dialog-Handler für Abteilungen/Berufe
  const handleOpenDeptDialog = (dept = null) => {
    setEditItem(dept);
    setOpenDeptDialog(true);
  };
  
  const handleCloseDeptDialog = () => {
    setOpenDeptDialog(false);
    setEditItem(null);
  };
  
  // Dialog-Handler für Positionen
  const handleOpenPosDialog = (pos = null) => {
    setEditItem(pos);
    setOpenPosDialog(true);
  };
  
  const handleClosePosDialog = () => {
    setOpenPosDialog(false);
    setEditItem(null);
  };

  // Dialog-Handler für Kurse
  const handleOpenCourseDialog = (course = null) => {
    setEditItem(course);
    setOpenCourseDialog(true);
  };
  
  const handleCloseCourseDialog = () => {
    setOpenCourseDialog(false);
    setEditItem(null);
  };

  // Dialog-Handler für Bildungs-Tags
  const handleOpenBildungsTagDialog = (bildungsTag = null) => {
    setEditItem(bildungsTag);
    setOpenBildungsTagDialog(true);
  };
  
  const handleCloseBildungsTagDialog = () => {
    setOpenBildungsTagDialog(false);
    setEditItem(null);
  };

  // Dialog-Handler für Dokumenttypen
  const handleOpenDocumentTypeDialog = (documentType = null) => {
    setEditItem(documentType);
    setOpenDocumentTypeDialog(true);
  };
  
  const handleCloseDocumentTypeDialog = () => {
    setOpenDocumentTypeDialog(false);
    setEditItem(null);
  };

  // Dialog-Handler für Projekte
  const handleOpenProjectDialog = (project = null) => {
    setEditItem(project);
    setOpenProjectDialog(true);
  };
  
  const handleCloseProjectDialog = () => {
    setOpenProjectDialog(false);
    setEditItem(null);
  };
  
  // Dialog-Handler für Qualifikationen
  const handleOpenQualificationDialog = (qualification = null) => {
    setEditItem(qualification);
    setOpenQualificationDialog(true);
  };
  
  const handleCloseQualificationDialog = () => {
    setOpenQualificationDialog(false);
    setEditItem(null);
  };
  
  // Handler für Speichern von Berufen
  const handleSaveDepartment = async (newProfession) => {
    try {
      if (editItem) {
        const response = await ProfessionService.updateProfession(editItem.id, newProfession);
        const updatedProfessions = professions.map(profession => 
          profession.id === editItem.id ? { ...profession, ...response.data } : profession
        );
        setProfessions(updatedProfessions);
        setDepartments(updatedProfessions); // Für Kompatibilität mit BerufeTab
      } else {
        const response = await ProfessionService.createProfession(newProfession);
        const newProfessions = [...professions, response.data];
        setProfessions(newProfessions);
        setDepartments(newProfessions); // Für Kompatibilität mit BerufeTab
      }
      handleCloseDeptDialog();
    } catch (error) {
      console.error('Fehler beim Speichern des Berufs:', error);
      alert('Fehler beim Speichern des Berufs: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Handler für Speichern von Positionen
  const handleSavePosition = async (newPosition) => {
    try {
      if (editItem) {
        const response = await OrganizationService.updatePosition(editItem.id, newPosition);
        const updatedPositions = positions.map(pos => 
          pos.id === editItem.id ? { ...pos, ...response.data } : pos
        );
        setPositions(updatedPositions);
      } else {
        const response = await OrganizationService.createPosition(newPosition);
        setPositions([...positions, response.data]);
      }
      handleClosePosDialog();
    } catch (error) {
      console.error('Fehler beim Speichern der Position:', error);
      alert('Fehler beim Speichern der Position!');
    }
  };

  // Handler für Speichern von Kursen
  const handleSaveCourse = async (newCourse) => {
    try {
      if (editItem) {
        const response = await CourseService.updateCourse(editItem.id, newCourse);
        const updatedCourses = courses.map(course => 
          course.id === editItem.id ? { ...course, ...response.data } : course
        );
        setCourses(updatedCourses);
      } else {
        const response = await CourseService.createCourse(newCourse);
        setCourses([...courses, response.data]);
      }
      handleCloseCourseDialog();
    } catch (error) {
      console.error('Fehler beim Speichern des Kurses:', error);
      alert('Fehler beim Speichern des Kurses: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handler für Speichern von Bildungs-Tags
  const handleSaveBildungsTag = async (newBildungsTag) => {
    try {
      if (editItem) {
        const response = await BildungsTagService.updateBildungsTag(editItem.id, newBildungsTag);
        const updatedBildungsTags = bildungsTags.map(tag => 
          tag.id === editItem.id ? { ...tag, ...response.data } : tag
        );
        setBildungsTags(updatedBildungsTags);
      } else {
        const response = await BildungsTagService.createBildungsTag(newBildungsTag);
        setBildungsTags([...bildungsTags, response.data]);
      }
      handleCloseBildungsTagDialog();
    } catch (error) {
      console.error('Fehler beim Speichern des Bildungs-Tags:', error);
      alert('Fehler beim Speichern des Bildungs-Tags: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handler für Speichern von Dokumenttypen
  const handleSaveDocumentType = async (newDocumentType) => {
    try {
      if (editItem) {
        const response = await DocumentTypeService.updateDocumentType(editItem.id, newDocumentType);
        const updatedDocumentTypes = documentTypes.map(docType => 
          docType.id === editItem.id ? { ...docType, ...response.data } : docType
        );
        setDocumentTypes(updatedDocumentTypes);
      } else {
        const response = await DocumentTypeService.createDocumentType(newDocumentType);
        setDocumentTypes([...documentTypes, response.data]);
      }
      handleCloseDocumentTypeDialog();
    } catch (error) {
      console.error('Fehler beim Speichern des Dokumenttyps:', error);
      alert('Fehler beim Speichern des Dokumenttyps: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Handler für Speichern von Projekten
  const handleSaveProject = async (newProject, selectedCompanies) => {
    try {
      let projectId;
      
      if (editItem) {
        const response = await OrganizationService.updateProject(editItem.id, newProject);
        console.log("response", response);
        projectId = editItem.id;
      } else {
        const response = await OrganizationService.createProject(newProject);
        projectId = response.data.id;
      }
      
      // Firmen aktualisieren
      if (projectId && selectedCompanies) {
        try {
          const partnerCompaniesResponse = await OrganizationService.getProjectPartnerCompanies(projectId);
          const currentPartnerIds = (partnerCompaniesResponse.data?.data || []).map(company => company.id);
          
          // Unternehmen entfernen, die nicht mehr ausgewählt sind
          const companiesToRemove = currentPartnerIds.filter(id => !selectedCompanies.includes(id));
          for (const companyId of companiesToRemove) {
            await OrganizationService.detachCompanyFromProject(projectId, companyId);
          }
          
          // Neu ausgewählte Unternehmen hinzufügen
          const companiesToAdd = selectedCompanies.filter(id => !currentPartnerIds.includes(id));
          for (const companyId of companiesToAdd) {
            await OrganizationService.attachCompanyToProject(projectId, companyId);
          }
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Firmen:', error);
        }
      }
      
      // Projekte neu laden
      const updatedResponse = selectedCompany 
        ? await OrganizationService.getProjectsByCompany(selectedCompany)
        : await OrganizationService.getAllProjects();
      
      const projectsData = updatedResponse.data?.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      
      handleCloseProjectDialog();
    } catch (error) {
      console.error('Fehler beim Speichern des Projekts:', error);
      alert('Fehler beim Speichern des Projekts: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Handler für Löschen von Berufen
  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Möchten Sie diesen Beruf wirklich löschen?')) {
      try {
        await ProfessionService.deleteProfession(id);
        const updatedProfessions = professions.filter(profession => profession.id !== id);
        setProfessions(updatedProfessions);
        setDepartments(updatedProfessions); // Für Kompatibilität mit BerufeTab
      } catch (error) {
        console.error('Fehler beim Löschen des Berufs:', error);
        alert('Fehler beim Löschen des Berufs!');
      }
    }
  };
  
  // Handler für Löschen von Positionen
  const handleDeletePosition = async (id) => {
    if (window.confirm('Möchten Sie diese Position wirklich löschen?')) {
      try {
        await OrganizationService.deletePosition(id);
        setPositions(positions.filter(pos => pos.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen der Position:', error);
        alert('Fehler beim Löschen der Position!');
      }
    }
  };

  // Handler für Löschen von Kursen
  const handleDeleteCourse = async (id) => {
    if (window.confirm('Möchten Sie diesen Kurs wirklich löschen?')) {
      try {
        await CourseService.deleteCourse(id);
        setCourses(courses.filter(course => course.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen des Kurses:', error);
        alert('Fehler beim Löschen des Kurses!');
      }
    }
  };

  // Handler für Löschen von Bildungs-Tags
  const handleDeleteBildungsTag = async (id) => {
    if (window.confirm('Möchten Sie diesen Bildungs-Tag wirklich löschen?')) {
      try {
        await BildungsTagService.deleteBildungsTag(id);
        setBildungsTags(bildungsTags.filter(tag => tag.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen des Bildungs-Tags:', error);
        alert('Fehler beim Löschen des Bildungs-Tags!');
      }
    }
  };

  // Handler für Löschen von Dokumenttypen
  const handleDeleteDocumentType = async (id, name = '') => {
    if (window.confirm(`Möchten Sie den Dokumenttyp "${name}" wirklich löschen?`)) {
      try {
        await DocumentTypeService.deleteDocumentType(id);
        setDocumentTypes(documentTypes.filter(docType => docType.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen des Dokumenttyps:', error);
        alert('Fehler beim Löschen des Dokumenttyps!');
      }
    }
  };
  
  // Handler für Löschen von Projekten
  const handleDeleteProject = async (id) => {
    if (window.confirm('Möchten Sie diese Baustelle wirklich löschen?')) {
      try {
        await OrganizationService.deleteProject(id);
        // Projekte neu laden
        const response = selectedCompany 
          ? await OrganizationService.getProjectsByCompany(selectedCompany)
          : await OrganizationService.getAllProjects();
        
        const projectsData = response.data?.data || [];
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error('Fehler beim Löschen des Projekts:', error);
        alert('Fehler beim Löschen des Projekts!');
      }
    }
  };
  
  // Handler für Ändern des Projektstatus
  const handleToggleProjectStatus = async (projectId, newStatus) => {
    try {
      await OrganizationService.updateProjectStatus(projectId, newStatus);
      
      // Projekte neu laden
      const response = selectedCompany 
        ? await OrganizationService.getProjectsByCompany(selectedCompany)
        : await OrganizationService.getAllProjects();
      
      const projectsData = response.data?.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Fehler beim Ändern des Projektstatus:', error);
      alert('Fehler beim Ändern des Projektstatus: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Sortierung und Paginierung
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handler für Speichern von Qualifikationen
  const handleSaveQualification = async (newQualification) => {
    try {
      if (editItem) {
        // Hier würde die API-Funktion für das Aktualisieren einer Qualifikation aufgerufen werden
        // const response = await OrganizationService.updateQualification(editItem.id, newQualification);
        // const updatedQualifications = qualifications.map(qual => 
        //   qual.id === editItem.id ? { ...qual, ...response.data } : qual
        // );
        // setQualifications(updatedQualifications);
        
        // Vorläufig nur lokale Aktualisierung:
        const updatedQualifications = qualifications.map(qual => 
          qual.id === editItem.id ? { ...qual, ...newQualification } : qual
        );
        setQualifications(updatedQualifications);
      } else {
        // Hier würde die API-Funktion für das Erstellen einer Qualifikation aufgerufen werden
        // const response = await OrganizationService.createQualification(newQualification);
        // setQualifications([...qualifications, response.data]);
        
        // Vorläufig nur lokale Erstellung mit temporärer ID:
        const tempId = Date.now();
        setQualifications([...qualifications, { id: tempId, ...newQualification }]);
      }
      handleCloseQualificationDialog();
    } catch (error) {
      console.error('Fehler beim Speichern der Qualifikation:', error);
      alert('Fehler beim Speichern der Qualifikation: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Handler für Löschen von Qualifikationen
  const handleDeleteQualification = async (id) => {
    if (window.confirm('Möchten Sie diese Qualifikation wirklich löschen?')) {
      try {
        // Hier würde die API-Funktion für das Löschen einer Qualifikation aufgerufen werden
        // await OrganizationService.deleteQualification(id);
        
        // Vorläufig nur lokale Entfernung:
        setQualifications(qualifications.filter(qual => qual.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen der Qualifikation:', error);
        alert('Fehler beim Löschen der Qualifikation!');
      }
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Organisationsverwaltung
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Baustellen" id="tab-0" />
        <Tab label="Berufe" id="tab-1" />
        <Tab label="Kurse" id="tab-2" />
        <Tab label="Qualifikationen" id="tab-3" />
        <Tab label="Dokumenttypen" id="tab-4" />
      </Tabs>
      
      {/* Projekte/Baustellen */}
      {activeTab === TABS.PROJECTS && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Baustellenliste</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="company-select-label">Nach Firma filtern</InputLabel>
                <Select
                  labelId="company-select-label"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  label="Nach Firma filtern"
                >
                  <MenuItem value="">Alle Firmen</MenuItem>
                  {Array.isArray(companies) && companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenProjectDialog()}
              >
                Neue Baustelle
              </Button>
            </Box>
          </Box>
          
          <BaustellenTab 
            projects={projects}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleOpenProjectDialog={handleOpenProjectDialog}
            handleDeleteProject={handleDeleteProject}
            handleToggleProjectStatus={handleToggleProjectStatus}
          />
        </Paper>
      )}
      
      {/* Berufe */}
      {activeTab === TABS.DEPARTMENTS && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Berufe
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDeptDialog()}
            >
              Neuer Beruf
            </Button>
          </Box>
          
          <BerufeTab 
            departments={departments}
            orderBy={orderBy}
            order={order}
            page={page}
            rowsPerPage={rowsPerPage}
            handleRequestSort={handleRequestSort}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleOpenDeptDialog={handleOpenDeptDialog}
            handleDeleteDepartment={handleDeleteDepartment}
          />
        </Paper>
      )}
      
      {/* Kurse */}
      {activeTab === TABS.POSITIONS && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Kurse
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenCourseDialog()}
            >
              Neuer Kurs
            </Button>
          </Box>
          
          <KurseTab 
            courses={courses}
            orderBy={orderBy}
            order={order}
            page={page}
            rowsPerPage={rowsPerPage}
            handleRequestSort={handleRequestSort}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleOpenCourseDialog={handleOpenCourseDialog}
            handleDeleteCourse={handleDeleteCourse}
          />
        </Paper>
      )}
      
      {/* Bildungs-Tags */}
      {activeTab === TABS.BILDUNGS_TAGS && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Bildungs-Tags
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenBildungsTagDialog()}
            >
              Neuer Bildungs-Tag
            </Button>
          </Box>
          
          <BildungsTagTab 
            bildungsTags={bildungsTags}
            orderBy={orderBy}
            order={order}
            page={page}
            rowsPerPage={rowsPerPage}
            handleRequestSort={handleRequestSort}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleOpenBildungsTagDialog={handleOpenBildungsTagDialog}
            handleDeleteBildungsTag={handleDeleteBildungsTag}
          />
        </Paper>
      )}
      
      {/* Dokumenttypen */}
      {activeTab === TABS.DOCUMENT_TYPES && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Dokumenttypen
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDocumentTypeDialog()}
            >
              Neuer Dokumenttyp
            </Button>
          </Box>
          
          <DokumentTypenTab 
            documentTypes={documentTypes}
            orderBy={orderBy}
            order={order}
            page={page}
            rowsPerPage={rowsPerPage}
            handleRequestSort={handleRequestSort}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleOpenDocumentTypeDialog={handleOpenDocumentTypeDialog}
            handleDeleteDocumentType={handleDeleteDocumentType}
          />
        </Paper>
      )}
      
      {/* Modals/Dialoge */}
      <BerufeModal 
        open={openDeptDialog}
        onClose={handleCloseDeptDialog}
        onSave={handleSaveDepartment}
        editItem={editItem}
      />
      
      <KurseModal 
        open={openCourseDialog}
        onClose={handleCloseCourseDialog}
        onSave={handleSaveCourse}
        editItem={editItem}
      />

      <BildungsTagModal 
        open={openBildungsTagDialog}
        onClose={handleCloseBildungsTagDialog}
        onSave={handleSaveBildungsTag}
        editItem={editItem}
      />
      
      <BaustellenModal 
        open={openProjectDialog}
        onClose={handleCloseProjectDialog}
        onSave={handleSaveProject}
        editItem={editItem}
        companies={companies}
      />
      
      <QualifikationenModal
        open={openQualificationDialog}
        onClose={handleCloseQualificationDialog}
        onSave={handleSaveQualification}
        editItem={editItem}
      />

      <DokumentTypenModal
        open={openDocumentTypeDialog}
        onClose={handleCloseDocumentTypeDialog}
        onSave={handleSaveDocumentType}
        editItem={editItem}
      />
    </Box>
  );
};

export default OrganizationManagement;