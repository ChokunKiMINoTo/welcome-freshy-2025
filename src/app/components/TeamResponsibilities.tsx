'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { loadTeamData, TeamItem } from '../utils/csvLoader';
import { useRefresh } from '../page';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatar?: string;
}

interface TeamResponsibility {
  id: string;
  teamName: string;
  color: string;
  zone: string;
  primaryContact: string;
  leadContact: string;
  members: TeamMember[];
  tasks: string[];
  status: 'active' | 'standby' | 'break';
  priority: 'high' | 'medium' | 'low' | 'critical';
}

interface MainContact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export default function TeamResponsibilities() {
  const [teams, setTeams] = useState<TeamResponsibility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamResponsibility | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useRefresh();

  // Main Contacts (Head Organizers)
  const mainContacts: MainContact[] = [
    {
      id: 'head-1',
      name: 'Phukhao Numning',
      role: 'Event Lead',
      phone: '062 345 9888',
    },
    {
      id: 'head-2', 
      name: 'Plaifon Arthittaya',
      role: 'Event Lead',
      phone: '061 830 3103',
    }
  ];

  // Generate team members based on team lead and member count
  const generateTeamMembers = (team: TeamItem): TeamMember[] => {
    const members: TeamMember[] = [];
    
    // Add team lead as first member
    members.push({
      id: `${team.id}-lead`,
      name: team.leadName,
      role: 'Team Lead',
      phone: team.leadContact.replace('@university.ac.th', '').replace(/[^0-9]/g, '081-234-5670')
    });

    // Generate additional members based on member count
    const memberRoles = [
      'Coordinator', 'Assistant', 'Specialist', 'Support Staff', 
      'Technical Lead', 'Operations', 'Quality Control', 'Logistics',
      'Safety Officer', 'Communications', 'Setup Crew', 'Documentation'
    ];

    const firstNames = [
      'Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Amy',
      'John', 'Maria', 'Ryan', 'Kate', 'Tom', 'Nina', 'Paul', 'Sophie'
    ];

    const lastNames = [
      'Johnson', 'Smith', 'Davis', 'Brown', 'Wilson', 'Garcia', 'Miller', 'Taylor',
      'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lee'
    ];

    for (let i = 1; i < team.memberCount; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const role = memberRoles[i % memberRoles.length];
      const phoneNumber = `081-234-${5670 + i}`;

      members.push({
        id: `${team.id}-${i}`,
        name: `${firstName} ${lastName}`,
        role: role,
        phone: phoneNumber
      });
    }

    return members;
  };

  // Generate tasks based on team type
  const generateTasks = (teamName: string, currentTask: string): string[] => {
    const baseTasks = [currentTask];
    
    const taskTemplates: { [key: string]: string[] } = {
      'Game': ['Ice Breaking Games', 'Team Building Activities', 'Safety Monitoring', 'Equipment Management', 'Score Tracking'],
      'MC': ['Script Preparation', 'Stage Coordination', 'Audience Engagement', 'Event Flow Management', 'Microphone Setup'],
      'Food & Drink': ['Meal Service Coordination', 'Food Quality Control', 'Dietary Requirements', 'Cleanup Management', 'Supply Monitoring'],
      'Registration': ['Participant Check-in', 'Badge Distribution', 'Information Desk', 'Lost & Found', 'General Inquiries'],
      'Entertain': ['Performance Setup', 'Sound Check', 'Lighting Coordination', 'Rehearsal Management', 'Equipment Maintenance'],
      'Operation': ['Overall Event Coordination', 'Team Communication', 'Schedule Management', 'Problem Resolution', 'Resource Allocation'],
      'Staff': ['General Support', 'Crowd Management', 'Emergency Response', 'Facility Maintenance', 'Information Assistance'],
      'Photo': ['Photo Session Setup', 'Equipment Check', 'Location Coordination', 'Group Photography', 'Documentation'],
      'Prop': ['Props Distribution', 'Equipment Setup', 'Inventory Management', 'Maintenance Check', 'Storage Organization'],
      'Nurse': ['Medical Station Setup', 'First Aid Response', 'Health Monitoring', 'Emergency Coordination', 'Medical Supplies'],
      'Audio Visual': ['Sound System Setup', 'Video Equipment Check', 'Lighting Configuration', 'Technical Support', 'Quality Control'],
      'Digital Art': ['Graphics Creation', 'Visual Content', 'Display Setup', 'Digital Coordination', 'Creative Support']
    };

    const teamKey = Object.keys(taskTemplates).find(key => teamName.toLowerCase().includes(key.toLowerCase()));
    if (teamKey) {
      return [...baseTasks, ...taskTemplates[teamKey].slice(0, 4)];
    }

    return [...baseTasks, 'Team Coordination', 'Quality Assurance', 'Support Activities', 'Documentation'];
  };

