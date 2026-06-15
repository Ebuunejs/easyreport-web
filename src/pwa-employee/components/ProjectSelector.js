import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  CheckCircle as SelectedIcon
} from '@mui/icons-material';

const ProjectSelector = ({ projects, selectedProject, onProjectSelect }) => {
  return (
    <Grid container spacing={2}>
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;
        
        return (
          <Grid item xs={12} key={project.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: isSelected ? 'primary.main' : 'background.paper',
                color: isSelected ? 'primary.contrastText' : 'text.primary',
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.dark' : 'divider',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
              onClick={() => onProjectSelect(project)}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 1
                }}>
                  <Typography 
                    variant="h6" 
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {project.name}
                  </Typography>
                  {isSelected && (
                    <SelectedIcon sx={{ color: 'inherit' }} />
                  )}
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isSelected ? 'inherit' : 'text.secondary',
                    opacity: isSelected ? 0.9 : 1
                  }}
                >
                  {project.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProjectSelector; 