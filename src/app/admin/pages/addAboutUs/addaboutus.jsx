'use client';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';

// Dynamically import JoditEditor for SSR compatibility
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: true });

// Custom styled JoditEditor container with hardcoded colors (fallback)
const JoditEditorWrapper = styled(Box)(({ theme }) => ({
  '& .jodit-container': {
    border: `1px solid ${theme?.palette?.grey?.[300] || '#e0e0e0'} !important`, // Fallback to #e0e0e0
    borderRadius: '8px',
    '& .jodit-toolbar__box': {
      borderBottom: `1px solid ${theme?.palette?.grey?.[300] || '#e0e0e0'}`, // Fallback to #e0e0e0
      backgroundColor: theme?.palette?.grey?.[50] || '#fafafa', // Fallback to #fafafa
    },
    '& .jodit-status-bar': {
      borderTop: `1px solid ${theme?.palette?.grey?.[300] || '#e0e0e0'}`, // Fallback to #e0e0e0
      backgroundColor: theme?.palette?.grey?.[50] || '#fafafa', // Fallback to #fafafa
    },
    '& .jodit-workplace': {
      backgroundColor: theme?.palette?.background?.paper || '#ffffff', // Fallback to #ffffff
    },
  },
}));

const AboutUs = () => {
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    Title: '',
    description: '',
    Text: '',
  });
  const [aboutUs, setAboutUs] = useState(null);
  const [editorContent, setEditorContent] = useState(''); // Track content separately for JoditEditor
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added for loading state

  // Load JoditEditor once the component is mounted and data is fetched
  useEffect(() => {
    async function fetchAboutUs() {
      try {
        const response = await axios.get('/api/aboutus');
        if (Array.isArray(response.data) && response.data.length > 0) {
          const existingContent = response.data[0];
          setAboutUs(existingContent);
          setFormData({
            Title: existingContent.Title || '',
            description: existingContent.description || '',
            Text: existingContent.Text || '',
          });
          setEditorContent(existingContent.Text || ''); // Set initial content for JoditEditor
        }
      } catch (error) {
        console.error('Error fetching About Us content:', error);
      } finally {
        setIsEditorReady(true); // Editor is ready to load
      }
    }
    fetchAboutUs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTextChange = (content) => {
    setEditorContent(content);
    setFormData({ ...formData, Text: content });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (aboutUs && aboutUs.id) {
        // Update existing About Us content
        await axios.put(`/api/aboutus/${aboutUs.id}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Create new About Us content
        const response = await axios.post('/api/aboutus', formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        setAboutUs(response.data);
      }
      alert('About Us content saved successfully!');
    } catch (error) {
      console.error('Error saving About Us content:', error);
      alert('Failed to save About Us content.');
    } finally {
      setIsLoading(false);
    }
  };

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
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 4, fontWeight: 'bold', color: 'grey.800', textAlign: 'center' }}
        >
          About Us
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Title"
              name="Title"
              value={formData.Title}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              InputProps={{
                sx: { borderRadius: '8px' },
              }}
            />
          </Box>

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              InputProps={{
                sx: { borderRadius: '8px' },
              }}
            />
          </Box>

          {/* Text (JoditEditor) */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium', color: 'grey.600' }}>
              Text
            </Typography>
            {isEditorReady && (
              <JoditEditorWrapper>
                <JoditEditor
                  ref={editorRef}
                  value={editorContent}
                  onChange={handleTextChange}
                  config={{
                    readonly: false,
                    placeholder: 'Start writing your About Us content...',
                    height: 400,
                  }}
                />
              </JoditEditorWrapper>
            )}
          </Box>

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
            {aboutUs ? 'Update About Us' : 'Save About Us'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AboutUs;