'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Toolbar,
  InputBase,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: '',
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null,
  });
  const [isLoading, setIsLoading] = useState(false); // Added for loading state

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/faq');
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch FAQs.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOpen = () => {
    setFormData({
      question: '',
      answer: '',
    });
    setOpenAddDialog(true);
  };

  const handleAddClose = () => {
    setOpenAddDialog(false);
  };

  const handleEditOpen = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
    });
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    setEditingFaq(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question || !formData.answer) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/api/faq', formData);
      setSnackbar({
        open: true,
        message: 'FAQ added successfully.',
        type: 'success',
      });
      fetchFaqs();
      handleAddClose();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add FAQ.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question || !formData.answer) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`/api/faq/${editingFaq.id}`, formData);
      setSnackbar({
        open: true,
        message: 'FAQ updated successfully.',
        type: 'success',
      });
      fetchFaqs();
      handleEditClose();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update FAQ.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmation({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/faq/${deleteConfirmation.id}`);
      setSnackbar({
        open: true,
        message: 'FAQ deleted successfully.',
        type: 'warning',
      });
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete FAQ.',
        type: 'error',
      });
    } finally {
      setDeleteConfirmation({ open: false, id: null });
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null });
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Question',
        accessor: 'question',
      },
      {
        Header: 'Answer',
        accessor: 'answer',
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Updated At',
        accessor: 'updatedAt',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => handleEditOpen(row.original)}
              sx={{ color: '#006a5c' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(row.original.id)}
              sx={{ color: '#b03f37' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: faqs,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex, pageSize, globalFilter } = state;

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', p: 1 }}>
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
          <Toolbar sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'grey.200',
                borderRadius: '4px',
                p: '4px 8px',
                width: { xs: '100%', sm: '300px' },
              }}
            >
              <SearchIcon sx={{ color: 'grey.600', mr: 1 }} />
              <InputBase
                value={globalFilter || ''}
                onChange={(e) => setGlobalFilter(e.target.value || undefined)}
                placeholder="Search FAQs"
                sx={{ flex: 1 }}
              />
            </Box>
          </Toolbar>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOpen}
            sx={{ borderRadius: '8px' }}
          >
            Add New FAQ
          </Button>
        </Box>

        <TableContainer sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
          <Table {...getTableProps()}>
            <TableHead>
              {headerGroups.map((headerGroup) => (
                <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <TableCell
                      key={column.id}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                    >
                      {column.render('Header')}
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {page.map((row, index) => {
                prepareRow(row);
                return (
                  <TableRow
                    key={row.id}
                    {...row.getRowProps()}
                    sx={{ bgcolor: index % 2 === 0 ? 'white' : 'grey.50' }}
                  >
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {page.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No FAQs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: faqs.length }]}
          component="div"
          count={faqs.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={(event, newPage) => gotoPage(newPage)}
          onRowsPerPageChange={(event) => setPageSize(Number(event.target.value))}
        />
      </Paper>

      {/* Add FAQ Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New FAQ
          <IconButton
            aria-label="close"
            onClick={handleAddClose}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddSubmit}>
            <TextField
              label="Question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <TextField
              label="Answer"
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              multiline
              rows={4}
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <DialogActions>
              <Button
                onClick={handleAddClose}
                sx={{ color: 'grey.600', borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ borderRadius: '8px' }}
              >
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit FAQ
          <IconButton
            aria-label="close"
            onClick={handleEditClose}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <TextField
              label="Question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <TextField
              label="Answer"
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              multiline
              rows={4}
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
            <DialogActions>
              <Button
                onClick={handleEditClose}
                sx={{ color: 'grey.600', borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ borderRadius: '8px' }}
              >
                Update
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCancelDelete}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <DialogTitle id="delete-confirmation-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          {deleteConfirmation.id && (
            <Typography>
              Are you sure you want to delete the FAQ with ID {deleteConfirmation.id}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{ color: 'grey.600', borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="secondary"
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FAQ;