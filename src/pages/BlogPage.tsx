import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import blogService, { BlogPost } from '../services/BlogService';

// Categorías para filtrado
const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'guias', name: 'Guías y tutoriales' },
  { id: 'torneos', name: 'Torneos' },
  { id: 'ceuta', name: 'Ceuta' },
  { id: 'estrategia', name: 'Estrategia' }
];

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const allPosts = await blogService.getAllPosts({ onlyPublished: true });
        setPosts(allPosts);
      } catch (error) {
        console.error('Error al cargar posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filtrar los posts basados en la búsqueda y categoría
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Formatear fecha para mostrar en español
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Layout>
      <Helmet>
        <title>Blog - I GT de Ceuta - Warhammer 40.000</title>
        <meta name="description" content="Artículos y noticias sobre el Gran Torneo de Warhammer 40.000 en Ceuta y el mundo del hobby. Estrategias, consejos y más." />
        <meta name="keywords" content="blog Warhammer 40k, artículos torneo, estrategias 40k, guías Warhammer, consejo ejércitos" />
        <link rel="canonical" href="https://gtceuta.com/blog" />
        <meta property="og:title" content="Blog - I GT de Ceuta - Warhammer 40.000" />
        <meta property="og:description" content="Artículos y noticias sobre Warhammer 40.000. Estrategias, consejos y más." />
        <meta property="og:url" content="https://gtceuta.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 text-red-600">Blog</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Artículos, guías y noticias sobre el I GT de Ceuta y el universo de Warhammer 40.000.
              Todo lo que necesitas saber sobre torneos, estrategias y consejos para mejorar tu juego.
            </p>
            
            {/* Barra de búsqueda y filtros */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar artículos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                
                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista de posts */}
          {loading ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <p className="text-xl text-gray-300">Cargando artículos...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <p className="text-xl text-gray-300">No se encontraron artículos que coincidan con tu búsqueda.</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory('todos');}}
                className="mt-4 text-red-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-gray-900 rounded-lg overflow-hidden transition-transform hover:transform hover:scale-[1.02]">
                  <Link to={`/blog/${post.slug}`}>
                    <OptimizedImage 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-48 object-cover" 
                    />
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-bold mb-3 hover:text-red-600 transition-colors">{post.title}</h2>
                    </Link>
                    <p className="text-gray-400 mb-4">{post.excerpt}</p>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-red-600 hover:underline"
                    >
                      Leer artículo completo <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {/* Enlaces relacionados */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8 text-white text-center">Enlaces relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/sobre-el-torneo" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
                <h3 className="text-xl font-bold mb-2">Sobre el torneo</h3>
                <p className="text-gray-400">Conoce todos los detalles del I GT de Ceuta: formato, reglas y más.</p>
              </Link>
              
              <Link to="/faq" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
                <h3 className="text-xl font-bold mb-2">Preguntas frecuentes</h3>
                <p className="text-gray-400">Resuelve tus dudas sobre inscripción, reglas y logística del evento.</p>
              </Link>
              
              <Link to="/contacto" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
                <h3 className="text-xl font-bold mb-2">Contacto</h3>
                <p className="text-gray-400">¿Tienes alguna pregunta? Ponte en contacto con los organizadores.</p>
              </Link>
            </div>
          </div>
          
          {/* CTA de inscripción */}
          <div className="mt-20 bg-gradient-to-r from-red-900 to-red-700 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">¿Listo para participar en el I GT de Ceuta?</h2>
            <p className="text-white mb-6">Asegura tu plaza en el primer Gran Torneo oficial de Warhammer 40.000 en Ceuta.</p>
            <Link 
              to="/inscripcion" 
              className="inline-block bg-white text-red-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Inscríbete ahora
            </Link>
          </div>
        </div>
      </div>
      
      {/* Schema.org para Blog - Mejora SEO */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog del I GT de Ceuta - Warhammer 40.000",
            "description": "Artículos y noticias sobre el Gran Torneo de Warhammer 40.000 en Ceuta y el mundo del hobby.",
            "url": "https://gtceuta.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "GT Ceuta - Organizadores",
              "logo": {
                "@type": "ImageObject",
                "url": "https://gtceuta.com/images/logo.png"
              }
            },
            "blogPost": [
              ${posts.map(post => `{
                "@type": "BlogPosting",
                "headline": "${post.title}",
                "description": "${post.excerpt}",
                "datePublished": "${post.date}",
                "url": "https://gtceuta.com/blog/${post.slug}",
                "image": {
                  "@type": "ImageObject",
                  "url": "https://gtceuta.com${post.image}"
                }
              }`).join(',')}
            ]
          }
        `}
      </script>
    </Layout>
  );
};

export default BlogPage;