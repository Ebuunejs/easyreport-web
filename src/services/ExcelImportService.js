import * as XLSX from 'xlsx';
import api from '../api/axios';

class ExcelImportService {
  // Excel-Datei lesen und parsen
  static parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Excel-Daten in Mitarbeiter-Format konvertieren
  static convertExcelDataToEmployees(excelData) {
    if (!excelData || excelData.length < 2) {
      throw new Error('Excel-Datei ist leer oder hat keine Daten');
    }

    // Erste Zeile sind die Spaltenüberschriften
    const headers = excelData[0];
    const employees = [];

    // Erweiterte Mapping-Tabelle für verschiedene Spaltenbezeichnungen
    const columnMapping = {
      // Deutsche Bezeichnungen
      'Name': 'name',
      'Vorname': 'surname',
      'Nachname': 'surname',
      'Adresse': 'address',
      'Strasse': 'address',
      'Straße': 'address',
      'PLZ': 'plz',
      'Postleitzahl': 'plz',
      'Ort': 'place',
      'Stadt': 'place',
      'Wohnort': 'place',
      'Geburtsdatum': 'birth',
      'Geburtstag': 'birth',
      'Zivilstand': 'civil',
      'Telefon': 'phone',
      'Tel': 'phone',
      'Handy': 'phone',
      'Mobile': 'phone',
      'Firma': 'company_name',
      'Unternehmen': 'company_name',
      'Betrieb': 'company_name',
      'Eintritt': 'hire_date',
      'Eintrittsdatum': 'hire_date',
      'Anstellungsdatum': 'hire_date',
      'Beruf': 'position',
      'Position': 'position',
      'Stelle': 'position',
      'Tätigkeit': 'position',
      'Qualifikation': 'qualification',
      'AHV-Nr.': 'ahv',
      'AHV': 'ahv',
      'AHV-Nummer': 'ahv',
      'Sozialversicherungsnummer': 'ahv',
      'Ausweis': 'idform',
      'Ausweisart': 'idform',
      'ID': 'idform',
      'Gültig bis': 'idexpirity',
      'Ablaufdatum': 'idexpirity',
      'Gültigkeit': 'idexpirity',
      'RKS': 'rks_status',
      'E-Mail': 'email',
      'Email': 'email',
      'Mail': 'email',
      'Nationalität': 'nationality',
      'Staatsangehörigkeit': 'nationality',
      'Land': 'nationality',
      
      // Englische Bezeichnungen (falls vorhanden)
      'First Name': 'name',
      'Last Name': 'surname',
      'Address': 'address',
      'ZIP': 'plz',
      'City': 'place',
      'Phone': 'phone',
      'Company': 'company_name',
      'Position': 'position',
      'Email': 'email',
      'Birth Date': 'birth',
      'Hire Date': 'hire_date',
      'Nationality': 'nationality'
    };

    // Datenzeilen verarbeiten (ab Zeile 2)
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      if (!row || row.length === 0 || !row.some(cell => cell && cell.toString().trim())) {
        continue; // Leere Zeilen überspringen
      }

      const employee = {
        // Standardwerte
        is_active: true,
        hourly_rate: 25.00,
        vacation_days: 25,
        password: 'TempPass123!',
        checkPassword: 'TempPass123!',
        department_id: 1 // Standard-Abteilung
      };

      // Excel-Spalten zu Mitarbeiterfeldern mappen
      headers.forEach((header, index) => {
        if (!header) return;
        
        const fieldName = columnMapping[header.trim()];
        if (fieldName && row[index] !== undefined && row[index] !== null && row[index] !== '') {
          let value = row[index];
          
          // Spezielle Behandlung für verschiedene Datentypen
          if (fieldName === 'birth' || fieldName === 'hire_date' || fieldName === 'idexpirity') {
            value = this.parseExcelDate(value);
          } else if (fieldName === 'phone') {
            value = this.formatPhoneNumber(value);
          } else if (fieldName === 'ahv') {
            value = this.formatAHVNumber(value);
          } else if (fieldName === 'plz') {
            value = value.toString().trim();
          } else {
            value = value.toString().trim();
          }
          
          employee[fieldName] = value;
        }
      });

      // Validierung und Standardwerte setzen
      if (!employee.name || !employee.surname) {
        console.warn(`Zeile ${i + 1}: Name oder Vorname fehlt, überspringe Zeile`);
        continue;
      }

      // E-Mail generieren falls nicht vorhanden
      if (!employee.email) {
        const nameClean = employee.name.toLowerCase().replace(/[^a-z]/g, '');
        const surnameClean = employee.surname.toLowerCase().replace(/[^a-z]/g, '');
        employee.email = `${nameClean}.${surnameClean}@khb.ch`;
      }

      // Employee Number generieren
      if (!employee.employee_number) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        employee.employee_number = `EMP${timestamp}${random}`;
      }

