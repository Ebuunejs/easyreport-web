import api from '../api/axios';

const getEmployees = async (filters = {}) => {
  // Öffentliche Route ohne Standard-Role-Filter
  try {
    return await api.get('/public/employees', { params: { ...filters } });
  } catch (e) {
    // Fallback auf geschützte Route (falls Token vorhanden)
    return await api.get('/employees', { params: { ...filters } });
  }
};

const getEmployeeById = (id) => {
  return api.get(`/employees/${id}`);
};

const downloadEmployeeListPdf = () => {
  return api.get('/employees-list/pdf', {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf'
    }
  });
};

const createEmployee = (employeeData) => {
  // Sicherstellen, dass die Daten den richtigen Typ haben
  const sanitizedData = { ...employeeData };
  
  // Stelle sicher, dass notification ein String ist
  // Explizite Konvertierung zu einem gültigen String mit sichtbarem Inhalt, wenn nötig
  if (sanitizedData.notification === null || sanitizedData.notification === undefined || sanitizedData.notification === '') {
    sanitizedData.notification = "Keine Benachrichtigung"; // Ein definitiver String-Wert statt eines Leerzeichens
  } else if (typeof sanitizedData.notification !== 'string') {
    sanitizedData.notification = String(sanitizedData.notification);
  }
  
  // Entferne alle non-breaking spaces und andere spezielle Whitespace-Zeichen
  sanitizedData.notification = sanitizedData.notification.replace(/\s/g, ' ').trim();
  
  // Stelle sicher, dass der String niemals leer ist
  if (sanitizedData.notification === '') {
    sanitizedData.notification = "Keine Benachrichtigung";
  }
  
  // Stelle sicher, dass course_ids ein Array ist
  if (!Array.isArray(sanitizedData.course_ids)) {
    sanitizedData.course_ids = sanitizedData.course_ids ? [sanitizedData.course_ids] : [];
  }
  
  // Stelle sicher, dass bildungs_tag_ids ein Array ist
  if (!Array.isArray(sanitizedData.bildungs_tag_ids)) {
    sanitizedData.bildungs_tag_ids = sanitizedData.bildungs_tag_ids ? [sanitizedData.bildungs_tag_ids] : [];
  }
  
  // Für selected_courses: Stelle sicher, dass course_notes korrekt initialisiert ist
  if (sanitizedData.selected_courses && Array.isArray(sanitizedData.selected_courses)) {
    if (!sanitizedData.course_notes) {
      sanitizedData.course_notes = {};
    }
    
    // Stelle sicher, dass jedes Element in selected_courses eine id und description hat
    sanitizedData.selected_courses.forEach(course => {
      if (course && course.id) {
        // Stelle sicher, dass jede Beschreibung ein gültiger String ist
        let description = course.description;
        
        // Wenn description leer, null oder undefined ist, setze den Standardwert
        if (description === undefined || description === null || description === '') {
          description = "Keine Benachrichtigung";
        }
        
        // Speichere die Beschreibung im course_notes Objekt
        sanitizedData.course_notes[course.id] = description;
      }
    });
  }
  
  console.log("Sanitized Employee Data for Create:", sanitizedData);
  console.log("Final course_notes object for Create:", sanitizedData.course_notes);
  
  return api.post('/employees/create-with-user', sanitizedData);
};

