'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  TablePagination,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
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

const FilterableTable = ({ data = [], fetchData }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [newItem, setNewItem] = useState({
    id: null,
    userId: '',
    total: '',
    status: '',
    orderItems: [],
    image: null,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(data)) {
      setFilteredData(
        data
          .filter((item) =>
            Object.values(item).some((val) =>
              String(val).toLowerCase().includes(filter.toLowerCase())
            )
          )
          .sort((a, b) => b.id - a.id)
      );
    }
  }, [filter, data]);

  const handleRowClick = (id) => {
    router.push(`/admin/pages/orders/${id}`);
  };

  const handleAddNewItem = async () => {
    setIsFetching(true);
    const formData = new FormData();
    formData.append('userId', newItem.userId);
    formData.append('total', newItem.total);
    formData.append('status', newItem.status);
    newItem.orderItems.forEach((item, index) => {
      formData.append(`orderItems[${index}][productId]`, item.productId);
      formData.append(`orderItems[${index}][quantity]`, item.quantity);
      formData.append(`orderItems[${index}][price]`, item.price);
    });
    if (newItem.image) {
      formData.append('image', newItem.image);
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding new item:', error);
    }
    setIsFetching(false);
  };

  const handleDeleteItem = async (id) => {
    setIsFetching(true);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsFetching(false);
  };

  const handleEditItem = (item) => {
    setNewItem(item);
    setIsModalOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', p: 1 }}>
      {/* New Designed Loading Bar for API Fetching */}
      {isFetching && (
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
      <Paper sx={{ p: 2, boxShadow: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
            Orders List
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
                setNewItem({
                  id: null,
                  userId: '',
                  total: '',
                  status: '',
                  orderItems: [],
                  image: null,
                });
                setIsModalOpen(true);
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {isSearchVisible && (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        <TableContainer sx={{ maxHeight: '60vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Updated At</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(paginatedData) &&
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{ bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB', cursor: 'pointer' }}
                    onClick={() => handleRowClick(item.id)}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      {item.user ? (
                        <>
                          {item.user.name}
                          <br />
                          (ID: {item.userId})
                        </>
                      ) : (
                        'No User Associated'
                      )}
                    </TableCell>
                    <TableCell>{item.total}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                    <TableCell>{item.paymentMethod}</TableCell>
                    <TableCell>
                      <Button
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item.id);
                        }}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

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

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{newItem.id ? 'Edit Order' : 'Add New Order'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID"
            type="number"
            value={newItem.userId}
            onChange={(e) => setNewItem({ ...newItem, userId: e.target.value })}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Total"
            type="number"
            value={newItem.total}
            onChange={(e) => setNewItem({ ...newItem, total: e.target.value })}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Status"
            value={newItem.status}
            onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
              Order Items
            </Typography>
            {newItem.orderItems.map((orderItem, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Product ID"
                  type="number"
                  value={orderItem.productId}
                  onChange={(e) => {
                    const updatedOrderItems = [...newItem.orderItems];
                    updatedOrderItems[index].productId = e.target.value;
                    setNewItem({ ...newItem, orderItems: updatedOrderItems });
                  }}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={orderItem.quantity}
                  onChange={(e) => {
                    const updatedOrderItems = [...newItem.orderItems];
                    updatedOrderItems[index].quantity = e.target.value;
                    setNewItem({ ...newItem, orderItems: updatedOrderItems });
                  }}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={orderItem.price}
                  onChange={(e) => {
                    const updatedOrderItems = [...newItem.orderItems];
                    updatedOrderItems[index].price = e.target.value;
                    setNewItem({ ...newItem, orderItems: updatedOrderItems });
                  }}
                  variant="outlined"
                />
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                setNewItem({
                  ...newItem,
                  orderItems: [...newItem.orderItems, { productId: '', quantity: '', price: '' }],
                })
              }
              sx={{ mt: 1 }}
            >
              Add Item
            </Button>
          </Box>
          <TextField
            fullWidth
            label="Image"
            type="file"
            onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
            variant="outlined"
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setIsModalOpen(false)}
            sx={{ px: 3, py: 1, fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNewItem}
            sx={{ px: 3, py: 1, fontWeight: 'bold' }}
          >
            {newItem.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;