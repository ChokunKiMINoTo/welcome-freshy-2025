'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
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
  CircularProgress,
  Skeleton,
  Fade,
  Grow,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as OngoingIcon,
  RadioButtonUnchecked as UpcomingIcon,
  ExpandMore,
  ExpandLess,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
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
const StatusDot = ({ status }: { status: string }) => {
  const theme = useTheme();
  
  const getDotColor = (status: string) => {
    const isDark = theme.palette.mode === 'dark';
    switch (status) {
      case 'completed': return isDark ? '#66bb6a' : '#4caf50';
      case 'ongoing': return isDark ? '#ffb74d' : '#ff9800';
      case 'upcoming': return isDark ? '#64b5f6' : '#2196f3';
      default: return isDark ? '#bdbdbd' : '#9e9e9e';
    }
  };

  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: getDotColor(status),
        animation: status === 'ongoing' ? `${pulse} 2s ease-in-out infinite` : 'none',
        boxShadow: status === 'ongoing' ? `0 0 10px ${alpha(getDotColor(status), 0.6)}` : 'none',
      }}
    />
  );
};

// Digital clock time display component
const DigitalTimeDisplay = ({ time, isMonospace = true }: { time: string; isMonospace?: boolean }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        fontFamily: isMonospace ? 'Monaco, Consolas, "Courier New", monospace' : 'inherit',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        padding: '2px 6px',
        borderRadius: '4px',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backdropFilter: 'blur(4px)',
      }}
    >
      {time}
    </Box>
  );
};

