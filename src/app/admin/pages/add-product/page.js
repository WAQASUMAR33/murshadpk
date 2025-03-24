'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// React Quill (dynamically imported as in your code)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const AddProductPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [newProduct, setNewProduct] = useState({
    id: null,
    name: '',
    slug: '',
    richDescription: '',
    price: '',
    stock: '',
    categorySlug: '',
    subcategorySlug: '',
    colors: [],
    sizes: [],
    image: [],
    imageUrl: '',
    discount: '',
    isTopRated: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sku: '',
  });

  const [categories, setCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchColors();
    fetchSizes();

    if (productId) {
      fetchProductData(productId);
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categorySlug) => {
    try {
      const response = await fetch(`/api/subcategories/${categorySlug}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setFilteredSubcategories(data?.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setFilteredSubcategories([]);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      if (!response.ok) throw new Error('Failed to fetch colors');
      const data = await response.json();
      const mappedColors = data.map((color) => ({
        value: color.id,
        label: `${color.name} (${color.hex})`,
        hex: color.hex,
      }));
      setColors(mappedColors);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await fetch('/api/sizes');
      if (!response.ok) throw new Error('Failed to fetch sizes');
      const data = await response.json();
      const mappedSizes = data.map((size) => ({
        value: size.id,
        label: size.name,
      }));
      setSizes(mappedSizes);
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setSizes([]);
    }
  };

  const fetchProductData = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();

      const parsedColors = Array.isArray(data.colors)
        ? data.colors.map((color) => ({
            value: color.id,
            label: `${color.name} (${color.hex})`,
            hex: color.hex,
          }))
        : [];
      const parsedSizes = Array.isArray(data.sizes)
        ? data.sizes.map((size) => ({
            value: size.id,
            label: size.name,
          }))
        : [];

      setNewProduct({
        ...data,
        colors: parsedColors,
        sizes: parsedSizes,
      });
      setExistingImages(data.images || []);
      if (data.categoryId) await fetchSubcategories(data.categoryId);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
    setIsLoading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddNewItem = async () => {
    const requiredFields = [
      { name: 'name', label: 'Product Name' },
      { name: 'slug', label: 'Slug' },
      { name: 'richDescription', label: 'Description' },
      { name: 'price', label: 'Price' },
      { name: 'stock', label: 'Stock' },
      { name: 'categorySlug', label: 'Category' },
      { name: 'subcategorySlug', label: 'Subcategory' },
    ];

    const missingFields = requiredFields
      .filter((field) => typeof newProduct[field.name] === 'string' && !newProduct[field.name].trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const existingProductResponse = await fetch(`/api/products/${newProduct.slug}`);
      const existingData = await existingProductResponse.json();

      if (existingData.status === false) {
        alert('Product with this slug already exists.');
        setIsLoading(false);
        return;
      }

      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          const imageBase64 = await convertToBase64(img);
          const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          const result = await response.json();
          if (response.ok) return result.image_url;
          throw new Error(result.error || 'Failed to upload image');
        })
      );

      const imageUrls = uploadedImages.map((filename) => `${filename}`);

      const productToSubmit = {
        ...newProduct,
        description: newProduct.richDescription,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        subcategorySlug: newProduct.subcategorySlug,
        colors: JSON.stringify(newProduct.colors.map((color) => color.value)),
        sizes: JSON.stringify(newProduct.sizes.map((size) => size.value)),
        images: imageUrls,
        discount: newProduct.discount ? roundToTwoDecimalPlaces(parseFloat(newProduct.discount)) : null,
        isTopRated: newProduct.isTopRated,
        meta_title: newProduct.meta_title,
        meta_description: newProduct.meta_description,
        meta_keywords: newProduct.meta_keywords,
        sku: newProduct.sku,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSubmit),
      });

      if (response.ok) {
        router.push('/admin/pages/Products');
      } else {
        const errorData = await response.json();
        console.error('Failed to create product:', errorData.message);
        alert(`Failed to create product: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert(`Error adding product: ${error.message}`);
    }

    setIsLoading(false);
  };

  const roundToTwoDecimalPlaces = (num) => {
    return Math.round(num * 100) / 100;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

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
      <Paper sx={{ p: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
          {newProduct.id ? 'Edit Product' : 'Add New Product'}
        </Typography>

        {/* Product Details */}
        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
          Product Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newProduct.categorySlug}
                onChange={(e) => {
                  const categorySlug = e.target.value;
                  setNewProduct({ ...newProduct, categorySlug, subcategorySlug: '' });
                  fetchSubcategories(categorySlug);
                }}
                label="Category"
              >
                <MenuItem value="">Select Category</MenuItem>
                {Array.isArray(categories.data) &&
                  categories.data.map((category) => (
                    <MenuItem key={category.slug} value={category.slug}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {filteredSubcategories.length > 0 && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={newProduct.subcategorySlug}
                  onChange={(e) => setNewProduct({ ...newProduct, subcategorySlug: e.target.value })}
                  label="Subcategory"
                >
                  <MenuItem value="">Select Subcategory</MenuItem>
                  {filteredSubcategories.map((subcategory) => (
                    <MenuItem key={subcategory.slug} value={subcategory.slug}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              variant="outlined"
              placeholder="Enter product name"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Slug"
              value={newProduct.slug}
              onChange={(e) => {
                const slugValue = e.target.value.replace(/\s+/g, '-');
                setNewProduct({ ...newProduct, slug: slugValue });
              }}
              variant="outlined"
              placeholder="Enter product slug"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SKU Number"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              variant="outlined"
              placeholder="Enter product SKU number"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price (Rs.)"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              variant="outlined"
              placeholder="Enter price"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={newProduct.stock !== null ? newProduct.stock.toString() : ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 0) setNewProduct({ ...newProduct, stock: value });
              }}
              variant="outlined"
              placeholder="Enter stock quantity"
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Discount (%)"
              type="number"
              value={newProduct.discount ? roundToTwoDecimalPlaces(newProduct.discount) : ''}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  discount: e.target.value ? parseFloat(e.target.value) : '',
                })
              }
              variant="outlined"
              placeholder="Enter discount percentage"
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newProduct.isTopRated}
                  onChange={(e) => setNewProduct({ ...newProduct, isTopRated: e.target.checked })}
                  color="primary"
                />
              }
              label="Top Rated"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Colors</InputLabel>
              <Select
                multiple
                value={newProduct.colors}
                onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                label="Colors"
                renderValue={(selected) => selected.map((color) => color.label).join(', ')}
              >
                {colors.map((color) => (
                  <MenuItem key={color.value} value={color}>
                    <Checkbox checked={newProduct.colors.some((c) => c.value === color.value)} />
                    {color.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sizes</InputLabel>
              <Select
                multiple
                value={newProduct.sizes}
                onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                label="Sizes"
                renderValue={(selected) => selected.map((size) => size.label).join(', ')}
              >
                {sizes.map((size) => (
                  <MenuItem key={size.value} value={size}>
                    <Checkbox checked={newProduct.sizes.some((s) => s.value === size.value)} />
                    {size.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Description */}
        <Typography variant="h6" sx={{ fontWeight: 'medium', mt: 4, mb: 2 }}>
          Description
        </Typography>
        <ReactQuill
          value={newProduct.richDescription}
          onChange={(value) => setNewProduct({ ...newProduct, richDescription: value })}
          style={{ height: '200px', marginBottom: '50px' }} // Adjust height and margin for toolbar
          placeholder="Enter product description..."
        />

        {/* Meta Fields */}
        <TextField
          fullWidth
          label="Meta Title"
          value={newProduct.meta_title}
          onChange={(e) => setNewProduct({ ...newProduct, meta_title: e.target.value })}
          variant="outlined"
          placeholder="Enter meta title"
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Meta Description"
          value={newProduct.meta_description}
          onChange={(e) => setNewProduct({ ...newProduct, meta_description: e.target.value })}
          variant="outlined"
          placeholder="Enter meta description"
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Meta Keywords"
          value={newProduct.meta_keywords}
          onChange={(e) => setNewProduct({ ...newProduct, meta_keywords: e.target.value })}
          variant="outlined"
          placeholder="Enter meta keywords"
          sx={{ mt: 2 }}
        />

        {/* Upload Images */}
        <Typography variant="h6" sx={{ fontWeight: 'medium', mt: 4, mb: 2 }}>
          Upload Images
        </Typography>
        <TextField
          fullWidth
          label="Upload New Images"
          type="file"
          onChange={handleImageChange}
          variant="outlined"
          inputProps={{ multiple: true, accept: 'image/*' }}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
          inputRef={fileInputRef}
        />

        {existingImages.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
              Existing Images
            </Typography>
            <Grid container spacing={2}>
              {existingImages.map((img, index) => (
                <Grid item xs={6} md={4} lg={3} key={index}>
                  <Box sx={{ position: 'relative' }}>
                    <Image
                      width={1000}
                      height={1000}
                      src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${img}`}
                      alt={`Product Image ${index + 1}`}
                      style={{ width: '100%', height: '128px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveExistingImage(index)}
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'red', color: 'white', '&:hover': { bgcolor: 'darkred' } }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {images.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
              New Images
            </Typography>
            <Grid container spacing={2}>
              {images.map((img, index) => (
                <Grid item xs={6} md={4} lg={3} key={index}>
                  <Box sx={{ position: 'relative' }}>
                    <Image
                      width={1000}
                      height={1000}
                      src={URL.createObjectURL(img)}
                      alt={`New Image ${index + 1}`}
                      style={{ width: '100%', height: '128px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'red', color: 'white', '&:hover': { bgcolor: 'darkred' } }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push('/admin/pages/Products')}
            sx={{ px: 3, py: 1, fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNewItem} // Assuming updateProduct is not implemented yet; use handleAddNewItem
            sx={{ px: 3, py: 1, fontWeight: 'bold' }}
          >
            {newProduct.id ? 'Update' : 'Add'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

const AddProductPage = () => {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</Box>}>
      <AddProductPageContent />
    </Suspense>
  );
};

export default AddProductPage;