'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
} from '@mui/icons-material';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if the user is authenticated by looking for the token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin'); // Redirect to login if not authenticated
    }
  }, [router]);

  // Render nothing until authentication status is known
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static" sx={{ bgcolor: '#374151' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 3 }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" aria-label="menu" sx={{ p: 1 }}>
            {/* Uncomment to include the menu icon */}
            {/* <MenuIcon /> */}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            {/* Uncomment to include the logo */}
            {/* <Image
              src="/ali.png"
              alt="Pluto Logo"
              width={40}
              height={40}
              style={{ borderRadius: '50%' }}
            /> */}
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', ml: 1 }}>
              Store2u
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Notifications - Uncomment to include */}
          {/* <Badge
            badgeContent={2}
            color="error"
            sx={{ '& .MuiBadge-badge': { width: 16, height: 16, minWidth: 16 } }}
          >
            <IconButton color="inherit" aria-label="notifications">
              <NotificationsIcon />
            </IconButton>
          </Badge> */}

          {/* Messages - Uncomment to include */}
          {/* <Badge
            badgeContent={3}
            color="error"
            sx={{ '& .MuiBadge-badge': { width: 16, height: 16, minWidth: 16 } }}
          >
            <IconButton color="inherit" aria-label="messages">
              <MailIcon />
            </IconButton>
          </Badge> */}

          {/* Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Uncomment to include the profile picture */}
            {/* <Image
              src="/ali.png"
              alt="Profile Picture"
              width={40}
              height={40}
              style={{ borderRadius: '50%' }}
            /> */}
            <Typography variant="body1" sx={{ color: 'white', ml: 1 }}>
              Admin
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;