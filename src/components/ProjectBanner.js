import React from 'react';
import { Box, Typography } from '@mui/material';

const ProjectBanner = () => {
  return (
    <Box
      sx={{
        width: '1024px',
        height: '500px',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'1024\' height=\'500\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 40 0 L 0 0 0 40\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      {/* Dekorative Elemente */}
      <Box
        sx={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white'
        }}
      >
        ⏰
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white'
        }}
      >
        🏗️
      </Box>

      {/* Hauptinhalt */}
      <Box
        sx={{
          textAlign: 'center',
          color: 'white',
          zIndex: 2,
          maxWidth: '800px',
          px: 4
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: '3.5rem',
            fontWeight: 700,
            mb: 2,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Stundenrapporte
        </Typography>
        
        <Typography
          variant="h4"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 400,
            mb: 3,
            opacity: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Professionelle Zeiterfassung für Baustellen
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ fontSize: '20px' }}>📱</span>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Mobile App
            </Typography>
          </Box>
          
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ fontSize: '20px' }}>📍</span>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              GPS-Tracking
            </Typography>
          </Box>
          
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ fontSize: '20px' }}>📊</span>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Berichte
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Zusätzliche dekorative Elemente */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default ProjectBanner;
