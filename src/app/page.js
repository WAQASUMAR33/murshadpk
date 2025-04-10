'use client'
import React from 'react';
import TopCategories from './customer/components/TopCategories';
import Products from './customer/components/Products';
import Features from './customer/components/Features';
import Slider from './customer/components/Carousel';
import CategoryProductsComponent from './customer/components/CategoryProductsComponent';
import Customerlayout from './customer/layout';
import FaqSection from './customer/components/FaqSection';
import AllProducts from './customer/components/AllProducts';
import NewArrivals from './customer/components/NewArrivals';


export default function CustomerPage () {
  // const [formData, setFormData] = useState({});

  return (
    
    <Customerlayout>
    <div>
      <Slider/>
      <main className="p-4">
      <TopCategories/>
        <AllProducts/>
        {/* <CategoryProductsComponent/> */}
        <Products/>
        <Features/>
        <NewArrivals/>
        {/* <CategoryProductsComponent/> */}
        <FaqSection/>
      </main>
    </div>
    </Customerlayout>
  );
};
