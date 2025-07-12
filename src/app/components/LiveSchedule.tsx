'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Tooltip,
  LinearProgress,
  Skeleton,
  Fade,
  Grow,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  ExpandMore,
  ExpandLess,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayArrowIcon,
  Engineering,
  People,
  Restaurant,
  TheaterComedy,
  SupportAgent,
  SportsEsports,
  Group,
} from '@mui/icons-material';
import { loadScheduleData, ScheduleItem } from '../utils/csvLoader';
import { useRefresh } from '../contexts/RefreshContext';

// Extended interface with calculated status
interface ScheduleItemWithStatus extends ScheduleItem {
  status: 'completed' | 'ongoing' | 'upcoming';
}

// Team filter type
type TeamFilter = 'all' | 'operation' | 'registration' | 'foodDrink' | 'entertain' | 'staff' | 'game';

// Keyframes for animations
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(255, 183, 77, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 183, 77, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 183, 77, 0.3);
  }
`;

// Loading skeleton component
const EventCardSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.1)} 25%, ${alpha(theme.palette.background.paper, 0.2)} 50%, ${alpha(theme.palette.background.paper, 0.1)} 75%)`,
        backgroundSize: '400% 100%',
        animation: `${shimmer} 1.5s ease-in-out infinite`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={24} height={24} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="90%" height={16} />
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={16} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Animated status dot component
const StatusDot = ({ status, color }: { status: string; color?: string }) => {
  const theme = useTheme();
  
  const getDotColor = (status: string, customColor?: string) => {
    // If a custom color is provided, use it; otherwise fall back to status-based colors
    if (customColor) {
      return customColor;
    }
    
    // Fallback to status-based colors if no custom color is provided
    const isDark = theme.palette.mode === 'dark';
    switch (status) {
      case 'completed': return isDark ? '#66bb6a' : '#4caf50';
      case 'ongoing': return isDark ? '#ffb74d' : '#ff9800';
      case 'upcoming': return isDark ? '#64b5f6' : '#2196f3';
      default: return isDark ? '#bdbdbd' : '#9e9e9e';
    }
  };

  const dotColor = getDotColor(status, color);

  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: dotColor,
        animation: status === 'ongoing' ? `${pulse} 2s ease-in-out infinite` : 'none',
        boxShadow: status === 'ongoing' ? `0 0 10px ${alpha(dotColor, 0.6)}` : 'none',
      }}
    />
  );
};

