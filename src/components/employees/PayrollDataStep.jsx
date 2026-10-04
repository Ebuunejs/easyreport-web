import React, { useEffect, useState } from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import PayrollDeductionService from '../../services/PayrollDeductionService';

const PayrollDataStep = ({ open, employeeData, handleInputChange }) => {
  const [loading, setLoading] = useState(false);
  const children = employeeData?.children || [];
  const deductions = employeeData?.payroll_deductions || [];

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    PayrollDeductionService.getAll()
      .then(rows => {
        if (!(employeeData?.payroll_deductions || []).length) {
          handleInputChange({
            target: {
              name: 'payroll_deductions',
              value: rows.map(row => ({ ...row, enabled: true })),
            },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // Defaults are loaded once whenever the flow is opened for this employee.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employeeData?.id]);

  const update = (name, value) => handleInputChange({ target: { name, value } });
  const updateChild = (index, patch) => update('children', children.map((child, i) => i === index ? { ...child, ...patch } : child));
  const updateDeduction = (index, patch) => update('payroll_deductions', deductions.map((row, i) => i === index ? { ...row, ...patch } : row));

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Lohndaten</Typography>
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Kinderzulagen</Typography>
        {children.map((child, index) => (
          <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }} key={child.id || index}>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Kind" value={child.name || ''} onChange={e => updateChild(index, { name: e.target.value })} />
            </Grid>
            <Grid item xs={10} md={5}>
              <TextField fullWidth label="Kinderzulage (CHF)" type="number" inputProps={{ min: 0, step: 0.01 }} value={child.allowance || ''} onChange={e => updateChild(index, { allowance: e.target.value })} />
            </Grid>
            <Grid item xs={2} md={2}>
              <IconButton aria-label={`Kind ${index + 1} entfernen`} color="error" onClick={() => update('children', children.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
            </Grid>
          </Grid>
        ))}
        <Button startIcon={<AddIcon />} onClick={() => update('children', [...children, { name: '', allowance: '' }])}>Kind hinzufügen</Button>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 4 }} gutterBottom>Abzüge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Aktivieren Sie die gewünschten Abzüge. Der Betrag kann als Prozentsatz oder fixer CHF-Betrag hinterlegt werden.
        </Typography>
        {loading && <Typography color="text.secondary">Abzüge werden geladen …</Typography>}
        {deductions.map((row, index) => (
          <Box key={row.id || index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 1fr) 150px 170px' }, gap: 2, alignItems: 'center', mb: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={row.enabled !== false} onChange={e => updateDeduction(index, { enabled: e.target.checked })} />}
              label={row.name}
            />
            <TextField label="Betrag" type="number" inputProps={{ min: 0, step: 0.0001 }} value={row.value ?? ''} onChange={e => updateDeduction(index, { value: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Einheit</InputLabel>
              <Select label="Einheit" value={row.unit || 'percent'} onChange={e => updateDeduction(index, { unit: e.target.value })}>
                <MenuItem value="percent">Prozent (%)</MenuItem>
                <MenuItem value="fixed">Fixbetrag (CHF)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ))}
        {!loading && deductions.length === 0 && <Typography color="text.secondary">Keine Abzüge in der Organisation hinterlegt.</Typography>}
      </Paper>
    </>
  );
};

export default PayrollDataStep;