      // Position setzen falls nicht vorhanden
      if (!employee.position) {
        employee.position = 'Mitarbeiter';
      }

      // Hire Date setzen falls nicht vorhanden
      if (!employee.hire_date) {
        employee.hire_date = new Date().toISOString().split('T')[0];
      }

      employees.push(employee);
    }

    return employees;
  }

  // Excel-Datum parsen (erweitert)
  static parseExcelDate(excelDate) {
    if (!excelDate) return null;
    
    // Wenn es bereits ein String-Datum ist
    if (typeof excelDate === 'string') {
      const dateString = excelDate.trim();
      
      // Verschiedene Datumsformate versuchen
      const formats = [
        /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
        /^\d{1,2}\.\d{1,2}\.\d{4}$/, // D.M.YYYY
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/ // D/M/YYYY
      ];
      
      for (const format of formats) {
        if (format.test(dateString)) {
          if (dateString.includes('.')) {
            const [day, month, year] = dateString.split('.');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else if (dateString.includes('-')) {
            return dateString; // Bereits im richtigen Format
          }
        }
      }
    }
    
    // Excel-Seriennummer zu Datum konvertieren
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    return null;
  }

  // Telefonnummer formatieren (erweitert)
  static formatPhoneNumber(phone) {
    if (!phone) return null;
    
    let phoneStr = phone.toString().trim();
    
    // Entferne alle nicht-numerischen Zeichen außer + und Leerzeichen
    phoneStr = phoneStr.replace(/[^\d+\s-]/g, '');
    
    // Schweizer Nummern formatieren
    if (phoneStr.startsWith('0')) {
      phoneStr = '+41 ' + phoneStr.substring(1);
    } else if (!phoneStr.startsWith('+')) {
      phoneStr = '+41 ' + phoneStr;
    }
    
    return phoneStr;
  }

  // AHV-Nummer formatieren (erweitert)
  static formatAHVNumber(ahv) {
    if (!ahv) return null;
    
    let ahvStr = ahv.toString().replace(/\s+/g, '').replace(/\./g, '').trim();
    
    // AHV-Nummer formatieren: 756.1234.5678.90
    if (ahvStr.length === 13 && /^\d+$/.test(ahvStr)) {
      return `${ahvStr.substring(0, 3)}.${ahvStr.substring(3, 7)}.${ahvStr.substring(7, 11)}.${ahvStr.substring(11, 13)}`;
    }
    
    return ahvStr;
  }

  // Mitarbeiter über API importieren (erweitert)
  static async importEmployees(employees, companyMapping = {}) {
    const results = {
      success: [],
      errors: []
    };

    for (const employee of employees) {
      try {
        // Company ID aus Mapping holen oder Standard verwenden
        if (employee.company_name && companyMapping[employee.company_name]) {
          employee.company_id = companyMapping[employee.company_name];
        } else {
          employee.company_id = 1; // Standard-Firma
        }

        // Validierung vor dem Senden
        if (!employee.name || !employee.surname || !employee.email) {
          throw new Error('Name, Vorname und E-Mail sind erforderlich');
        }

        const response = await api.post('/employees/create-with-user', employee);
        results.success.push({
          name: `${employee.name} ${employee.surname}`,
          id: response.data.id
        });
      } catch (error) {
        results.errors.push({
          name: `${employee.name} ${employee.surname}`,
          error: error.response?.data?.message || error.message
        });
      }
    }

    return results;
  }

  // Daten validieren
  static validateEmployeeData(employee) {
    const errors = [];
    
    if (!employee.name || employee.name.trim() === '') {
      errors.push('Name ist erforderlich');
    }
    
    if (!employee.surname || employee.surname.trim() === '') {
      errors.push('Vorname ist erforderlich');
    }
    
    if (!employee.email || employee.email.trim() === '') {
      errors.push('E-Mail ist erforderlich');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
      errors.push('E-Mail-Format ist ungültig');
    }
    
    if (employee.hire_date && !/^\d{4}-\d{2}-\d{2}$/.test(employee.hire_date)) {
      errors.push('Eintrittsdatum muss im Format YYYY-MM-DD sein');
    }
    
    return errors;
  }
}

export default ExcelImportService; 