'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';

const FilterableCustomerTable = ({ customers, fetchCustomers }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(customers || []);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    phoneno: '',
    city: '',
    image: null,
    imageUrl: '',
    role: 'CUSTOMER',
  });
  const [isAdminForm, setIsAdminForm] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setFilteredData(
      (customers || []).filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, customers]);

  const handleAddNewItem = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.password || !newCustomer.phoneno || !newCustomer.city) {
      alert('All fields are required');
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = '';
      if (images.length > 0) {
        const imageBase64 = await convertToBase64(images[0]);
        const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        });
        const result = await response.json();
        if (response.ok) {
          imageUrl = result.image_url;
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      const customerToSubmit = { ...newCustomer, imageUrl };
      const endpoint = isAdminForm ? '/api/users/admin-user' : '/api/users';

      const response = newCustomer.id
        ? await fetch(`/api/users/${newCustomer.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerToSubmit),
          })
        : await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerToSubmit),
          });

      if (response.ok) {
        fetchCustomers();
        setIsModalOpen(false);
        setNewCustomer({
          id: null,
          name: '',
          email: '',
          password: '',
          phoneno: '',
          city: '',
          image: null,
          imageUrl: '',
          role: 'CUSTOMER',
        });
        setImages([]);
      } else {
        const errorData = await response.json();
        console.error('Failed to create/update customer:', errorData.message);
      }
    } catch (error) {
      console.error('Error adding/updating customer:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchCustomers();
      } else {
        console.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = async (item) => {
    setIsLoading(true);
    try {
      setNewCustomer(item);
      setIsAdminForm(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (id, action) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        fetchCustomers();
      } else {
        const errorData = await response.json();
        console.error('Failed to update customer status:', errorData.message);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
    setIsLoading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImages([file]);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', p: 1 }}>
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
            zIndex: 50,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ color: 'white', ml: 2 }}>Loading...</Typography>
        </Box>
      )}

      {/* Main Content */}
      <Paper sx={{ boxShadow: 3, p: 0, m: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
            Customers List
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color="primary"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => {
                setNewCustomer({
                  id: null,
                  name: '',
                  email: '',
                  password: '',
                  phoneno: '',
                  city: '',
                  image: null,
                  imageUrl: '',
                  role: 'CUSTOMER',
                });
                setIsAdminForm(true);
                setImages([]);
                setIsModalOpen(true);
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Input */}
        {isSearchVisible && (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ mb: 2, mx: 2 }}
          />
        )}

        {/* Table */}
        <TableContainer sx={{ maxHeight: '60vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Phone No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', width: 150 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Updated At</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(paginatedData) && paginatedData.map((item, index) => (
                <TableRow key={item.id} sx={{ bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB' }}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phoneno}</TableCell>
                  <TableCell sx={{ maxWidth: 150, wordBreak: 'break-word' }}>{item.city}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      onClick={() => handleEditItem(item)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDeleteItem(item.id)}
                      sx={{ mr: 1 }}
                    >
                      Delete
                    </Button>
                    <Button
                      color={item.status === 1 ? 'warning' : 'success'}
                      onClick={() => handleStatusChange(item.id, item.status === 1 ? 'deactivate' : 'activate')}
                    >
                      {item.status === 1 ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Modal with Smaller, Rectangular Buttons */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{newCustomer.id ? 'Edit Customer' : 'Add New Admin'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newCustomer.password}
            onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Phone No"
            value={newCustomer.phoneno}
            onChange={(e) => setNewCustomer({ ...newCustomer, phoneno: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="City"
            value={newCustomer.city}
            onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Image"
            type="file"
            onChange={handleImageChange}
            sx={{ mt: 2 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          {!isAdminForm && (
            <Select
              fullWidth
              value={newCustomer.role}
              onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              <MenuItem value="CUSTOMER">Customer</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={() => setIsModalOpen(false)}
            variant="outlined"
            sx={{
              px: 2, // Reduced padding for smaller size
              py: 0.5, // Reduced padding for smaller size
              borderColor: '#B0BEC5', // Light gray border
              color: '#546E7A', // Muted teal-gray text
              fontWeight: '600',
              fontSize: '0.875rem', // Smaller text
              bgcolor: '#ECEFF1', // Very light gray background
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Soft shadow
              '&:hover': {
                bgcolor: '#CFD8DC', // Slightly darker gray on hover
                borderColor: '#90A4AE', // Darker border
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', // Enhanced shadow
                transform: 'scale(1.02)', // Slight scale-up
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNewItem}
            variant="contained"
            sx={{
              px: 2, // Reduced padding for smaller size
              py: 0.5, // Reduced padding for smaller size
              bgcolor: '#0288D1', // Vibrant blue
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem', // Smaller text
              boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)', // Blue-tinted shadow
              '&:hover': {
                bgcolor: '#0277BD', // Darker blue on hover
                boxShadow: '0 6px 16px rgba(2, 136, 209, 0.4)', // Stronger shadow
                transform: 'scale(1.02)', // Slight scale-up
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {newCustomer.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableCustomerTable;