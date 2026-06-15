import React from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Avatar,
  Switch,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const EmployeeTableRow = ({ 
  employee, 
  isMobile, 
  onRowClick, 
  onStatusToggle, 
  onEdit, 
  onDelete 
}) => {
  
  return (
    <TableRow 
      hover
      onClick={onRowClick}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell sx={{ 
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        py: { xs: 1, sm: 1.5 },
        px: { xs: 1, sm: 2 },
        minWidth: '180px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={employee.avatar} 
            sx={{ 
              width: { xs: 24, sm: 32 }, 
              height: { xs: 24, sm: 32 },
              mr: 1 
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ 
              fontWeight: 'medium', 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}>
              {employee.user?.surname ? `${employee.name} ${employee.user.surname}` : employee.name}
            </Typography>
            {isMobile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                {employee.email}
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>
      {!isMobile && (
        <TableCell sx={{ 
          minWidth: '200px',
          wordBreak: 'break-word',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          py: { xs: 1, sm: 1.5 },
          px: { xs: 1, sm: 2 }
        }}>
          {employee.email}
        </TableCell>
      )}
      <TableCell sx={{ 
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        py: { xs: 1, sm: 1.5 },
        px: { xs: 1, sm: 2 }
      }}>
        {employee.company ? employee.company.name : '-'}
      </TableCell>
      {!isMobile && (
        <TableCell sx={{ 
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          py: { xs: 1, sm: 1.5 },
          px: { xs: 1, sm: 2 }
        }}>
          {employee.phone || '-'}
        </TableCell>
      )}
      {!isMobile && (
        <TableCell sx={{ 
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          py: { xs: 1, sm: 1.5 },
          px: { xs: 1, sm: 2 }
        }}>
          {employee.projects && employee.projects.length > 0
            ? employee.projects.map(p => p.name).join(', ')
            : '-'}
        </TableCell>
      )}
      <TableCell sx={{ 
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        py: { xs: 1, sm: 1.5 },
        px: { xs: 1, sm: 2 }
      }}>
        <Tooltip title="Klicken um Status zu ändern">
          <Box onClick={(e) => {
            e.stopPropagation();
            onStatusToggle(employee.id);
          }} sx={{ display: 'inline-block' }}>
            <Switch
              checked={employee.active || employee.is_active}
              size="small"
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1976d2'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1976d2'
                }
              }}
            />
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell 
        onClick={(e) => e.stopPropagation()}
        sx={{ 
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          py: { xs: 0.5, sm: 1 },
          px: { xs: 0.5, sm: 1.5 }
        }}
      >
        <IconButton 
          size={isMobile ? "small" : "medium"} 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(employee.id);
          }}
        >
          <EditIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <IconButton 
          size={isMobile ? "small" : "medium"} 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(employee);
          }}
        >
          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default EmployeeTableRow; 