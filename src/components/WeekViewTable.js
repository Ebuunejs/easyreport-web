import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { format, isSameDay, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

// Hilfsfunktion für die Formatierung von Stunden
const formatHours = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return '0.00';
  }
  return Number(hours).toFixed(2);
};

const WeekViewTable = ({ 
  employees, 
  weekTimeLogs, 
  weekDays, 
  getEmployeeHoursForDate, 
  getHoursForDate 
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="15%">Mitarbeiter</TableCell>
            {weekDays.map((day) => (
              <TableCell 
                key={day.toString()} 
                align="center"
                sx={{
                  fontWeight: isToday(day) ? 'bold' : 'normal',
                  bgcolor: isToday(day) ? 'rgba(25, 118, 210, 0.1)' : 'inherit'
                }}
              >
                {format(day, 'EEE, dd.MM', { locale: de })}
              </TableCell>
            ))}
            <TableCell align="center" width="8%">Gesamt</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => {
            const employeeLogs = weekTimeLogs.filter(log => log.employee_id === employee.id);
            const totalHours = employeeLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
            
            return (
              <TableRow key={employee.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {employee.user ? 
                        (employee.user.surname ? 
                          `${employee.user.surname} ${employee.user.name}` : 
                          employee.user.name
                        ) : 
                        'Unbekannt'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {employee.position || 'Unbekannt'}
                    </Typography>
                  </Box>
                </TableCell>
                {weekDays.map((day) => {
                  const dayLogs = employeeLogs.filter(log => isSameDay(new Date(log.date), day));
                  const dayHours = dayLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
                  
                  return (
                    <TableCell 
                      key={day.toString()} 
                      align="center"
                      sx={{
                        bgcolor: isToday(day) ? 'rgba(25, 118, 210, 0.05)' : 'inherit',
                        borderLeft: isToday(day) ? '2px solid #1976d2' : 'none'
                      }}
                    >
                      {dayHours > 0 ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {formatHours(dayHours)} h
                          </Typography>
                          {dayLogs[0] && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {dayLogs[0].start_time} - {dayLogs[0].end_time}
                            </Typography>
                          )}
                          {dayLogs[0]?.notes && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {dayLogs[0].notes.length > 20 ? `${dayLogs[0].notes.substring(0, 20)}...` : dayLogs[0].notes}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="bold">
                    {formatHours(totalHours)} h
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
          
          {/* Gesamtzeile */}
          <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Gesamt</TableCell>
            {weekDays.map((day) => (
              <TableCell 
                key={day.toString()} 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: isToday(day) ? 'rgba(25, 118, 210, 0.1)' : 'inherit'
                }}
              >
                {formatHours(getHoursForDate(day))} h
              </TableCell>
            ))}
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
              {formatHours(weekTimeLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0))} h
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeekViewTable; 