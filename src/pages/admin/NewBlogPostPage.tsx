import React from "react";
import { Helmet } from "react-helmet-async";
import BlogForm from "../../components/admin/BlogForm";

const NewBlogPostPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Nuevo Post - GT Ceuta Admin</title>
      </Helmet>
      <BlogForm />
    </>
  );
};

export default NewBlogPostPage;