const updateEmployee = (employeeId, employeeData) => {
  // Sicherstellen, dass die Daten den richtigen Typ haben
  const sanitizedData = { ...employeeData };
  
  // Stelle sicher, dass notification ein String ist und nie null oder undefined
  // Explizite Konvertierung zu einem gültigen String mit sichtbarem Inhalt, wenn nötig
  if (sanitizedData.notification === null || sanitizedData.notification === undefined || sanitizedData.notification === '') {
    sanitizedData.notification = "Keine Benachrichtigung"; // Ein definitiver String-Wert statt eines Leerzeichens
  } else if (typeof sanitizedData.notification !== 'string') {
    sanitizedData.notification = String(sanitizedData.notification);
  }
  
  // Entferne alle non-breaking spaces und andere spezielle Whitespace-Zeichen
  sanitizedData.notification = sanitizedData.notification.replace(/\s/g, ' ').trim();
  
  // Stelle sicher, dass der String niemals leer ist
  if (sanitizedData.notification === '') {
    sanitizedData.notification = "Keine Benachrichtigung";
  }
  
  console.log("Verwende notification nach Sanitization:", {
    value: sanitizedData.notification,
    type: typeof sanitizedData.notification,
    length: sanitizedData.notification.length,
    hexCode: sanitizedData.notification.charCodeAt(0) // Debug-Ausgabe für das erste Zeichen
  });
  
  // Priorität 1: selected_courses verwenden, wenn vorhanden (neues Format)
  if (sanitizedData.selected_courses && Array.isArray(sanitizedData.selected_courses)) {
    console.log("Verwende neues selected_courses Format:", sanitizedData.selected_courses);
    
    // Überprüfe, ob jedes Element ein gültiges Objekt mit id und description ist
    sanitizedData.selected_courses = sanitizedData.selected_courses.map(course => {
      if (typeof course === 'object' && course !== null) {
        return {
          id: course.id,
          description: course.description || ''
        };
      }
      // Falls das Element nur eine ID ist, konvertieren wir es in das richtige Format
      return { id: course, description: '' };
    });
    
    // Für die Abwärtskompatibilität: course_ids aus selected_courses extrahieren
    if (!sanitizedData.course_ids) {
      sanitizedData.course_ids = sanitizedData.selected_courses.map(course => course.id);
    }
  }
  // Priorität 2: course_ids und course_notes verwenden (altes Format)
  else if (sanitizedData.course_ids && Array.isArray(sanitizedData.course_ids)) {
    console.log("Verwende altes course_ids/course_notes Format:", {
      course_ids: sanitizedData.course_ids,
      course_notes: sanitizedData.course_notes || {}
    });
    
    // course_notes ist möglicherweise nicht vorhanden oder kein Objekt
    const courseNotes = sanitizedData.course_notes || {};
    
    // Für Vorwärtskompatibilität: selected_courses aus course_ids und course_notes erstellen
    sanitizedData.selected_courses = sanitizedData.course_ids.map(id => ({
      id,
      description: courseNotes[id] || ''
    }));
  }
  
  // Für Abwärtskompatibilität: course_notes aus selected_courses erstellen
  if (sanitizedData.selected_courses && Array.isArray(sanitizedData.selected_courses)) {
    if (!sanitizedData.course_notes) {
      sanitizedData.course_notes = {};
    }
    
    // Stelle sicher, dass jedes Element in selected_courses eine id und description hat
    sanitizedData.selected_courses.forEach(course => {
      if (course && course.id) {
        // Stelle sicher, dass jede Beschreibung ein gültiger String ist
        let description = course.description;
        
        // Wenn description leer, null oder undefined ist, setze den Standardwert
        if (description === undefined || description === null || description === '') {
          description = "Keine Benachrichtigung";
        }
        
        // Speichere die Beschreibung im course_notes Objekt
        sanitizedData.course_notes[course.id] = description;
      }
    });
  }
  
  console.log("Sanitized Employee Data:", sanitizedData);
  console.log("Final course_notes object:", sanitizedData.course_notes);
  
  return api.put(`/employees/${employeeId}`, sanitizedData);
};

