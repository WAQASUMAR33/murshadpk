'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const FilterableTable = ({ data, fetchData }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    branch: '',
    role: '',
    email: '',
    password: '',
  });
  const [branches, setBranches] = useState([]);
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter data based on search input
  useEffect(() => {
    setFilteredData(
      data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
    setPage(0); // Reset to the first page when filter changes
  }, [filter, data]);

  // Fetch branches for the dropdown
  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const result = await response.json();
      setBranches(result);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Handle adding or updating an item
  const handleAddorUpdateItem = async () => {
    setIsLoading(true);
    const method = newItem.id ? 'PUT' : 'POST';
    const url = newItem.id ? `/api/admin/${newItem.id}` : '/api/admin';

    try {
      console.log('Request Body:', newItem); // Log the request body
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add new item');
      }
      fetchData(); // Refresh the data after adding
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding new item:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete item');
      }
      fetchData(); // Refresh the data after deleting
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing an item
  const handleEditItem = (item) => {
    setNewItem(item);
    setIsModalOpen(true);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  // Paginated data
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            Loading...
          </Typography>
        </Box>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.800' }}>
            Admin Users List
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              sx={{ color: 'grey.600', '&:hover': { color: 'grey.900' } }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                setNewItem({
                  name: '',
                  branch: '',
                  role: '',
                  email: '',
                  password: '',
                });
                setIsModalOpen(true);
              }}
              sx={{ color: 'grey.600', '&:hover': { color: 'grey.900' } }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {isSearchVisible && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                sx: { borderRadius: '8px' },
                startAdornment: <SearchIcon sx={{ color: 'grey.600', mr: 1 }} />,
              }}
            />
          </Box>
        )}

        <TableContainer sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={item.id} sx={{ bgcolor: index % 2 === 0 ? 'white' : 'grey.50' }}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleEditItem(item)}
                        sx={{ color: 'indigo.600', '&:hover': { color: 'indigo.900' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteItem(item.id)}
                        sx={{ color: 'red.600', '&:hover': { color: 'red.900' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: filteredData.length }]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {newItem.id ? 'Edit Admin User' : 'Add New Admin User'}
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'grey.500' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                variant="outlined"
                size="small"
                margin="normal"
                InputProps={{ sx: { borderRadius: '8px' } }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Branch</InputLabel>
                <Select
                  value={newItem.branch}
                  onChange={(e) => setNewItem({ ...newItem, branch: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>Select Branch</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.title}>
                      {branch.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newItem.role}
                  onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>Select Role</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="super admin">Super Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newItem.email}
                onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                variant="outlined"
                size="small"
                margin="normal"
                InputProps={{ sx: { borderRadius: '8px' } }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newItem.password}
                onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                variant="outlined"
                size="small"
                margin="normal"
                InputProps={{ sx: { borderRadius: '8px' } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsModalOpen(false)}
            sx={{ color: 'grey.600', borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddorUpdateItem}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '8px' }}
          >
            {newItem.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;