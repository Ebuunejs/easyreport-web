import React from 'react';
import {
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Divider,
  Box,
  Checkbox,
  CircularProgress
} from '@mui/material';

const BildungstagTab = ({ 
  bildungsTags = [], 
  selectedBildungsTags = [],
  loadingBildungsTags = false
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ausbildungen und Qualifikationen
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {loadingBildungsTags ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                Qualifikationen und Ausbildungen des Mitarbeiters:
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TableContainer>
                <Table sx={{ minWidth: 650, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell width="60px" align="center">Auswahl</TableCell>
                      <TableCell>Ausbildung/Qualifikation</TableCell>
                      <TableCell>Beschreibung</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bildungsTags.map(tag => (
                      <TableRow 
                        key={tag.id}
                        sx={{ 
                          bgcolor: selectedBildungsTags.includes(tag.id) 
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'transparent',
                          borderLeft: selectedBildungsTags.includes(tag.id) 
                            ? '4px solid #1976d2' 
                            : '4px solid transparent'
                        }}
                      >
                        <TableCell align="center">
                          <Checkbox 
                            checked={selectedBildungsTags.includes(tag.id)}
                            color="primary"
                            disabled
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontWeight={selectedBildungsTags.includes(tag.id) ? 'bold' : 'normal'}
                            color={selectedBildungsTags.includes(tag.id) ? 'primary' : 'inherit'}
                          >
                            {tag.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{tag.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default BildungstagTab; 