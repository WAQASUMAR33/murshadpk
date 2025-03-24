'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
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

const AdminOrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(''); // New state for dropdown selection
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        const orderData = response.data;
        setOrder(orderData);
        setSelectedStatus(orderData.status); // Initialize dropdown with current status
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to fetch order details');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusChange = async () => {
    if (!selectedStatus) return; // Prevent action if no status is selected
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/orders/${id}`, {
        id,
        status: selectedStatus,
      });
      if (response.status === 200) {
        setOrder((prevOrder) => ({ ...prevOrder, status: selectedStatus }));
      } else {
        setError('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/shipping', {
        email: order.email,
        orderId: order.id,
        shippingMethod: order.shippingMethod,
        shippingTerms: order.shippingTerms,
        shipmentDate: order.shipmentDate,
        deliveryDate: order.deliveryDate,
      });
      if (response.status === 200) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          shippingMethod: order.shippingMethod,
          shippingTerms: order.shippingTerms,
          shipmentDate: order.shipmentDate,
          deliveryDate: order.deliveryDate,
        }));
      } else {
        setError('Failed to update shipping information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating shipping information:', error);
      setError('Failed to update shipping information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
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
          <AnimatedLabel sx={{ mt: 2 }}>Loading</AnimatedLabel>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Calculate order amounts directly from order data
  const subtotal = order.orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const subtotalLessDiscount = subtotal - (order.discount ?? 0);
  const totalTax = order.tax ?? 0;
  const total =
    subtotalLessDiscount +
    totalTax +
    (order.deliveryCharge ?? 0) +
    (order.extraDeliveryCharge ?? 0) +
    (order.otherCharges ?? 0);

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2,  }}>
        Order Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: 3 }}>
          <Grid container spacing={3}>
            {/* General Section */}
            <Grid item xs={12} lg={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.700' }}>
                General
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, color: 'grey.600' }}>
                <Typography>
                  Date created: {new Date(order.createdAt).toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Status:</Typography>
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)} // Update local state only
                      label="Status"
                      disabled={loading}
                    >
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="PAID">Paid</MenuItem>
                      <MenuItem value="SHIPPED">Shipped</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleStatusChange} // Trigger API call on button click
                    disabled={loading || !selectedStatus || selectedStatus === order.status} // Disable if loading, no status selected, or no change
                  >
                    Update Status
                  </Button>
                </Box>
                <Typography>Customer: {order.userId}</Typography>
              </Box>
            </Grid>

            {/* Shipping Address Section */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.700' }}>
                  Shipping Address
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, color: 'grey.600' }}>
                  <Typography>
                    Address: {order.streetAddress}, {order.apartmentSuite}, {order.city}, {order.state}, {order.zip}, {order.country}
                  </Typography>
                  <Typography>Email address: {order.email}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Shipping Information Form */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.700', textAlign: 'center', py: 1 }}>
              Shipping Information
            </Typography>
            <form onSubmit={handleShippingSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipping Method"
                    value={order.shippingMethod || ''}
                    onChange={(e) => setOrder((prevOrder) => ({ ...prevOrder, shippingMethod: e.target.value }))}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipping Details"
                    value={order.shippingTerms || ''}
                    onChange={(e) => setOrder((prevOrder) => ({ ...prevOrder, shippingTerms: e.target.value }))}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipment Date"
                    type="date"
                    value={new Date(order.shipmentDate).toISOString().substr(0, 10)}
                    onChange={(e) =>
                      setOrder((prevOrder) => ({
                        ...prevOrder,
                        shipmentDate: e.target.value,
                      }))
                    }
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Delivery Date"
                    type="date"
                    value={new Date(order.deliveryDate).toISOString().substr(0, 10)}
                    onChange={(e) =>
                      setOrder((prevOrder) => ({
                        ...prevOrder,
                        deliveryDate: e.target.value,
                      }))
                    }
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button type="submit" variant="contained" color="primary">
                  Update Shipping Information
                </Button>
              </Box>
            </form>
          </Box>

          {/* Order Items Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.700', textAlign: 'center', py: 1 }}>
              Items
            </Typography>
            <TableContainer sx={{ maxHeight: '24rem', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>HS Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Picture</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>QTY</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Color</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontWeight: 'medium', color: 'grey.900' }}>{index + 1}</TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>
                        {item.product ? item.product.name : 'Unknown Product'}
                      </TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>
                        {item.product && item.product.images && item.product.images.length > 0 ? (
                          <Image
                            width={64}
                            height={64}
                            placeholder="data:image/jpeg;base64,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"
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.product.images[0].url}`}
                            alt={item.product.name}
                            style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <Image
                            width={64}
                            height={64}
                            placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAUFBQUGBQYHBwYJCQgJCQ0MCwsMDRMODw4PDhMdEhUSEhUSHRofGRcZHxouJCAgJC41LSotNUA5OUBRTVFqao4BBQUFBQYFBgcHBgkJCAkJDQwLCwwNEw4PDg8OEx0SFRISFRIdGh8ZFxkfGi4kICAkLjUtKi01QDk5QFFNUWpqjv/CABEIAfQB9AMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAAABQQCAwEI/9oACAEBAAAAAP1WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGyoAAAAAA4hAAABrqgAAAAAOYIAAAa6oAAAAADmCAAAGuqAAAAAA5ggAABrqnyaHLoAAAc+285ggAABrqnMEAAAAGqscwQAAA11TmCH3R65fMAAA1VjmCAAAGuqcwR1b7JmIAABqrHMEAAANdU5girrHyN4gAAaqxzBAAADXVOYJ9u9BOwAAAaqxzBAAADXVOYJ9udhOwAatMwAaqxzBAAADXVOYIo7xzE4B3b6lZADVWOYIAAAa6pzBCju++UnyB9raSFwA1VjmCAAAGuqcwQdPnwDfRGWSA1VjmCAAAGuqcwQA3+Gd62voS8YGqscwQAAA11TmCAN1JH8bPqD5D4BqrHMEAAANdU5ggG6j9PD3AZ44NVY5ggAABrqnMEBsqAAEvGGqscwQAAA11TmCBrqgAD5D4GqscwQAAA11TmCDVWAAB4RhqrHMEAAANdU5ghprfQAAJmI1VjmCAAAGuqcwRprfQAAHMXzaqxzBAAADXVOYI2agAABg8GqscwQAAA11TmCAAAADVWOYIAAAa6pzBAAAABqrHMEAAANdU+QAAAAAaa5zBAAADXVHkAAAAD76HMEAAANdUAAAAABzBAAADXVAAAAAAcwQAAA11QAAAAAHMEAAAPbWAAAAAA4wgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/xAA2EAABAQQIBAUDAwUBAAAAAAABAwACBBEUFSAzUlNyoSRAkcESITAxcRATUSJBUAUyYZCx4f/aAAgBAQABPwD/AH9wV6dLSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTSaTKh37Kuk8xBXx09/4dUcOrp5iCvjp7/w6o4dXTzEFfHT3/h1Rw6unmIK+OnvYVLzqTzzvuA1YROIdGrCJxDo1YROIdGrCJxDo1YROIdGpkRiamRGJqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqwicQ6NWETiHRqZEYmQiV1FACQQffysKjh1dPMQV8dPewtdKfHPwd8LCo4dXTzEFfHT3sLXSnxaAJZOFVfE5SDVesROYLKJPuGTzpHLQd8LCo4dXTzEFfHT3sLXSnxZddefIAEyWQh3ER+Xj9SARItEw3g/U5Mj/nKwd8LCo4dXTzEFfHT3sLXSnxZg0R4A/+70+lkgEMun9pUu8pB3wsKjh1dPMQV8dPewtdKfFgCZZN0OpugfgWv6h5quvfl3lIO+FhUcOrp5iCvjp72FrpT4sDyLIvgoJn/H/PK1/UH/GuP8O9/QhkQo8SfYNEw4LgecdkR7+nB3wsKjh1dPMQV8dPewtdKfFmCXDr3geE3e9lR8OOEks+88+8Sfc200y+9IMm46m6APpFIBN8F0fpe29KDvhYVHDq6eYgr46e9ha6U+LSEYAJKdQzj7r4mD9FYlJzyJmfwGWWeUemT/5bHm0Kg6m54iP1PDb6qJhRMuln3C48XT7j0YO+FhUcOrp5iCvjp72FrpT4tgvD2JDeN/EerEk+hBIOvHxvHyBsxSIfd8To/UNx6MHfCwqOHV08xBXx097C10p8eohCfccLzxIaIh3kSP3B+qKJUekPYM66HXQ6BIC1FoFJ+f7GZ+PQg74WFRw6unmIK+OnvYWulPj04aG8X63x5e4H5+j7rrwLpEw0Qg8k9+XWDpeIAEyWh0Qm7L9z7m2o468mQf3Z9wuPEH3FuDvhYVHDq6eYgr46e9ha6U+PShYbxyff/t/6wEvqQ686QRMH8snB/aVJJn+B+PRikPGkVAPMbi3B3wsKjh1dPMQV8dPewtdKfHow0MXz4nvJ0b8hFoeB7xO/2k9Dag74WFRw6unmIK+OnvYWulPj0IaGKpmf7GAAEhyDzgfdIIZ9wuPEH3FmDvhYVHDq6eYgr46e9ha6U+LcPDlR6Z8nRuwAAAA5KNRcecJdPmBZg74WFRw6unmIK+OnvYWulPi1Dw5Ve/DoYOh10ACQHKRaHgPjHs9Yg74WFRw6unmIK+OnvYWulPizDwryxJnID3LOugAACQHKvuuvul0ic2VSKbxB+sHfCwqOHV08xBXx097C10p8WYeJCTsiJtWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb+ENWb2FllfuPTlL6wd8LCo4dXTzEFfHT3sLXSnxz8HfCwqOHV08xBXx097C10p8c/B3wsKjh1dPMQV8dPexEPSSf+OfhCAsLCo4dXTzEFfHT3sPOgggiYLUdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7UdDKG7OIJOGYcAsKjh1dPMQV8dPf+HVHDq6eYgr46e/8OqOHV08xBXx09/4dUcOrp5hFX7TxMpzEmp5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92p5y92fjS84874JTBE5/n/f7//EABQRAQAAAAAAAAAAAAAAAAAAAKD/2gAIAQIBAT8AAB//xAAUEQEAAAAAAAAAAAAAAAAAAACg/9oACAEDAQE/AAAf/9k="
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/placeholder.jpg`}
                            alt="Placeholder"
                            style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>{item.quantity}</TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>Rs.{item.price}</TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>Rs.{(item.quantity * item.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: '1rem',
                              height: '1rem',
                              borderRadius: '50%',
                              bgcolor: item.selectedColor || '#ccc',
                            }}
                          />
                          {item.selectedColor ? item.selectedColor : 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'grey.500' }}>
                        {item.selectedSize ? item.selectedSize : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Order Summary */}
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Subtotal:</Typography>
                <Typography sx={{ color: 'grey.700' }}>
                  Rs.{subtotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Discount:</Typography>
                <Typography sx={{ color: 'grey.700' }}>
                  Rs.{(order.discount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Subtotal after Discount:</Typography>
                <Typography sx={{ color: 'grey.700' }}>
                  Rs.{subtotalLessDiscount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Tax:</Typography>
                <Typography sx={{ color: 'grey.700' }}>Rs.{totalTax.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Delivery Charges:</Typography>
                <Typography sx={{ color: 'grey.700' }}>Rs.{(order.deliveryCharge ?? 0).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Cash on Delivery Charges:</Typography>
                <Typography sx={{ color: 'grey.700' }}>Rs.{(order.extraDeliveryCharge ?? 0).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Other:</Typography>
                <Typography sx={{ color: 'grey.700' }}>Rs.{(order.otherCharges ?? 0).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: 'grey.700', fontSize: '1.25rem' }}>Total:</Typography>
                <Typography sx={{ color: 'grey.700', fontSize: '1.25rem' }}>
                  Rs.{total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Shipping Information Display */}
          {order.shippingMethod && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.700', textAlign: 'center', py: 1 }}>
                Shipping Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Shipping Method:</Typography>
                  <Typography sx={{ color: 'grey.700' }}>{order.shippingMethod}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Shipping Terms:</Typography>
                  <Typography sx={{ color: 'grey.700' }}>{order.shippingTerms}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Shipment Date:</Typography>
                  <Typography sx={{ color: 'grey.700' }}>{new Date(order.shipmentDate).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'medium', color: 'grey.700' }}>Delivery Date:</Typography>
                  <Typography sx={{ color: 'grey.700' }}>{new Date(order.deliveryDate).toLocaleDateString()}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminOrdersPage;