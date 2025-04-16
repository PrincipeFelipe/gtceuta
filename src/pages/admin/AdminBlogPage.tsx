import React from 'react';
import { Helmet } from 'react-helmet-async';
import BlogAdmin from '../../components/admin/BlogAdmin';

const AdminBlogPage: React.FC = () => {
  console.log("Rendering AdminBlogPage");
  
  return (
    <div>
      <BlogAdmin />
    </div>
  );
};

export default AdminBlogPage;