'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import BlogCategorySlider from './components/BlogSlider';
import Subscribe from './components/Subcribe';
import BlogSection from './components/Blogsection';

export default function Blog() {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState(6); // Initially show 6 blogs

  useEffect(() => {
    // Fetch blogs from API
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        setBlogs(data);
        setFeaturedPost(data[0]);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  const showMoreBlogs = () => {
    setVisibleBlogs((prev) => prev + 6); // Load 6 more blogs on button click
  };

  return (
    <div className="bg-white">
      <Head>
        <title>Blog Page</title>
      </Head>

      <div  className=' pt-8'>

      </div>
      <main className="container mx-auto px-4 py-4">
        <h1 className="text-4xl font-bold text-start">Blog Page</h1>

        {/* Blog Slider */}
        {blogs.length > 0 && <BlogCategorySlider category="Perfume" blogs={blogs} />}

        {/* Blog Posts Section */}
        <BlogPosts blogs={blogs.slice(0, visibleBlogs)} /> {/* Show only visible blogs */}

        {/* Show More Button */}
        {visibleBlogs < blogs.length && (
          <div className="text-center mt-8">
            <button
              onClick={showMoreBlogs}
              className="bg-[#06089B] text-white w-40 h-10 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Show More Blogs
            </button>
          </div>
        )}
      </main>

      {/* Blog Section & Subscribe */}
      <BlogSection blogs={blogs} title="Perfume" /> 
      <Subscribe /> 
    </div>
  );
}

/* Blog Posts Component */
function BlogPosts({ blogs }) {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-8">Latest Blog Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((post, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image Fix: Removed extra space, added fallback */}
            <Image
              width={1000}
              height={1000}
              // placeholder="blur"
              // blurDataURL="data:image/jpeg;base64,/9j/4AAQSk..." // Replace with actual base64 placeholder
               src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${post.image}`}
              alt={post.title || "Blog Image"}
              className="w-full h-48 object-cover"
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{post.createdAt}</span>
                <span className="text-sm bg-green-500 rounded-full px-2 py-1 text-white">{post.category}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              
              {/* Blog Description with 3-line limit */}
              <div
                className="text-gray-700 text-sm overflow-hidden text-ellipsis"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3, // Limit to 3 lines
                  WebkitBoxOrient: 'vertical',
                }}
                dangerouslySetInnerHTML={{ __html: post.description }}
              />

              <Link href={`/customer/pages/blog/${post.id}`} className="text-blue-600 hover:underline">
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
