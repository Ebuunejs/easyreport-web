import React from 'react';
import {
  Grid,
  Avatar,
  Typography,
  Chip,
  Box,
  Paper
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const EmployeeHeader = ({ employee }) => {
  if (!employee) return null;
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={2} md={1}>
          <Avatar 
            sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
            src={employee.avatar}
          >
            {employee.user?.name.charAt(0)}
          </Avatar>
        </Grid>
        <Grid item xs={12} sm={10} md={11}>
          <Typography variant="h4" gutterBottom>
            {employee.user?.name}
            {" "}
            {employee.user?.surname || ""}
            <Chip 
              label={employee.is_active ? "Aktiv" : "Inaktiv"}
              color={employee.is_active ? "success" : "error"}
              size="small"
              sx={{ ml: 2, verticalAlign: 'middle' }}
            />
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {employee.position} • {employee.department?.name}
          </Typography>
          <Box sx={{ display: 'flex', mt: 1 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
              {employee.user?.email}
            </Typography>
            {employee.phone && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                {employee.phone}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EmployeeHeader; 