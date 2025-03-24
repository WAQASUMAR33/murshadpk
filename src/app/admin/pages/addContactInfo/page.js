'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

const ContactInfoPage = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    address: '',
    website: '',
    owner: '',
  });
  const [contactInfo, setContactInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Added for loading state

  // Fetch the initial contact info if it exists
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await axios.get('/api/contactinfo');
        if (Array.isArray(response.data) && response.data.length > 0) {
          const existingContact = response.data[0];
          setContactInfo(existingContact);
          setFormData({
            phoneNumber: existingContact.phoneNumber || '',
            email: existingContact.email || '',
            address: existingContact.address || '',
            website: existingContact.website || '',
            owner: existingContact.owner || '',
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    }
    fetchContactInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (contactInfo && contactInfo.id) {
        // Update existing contact info
        await axios.put(`/api/contactinfo/${contactInfo.id}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Create new contact info
        const response = await axios.post('/api/contactinfo', formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        setContactInfo(response.data);
      }
      alert('Contact information saved successfully!');
    } catch (error) {
      console.error('Error saving contact info:', error);
      alert('Failed to save contact information.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format field labels (e.g., "phoneNumber" -> "Phone Number")
  const formatLabel = (field) => field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', p: 3 }}>
      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ ml: 2, color: '#fff' }}>
            Saving...
          </Typography>
        </Box>
      )}

      {/* Main Content */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: '500px',
          mx: 'auto',
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 4, fontWeight: 'bold', color: 'grey.800', textAlign: 'center' }}
        >
          Contact Information
        </Typography>

        <form onSubmit={handleSubmit}>
          {['phoneNumber', 'email', 'address', 'website', 'owner'].map((field, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={formatLabel(field)}
                name={field}
                type={field === 'email' ? 'email' : 'text'}
                value={formData[field]}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                InputProps={{
                  sx: { borderRadius: '8px' },
                }}
              />
            </Box>
          ))}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: '8px',
              bgcolor: 'grey.700',
              '&:hover': { bgcolor: 'grey.800' },
            }}
          >
            {contactInfo ? 'Update Contact Info' : 'Save Contact Info'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ContactInfoPage;