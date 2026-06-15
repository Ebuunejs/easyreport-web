import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Button, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';
import { 
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  BeachAccess as BeachAccessIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
  Assignment as AssignmentIcon,
  ReceiptLong as ReceiptLongIcon
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DashboardService from '../services/DashboardService';
import api from '../api/axios';

// Chart.js registrieren
ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    employees: {
      count: 0,
      active: 0,
      inactive: 0,
      departments: []
    },
    hours: {
      monthly_hours: 0,
      department_hours: [],
      monthly_hours_data: [],
      lastMonth: 0,
      average: 0
    },
    vacation: {
      planned: 0,
      approved: 0,
      pending: 0,
      monthly_vacation: []
    },
    sickLeave: {
      current: 0,
      thisMonth: 0,
      lastMonth: 0
    },
    upcomingVacations: [],
    sickEmployees: []
  });

  // Erweiterte Dashboard-States
  const [profitTotals, setProfitTotals] = useState({ total_profit: 0, total_revenue: 0, total_costs: 0 });
  const [projects, setProjects] = useState([]);
  const [projectsEndingSoon, setProjectsEndingSoon] = useState([]);
  const [projectsStartingSoon, setProjectsStartingSoon] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingCostsTotal, setPendingCostsTotal] = useState(0);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [profitByProject, setProfitByProject] = useState([]);

  // Funktion zum Abrufen der Abteilungsnamen
  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Abteilungen:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Lade Abteilungen für die Namenanzeige
        await fetchDepartments();
        
        // Lade Dashboard-Daten
        console.log('[Dashboard] Fetching dashboard data...');
        const employeesRes = await DashboardService.getEmployeeData();
        console.log('[Dashboard] Employee data received:', employeesRes);
        const hoursRes = await DashboardService.getHoursData();
        console.log('[Dashboard] Hours data received:', hoursRes);
        const vacationRes = await DashboardService.getVacationData();
        const sickLeaveRes = await DashboardService.getSickLeaveData();

        setDashboardData({
          employees: { 
            count: employeesRes?.total_employees || 0, 
            active: employeesRes?.active_employees || 0, 
            inactive: employeesRes?.inactive_employees || 0,
            departments: employeesRes?.department_stats || []
          },
          hours: {
            monthly_hours: hoursRes?.monthly_hours || 0,
            department_hours: hoursRes?.department_hours || [],
            monthly_hours_data: hoursRes?.monthly_hours_data || [],
            lastMonth: hoursRes?.lastMonth || 0,
            average: hoursRes?.average || 0
          },
          vacation: {
            planned: vacationRes?.planned || 0,
            approved: vacationRes?.approved || 0,
            pending: vacationRes?.pending || 0,
            monthly_vacation: vacationRes?.monthly_vacation || []
          },
          sickLeave: {
            current: sickLeaveRes?.current || 0,
            thisMonth: sickLeaveRes?.thisMonth || 0,
            lastMonth: sickLeaveRes?.lastMonth || 0
          },
          upcomingVacations: vacationRes?.upcoming || [],
          sickEmployees: sickLeaveRes?.employees || []
        });
        
        // Zusätzliche Daten parallel laden
        const [profitRes, projectsRes, pendingCostsRes, approvalsRes, contractsRes, regieRes] = await Promise.all([
          DashboardService.getProfitTotals({ period: 'current' }),
          DashboardService.getProjects(),
          DashboardService.getProjectCosts({ status: 'pending' }),
          DashboardService.getPendingApprovals(),
          DashboardService.getContracts({ status: 'active' }),
          DashboardService.getRegieProfits({ period: 'current' })
        ]);

        setProfitTotals({
          total_profit: profitRes?.total_profit || 0,
          total_revenue: profitRes?.total_revenue || 0,
          total_costs: profitRes?.total_costs || 0
        });

        const now = new Date();
        const in30 = new Date();
        in30.setDate(in30.getDate() + 30);
        const ending = (projectsRes || []).filter(p => p.end_date && new Date(p.end_date) >= now && new Date(p.end_date) <= in30 && p.status === 'active');
        const starting = (projectsRes || []).filter(p => p.start_date && new Date(p.start_date) >= now && new Date(p.start_date) <= in30 && p.status !== 'completed');
        setProjects(projectsRes || []);
        setProjectsEndingSoon(ending);
        setProjectsStartingSoon(starting);

        setPendingApprovals(approvalsRes || []);
        const pendingCosts = (pendingCostsRes || []).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        setPendingCostsTotal(pendingCosts);

        const expiring = (contractsRes || []).filter(c => c.valid_until && new Date(c.valid_until) >= now && new Date(c.valid_until) <= in30);
        setExpiringContracts(expiring);

        const profitProjects = (regieRes?.data || []).map(p => ({ name: p.name, profit: p.profit })).sort((a, b) => b.profit - a.profit).slice(0, 10);
        setProfitByProject(profitProjects);

        // Anomalien letzte 7 Tage
        const start = new Date();
        start.setDate(start.getDate() - 7);
        const fmt = (d) => d.toISOString().slice(0,10);
        const logs7 = await DashboardService.getTimeLogsForDateRange({ start_date: fmt(start), end_date: fmt(now) });
        const computedAnomalies = [];
        (logs7 || []).forEach(l => {
          if (!l.end_time) {
            computedAnomalies.push({ type: 'day_not_closed', label: `${l.employee_name || 'Mitarbeiter'} hat den Tag am ${l.date} nicht abgeschlossen`, date: l.date });
          }
          if ((l.total_hours || 0) > 12) {
            computedAnomalies.push({ type: 'too_many_hours', label: `${l.employee_name || 'Mitarbeiter'} > 12h am ${l.date}`, date: l.date });
          }
          if (l.start_latitude == null && l.end_latitude == null) {
            computedAnomalies.push({ type: 'missing_gps', label: `${l.employee_name || 'Mitarbeiter'} ohne GPS-Daten am ${l.date}`, date: l.date });
          }
        });
        setAnomalies(computedAnomalies);

        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Dashboard-Daten:', error);
        
        // Prüfe, ob es ein Authentifizierungsfehler ist
        if (error.response?.status === 401) {
          console.error('Authentifizierungsfehler: Benutzer ist nicht eingeloggt');
          // Der AuthContext wird automatisch zur Login-Seite weiterleiten
          return;
        }
        
        setDashboardData(prevState => ({
          ...prevState,
          employees: prevState.employees.count ? prevState.employees : { count: 0, active: 0, inactive: 0, departments: [] },
          hours: prevState.hours.monthly_hours ? prevState.hours : { monthly_hours: 0, department_hours: [], monthly_hours_data: [], lastMonth: 0, average: 0},
          vacation: prevState.vacation.planned ? prevState.vacation : { planned: 0, approved: 0, pending: 0, monthly_vacation: [] },
          sickLeave: prevState.sickLeave.current ? prevState.sickLeave : { current: 0, thisMonth: 0, lastMonth: 0 },
          upcomingVacations: [],
          sickEmployees: [],
        }));
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hilfsfunktion zum Abrufen des Abteilungsnamens
  const getDepartmentName = (departmentId) => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : `Abteilung ${departmentId}`;
  };


  const monthlyHoursChartData = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Stunden pro Monat',
        data: (() => {
          const monthlyData = new Array(12).fill(0);
          if (dashboardData.hours?.monthly_hours_data) {
            dashboardData.hours.monthly_hours_data.forEach(item => {
              monthlyData[item.month - 1] = item.hours;
            });
          }
          return monthlyData;
        })(),
        backgroundColor: '#42a5f5',
        borderColor: '#1976d2',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#1e88e5',
      },
    ],
  };
  // Gewinn nach Baustelle Chart-Daten
  const profitByProjectChartData = {
    labels: profitByProject.map(p => p.name),
    datasets: [
      {
        label: 'Gewinn (CHF) nach Baustelle',
        data: profitByProject.map(p => p.profit),
        backgroundColor: '#66bb6a',
        borderColor: '#2e7d32',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#43a047',
      },
    ],
  };

  // Formatierungsfunktion für Datum
  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };
  const formatCurrency = (value) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value || 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prüfe, ob alle Daten 0 sind (möglicherweise nicht authentifiziert)
  const allDataZero = dashboardData.employees?.count === 0 && 
                     dashboardData.hours?.monthly_hours === 0 && 
                     dashboardData.vacation?.planned === 0 && 
                     dashboardData.sickLeave?.current === 0;

  if (allDataZero) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }} gutterBottom>
          Dashboard
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Daten verfügbar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Das Dashboard zeigt keine Daten an. Mögliche Ursachen:
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Sie sind nicht eingeloggt oder Ihre Sitzung ist abgelaufen
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Es sind noch keine Mitarbeiter oder Zeiterfassungsdaten vorhanden
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Es gibt ein Problem mit der Datenverbindung
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Bitte loggen Sie sich ein oder kontaktieren Sie den Administrator.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }} gutterBottom>
        Dashboard
      </Typography>
      
      {/* Statistische Karten */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', height: { xs: 120, sm: 140 }, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ color: '#1976d2', mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              <Typography variant="h6" component="div" fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                Mitarbeiter
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
              {dashboardData.employees?.count || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {dashboardData.employees?.active || 0} aktiv, {dashboardData.employees?.inactive || 0} inaktiv
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', height: { xs: 120, sm: 140 }, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ color: '#1976d2', mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              <Typography variant="h6" component="div" fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                Stunden (Monat)
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
              {dashboardData.hours?.monthly_hours || 0} 
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Vormonat: {dashboardData.hours?.lastMonth || 0} | Ø {dashboardData.hours?.average || 0} pro Mitarbeiter
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', height: { xs: 120, sm: 140 }, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#2e7d32', mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              <Typography variant="h6" component="div" fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                Gewinn (Periode)
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32', fontSize: { xs: '1.4rem', sm: '2rem' } }}>
              {formatCurrency(profitTotals.total_profit)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              Umsatz {formatCurrency(profitTotals.total_revenue)} | Kosten {formatCurrency(profitTotals.total_costs)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', height: { xs: 120, sm: 140 }, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventBusyIcon sx={{ color: '#1976d2', mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              <Typography variant="h6" component="div" fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                Krankmeldungen
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
              {dashboardData.sickLeave?.current || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Monat: {dashboardData.sickLeave?.thisMonth || 0} | Vormonat: {dashboardData.sickLeave?.lastMonth || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts und Info-Sektionen */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 3 }, 
              height: '100%', 
              boxShadow: 2,
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Stunden pro Monat ({new Date().getFullYear()})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box 
              sx={{ 
                height: { xs: '200px', sm: '250px' }, 
                width: '100%'
              }}
            >
              <Bar 
                data={monthlyHoursChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { 
                      display: false 
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: {
                          size: window.innerWidth < 600 ? 10 : 12
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 600 ? 10 : 12
                        }
                      }
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        {/* Gewinn nach Baustelle */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 3 }, 
              height: '100%', 
              boxShadow: 2,
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Gewinn nach Baustelle (Top 10)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: { xs: '200px', sm: '260px' }, width: '100%' }}>
              <Bar 
                data={profitByProjectChartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { font: { size: window.innerWidth < 600 ? 10 : 12 } } },
                    x: { ticks: { font: { size: window.innerWidth < 600 ? 10 : 12 } } }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Tabellen */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 3 }, 
              height: '100%', 
              boxShadow: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Bevorstehende Ferien
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData.upcomingVacations?.length > 0 ? (
              <List 
                sx={{ 
                  p: 0, 
                  overflowY: 'auto', 
                  '& .MuiListItem-root': { 
                    px: { xs: 1, sm: 2 }, 
                    py: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                {dashboardData.upcomingVacations.map((vacation, index) => (
                  <React.Fragment key={`${vacation.employee_id}-${index}`}>
                    <ListItem disablePadding sx={{ mt: 0.5 }}>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {vacation.employee_name && vacation.employee_name !== 'Unbekannt' ? (
                              <>
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    color: '#1976d2',
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    backgroundColor: '#e3f2fd',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    border: '1px solid #bbdefb'
                                  }}
                                >
                                  {vacation.employee_name}
                                </Typography>
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    color: '#666',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    fontWeight: 'medium'
                                  }}
                                >
                                  •
                                </Typography>
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    color: '#2e7d32',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    fontWeight: 'medium',
                                    backgroundColor: '#e8f5e8',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 0.5
                                  }}
                                >
                                  {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                                </Typography>
                              </>
                            ) : (
                              <Typography 
                                component="span" 
                                sx={{ 
                                  color: '#2e7d32',
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  fontWeight: 'medium',
                                  backgroundColor: '#e8f5e8',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 0.5
                                }}
                              >
                                {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.upcomingVacations.length - 1 && (
                      <Divider variant="fullWidth" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                }}
              >
                Keine bevorstehenden Ferien
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 3 }, 
              height: '100%', 
              boxShadow: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Aktuelle Krankmeldungen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData.sickEmployees?.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size={window.innerWidth < 600 ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>Mitarbeiter</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>Von</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>Bis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.sickEmployees.map((sick, index) => (
                      <TableRow key={`${sick.employee_id}-${index}`}>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>{sick.employee_name}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>{formatDate(sick.start_date)}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>{formatDate(sick.end_date) || 'Offen'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                }}
              >
                Keine aktuellen Krankmeldungen
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Ereignisse & Warnungen */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 3 }, 
              height: '100%', 
              boxShadow: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Ereignisse demnächst
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ p: 0 }}>
              {projectsEndingSoon.slice(0, 5).map((p, idx) => (
                <ListItem key={`end-${p.id}-${idx}`} sx={{ py: 0.5 }}>
                  <WarningAmberIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <ListItemText primary={`${p.name}`} secondary={`Endet am ${formatDate(p.end_date)}`} />
                  <Chip size="small" color="warning" label="Ende" />
                </ListItem>
              ))}
              {projectsStartingSoon.slice(0, 5).map((p, idx) => (
                <ListItem key={`start-${p.id}-${idx}`} sx={{ py: 0.5 }}>
                  <AssignmentIcon sx={{ color: 'info.main', mr: 1 }} />
                  <ListItemText primary={`${p.name}`} secondary={`Start am ${formatDate(p.start_date)}`} />
                  <Chip size="small" color="info" label="Start" />
                </ListItem>
              ))}
              {expiringContracts.slice(0, 5).map((c, idx) => (
                <ListItem key={`contract-${c.id}-${idx}`} sx={{ py: 0.5 }}>
                  <ReceiptLongIcon sx={{ color: 'error.main', mr: 1 }} />
                  <ListItemText primary={`${c.documentType?.name || 'Vertrag'}`} secondary={`Läuft ab am ${formatDate(c.valid_until)}`} />
                  <Chip size="small" color="error" label="Vertrag" />
                </ListItem>
              ))}
              {projectsEndingSoon.length === 0 && projectsStartingSoon.length === 0 && expiringContracts.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Keine anstehenden Ereignisse
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper sx={{ p: { xs: 1.5, sm: 3 }, boxShadow: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Aufgaben & Warnungen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Ausstehende Genehmigungen</Typography>
                {pendingApprovals.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {pendingApprovals.slice(0, 6).map((a, idx) => (
                      <ListItem key={`appr-${idx}`} sx={{ py: 0.5 }}>
                        <ListItemText primary={`${a.employee_name} • ${a.project_name || ''}`} secondary={`${formatDate(a.date)} • ${a.total_hours}h`} />
                        <Chip size="small" label="Ausstehend" />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">Keine ausstehenden Genehmigungen</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Ausstehende Kosten</Typography>
                <Typography variant="h6" sx={{ color: 'warning.main' }}>{formatCurrency(pendingCostsTotal)}</Typography>
                <Typography variant="body2" color="text.secondary">Noch zu begleichen</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Anomalien (7 Tage)</Typography>
                {anomalies.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {anomalies.slice(0, 6).map((it, idx) => (
                      <ListItem key={`an-${idx}`} sx={{ py: 0.5 }}>
                        <WarningAmberIcon sx={{ color: it.type === 'too_many_hours' ? 'error.main' : 'warning.main', mr: 1 }} />
                        <ListItemText primary={it.label} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">Keine Anomalien erkannt</Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 