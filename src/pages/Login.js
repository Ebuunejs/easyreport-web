import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Alert,
  img,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Funktion zur Übersetzung der Rolle in lesbare deutsche Bezeichnungen
const translateRole = (role) => {
  const roleTranslations = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Mitarbeiter',
    chief: 'Teamleiter',
    user: 'Benutzer'
  };
  
  return roleTranslations[role] || role;
};

// Funktion zur Bestimmung der Farbe für die Rollen-Chips
const getRoleColor = (role) => {
  const roleColors = {
    admin: 'error',
    manager: 'warning',
    employee: 'success',
    chief: 'info',
    user: 'default'
  };
  
  return roleColors[role] || 'default';
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      const userData = await login(email, password, slug);
      console.log("userData: ", userData);
      if (userData && userData.role) {
        console.log("userData.role: ", userData.role);
        setUserRole(userData.role);
        setLoginSuccess(true);
        console.log("---------------------------------------------------");
        console.log("HAHAHAHAHHAHAHAHAHAHAHHAHAHAHAHHAHAHAHAHHAHAHAHAHHAHAHAHAHHAHAHAHAHHAHAHAHAHHAHAHAHAH");
        console.log("---------------------------------------------------");
        if(userData.role === 'employee') {
          navigate('/employee/dashboard');
        } else {
          navigate('/');
        }
        // Kurze Anzeige der Erfolgsmeldung vor der Weiterleitung
        setTimeout(() => {
          //navigate('/employee/dashboard');
        }, 1500);
      } else {
        throw new Error('Keine Benutzerrolle erhalten');
        setLoginSuccess(false);
        setLoading(false);
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#495057'
      }}
    >
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
       
        <img src={require('../assets/logo-ende.png')} alt="Logo" height={120} style={{ marginBottom: 10 }}>
        </img>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Bitte melden Sie sich an, um fortzufahren
        </Typography>
        
        {loginSuccess ? (
          <Box sx={{ width: '100%', textAlign: 'center', my: 3 }}>
            <VerifiedUserIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Anmeldung erfolgreich!
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Ihre Rolle:
              </Typography>
              <Chip 
                label={translateRole(userRole)} 
                color={getRoleColor(userRole)} 
                variant="outlined"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Sie werden weitergeleitet...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-Mail-Adresse"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="slug"
              label="Unternehmen"
              name="slug"
              autoComplete="organization"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
              placeholder="z.B. meinefirma"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#10A8C0',
                '&:hover': {
                  backgroundColor: '#0d8ba8'
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Anmelden'
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
    </Box>
  );
};

export default Login; 