'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { loadPropData, PropItem } from '../utils/csvLoader';
import { useRefresh } from '../contexts/RefreshContext';

const PropTracker: React.FC = () => {
  const [props, setProps] = useState<PropItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<PropItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadPropData();
        setProps(data);
      } catch (error) {
        console.error('Failed to load prop data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '#4caf50';
      case 'in-use': return '#2196f3';
      case 'missing': return '#f44336';
      case 'damaged': return '#ff9800';
      case 'setup-required': return '#9c27b0';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return <CheckCircleIcon />;
      case 'in-use': return <InventoryIcon />;
      case 'missing': return <ErrorIcon />;
      case 'damaged': return <WarningIcon />;
      case 'setup-required': return <InventoryIcon />; // This case was removed from imports, so using InventoryIcon as a placeholder
      default: return <InventoryIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sound': return '🎵';
      case 'decoration': return '🎨';
      case 'lighting': return '💡';
      case 'furniture': return '🪑';
      case 'game': return '🎮';
      case 'technology': return '💻';
      case 'safety': return '🛡️';
      case 'audio equipment': return '🎵';
      case 'recording': return '📷';
      case 'electrical': return '⚡';
      default: return '📦';
    }
  };

  const getUtilizationPercentage = (item: PropItem) => {
    // For now, we'll use a simple calculation based on status
    // In a real system, there would be an inUse field
    if (item.quantity === 0) return 0;
    if (item.status === 'in-use') return 80; // Assume 80% utilization when in use
    if (item.status === 'available') return 20; // Assume 20% utilization when available
    return 50; // Default for other statuses
  };

  const getInUseCount = (item: PropItem) => {
    // Calculate estimated in-use count based on status and utilization
    const utilizationPercent = getUtilizationPercentage(item);
    return Math.floor((item.quantity * utilizationPercent) / 100);
  };

  const filteredProps = props.filter(prop =>
    prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePropClick = (prop: PropItem) => {
    setSelectedProp(prop);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProp(null);
  };

  const categoryStats = props.reduce((acc, prop) => {
    if (!acc[prop.category]) {
      acc[prop.category] = {
        total: 0,
        available: 0,
        inUse: 0,
        issues: 0
      };
    }
    acc[prop.category].total += prop.quantity;
    const inUseCount = getInUseCount(prop);
    acc[prop.category].inUse += inUseCount;
    if (prop.status === 'available') acc[prop.category].available += prop.quantity - inUseCount;
    if (['missing', 'damaged'].includes(prop.status.toLowerCase())) acc[prop.category].issues += 1;
    return acc;
  }, {} as Record<string, { total: number; available: number; inUse: number; issues: number }>);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          📦 Prop Tracker
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography>Loading prop data...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📦 Prop Tracker
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search props, categories, locations, or assigned staff..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Category Overview */}
      <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main', backgroundColor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'primary.main', textAlign: 'center' }}>
            📊 Category Overview
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(categoryStats).map(([category, stats]) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category}>
                <Card
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    '&:hover': { transform: 'scale(1.02)' },
                    transition: 'transform 0.2s',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {getCategoryIcon(category)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                    <Stack direction="row" justifyContent="space-around" spacing={1}>
                      <Box>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
                          {stats.available}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Available
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 700 }}>
                          {stats.inUse}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          In Use
                        </Typography>
                      </Box>
                      {stats.issues > 0 && (
                        <Box>
                          <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 700 }}>
                            {stats.issues}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Issues
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            📋 All Items
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Priority</TableCell>
                  <TableCell align="center">Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProps.map((item) => (
                  <TableRow 
                    key={item.id} 
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handlePropClick(item)}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {item.id}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getInUseCount(item)} / {item.quantity}
                        </Typography>
                        <CircularProgress 
                          variant="determinate" 
                          value={getUtilizationPercentage(item)}
                          size={40}
                          sx={{ color: '#4caf50' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {getUtilizationPercentage(item)}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {/* LocationIcon was removed from imports, so using a placeholder */}
                        <Typography variant="body2">
                          {item.location}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                          {item.assignedTo.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">
                          {item.assignedTo}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(item.status)}
                        label={item.status.replace('-', ' ').toUpperCase()}
                        size="small"
                        sx={{ 
                          backgroundColor: getStatusColor(item.status), 
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.priority.toUpperCase()}
                        size="small"
                        sx={{ 
                          backgroundColor: getPriorityColor(item.priority), 
                          color: 'white' 
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {item.lastUpdated}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Item Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProp && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedProp.name}</Typography>
                <IconButton onClick={handleCloseDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Basic Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedProp.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Quantity
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">
                          {getInUseCount(selectedProp)} / {selectedProp.quantity}
                        </Typography>
                        <CircularProgress 
                          variant="determinate" 
                          value={getUtilizationPercentage(selectedProp)}
                          size={100}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {getUtilizationPercentage(selectedProp)}%
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Available Quantity
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {selectedProp.quantity - getInUseCount(selectedProp)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Assignment & Location
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Location
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {/* LocationIcon was removed from imports, so using a placeholder */}
                        <Typography variant="body1">
                          {selectedProp.location}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Assigned To
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {selectedProp.assignedTo.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body1">
                          {selectedProp.assignedTo}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body1">{selectedProp.lastUpdated}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                {selectedProp.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined" sx={{ backgroundColor: '#fff3e0' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          📝 Notes
                        </Typography>
                        <Typography variant="body2">
                          {selectedProp.notes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button 
                variant="outlined"
                onClick={() => {
                  // In real implementation, this would open an edit form
                  console.log('Edit prop:', selectedProp);
                }}
              >
                Edit
              </Button>
              <Button onClick={handleCloseDialog}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PropTracker;