// Circular progress countdown component
const CountdownTimer = ({ duration, elapsed }: { duration: number; elapsed: number }) => {
  const theme = useTheme();
  const progress = Math.min((elapsed / duration) * 100, 100);
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={40}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {Math.round(progress)}%
        </Typography>
      </Box>
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
  const [nextEventExpanded, setNextEventExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fixed test time initialization
//   const [currentTime, setCurrentTime] = useState(() => {
//     const testTime = new Date();
//     testTime.setHours(8, 0, 0, 0); // Set to 8:00 AM
//     return testTime;
//   });

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

  // Theme-aware color functions
  const getStatusColor = useCallback((status: string) => {
    const isDark = theme.palette.mode === 'dark';
    switch (status) {
      case 'completed': 
        return isDark ? '#66bb6a' : '#4caf50'; // Lighter green for dark mode
      case 'ongoing': 
        return isDark ? '#ffb74d' : '#ff9800'; // Lighter orange for dark mode
      case 'upcoming': 
        return isDark ? '#64b5f6' : '#2196f3'; // Lighter blue for dark mode
      default: 
        return isDark ? '#bdbdbd' : '#9e9e9e'; // Lighter gray for dark mode
    }
  }, [theme.palette.mode]);

  const getStatusBackgroundColor = useCallback((status: string) => {
    const isDark = theme.palette.mode === 'dark';
    switch (status) {
      case 'completed': 
        return isDark ? 'rgba(102, 187, 106, 0.1)' : 'rgba(76, 175, 80, 0.1)';
      case 'ongoing': 
        return isDark ? 'rgba(255, 183, 77, 0.15)' : 'rgba(255, 152, 0, 0.1)';
      case 'upcoming': 
        return isDark ? 'rgba(100, 181, 246, 0.1)' : 'rgba(33, 150, 243, 0.1)';
      default: 
        return isDark ? 'rgba(189, 189, 189, 0.1)' : 'rgba(158, 158, 158, 0.1)';
    }
  }, [theme.palette.mode]);

  const getCurrentTimeBackgroundColor = useCallback(() => {
    const isDark = theme.palette.mode === 'dark';
    return isDark ? 'rgba(69, 104, 220, 0.15)' : '#f3e5f5';
  }, [theme.palette.mode]);

  // Theme-aware card background color function
  const getCardBackgroundColor = useCallback((originalColor: string, status: string) => {
    const isDark = theme.palette.mode === 'dark';
    
    if (isDark) {
      // In dark mode, use subtle status-based backgrounds instead of original colors
      switch (status) {
        case 'completed': 
          return 'rgba(102, 187, 106, 0.08)';
        case 'ongoing': 
          return 'rgba(255, 183, 77, 0.12)';
        case 'upcoming': 
          return 'rgba(100, 181, 246, 0.08)';
        default: 
          return theme.palette.background.paper;
      }
    } else {
      // In light mode, use original colors but with reduced opacity
      return originalColor + '40'; // Add transparency
    }
  }, [theme.palette.mode, theme.palette.background.paper]);

  // Theme-aware border color function
  const getBorderColor = useCallback((status: string) => {
    const isDark = theme.palette.mode === 'dark';
    
    if (status === 'ongoing') {
      return isDark ? '#ffb74d' : '#ff9800';
    } else {
      return isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0';
    }
  }, [theme.palette.mode]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'ongoing': return <PlayArrowIcon />;
      case 'upcoming': return <PauseIcon />;
      default: return <ScheduleIcon />;
    }
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

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [refreshTrigger]);

  // Enhanced glassmorphism card styling
  const getGlassmorphismStyle = useCallback((status: string) => {
    const isDark = theme.palette.mode === 'dark';
    const baseBackground = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
    
    return {
      borderRadius: '12px',
      background: baseBackground,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      boxShadow: status === 'ongoing' 
        ? `0 8px 32px ${alpha(theme.palette.warning.main, 0.15)}, 0 2px 8px ${alpha(theme.palette.warning.main, 0.1)}`
        : `0 4px 20px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)}, 0 1px 4px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: status === 'ongoing'
          ? `0 12px 40px ${alpha(theme.palette.warning.main, 0.2)}, 0 4px 12px ${alpha(theme.palette.warning.main, 0.15)}`
          : `0 8px 32px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)}`,
      },
    };
  }, [theme]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          📅 Live Schedule
        </Typography>
        
        <Stack spacing={3}>
          <Card sx={{ ...getGlassmorphismStyle('ongoing') }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔴 NOW HAPPENING
              </Typography>
              <EventCardSkeleton />
            </CardContent>
          </Card>
          
          <Card sx={{ ...getGlassmorphismStyle('upcoming') }}>
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
          
          <Card sx={{ ...getGlassmorphismStyle('default') }}>
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        📅 Live Schedule
      </Typography>
      
      {/* Current Time Display */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Current Time
        </Typography>
        <DigitalTimeDisplay time={formatTime(currentTime)} />
      </Box>

      <Stack spacing={3}>
        {/* NOW HAPPENING Section */}
        <Fade in timeout={500}>
          <Card sx={{ ...getGlassmorphismStyle('ongoing') }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <StatusDot status="ongoing" />
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
                        ...getGlassmorphismStyle('ongoing'),
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
                              <CountdownTimer 
                                duration={currentEvent.duration} 
                                elapsed={Math.floor((currentTime.getTime() - parseTime(currentEvent.startTime).getTime()) / 60000)} 
                              />
                              <DurationBar 
                                duration={currentEvent.duration} 
                                elapsed={Math.floor((currentTime.getTime() - parseTime(currentEvent.startTime).getTime()) / 60000)} 
                                status="ongoing"
                              />
                            </Stack>
                          </Box>
                        </Box>
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
          <Card sx={{ ...getGlassmorphismStyle('upcoming') }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <StatusDot status="upcoming" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🔵 UP NEXT
                </Typography>
              </Stack>
              
              {nextEvent ? (
                <Stack spacing={2}>
                  <Grow key={nextEvent.id} in timeout={900}>
                    <Card
                      variant="outlined"
                      sx={{ ...getGlassmorphismStyle('upcoming') }}
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
          <Card sx={{ ...getGlassmorphismStyle('default') }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                📋 Timeline Schedule {selectedTeam !== 'all' && `- ${teamFilters.find(f => f.key === selectedTeam)?.label} Team`}
              </Typography>
              
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
                          ...getGlassmorphismStyle(item.status),
                          cursor: hasTeamDuties ? 'pointer' : 'default',
                        }}
                        onClick={() => hasTeamDuties && toggleExpanded(item.id)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <StatusDot status={item.status} />
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
                                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
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