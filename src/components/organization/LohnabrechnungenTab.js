import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import PayrollDeductionService from '../../services/PayrollDeductionService';

let nextKey = 0;
const asRow = (data = {}) => ({ key: ++nextKey, name: '', unit: 'percent', ...data, value: String(data.value ?? '') });

export default function LohnabrechnungenTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    setLoadError(false);
    try {
      setRows((await PayrollDeductionService.getAll()).map(asRow));
    } catch (_) {
      setLoadError(true);
      setError('Die Abzüge konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const change = (key, field, value) => {
    setSuccess('');
    setRows(current => current.map(row => row.key === key ? { ...row, [field]: value, dirty: true } : row));
  };

  const save = async (event, row) => {
    event.preventDefault();
    const value = row.value.replace(',', '.');
    setError('');
    setSuccess('');
    if (!row.name.trim() || !/^\d+(\.\d{1,4})?$/.test(value) ||
        Number(value) > (row.unit === 'percent' ? 100 : 9999999999.9999)) {
      setError('Bitte geben Sie einen Namen und einen positiven Wert oder 0 mit höchstens vier Nachkommastellen ein. Prozentwerte dürfen höchstens 100 betragen.');
      return;
    }
    setBusy(row.key);
    try {
      const saved = await PayrollDeductionService.save(row);
      setRows(current => current.map(item => item.key === row.key ? { ...item, ...saved, value: String(saved.value), dirty: false } : item));
      setSuccess('Abzug gespeichert.');
    } catch (err) {
      setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || 'Der Abzug konnte nicht gespeichert werden. Ihre Eingaben bleiben erhalten.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (row) => {
    if (row.id && !window.confirm(`Abzug „${row.name}“ wirklich löschen?`)) return;
    setBusy(row.key);
    setError('');
    setSuccess('');
    try {
      if (row.id) await PayrollDeductionService.remove(row.id);
      setRows(current => current.filter(item => item.key !== row.key));
      if (row.id) setSuccess('Abzug gelöscht.');
    } catch (_) {
      setError('Der Abzug konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Lohnabrechnungen – Abzüge</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Erfassen Sie die Abzüge für Ihre Lohnabrechnungen. Pro Zeile können Sie einen Namen (z. B. AHV) und einen Prozentwert oder einen festen Betrag in CHF hinterlegen.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? <CircularProgress aria-label="Abzüge werden geladen" /> : loadError ? (
        <Button onClick={load}>Erneut laden</Button>
      ) : (
        <>
          {rows.length === 0 && <Typography color="text.secondary" sx={{ mb: 2 }}>Noch keine Abzüge erfasst.</Typography>}
          {rows.map((row, index) => (
            <Box component="form" key={row.key} onSubmit={event => save(event, row)} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField label="Name des Abzugs" placeholder="z. B. AHV" value={row.name} required
                inputProps={{ maxLength: 255, 'aria-label': `Name des Abzugs ${index + 1}` }}
                disabled={busy !== null} onChange={event => change(row.key, 'name', event.target.value)} sx={{ flex: '2 1 220px' }} />
              <TextField label="Wert" value={row.value} required
                inputProps={{ inputMode: 'decimal', 'aria-label': `Wert ${index + 1}` }}
                disabled={busy !== null} onChange={event => change(row.key, 'value', event.target.value)} sx={{ flex: '1 1 130px' }} />
              <TextField select label="Einheit" value={row.unit} disabled={busy !== null}
                onChange={event => change(row.key, 'unit', event.target.value)} sx={{ minWidth: 150 }}>
                <MenuItem value="percent">Prozent (%)</MenuItem>
                <MenuItem value="fixed">Betrag (CHF)</MenuItem>
              </TextField>
              <Button type="submit" variant="outlined" startIcon={<Save />} disabled={busy !== null || (row.id && !row.dirty)}>
                {busy === row.key ? 'Bitte warten …' : 'Speichern'}
              </Button>
              <IconButton color="error" aria-label={`Abzug ${index + 1} löschen`} disabled={busy !== null} onClick={() => remove(row)}><Delete /></IconButton>
              {row.dirty && <Typography variant="caption" color="text.secondary">Nicht gespeichert</Typography>}
            </Box>
          ))}
          <Button startIcon={<Add />} variant="contained" disabled={busy !== null}
            onClick={() => { setSuccess(''); setRows(current => [...current, asRow({ dirty: true })]); }}>
            Abzug hinzufügen
          </Button>
        </>
      )}
    </Paper>
  );
}
