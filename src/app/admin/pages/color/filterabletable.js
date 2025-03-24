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
  Backdrop, // Added Backdrop here
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import ntc from "ntcjs"; // Importing the ntcjs library

const FilterableTable = ({ colors = [], fetchColors }) => {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editColorId, setEditColorId] = useState(null);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000"); // Default to black
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFilteredData(
      (Array.isArray(colors) ? colors : []).filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, colors]);

  const handleAddNewColor = async () => {
    const ntcResult = ntc.name(newColorHex);
    const generatedName = ntcResult[1]; // Get the closest color name from ntc.js

    setIsLoading(true);
    try {
      const response = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: generatedName, hex: newColorHex }),
      });

      if (response.ok) {
        fetchColors();
        setIsModalOpen(false);
        setNewColorName("");
        setNewColorHex("#000000");
      } else {
        console.error("Failed to add color");
      }
    } catch (error) {
      console.error("Error adding color:", error);
    }
    setIsLoading(false);
  };

  const handleUpdateColor = async () => {
    const ntcResult = ntc.name(newColorHex);
    const generatedName = ntcResult[1]; // Get the closest color name from ntc.js

    setIsLoading(true);
    try {
      const response = await fetch("/api/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editColorId, name: generatedName, hex: newColorHex }),
      });

      if (response.ok) {
        fetchColors();
        setIsModalOpen(false);
        setNewColorName("");
        setNewColorHex("#000000");
        setEditColorId(null);
      } else {
        console.error("Failed to update color");
      }
    } catch (error) {
      console.error("Error updating color:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteColor = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/colors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchColors();
      } else {
        console.error("Failed to delete color");
      }
    } catch (error) {
      console.error("Error deleting color:", error);
    }
    setIsLoading(false);
  };

  const handleModalOpen = (color) => {
    setNewColorName(color ? color.name : "");
    setNewColorHex(color ? color.hex : "#000000");
    setEditColorId(color ? color.id : null);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "grey.100", minHeight: "100vh" }}>
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
          <Typography variant="h5" component="h2" sx={{ fontWeight: "medium", color: "grey.800" }}>
            Colors List
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
              onClick={() => handleModalOpen(null)}
              aria-label="add new color"
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
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>
                  Name (Hex)
                </TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: "medium", color: "grey.900" }}>
                      {item.id}
                    </TableCell>
                    <TableCell sx={{ color: "grey.500" }}>
                      {item.name} ({item.hex || "N/A"})
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleModalOpen(item)}
                          aria-label="edit color"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteColor(item.id)}
                          aria-label="delete color"
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

      {/* Add/Edit Color Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {editColorId ? "Edit Color" : "Add New Color"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Color Name"
              fullWidth
              variant="outlined"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="Hex Value"
              type="color"
              fullWidth
              variant="outlined"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
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
            onClick={editColorId ? handleUpdateColor : handleAddNewColor}
            color="primary"
            variant="contained"
          >
            {editColorId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;