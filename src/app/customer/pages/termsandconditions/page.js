'use client'
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

const Terms = () => {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Terms and Conditions data from API
    const fetchTermsData = async () => {
      try {
        const response = await axios.get('/api/termsandconditions');
        if (response.data && response.data.length > 0) {
          setTermsData(response.data[0]); // Assume only one Terms and Conditions record
        }
      } catch (error) {
        console.error('Error fetching Terms and Conditions data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsData();
  }, []);

  if (loading) {
    return <p className="text-center">Loading Terms and Conditions...</p>;
  }

  return (
    <>
      <Head>
        <title>Terms and Conditions - murshadpk.com</title>
      </Head>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {termsData ? (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">{termsData.Title}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Last Updated: {termsData.updatedAt ? new Date(termsData.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
            <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: termsData.Text }} />
          </>
        ) : (
          <p className="text-center">Terms and Conditions content is unavailable.</p>
        )}
      </div>
    </>
  );
};

export default Terms;
