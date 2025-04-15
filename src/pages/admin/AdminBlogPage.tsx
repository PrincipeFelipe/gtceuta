import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../../components/admin/AdminLayout';
import BlogAdmin from '../../components/admin/BlogAdmin';

const AdminBlogPage: React.FC = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Administración del Blog - GT Ceuta</title>
      </Helmet>
      <BlogAdmin />
    </AdminLayout>
  );
};

export default AdminBlogPage;