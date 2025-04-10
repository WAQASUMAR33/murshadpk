'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [contactUsData, setContactUsData] = useState(null); // State to store "Contact Us" data
  const [contentLoading, setContentLoading] = useState(true); // Loading state for content fetch

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchContactUs = async () => {
      try {
        const response = await axios.get('/api/contactus');
        if (response.data && response.data.length > 0) {
          setContactUsData(response.data[0]); // Assuming only one "Contact Us" record
        }
      } catch (error) {
        console.error('Error fetching Contact Us data:', error);
      } finally {
        setContentLoading(false); // Content load complete
      }
    };

    fetchContactUs();
  }, []);

  return (
    <>
      {contactUsData ? (
        <>
          <Head>
            <title>{contactUsData.Title} - murshadpk.com</title>
            <meta name="description" content={contactUsData.description} />
          </Head>
          <div className="py-12 px-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center">{contactUsData.Title}</h1>
            <p className="mb-4 text-center">{contactUsData.description}</p>
            <div className="text-gray-800">
              <div className="text-lg" dangerouslySetInnerHTML={{ __html: contactUsData.Text }}></div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center">{contentLoading ? 'Loading Contact Us content...' : 'Failed to load content'}</p>
      )}

      <div className="py-8 px-10 max-w-lg mx-auto">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Form</h2>
          {success && <p className="text-green-500 mb-4">{success}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default Contact;
