import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Work as ProjectIcon
} from '@mui/icons-material';

const TimeTracker = ({ session }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!session?.startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(session.startTime);
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.startTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLocation = (lat, lng) => {
    return `${lat?.toFixed(6)}, ${lng?.toFixed(6)}`;
  };

  if (!session) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip 
            label="Zeiterfassung läuft" 
            color="success" 
            variant="filled"
            sx={{ fontWeight: 'bold' }}
          />
          <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
            {formatTime(elapsedTime)}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ProjectIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight="bold">
                {session.project?.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {session.project?.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Gestartet um
                </Typography>
                <Typography variant="body2">
                  {new Date(session.startTime).toLocaleTimeString('de-DE')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Startposition
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {formatLocation(session.startLocation?.lat, session.startLocation?.lng)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TimeTracker; 