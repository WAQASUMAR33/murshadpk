'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';

const AddSetting = ({ setting = {}, fetchSettings }) => {
  const [formData, setFormData] = useState({
    deliveryCharge: setting.deliveryCharge || '',
    taxPercentage: setting.taxPercentage || '',
    other1: setting.other1 || 0,
    other2: setting.other2 || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (setting) {
      setFormData({
        deliveryCharge: setting.deliveryCharge || '',
        taxPercentage: setting.taxPercentage || '',
        other1: setting.other1 || 0,
        other2: setting.other2 || 0,
      });
    }
  }, [setting]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSettings();
        router.push('/admin/pages/settings');
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', p: 3 }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ ml: 2, color: '#fff' }}>
          Loading...
        </Typography>
      </Backdrop>

      {/* Main Content */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: '600px',
          mx: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold', color: 'grey.800' }}>
          {setting.id ? 'Edit Setting' : 'Add Setting'}
        </Typography>

        <form onSubmit={handleFormSubmit}>
          {/* Delivery Charge */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Delivery Charge"
              name="deliveryCharge"
              type="number"
              value={formData.deliveryCharge}
              onChange={handleFormChange}
              variant="outlined"
              size="small"
              required
              InputProps={{
                sx: { borderRadius: '8px' },
              }}
            />
          </Box>

          {/* Tax Percentage */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tax Percentage"
              name="taxPercentage"
              type="number"
              value={formData.taxPercentage}
              onChange={handleFormChange}
              variant="outlined"
              size="small"
              required
              InputProps={{
                sx: { borderRadius: '8px' },
              }}
            />
          </Box>

          {/* Other1 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Other1"
              name="other1"
              type="number"
              value={formData.other1}
              onChange={handleFormChange}
              variant="outlined"
              size="small"
              InputProps={{
                sx: { borderRadius: '8px' },
              }}
            />
          </Box>

          {/* Other2 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Other2"
              name="other2"
              type="number"
              value={formData.other2}
              onChange={handleFormChange}
              variant="outlined"
              size="small"
              InputProps={{
                sx: { borderRadius: '8px' },
              }}
            />
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={() => router.push('/admin/pages/settings')}
              variant="contained"
              sx={{
                bgcolor: 'grey.300',
                color: 'grey.800',
                '&:hover': { bgcolor: 'grey.400' },
                borderRadius: '8px',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                bgcolor: 'blue.500',
                '&:hover': { bgcolor: 'blue.700' },
                borderRadius: '8px',
              }}
            >
              {setting.id ? 'Update' : 'Add'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddSetting;