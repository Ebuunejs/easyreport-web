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
  TablePagination,
  TableSortLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const KurseTab = ({ 
  courses, 
  orderBy,
  order,
  page,
  rowsPerPage,
  handleRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleOpenCourseDialog,
  handleDeleteCourse
}) => {
  const [filterName, setFilterName] = useState('');
  
  // Filterfunktion für Kursnamen
  const handleFilterChange = (event) => {
    setFilterName(event.target.value);
  };
  
  // Sortier- und Filterfunktionen für Daten
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(filterName.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(filterName.toLowerCase()))
  );
  
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const isAsc = order === 'asc';
    if (orderBy === 'name') {
      return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (orderBy === 'description') {
      const aDesc = a.description || '';
      const bDesc = b.description || '';
      return isAsc ? aDesc.localeCompare(bDesc) : bDesc.localeCompare(aDesc);
    }
    return 0;
  });
  
  const paginatedCourses = sortedCourses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
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
      
      {courses.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'description'}
                      direction={orderBy === 'description' ? order : 'asc'}
                      onClick={() => handleRequestSort('description')}
                    >
                      Beschreibung
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCourses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.description || '-'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenCourseDialog(course)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteCourse(course.id)}
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
            count={filteredCourses.length}
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