  // Map zone based on team type
  const getZone = (teamName: string): string => {
    const zoneMap: { [key: string]: string } = {
      'Game': 'Game Zone',
      'MC': 'Main Stage',
      'Food & Drink': 'Food Station',
      'Registration': 'Entrance Hall',
      'Entertain': 'Performance Area',
      'Operation': 'Command Center',
      'Staff': 'General Area',
      'Photo': 'Photo Zone',
      'Prop': 'Storage Area',
      'Nurse': 'Medical Station',
      'Audio Visual': 'Technical Area',
      'Digital Art': 'Creative Studio'
    };

    const teamKey = Object.keys(zoneMap).find(key => teamName.toLowerCase().includes(key.toLowerCase()));
    return teamKey ? zoneMap[teamKey] : 'General Area';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadTeamData();
        const enhancedTeams: TeamResponsibility[] = data.map(team => ({
          id: team.id,
          teamName: team.name,
          color: team.color,
          zone: getZone(team.name),
          primaryContact: team.leadName,
          leadContact: team.leadContact,
          members: generateTeamMembers(team),
          tasks: generateTasks(team.name, team.currentTask),
          status: team.status as 'active' | 'standby' | 'break',
          priority: team.priority as 'high' | 'medium' | 'low' | 'critical'
        }));
        setTeams(enhancedTeams);
      } catch (error) {
        console.error('Failed to load team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const filteredTeams = teams.filter(team =>
    team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.primaryContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTeamClick = (team: TeamResponsibility) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTeam(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format phone number to XXX XXX XXX
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format as XXX XXX XXX if 10 digits, otherwise return as is
    if (cleanPhone.length === 10) {
      return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    }
    return phone; // Return original if not 10 digits
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          📋 Teams Directory
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography>Loading teams...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📋 Teams Directory
      </Typography>

      {/* Main Contacts Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <AdminIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Main Contact
            </Typography>
          </Stack>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Primary organizers and decision makers for the ICT Welcome Freshy 2025 event
          </Alert>
          
          <Grid container spacing={2}>
            {mainContacts.map((contact) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={contact.id}>
                <Card
                  sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          backgroundColor: 'primary.main',
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
                        <Typography 
                          variant="body2" 
                          component="a" 
                          href={`tel:${formatPhoneNumber(contact.phone)}`}
                          sx={{ 
                            fontWeight: 500, 
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }
                          }}
                        >
                          {formatPhoneNumber(contact.phone)}
                        </Typography>
                      </Box>
                      
                      <IconButton size="small" color="primary">
                        <AdminIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search teams or team leads..."
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

      {/* Teams Cards */}
      <Grid container spacing={2}>
        {filteredTeams.map((team) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleTeamClick(team)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: team.color, borderRadius: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {team.members.length} members
                  </Typography>
                </Stack>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {team.teamName}
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PersonIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    {team.primaryContact}
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {formatPhoneNumber(team.leadContact)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Team Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedTeam && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: selectedTeam.color, borderRadius: 1 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedTeam.teamName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTeam.zone} • {selectedTeam.members.length} members
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={handleCloseDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                {/* Team Lead Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Team Lead
                  </Typography>
                  {selectedTeam.leadContact.includes(' ') ? (
                    // Multiple phone numbers - show multiple team leads
                    <Stack spacing={2}>
                      {selectedTeam.leadContact.split(' ').map((phone, index) => (
                        <Stack key={index} spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon fontSize="small" color="primary" />
                            <Typography variant="body1">
                              {selectedTeam.primaryContact.split(' ')[index] || `Lead ${index + 1}`}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneIcon fontSize="small" color="primary" />
                            <Typography 
                              variant="body1" 
                              component="a" 
                              href={`tel:${formatPhoneNumber(phone)}`}
                              sx={{ 
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline',
                                  cursor: 'pointer'
                                }
                              }}
                            >
                              {formatPhoneNumber(phone)}
                            </Typography>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    // Single team lead
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="primary" />
                        <Typography variant="body1">
                          {selectedTeam.primaryContact}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon fontSize="small" color="primary" />
                        <Typography 
                          variant="body1" 
                          component="a" 
                          href={`tel:${formatPhoneNumber(selectedTeam.leadContact)}`}
                          sx={{ 
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }
                          }}
                        >
                          {formatPhoneNumber(selectedTeam.leadContact)}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Grid>
                
                {/* Responsibilities */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Responsibilities
                  </Typography>
                  <List>
                    {selectedTeam.tasks.map((task, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: 'transparent', color: selectedTeam.color, width: 32, height: 32 }}>
                            <AssignmentIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={task}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleCloseDialog} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}