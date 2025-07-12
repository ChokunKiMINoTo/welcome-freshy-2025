'use client';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Map as MapIcon,
  Group as GroupIcon,
  Leaderboard as LeaderboardIcon,
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

// Import components
import LiveSchedule from './components/LiveSchedule';
import VenueMap from './components/VenueMap';
import TeamResponsibilities from './components/TeamResponsibilities';
import Scoreboard from './components/Scoreboard';
import LiveAlerts from './components/LiveAlerts';

// Import context
import { RefreshProvider, useRefresh } from './contexts/RefreshContext';

function DashboardContent() {
  const [currentTab, setCurrentTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { triggerRefresh } = useRefresh();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#000000' : '#ffffff',
        paper: darkMode ? '#121212' : '#ffffff',
      },
    },
  });

  const tabs = [
    { label: 'Schedule', icon: <ScheduleIcon />, component: <LiveSchedule /> },
    { label: 'Map', icon: <MapIcon />, component: <VenueMap /> },
    { label: 'Teams', icon: <GroupIcon />, component: <TeamResponsibilities /> },
    { label: 'Scores', icon: <LeaderboardIcon />, component: <Scoreboard /> },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    console.log('Refreshing all component data...');
    
    // Show refresh animation for 2 seconds
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ pb: 9 }}> {/* Increased bottom padding for fixed navigation */}
        {/* Header */}
        <AppBar 
          position="sticky"
          sx={{
            background: 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',
            boxShadow: '0 4px 20px rgba(69, 104, 220, 0.3)',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              ICT Welcome Freshy 2025 Staff Dashboard
            </Typography>
            <Chip 
              label="LIVE" 
              color="error" 
              size="small" 
              sx={{ mr: 1, fontWeight: 600 }}
            />
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton 
              color="inherit" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Live Alerts - Always visible at top */}
        <LiveAlerts />

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          {tabs[currentTab].component}
        </Container>

        {/* Bottom Navigation - Fixed to bottom */}
        <BottomNavigation
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1000,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {tabs.map((tab, index) => (
            <BottomNavigationAction
              key={index}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </BottomNavigation>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return (
    <RefreshProvider>
      <DashboardContent />
    </RefreshProvider>
  );
}
