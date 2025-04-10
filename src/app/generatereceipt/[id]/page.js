'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { MdDangerous } from "react-icons/md";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

export default function Invoice({ params }) {
    const id = params.id;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);
    const [description, setDescription] = useState('');
    const [transactionStatus, setTransactionStatus] = useState('');

    // Fetch order confirmation details
    useEffect(() => {
        const fetchOrderConfirmation = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://payments.bankalfalah.com/HS/api/IPN/OrderStatus/28951/040748/${id}`
                );

                let responseData = response.data;
                if (typeof responseData === "string") {
                    responseData = JSON.parse(responseData);
                }

                setDescription(responseData.Description);
                setTransactionStatus(responseData.TransactionStatus);
                setApiResponse(responseData);
            } catch (err) {
                console.error("Error fetching order confirmation:", err.message || err);
                setError("Failed to fetch order confirmation details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderConfirmation();
        }
    }, [id]);

    const sendOrderConfirmation = async (email, name, orderId, total, items, address, deliveryCharge, extraDeliveryCharge) => {
        try {
          // Ensure items is an array
          if (!Array.isArray(items)) {
            throw new Error('Items is not an array');
          }
    
          // Structure the items array to match the expected format in the backend
          const formattedItems = items.map(item => ({
            product: {
              name: item.product?.name || 'Unknown Product', // Ensure the product name exists
            },
            quantity: item.quantity || 1,
            price: item.price || 0,
          }));
    
          // Send the request to the backend API
          const response = await axios.post('/api/sendOrderConfirmation', {
            email,
            name,
            orderId,
            total,
            product: formattedItems, // Correctly structure the items array as "product"
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
    
    // Fetch order details based on transaction conditions
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (description === "Success" && transactionStatus === "Initiated") {
                    setLoading(true);
    
                    // Posting data as JSON
                    const response = await axios.post(
                        `/api/approvepayment`, 
                        {
                            orderId: id,
                            status: "PAID", // or any appropriate status
                        }
                    );
                    console.log("Approve Payment Response:", response.data);
    
                    if (response) {
                        const orderResponse = await axios.get(`/api/orders/${id}`);
                        setOrder(orderResponse.data);
                        console.log("Fetched order data ",orderResponse.data);
                        localStorage.removeItem('cart'); 
                        // Send order confirmation email
                        await sendOrderConfirmation(
                            orderResponse.data.email, // Email to send to
                            orderResponse.data.recipientName, // Customer's name
                            orderResponse.data.id, // Use order ID from backend response
                            orderResponse.data.total, // Total amount
                            orderResponse.data.orderItems, // Ordered items
                            orderResponse.data.streetAddress, // Shipping address details
                            orderResponse.data.deliveryCharge, // Delivery charge
                            orderResponse.data.extraDeliveryCharge // Extra delivery charge for COD
                        );
                    }
                } else if (description === "Success" && transactionStatus === "Failed") {
                    // Posting failed payment data as JSON
                    const response = await axios.post(
                        `/api/failedpayment`, 
                        {
                            orderId: id,
                            status: "PAYMENTFAILED",
                        }
                    );
                    console.log("Failed Payment Response:", response.data);
                }
            } catch (err) {
                console.error("Error fetching order details:", err.message || err);
                setError("Failed to fetch order details.");
            } finally {
                setLoading(false);
            }
        };
    
        if (description && transactionStatus) {
            fetchOrder();
        }
    }, [description, transactionStatus, id]);

    // Download invoice as PDF
    const handleDownload = () => {
        const element = document.getElementById("invoice");
        html2pdf().from(element).save("invoice.pdf");
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg font-semibold text-gray-700">Loading...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    // Payment failed condition
    if (description === "Success" && transactionStatus === "Failed") {
        return (
            <div className="h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-red-600 flex items-center gap-2">
                    <MdDangerous />
                    Your Payment has Failed
                </h1>
            </div>
        );
    }

    // Payment not initiated condition
    if (description === "Order Not Found") {
        return (
            <div className="h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-red-600 flex items-center gap-2">
                    <MdDangerous />
                    Payment is  initiated for your order
                </h1>
            </div>
        );
    }

    // Check if order is not fetched
    if (!order) return null;

    // Destructure order details
    const {
        recipientName,
        phoneNumber,
        streetAddress,
        city,
        state,
        zip,
        country,
        createdAt,
        orderItems,
        deliveryCharge,
        extraDeliveryCharge,
        discount,
        tax,
    } = order;

    // Calculate totals
    const subTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = (subTotal * discount) / 100;
    const taxAmount = ((subTotal - discountAmount) * tax) / 100;
    const finalTotal = subTotal - discountAmount + taxAmount + deliveryCharge + extraDeliveryCharge;

    return (
        <div className="bg-white w-full h-full flex flex-col justify-center items-center">
             <ToastContainer />
            {/* Invoice Content */}
            {description === "Success" && transactionStatus === "Initiated" && (
                <div>
                    <div className="w-[700px] mx-auto my-10 bg-white border border-gray-800 rounded-lg p-8" id="invoice">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <div>
                                <Image
                 width={1000}
                  height={1000}
                  placeholder="data:image/jpeg;base64,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"
           src="/logo.png" className="w-52" alt="Logo" />
                                <p className="text-sm text-gray-600">Date: {new Date(createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-[30px] font-bold text-blue-800">INVOICE</h2>
                            </div>
                        </div>

                        {/* Bill To Section */}
                        <div className="grid grid-cols-2 gap-8 mb-8 text-sm text-gray-700">
                            <div>
                                <h3 className="font-semibold">Bill from:</h3>
                                <p>MurshadPk</p>
                                <p>PO Chak No. 356/jb Khalsa Abad, Tehsil Gojra, District Toba Tek Singh, Punjab, Pakistan</p>
                                <p>+923310356111</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Bill to:</h3>
                                <p>{recipientName}</p>
                                <p>{`${streetAddress}, ${city}, ${state}, ${zip}, ${country}`}</p>
                                <p>{phoneNumber}</p>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full text-gray-700 mb-6 border-t">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2 font-semibold text-left">Item</th>
                                    <th className="p-2 font-semibold text-left">Quantity</th>
                                    <th className="p-2 font-semibold text-left">Rate</th>
                                    <th className="p-2 font-semibold text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2">{item.product.name}</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2">${item.price.toFixed(2)}</td>
                                        <td className="p-2">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="text-right">
                            <p>Subtotal: ${subTotal.toFixed(2)}</p>
                            <p>Discount: -${discountAmount.toFixed(2)}</p>
                            <p>Tax: ${taxAmount.toFixed(2)}</p>
                            <p>Delivery: ${deliveryCharge.toFixed(2)}</p>
                            <p className="font-bold text-blue-700">Total: ${finalTotal.toFixed(2)}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    >
                        Download Receipt
                    </button>
                </div>
            )}
        </div>
    );
}
