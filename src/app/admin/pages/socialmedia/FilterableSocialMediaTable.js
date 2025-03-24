"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

const SocialMediaForm = () => {
  const [formData, setFormData] = useState({
    id: null,
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    pinterest: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch social media links on mount
  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/socialmedia");
        const result = await response.json();
        if (result.status && result.data.length > 0) {
          const existingData = result.data[0];
          setFormData({
            id: existingData.id,
            facebook: existingData.facebook || "",
            instagram: existingData.instagram || "",
            twitter: existingData.twitter || "",
            tiktok: existingData.tiktok || "",
            pinterest: existingData.pinterest || "",
          });
        }
      } catch (error) {
        console.error("Error fetching social media links:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialMediaLinks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/socialmedia", {
        method: "POST", // Using POST to handle both create and update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.status) {
        alert("Social media links updated successfully!");
      } else {
        alert("Failed to update social media links.");
      }
    } catch (error) {
      console.error("Error updating social media links:", error);
      alert("An error occurred while updating the data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "grey.800", mb: 3 }}
        >
          Social Media Links
        </Typography>
        <Box
          component="form"
          onSubmit={handleUpdate}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {["facebook", "instagram", "twitter", "tiktok", "pinterest"].map((platform) => (
            <TextField
              key={platform}
              label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
              name={platform}
              value={formData[platform]}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              type="url"
              disabled={isLoading}
            />
          ))}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Updating...
              </>
            ) : (
              "Update Links"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SocialMediaForm;