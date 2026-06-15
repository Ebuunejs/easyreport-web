import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Divider, List, ListItem, ListItemText,
  CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow,
  TableCell, Chip, Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  BeachAccess as BeachAccessIcon,
  WarningAmber as WarningAmberIcon,
  Assignment as AssignmentIcon,
  ReceiptLong as ReceiptLongIcon,
  CheckCircle as CheckCircleIcon,
  Build as ConstructionIcon,
  Schedule as HourglassIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import DashboardService from '../services/DashboardService';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

const KpiCard = ({ icon, label, value, sub, color, bg }) => (
  <Paper elevation={0} sx={{
    p: 2.5,
    height: 140,
    borderRadius: 3,
    background: bg,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: color, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.72rem' }}>
        {label}
      </Typography>
      <Avatar sx={{ bgcolor: color + '22', width: 36, height: 36 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
      </Avatar>
    </Box>
    <Typography variant="h3" sx={{ fontWeight: 800, color: color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: color + 'cc' }}>
      {sub}
    </Typography>
  </Paper>
);

const SectionPaper = ({ title, children, minHeight }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: 3, height: '100%', minHeight: minHeight || 'auto',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column'
  }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#1a237e' }}>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Paper>
);

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState({ count: 0, active: 0, inactive: 0 });
  const [hours, setHours] = useState({ monthly_hours: 0, lastMonth: 0, average: 0, monthly_hours_data: [], department_hours: [] });
  const [vacation, setVacation] = useState({ planned: 0, approved: 0, pending: 0, upcoming: [] });
  const [sickLeave, setSickLeave] = useState({ current: 0, thisMonth: 0, lastMonth: 0, employees: [] });
  const [projects, setProjects] = useState([]);
  const [projectsEndingSoon, setProjectsEndingSoon] = useState([]);
  const [projectsStartingSoon, setProjectsStartingSoon] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '—';

  useEffect(() => {
    const load = async () => {
      try {
        const [deptRes, empRes, hoursRes, vacRes, sickRes] = await Promise.all([
          api.get('/departments'),
          DashboardService.getEmployeeData(),
          DashboardService.getHoursData(),
          DashboardService.getVacationData(),
          DashboardService.getSickLeaveData(),
        ]);

        setDepartments(deptRes.data || []);
        setEmployees({
          count: empRes?.total_employees || 0,
          active: empRes?.active_employees || 0,
          inactive: empRes?.inactive_employees || 0,
        });
        setHours({
          monthly_hours: hoursRes?.monthly_hours || 0,
          lastMonth: hoursRes?.lastMonth || 0,
          average: hoursRes?.average || 0,
          monthly_hours_data: hoursRes?.monthly_hours_data || [],
          department_hours: hoursRes?.department_hours || [],
        });
        setVacation({
          planned: vacRes?.planned || 0,
          approved: vacRes?.approved || 0,
          pending: vacRes?.pending || 0,
          upcoming: vacRes?.upcoming || [],
        });
        setSickLeave({
          current: sickRes?.current || 0,
          thisMonth: sickRes?.thisMonth || 0,
          lastMonth: sickRes?.lastMonth || 0,
          employees: sickRes?.employees || [],
        });

        const [projectsRes, approvalsRes, contractsRes] = await Promise.all([
          DashboardService.getProjects(),
          DashboardService.getPendingApprovals(),
          DashboardService.getContracts({ status: 'active' }),
        ]);

        const now = new Date();
        const in30 = new Date(); in30.setDate(in30.getDate() + 30);
        setProjects(projectsRes || []);
        setProjectsEndingSoon((projectsRes || []).filter(p => p.end_date && new Date(p.end_date) >= now && new Date(p.end_date) <= in30 && p.status === 'active'));
        setProjectsStartingSoon((projectsRes || []).filter(p => p.start_date && new Date(p.start_date) >= now && new Date(p.start_date) <= in30 && p.status !== 'completed'));
        setExpiringContracts((contractsRes || []).filter(c => c.valid_until && new Date(c.valid_until) >= now && new Date(c.valid_until) <= in30));
        setPendingApprovals(approvalsRes || []);

        const start7 = new Date(); start7.setDate(start7.getDate() - 7);
        const fmt = (d) => d.toISOString().slice(0, 10);
        const logs7 = await DashboardService.getTimeLogsForDateRange({ start_date: fmt(start7), end_date: fmt(now) });
        const computed = [];
        (logs7 || []).forEach(l => {
          if (!l.end_time) computed.push({ type: 'warning', label: `${l.employee_name || 'Mitarbeiter'} — Tag nicht abgeschlossen (${l.date})` });
          if ((l.total_hours || 0) > 12) computed.push({ type: 'error', label: `${l.employee_name || 'Mitarbeiter'} > 12h am ${l.date}` });
        });
        setAnomalies(computed);
      } catch (e) {
        console.error('ManagerDashboard Ladefehler:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDeptName = (id) => {
    const d = departments.find(dep => dep.id === id);
    return d ? d.name : `Abt. ${id}`;
  };

  // --- Chart-Daten ---
  const monthlyHoursData = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [{
      label: 'Stunden',
      data: (() => {
        const arr = new Array(12).fill(0);
        hours.monthly_hours_data.forEach(item => { arr[item.month - 1] = item.hours; });
        return arr;
      })(),
      backgroundColor: 'rgba(63,81,181,0.7)',
      borderColor: '#3f51b5',
      borderWidth: 1,
      borderRadius: 5,
      hoverBackgroundColor: '#3f51b5',
    }],
  };

  const deptHoursData = {
    labels: hours.department_hours.slice(0, 8).map(d => getDeptName(d.department_id)),
    datasets: [{
      label: 'Stunden',
      data: hours.department_hours.slice(0, 8).map(d => d.hours || 0),
      backgroundColor: ['#42a5f5','#66bb6a','#ffa726','#ab47bc','#ef5350','#26c6da','#d4e157','#8d6e63'],
      borderRadius: 5,
    }],
  };

  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const onHoldCount = projects.filter(p => p.status === 'on_hold').length;

  const projectStatusData = {
    labels: ['Aktiv', 'Abgeschlossen', 'Pausiert'],
    datasets: [{
      data: [activeCount, completedCount, onHoldCount],
      backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const vacationStatusData = {
    labels: ['Geplant', 'Genehmigt', 'Ausstehend'],
    datasets: [{
      data: [vacation.planned, vacation.approved, vacation.pending],
      backgroundColor: ['#7986cb', '#4db6ac', '#ffb74d'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { font: { size: 11 } } },
    },
  };
  const doughnutOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } },
    },
    cutout: '65%',
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>
          Manager Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Übersicht für {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* KPI-Karten */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<PeopleIcon />}
            label="Mitarbeiter"
            value={employees.count}
            sub={`${employees.active} aktiv · ${employees.inactive} inaktiv`}
            color="#3f51b5"
            bg="linear-gradient(135deg, #e8eaf6 0%, #ffffff 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<AccessTimeIcon />}
            label="Stunden (Monat)"
            value={hours.monthly_hours}
            sub={`Vormonat: ${hours.lastMonth} · Ø ${hours.average}/MA`}
            color="#0288d1"
            bg="linear-gradient(135deg, #e1f5fe 0%, #ffffff 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<BeachAccessIcon />}
            label="Ferienwünsche"
            value={vacation.pending}
            sub={`${vacation.approved} genehmigt · ${vacation.planned} geplant`}
            color="#7b1fa2"
            bg="linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<EventBusyIcon />}
            label="Krankmeldungen"
            value={sickLeave.current}
            sub={`Monat: ${sickLeave.thisMonth} · Vormonat: ${sickLeave.lastMonth}`}
            color="#c62828"
            bg="linear-gradient(135deg, #ffebee 0%, #ffffff 100%)"
          />
        </Grid>
      </Grid>

      {/* Zeile 2: Stunden-Charts */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={8}>
          <SectionPaper title={`Stunden pro Monat (${new Date().getFullYear()})`} minHeight={280}>
            <Box sx={{ height: 220 }}>
              <Bar data={monthlyHoursData} options={chartOptions} />
            </Box>
          </SectionPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionPaper title="Stunden pro Abteilung" minHeight={280}>
            {hours.department_hours.length > 0 ? (
              <Box sx={{ height: 220 }}>
                <Bar
                  data={deptHoursData}
                  options={{ ...chartOptions, indexAxis: 'y', scales: { x: { beginAtZero: true }, y: { ticks: { font: { size: 11 } } } } }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Keine Abteilungsdaten
              </Typography>
            )}
          </SectionPaper>
        </Grid>
      </Grid>

      {/* Zeile 3: Baustellen + Ferien-Status */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SectionPaper title="Baustellen nach Status">
            <Box sx={{ height: 200, position: 'relative' }}>
              <Doughnut data={projectStatusData} options={doughnutOptions} />
              <Box sx={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} color="#3f51b5">{projects.length}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
              {[{ label: 'Aktiv', val: activeCount, color: '#42a5f5' }, { label: 'Fertig', val: completedCount, color: '#66bb6a' }, { label: 'Pause', val: onHoldCount, color: '#ffa726' }].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color={s.color}>{s.val}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </SectionPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SectionPaper title="Ferienübersicht">
            <Box sx={{ height: 200, position: 'relative' }}>
              <Doughnut data={vacationStatusData} options={doughnutOptions} />
              <Box sx={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} color="#7b1fa2">{vacation.planned + vacation.approved + vacation.pending}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
              {[{ label: 'Geplant', val: vacation.planned, color: '#7986cb' }, { label: 'OK', val: vacation.approved, color: '#4db6ac' }, { label: 'Offen', val: vacation.pending, color: '#ffb74d' }].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color={s.color}>{s.val}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </SectionPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionPaper title="Ereignisse demnächst (30 Tage)">
            <List sx={{ p: 0 }}>
              {projectsEndingSoon.slice(0, 4).map((p) => (
                <ListItem key={`end-${p.id}`} sx={{ px: 0, py: 0.5 }}>
                  <WarningAmberIcon sx={{ color: 'warning.main', mr: 1, fontSize: 18 }} />
                  <ListItemText primary={p.name} secondary={`Endet ${formatDate(p.end_date)}`} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} secondaryTypographyProps={{ fontSize: 12 }} />
                  <Chip size="small" color="warning" label="Endet" />
                </ListItem>
              ))}
              {projectsStartingSoon.slice(0, 3).map((p) => (
                <ListItem key={`start-${p.id}`} sx={{ px: 0, py: 0.5 }}>
                  <ConstructionIcon sx={{ color: 'info.main', mr: 1, fontSize: 18 }} />
                  <ListItemText primary={p.name} secondary={`Start ${formatDate(p.start_date)}`} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} secondaryTypographyProps={{ fontSize: 12 }} />
                  <Chip size="small" color="info" label="Start" />
                </ListItem>
              ))}
              {expiringContracts.slice(0, 2).map((c) => (
                <ListItem key={`c-${c.id}`} sx={{ px: 0, py: 0.5 }}>
                  <ReceiptLongIcon sx={{ color: 'error.main', mr: 1, fontSize: 18 }} />
                  <ListItemText primary={c.documentType?.name || 'Vertrag'} secondary={`Läuft ab ${formatDate(c.valid_until)}`} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} secondaryTypographyProps={{ fontSize: 12 }} />
                  <Chip size="small" color="error" label="Vertrag" />
                </ListItem>
              ))}
              {projectsEndingSoon.length === 0 && projectsStartingSoon.length === 0 && expiringContracts.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Keine anstehenden Ereignisse</Typography>
              )}
            </List>
          </SectionPaper>
        </Grid>
      </Grid>

      {/* Zeile 4: Listen */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <SectionPaper title="Bevorstehende Ferien" minHeight={200}>
            {vacation.upcoming.length > 0 ? (
              <List sx={{ p: 0 }}>
                {vacation.upcoming.slice(0, 6).map((v, i) => (
                  <React.Fragment key={i}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <BeachAccessIcon sx={{ color: '#7b1fa2', mr: 1, fontSize: 18 }} />
                      <ListItemText
                        primary={v.employee_name || '—'}
                        secondary={`${formatDate(v.start_date)} – ${formatDate(v.end_date)}`}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                    </ListItem>
                    {i < vacation.upcoming.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Keine bevorstehenden Ferien</Typography>
            )}
          </SectionPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionPaper title="Aktuelle Krankmeldungen" minHeight={200}>
            {sickLeave.employees.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>Mitarbeiter</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>Von</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>Bis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sickLeave.employees.slice(0, 6).map((s, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontSize: 12 }}>{s.employee_name}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDate(s.start_date)}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDate(s.end_date) || 'Offen'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Keine Krankmeldungen</Typography>
            )}
          </SectionPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionPaper title="Genehmigungen & Anomalien" minHeight={200}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Ausstehende Genehmigungen
            </Typography>
            {pendingApprovals.length > 0 ? (
              <List sx={{ p: 0, mb: 1 }}>
                {pendingApprovals.slice(0, 3).map((a, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                    <HourglassIcon sx={{ color: 'warning.main', mr: 1, fontSize: 18 }} />
                    <ListItemText
                      primary={`${a.employee_name || '—'}`}
                      secondary={`${formatDate(a.date)} · ${a.total_hours}h`}
                      primaryTypographyProps={{ fontSize: 13 }}
                      secondaryTypographyProps={{ fontSize: 11 }}
                    />
                    <Chip size="small" label="Offen" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Keine offenen Genehmigungen</Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Anomalien (7 Tage)
            </Typography>
            {anomalies.length > 0 ? (
              <List sx={{ p: 0 }}>
                {anomalies.slice(0, 4).map((a, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 0.25 }}>
                    <WarningAmberIcon sx={{ color: a.type === 'error' ? 'error.main' : 'warning.main', mr: 1, fontSize: 16 }} />
                    <ListItemText primary={a.label} primaryTypographyProps={{ fontSize: 12 }} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                <Typography variant="body2" color="success.main">Keine Anomalien erkannt</Typography>
              </Box>
            )}
          </SectionPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
