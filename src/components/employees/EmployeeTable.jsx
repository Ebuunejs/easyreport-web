import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper
} from '@mui/material';
import EmployeeTableRow from './EmployeeTableRow';

const EmployeeTable = ({
  employees,
  page,
  rowsPerPage,
  isMobile,
  order,
  orderBy,
  onRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleStatusToggle,
  handleDeleteDialog,
  handleEditEmployee,
  navigateToEmployee
}) => {
  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: { xs: 'calc(100vh - 280px)', sm: 'calc(100vh - 250px)' }, width: '100%', overflowX: 'auto' }}>
        <Table stickyHeader size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => onRequestSort('name')}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      fontSize: { xs: '0.75rem', sm: '1rem' }
                    }
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              )}
              <TableCell sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}>
                Firma
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
              )}
              {!isMobile && (
                <TableCell sx={{ fontWeight: 'bold' }}>Baustelle</TableCell>
              )}
              <TableCell sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}>
                Status
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}>
                Aktionen
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((employee) => (
              <EmployeeTableRow
                key={employee.id}
                employee={employee}
                isMobile={isMobile}
                onRowClick={() => navigateToEmployee(employee.id)}
                onStatusToggle={handleStatusToggle}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteDialog}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={employees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={isMobile ? "" : "Zeilen pro Seite:"}
        sx={{ 
          '.MuiTablePagination-selectLabel': { 
            display: { xs: 'none', sm: 'block' } 
          },
          '.MuiTablePagination-displayedRows': { 
            fontSize: { xs: '0.75rem', sm: '0.875rem' } 
          },
          '.MuiTablePagination-select': { 
            marginRight: { xs: '8px', sm: '32px' } 
          }
        }}
      />
    </Paper>
  );
};

export default EmployeeTable; 