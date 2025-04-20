import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import blogService, { BlogPost } from '../services/BlogService';
import OptimizedImage from '../components/OptimizedImage';
// Importar la función normalizeImageUrl
import { normalizeImageUrl } from '../utils/imageUtils';
// Importar los estilos del blog
import '../styles/blog-content.css';
// Importar el componente BlogContent
import BlogContent from '../components/blog/BlogContent';
// Importar SmartImage
import SmartImage from '../components/ui/SmartImage';

// Componente para mostrar el detalle del post de blog
const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          setError('URL inválida');
          return;
        }
        
        const postData = await blogService.getPostBySlug(slug);
        
        if (!postData) {
          setError('Post no encontrado');
          return;
        }
        
        setPost(postData);
      } catch (error) {
        console.error("Error al cargar el post:", error);
        setError('Error al cargar el post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Renderizado del autor usando los datos de Django
  const renderAuthor = () => {
    if (post?.author_name) {
      return post.author_name;
    }
    
    if (post?.author_details) {
      const { first_name, last_name, username } = post.author_details;
      if (first_name || last_name) {
        return `${first_name} ${last_name}`.trim();
      }
      return username;
    }
    
    return 'Administrador';
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
        <meta property="og:image" content={normalizeImageUrl(post.image)} />
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
          
          {post.image && post.image !== '/images/blog/default-post.jpg' && (
            <div className="mb-8">
              <SmartImage 
                src={post.image}
                alt={post.title}
                className="w-full max-h-[500px] object-cover rounded-lg"
                containerClassName="relative w-full max-h-[500px]"
                fallbackSrc="/images/blog/default-post.jpg"
              />
            </div>
          )}
          
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
            <p className="text-gray-400">{formatDate(post.date)}</p>
          </header>
          
          {/* Cambia esta parte para aplicar la clase blog-content */}
          <BlogContent content={post.content} />
          
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="text-xl font-bold mb-4">Comparte este artículo</h3>
            <div className="flex flex-wrap gap-4">
              {/* Cambiar Twitter por X */}
              <a 
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                X
              </a>

              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-md transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
                Facebook
              </a>

    

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Enlace copiado al portapapeles');
                }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
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
                    <SmartImage 
                      src={relatedPost.image} 
                      alt={relatedPost.title} 
                      className="w-full h-40 object-cover"
                      containerClassName="h-40"
                      fallbackSrc="/images/blog/default-post.jpg"
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