import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { Search, Calendar, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    slug: 'preparacion-primer-torneo-warhammer-40k',
    title: 'Preparando tu primera participación en un Gran Torneo de Warhammer 40k',
    date: '15 de marzo, 2025',
    excerpt: 'Consejos y recomendaciones para jugadores que participan por primera vez en un torneo oficial de Warhammer 40.000. Desde la preparación de listas hasta consejos logísticos.',
    image: '/images/blog/blog-1.jpg',
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
  {
    id: 2,
    slug: 'estrategias-meta-actual-warhammer-40k',
    title: 'Estrategias para el meta actual de Warhammer 40k',
    date: '2 de abril, 2025',
    excerpt: 'Análisis detallado del meta actual del juego, tendencias en listas de ejércitos y tácticas para contrarrestar las estrategias más populares en torneos oficiales.',
    image: '/images/blog/blog-2.jpg',
    content: `
      <p>El meta de Warhammer 40.000 evoluciona constantemente con cada actualización de reglas, FAQ y lanzamiento de nuevos codex. En este artículo, analizaremos las tendencias actuales y cómo prepararte para el I GT de Ceuta.</p>
      
      <h2>Estado actual del meta de Warhammer 40k</h2>
      <p>Después de las últimas actualizaciones, estamos viendo un meta bastante diverso, con varias facciones compitiendo por los primeros puestos en grandes torneos. Las facciones que están destacando actualmente son:</p>
      
      <h3>Space Marines</h3>
      <p>Los Space Marines siguen siendo una opción sólida, especialmente con las siguientes subfacciones:</p>
      <ul>
        <li>Blood Angels: Su capacidad de asalto rápido y bonificadores al daño en combate cuerpo a cuerpo los hace letales.</li>
        <li>Iron Hands: Su resistencia aumentada y sinergia con vehículos los convierte en una fuerza difícil de eliminar.</li>
        <li>Black Templars: Sus reglas especiales contra psíquicos y fuerte presencia en asalto los hace destacar.</li>
      </ul>
      
      <h3>Aeldari</h3>
      <p>Los Aeldari están mostrando excelentes resultados con listas que combinan:</p>
      <ul>
        <li>Alta movilidad para control de objetivos</li>
        <li>Psíquicos poderosos</li>
        <li>Armas de alta capacidad de daño</li>
      </ul>
      
      <h3>Tyranids</h3>
      <p>Los Tyranids han encontrado su lugar en el meta con listas que aprovechan:</p>
      <ul>
        <li>Monstruos grandes con alta resistencia</li>
        <li>Hordas de criaturas pequeñas para control de objetivos</li>
        <li>Sinergias con reglas de enjambre</li>
      </ul>
      
      <h2>Estrategias contra los ejércitos meta</h2>
      <p>Para enfrentarte a estos ejércitos populares, considera las siguientes tácticas:</p>
      
      <h3>Contra Space Marines</h3>
      <ul>
        <li>Armas de alto volumen de disparos para superar su resistencia</li>
        <li>Control de distancia contra Blood Angels</li>
        <li>Armas anti-vehículo contra Iron Hands</li>
      </ul>
      
      <h3>Contra Aeldari</h3>
      <ul>
        <li>Negar su movilidad con unidades rápidas propias</li>
        <li>Eliminar sus psíquicos clave rápidamente</li>
        <li>Utilizar armas con alta cadencia de fuego contra sus unidades frágiles</li>
      </ul>
      
      <h3>Contra Tyranids</h3>
      <ul>
        <li>Armas anti-monstruo para sus grandes criaturas</li>
        <li>Armas de área para sus hordas</li>
        <li>Controlar objetivos clave desde el principio</li>
      </ul>
      
      <h2>Preparando tu lista para el GT de Ceuta</h2>
      <p>Al preparar tu lista para nuestro torneo, considera estos aspectos:</p>
      <ul>
        <li>Equilibrio entre unidades especializadas y versátiles</li>
        <li>Capacidad para enfrentar diversos tipos de ejércitos</li>
        <li>Estrategias secundarias consistentes</li>
        <li>Práctica, práctica y más práctica con tu lista antes del evento</li>
      </ul>
      
      <p>Recuerda que el meta puede cambiar antes del torneo, así que mantente al día con las últimas actualizaciones y FAQ que Games Workshop publique. En el GT de Ceuta estaremos utilizando las reglas y balances más recientes disponibles.</p>
    `
  },
  {
    id: 3,
    slug: 'descubriendo-ceuta-guia-visitantes',
    title: 'Descubriendo Ceuta: Guía para visitantes del Gran Torneo',
    date: '10 de abril, 2025',
    excerpt: 'Todo lo que necesitas saber para tu visita a Ceuta durante el torneo: alojamientos, restaurantes, lugares de interés y consejos prácticos para aprovechar al máximo tu estancia.',
    image: '/images/blog/blog-3.jpg',
    content: `
      <p>Si vienes al I GT de Ceuta desde fuera de la ciudad, esta guía te ayudará a organizar tu viaje y hacer que tu estancia sea lo más agradable posible.</p>
      
      <h2>Cómo llegar a Ceuta</h2>
      <p>Ceuta es una ciudad española ubicada en el norte de África. Las principales formas de llegar son:</p>
      
      <h3>En ferry desde Algeciras</h3>
      <p>La opción más común es tomar un ferry desde Algeciras. Hay varias compañías que operan esta ruta:</p>
      <ul>
        <li>Baleària: Varios viajes diarios con una duración aproximada de 1 hora.</li>
        <li>Trasmediterránea: También ofrece varios horarios con duración similar.</li>
        <li>FRS: Otra alternativa con horarios regulares.</li>
      </ul>
      <p>Recomendamos reservar con antelación, especialmente si viajas con vehículo.</p>
      
      <h3>En avión</h3>
      <p>Ceuta cuenta con un helipuerto con conexiones a Málaga y Algeciras. Es una opción más rápida pero también más limitada en horarios y plazas.</p>
      
      <h2>Alojamiento</h2>
      <p>Para el I GT de Ceuta, hemos llegado a acuerdos con varios hoteles que ofrecen precios especiales para los participantes:</p>
      
      <h3>Hoteles recomendados</h3>
      <ul>
        <li>Hotel Ulises: Céntrico y con vistas al mar. Menciona el código "GTCEUTA" para obtener un 15% de descuento.</li>
        <li>Parador de Ceuta: Ubicado en un entorno privilegiado. 10% de descuento para participantes.</li>
        <li>Hotel Tryp Ceuta: Moderno y bien ubicado, con 12% de descuento para el evento.</li>
      </ul>
      
      <h2>Restaurantes y gastronomía</h2>
      <p>Ceuta ofrece una rica variedad gastronómica que combina influencias españolas, marroquíes y mediterráneas. Algunos restaurantes recomendados:</p>
      <ul>
        <li>El Refectorio: Cocina tradicional española con toques modernos.</li>
        <li>La Muralla: Especializado en pescados y mariscos frescos.</li>
        <li>Oasis: Cocina marroquí auténtica en un ambiente tradicional.</li>
        <li>El Secreto: Tapas variadas y platos para compartir.</li>
      </ul>
      
      <h2>Qué visitar en Ceuta</h2>
      <p>Si dispones de tiempo antes o después del torneo, no te pierdas estos lugares de interés:</p>
      <ul>
        <li>Las Murallas Reales: Impresionante conjunto fortificado del siglo XVI.</li>
        <li>Parque Marítimo del Mediterráneo: Diseñado por César Manrique.</li>
        <li>Monte Hacho: Ofrece vistas panorámicas de la ciudad y el Estrecho.</li>
        <li>Catedral de Santa María de la Asunción: Bella muestra de arquitectura religiosa.</li>
        <li>Museo de Ceuta: Para conocer la rica historia de la ciudad.</li>
      </ul>
      
      <h2>Consejos prácticos</h2>
      <ul>
        <li>Documentación: Aunque Ceuta es territorio español, es recomendable llevar siempre el DNI o pasaporte.</li>
        <li>Moneda: Se utiliza el Euro como en el resto de España.</li>
        <li>Clima: Mediterráneo, con temperaturas agradables en junio (22-28°C).</li>
        <li>Transporte local: La ciudad es relativamente pequeña y muchos desplazamientos pueden hacerse a pie. También hay taxis y autobuses.</li>
      </ul>
      
      <p>Desde la organización del I GT de Ceuta estamos a tu disposición para ayudarte con cualquier aspecto de tu viaje. No dudes en contactarnos para más información o recomendaciones personalizadas.</p>
    `
  }
];

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
  
  // Filtrar los posts basados en la búsqueda y categoría
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Si seleccionamos "todos" o la categoría coincide
    const matchesCategory = selectedCategory === 'todos' || true; // Implementar lógica real con categorías
    
    return matchesSearch && matchesCategory;
  });

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
          {filteredPosts.length === 0 ? (
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
                      <span>{post.date}</span>
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
              ${blogPosts.map(post => `{
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