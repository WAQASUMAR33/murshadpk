"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Backdrop,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const FilterableTable = ({ sizes = [], fetchSizes }) => {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSize, setCurrentSize] = useState({ id: null, name: "" });

  useEffect(() => {
    setFilteredData(
      (sizes || []).filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, sizes]);

  const handleAddOrUpdateSize = async () => {
    setIsLoading(true);
    try {
      const method = currentSize.id ? "PUT" : "POST";
      const response = await fetch("/api/sizes", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentSize),
      });

      if (response.ok) {
        fetchSizes();
        setIsModalOpen(false);
        setCurrentSize({ id: null, name: "" });
      } else {
        console.error("Failed to save size");
      }
    } catch (error) {
      console.error("Error saving size:", error);
    }
    setIsLoading(false);
  };

  const handleEditClick = (size) => {
    setCurrentSize(size);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sizes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchSizes();
      } else {
        console.error("Failed to delete size");
      }
    } catch (error) {
      console.error("Error deleting size:", error);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ p: 1, bgcolor: "grey.100", minHeight: "100vh" }}>
      {/* Loading Overlay */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Backdrop>

      {/* Main Content */}
      <Paper sx={{ p: 2, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "medium", color: "grey.800" }}>
            Sizes List
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              aria-label="toggle search"
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => {
                setCurrentSize({ id: null, name: "" });
                setIsModalOpen(true);
              }}
              aria-label="add new size"
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Field */}
        {isSearchVisible && (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "grey.500" }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: "medium", color: "grey.900" }}>{item.id}</TableCell>
                    <TableCell sx={{ color: "grey.500" }}>{item.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(item)}
                          aria-label="edit size"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(item.id)}
                          aria-label="delete size"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body1" color="grey.500">
                      No data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Size Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {currentSize.id ? "Edit Size" : "Add New Size"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Size Name"
              value={currentSize.name}
              onChange={(e) => setCurrentSize({ ...currentSize, name: e.target.value })}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsModalOpen(false)}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddOrUpdateSize}
            color="primary"
            variant="contained"
          >
            {currentSize.id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;