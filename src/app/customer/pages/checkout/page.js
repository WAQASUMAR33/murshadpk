'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiUser, FiHome, FiMapPin, FiPhone, FiMail, FiTag } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutPage = () => {
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phoneNumber: '+92',
    email: ''
  });
  const [paymentMethod] = useState('Cash on Delivery'); // Fixed to COD only
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freelimitd, setFreelimitd] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [extraDeliveryCharge, setExtraDeliveryCharge] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
    setTotal(storedCart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0));

    fetchSettings();
    fetchExtraDeliveryCharge(); // Always fetch COD charge since it's the only payment method
  }, []);

  const validateForm = () => {
    const { recipientName, streetAddress, city, state, zip, country, phoneNumber, email } = shippingAddress;

    if (!recipientName || !streetAddress || !city || !state || !zip || !country || !phoneNumber || !email) {
      toast.error('Please fill in all the required fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    const phoneRegex = /^\+92\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number.');
      return false;
    }

    return true;
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`/api/settings/getSettings/1`);
      const { deliveryCharge, taxPercentage, other1,other2 } = response.data; // Assuming freelimitd is in other1
      setDeliveryCharge(deliveryCharge || 0);
      setTaxRate(taxPercentage / 100 || 0);
      setFreelimitd(other2 || 0); // Set freelimitd from other1
      console.log('Freelimitd set to:', other1); // Debug log to verify freelimitd
    } catch (error) {
      console.error('Error fetching settings:', error);
      setFreelimitd(0); // Default to 0 if fetch fails
    }
  };

  const fetchExtraDeliveryCharge = async () => {
    try {
      const response = await axios.get('/api/settings/getSettings/2');
      const { other1 } = response.data;
      setExtraDeliveryCharge(other1 || 0);
      console.log('Extra Delivery Charge set to:', other1); // Debug log
    } catch (error) {
      console.error('Error fetching extra delivery charge:', error);
      setExtraDeliveryCharge(0);
    }
  };

  const calculateTotal = () => {
    const subtotalAfterDiscount = total - discount;
    const tax = subtotalAfterDiscount * taxRate;

    console.log("the freelimitd  value is  : " + freelimitd);
    // Apply condition: If subtotal after discount >= freelimitd, delivery charge is 0
    const effectiveDeliveryCharge = subtotalAfterDiscount >= freelimitd ? 0 : deliveryCharge;

    // Always apply COD charge since payment method is fixed to COD
    const effectiveCodCharge = extraDeliveryCharge;

    return subtotalAfterDiscount + tax + effectiveDeliveryCharge + effectiveCodCharge;
  };

  // Input validation handlers
  const handleNameChange = (e) => {
    const { value } = e.target;
    const lettersOnly = /^[A-Za-z\s]*$/;
    if (lettersOnly.test(value)) {
      setShippingAddress(prevState => ({
        ...prevState,
        recipientName: value
      }));
    }
  };

  const handleApartmentSuiteChange = (e) => {
    const { value } = e.target;
    const digitsOnly = /^[0-9]*$/;
    if (digitsOnly.test(value)) {
      setShippingAddress(prevState => ({
        ...prevState,
        apartmentSuite: value
      }));
    }
  };

  const handleCityChange = (e) => {
    const { value } = e.target;
    const lettersOnly = /^[A-Za-z\s]*$/;
    if (lettersOnly.test(value)) {
      setShippingAddress(prevState => ({
        ...prevState,
        city: value
      }));
    }
  };

  const handleCountryChange = (e) => {
    const { value } = e.target;
    const lettersOnly = /^[A-Za-z\s]*$/;
    if (lettersOnly.test(value)) {
      setShippingAddress(prevState => ({
        ...prevState,
        country: value
      }));
    }
  };

  const handlePostalCodeChange = (e) => {
    const { value } = e.target;
    const alphanumeric = /^[A-Za-z0-9]*$/;
    if (alphanumeric.test(value)) {
      setShippingAddress(prevState => ({
        ...prevState,
        zip: value
      }));
    }
  };

  const handlePhoneChange = (e) => {
    let { value } = e.target;
    if (!value.startsWith('+92')) {
      value = '+92' + value.replace(/^\+?92/, '');
    }

    const phoneRegex = /^\+92\d{0,10}$/;
    if (phoneRegex.test(value)) {
      setShippingAddress(prevState => ({
        ...prevState,
        phoneNumber: value
      }));
    }
  };

  const handleEmailBlur = (e) => {
    const { value } = e.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value && !emailRegex.test(value)) {
      toast.error('Please enter a valid email address.');
      setShippingAddress(prevState => ({
        ...prevState,
        email: ''
      }));
    } else {
      setShippingAddress(prevState => ({
        ...prevState,
        email: value
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'state' || name === 'city' || name === 'country') {
      const lettersOnly = /^[A-Za-z\s]+$/;
      if (!lettersOnly.test(value)) {
        return;
      }
    }

    if (name === 'apartmentSuite') {
      const digitsOnly = /^\d+$/;
      if (!digitsOnly.test(value)) {
        return;
      }
    }

    if (name === 'zip') {
      const alphanumeric = /^[A-Za-z0-9]+$/;
      if (!alphanumeric.test(value)) {
        return;
      }
    }

    setShippingAddress(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const fetchProductNameById = async (id) => {
    try {
      const response = await axios.get(`/api/products/productname/${id}`);
      if (response.data && response.data.name) {
        return response.data.name;
      } else {
        return 'Unknown Product';
      }
    } catch (error) {
      console.error('Error fetching product name:', error);
      return 'Unknown Product';
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    let userId = null;
    let token = null;

    try {
      token = localStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.exp > Date.now() / 1000) {
          userId = decoded.id;
        } else {
          localStorage.removeItem('authToken');
          router.push('/customer/pages/login');
          return;
        }
      }

      const orderItems = await Promise.all(
        cart.map(async (item) => {
          const productName = await fetchProductNameById(item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: { name: productName }
          };
        })
      );

      const subtotalAfterDiscount = total - discount;
      const calculatedTax = subtotalAfterDiscount * taxRate;
      const effectiveDeliveryCharge = subtotalAfterDiscount >= freelimitd ? 0 : deliveryCharge;
      const effectiveCodCharge = extraDeliveryCharge; // Always applied since COD is only option
      const calculatedTotal = subtotalAfterDiscount + calculatedTax + effectiveDeliveryCharge + effectiveCodCharge;

      const orderDetails = {
        userId,
        shippingAddress,
        paymentMethod,
        items: orderItems,
        total: calculatedTotal,
        discount,
        tax: calculatedTax,
        netTotal: calculatedTotal,
        deliveryCharge: effectiveDeliveryCharge,
        extraDeliveryCharge: effectiveCodCharge,
        couponCode
      };

      const response = await axios.post('/api/orders', orderDetails);

      setIsModalOpen(true);
      localStorage.removeItem('cart');
      setCart([]);

      await sendOrderConfirmation(
        shippingAddress.email,
        shippingAddress.recipientName,
        response.data.data.id,
        calculatedTotal,
        orderItems,
        shippingAddress,
        effectiveDeliveryCharge,
        effectiveCodCharge
      );
      toast.success('Order placed Successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const sendOrderConfirmation = async (email, name, orderId, total, items, address, deliveryCharge, extraDeliveryCharge) => {
    try {
      if (!Array.isArray(items)) {
        throw new Error('Items is not an array');
      }

      const formattedItems = items.map(item => ({
        product: {
          name: item.product?.name || 'Unknown Product',
        },
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      await axios.post('/api/sendOrderConfirmation', {
        email,
        name,
        orderId,
        total,
        product: formattedItems,
        address,
        deliveryCharge,
        extraDeliveryCharge,
      });

      toast.success('Order confirmation email sent successfully!');
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      toast.error('Failed to send order confirmation email.');
    }
  };

  const handleApplyCoupon = async () => {
    try {
      const response = await axios.post('/api/coupons/validate', { code: couponCode });
      const data = response.data;

      if (data.valid) {
        const discountAmount = (total * data.discountPercentage) / 100;
        setDiscount(discountAmount);
        setCouponMessage(`Coupon applied! You get a discount of ${data.discountPercentage}% (Rs.${discountAmount.toFixed(2)})`);
      } else {
        setDiscount(0);
        setCouponMessage(data.message);
      }
    } catch (error) {
      setDiscount(0);
      setCouponMessage('Failed to validate coupon');
    }
  };

  return (
    <div className="container text-black bg-white mx-auto px-4 py-8">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6">Checkout</h2>
      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border p-4 h-[600px]">
            <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
            <div className="mb-4 relative">
              <FiUser className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="Recipient Name"
                name="recipientName"
                value={shippingAddress.recipientName}
                onChange={handleNameChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiHome className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="Street Address"
                name="streetAddress"
                value={shippingAddress.streetAddress}
                onChange={handleInputChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiHome className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="Apartment/Suite Number"
                name="apartmentSuite"
                value={shippingAddress.apartmentSuite}
                onChange={handleApartmentSuiteChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4 relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="City"
                name="city"
                value={shippingAddress.city}
                onChange={handleCityChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="State/Province/Region"
                name="state"
                value={shippingAddress.state}
                onChange={handleInputChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="Postal/ZIP Code"
                name="zip"
                value={shippingAddress.zip}
                onChange={handlePostalCodeChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="Country"
                name="country"
                value={shippingAddress.country}
                onChange={handleCountryChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiPhone className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="text"
                placeholder="Phone Number"
                name="phoneNumber"
                value={shippingAddress.phoneNumber}
                onChange={handlePhoneChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4 relative">
              <FiMail className="absolute left-3 top-3 text-gray-500 font-bold" />
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                onBlur={handleEmailBlur}
                value={shippingAddress.email}
                onChange={handleInputChange}
                className="w-full pl-10 px-4 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="border p-4">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <p className="text-md font-medium text-gray-700">Subtotal:</p>
                <p className="text-xl text-gray-700">Rs.{total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-md font-medium text-gray-700">Coupon Discount ({total > 0 ? ((discount / total) * 100).toFixed(2) : 0}%):</p>
                <p className="text-md text-gray-700"> Rs.{discount.toFixed(2)}</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <p className="text-md font-medium text-gray-700">Subtotal after Discount:</p>
                <p className="text-md text-gray-700">Rs.{(total - discount).toFixed(2)}</p>
              </div>
              {taxRate === 0 ? null : (
                <div className="flex justify-between">
                  <p className="text-md font-medium text-gray-700">Tax ({(taxRate * 100).toFixed(2)}%):</p>
                  <p className="text-md text-gray-700">Rs.{((total - discount) * taxRate).toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-md font-medium text-gray-700">
                  Delivery Charges {total - discount >= freelimitd ? '(Free)' : ''}:
                </p>
                <p className="text-md text-gray-700">
                  Rs.{total - discount >= freelimitd ? '0.00' : deliveryCharge.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-md font-medium text-gray-700">Cash On Delivery Charges:</p>
                <p className="text-md text-gray-700">Rs.{extraDeliveryCharge.toFixed(2)}</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <p className="text-xl font-bold text-gray-700">Total:</p>
                <p className="text-xl text-gray-700">Rs.{calculateTotal().toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Coupon Code</h2>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md pr-10"
                />
                <FiTag className="absolute right-3 text-gray-500 font-bold" />
              </div>
              <button type="button" className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4 w-full" onClick={handleApplyCoupon}>
                Apply Coupon
              </button>
              {couponMessage && (
                <p className="text-green-500 mt-2">{couponMessage}</p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center mb-4">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={true} // Always checked since it's the only option
                  readOnly // Prevents unchecking
                />
                <label htmlFor="cod" className="ml-2">Cash on Delivery</label>
              </div>
            </div>

            <button className="bg-teal-500 text-white py-2 px-4 rounded-md mt-4 w-full" type="submit">
              Place Order
            </button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Order Success"
        style={{
          overlay: {
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
          content: {
            zIndex: 10001,
            margin: 'auto',
            width: 'fit-content',
            height: 'fit-content',
            padding: '20px',
            textAlign: 'center'
          }
        }}
      >
        <div className="flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-12 h-12 text-green-500 mb-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m7-1a9 9 0 11-6-8.71" />
          </svg>
          <h2 className="text-xl font-semibold mb-4">Order Placed Successfully!</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-md"
            onClick={() => {
              setIsModalOpen(false);
              router.push('/');
            }}
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;