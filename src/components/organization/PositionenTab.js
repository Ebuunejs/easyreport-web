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
  TextField,
  InputAdornment,
  Box,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const KurseTab = ({ 
  positions, 
  departments,
  handleOpenPosDialog,
  handleDeletePosition
}) => {
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filterfunktion für Positionsnamen
  const handleFilterChange = (event) => {
    setFilterName(event.target.value);
    setPage(0);
  };
  
  // Sortier- und Filterfunktionen für Daten
  const filteredPositions = positions.filter((pos) =>
    pos.name.toLowerCase().includes(filterName.toLowerCase()) ||
    (departments.find(dept => dept.id === pos.department_id)?.name || '').toLowerCase().includes(filterName.toLowerCase())
  );
  
  const paginatedPositions = filteredPositions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Kurse durchsuchen"
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
      
      {positions.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Beruf</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPositions.map(pos => (
                  <TableRow key={pos.id}>
                    <TableCell>{pos.id}</TableCell>
                    <TableCell>{pos.name}</TableCell>
                    <TableCell>
                      {departments.find(dept => dept.id === pos.department_id)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenPosDialog(pos)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeletePosition(pos.id)}
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
            count={filteredPositions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      ) : (
        <Alert severity="info">Keine Kurse vorhanden.</Alert>
      )}
    </>
  );
};

export default KurseTab; 