import React from 'react';
import {
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Alert,
  Box,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BeachAccess as VacationIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const VacationTab = ({ 
  vacationRequests = [], 
  vacationBalance = null, 
  loading = false, 
  error = null, 
  onRefresh 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de });
    } catch (e) {
      return dateString; // Fallback für ungültige Datumsformate
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'genehmigt':
      case 'approved':
        return 'success';
      case 'abgelehnt':
      case 'rejected':
        return 'error';
      case 'ausstehend':
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getVacationTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'urlaub':
      case 'vacation':
        return 'primary';
      case 'sonderurlaub':
      case 'special_leave':
        return 'secondary';
      case 'krankheit':
      case 'sick_leave':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Urlaubsplanung
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Urlaubsdaten werden geladen...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Urlaubsplanung
        </Typography>
        {onRefresh && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            Aktualisieren
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VacationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Urlaubssaldo
                </Typography>
              </Box>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Gesamte Urlaubstage" 
                    secondary={
                      <Typography variant="body1" color="text.primary">
                        {vacationBalance?.total_days || 0} Tage
                      </Typography>
                    } 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Verwendete Urlaubstage" 
                    secondary={
                      <Typography variant="body1" color="error.main">
                        {vacationBalance?.used_days || 0} Tage
                      </Typography>
                    } 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Geplante Urlaubstage" 
                    secondary={
                      <Typography variant="body1" color="warning.main">
                        {vacationBalance?.planned_days || 0} Tage
                      </Typography>
                    } 
                  />
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Verbleibende Urlaubstage" 
                    secondary={
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {vacationBalance?.remaining_days || 0}
                      </Typography>
                    } 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Urlaubsanträge ({vacationRequests.length})
            </Typography>
            
            {vacationRequests.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Von</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Bis</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tage</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Typ</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Notizen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vacationRequests.map(vacation => (
                      <TableRow 
                        key={vacation.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                          } 
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(vacation.start_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(vacation.end_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {vacation.days} Tag{vacation.days !== 1 ? 'e' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={vacation.type || 'Unbekannt'} 
                            color={getVacationTypeColor(vacation.type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={vacation.status || 'Unbekannt'} 
                            color={getStatusColor(vacation.status)}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {vacation.notes || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" icon={<VacationIcon />}>
                <Typography variant="body1">
                  Keine Urlaubsanträge vorhanden.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Urlaubsanträge und Abwesenheiten werden hier angezeigt, 
                  sobald sie eingereicht wurden.
                </Typography>
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default VacationTab; 