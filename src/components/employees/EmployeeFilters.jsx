import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Button,
  Checkbox
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ImportExport as ImportExportIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';

const EmployeeFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  companyFilter, 
  setCompanyFilter, 
  statusFilter, 
  setStatusFilter, 
  selectedTags, 
  setSelectedTags, 
  companies, 
  bildungsTags,
  kurseFilter,
  setKurseFilter,
  kurse,
  berufeFilter,
  setBerufeFilter,
  berufe,
  handleOpenAddDialog, 
  handleImportExport,
  handleDownloadEmployeeListPdf,
  downloadingEmployeeListPdf,
  isMobile 
}) => {
  return (
    <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label="Name/Email/AHV-Nummer suchen"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: { xs: 1.5, sm: 0 } }}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Firmen</InputLabel>
          <Select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            label="Firmen"
            sx={{ minWidth: '120px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: 250
                }
              }
            }}
          >
            <MenuItem value="">Alle Firmen</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            sx={{ minWidth: '120px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: 200
                }
              }
            }}
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="active">Aktiv</MenuItem>
            <MenuItem value="inactive">Inaktiv</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Berufe</InputLabel>
          <Select
            value={berufeFilter}
            onChange={(e) => setBerufeFilter(e.target.value)}
            label="Berufe"
            sx={{ minWidth: '120px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: 250
                }
              }
            }}
          >
            <MenuItem value="">Alle Berufe</MenuItem>
            {berufe && berufe.map((beruf) => (
              <MenuItem key={beruf.id} value={beruf.id}>
                {beruf.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Kurse</InputLabel>
          <Select
            value={kurseFilter}
            onChange={(e) => setKurseFilter(e.target.value)}
            label="Kurse"
            sx={{ minWidth: '120px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: 250
                }
              }
            }}
          >
            <MenuItem value="">Kein Kurs</MenuItem>
            {kurse && kurse.map((kurs) => (
              <MenuItem key={kurs.id} value={kurs.id}>
                {kurs.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <FormControl fullWidth size="small" sx={{ minWidth: 180, maxWidth: 300 }}>
          <InputLabel>Qualifikationen</InputLabel>
          <Select
            multiple
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            label="Bildungs-Tags"
            sx={{ minWidth: 180, maxWidth: 300 }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((tagId) => {
                  const tag = bildungsTags.find(t => t.id === tagId);
                  return (
                    <Chip
                      key={tagId}
                      label={tag ? tag.name : ''}
                      size="small"
                      color="primary"
                      onDelete={() => {
                        setSelectedTags(selectedTags.filter(id => id !== tagId));
                      }}
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                        '& .MuiChip-deleteIcon': {
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }
                      }}
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: 250
                }
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left'
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left'
              }
            }}
          >
            {bildungsTags.map((tag) => (
              <MenuItem 
                key={tag.id} 
                value={tag.id}
                sx={{
                  py: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Checkbox
                    checked={selectedTags.includes(tag.id)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">{tag.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedTags.length > 0 && (
          <Button
            size="small"
            onClick={() => setSelectedTags([])}
            sx={{ mt: 1, fontSize: '0.75rem' }}
          >
            Filter zurücksetzen
          </Button>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          mt: { xs: 1, md: 0 }
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAddDialog}
        >
          {isMobile ? 'Neu' : 'Neuer Mitarbeiter'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<ImportExportIcon />}
          onClick={handleImportExport}
        >
          {isMobile ? 'Import' : 'Import/Export'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadEmployeeListPdf}
          disabled={downloadingEmployeeListPdf}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {isMobile ? 'PDF' : 'Mitarbeiterliste in PDF'}
        </Button>
      </Grid>
    </Grid>
  );
};

export default EmployeeFilters;
