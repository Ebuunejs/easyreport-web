import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const BerufeTab = ({ 
  departments,
  orderBy,
  order,
  page,
  rowsPerPage,
  handleRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleOpenDeptDialog,
  handleDeleteDepartment
}) => {
  const [filterName, setFilterName] = useState('');
  
  // Filterfunktion für Abteilungsnamen
  const handleFilterChange = (event) => {
    setFilterName(event.target.value);
  };
  
  // Sortier- und Filterfunktionen für Daten
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(filterName.toLowerCase()) ||
    dept.code.toLowerCase().includes(filterName.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(filterName.toLowerCase()))
  );
  
  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    const isAsc = order === 'asc';
    if (orderBy === 'name') {
      return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (orderBy === 'code') {
      return isAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
    }
    if (orderBy === 'employee_count') {
      return isAsc 
        ? (a.employee_count || 0) - (b.employee_count || 0) 
        : (b.employee_count || 0) - (a.employee_count || 0);
    }
    return 0;
  });
  
  const paginatedDepartments = sortedDepartments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Berufe durchsuchen"
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
      
      {departments.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'code'}
                      direction={orderBy === 'code' ? order : 'asc'}
                      onClick={() => handleRequestSort('code')}
                    >
                      Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'employee_count'}
                      direction={orderBy === 'employee_count' ? order : 'asc'}
                      onClick={() => handleRequestSort('employee_count')}
                    >
                      Mitarbeiteranzahl
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDepartments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.id}</TableCell>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.description || '-'}</TableCell>
                    <TableCell>{dept.employee_count || 0}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDeptDialog(dept)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteDepartment(dept.id)}
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
            count={filteredDepartments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      ) : (
        <Alert severity="info">Keine Berufe vorhanden.</Alert>
      )}
    </>
  );
};

export default BerufeTab; 