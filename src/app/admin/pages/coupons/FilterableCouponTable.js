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
  Checkbox,
  Backdrop,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const FilterableCouponTable = ({ coupons, fetchCoupons }) => {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState(coupons || []);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    id: null,
    code: "",
    discount: 0,
    expiration: "",
    isActive: true,
  });

  useEffect(() => {
    setFilteredData(
      (coupons || []).filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, coupons]);

  const handleAddNewItem = async () => {
    setIsLoading(true);
    try {
      const couponToSubmit = {
        ...newCoupon,
        expiration: newCoupon.expiration ? new Date(newCoupon.expiration) : null,
      };

      const response = newCoupon.id
        ? await fetch(`/api/coupons/${newCoupon.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(couponToSubmit),
          })
        : await fetch("/api/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(couponToSubmit),
          });

      if (!response.ok) {
        throw new Error("Failed to create or update coupon");
      }

      await response.json();
      fetchCoupons();
      setIsModalOpen(false);
      setNewCoupon({ id: null, code: "", discount: 0, expiration: "", isActive: true });
    } catch (error) {
      console.error("Error adding or updating coupon:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (id) => {
    setIsLoading(true);
    try {
      await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewCoupon({
      ...item,
      expiration: item.expiration ? new Date(item.expiration).toISOString().slice(0, 10) : "",
    });
    setIsModalOpen(true);
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
            Coupons List
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
                setNewCoupon({
                  id: null,
                  code: "",
                  discount: 0,
                  expiration: "",
                  isActive: true,
                });
                setIsModalOpen(true);
              }}
              aria-label="add new coupon"
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
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Code</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Discount</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Expiration</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Active</TableCell>
                <TableCell sx={{ fontWeight: "medium", color: "grey.500" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={item.id} sx={{ bgcolor: index % 2 === 0 ? "white" : "grey.50" }}>
                    <TableCell sx={{ fontWeight: "medium", color: "grey.900" }}>{item.id}</TableCell>
                    <TableCell sx={{ color: "grey.500" }}>{item.code}</TableCell>
                    <TableCell sx={{ color: "grey.500" }}>{item.discount}%</TableCell>
                    <TableCell sx={{ color: "grey.500" }}>
                      {item.expiration ? new Date(item.expiration).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "grey.500" }}>{item.isActive ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditItem(item)}
                          aria-label="edit coupon"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                          aria-label="delete coupon"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">{newCoupon.id ? "Edit Coupon" : "Add New Coupon"}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Code"
              fullWidth
              variant="outlined"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
            />
            <TextField
              label="Discount (%)"
              type="number"
              fullWidth
              variant="outlined"
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseFloat(e.target.value) })}
            />
            <TextField
              label="Expiration Date"
              type="date"
              fullWidth
              variant="outlined"
              value={newCoupon.expiration}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiration: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={newCoupon.isActive}
                onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
              />
              <Typography variant="body1">Active</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAddNewItem} color="primary" variant="contained">
            {newCoupon.id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableCouponTable;