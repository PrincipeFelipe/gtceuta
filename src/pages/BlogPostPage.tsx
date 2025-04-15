import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';

// Importa los datos de los posts
const blogPosts = [
  // Usa los mismos posts que definimos en BlogPage.tsx
  {
    id: 1,
    slug: 'preparacion-primer-torneo-warhammer-40k',
    title: 'Preparando tu primera participación en un Gran Torneo de Warhammer 40k',
    date: '15 de marzo, 2025',
    excerpt: 'Consejos y recomendaciones para jugadores que participan por primera vez en un torneo oficial de Warhammer 40.000. Desde la preparación de listas hasta consejos logísticos.',
    image: '/images/blog/blog01.jpg',
    content: `
      <p>Participar por primera vez en un torneo oficial de Warhammer 40.000 puede ser una experiencia intimidante. Desde la preparación de tu lista de ejército hasta la logística del evento, hay muchos aspectos que considerar para asegurar que tu primera experiencia competitiva sea positiva.</p>
      
      <h2>Preparando tu lista de ejército</h2>
      <p>Lo primero que debes considerar es qué ejército llevarás al torneo. Si es tu primera experiencia competitiva, te recomendamos que juegues con un ejército que conozcas bien, incluso si no es el más fuerte en el meta actual.</p>
      
      <p>Algunos consejos para la creación de tu lista:</p>
      <ul>
        <li>Estudia el paquete de misiones que se utilizará en el torneo</li>
        <li>Asegúrate de incluir unidades que puedan cumplir objetivos secundarios</li>
        <li>Equilibra tu lista entre capacidad ofensiva y defensiva</li>
        <li>No te obsesiones con las listas más competitivas si no te sientes cómodo con ellas</li>
      </ul>
      
      <h2>Preparación física de tu ejército</h2>
      <p>La presentación de tu ejército es importante en los torneos oficiales. Asegúrate de que:</p>
      <ul>
        <li>Todas tus miniaturas estén completamente pintadas (mínimo 3 colores)</li>
        <li>Las bases estén terminadas</li>
        <li>Todas las conversiones sean fácilmente identificables</li>
        <li>Tengas una forma organizada de transportar tus miniaturas</li>
      </ul>
      
      <h2>Materiales necesarios para el torneo</h2>
      <p>No olvides llevar contigo:</p>
      <ul>
        <li>Varias copias impresas de tu lista de ejército</li>
        <li>Libro de reglas y codex de tu facción (físico o digital)</li>
        <li>Dados, cintas métricas y marcadores</li>
        <li>Hojas de referencia rápida</li>
        <li>Agua y snacks (los torneos pueden ser agotadores)</li>
      </ul>
      
      <h2>Mentalidad y comportamiento</h2>
      <p>Lo más importante para disfrutar de tu primera experiencia competitiva es mantener una actitud positiva:</p>
      <ul>
        <li>Recuerda que el objetivo principal es divertirse</li>
        <li>No te frustres con los resultados; considera cada partida como una oportunidad de aprendizaje</li>
        <li>Sé cordial y respetuoso con todos los oponentes</li>
        <li>No dudes en pedir aclaraciones sobre reglas si no estás seguro</li>
      </ul>
      
      <p>Siguiendo estos consejos básicos, tu primera experiencia en un Gran Torneo de Warhammer 40.000 será mucho más positiva. Y recuerda, incluso los jugadores más experimentados han sido principiantes alguna vez.</p>
      
      <p>¡Te esperamos en el I GT de Ceuta para vivir juntos una gran experiencia competitiva!</p>
    `
  },
  // Añade aquí el resto de posts...
];

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Encontrar el post por slug
  const post = blogPosts.find(p => p.slug === slug);
  
  // Si no existe el post, redireccionar al blog
  React.useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
  }, [post, navigate]);
  
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
        <meta property="article:published_time" content="2025-03-15T00:00:00+00:00" />
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
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-80 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/hero-bg.jpg";
              }}
            />
          </div>
          
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
            <p className="text-gray-400">{post.date}</p>
          </header>
          
          <div 
            className="prose prose-lg prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
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
          
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Artículos relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts
                .filter(p => p.id !== post.id)
                .slice(0, 2)
                .map(relatedPost => (
                  <div key={relatedPost.id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title} 
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/hero-bg.jpg";
                      }}
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{relatedPost.title}</h4>
                      <p className="text-gray-400 text-sm mb-4">{relatedPost.date}</p>
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
        </article>
      </div>
    </Layout>
  );
};

export default BlogPostPage;