import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Pause as PauseIcon,
  Done as DoneIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const BaustellenTab = ({ 
  projects,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleOpenProjectDialog,
  handleDeleteProject,
  handleToggleProjectStatus
}) => {
  const [filterName, setFilterName] = useState('');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState({});
  
  // Formatierungsfunktion für Datumsangaben
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Überprüfe, ob das Datum gültig ist
    if (isNaN(date.getTime())) return '-';
    // Format DD-MM-YYYY
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };
  
  // Filterfunktion für Projektnamen
  const handleFilterChange = (event) => {
    setFilterName(event.target.value);
  };
  
  // Status-Menü öffnen
  const handleStatusMenuClick = (event, projectId) => {
    // Verhindere, dass das Klick-Event zum übergeordneten Element weitergeleitet wird
    event.stopPropagation();
    
    // Setze den Anker für das Menü
    setStatusMenuAnchor(prev => ({
      ...prev,
      [projectId]: event.currentTarget
    }));
  };
  
  // Status-Menü schließen
  const handleStatusMenuClose = (projectId) => {
    setStatusMenuAnchor(prev => {
      const newAnchors = { ...prev };
      delete newAnchors[projectId];
      return newAnchors;
    });
  };
  
  // Status ändern und Menü schließen
  const handleChangeStatus = (projectId, newStatus) => {
    handleToggleProjectStatus(projectId, newStatus);
    handleStatusMenuClose(projectId);
  };
  
  // Sortier- und Filterfunktionen für Daten
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(filterName.toLowerCase()) ||
    (project.company?.name || '').toLowerCase().includes(filterName.toLowerCase())
  );
  
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Baustellen durchsuchen"
          variant="outlined"
          value={filterName}
          onChange={handleFilterChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {projects.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Ende</TableCell>
                  <TableCell>Budget (Fr.)</TableCell>
                  <TableCell>Max. Arbeitszeit (h)</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.address || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ position: 'relative' }}>
                        <Chip
                          label={
                            project.status === 'active' ? 'Aktiv' : 
                            project.status === 'on_hold' ? 'Pausiert' : 'Abgeschlossen'
                          }
                          color={
                            project.status === 'active' ? 'success' : 
                            project.status === 'on_hold' ? 'warning' : 'primary'
                          }
                          icon={
                            project.status === 'active' ? <CheckIcon /> : 
                            project.status === 'on_hold' ? <PauseIcon /> : <DoneIcon />
                          }
                          onClick={(event) => handleStatusMenuClick(event, project.id)}
                          sx={{ 
                            cursor: 'pointer',
                            ...(project.status === 'completed' && { 
                              bgcolor: '#90caf9', 
                              color: '#000000' 
                            })
                          }}
                        />
                        <Menu
                          anchorEl={statusMenuAnchor[project.id] || null}
                          open={Boolean(statusMenuAnchor[project.id])}
                          onClose={() => handleStatusMenuClose(project.id)}
                        >
                          <MenuItem onClick={() => handleChangeStatus(project.id, 'active')}>
                            <ListItemIcon>
                              <CheckIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText>Aktiv</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => handleChangeStatus(project.id, 'on_hold')}>
                            <ListItemIcon>
                              <PauseIcon fontSize="small" color="warning" />
                            </ListItemIcon>
                            <ListItemText>Pausiert</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => handleChangeStatus(project.id, 'completed')}>
                            <ListItemIcon>
                              <DoneIcon fontSize="small" color="info" />
                            </ListItemIcon>
                            <ListItemText>Abgeschlossen</ListItemText>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell>{(project.budget || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}</TableCell>
                    <TableCell>{project.max_working_hours ? `${project.max_working_hours}h` : '-'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenProjectDialog(project)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      ) : (
        <Alert severity="info">Keine Baustellen gefunden.</Alert>
      )}
    </>
  );
};

export default BaustellenTab; 