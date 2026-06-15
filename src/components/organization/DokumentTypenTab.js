import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    IconButton,
    Tooltip,
    Typography,
    Box,
    Paper
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const DokumentTypenTab = ({
    documentTypes,
    orderBy,
    order,
    page,
    rowsPerPage,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenDocumentTypeDialog,
    handleDeleteDocumentType
}) => {
    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const sortedDocumentTypes = React.useMemo(() => {
        if (!Array.isArray(documentTypes)) return [];
        
        return documentTypes.sort((a, b) => {
            let aValue = a[orderBy] || '';
            let bValue = b[orderBy] || '';
            
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            
            if (bValue < aValue) {
                return order === 'desc' ? -1 : 1;
            }
            if (bValue > aValue) {
                return order === 'desc' ? 1 : -1;
            }
            return 0;
        });
    }, [documentTypes, order, orderBy]);

    const paginatedDocumentTypes = React.useMemo(() => {
        const startIndex = page * rowsPerPage;
        return sortedDocumentTypes.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedDocumentTypes, page, rowsPerPage]);

    if (!Array.isArray(documentTypes) || documentTypes.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Keine Dokumenttypen vorhanden.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'name'}
                                    direction={orderBy === 'name' ? order : 'asc'}
                                    onClick={createSortHandler('name')}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'description'}
                                    direction={orderBy === 'description' ? order : 'asc'}
                                    onClick={createSortHandler('description')}
                                >
                                    Beschreibung
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'created_at'}
                                    direction={orderBy === 'created_at' ? order : 'asc'}
                                    onClick={createSortHandler('created_at')}
                                >
                                    Erstellt am
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">
                                Aktionen
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedDocumentTypes.map((documentType) => (
                            <TableRow key={documentType.id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {documentType.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {documentType.description || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {documentType.created_at ? 
                                            new Date(documentType.created_at).toLocaleDateString('de-DE') : 
                                            '-'
                                        }
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Bearbeiten">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDocumentTypeDialog(documentType)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Löschen">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteDocumentType(documentType.id, documentType.name)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <TablePagination
                component="div"
                count={sortedDocumentTypes.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Zeilen pro Seite:"
                labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} von ${count !== -1 ? count : `mehr als ${to}`}`
                }
            />
        </Box>
    );
};

export default DokumentTypenTab; 