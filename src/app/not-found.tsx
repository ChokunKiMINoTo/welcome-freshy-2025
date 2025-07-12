import type { Metadata, Viewport } from 'next';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found - ICT Welcome Freshy 2025',
  description: 'The page you are looking for does not exist.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4568dc",
};

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        
        <Button
          component={Link}
          href="/"
          variant="contained"
          startIcon={<HomeIcon />}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3d5bd4 0%, #a159a8 100%)',
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
} 