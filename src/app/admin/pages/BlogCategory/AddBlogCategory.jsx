"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Toolbar,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  TablePagination,
  Box,
  Typography,
} from "@mui/material";
import { useTable, useGlobalFilter, useSortBy, usePagination } from "react-table";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";

const BlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const router = useRouter();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/blogcategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch categories.",
        type: "error",
      });
    }
  };

  const handleAddOpen = () => {
    setFormData({ title: "", description: "" });
    setOpenAddDialog(true);
  };

  const handleAddClose = () => setOpenAddDialog(false);

  const handleEditOpen = (category) => {
    setEditingCategory(category);
    setFormData({ title: category.title, description: category.description });
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    setEditingCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }
    try {
      await axios.post("/api/blogcategory", formData);
      setSnackbar({
        open: true,
        message: "Category added successfully.",
        type: "success",
      });
      fetchCategories();
      handleAddClose();
    } catch (error) {
      console.error("Error adding category:", error);
      setSnackbar({
        open: true,
        message: "Failed to add category.",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }
    try {
      await axios.put(`/api/blogcategory/${editingCategory.id}`, formData);
      setSnackbar({
        open: true,
        message: "Category updated successfully.",
        type: "success",
      });
      fetchCategories();
      handleEditClose();
    } catch (error) {
      console.error("Error updating category:", error);
      setSnackbar({
        open: true,
        message: "Failed to update category.",
        type: "error",
      });
    }
  };

  const handleDelete = (id) => setDeleteConfirmation({ open: true, id });

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/blogcategory/${deleteConfirmation.id}`);
      setSnackbar({
        open: true,
        message: "Category deleted successfully.",
        type: "warning",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete category.",
        type: "error",
      });
    } finally {
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  const handleCancelDelete = () =>
    setDeleteConfirmation({ open: false, id: null });

  const columns = React.useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Title", accessor: "title" },
      { Header: "Description", accessor: "description" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: "Updated At",
        accessor: "updatedAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              color="primary"
              onClick={() => handleEditOpen(row.original)}
            >
              <FaUserEdit />
            </IconButton>
            {userRole !== "sub admin" && (
              <IconButton
                color="error"
                onClick={() => handleDelete(row.original.id)}
              >
                <MdDeleteForever />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    [userRole]
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
    { columns, data: categories },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex, pageSize, globalFilter } = state;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Toolbar>
          <TextField
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value || undefined)}
            placeholder="Search"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "grey.500" }} />,
            }}
          />
        </Toolbar>
        <Button variant="contained" onClick={handleAddOpen}>
          Add New Category
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell
                    key={column.id}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                    {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <TableRow key={row.id} {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {page.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography>No categories found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: categories.length }]}
        component="div"
        count={categories.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        onPageChange={(event, newPage) => gotoPage(newPage)}
        onRowsPerPageChange={(event) => setPageSize(Number(event.target.value))}
      />

      <Dialog
        open={openAddDialog}
        onClose={handleAddClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Add New Category
          <IconButton onClick={handleAddClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              multiline
              rows={4}
            />
            <DialogActions>
              <Button onClick={handleAddClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Edit Category
          <IconButton onClick={handleEditClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              multiline
              rows={4}
            />
            <DialogActions>
              <Button onClick={handleEditClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          {deleteConfirmation.id && (
            <Typography>
              Are you sure you want to delete the category with ID{" "}
              {deleteConfirmation.id}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BlogCategories;