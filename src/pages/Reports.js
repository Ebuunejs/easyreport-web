import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  GetApp as GetAppIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import api from '../api/axios';


const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [payBasis, setPayBasis] = useState('exclusive');
  const [payoutDate, setPayoutDate] = useState('');
  const [creationDate, setCreationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [description, setDescription] = useState('');
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportPage, setReportPage] = useState(0);
  const [reportTotal, setReportTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const listRequest = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Lade Mitarbeiter beim Komponenten-Mount
  useEffect(() => {
    loadEmployees();
    loadCompanies();
    loadReports();
  }, []);

  const isPayroll = ['fixed_payroll', 'hourly_payroll'].includes(reportType);
  const validDates = isValid(startDate) && isValid(endDate) && startDate <= endDate;

  useEffect(() => { setPayrollPreview(null); }, [selectedEmployee, selectedCompany, reportType, startDate, endDate, hourlyRate, monthlySalary, expenses, advances, description, payoutDate, creationDate]);

  const validatePayrollItems = () => {
    const incompleteExpense = expenses.findIndex(item => {
      const name = String(item.name || '').trim();
      const amount = String(item.amount || '').trim();
      return (name || amount) && (!name || !amount);
    });
    if (incompleteExpense !== -1) {
      setError(`Bitte vervollständigen Sie Spese ${incompleteExpense + 1} mit Bezeichnung und Betrag oder entfernen Sie die Zeile.`);
      return false;
    }

    const incompleteAdvance = advances.findIndex(item => {
      const description = String(item.description || '').trim();
      const amount = String(item.amount || '').trim();
      return (description || amount) && (!description || !amount);
    });
    if (incompleteAdvance !== -1) {
      setError(`Bitte vervollständigen Sie Vorschuss ${incompleteAdvance + 1} mit Beschreibung und Betrag oder entfernen Sie die Zeile.`);
      return false;
    }
    return true;
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.data || response.data);
    } catch (_) {
      setError('Firmen konnten nicht geladen werden. Bitte laden Sie die Seite erneut.');
    }
  };

  const selectEmployee = (id) => {
    const employee = employees.find(item => String(item.id) === String(id));
    setSelectedEmployee(id);
    setPayoutDate(employee?.payout_date?.slice(0, 10) || '');
    setSelectedCompany(employee?.company_id || '');
    setHourlyRate(employee?.hourly_rate == null ? '' : String(employee.hourly_rate));
    setMonthlySalary(employee?.monthly_salary == null ? '' : String(employee.monthly_salary));
    setPayBasis(employee?.pay_basis || 'exclusive');
    setExpenses([]);
  };

  const buildReportData = () => ({
    employee_id: selectedEmployee,
    company_id: selectedCompany || null,
    report_type: reportType,
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    description,
      ...(isPayroll ? {
      pay_basis: payBasis,
      creation_date: creationDate || null,
      payout_date: payoutDate || null,
      advances: advances.map(item => ({ description: item.description.trim(), amount: item.amount.replace(',', '.') })),
      ...(reportType === 'hourly_payroll' ? { hourly_rate: hourlyRate.replace(',', '.') } : { monthly_salary: monthlySalary.replace(',', '.') }),
      expenses: expenses.map(expense => ({ name: expense.name.trim(), amount: expense.amount.replace(',', '.') })),
    } : {}),
  });

  const showRequestError = (err) => setError(
    Object.entries(err.response?.data?.errors || {}).map(([field, messages]) => {
      const match = field.match(/^(expenses|advances)\.(\d+)\.(name|description|amount)$/);
      if (match) return `${match[1] === 'expenses' ? 'Spese' : 'Vorschuss'} ${Number(match[2]) + 1}: ${messages.join(' ')}`;
      return messages.join(' ');
    }).join(' ') || err.response?.data?.message || 'Der Bericht konnte nicht erstellt werden.'
  );

  const calculatePayroll = async () => {
    if (!validatePayrollItems()) return;
    setPreviewLoading(true);
    setError(null);
    setPayrollPreview(null);
    try {
      const response = await api.post('/reports/payroll-preview', buildReportData());
      setPayrollPreview(response.data.data);
    } catch (err) {
      showRequestError(err);
    } finally {
      setPreviewLoading(false);
    }
  };
  const money = value => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || response.data);
      console.log('Mitarbeiter geladen:', response.data.data || response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      setError('Fehler beim Laden der Mitarbeiter: ' + error.message);
    }
  };

  const loadReports = async (page = 0) => {
    const requestId = ++listRequest.current;
    setListLoading(true);
    setListError('');
    try {
      const response = await api.get('/reports', { params: { page: page + 1, per_page: 10, _refresh: Date.now() } });
      if (requestId !== listRequest.current) return;
      const data = response.data;
      setReports(data.data || data);
      setReportTotal(data.total ?? (data.data || data).length);
      setReportPage(page);
    } catch (_) {
      if (requestId === listRequest.current) setListError('Die Berichtsliste konnte nicht aktualisiert werden. Bitte erneut laden.');
    } finally {
      if (requestId === listRequest.current) setListLoading(false);
    }
  };

  const resetForm = () => {
    setEditingReport(null);
    setPayoutDate('');
    setCreationDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedEmployee('');
    setSelectedCompany('');
    setReportType('');
    setDescription('');
    setHourlyRate('');
      setMonthlySalary('');
    setPayBasis('exclusive');
    setExpenses([]);
    setAdvances([]);
    setPayrollPreview(null);
  };

  const handleEdit = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data: report } = await api.get(`/reports/${id}`);
      const saved = report.report_data || {};
      setEditingReport(report.id);
      setPayoutDate(saved.payout_date || '');
      setCreationDate(saved.creation_date || format(new Date(), 'yyyy-MM-dd'));
      setSelectedEmployee(report.employee_id);
      setSelectedCompany(saved.company_id || report.employee?.company_id || '');
      setReportType(report.report_type || 'hours');
      setStartDate(new Date(report.start_date || report.report_date));
      setEndDate(new Date(report.end_date || report.report_date));
      setHourlyRate(String(saved.hourly_rate ?? ''));
      setMonthlySalary(String(saved.monthly_salary ?? saved.gross_salary ?? ''));
      setPayBasis(saved.pay_basis || report.employee?.pay_basis || 'exclusive');
      setExpenses((saved.expenses || []).map(item => ({ name: item.name, amount: String(item.amount) })));
      setAdvances((saved.advances || (saved.advance ? [{ description: 'Vorschuss', amount: saved.advance }] : [])).map(item => ({ description: item.description, amount: String(item.amount) })));
      setDescription(report.description || '');
      setTabValue(1);
    } catch (err) {
      showRequestError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/reports/${deleteTarget.id}`);
      setDeleteTarget(null);
      setSuccess('Bericht gelöscht.');
      await loadReports(reports.length === 1 && reportPage > 0 ? reportPage - 1 : reportPage);
    } catch (err) {
      showRequestError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) loadReports(reportPage);
  };

  const handleGenerateReport = async () => {
    if (!selectedEmployee || !reportType) {
      setError('Bitte wählen Sie einen Mitarbeiter und einen Berichtstyp aus.');
      return;
    }
    if (isPayroll && !validatePayrollItems()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingReport) {
        await api.put(`/reports/${editingReport}`, buildReportData());
      } else {
        await api.post('/reports', buildReportData());
      }
      setSuccess(editingReport ? 'Bericht und PDF erfolgreich aktualisiert!' : 'Bericht erfolgreich generiert!');
      resetForm();
      setTabValue(0);
      await loadReports(editingReport ? reportPage : 0);

    } catch (error) {
      console.error('Fehler beim Generieren des Berichts:', error);
      showRequestError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/preview`);
      setPreviewData(response.data);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Fehler beim Laden der Vorschau:', error);
      setError('Fehler beim Laden der Vorschau');
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      // Erstelle Download-Link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Fehler beim Herunterladen:', error);
      setError('Fehler beim Herunterladen des Berichts');
    }
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      'hours': 'Stundenbericht',
      'vacation': 'Urlaubsbericht',
      'sick_leave': 'Krankheitsbericht',
      'project_summary': 'Projektzusammenfassung',
      'employee_summary': 'Mitarbeiterzusammenfassung',
      'fixed_payroll': 'Fixlohnabrechnung',
      'hourly_payroll': 'Stundenlohnabrechnung'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'generated': 'success',
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'generated': 'Generiert',
      'pending': 'Ausstehend',
      'approved': 'Genehmigt',
      'rejected': 'Abgelehnt'
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Berichte
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Gespeicherte Berichte" disabled={loading || previewLoading} />
          <Tab label={editingReport ? "Bericht bearbeiten" : "Neuen Bericht erstellen"} disabled={loading || previewLoading} />
        </Tabs>
        
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>{reportTotal} Berichte</Typography>
              <Button disabled={listLoading || loading} onClick={() => loadReports(reportPage)}>Aktualisieren</Button>
            </Box>
            {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}
            {listLoading && <CircularProgress size={24} aria-label="Berichte werden geladen" />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mitarbeiter</TableCell>
                  <TableCell>Berichtstyp</TableCell>
                  <TableCell>Zeitraum</TableCell>
                  <TableCell>Erstellt am</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Keine Berichte vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {report.employee?.user ? 
                          `${report.employee.user.name} ${report.employee.user.surname}` : 
                          'Unbekannt'
                        }
                      </TableCell>
                      <TableCell>{getReportTypeLabel(report.report_type)}</TableCell>
                      <TableCell>
                        {report.start_date && report.end_date ? 
                          `${format(new Date(report.start_date), 'dd.MM.yyyy')} - ${format(new Date(report.end_date), 'dd.MM.yyyy')}` :
                          format(new Date(report.report_date), 'dd.MM.yyyy')
                        }
                      </TableCell>
                      <TableCell>
                        {report.generated_at ? 
                          format(new Date(report.generated_at), 'dd.MM.yyyy HH:mm') :
                          format(new Date(report.created_at), 'dd.MM.yyyy HH:mm')
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(report.status)} 
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Button size="small" variant="outlined" startIcon={<EditIcon />} disabled={loading || listLoading} onClick={() => handleEdit(report.id)}>Bearbeiten</Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} disabled={loading || listLoading} onClick={() => setDeleteTarget(report)}>Löschen</Button>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handlePreview(report.id)}
                            variant="outlined"
                            color="secondary"
                          >
                            Vorschau
                          </Button>
                          {report.pdf_path && (
                            <Button
                              size="small"
                              startIcon={<GetAppIcon />}
                              onClick={() => handleDownload(report.id)}
                              variant="outlined"
                            >
                              PDF
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={reportTotal} page={reportPage} rowsPerPage={10} rowsPerPageOptions={[10]}
            onPageChange={(_, page) => loadReports(page)} labelDisplayedRows={({ from, to, count }) => `${from}–${to} von ${count}`}
            getItemAriaLabel={type => type === 'next' ? 'Nächste Seite' : 'Vorherige Seite'}
            disabled={listLoading || loading} />
          </Box>
        )}
        
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }} component="fieldset" disabled={loading || previewLoading} sx={{ border: 0, minWidth: 0, m: 0 }}>
              {editingReport && <Alert severity="info" sx={{ mb: 2 }}>
                Sie bearbeiten Bericht #{editingReport}. Beim Speichern wird die PDF ersetzt. Lohnabrechnungen werden mit den aktuell genehmigten Stunden und hinterlegten Abzügen neu berechnet.
              </Alert>}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Mitarbeiter</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => selectEmployee(e.target.value)}
                  label="Mitarbeiter"
                  startAdornment={<PersonIcon sx={{ mr: 1 }} />}
                  disabled={employees.length === 0}
                >
                  {employees.length === 0 ? (
                    <MenuItem disabled>
                      Keine Mitarbeiter verfügbar
                    </MenuItem>
                  ) : (
                    employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.user ? `${employee.user.name} ${employee.user.surname}` : `Mitarbeiter ${employee.id}`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }} required={isPayroll}>
                <InputLabel id="report-company-label">Firma</InputLabel>
                <Select labelId="report-company-label" label="Firma" value={selectedCompany}
                  onChange={event => setSelectedCompany(event.target.value)}>
                  <MenuItem value="">Bitte Firma auswählen</MenuItem>
                  {companies.map(company => <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Berichtstyp</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    if (['fixed_payroll', 'hourly_payroll'].includes(e.target.value)) {
                      const date = isValid(startDate) ? startDate : new Date();
                      setStartDate(startOfMonth(date));
                      setEndDate(endOfMonth(date));
                    }
                  }}
                  label="Berichtstyp"
                >
                  <MenuItem value="fixed_payroll">Fixlohnabrechnung</MenuItem>
                  <MenuItem value="hourly_payroll">Stundenlohnabrechnung</MenuItem>
                  <MenuItem value="hours">Stundenbericht</MenuItem>
                  <MenuItem value="vacation">Urlaubsbericht</MenuItem>
                  <MenuItem value="sick_leave">Krankheitsbericht</MenuItem>
                  <MenuItem value="project_summary">Projektzusammenfassung</MenuItem>
                  <MenuItem value="employee_summary">Mitarbeiterzusammenfassung</MenuItem>
                </Select>
              </FormControl>
              
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                {isPayroll ? <DatePicker
                  label="Abrechnungsmonat" views={['year', 'month']} value={startDate}
                  onChange={date => { setStartDate(isValid(date) ? startOfMonth(date) : date); setEndDate(isValid(date) ? endOfMonth(date) : date); }}
                  slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
                /> : <Box sx={{ display: 'flex', mb: 2 }}>
                  <DatePicker
                    label="Startdatum"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: { sx: { mr: 2, flex: 1 } }
                    }}
                  />
                  <DatePicker
                    label="Enddatum"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: { sx: { flex: 1 } }
                    }}
                  />
                </Box>}
              </LocalizationProvider>

              {isPayroll && <Box sx={{ mb: 2 }}>
                <TextField fullWidth type="date" label="Erstellungsdatum" value={creationDate} onChange={event => setCreationDate(event.target.value)}
                  InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} helperText="Standardmässig heute; kann für die Abrechnung angepasst werden." />
                <TextField fullWidth type="date" label="Auszahlungsdatum" value={payoutDate} onChange={event => setPayoutDate(event.target.value)}
                  InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} helperText="Aus dem Mitarbeiterprofil vorbelegt; ohne Angabe gilt die Profilvorgabe oder das Monatsende." />
                <TextField fullWidth required sx={{ mb: 2 }}
                  label={`${reportType === 'hourly_payroll' ? 'Stundenlohn' : 'Fixlohn'} (CHF) – ${payBasis === 'exclusive' ? 'exkl.' : 'inkl.'}${reportType === 'hourly_payroll' ? '' : ' (Monatlicher Fixlohn)'}`}
                  value={reportType === 'hourly_payroll' ? hourlyRate : monthlySalary}
                  onChange={event => reportType === 'hourly_payroll' ? setHourlyRate(event.target.value) : setMonthlySalary(event.target.value)}
                  inputProps={{ inputMode: 'decimal' }}
                  helperText={reportType === 'hourly_payroll' ? `Vorbelegt aus dem Mitarbeiter (${payBasis === 'exclusive' ? 'exkl.' : 'inkl.'}). Es zählen nur genehmigte Stunden des Monats.` : `Vorbelegt aus dem Mitarbeiter (${payBasis === 'exclusive' ? 'exkl.' : 'inkl.'}).` } />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Spesen</Typography>
                {expenses.map((expense, index) => <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField label="Bezeichnung" value={expense.name} inputProps={{ maxLength: 255 }}
                    onChange={event => setExpenses(current => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} />
                  <TextField label="Betrag (CHF)" value={expense.amount} inputProps={{ inputMode: 'decimal' }}
                    onChange={event => setExpenses(current => current.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} />
                  <IconButton aria-label={`Spesen ${index + 1} löschen`} color="error" onClick={() => setExpenses(current => current.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                </Box>)}
                <Button startIcon={<AddIcon />} onClick={() => setExpenses(current => [...current, { name: '', amount: '' }])}>Spesen hinzufügen</Button>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Vorschüsse</Typography>
                {advances.map((item, index) => <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField label="Beschreibung" value={item.description} inputProps={{ maxLength: 255 }}
                    onChange={event => setAdvances(current => current.map((row, i) => i === index ? { ...row, description: event.target.value } : row))} />
                  <TextField label="Wert (CHF)" value={item.amount} inputProps={{ inputMode: 'decimal' }}
                    onChange={event => setAdvances(current => current.map((row, i) => i === index ? { ...row, amount: event.target.value } : row))} />
                  <IconButton aria-label={`Vorschuss ${index + 1} löschen`} color="error" onClick={() => setAdvances(current => current.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                </Box>)}
                <Button startIcon={<AddIcon />} onClick={() => setAdvances(current => [...current, { description: '', amount: '' }])}>Vorschuss hinzufügen</Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Die Abzüge aus Organisation → Lohnabrechnungen werden angewendet. Prozentwerte beziehen sich auf den Bruttolohn. Spesen werden addiert, der Vorschuss wird danach abgezogen.
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" onClick={calculatePayroll}
                  disabled={loading || previewLoading || !selectedEmployee || !selectedCompany || !validDates}>
                  {previewLoading ? 'Berechne …' : 'Lohnabrechnung berechnen'}
                </Button>
              </Box>}
              
              <TextField
                fullWidth
                label="Beschreibung (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                helperText="Zusätzliche Notizen zum Bericht"
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <DescriptionIcon />}
                onClick={handleGenerateReport}
                disabled={loading || previewLoading || !selectedEmployee || !reportType || !validDates || (isPayroll && !selectedCompany)}
                sx={{ mt: 2 }}
                fullWidth
              >
                {loading ? 'Speichere Bericht...' : editingReport ? 'Änderungen speichern' : 'Bericht generieren'}
              </Button>
              {editingReport && <Button sx={{ mt: 1 }} onClick={() => { resetForm(); setTabValue(0); }}>Bearbeitung abbrechen</Button>}
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Berichtsvorschau
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Wählen Sie einen Mitarbeiter und Berichtstyp aus, um einen neuen Bericht zu erstellen.
                </Typography>
                
                {selectedEmployee && reportType && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Ausgewählte Parameter:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Mitarbeiter:</strong> {
                        employees.find(emp => String(emp.id) === String(selectedEmployee))?.user ?
                        `${employees.find(emp => String(emp.id) === String(selectedEmployee)).user.name} ${employees.find(emp => String(emp.id) === String(selectedEmployee)).user.surname}` :
                        `Mitarbeiter ${selectedEmployee}`
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Berichtstyp:</strong> {getReportTypeLabel(reportType)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Zeitraum:</strong> {validDates ? `${format(startDate, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}` : 'Bitte gültigen Zeitraum wählen'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Firma:</strong> {companies.find(company => String(company.id) === String(selectedCompany))?.name || 'Nicht ausgewählt'}</Typography>
                    {isPayroll && <Typography variant="body2" sx={{ mb: 1 }}><strong>Lohnbasis:</strong> {payBasis === 'exclusive' ? 'Exkl. Ferien-/Feiertags-/13. Monatslohn' : 'Inkl. Ferien-/Feiertags-/13. Monatslohn'}</Typography>}
                    {payrollPreview && <Box sx={{ mt: 2 }}>
                      {reportType === 'hourly_payroll' && <Typography>Genehmigte Stunden: {payrollPreview.total_hours}</Typography>}
                      <Typography>Versicherungsnummer: {payrollPreview.employee_insurance_number || '–'}</Typography>
                      <Typography>Lohnklasse: {payrollPreview.employee_salary_class || '–'}</Typography>
                      <Typography>Bankverbindung: {payrollPreview.employee_bank_name || '–'}</Typography>
                      <Typography>Kontonummer: {payrollPreview.employee_account_number || '–'}</Typography>
                      <Typography>Auszahlungsdatum: {payrollPreview.payout_date || '–'}</Typography>
                      <Table size="small" aria-label="Lohnberechnung"><TableBody>
                        <TableRow><TableCell>{payrollPreview.pay_basis === 'exclusive' ? 'Lohnbasis' : 'Lohn inkl. Zulagen'}</TableCell><TableCell align="right">{money(payrollPreview.base_salary ?? payrollPreview.gross_salary)}</TableCell></TableRow>
                        {(payrollPreview.salary_components || []).map((item, index) => <TableRow key={`salary-component-${index}`}><TableCell>{item.name} ({Number(item.rate).toFixed(2)} %)</TableCell><TableCell align="right">{money(item.amount)}</TableCell></TableRow>)}
                        <TableRow><TableCell><strong>Bruttolohn</strong></TableCell><TableCell align="right"><strong>{money(payrollPreview.gross_salary)}</strong></TableCell></TableRow>
                        {payrollPreview.deductions.map((item, index) => <TableRow key={index}><TableCell>{item.name} ({Number(item.value)} {item.unit === 'percent' ? '%' : 'CHF'})</TableCell><TableCell align="right">−{money(item.amount)}</TableCell></TableRow>)}
                        <TableRow><TableCell>Total Abzüge</TableCell><TableCell align="right">−{money(payrollPreview.total_deductions)}</TableCell></TableRow>
                        <TableRow><TableCell><strong>Nettolohn</strong></TableCell><TableCell align="right"><strong>{money(payrollPreview.net_salary)}</strong></TableCell></TableRow>
                        {payrollPreview.expenses.map((item, index) => <TableRow key={index}><TableCell>Spesen: {item.name}</TableCell><TableCell align="right">{money(item.amount)}</TableCell></TableRow>)}
                        <TableRow><TableCell>Total Spesen</TableCell><TableCell align="right">{money(payrollPreview.total_expenses)}</TableCell></TableRow>
                        {payrollPreview.advances?.map((item, index) => <TableRow key={index}><TableCell>Vorschuss: {item.description}</TableCell><TableCell align="right">−{money(item.amount)}</TableCell></TableRow>)}
                        <TableRow><TableCell><strong>Auszahlungsbetrag</strong></TableCell><TableCell align="right"><strong>{money(payrollPreview.payout)}</strong></TableCell></TableRow>
                      </TableBody></Table>
                      {payrollPreview.deductions.length === 0 && <Alert severity="info" sx={{ mt: 2 }}>Es sind keine Abzüge hinterlegt.</Alert>}
                      {reportType === 'hourly_payroll' && payrollPreview.total_hours === 0 && <Alert severity="info" sx={{ mt: 2 }}>Keine genehmigten Stunden in diesem Monat vorhanden.</Alert>}
                    </Box>}
                    {description && (
                      <Typography variant="body2">
                        <strong>Beschreibung:</strong> {description}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {!selectedEmployee && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bitte wählen Sie einen Mitarbeiter aus der Liste aus.
                    </Typography>
                  </Box>
                )}
                
                {selectedEmployee && !reportType && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bitte wählen Sie einen Berichtstyp aus.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !loading && setDeleteTarget(null)}>
        <DialogTitle>Bericht löschen?</DialogTitle>
        <DialogContent>Bericht #{deleteTarget?.id} ({getReportTypeLabel(deleteTarget?.report_type)}) und die zugehörige PDF werden gelöscht.</DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={() => setDeleteTarget(null)}>Abbrechen</Button>
          <Button disabled={loading} color="error" onClick={handleDelete}>Endgültig löschen</Button>
        </DialogActions>
      </Dialog>
      {/* Vorschau Modal */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Berichtsvorschau</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewData ? (
            <Box component="iframe" title="Berichtsvorschau" sandbox="" srcDoc={previewData}
              sx={{ border: '1px solid #ddd', borderRadius: 1, width: '100%', height: '70vh', minHeight: 500, backgroundColor: '#fff' }} />
          ) : (
            <Typography>Lade Vorschau...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 
