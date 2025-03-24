'use client';

import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children, setActiveComponent }) => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar with fixed width */}
      <div className="w-58 bg-gray-800">
        <Sidebar setActiveComponent={setActiveComponent} />
      </div>

      {/* Main content area */}
      <div className="flex flex-col w-[800px] flex-grow">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
