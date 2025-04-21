import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import BlogForm from "../../components/admin/BlogForm";

const EditBlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <>
      <Helmet>
        <title>Editar Post - GT Ceuta Admin</title>
      </Helmet>
      <BlogForm />
    </>
  );
};

export default EditBlogPostPage;