// Digital clock time display component
const DigitalTimeDisplay = ({ time, isMonospace = true, size = 'medium' }: { time: string; isMonospace?: boolean; size?: 'small' | 'medium' | 'large' }) => {
  const theme = useTheme();
  
  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return { fontSize: '0.875rem', padding: '2px 6px' };
      case 'large':
        return { fontSize: '1.5rem', padding: '8px 16px' };
      default:
        return { fontSize: '1rem', padding: '4px 8px' };
    }
  };

  const sizeStyles = getSizeStyles(size);
  
  return (
    <Box
      sx={{
        fontFamily: isMonospace ? 'Monaco, Consolas, "Courier New", monospace' : 'inherit',
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        color: theme.palette.text.primary,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        padding: sizeStyles.padding,
        borderRadius: '8px',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backdropFilter: 'blur(4px)',
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
    >
      {time}
    </Box>
  );
};

// Duration progress bar component
const DurationBar = ({ duration, elapsed, status }: { duration: number; elapsed: number; status: string }) => {
  const theme = useTheme();
  const progress = Math.min((elapsed / duration) * 100, 100);
  
  const getBarColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'ongoing': return theme.palette.warning.main;
      case 'upcoming': return theme.palette.info.main;
      default: return theme.palette.grey[400];
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: alpha(getBarColor(status), 0.2),
          '& .MuiLinearProgress-bar': {
            backgroundColor: getBarColor(status),
            borderRadius: 2,
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
        {elapsed}min / {duration}min
      </Typography>
    </Box>
  );
};

export default function LiveSchedule() {
  const theme = useTheme();
  const { refreshTrigger } = useRefresh();
  
  const [scheduleItems, setScheduleItems] = useState<ScheduleItemWithStatus[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState<TeamFilter>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Fixed test time initialization
  // const [currentTime, setCurrentTime] = useState(() => {
  //   const testTime = new Date();
  //   testTime.setHours(8, 40, 0, 0); // Set to 8:00 AM
  //   return testTime;
  // });

  // Format time function that handles both strings and Date objects
  const formatTime = (time: string | Date): string => {
    if (time instanceof Date) {
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    return time;
  };

  // Parse time string to Date object for calculations
  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(currentTime);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Get time in minutes from time string
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate status based on current time
  const calculateStatus = useCallback((startTime: string, endTime: string, currentTime: Date): 'completed' | 'ongoing' | 'upcoming' => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    if (currentMinutes >= endMinutes) {
      return 'completed';
    } else if (currentMinutes >= startMinutes) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }, []);

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

  // Filter schedule based on selected team and search term
  const getFilteredSchedule = () => {
    let filtered = selectedTeam === 'all' ? scheduleItems : scheduleItems.filter(item => {
      const duties = getTeamDuties(item);
      return duties.some(duty => 
        duty.team.toLowerCase().replace(/\s+/g, '').replace('&', '') === selectedTeam.replace(/([A-Z])/g, ' $1').trim().toLowerCase().replace(/\s+/g, '').replace('&', '')
      );
    });

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
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
      try {
        const data = await loadScheduleData();
        const dataWithStatus = data.map(item => ({
          ...item,
          status: calculateStatus(item.startTime, item.endTime, currentTime)
        }));
        setScheduleItems(dataWithStatus);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      }
    };

    loadData();
  }, [refreshTrigger, currentTime, calculateStatus]);

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
  }, [calculateStatus]);

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

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [refreshTrigger]);

  // Enhanced glassmorphism card styling
  const getGlassmorphismStyle = useCallback(() => {
    const isDark = theme.palette.mode === 'dark';
    const baseBackground = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
    
    return {
      borderRadius: '12px',
      background: baseBackground,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      // Remove status-specific shadows - use same shadow for all cards
      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)}, 0 1px 4px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        // Remove status-specific hover shadows - use same shadow for all cards
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)}`,
      },
    };
  }, [theme]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Card sx={{ ...getGlassmorphismStyle() }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔴 NOW HAPPENING
              </Typography>
              <EventCardSkeleton />
            </CardContent>
          </Card>
          
          <Card sx={{ ...getGlassmorphismStyle() }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔵 UP NEXT
              </Typography>
              <Stack spacing={1}>
                <EventCardSkeleton />
                <EventCardSkeleton />
              </Stack>
            </CardContent>
          </Card>
          
          <Card sx={{ ...getGlassmorphismStyle() }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Timeline Schedule
              </Typography>
              <Stack spacing={1}>
                {[...Array(5)].map((_, index) => (
                  <EventCardSkeleton key={index} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Current Time Display */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
          🕐 Current Time
        </Typography>
        <DigitalTimeDisplay time={formatTime(currentTime)} size="large" />
      </Box>

      <Stack spacing={3}>
        {/* NOW HAPPENING Section */}
        <Fade in timeout={500}>
          <Card sx={{ ...getGlassmorphismStyle() }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <StatusDot status="ongoing" color={currentEvent?.color} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🔴 NOW HAPPENING
                </Typography>
              </Stack>
              
              {currentEvent ? (
                <Stack spacing={2}>
                  <Grow key={currentEvent.id} in timeout={700}>
                    <Card
                      variant="outlined"
                      sx={{
                        ...getGlassmorphismStyle(),
                        animation: `${glow} 3s ease-in-out infinite`,
                      }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                          <Box sx={{ flex: { xs: 1, sm: 2 } }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <PlayArrowIcon sx={{ color: theme.palette.warning.main }} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {currentEvent.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {currentEvent.description}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                  <LocationOnIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{currentEvent.location}</Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          </Box>
                          <Box sx={{ flex: { xs: 1, sm: 1 }, display: 'flex', justifyContent: 'center' }}>
                            <Stack spacing={1} alignItems="center">
                              <DigitalTimeDisplay time={`${formatTime(currentEvent.startTime)} - ${formatTime(currentEvent.endTime)}`} />
                              <DurationBar 
                                duration={currentEvent.duration} 
                                elapsed={Math.floor((currentTime.getTime() - parseTime(currentEvent.startTime).getTime()) / 60000)} 
                                status="ongoing"
                              />
                            </Stack>
                          </Box>
                        </Box>
                        
                        {/* Team Duties for NOW HAPPENING */}
                        {(() => {
                          const teamDuties = getTeamDuties(currentEvent);
                          return teamDuties.length > 0 && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Team Duties:
                              </Typography>
                              <Grid container spacing={1}>
                                {teamDuties.map((duty) => (
                                  <Grid key={duty.team} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Card
                                      variant="outlined"
                                      sx={{
                                        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.1 : 0.5),
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '8px',
                                        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                                      }}
                                    >
                                      <CardContent sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                          {duty.team}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                          {duty.duty}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </Grow>
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No events currently happening
                </Typography>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* UP NEXT Section */}
        <Fade in timeout={700}>
          <Card sx={{ ...getGlassmorphismStyle() }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <StatusDot status="upcoming" color={nextEvent?.color} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🔵 UP NEXT
                </Typography>
              </Stack>
              
              {nextEvent ? (
                <Stack spacing={2}>
                  <Grow key={nextEvent.id} in timeout={900}>
                    <Card
                      variant="outlined"
                      sx={{ ...getGlassmorphismStyle() }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                          <Box sx={{ flex: { xs: 1, sm: 2 } }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <AccessTimeIcon sx={{ color: theme.palette.info.main }} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {nextEvent.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {nextEvent.description}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                  <LocationOnIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{nextEvent.location}</Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          </Box>
                          <Box sx={{ flex: { xs: 1, sm: 1 }, display: 'flex', justifyContent: 'center' }}>
                            <Stack spacing={1} alignItems="center">
                              <DigitalTimeDisplay time={`${formatTime(nextEvent.startTime)} - ${formatTime(nextEvent.endTime)}`} />
                              <Typography variant="caption" color="text.secondary">
                                Starts in {Math.floor((parseTime(nextEvent.startTime).getTime() - currentTime.getTime()) / 60000)} minutes
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>

                        {/* Team Duties for UP NEXT */}
                        {(() => {
                          const teamDuties = getTeamDuties(nextEvent);
                          return teamDuties.length > 0 && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Team Duties:
                              </Typography>
                              <Grid container spacing={1}>
                                {teamDuties.map((duty) => (
                                  <Grid key={duty.team} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Card
                                      variant="outlined"
                                      sx={{
                                        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.1 : 0.5),
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '8px',
                                        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                                      }}
                                    >
                                      <CardContent sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                          {duty.team}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                          {duty.duty}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </Grow>
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No upcoming events
                </Typography>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Timeline Schedule Section */}
        <Fade in timeout={900}>
          <Card sx={{ ...getGlassmorphismStyle() }}>
            <CardContent>
              {/* Filter Controls */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(4px)',
                    },
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Filter by Team</InputLabel>
                  <Select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    label="Filter by Team"
                    sx={{
                      borderRadius: '8px',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {teamFilters.map((filter) => (
                      <MenuItem key={filter.key} value={filter.key}>
                        {filter.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              
              <Stack spacing={1}>
                {filteredSchedule.map((item, index) => {
                  const isExpanded = expandedCards.has(item.id);
                  const teamDuties = getTeamDuties(item);
                  const hasTeamDuties = teamDuties.length > 0;

                  return (
                    <Grow key={item.id} in timeout={1000 + index * 50}>
                      <Card
                        variant="outlined"
                        sx={{
                          ...getGlassmorphismStyle(),
                          cursor: hasTeamDuties ? 'pointer' : 'default',
                          borderWidth: item.status === 'ongoing' ? 2 : 1,
                        }}
                        onClick={() => hasTeamDuties && toggleExpanded(item.id)}
                      >
                        <CardContent sx={{ py: 2, px: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <StatusDot status={item.status} color={item.color} />
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
                                      size="small"
                                      sx={{ color: theme.palette.text.secondary }}
                                    >
                                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </Grid>
                            
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <DigitalTimeDisplay time={`${formatTime(item.startTime)} - ${formatTime(item.endTime)}`} />
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
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
                          </Grid>

                          {/* Team Duties Collapse */}
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Team Duties:
                              </Typography>
                              <Grid container spacing={1}>
                                {teamDuties.map((duty) => (
                                  <Grid key={duty.team} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Card
                                      variant="outlined"
                                      sx={{
                                        backgroundColor: theme.palette.background.paper,
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '8px',
                                      }}
                                    >
                                      <CardContent sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                          {duty.team}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                          {duty.duty}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    </Grow>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Stack>
    </Box>
  );
} 