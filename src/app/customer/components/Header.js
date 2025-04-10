'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { MdExpandMore } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
// import { setCart } from '@/app/store/cartSlice';
import { FaSearch } from 'react-icons/fa';
import Image from 'next/image';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]); // Add this state
  const [isMegaDropdownOpen, setIsMegaDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [totalQuantityOfItems, setTotalQuantityOfItems] = useState(0);

  
useEffect(() => {
  if (cartItems.length > 0) {
    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalQuantityOfItems(totalQuantity);
  }
}, [cartItems]);

  console.log("All cart items are: ",cartItems);
  // Refs for dropdowns
  const megaDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Fetch Categories and Subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        // Fetch categories
        const categoryResponse = await fetch('/api/categories');
        const categoriesData = await categoryResponse.json();

        if (categoriesData.status && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data); // Set categories from 'data'
        } else {
          console.error('Categories data is not an array:', categoriesData);
        }

        // Fetch all subcategories
        const subcategoryResponse = await fetch('/api/subcategories');
        const subcategoriesData = await subcategoryResponse.json();

        console.log('Subcategories data fetched:', subcategoriesData);

        if (subcategoriesData.status && Array.isArray(subcategoriesData.data)) {
          setSubcategories(subcategoriesData.data); // Set subcategories from 'data'
        } else {
          console.error('Subcategories data is not an array:', subcategoriesData);
        }
      } catch (error) {
        console.error('Error fetching categories and subcategories:', error);
        setCategories([]);
        setSubcategories([]);
      }
    };

    fetchCategoriesAndSubcategories();

    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }

    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch(setCart(storedCart));

    // Event listeners for closing dropdowns
    const handleClickOutsideMega = (event) => {
      if (
        megaDropdownRef.current &&
        !megaDropdownRef.current.contains(event.target) &&
        !event.target.closest('#department-button')
      ) {
        setIsMegaDropdownOpen(false);
      }
    };

    const handleClickOutsideProfile = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideMega);
    document.addEventListener('mousedown', handleClickOutsideProfile);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMega);
      document.removeEventListener('mousedown', handleClickOutsideProfile);
    };
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/'); // Redirect to the home page if the search query is empty
    } else {
      const searchPageUrl = `/customer/pages/allproducts?search=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      router.push(searchPageUrl);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleMegaDropdown = () => {
    setIsMegaDropdownOpen(!isMegaDropdownOpen);
  };

  const handleCategoryHover = (category) => {
    setHoveredCategory(category);
    
    // Filter subcategories by categorySlug
    const filteredSubcategories = subcategories.filter(
      (subcategory) => subcategory.categorySlug === category.slug
    );
    
    // Update the state with filtered subcategories
    setFilteredSubcategories(filteredSubcategories);

    setIsMegaDropdownOpen(true); // Open the mega dropdown
  };

  const handleCategoryClick = (categorySlug) => {
    router.push(`/customer/pages/category/${categorySlug}`);
    setIsMegaDropdownOpen(false);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };


  const handleSignOut = () => {
    // Clear the session token or any other authentication details
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setIsSignOutModalOpen(false);
  
    // Redirect the user to the login page
    router.push('/customer/pages/login');
  };


  const [companyName, setcompanyName]=useState('');
  const [companyHeaderImage, setcompanyHeaderImage]=useState('');
  const [companyicon, setcompanyicon]=useState('');

  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await fetch('/api/companydetails');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched company data:", data);
  
        if (data) {
          setcompanyName(data.name);
          setcompanyHeaderImage(data.headerImage);
          setcompanyicon("/login.png");
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    }
    fetchCompanyDetails();
  }, []);

  return (
    <header className="bg-white py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <Link href="/">
            <Image
                 width={1000}
                  height={1000}
               
              src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${companyHeaderImage}`}
              alt="Logo"
              className="h-10 w-36 cursor-pointer object-contain"
            />
            
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden">
          <button
            className="text-gray-700 hover:text-blue-500 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex lg:items-center lg:justify-between lg:space-x-8">
          <div className="flex flex-col text-black lg:flex-row text-xs lg:text-[16px] text-center lg:space-x-6">
            {/* Department Button */}
            <div className="relative">
              <button
                id="department-button"
                onClick={toggleMegaDropdown}
                className="text-gray-700 hover:text-blue-500 transition-colors duration-300 py-2 lg:py-0 flex items-center"
              >
                Departments <MdExpandMore />
              </button>
              {isMegaDropdownOpen && (
                <div
                  ref={megaDropdownRef}
                  className="absolute left-0 top-full mt-2 w-[500px] bg-white shadow-lg z-50 grid grid-cols-2"
                  onMouseLeave={handleCategoryLeave}
                >
                  {/* First Column: Categories */}
                  <div className="p-4 bg-white">
                    {categories.map((category) => (
                      <div
                        key={category.slug}
                        className="text-gray-700 hover:text-blue-500 py-2 cursor-pointer flex items-center space-x-2"
                        onMouseEnter={() => handleCategoryHover(category)}
                        onClick={() => handleCategoryClick(category.slug)}
                      >
                        {/* Category Image */}
                        {category.imageUrl && (
                          <Image
                 width={1000}
                  height={1000}
                 
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${category.imageUrl}`}
                            alt={category.name}
                            className="w-8 h-8 object-cover rounded-full"
                          />
                        )}
                        {/* Category Name */}
                        <span>{category.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Second Column: Subcategories */}
                  
                </div>
              )}
            </div>

            {/* Show First 5 Categories */}
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.slug}
                href={`/customer/pages/category/${category.slug}`}
                className="relative group text-gray-700 transition-colors duration-300 py-2 lg:py-0"
              >
                {category.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>

            ))}
            <Link
                
                href={`/customer/pages/blog`}
                className="relative group text-gray-700 transition-colors duration-300 py-2 lg:py-0"
              >Blog</Link>
          </div>
        </nav>

        {/* Search, Cart, and Profile */}
        <div className="hidden lg:flex items-center space-x-4 lg:space-x-6 mt-4 lg:mt-0">
          {/* Search Form */}
          <form className="relative flex" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Items"
              className="border rounded-full py-1 px-3 text-[16px] w-48 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-gray-700 hover:text-blue-500 text-[18px]"
            >
              <FaSearch />
            </button>
          </form>

          {/* Shopping Cart */}
          <div className="relative flex">
            <Link href="/customer/pages/cart">
              <FiShoppingCart className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors duration-300 text-[24px]" />
              {totalQuantityOfItems > 0 && (
                <span className="absolute top-[-16px] right-[-12px] h-5 w-5 flex justify-center items-center bg-red-500 text-white rounded-full text-[14px] font-bold">
                  {totalQuantityOfItems}
                </span>
              )}
              
            </Link>
          </div>

          {/* Profile Icon */}
          {authToken ? (
            <div className="relative">
              <div ref={profileButtonRef}>
                <FiUser
                  className="w-6 h-6 text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
              </div>

              {/* Dropdown for profile options */}
              {isDropdownOpen && (
                <div
                  ref={profileDropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg p-2 z-50"
                >
                  <Link
                    href="/customer/pages/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/customer/pages/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center">
              <Link
                href="/customer/pages/login"
                className="text-gray-700 text-[16px] mr-2 hover:text-blue-500 transition-colors duration-300"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 w-full bg-white shadow-lg z-50">
          {/* Search bar at the top */}
          <div className="p-4 border-b">
            <form className="relative flex" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search Items"
                className="border rounded-full py-1 px-3 text-[14px] w-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 text-gray-700 hover:text-blue-500"
              >
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Categories and More Button */}
          <nav className="flex flex-col space-y-2 items-center p-4">
            {categories.slice(0, 5).map((category) => (
              <div
                key={category.slug}
                className="text-gray-700 hover:text-blue-500 py-2 cursor-pointer"
                onClick={() => handleCategoryClick(category.slug)}
              >
                {category.name}
              </div>
            ))}
            {categories.length > 5 && (
              <button
                className="text-blue-500 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Show More
              </button>
            )}

            {authToken && (
              <div
                className="text-gray-700 hover:text-blue-500 py-2 cursor-pointer"
                onClick={() => router.push('/customer/pages/orders')}
              >
                My Orders
              </div>
            )}

            {authToken ? (
              <div
                className="text-gray-700 hover:text-blue-500 py-2 cursor-pointer"
                onClick={handleSignOut}
              >
                Log Out
              </div>
            ) : (
              <Link
                href="/customer/pages/login"
                className="text-gray-700 hover:text-blue-500 py-2"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Sign-out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Sign Out</h2>
            <p>Are you sure you want to sign out?</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setIsSignOutModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userName');
                  setAuthToken(null);
                  setIsSignOutModalOpen(false);
                  router.push('/customer/pages/login');
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
