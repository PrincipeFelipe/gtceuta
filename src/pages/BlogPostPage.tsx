import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';
import blogService, { BlogPost } from '../services/BlogService';
// Importar los estilos del blog
import '../styles/blog-content.css';
// Importar el componente BlogContent
import BlogContent from '../components/blog/BlogContent';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        if (!slug) {
          navigate('/blog');
          return;
        }
        
        const foundPost = await blogService.getPostBySlug(slug);
        
        if (!foundPost) {
          navigate('/blog');
          return;
        }
        
        setPost(foundPost);
        
        // Cargar posts relacionados
        const related = await blogService.getRelatedPosts(foundPost.id, 2);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error al cargar el post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [slug, navigate]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!post) return null;
  
  return (
    <Layout>
      <Helmet>
        <title>{post.title} - I GT de Ceuta - Warhammer 40.000</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
      </Helmet>
      
      <div className="bg-gradient-to-b from-gray-900 to-black py-16 px-4">
        <article className="max-w-4xl mx-auto">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-gray-400 hover:text-red-500 mb-6 transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Volver al blog
          </Link>
          
          <div className="mb-8">
            <OptimizedImage 
              src={post.image} 
              alt={post.title} 
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
            <p className="text-gray-400">{formatDate(post.date)}</p>
          </header>
          
          {/* Cambia esta parte para aplicar la clase blog-content */}
          <BlogContent content={post.content} />
          
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="text-xl font-bold mb-4">Comparte este artículo</h3>
            <div className="flex space-x-4">
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Twitter
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Facebook
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Enlace copiado al portapapeles');
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Copiar enlace
              </button>
            </div>
          </div>
          
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Artículos relacionados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <OptimizedImage 
                      src={relatedPost.image} 
                      alt={relatedPost.title} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{relatedPost.title}</h4>
                      <p className="text-gray-400 text-sm mb-4">{formatDate(relatedPost.date)}</p>
                      <Link 
                        to={`/blog/${relatedPost.slug}`} 
                        className="text-red-500 hover:text-red-400"
                      >
                        Leer artículo
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </Layout>
  );
};

export default BlogPostPage;