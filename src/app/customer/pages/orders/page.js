'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ThreeDots } from 'react-loader-spinner';
import { EyeIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You need to log in to view your orders');
        router.push('/customer/pages/login');
        return;
      }

      try {
        const response = await axios.get('/api/orders/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'CANCELLED') return;

    try {
      setLoading(true);
      const response = await axios.put(`/api/orders/${selectedOrder.id}`, {
        id: selectedOrder.id,
        status: 'CANCELLED',
      });

      if (response.status === 200) {
        setOrders((prevOrders) => prevOrders.map(order => order.id === selectedOrder.id ? { ...order, status: 'CANCELLED' } : order));
        setSelectedOrder((prevOrder) => ({ ...prevOrder, status: 'CANCELLED' }));
        setIsConfirmModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDots
          height={80}
          width={80}
          color="#3498db"
          ariaLabel="circle-loading"
          visible={true}
        />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const statusClasses = {
    PENDING: 'bg-gray-300 text-gray-700',
    PAID: 'bg-gray-300 text-gray-700',
    SHIPPED: 'bg-gray-300 text-gray-700',
    COMPLETED: 'bg-gray-300 text-gray-700',
    CANCELLED: 'bg-gray-300 text-gray-700',
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow rounded-lg p-4">
        <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <p className="text-center">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const subtotal = order.orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
                  const subtotalLessDiscount = subtotal - (order.discount ?? 0);
                  const totalTax = subtotalLessDiscount * (order.tax ?? 0);
                  const total = subtotalLessDiscount + totalTax + (order.deliveryCharge ?? 0) + (order.extraDeliveryCharge ?? 0);

                  const productNames = (
                    <ul className="list-disc list-inside">
                      {order.orderItems.map(item => (
                        <li key={item.id} className="text-gray-700">{item.product.name}</li>
                      ))}
                    </ul>
                  );
                  
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderItems.map(item => (
                          <li key={item.id} className="text-gray-700">{item.product.name.toUpperCase()}</li>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs.{total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                        >
                          <EyeIcon className="h-5 w-5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl h-[90vh] w-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details - #{selectedOrder.id}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="mb-2"><strong>Status:</strong> {selectedOrder.status}</p>
              <p className="mb-2"><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              <h3 className="font-semibold mt-4">Items:</h3>
              <div className="flex flex-col gap-4">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="bg-white flex items-start justify-between p-4 border-b border-gray-300">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                 width={1000}
                  height={1000}
                  placeholder="data:image/jpeg;base64,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"
          
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.product.images[0].url}`}
                        alt={item.product.name}
                        className="h-20 w-20 object-cover rounded mr-4"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 mr-4">
                        No Image
                      </div>
                    )}
                    <div className="flex-grow pr-4">
                      <div className="flex justify-between items-center w-full">
                        <h3 className="text-md font-semibold text-gray-600">{item.product.name.toUpperCase()}</h3>
                        <p className="text-md font-bold text-gray-600">Rs.{item.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                      <p className="text-sm font-normal text-gray-600">Size: {item.selectedSize || 'N/A'}</p>
                      <p className="text-sm font-normal text-gray-600">Color: {item.selectedColor || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                {(() => {
                  const subtotal = selectedOrder.orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
                  const subtotalLessDiscount = subtotal - (selectedOrder.discount ?? 0);
                  const totalTax = subtotalLessDiscount * (selectedOrder.tax ?? 0);
                  const total = subtotalLessDiscount + totalTax + (selectedOrder.deliveryCharge ?? 0) + (selectedOrder.extraDeliveryCharge ?? 0);

                  return (
                    <>
                      <div className="flex justify-between">
                        <p className="text-md font-medium text-gray-700">Subtotal:</p>
                        <p className="text-xl text-gray-700">Rs.{subtotalLessDiscount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-md font-medium text-gray-700">Delivery Charges:</p>
                        <p className="text-md text-gray-700">Rs.{(selectedOrder.deliveryCharge ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-md font-medium text-gray-700">Cash on Delivery Charge:</p>
                        <p className="text-md text-gray-700">Rs.{(selectedOrder.extraDeliveryCharge ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between mt-4">
                        <p className="text-xl font-bold text-gray-700">Total:</p>
                        <p className="text-xl text-gray-700">Rs.{total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>


                      <h3 className="font-semibold mt-4">Shipping Details:</h3>

                      <div className="flex justify-between">
                        <p className="text-md font-medium text-gray-700">Shipping Method:</p>
                        <p className="text-xl text-gray-700">{selectedOrder.shippingMethod}</p>
                      </div>
                      
                      <div className="flex justify-between">
                        <p className="text-md font-medium text-gray-700">Shipping Details:</p>
                        <p className="text-md text-gray-700">{selectedOrder.shippingTerms }</p>
                      </div>


                      <div className="flex justify-between">
                        <p className="text-md font-medium text-gray-700">Shipment Date:</p>
                        <p className="text-md text-gray-700">{new Date(selectedOrder.shipmentDate).toLocaleDateString()}</p>
                      </div>

                      <hr className="my-2" />
                      <div className="flex justify-between mt-4">
                        <p className="text-xl font-bold text-gray-700">Delivery Date:</p>
                        <p className="text-xl text-gray-700">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                      </div>

                    </>
                  );
                })()}
              </div>
              {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PAID') && (
                <div className="mt-4">
                  <button
                    onClick={handleConfirmCancel}
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to cancel this order?</h3>
            <div className="flex justify-end space-x-4">
              <button onClick={closeConfirmModal} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md">No</button>
              <button onClick={handleCancelOrder} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">Your order has been canceled successfully.</h3>
            <button onClick={closeSuccessModal} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
