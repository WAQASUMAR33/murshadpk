'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select as MuiSelect,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const FilterableTable = ({
  products = [],
  fetchProducts,
  categories = [],
  subcategories = [],
  colors = [],
  sizes = [],
}) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(products);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [itemSlugToDelete, setItemSlugToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    subcategorySlug: '',
    colors: [],
    sizes: [],
    discount: '',
    isTopRated: false,
    images: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sku: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setFilteredData(
      products.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
    setPage(0); // Reset to first page when filter or products change
  }, [filter, products]);

  useEffect(() => {
    if (subcategories.length) {
      setFilteredSubcategories(subcategories);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, subcategories]);

  const handleDeleteClick = (slug) => {
    setItemSlugToDelete(slug);
    setIsPopupVisible(true);
  };

  const handleDeleteItem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${itemSlugToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchProducts();
        setIsPopupVisible(false);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsLoading(false);
  };

  const handleCancelDelete = () => {
    setIsPopupVisible(false);
    setItemSlugToDelete(null);
  };

  const handleEditItem = (item) => {
    setEditProduct(item);
    const existingColors = colors
      .filter((color) => item.colors.includes(color.id))
      .map((color) => ({
        value: color.id,
        label: `${color.name} (${color.hex})`,
        hex: color.hex,
      }));

    const existingSizes = sizes
      .filter((size) => item.sizes.includes(size.id))
      .map((size) => ({ value: size.id, label: size.name }));

    setProductForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      stock: item.stock,
      subcategorySlug: item.subcategorySlug,
      colors: existingColors,
      sizes: existingSizes,
      discount: item.discount || '',
      isTopRated: item.isTopRated || false,
      images: [],
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keywords: item.meta_keywords || '',
      sku: item.sku,
    });
    setExistingImages(item.images.map((img) => img.url));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue =
      type === 'checkbox' ? checked : name === 'stock' ? Math.max(0, parseInt(value) || 0) : value;
    setProductForm({ ...productForm, [name]: newValue });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const roundToTwoDecimalPlaces = (num) => Math.round(num * 100) / 100;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const uploadedImages = await Promise.all(
        productForm.images.map(async (file) => {
          const imageBase64 = await convertToBase64(file);
          const response = await fetch(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          const result = await response.json();
          if (response.ok) return result.image_url;
          throw new Error(result.error || 'Failed to upload image');
        })
      );

      const productData = {
        ...productForm,
        stock: parseInt(productForm.stock) || 0,
        images: [...existingImages, ...uploadedImages],
        discount: productForm.discount ? productForm.discount : null,
        colors: productForm.colors.map((color) => color.value),
        sizes: productForm.sizes.map((size) => size.value),
      };

      const response = await fetch(`/api/products/${editProduct.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts();
        setEditProduct(null);
        setProductForm({
          name: '',
          slug: '',
          description: '',
          price: '',
          stock: '',
          subcategorySlug: '',
          colors: [],
          sizes: [],
          discount: '',
          isTopRated: false,
          images: [],
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          sku: '',
        });
        setExistingImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setEditProduct(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      subcategorySlug: '',
      colors: [],
      sizes: [],
      discount: '',
      isTopRated: false,
      images: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      sku: '',
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductForm((prevForm) => ({
      ...prevForm,
      images: [...prevForm.images, ...files],
    }));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    setProductForm((prevForm) => ({
      ...prevForm,
      images: prevForm.images.filter((_, i) => i !== index),
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Calculate paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      {/* Confirmation Dialog */}
      <Dialog open={isPopupVisible} onClose={handleCancelDelete}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography>
            If you delete this product, all orders related to this product will also be deleted. This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteItem} color="secondary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Products List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Products List</Typography>
            <Box>
              <IconButton onClick={() => setIsSearchVisible(!isSearchVisible)}>
                <SearchIcon />
              </IconButton>
              <IconButton onClick={() => router.push('/admin/pages/add-product')}>
                <PlusIcon className="h-6 w-6" />
              </IconButton>
            </Box>
          </Box>

          {/* Search Input */}
          {isSearchVisible && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}

          {/* Products Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(paginatedData) &&
                  paginatedData.map((item, index) => (
                    <TableRow key={item.slug}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>
                        {item.images && item.images.length > 0 ? (
                          <Image
                            width={64}
                            height={64}
                            src={
                              item.images[0].url.startsWith('https://')
                                ? item.images[0].url
                                : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.images[0].url}`
                            }
                            alt="Product Image"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{item.slug}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div dangerouslySetInnerHTML={{ __html: item.description }} />
                      </TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEditItem(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleDeleteClick(item.slug)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editProduct && (
        <Dialog open={Boolean(editProduct)} onClose={handleCancelEdit} maxWidth="lg" fullWidth>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <form onSubmit={handleFormSubmit}>
              <TextField
                label="Name"
                name="name"
                value={productForm.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="SKU number"
                name="sku"
                value={productForm.sku}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="Slug"
                name="slug"
                value={productForm.slug}
                onChange={(e) =>
                  setProductForm({ ...productForm, slug: e.target.value.replace(/\s+/g, '-') })
                }
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <ReactQuill
                value={productForm.description}
                onChange={(value) => setProductForm({ ...productForm, description: value })}
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={productForm.price}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="Stock"
                name="stock"
                type="number"
                value={productForm.stock}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Discount"
                name="discount"
                type="number"
                value={productForm.discount}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    discount: roundToTwoDecimalPlaces(parseFloat(e.target.value) || 0),
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
                inputProps={{ step: 0.01 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isTopRated"
                    checked={productForm.isTopRated}
                    onChange={handleFormChange}
                  />
                }
                label="Top Rated"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Subcategory</InputLabel>
                <MuiSelect
                  name="subcategorySlug"
                  value={productForm.subcategorySlug}
                  onChange={handleFormChange}
                  label="Subcategory"
                >
                  <MenuItem value="">Select Subcategory</MenuItem>
                  {filteredSubcategories.map((subcat) => (
                    <MenuItem key={subcat.id} value={subcat.slug}>
                      {subcat.name}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <Typography variant="subtitle1">Colors</Typography>
                <Select
                  isMulti
                  name="colors"
                  value={productForm.colors}
                  onChange={(selected) => setProductForm({ ...productForm, colors: selected })}
                  options={colors.map((color) => ({
                    value: color.id,
                    label: `${color.name} (${color.hex})`,
                    hex: color.hex,
                  }))}
                  getOptionLabel={(color) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          backgroundColor: color.hex,
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          display: 'inline-block',
                          marginRight: '10px',
                        }}
                      />
                      {color.label}
                    </div>
                  )}
                />
              </FormControl>
              {productForm.colors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Selected Colors</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {productForm.colors.map((color, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: color.hex,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            mr: 1,
                          }}
                        />
                        <Typography>{color.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              <FormControl fullWidth margin="normal">
                <Typography variant="subtitle1">Sizes</Typography>
                <Select
                  isMulti
                  name="sizes"
                  value={productForm.sizes}
                  onChange={(selected) => setProductForm({ ...productForm, sizes: selected })}
                  options={sizes.map((size) => ({ value: size.id, label: size.name }))}
                />
              </FormControl>
              <TextField
                label="Meta Title"
                name="meta_title"
                value={productForm.meta_title}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="Meta Description"
                name="meta_description"
                value={productForm.meta_description}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
              />
              <TextField
                label="Meta Keywords"
                name="meta_keywords"
                value={productForm.meta_keywords}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Images</Typography>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </Box>
              {existingImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Existing Images</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
                    {existingImages.map((img, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Image
                          width={120}
                          height={120}
                          src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${img}`}
                          alt={`Product Image ${index}`}
                          style={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          <DeleteIcon color="secondary" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {productForm.images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">New Images</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
                    {productForm.images.map((img, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Image
                          width={120}
                          height={120}
                          src={URL.createObjectURL(img)}
                          alt={`New Product Image ${index}`}
                          style={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <DeleteIcon color="secondary" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit} color="primary">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} color="primary" variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default FilterableTable;