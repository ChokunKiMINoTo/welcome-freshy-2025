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
  Avatar,
  Stack,
  List,
  ListItemButton,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Emergency as EmergencyIcon,
  RadioButtonChecked as RadioIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { loadContactData, ContactItem } from '../utils/csvLoader';
import { useRefresh } from '../contexts/RefreshContext';

const ContactDirectory: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadContactData();
        setContacts(data);
      } catch (error) {
        console.error('Failed to load contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const emergencyContacts = filteredContacts.filter(contact => contact.isEmergency === true);
  const regularContacts = filteredContacts.filter(contact => contact.isEmergency !== true);

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'Team Lead': '#1976d2',
      'Event Director': '#9c27b0',
      'Coordinator': '#4caf50',
      'Assistant': '#ff9800',
      'Security': '#f44336',
      'Medical': '#e91e63',
      'Technical': '#00bcd4',
      'Support': '#795548',
    };
    return colorMap[role] || '#9e9e9e';
  };

  const getTeamColor = (team: string) => {
    const colorMap: { [key: string]: string } = {
      'Game': '#ff5722',
      'Digital Art': '#3f51b5',
      'Entertain': '#e91e63',
      'Food & Drink': '#4caf50',
      'MC': '#9c27b0',
      'Nurse': '#f44336',
      'Operation': '#607d8b',
      'Photo': '#ff9800',
      'Prop': '#795548',
      'Registration': '#2196f3',
      'Staff': '#9e9e9e',
      'Audio Visual': '#673ab7',
    };
    return colorMap[team] || '#9e9e9e';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleContactClick = (contact: ContactItem) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          📞 Contact Directory
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography>Loading contacts...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📞 Contact Directory
      </Typography>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, role, team, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {filteredContacts.length} contacts found
            </Typography>
            <Chip
              label={`${emergencyContacts.length} Emergency`}
              size="small"
              color="error"
              icon={<EmergencyIcon />}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <EmergencyIcon color="error" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                Emergency Contacts
              </Typography>
            </Stack>
            
            <Alert severity="error" sx={{ mb: 2 }}>
              Priority contacts for urgent situations and emergencies
            </Alert>
            
            <Grid container spacing={2}>
              {emergencyContacts.map((contact) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={contact.id}>
                  <Card
                    sx={{
                      border: '2px solid',
                      borderColor: 'error.main',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => handleContactClick(contact)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            backgroundColor: getRoleColor(contact.role),
                            width: 48,
                            height: 48,
                          }}
                        >
                          {getInitials(contact.name)}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {contact.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contact.role}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                            {contact.phone}
                          </Typography>
                        </Box>
                        
                        <IconButton size="small" color="error">
                          <EmergencyIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Regular Contacts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            👥 Staff Directory
          </Typography>
          
          <List>
            {regularContacts.map((contact, index) => (
              <div key={contact.id}>
                <ListItemButton onClick={() => handleContactClick(contact)}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        backgroundColor: getTeamColor(contact.team),
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getInitials(contact.name)}
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {contact.name}
                      </Typography>
                      <Chip
                        label={contact.team}
                        size="small"
                        sx={{
                          backgroundColor: getTeamColor(contact.team),
                          color: 'white',
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Stack>
                  
                  <Divider />
                </ListItemButton>
              </div>
            ))}
          </List>
          
          {regularContacts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No contacts found matching your search
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedContact && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    backgroundColor: selectedContact.isEmergency === true 
                      ? 'error.main' 
                      : getTeamColor(selectedContact.team),
                    width: 56,
                    height: 56,
                  }}
                >
                  {selectedContact.isEmergency === true ? (
                    <EmergencyIcon />
                  ) : (
                    getInitials(selectedContact.name)
                  )}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{selectedContact.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {selectedContact.role}
                    </Typography>
                    {selectedContact.isEmergency === true && (
                      <Chip
                        label="EMERGENCY"
                        size="small"
                        color="error"
                        icon={<EmergencyIcon />}
                      />
                    )}
                  </Stack>
                </Box>
                
                <IconButton onClick={() => setDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Team Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Team</Typography>
                      <Chip
                        label={selectedContact.team}
                        sx={{
                          backgroundColor: getTeamColor(selectedContact.team),
                          color: 'white',
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Role</Typography>
                      <Typography variant="body1">{selectedContact.role}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Contact Information
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PhoneIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedContact.phone}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {selectedContact.lineId && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <EmailIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">LINE ID</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedContact.lineId}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                    
                    {selectedContact.radioChannel && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <RadioIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Radio Channel</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Channel {selectedContact.radioChannel}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
                
                {selectedContact.isEmergency === true && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning">
                      This is an emergency contact. Use this number for urgent situations only.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ContactDirectory; 