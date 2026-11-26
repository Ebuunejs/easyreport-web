import React, { useEffect, useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, TextField,
} from '@mui/material';
import api from '../api/axios';
import ContractService from '../services/ContractService';

const initialFields = {
  employee_id: '', company_id: '', document_type_id: '', starts_on: '', ends_on: '',
  position: '', workplace: '', weekly_hours: '', pay_type: 'hourly', wage: '', terms: '',
};

export default function EmploymentContractDialog({ onClose, onCreated }) {
  const [fields, setFields] = useState(initialFields);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([ContractService.getContractFormData(), api.get('/companies')])
      .then(([formData, response]) => {
        if (!active) return;
        setEmployees(formData.employees);
        setCompanies(response.data);
        setTypes(formData.documentTypes);
        const employmentType = formData.documentTypes.find(type => type.name.toLowerCase() === 'arbeitsvertrag');
        setFields(current => ({
          ...current,
          document_type_id: employmentType?.id ?? (formData.documentTypes.length === 1 ? formData.documentTypes[0].id : ''),
        }));
      })
      .catch(() => { if (active) setError('Mitarbeiter, Firmen oder Dokumenttypen konnten nicht geladen werden.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const change = event => {
    const { name, value } = event.target;
    setFieldErrors(current => ({ ...current, [name]: undefined }));
    setFields(current => {
      if (name !== 'employee_id' && name !== 'pay_type') return { ...current, [name]: value };

      const employee = employees.find(item => String(item.id) === String(name === 'employee_id' ? value : current.employee_id));
      const payType = name === 'pay_type' ? value : (employee?.pay_type === 'fixed' ? 'fixed' : 'hourly');
      return {
        ...current,
        [name]: value,
        ...(name === 'employee_id' && {
          company_id: companies.some(company => String(company.id) === String(employee?.company_id)) ? employee.company_id : '',
          position: employee?.position ?? '',
        }),
        pay_type: payType,
        wage: (payType === 'fixed' ? employee?.monthly_salary : employee?.hourly_rate) ?? '',
      };
    });
  };

  const submit = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      await api.post('/contracts/employment', fields);
    } catch (failure) {
      setFieldErrors(failure.response?.data?.errors ?? {});
      setError(failure.response?.status === 422
        ? 'Bitte prüfe die markierten Vertragsdaten.'
        : 'Der Arbeitsvertrag konnte nicht erstellt werden.');
      setSaving(false);
      return;
    }
    onCreated();
  };

  const input = (name, label, options = {}) => (
    <TextField
      {...options}
      fullWidth
      name={name}
      label={label}
      value={fields[name]}
      onChange={change}
      error={Boolean(fieldErrors[name])}
      helperText={fieldErrors[name]?.[0] ?? options.helperText}
      disabled={saving}
    />
  );

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="md" aria-labelledby="employment-contract-title">
      <DialogTitle id="employment-contract-title">Neuer Arbeitsvertrag</DialogTitle>
      <form onSubmit={submit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? <CircularProgress size={24} /> : (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12} sm={6}>
                {input('employee_id', 'Mitarbeiter/in', {
                  select: true, required: true,
                  children: employees.map(employee => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {[employee.user?.surname, employee.user?.name].filter(Boolean).join(' ') || employee.employee_number || employee.id}
                    </MenuItem>
                  )),
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('company_id', 'Firma', {
                  select: true, required: true,
                  children: companies.map(company => <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>),
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('starts_on', 'Arbeitsbeginn', { type: 'date', required: true, InputLabelProps: { shrink: true } })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('ends_on', 'Vertragsende (optional)', { type: 'date', InputLabelProps: { shrink: true }, inputProps: { min: fields.starts_on } })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('position', 'Funktion', { required: true, inputProps: { maxLength: 150 } })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('workplace', 'Arbeitsort', { inputProps: { maxLength: 200 } })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('weekly_hours', 'Stunden pro Woche', { type: 'number', inputProps: { min: 0.01, max: 168, step: 0.01 } })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('document_type_id', 'Dokumenttyp', {
                  select: true, required: true,
                  children: types.map(type => <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>),
                  helperText: types.length === 0 ? 'Für die Ablage wird ein Dokumenttyp benötigt.' : undefined,
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('pay_type', 'Lohnart', {
                  select: true, required: true,
                  children: [<MenuItem key="fixed" value="fixed">Fixlohn</MenuItem>, <MenuItem key="hourly" value="hourly">Stundenlohn</MenuItem>],
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {input('wage', fields.pay_type === 'fixed' ? 'Monatslohn (CHF)' : 'Stundenlohn (CHF)', {
                  type: 'number', required: true, inputProps: { min: 0.01, max: 99999999.99, step: 0.01 },
                })}
              </Grid>
              <Grid item xs={12}>
                {input('terms', 'Vertragstexte', {
                  multiline: true, minRows: 6, required: true, inputProps: { maxLength: 12000 },
                  helperText: 'Hier kannst du die vereinbarten Bestimmungen eingeben.',
                })}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Abbrechen</Button>
          <Button type="submit" variant="contained" disabled={loading || saving || !employees.length || !companies.length || !types.length}>
            {saving ? 'Wird erstellt …' : 'Vertrag erstellen'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
