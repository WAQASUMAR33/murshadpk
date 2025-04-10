'use client'
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

const ReturnPolicy = () => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Return and Exchange Policy data from API
    const fetchPolicyData = async () => {
      try {
        const response = await axios.get('/api/returnandexchangepolicy');
        if (response.data && response.data.length > 0) {
          setPolicyData(response.data[0]); // Assuming there's only one return and exchange policy record
        }
      } catch (error) {
        console.error('Error fetching Return and Exchange Policy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, []);

  if (loading) {
    return <p className="text-center">Loading Return and Exchange Policy...</p>;
  }

  return (
    <>
      <Head>
        <title>Return and Exchange Policy - MurshadPk.com</title>
      </Head>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {policyData ? (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">{policyData.Title}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Last Updated: {policyData.updatedAt ? new Date(policyData.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
            <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: policyData.Text }} />
          </>
        ) : (
          <p className="text-center">Return and Exchange Policy content is unavailable.</p>
        )}
      </div>
    </>
  );
};

export default ReturnPolicy;
