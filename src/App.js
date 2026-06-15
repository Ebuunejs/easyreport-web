import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import OrganizationManagement from './pages/OrganizationManagement';
import TimeTracking from './pages/TimeTracking';
import Contracts from './pages/Contracts';
import Reports from './pages/Reports';
import Profit from './pages/Profit';
import VacationPlanning from './pages/VacationPlanning';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Companies from './pages/Companies';
import SubcontractorProjects from './pages/SubcontractorProjects';
import EmployeeDashboard from './pwa-employee/pages/EmployeeDashboard';
import ProjectCosts from './pages/ProjectCosts';
import OperatingCosts from './pages/OperatingCosts';

const RoleDashboard = () => {
  const { user, isManager } = useAuth();
  console.log('[RoleDashboard] user.role =', user?.role);
  if (isManager()) return <ManagerDashboard />;
  return <Dashboard />;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const PrivateRoute = ({ children, roles  }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (roles && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterCompany />} />
            <Route
              path="/"
              element={
                <PrivateRoute roles={['admin', 'manager', 'chief', 'subcontractor', 'employee']}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<RoleDashboard />} />
              <Route path="organization" element={<OrganizationManagement />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profit" element={<Profit />} />
              <Route path="vacation" element={<VacationPlanning />} />
              <Route path="settings" element={<Settings />} />
              <Route path="companies" element={<Companies />} />
              <Route path="project-costs" element={<ProjectCosts />} />
              <Route path="operating-costs" element={<OperatingCosts />} />
              <Route path="subcontractor-projects" element={<PrivateRoute roles={['subcontractor']}><SubcontractorProjects /></PrivateRoute>} />
              <Route 
                path="/employee/dashboard" 
                element={
                  <PrivateRoute roles={['employee']}>
                    <EmployeeDashboard />
                  </PrivateRoute>
                } 
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
