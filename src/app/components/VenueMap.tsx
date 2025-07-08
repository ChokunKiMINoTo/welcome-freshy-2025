'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { loadVenueData, VenueItem } from '../utils/csvLoader';
import { updateVenueStatus } from '../utils/csvUpdater';
import { useRefresh } from '../contexts/RefreshContext';

const VenueMap: React.FC = () => {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadVenueData();
        setVenues(data);
      } catch (error) {
        console.error('Failed to load venue data:', error);
        showSnackbar('Failed to load venue data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleVenueClick = (venue: VenueItem) => {
    setSelectedVenue(venue);
  };

  const handleCloseDialog = () => {
    setSelectedVenue(null);
  };

  const handleEditStatus = (venue: VenueItem) => {
    setSelectedVenue(venue);
    setNewStatus(venue.status);
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedVenue) return;

    setUpdating(true);
    
    try {
      // Call API to update CSV
      const success = await updateVenueStatus(selectedVenue.id, newStatus);
      
      if (success) {
        // Update local state
        const updatedVenues = venues.map(venue => 
          venue.id === selectedVenue.id 
            ? { ...venue, status: newStatus as 'active' | 'break' | 'setup' }
            : venue
        );
        setVenues(updatedVenues);
        
        showSnackbar(`Status updated for ${selectedVenue.name}`, 'success');
        setEditDialogOpen(false);
        setSelectedVenue(null);
      } else {
        showSnackbar('Failed to update venue status', 'error');
      }
    } catch (error) {
      console.error('Error updating venue status:', error);
      showSnackbar('Error updating venue status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'setup': return '#ff9800';
      case 'break': return '#2196f3';
      case 'maintenance': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'setup': return 'Setup';
      case 'break': return 'Break';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          🗺️ Venue Map
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Loading venues...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        🗺️ Venue Map
      </Typography>

      <Grid container spacing={2}>
        {venues.map((venue) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={venue.id}>
            <Card
              sx={{
                backgroundColor: venue.color,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                border: `2px solid ${getStatusColor(venue.status)}`,
              }}
              onClick={() => handleVenueClick(venue)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {venue.name}
                    </Typography>
                    
                    <Chip
                      label={getStatusLabel(venue.status)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(venue.status),
                        color: 'white',
                        mb: 1,
                      }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      {venue.activities}
                    </Typography>
                  </Box>
                  
                  <Stack spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStatus(venue);
                      }}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVenueClick(venue);
                      }}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Venue Details Dialog */}
      <Dialog open={!!selectedVenue && !editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedVenue && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedVenue.name}</Typography>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedVenue.status)}
                    sx={{
                      backgroundColor: getStatusColor(selectedVenue.status),
                      color: 'white',
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Activities
                  </Typography>
                  <Typography variant="body1">
                    {selectedVenue.activities}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleEditStatus(selectedVenue)} variant="contained">
                Update Status
              </Button>
              <Button onClick={handleCloseDialog}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={editDialogOpen} onClose={() => !updating && setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SaveIcon />
            <Typography variant="h6">Update Venue Status</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedVenue && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body1">
                Updating status for: <strong>{selectedVenue.name}</strong>
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Status changes will be saved to CSV and persist after refresh.
              </Alert>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updating}
                >
                  <MenuItem value="active">🟢 Active</MenuItem>
                  <MenuItem value="setup">🟡 Setup</MenuItem>
                  <MenuItem value="break">🔵 Break</MenuItem>
                  <MenuItem value="maintenance">🔴 Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={updating || newStatus === selectedVenue?.status}
            startIcon={updating ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {updating ? 'Saving...' : 'Save Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VenueMap; 