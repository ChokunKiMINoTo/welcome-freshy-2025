'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Grid,
  Button,
  Collapse,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Group,
  ExpandMore,
  ExpandLess,
  People,
  Engineering,
  Restaurant,
  TheaterComedy,
  SupportAgent,
  SportsEsports
} from '@mui/icons-material';
import { loadScheduleData, ScheduleItem } from '../utils/csvLoader';
import { useRefresh } from '../contexts/RefreshContext';

// Extended interface with calculated status
interface ScheduleItemWithStatus extends ScheduleItem {
  status: 'completed' | 'ongoing' | 'upcoming';
}

// Team filter type
type TeamFilter = 'all' | 'operation' | 'registration' | 'foodDrink' | 'entertain' | 'staff' | 'game';

const LiveSchedule: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItemWithStatus[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamFilter>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [nextEventExpanded, setNextEventExpanded] = useState(false);
  const { refreshTrigger } = useRefresh();

  // Function to convert time string (HH:MM) to minutes since midnight
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Function to calculate status based on current time
  const calculateStatus = (startTime: string, endTime: string, currentTime: Date): 'completed' | 'ongoing' | 'upcoming' => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (currentMinutes < startMinutes) {
      return 'upcoming';
    } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

  // Get team duties for a schedule item
  const getTeamDuties = (item: ScheduleItemWithStatus) => {
    const duties = [
      { team: 'Operation', duty: item.operation, icon: Engineering, color: '#1976d2' },
      { team: 'Registration', duty: item.registration, icon: People, color: '#9c27b0' },
      { team: 'Food & Drink', duty: item.foodDrink, icon: Restaurant, color: '#4caf50' },
      { team: 'Entertain', duty: item.entertain, icon: TheaterComedy, color: '#ff9800' },
      { team: 'Staff', duty: item.staff, icon: SupportAgent, color: '#f44336' },
      { team: 'Game', duty: item.game, icon: SportsEsports, color: '#2196f3' },
    ].filter(d => d.duty && d.duty !== '—' && d.duty.trim() !== '');
    
    return duties;
  };

  // Filter schedule based on selected team
  const getFilteredSchedule = () => {
    if (selectedTeam === 'all') return scheduleItems;
    
    return scheduleItems.filter(item => {
      const duties = getTeamDuties(item);
      return duties.some(duty => 
        duty.team.toLowerCase().replace(/\s+/g, '').replace('&', '') === selectedTeam.replace(/([A-Z])/g, ' $1').trim().toLowerCase().replace(/\s+/g, '').replace('&', '')
      );
    });
  };

  // Toggle card expansion
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleNextEventExpanded = () => {
    setNextEventExpanded(!nextEventExpanded);
  };

  // Team filter buttons data
  const teamFilters = [
    { key: 'all', label: 'All', icon: Group, color: '#666' },
    { key: 'operation', label: 'Operation', icon: Engineering, color: '#1976d2' },
    { key: 'registration', label: 'Registration', icon: People, color: '#9c27b0' },
    { key: 'foodDrink', label: 'Food & Drink', icon: Restaurant, color: '#4caf50' },
    { key: 'entertain', label: 'Entertain', icon: TheaterComedy, color: '#ff9800' },
    { key: 'staff', label: 'Staff', icon: SupportAgent, color: '#f44336' },
    { key: 'game', label: 'Game', icon: SportsEsports, color: '#2196f3' },
  ];

  // Load CSV data and calculate statuses
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadScheduleData();
        const dataWithStatus = data.map(item => ({
          ...item,
          status: calculateStatus(item.startTime, item.endTime, currentTime)
        }));
        setScheduleItems(dataWithStatus);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger, currentTime]);

  // Update current time every minute and recalculate statuses
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setCurrentTime(newTime);
      
      // Recalculate statuses for all items
      setScheduleItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          status: calculateStatus(item.startTime, item.endTime, newTime)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'ongoing': return '#ff9800';
      case 'upcoming': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'ongoing': return <PlayArrowIcon />;
      case 'upcoming': return <PauseIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Calculate time remaining for current event
  const getTimeRemaining = (endTime: string, currentTime: Date): string => {
    const endMinutes = timeToMinutes(endTime);
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const remainingMinutes = endMinutes - currentMinutes;
    
    if (remainingMinutes <= 0) {
      return "00:00";
    }
    
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get current event (status === 'ongoing')
  const getCurrentEvent = () => {
    return scheduleItems.find(item => item.status === 'ongoing');
  };

  // Get next event (first upcoming event chronologically)
  const getNextEvent = () => {
    const upcomingEvents = scheduleItems.filter(item => item.status === 'upcoming');
    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  };

  const filteredSchedule = getFilteredSchedule();
  const currentEvent = getCurrentEvent();
  const nextEvent = getNextEvent();

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          📅 Live Event Schedule
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography>Loading schedule...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📅 Live Event Schedule
      </Typography>
      
      {/* Current Time */}
      <Card sx={{ mb: 2, backgroundColor: '#f3e5f5' }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Current Time: {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Team Filter Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            🔍 Filter by Team:
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
              {teamFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isSelected = selectedTeam === filter.key;
                
                return (
                  <Button
                    key={filter.key}
                    variant={isSelected ? 'contained' : 'outlined'}
                    startIcon={<IconComponent />}
                    onClick={() => setSelectedTeam(filter.key as TeamFilter)}
                    sx={{
                      backgroundColor: isSelected ? filter.color : 'transparent',
                      borderColor: filter.color,
                      color: isSelected ? 'white' : filter.color,
                      '&:hover': {
                        backgroundColor: isSelected ? filter.color : `${filter.color}20`,
                      },
                      minWidth: 'max-content',
                      textTransform: 'none',
                    }}
                    size="small"
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Current Event Highlight - Based on Real Time */}
      {currentEvent && (
        <Card sx={{ mb: 3, border: '2px solid #ff9800', backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PlayArrowIcon sx={{ color: '#ff9800' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                NOW HAPPENING
              </Typography>
            </Stack>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {currentEvent.title}
            </Typography>
            
            {/* Time Remaining Display */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTimeIcon sx={{ color: '#ff9800' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                  TIME REMAINING: [{getTimeRemaining(currentEvent.endTime, currentTime)}]
                </Typography>
              </Stack>
            </Box>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatTime(currentEvent.startTime)} - {formatTime(currentEvent.endTime)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {currentEvent.location}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {currentEvent.responsible}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {/* Current Event Team Duties */}
            {getTeamDuties(currentEvent).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    🎯 Active Team Duties:
                  </Typography>
                  <Tooltip title={expandedCards.has(currentEvent.id) ? 'Hide detailed duties' : 'Show detailed duties'}>
                    <IconButton
                      onClick={() => toggleExpanded(currentEvent.id)}
                      size="small"
                      sx={{ color: '#ff9800' }}
                    >
                      {expandedCards.has(currentEvent.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Tooltip>
                </Stack>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {getTeamDuties(currentEvent).map((duty, index) => {
                    const IconComponent = duty.icon;
                    return (
                      <Chip
                        key={index}
                        icon={<IconComponent />}
                        label={`${duty.team}: ${duty.duty.length > 25 ? duty.duty.substring(0, 25) + '...' : duty.duty}`}
                        sx={{
                          backgroundColor: `${duty.color}20`,
                          color: duty.color,
                          border: `1px solid ${duty.color}`,
                          mb: 0.5,
                        }}
                        size="small"
                      />
                    );
                  })}
                </Stack>

                {/* Expandable Detailed Duties for Current Event */}
                <Collapse in={expandedCards.has(currentEvent.id)}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    📋 Detailed Team Responsibilities:
                  </Typography>
                  
                  <Stack spacing={1}>
                    {getTeamDuties(currentEvent).map((duty, index) => {
                      const IconComponent = duty.icon;
                      return (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: `${duty.color}10`,
                            border: `1px solid ${duty.color}30`,
                          }}
                        >
                          <IconComponent 
                            sx={{ 
                              color: duty.color, 
                              fontSize: 20, 
                              mt: 0.2,
                              flexShrink: 0 
                            }} 
                          />
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ color: duty.color, fontWeight: 600 }}
                            >
                              {duty.team}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {duty.duty}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Collapse>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Event - Based on Real Time */}
      {nextEvent && (
        <Card sx={{ mb: 3, border: '2px solid #2196f3', backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PauseIcon sx={{ color: '#2196f3' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2196f3' }}>
                UP NEXT
              </Typography>
              {/* Show/Hide Button moved up here */}
              {getTeamDuties(nextEvent).length > 0 && (
                <Box sx={{ ml: 'auto' }}>
                  <Tooltip title={nextEventExpanded ? 'Hide detailed duties' : 'Show detailed duties'}>
                    <IconButton
                      onClick={toggleNextEventExpanded}
                      size="small"
                      sx={{ color: '#2196f3' }}
                    >
                      {nextEventExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Stack>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {nextEvent.title}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatTime(nextEvent.startTime)} - {formatTime(nextEvent.endTime)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {nextEvent.location}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {nextEvent.responsible}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {/* Expandable Detailed Duties for Next Event */}
            {getTeamDuties(nextEvent).length > 0 && (
              <Collapse in={nextEventExpanded}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  📋 Detailed Team Responsibilities:
                </Typography>
                
                <Stack spacing={1}>
                  {getTeamDuties(nextEvent).map((duty, index) => {
                    const IconComponent = duty.icon;
                    return (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: `${duty.color}10`,
                          border: `1px solid ${duty.color}30`,
                        }}
                      >
                        <IconComponent 
                          sx={{ 
                            color: duty.color, 
                            fontSize: 20, 
                            mt: 0.2,
                            flexShrink: 0 
                          }} 
                        />
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ color: duty.color, fontWeight: 600 }}
                          >
                            {duty.team}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {duty.duty}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Collapse>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Schedule with Real-Time Status and Team Duties */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            📋 Timeline Schedule {selectedTeam !== 'all' && `- ${teamFilters.find(f => f.key === selectedTeam)?.label} Team`}
          </Typography>
          
          <Stack spacing={1}>
            {filteredSchedule.map((item) => {
              const isExpanded = expandedCards.has(item.id);
              const teamDuties = getTeamDuties(item);
              const hasTeamDuties = teamDuties.length > 0;

              return (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{ 
                    backgroundColor: item.color,
                    border: item.status === 'ongoing' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getStatusIcon(item.status)}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>
                          {hasTeamDuties && (
                            <Tooltip title={isExpanded ? 'Hide team duties' : 'Show team duties'}>
                              <IconButton
                                onClick={() => toggleExpanded(item.id)}
                                size="small"
                                sx={{ color: '#666' }}
                              >
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Grid>
                      
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.duration} mins
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {item.location || 'Various'}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption">
                            {item.responsible}
                          </Typography>
                        </Stack>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            icon={getStatusIcon(item.status)}
                            label={item.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(item.status),
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                          {/* Show team count indicator if duties exist */}
                          {hasTeamDuties && (
                            <Chip
                              label={`${teamDuties.length} team${teamDuties.length > 1 ? 's' : ''}`}
                              size="small"
                              variant="outlined"
                              sx={{ color: '#666', borderColor: '#666' }}
                            />
                          )}
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Team Duties Expansion */}
                    <Collapse in={isExpanded && hasTeamDuties}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        📋 Team Responsibilities:
                      </Typography>
                      
                      <Stack spacing={1}>
                        {teamDuties.map((duty, index) => {
                          const IconComponent = duty.icon;
                          return (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                p: 1.5,
                                borderRadius: 1,
                                backgroundColor: `${duty.color}10`,
                                border: `1px solid ${duty.color}30`,
                              }}
                            >
                              <IconComponent 
                                sx={{ 
                                  color: duty.color, 
                                  fontSize: 20, 
                                  mt: 0.2,
                                  flexShrink: 0 
                                }} 
                              />
                              <Box>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ color: duty.color, fontWeight: 600 }}
                                >
                                  {duty.team}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {duty.duty}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {filteredSchedule.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No events found for selected team
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try selecting &quot;All&quot; or a different team filter.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LiveSchedule; 