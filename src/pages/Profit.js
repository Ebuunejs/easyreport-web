import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Money as MoneyIcon,
  Construction as ConstructionIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import profitService from '../services/profitService';
import api from '../api/axios';

const Profit = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('current');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  
  // Mitarbeiter-Tab Daten
  const [employees, setEmployees] = useState([]);
  const [employeeTotals, setEmployeeTotals] = useState({
    total_costs: 0,
    total_revenue: 0,
    total_profit: 0,
    total_hours: 0,
    employee_count: 0,
    average_margin: 0
  });
  
  // Baustellenkosten-Tab Daten
  const [constructionData, setConstructionData] = useState([]);
  const [constructionTotals, setConstructionTotals] = useState({
    total_budget: 0,
    total_employee_costs: 0,
    total_material_costs: 0,
    total_other_costs: 0,
    total_costs: 0,
    total_remaining_budget: 0,
    project_count: 0
  });
  
  // Regie-Gewinn-Tab Daten
  const [regieData, setRegieData] = useState([]);
  const [regieTotals, setRegieTotals] = useState({
    total_employee_costs: 0,
    total_effective_costs: 0,
    total_effective_total_costs: 0,
    total_revenue: 0,
    total_profit: 0,
    project_count: 0,
    average_margin: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Daten laden
  useEffect(() => {
    loadAllData();
  }, [period, selectedProject]);

  // Projekte laden
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || response.data);
    } catch (err) {
      console.error('Fehler beim Laden der Projekte:', err);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = { period };
      if (selectedProject) {
        filters.project_id = selectedProject;
      }
      
      // Alle drei Datensätze parallel laden
      const [employeeResponse, constructionResponse, regieResponse] = await Promise.all([
        profitService.getProfitData(filters),
        profitService.getConstructionCosts(filters),
        profitService.getRegieProfits(filters)
      ]);
      
      if (employeeResponse.success) {
        setEmployees(employeeResponse.data);
        setEmployeeTotals(employeeResponse.totals);
      }
      
      if (constructionResponse.success) {
        setConstructionData(constructionResponse.data);
        setConstructionTotals(constructionResponse.totals);
      }
      
      if (regieResponse.success) {
        setRegieData(regieResponse.data);
        setRegieTotals(regieResponse.totals);
      }
      
      if (!employeeResponse.success && !constructionResponse.success && !regieResponse.success) {
        setError('Fehler beim Laden der Daten');
      }
    } catch (err) {
      console.error('Fehler beim Laden der Profit-Daten:', err);
      setError('Fehler beim Laden der Profit-Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // Hilffunktion zum Formatieren von Währungsbeträgen
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gewinnübersicht
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Zeitraum</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Zeitraum"
            disabled={loading}
          >
            <MenuItem value="current">Aktueller Monat</MenuItem>
            <MenuItem value="lastMonth">Letzter Monat</MenuItem>
            <MenuItem value="quarter">Aktuelles Quartal</MenuItem>
            <MenuItem value="year">Aktuelles Jahr</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Baustelle</InputLabel>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            label="Baustelle"
            disabled={loading}
          >
            <MenuItem value="">Alle Baustellen</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Gewinnübersicht Tabs">
          <Tab 
            icon={<BusinessIcon />} 
            label="Mitarbeiterübersicht" 
            iconPosition="start"
          />
          <Tab 
            icon={<ConstructionIcon />} 
            label="Gewinne in Akkord" 
            iconPosition="start"
          />
          <Tab 
            icon={<AccountBalanceIcon />} 
            label="Gewinne in Regie" 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tab 0: Mitarbeiterübersicht */}
          {activeTab === 0 && (
            <>
              {/* Gesamtübersicht */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoneyIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Totale Kosten (Einkauf)
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(employeeTotals.total_costs)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MoneyIcon sx={{ color: 'success.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Totaler Umsatz (Verkauf)
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(employeeTotals.total_revenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ color: 'white', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          Totaler Gewinn
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {formatCurrency(employeeTotals.total_profit)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Mitarbeitertabelle */}
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                  Mitarbeiterübersicht
                </Typography>
                <TableContainer sx={{ maxHeight: 640 }}>
                  <Table stickyHeader aria-label="mitarbeiter gewinn tabelle">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stundensatz (Einkauf)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stundensatz (Verkauf)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stunden</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Kosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Umsatz</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gewinn</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Marge (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.map((employee) => {
                        return (
                          <TableRow 
                            key={employee.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              {employee.name}
                            </TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell align="right">{formatCurrency(employee.hourly_rate_cost)}</TableCell>
                            <TableCell align="right">{formatCurrency(employee.hourly_rate_sale)}</TableCell>
                            <TableCell align="right">{employee.total_hours}</TableCell>
                            <TableCell align="right">{formatCurrency(employee.total_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(employee.total_revenue)}</TableCell>
                            <TableCell 
                              align="right"
                              sx={{ fontWeight: 'bold', color: 'success.main' }}
                            >
                              {formatCurrency(employee.profit)}
                            </TableCell>
                            <TableCell align="right">{employee.margin_percent}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="subtitle1">
                    Total Mitarbeiter: {employeeTotals.employee_count}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Durchschnittliche Marge: {employeeTotals.average_margin}%
                  </Typography>
                </Box>
              </Paper>
            </>
          )}

          {/* Tab 1: Baustellenkosten */}
          {activeTab === 1 && (
            <>
              {/* Gesamtübersicht Baustellenkosten */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalanceIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Totales Budget
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(constructionTotals.total_budget)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoneyIcon sx={{ color: 'warning.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Mitarbeiterkosten
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        {formatCurrency(constructionTotals.total_employee_costs)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ConstructionIcon sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Materialkosten
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {formatCurrency(constructionTotals.total_material_costs)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%', bgcolor: constructionTotals.total_remaining_budget >= 0 ? 'success.light' : 'error.light' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ color: 'white', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          Gewinn
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {formatCurrency(constructionTotals.total_remaining_budget)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Baustellentabelle */}
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                  Baustellenübersicht
                </Typography>
                <TableContainer sx={{ maxHeight: 640 }}>
                  <Table stickyHeader aria-label="baustellen kosten tabelle">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Baustelle</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Budget</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Mitarbeiterkosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Materialkosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Andere Kosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gesamtkosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Verbleibend</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Auslastung (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {constructionData.map((project) => {
                        const budgetUtilization = project.budget_utilization || 0;
                        const isOverBudget = project.remaining_budget < 0;
                        
                        return (
                          <TableRow 
                            key={project.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {project.name}
                                </Typography>
                                {project.address && (
                                  <Typography variant="caption" color="textSecondary">
                                    {project.address}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={project.status} 
                                size="small" 
                                color={project.status === 'active' ? 'success' : project.status === 'completed' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(project.budget)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.employee_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.material_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.other_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.total_costs)}</TableCell>
                            <TableCell 
                              align="right"
                              sx={{ fontWeight: 'bold', color: isOverBudget ? 'error.main' : 'success.main' }}
                            >
                              {formatCurrency(project.remaining_budget)}
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(budgetUtilization, 100)} 
                                  sx={{ 
                                    width: 60, 
                                    height: 8,
                                    backgroundColor: 'grey.300',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: isOverBudget ? 'error.main' : budgetUtilization > 80 ? 'warning.main' : 'success.main'
                                    }
                                  }} 
                                />
                                <Typography variant="body2">
                                  {budgetUtilization}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="subtitle1">
                    Total Baustellen: {constructionTotals.project_count}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Gesamtkosten: {formatCurrency(constructionTotals.total_costs)}
                  </Typography>
                </Box>
              </Paper>
            </>
          )}

          {/* Tab 2: Gewinne in Regie */}
          {activeTab === 2 && (
            <>
              {/* Gesamtübersicht Regie-Gewinne */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoneyIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Effektive Kosten
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(regieTotals.total_effective_total_costs)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MoneyIcon sx={{ color: 'success.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Totaler Umsatz
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(regieTotals.total_revenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%', bgcolor: regieTotals.total_profit >= 0 ? 'success.light' : 'error.light' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ color: 'white', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          Regie-Gewinn
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {formatCurrency(regieTotals.total_profit)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalanceIcon sx={{ color: 'info.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6">
                          Durchschnittliche Marge
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        {regieTotals.average_margin}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Regie-Gewinn-Tabelle */}
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                  Regie-Gewinn nach Baustellen
                </Typography>
                <TableContainer sx={{ maxHeight: 640 }}>
                  <Table stickyHeader aria-label="regie gewinn tabelle">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Baustelle</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Mitarbeiterkosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Effektive Kosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gesamtkosten</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Umsatz</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gewinn</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Marge (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {regieData.map((project) => {
                        const isProfit = project.profit >= 0;
                        
                        return (
                          <TableRow 
                            key={project.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {project.name}
                                </Typography>
                                {project.address && (
                                  <Typography variant="caption" color="textSecondary">
                                    {project.address}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={project.status} 
                                size="small" 
                                color={project.status === 'active' ? 'success' : project.status === 'completed' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(project.employee_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.effective_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.total_effective_costs)}</TableCell>
                            <TableCell align="right">{formatCurrency(project.total_revenue)}</TableCell>
                            <TableCell 
                              align="right"
                              sx={{ fontWeight: 'bold', color: isProfit ? 'success.main' : 'error.main' }}
                            >
                              {formatCurrency(project.profit)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                sx={{ color: isProfit ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                              >
                                {project.margin_percent}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="subtitle1">
                    Total Baustellen: {regieTotals.project_count}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Durchschnittliche Marge: {regieTotals.average_margin}%
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Profit;
