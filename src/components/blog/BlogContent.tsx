import React from 'react';
import '../../styles/blog-content.css';
import '../../styles/tiptap.css'; // Añadimos los estilos de Tiptap

interface BlogContentProps {
  content: string;
  className?: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content, className = '' }) => {
  return (
    <div 
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default BlogContent;