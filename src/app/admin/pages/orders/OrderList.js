'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/system';

// Custom styled loading bar for API fetching
const ModernProgress = styled(Box)(({ theme }) => ({
  width: '300px',
  height: '8px',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #3B82F6, #A855F7, #EC4899, #FBBF24, #3B82F6)', // Blue, purple, pink, yellow, looping gradient
    backgroundSize: '200% 100%',
    animation: 'flow 1.5s infinite ease-in-out',
  },
  '@keyframes flow': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
}));

// Custom styled Typography for loading label with animated dots
const AnimatedLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#FFFFFF',
  background: 'linear-gradient(45deg, #3B82F6, #EC4899)', // Blue to pink gradient
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  '&:after': {
    content: '"..."',
    display: 'inline-block',
    animation: 'dots 1.5s infinite steps(4, end)',
  },
  '@keyframes dots': {
    '0%': { content: '"."', opacity: 1 },
    '25%': { content: '".."', opacity: 1 },
    '50%': { content: '"..."', opacity: 1 },
    '75%': { content: '"..."', opacity: 0.5 },
    '100%': { content: '"..."', opacity: 1 },
  },
}));

const OrderList = ({ orders, fetchOrders }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (orderId, newStatus) => {
    setIsLoading(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', p: 3 }}>
      {/* New Designed Loading Bar for API Fetching */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ModernProgress />
            <AnimatedLabel sx={{ mt: 2 }}>
              Loading
            </AnimatedLabel>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1F2937', mb: 3 }}>
          Orders List
        </Typography>
        <TableContainer sx={{ maxHeight: '60vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow
                  key={order.id}
                  sx={{ bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB' }}
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="PENDING">Pending payment</MenuItem>
                        <MenuItem value="PAID">Paid</MenuItem>
                        <MenuItem value="SHIPPED">Shipped</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      color="error"
                      onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                    >
                      Cancel Order
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrderList;