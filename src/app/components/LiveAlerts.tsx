'use client';
import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  dismissible: boolean;
}

export default function LiveAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const alerts: AlertItem[] = [
    // {
    //   id: 'alert-1',
    //   type: 'warning',
    //   title: 'Schedule Update',
    //   message: 'Ice Breaking Games delayed by 15 minutes due to setup. New start time: 10:15 AM',
    //   timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    //   priority: 'high',
    //   dismissible: true,
    // },
    // {
    //   id: 'alert-2',
    //   type: 'info',
    //   title: 'Lunch Break',
    //   message: 'Lunch service starts in 30 minutes at Food Station. Please guide participants accordingly.',
    //   timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    //   priority: 'medium',
    //   dismissible: true,
    // },
  ];

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={1}>
        {visibleAlerts.map((alert) => (
          <Collapse key={alert.id} in={true}>
            <Alert
              severity={alert.type}
              icon={getAlertIcon(alert.type)}
              action={
                alert.dismissible && (
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                )
              }
              sx={{ mb: 1 }}
            >
              <AlertTitle>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {alert.title}
                  </Typography>
                  <Chip
                    label={alert.priority}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(alert.priority),
                      color: 'white',
                      height: 20,
                      fontSize: '0.6rem',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(alert.timestamp)}
                  </Typography>
                </Stack>
              </AlertTitle>
              <Typography variant="body2">
                {alert.message}
              </Typography>
            </Alert>
          </Collapse>
        ))}
      </Stack>
    </Box>
  );
} 