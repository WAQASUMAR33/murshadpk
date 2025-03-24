'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// MUI Imports
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneno: '',
    city: '',
    role: 'ADMIN',
    image: null,
    base64: '',
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('role');
      if (userRole === 'ADMIN') {
        router.push('/admin/pages/Products');
      } else if (userRole === 'CUSTOMER') {
        router.push('/customer/pages/login');
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);

        if (user.role === 'ADMIN') {
          alert('Login Successfully');
          router.push('/admin/pages/Main');
        } else if (user.role === 'CUSTOMER') {
          alert('This ID exists for a customer');
          router.push('/customer/pages/login');
        } else {
          setError('Unknown role. Please contact support.');
        }
      } else {
        setError(response.data.message || 'Failed to log in. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Failed to log in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const uploadedImageUrl = await uploadImage(formData.base64);

      const formDataToSend = {
        ...formData,
        imageUrl: uploadedImageUrl,
        base64: '',
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();
      if (data) {
        router.push('/admin');
      }

      if (data.status !== 100) {
        alert(data.message);
      } else {
        router.push('/admin/pages/register');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const uploadImage = async (base64) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });
      const result = await response.json();
      if (response.ok) {
        return result.image_url;
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
        base64: reader.result.split(',')[1],
      }));
    };

    reader.readAsDataURL(file);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5', // bg-gray-100 equivalent
      }}
    >
      {!isRegistering ? (
        <Card sx={{ width: '100%', maxWidth: 400, p: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              Admin Login
            </Typography>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ py: 1 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setIsRegistering(true)}
                >
                  Register Instead
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ width: '100%', maxWidth: 400, p: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              Register
            </Typography>
            <form onSubmit={handleRegister}>
              <TextField
                label="Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Phone Number"
                type="text"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="City"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Profile Image"
                type="file"
                name="image"
                onChange={handleImageChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1 }}
              >
                Register
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setIsRegistering(false)}
                  sx={{ py: 1 }}
                >
                  Back to Login
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default LoginPage;