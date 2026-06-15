import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    MenuItem,
    Alert,
    Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { timeLogService } from '../services/timeLogService';
import { projectService } from '../services/projectService';
import debugService from '../services/debugService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const TimeLogs = ({ employeeId }) => {
    const [timeLogs, setTimeLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingTimeLog, setEditingTimeLog] = useState(null);
    const [formData, setFormData] = useState({
        project_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        description: '',
        break_duration: 30
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadTimeLogs();
        loadProjects();
        // Debug-Informationen laden
        debugUserInfo();
    }, [employeeId]);

    const debugUserInfo = async () => {
        try {
            await debugService.getUserInfo();
        } catch (error) {
            console.error('Debug-Informationen konnten nicht geladen werden:', error);
        }
    };

    const loadTimeLogs = async () => {
        try {
            const response = await timeLogService.getTimeLogs(employeeId);
            setTimeLogs(response.data || []);
        } catch (err) {
            setError('Fehler beim Laden der Zeiterfassungen');
            setTimeLogs([]);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await projectService.getProjects();
            setProjects(response.data || []);
        } catch (err) {
            setError('Fehler beim Laden der Projekte');
            setProjects([]);
        }
    };

    const handleOpen = (timeLog = null) => {
        if (timeLog) {
            setEditingTimeLog(timeLog);
            setFormData({
                project_id: timeLog.project.id,
                date: timeLog.date,
                start_time: timeLog.start_time,
                end_time: timeLog.end_time,
                description: timeLog.description,
                break_duration: timeLog.break_duration
            });
        } else {
            setEditingTimeLog(null);
            setFormData({
                project_id: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                start_time: '09:00',
                end_time: '17:00',
                description: '',
                break_duration: 30
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingTimeLog(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTimeLog) {
                await timeLogService.updateTimeLog(employeeId, editingTimeLog.id, formData);
                setSuccess('Zeiterfassung erfolgreich aktualisiert');
            } else {
                await timeLogService.createTimeLog(employeeId, formData);
                setSuccess('Zeiterfassung erfolgreich erstellt');
            }
            handleClose();
            loadTimeLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten');
        }
    };

    const handleDelete = async (timeLogId, timeLogData = null) => {
        // Erstelle eine aussagekräftige Bestätigungsnachricht
        let confirmMessage = 'Möchten Sie diese Zeiterfassung wirklich löschen?';
        if (timeLogData) {
            const dateStr = format(new Date(timeLogData.date), 'dd.MM.yyyy', { locale: de });
            const startTime = formatTimeOnly(timeLogData.start_time);
            const endTime = formatTimeOnly(timeLogData.end_time);
            const projectName = timeLogData.project?.name || 'Unbekanntes Projekt';
            
            confirmMessage = `Möchten Sie diese Zeiterfassung wirklich löschen?\n\n` +
                           `Datum: ${dateStr}\n` +
                           `Projekt: ${projectName}\n` +
                           `Zeit: ${startTime} - ${endTime}\n\n` +
                           `Diese Aktion kann nicht rückgängig gemacht werden.`;
        }

        if (window.confirm(confirmMessage)) {
            try {
                await timeLogService.deleteTimeLog(employeeId, timeLogId);
                setSuccess('Zeiterfassung erfolgreich gelöscht');
                loadTimeLogs();
            } catch (err) {
                console.error('Fehler beim Löschen der Zeiterfassung:', err);
                
                // Detailliertere Fehlermeldungen
                let errorMessage = 'Fehler beim Löschen der Zeiterfassung';
                if (err.response?.status === 403) {
                    errorMessage = 'Sie haben keine Berechtigung, diese Zeiterfassung zu löschen';
                } else if (err.response?.status === 404) {
                    errorMessage = 'Die Zeiterfassung wurde nicht gefunden';
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }
                
                setError(errorMessage);
            }
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    };

    const formatTimeOnly = (timeString) => {
        if (!timeString) return '';
        
        // Backend sendet bereits HH:mm Format (z.B. "08:30")
        // Prüfe ob es bereits das richtige Format ist
        if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}$/)) {
            return timeString;
        }
        
        // Falls es ein DateTime-String ist, versuche ihn zu parsen
        try {
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
            }
        } catch (error) {
            console.warn('Fehler beim Parsen der Zeit:', timeString, error);
        }
        
        // Fallback: den String direkt zurückgeben
        return timeString;
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Zeiterfassungen</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Neue Zeiterfassung
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Datum</TableCell>
                            <TableCell>Projekt</TableCell>
                            <TableCell>Start</TableCell>
                            <TableCell>Ende</TableCell>
                            <TableCell>Pause</TableCell>
                            <TableCell>Gesamt</TableCell>
                            <TableCell>Beschreibung</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Aktionen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeLogs.map((timeLog) => (
                            <TableRow key={timeLog.id}>
                                <TableCell>{format(new Date(timeLog.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                                <TableCell>{timeLog.project.name}</TableCell>
                                <TableCell>{formatTimeOnly(timeLog.start_time)}</TableCell>
                                <TableCell>{formatTimeOnly(timeLog.end_time)}</TableCell>
                                <TableCell>{timeLog.break_duration} min</TableCell>
                                <TableCell>{formatTime(timeLog.total_time)}</TableCell>
                                <TableCell>{timeLog.description}</TableCell>
                                <TableCell>{timeLog.status}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        onClick={() => handleOpen(timeLog)} 
                                        size="small"
                                        title="Zeiterfassung bearbeiten"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(timeLog.id, timeLog)} 
                                        size="small"
                                        color="error"
                                        title="Zeiterfassung löschen"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingTimeLog ? 'Zeiterfassung bearbeiten' : 'Neue Zeiterfassung'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            select
                            label="Projekt"
                            value={formData.project_id}
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        >
                            {projects.map((project) => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            type="date"
                            label="Datum"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="time"
                            label="Startzeit"
                            value={formData.start_time}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="time"
                            label="Endzeit"
                            value={formData.end_time}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="number"
                            label="Pausenzeit (Minuten)"
                            value={formData.break_duration}
                            onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                            fullWidth
                            margin="normal"
                            required
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Beschreibung"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Abbrechen</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingTimeLog ? 'Aktualisieren' : 'Erstellen'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TimeLogs; 