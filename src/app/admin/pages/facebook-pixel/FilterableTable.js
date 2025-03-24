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

const FilterableTable = () => {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPixel, setNewPixel] = useState({ id: "", pixelCode: "" });

  useEffect(() => {
    fetchPixels();
  }, []);

  // Fetch all Facebook Pixel codes
  const fetchPixels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pixels");
      const data = await response.json();
      setFilteredData(data.data);
    } catch (error) {
      console.error("Error fetching pixels:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setFilteredData((prevData) =>
      (prevData || []).filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter]);

  const handleAddNewPixel = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      const response = newPixel.id
        ? await fetch(`/api/pixels/${newPixel.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPixel),
          })
        : await fetch("/api/pixels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pixelCode: newPixel.pixelCode }),
          });

      if (!response.ok) {
        throw new Error("Failed to add or update pixel code");
      }

      fetchPixels();
      setNewPixel({ id: "", pixelCode: "" });
    } catch (error) {
      console.error("Error adding/updating pixel:", error);
    }
    setIsLoading(false);
  };

  const handleEditPixel = (item) => {
    setNewPixel({ id: item.id, pixelCode: item.pixelCode });
    setIsModalOpen(true);
  };

  const handleDeletePixel = async (id) => {
    setIsLoading(true);
    try {
      await fetch(`/api/pixels/${id}`, { method: "DELETE" });
      fetchPixels();
    } catch (error) {
      console.error("Error deleting pixel:", error);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
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
      <Paper sx={{ m: 3, p: 2, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "medium", color: "grey.800" }}>
            Facebook Pixel Codes
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
                setNewPixel({ id: "", pixelCode: "" });
                setIsModalOpen(true);
              }}
              aria-label="add new pixel"
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
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Pixel Code</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ color: "grey.500" }}>{item.id}</TableCell>
                    <TableCell sx={{ fontWeight: "medium", color: "grey.900" }}>
                      {item.pixelCode}
                    </TableCell>
                    <TableCell sx={{ color: "grey.500" }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditPixel(item)}
                          aria-label="edit pixel"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePixel(item.id)}
                          aria-label="delete pixel"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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

      {/* Add/Edit Pixel Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {newPixel.id ? "Edit Pixel Code" : "Add New Pixel Code"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Pixel Code"
              value={newPixel.pixelCode}
              onChange={(e) => setNewPixel({ ...newPixel, pixelCode: e.target.value })}
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
            onClick={handleAddNewPixel}
            color="primary"
            variant="contained"
          >
            {newPixel.id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;