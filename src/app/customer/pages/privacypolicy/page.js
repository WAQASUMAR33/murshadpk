'use client'
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

const PrivacyPolicy = () => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Privacy Policy data from API
    const fetchPolicyData = async () => {
      try {
        const response = await axios.get('/api/privacypolicy');
        if (response.data && response.data.length > 0) {
          setPolicyData(response.data[0]); // Assuming only one Privacy Policy record
        }
      } catch (error) {
        console.error('Error fetching Privacy Policy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, []);

  if (loading) {
    return <p className="text-center">Loading Privacy Policy...</p>;
  }

  return (
    <>
      <Head>
        <title>Privacy Policy - MurshadPk</title>
      </Head>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {policyData ? (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">{policyData.Title}</h1>
            <p className="text-sm text-gray-500 mb-4">Last Updated: {policyData.updatedAt ? new Date(policyData.updatedAt).toLocaleDateString() : 'N/A'}</p>
            <div dangerouslySetInnerHTML={{ __html: policyData.Text }} className="text-gray-800" />
          </>
        ) : (
          <p className="text-center">Privacy Policy content is unavailable.</p>
        )}
      </div>
    </>
  );
};

export default PrivacyPolicy;
