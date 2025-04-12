'use client';
import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiShoppingCart, FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, setCart } from '../../store/cartSlice';
import Image from 'next/image';

export default function WhatsAppButton() {
  const phoneNumber = '923356768338';
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  
const totalQuantityOfItems = cart.reduce((total, item) => total + item.quantity, 0);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [cartVisible, setCartVisible] = useState(false);

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=Hello%MurshadPk.com`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch(setCart(storedCart));
  }, [dispatch]);

  const updateItemQuantity = (itemId, quantity) => {
    let storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = storedCart.find(item => item.id === itemId);

    if (item) {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(storedCart));
      dispatch(updateQuantity({ id: itemId, quantity }));
    }
  };

  const handleRemoveFromCart = (itemId) => {
    let storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    storedCart = storedCart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(storedCart));
    dispatch(removeFromCart({ id: itemId }));
    alert(`Product removed from cart!`);
  };

  return (
    <>
      <div className="fixed bottom-4 text-black right-4 flex flex-col space-y-4 items-center z-50">
       
        <button
          onClick={() => setCartVisible(true)}
          className="bg-teal-500 text-white p-3 rounded-full shadow-lg">
          <FiShoppingCart className="h-6 w-6 " />
          {totalQuantityOfItems > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{totalQuantityOfItems}</span>
          )}
        </button>
       
        <div
          className="shadow-lg cursor-pointer flex items-center justify-center bg-green-500 p-2 rounded-full mb-4"
          onClick={handleClick}>
          <FaWhatsapp className="text-white w-6 h-6 md:w-8 md:h-8" />
        </div>
      </div>

      {cartVisible && (
        <div className="fixed md:h-full h-[80vh] overflow-y-auto md:m-0 m-4  inset-0 text-black bg-gray-900 bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full lg:w-1/3 h-full p-4 overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <button onClick={() => setCartVisible(false)}>
                <FiX className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-8">Your cart is empty</div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex items-center mb-4">
                  {item.images && item.images.length > 0 ? (
                    <Image
                 width={1000}
                  height={1000}
                  placeholder="data:image/jpeg;base64,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"
          
                      src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.images[0].url}`}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 mr-4">
                      No Image
                    </div>
                  )}
                  <div className="flex-grow">
                  <h3 className="text-md ">{item.name.toUpperCase()}</h3>

                    <p className="text-md font-medium text-gray-700">Rs.{item.price.toLocaleString()}</p>
                    <div className="flex items-center">
                      <button
                        className="bg-gray-300 text-gray-700 px-2 rounded-md"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        className="bg-gray-300 text-gray-700 px-2 rounded-md"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                  <button
                    className="bg-red-500 text-white py-1 px-2 rounded-md"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
            {cart.length > 0 && (
              <div className="mt-6">
                <p className="text-md font-medium text-gray-700">Subtotal: Rs.{total}</p>
                <a href='/customer/pages/cart'>
                <button
                  className="bg-teal-500 text-white py-2 px-4 rounded-md mt-4 w-full"
                >
                  View Cart
                </button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
