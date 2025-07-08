'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface PropItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  quantityUsed: number;
  location: string;
  assignedTo: string;
  status: 'available' | 'in-use' | 'missing' | 'damaged' | 'setup-required';
  priority: 'high' | 'medium' | 'low';
  description: string;
  lastUpdated: Date;
  notes?: string;
}

export default function PropTracker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<PropItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const propItems: PropItem[] = [
    {
      id: 'mic-001',
      name: 'Wireless Microphones',
      category: 'Audio Equipment',
      quantity: 8,
      quantityUsed: 6,
      location: 'Grand Hall - Stage',
      assignedTo: 'Mike Wilson',
      status: 'in-use',
      priority: 'high',
      description: 'Wireless handheld microphones for presentations',
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      notes: 'Battery level at 70%',
    },
    {
      id: 'chair-001',
      name: 'Plastic Chairs',
      category: 'Furniture',
      quantity: 200,
      quantityUsed: 180,
      location: 'Grand Hall',
      assignedTo: 'Team Alpha',
      status: 'available',
      priority: 'medium',
      description: 'White plastic chairs for seating arrangement',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: 'game-001',
      name: 'Game Props Set A',
      category: 'Game Equipment',
      quantity: 1,
      quantityUsed: 1,
      location: 'Game Zone',
      assignedTo: 'Team Beta',
      status: 'in-use',
      priority: 'high',
      description: 'Props for ice breaking games including balls, markers, boards',
      lastUpdated: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      notes: 'Missing 2 markers',
    },
    {
      id: 'table-001',
      name: 'Folding Tables',
      category: 'Furniture',
      quantity: 20,
      quantityUsed: 15,
      location: 'Food Station',
      assignedTo: 'Team Gamma',
      status: 'in-use',
      priority: 'medium',
      description: 'Rectangular folding tables for food service',
      lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    },
    {
      id: 'banner-001',
      name: 'Welcome Banners',
      category: 'Decoration',
      quantity: 5,
      quantityUsed: 4,
      location: 'Registration Area',
      assignedTo: 'Team Delta',
      status: 'setup-required',
      priority: 'medium',
      description: 'Large welcome banners for event branding',
      lastUpdated: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      notes: 'One banner needs repositioning',
    },
    {
      id: 'camera-001',
      name: 'Photography Equipment',
      category: 'Recording',
      quantity: 3,
      quantityUsed: 2,
      location: 'Multiple Zones',
      assignedTo: 'Documentation Team',
      status: 'in-use',
      priority: 'high',
      description: 'DSLR cameras and accessories for event documentation',
      lastUpdated: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    },
    {
      id: 'first-aid',
      name: 'First Aid Kit',
      category: 'Safety',
      quantity: 4,
      quantityUsed: 0,
      location: 'Safety Station',
      assignedTo: 'Sarah Wilson',
      status: 'available',
      priority: 'high',
      description: 'Complete first aid kits for emergency situations',
      lastUpdated: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'extension-001',
      name: 'Extension Cords',
      category: 'Electrical',
      quantity: 15,
      quantityUsed: 12,
      location: 'Various Locations',
      assignedTo: 'Technical Team',
      status: 'in-use',
      priority: 'medium',
      description: 'Heavy-duty extension cords for power distribution',
      lastUpdated: new Date(Date.now() - 35 * 60 * 1000), // 35 minutes ago
      notes: 'Check connections regularly',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4caf50';
      case 'in-use': return '#2196f3';
      case 'missing': return '#f44336';
      case 'damaged': return '#ff5722';
      case 'setup-required': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircleIcon />;
      case 'in-use': return <InfoIcon />;
      case 'missing': return <ErrorIcon />;
      case 'damaged': return <ErrorIcon />;
      case 'setup-required': return <WarningIcon />;
      default: return <InfoIcon />;
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

  const getUsagePercentage = (item: PropItem) => {
    return Math.round((item.quantityUsed / item.quantity) * 100);
  };

  const filteredItems = propItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (item: PropItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const categoryStats = propItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, inUse: 0 };
    }
    acc[item.category].total += item.quantity;
    acc[item.category].inUse += item.quantityUsed;
    return acc;
  }, {} as Record<string, { total: number; inUse: number }>);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📦 Prop & Supply Tracker
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            📊 Category Overview
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(categoryStats).map(([category, stats]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stats.inUse} / {stats.total} items in use
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.inUse / stats.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {Math.round((stats.inUse / stats.total) * 100)}% utilization
                    </Typography>
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
                {filteredItems.map((item) => (
                  <TableRow 
                    key={item.id} 
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleItemClick(item)}
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
                          {item.quantityUsed} / {item.quantity}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={getUsagePercentage(item)}
                          sx={{ width: 60, height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {getUsagePercentage(item)}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationIcon fontSize="small" color="primary" />
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
                        {formatTime(item.lastUpdated)}
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
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <InventoryIcon color="primary" />
                <Box>
                  <Typography variant="h6">{selectedItem.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.category} • ID: {selectedItem.id}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Stack spacing={1}>
                  <Chip
                    icon={getStatusIcon(selectedItem.status)}
                    label={selectedItem.status.replace('-', ' ').toUpperCase()}
                    sx={{ 
                      backgroundColor: getStatusColor(selectedItem.status), 
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                  <Chip
                    label={selectedItem.priority.toUpperCase()}
                    size="small"
                    sx={{ 
                      backgroundColor: getPriorityColor(selectedItem.priority), 
                      color: 'white' 
                    }}
                  />
                </Stack>
              </Stack>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Basic Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedItem.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Quantity
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">
                          {selectedItem.quantityUsed} / {selectedItem.quantity}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={getUsagePercentage(selectedItem)}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {getUsagePercentage(selectedItem)}%
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Available Quantity
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {selectedItem.quantity - selectedItem.quantityUsed}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Assignment & Location
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Location
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationIcon color="primary" />
                        <Typography variant="body1">
                          {selectedItem.location}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Assigned To
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {selectedItem.assignedTo.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body1">
                          {selectedItem.assignedTo}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {selectedItem.lastUpdated.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {selectedItem.notes && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ backgroundColor: '#fff3e0' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          📝 Notes
                        </Typography>
                        <Typography variant="body2">
                          {selectedItem.notes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button 
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => {
                  // In real implementation, this would open an edit form
                  console.log('Edit item:', selectedItem.id);
                }}
              >
                Update Status
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 