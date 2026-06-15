import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Work as WorkIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const ProfileTab = ({ employee }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Linke Spalte - Persönliche Informationen */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Persönliche Informationen
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem>
              <ListItemIcon>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Position" 
                secondary={employee.position}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Abteilung" 
                secondary={employee.department?.name || '-'}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Eingestellt am" 
                secondary={formatDate(employee.hire_date)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <AttachMoneyIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Stundensatz" 
                secondary={`${employee.hourly_rate || 0} CHF`}
              />
            </ListItem>
          </List>
        </Grid>
        
        {/* Rechte Spalte - Kontaktdaten */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Kontaktdaten & Weitere Informationen
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Adresse" 
                secondary={employee.address || '-'}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="PLZ / Ort" 
                secondary={`${employee.plz || '-'} ${employee.place || '-'}`}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Geburtsdatum" 
                secondary={formatDate(employee.birth)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Nationalität" 
                secondary={employee.nationality || '-'}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="AHV-Nummer" 
                secondary={employee.ahv || '-'}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Mitarbeiternummer" 
                secondary={employee.employee_number || '-'}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfileTab; 