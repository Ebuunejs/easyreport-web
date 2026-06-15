# ContractModal Komponente

## Übersicht
Die `ContractModal` Komponente ist eine wiederverwendbare React-Komponente für das Hochladen von Verträgen. Sie wurde aus der `Contracts.js` Datei extrahiert, um eine bessere Modularität und Wartbarkeit zu gewährleisten.

## Features
- **Dynamisches Laden von Mitarbeitern** aus der Datenbank über `/api/public/employees`
- **Dynamisches Laden von Vertragstypen** aus der `document_types` Tabelle über `/api/public/document-types`
- **Responsive Design** für Mobile, Tablet und Desktop
- **Datei-Upload** mit Drag & Drop Unterstützung
- **Gültigkeitszeitraum** mit "Gültig ab" (required) und "Gültig bis" (optional)
- **Progress Indicator** für Upload-Status
- **Validierung** aller erforderlichen Felder

## Angepasste Felder
1. **Stundensatz** → **Gültig ab** (Pflichtfeld)
2. **Gültig ab** → **Gültig bis** (Optional)
3. **Mitarbeiter-Dropdown** lädt Daten aus der `employees` Tabelle
4. **Vertragstyp-Dropdown** lädt Daten aus der `document_types` Tabelle

## Props
- `open` (boolean): Bestimmt, ob das Modal geöffnet ist
- `onClose` (function): Callback-Funktion beim Schließen des Modals
- `onUpload` (function): Callback-Funktion beim Upload mit Vertragsdaten
- `uploading` (boolean): Upload-Status für Fortschrittsanzeige
- `uploadProgress` (number): Upload-Fortschritt (0-100)

## Verwendung
```jsx
import ContractModal from '../components/ContractModal';

const [openModal, setOpenModal] = useState(false);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = (contractData) => {
  console.log('Vertragsdaten:', contractData);
  // Upload-Logik implementieren
};

<ContractModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  onUpload={handleUpload}
  uploading={uploading}
  uploadProgress={uploadProgress}
/>
```

## Vertragsdaten-Struktur
```javascript
{
  employeeId: number,     // ID des ausgewählten Mitarbeiters
  type: number,           // ID des ausgewählten Vertragstyps
  file: File,             // Hochgeladene Datei
  validFrom: string,      // Datum im Format YYYY-MM-DD
  validTo: string         // Datum im Format YYYY-MM-DD oder leer
}
```

## API-Endpunkte
- `GET /api/public/employees` - Lädt alle Mitarbeiter mit Abteilungsinformationen
- `GET /api/public/document-types` - Lädt alle aktiven Dokumenttypen

## Abhängigkeiten
- Material-UI (@mui/material)
- React Icons (@mui/icons-material)
- React (useState, useEffect)

## Styling
Das Modal verwendet Material-UI Komponenten und ist vollständig responsive. Es passt sich automatisch an verschiedene Bildschirmgrößen an:
- **Mobile**: Vollbild-Modal
- **Tablet**: Reduzierte Spaltenanzahl
- **Desktop**: Vollständige zwei-spaltige Ansicht 