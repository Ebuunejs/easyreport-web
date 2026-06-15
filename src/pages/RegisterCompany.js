import React, { useState } from 'react';
import {
    Box,
    Container,
    TextField,
    Typography,
    Grid,
    Paper,
    Switch,
    FormControlLabel,
    Button,
    Alert,
    Divider
} from '@mui/material';
import { registerCompany } from '../api/registrationService';

const RegisterCompany = () => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        project_name: '',
        customer_name: '',
        currency: 'CHF',
        hourly_rate: '',
        slug: '',
        feature_projects: true,
        feature_expenses: false,
        feature_invoices: true,
        feature_time: true,
        feature_clock: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const payload = { ...form };
            payload.hourly_rate = payload.hourly_rate ? Number(payload.hourly_rate) : null;
            const res = await registerCompany(payload);
            setSuccess(`Konto erstellt. Subdomain: ${res?.tenant?.domain || payload.slug + '.easyreport.ch'}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Registrierung fehlgeschlagen';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: '#f5f6fa', py: 6 }}>
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Willkommen bei EasyReport
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Bitte geben Sie die Informationen ein, um Ihr Unternehmen anzulegen.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                            Benutzerinformationen
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Vorname" value={form.first_name} onChange={handleChange('first_name')} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Nachname" value={form.last_name} onChange={handleChange('last_name')} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="E-Mail" type="email" value={form.email} onChange={handleChange('email')} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Passwort" type="password" value={form.password} onChange={handleChange('password')} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Passwort bestätigen" type="password" value={form.password_confirmation} onChange={handleChange('password_confirmation')} required />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Erste Daten
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Name Ihrer Firma" value={form.company_name} onChange={handleChange('company_name')} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Name Ihres Kunden" value={form.customer_name} onChange={handleChange('customer_name')} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Name Ihres Projektes" value={form.project_name} onChange={handleChange('project_name')} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Währung" value={form.currency} onChange={handleChange('currency')} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Projektstundensatz" value={form.hourly_rate} onChange={handleChange('hourly_rate')} />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Funktionen
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel control={<Switch checked={form.feature_projects} onChange={handleChange('feature_projects')} />} label="Projektzeiterfassung" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel control={<Switch checked={form.feature_expenses} onChange={handleChange('feature_expenses')} />} label="Spesen" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel control={<Switch checked={form.feature_invoices} onChange={handleChange('feature_invoices')} />} label="Rechnungen" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel control={<Switch checked={form.feature_time} onChange={handleChange('feature_time')} />} label="Arbeitszeiterfassung" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel control={<Switch checked={form.feature_clock} onChange={handleChange('feature_clock')} />} label="Einstempeln / Ausstempeln" />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Web-Adresse
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={8}>
                                <TextField fullWidth label="Subdomain" value={form.slug} onChange={handleChange('slug')} helperText="Nur Buchstaben, Zahlen und Bindestriche" required />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>.easyreport.ch</Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" size="large" disabled={loading}>
                                {loading ? 'Wird erstellt...' : 'Mein Konto erstellen'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default RegisterCompany;
