// pages/about.js
'use client'
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

const About = () => {
  const [aboutData, setAboutData] = useState(null); // State to store about us data

  useEffect(() => {
    // Fetch About Us data from API
    const fetchAboutData = async () => {
      try {
        const response = await axios.get('/api/aboutus');
        if (response.data && response.data.length > 0) {
          setAboutData(response.data[0]); // Assume only one record exists
        }
      } catch (error) {
        console.error('Error fetching About Us data:', error);
      }
    };

    fetchAboutData();
  }, []);

  return (
    <>
    {(aboutData)?(<>
      <Head>
         <title>{aboutData.Title} - murshadpk.com</title>
          <meta name="description" content={`${aboutData.description}`} />
       
      </Head>
      <div className=" py-12 px-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">{aboutData.Title}</h1>
        <p className="mb-4 text-center">{aboutData.description}</p>

        
      
          <div className="text-gray-800">
          
            <div className="text-lg" dangerouslySetInnerHTML={{ __html: aboutData.Text }}></div>
          </div>
       
         
        
      </div>
      </>):( <p className="text-center">Loading About Us content...</p>)}
       
    </>
  );
};

export default About;