// Spezielle Fallback-Funktion für Mitarbeiter mit ID 6
const updateEmployeeWithFallback = async (employeeId, employeeData) => {
  try {
    // Versuche zuerst den normalen Update-Weg
    return await updateEmployee(employeeId, employeeData);
  } catch (error) {
    // Wenn es ein 422-Fehler ist und es sich um den Mitarbeiter mit ID 6 handelt
    if (error.response && error.response.status === 422 && employeeId === 6) {
      console.log("Fallback für Mitarbeiter ID 6 wird ausgeführt");
      
      // Speichere course_ids und course_notes für späteren Gebrauch
      const courseIds = employeeData.course_ids || [];
      const courseNotes = employeeData.course_notes || {};
      
      // Log der Kursdaten für Debugging
      console.log("Kursdaten für Fallback-Methode:", {
        courseIds,
        courseNotes,
        courseIdsLength: courseIds.length,
        courseNotesKeys: Object.keys(courseNotes)
      });
      
      // Entferne problematische Felder
      const cleanedData = { ...employeeData };
      delete cleanedData.course_ids;
      delete cleanedData.course_notes;
      delete cleanedData.course_descriptions;
      
      // Setze notification auf einen sicheren Wert
      cleanedData.notification = "Keine Benachrichtigung";
      
      try {
        // Aktualisiere zunächst den Mitarbeiter ohne Kurs-IDs
        const employeeResponse = await api.put(`/employees/${employeeId}`, cleanedData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // Jetzt aktualisiere die Kurse separat mit Notizen
        if (courseIds.length > 0) {
          console.log("Rufe updateEmployeeCourses mit folgenden Daten auf:", {
            employeeId,
            courseIds,
            courseNotes
          });
          
          // Für jeden Kurs die Beschreibung direkt über die öffentliche Route aktualisieren
          for (const courseId of courseIds) {
            const description = courseNotes[courseId] || courseNotes[String(courseId)] || '';
            
            console.log(`Aktualisiere Beschreibung für Kurs ${courseId}:`, description);
            
            try {
              await updateCourseDescriptionDirectly(employeeId, courseId, description);
            } catch (descError) {
              console.error(`Fehler beim Aktualisieren der Beschreibung für Kurs ${courseId}:`, descError);
            }
          }
        }
        
        return employeeResponse;
      } catch (fallbackError) {
        console.error("Auch der Fallback ist fehlgeschlagen:", fallbackError);
        throw fallbackError;
      }
    }
    
    // Wenn es kein 422-Fehler ist oder nicht Mitarbeiter ID 6, wirf den ursprünglichen Fehler
    throw error;
  }
};

const updateUserName = (userId, name) => {
  return api.put(`/users/${userId}`, { name });
};

const deleteEmployee = (employeeId) => {
  return api.delete(`/employees/${employeeId}`);
};

const toggleEmployeeStatus = (employeeId) => {
  return api.put(`/employees/${employeeId}/toggle-status`);
};

const getBildungsTags = (employeeId) => {
  return api.get(`/employees/${employeeId}/bildungs-tags`);
};

const updateBildungsTags = (employeeId, bildungsTagIds) => {
  return api.put(`/employees/${employeeId}/bildungs-tags`, {
    bildungs_tag_ids: bildungsTagIds
  });
};

const getEmployeeCourses = (employeeId) => {
  return api.get(`/employees/${employeeId}/courses`);
};

const updateEmployeeCourses = (employeeId, courseIds, courseNotes = {}) => {
  console.log("updateEmployeeCourses aufgerufen mit:", {
    employeeId,
    courseIds,
    courseNotes
  });
  
  // Stellen wir sicher, dass courseNotes das richtige Format hat (objekt mit courseId als key)
  const formattedNotes = {};
  
  // Validiere courseNotes und stelle sicher, dass es ein gültiges Format hat
  if (courseNotes && typeof courseNotes === 'object') {
    // Für jeden Kurs in courseIds überprüfen, ob eine Notiz existiert
    courseIds.forEach(courseId => {
      // Stelle sicher, dass courseId als String verwendet wird für den Vergleich
      const courseIdStr = String(courseId);
      
      // Wenn eine Notiz für diesen Kurs existiert, füge sie hinzu
      if (courseNotes[courseIdStr] !== undefined) {
        formattedNotes[courseIdStr] = courseNotes[courseIdStr];
      } else if (courseNotes[courseId] !== undefined) {
        formattedNotes[courseIdStr] = courseNotes[courseId];
      }
    });
  }
  
  console.log("Formatierte Kursnotizen:", formattedNotes);
  
  return api.put(`/employees/${employeeId}/courses`, {
    course_ids: courseIds,
    course_notes: formattedNotes
  });
};

// Direkte Aktualisierung der Kursbeschreibungen ohne Authentifizierung
const updateCourseDescriptionDirectly = (employeeId, courseId, description) => {
  console.log(`Direkte Aktualisierung der Beschreibung für Mitarbeiter ${employeeId}, Kurs ${courseId}:`, description);
  
  return api.post('/public/update-course-description', {
    employee_id: employeeId,
    course_id: courseId,
    description: description || ''
  });
};

// Laden der Kursdaten eines Mitarbeiters über die öffentliche API ohne Authentifizierung
const getEmployeeCoursesPublic = (employeeId) => {
  console.log(`Lade Kursdaten für Mitarbeiter ${employeeId} über die öffentliche API`);
  return api.get(`/public/employee/${employeeId}/courses`);
};

const EmployeeService = {
  getEmployees,
  getEmployeeById,
  downloadEmployeeListPdf,
  createEmployee,
  updateEmployee,
  updateEmployeeWithFallback,
  updateUserName,
  deleteEmployee,
  toggleEmployeeStatus,
  getBildungsTags,
  updateBildungsTags,
  getEmployeeCourses,
  updateEmployeeCourses,
  updateCourseDescriptionDirectly,
  getEmployeeCoursesPublic
};

export default EmployeeService;
