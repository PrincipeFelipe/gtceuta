import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin as MapPinIcon, 
  Users as UsersIcon, 
  Trophy as TrophyIcon, 
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Dices as DicesIcon,
  SwordIcon,
  ArrowRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import PdfViewer from './components/PdfViewer';
import ImageViewer from './components/ImageViewer';
import Navigation from './components/Navigation';
import blogService, { BlogPost } from './services/BlogService';
import OptimizedImage from './components/OptimizedImage';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await blogService.getAllPosts({ 
          onlyPublished: true 
        });
        setBlogPosts(posts.slice(0, 3));
      } catch (error) {
        console.error('Error al cargar los posts para la página principal:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadBlogPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const togglePdf = () => {
    setShowPdf(!showPdf);
  };
  
  const togglePoster = () => {
    setShowPoster(!showPoster);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Helmet para SEO dinámico */}
      <Helmet>
        <title>I GT de Ceuta 2025 - Torneo oficial de Warhammer 40.000</title>
        <meta name="description" content="Inscríbete en el Primer Gran Torneo oficial de Warhammer 40.000 en Ceuta. 28 y 29 de junio de 2025. 36 jugadores, grandes premios y formato competitivo oficial." />
        <meta name="keywords" content="GT Ceuta, Warhammer 40k, torneo Ceuta, Warhammer 40000, Gran Torneo, Games Workshop, torneo oficial" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-gray-100">
        {/* Barra de navegación principal */}
        <nav className="bg-gray-900 bg-opacity-95 py-4 px-6 sticky top-0 z-40 shadow-md">
          <Navigation 
            togglePdf={togglePdf}
            toggleMenu={toggleMenu}
            menuOpen={menuOpen}
            isHomePage={true}
          />
        </nav>
        
        {/* Hero Section */}
        <section 
          className="h-screen relative flex items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/images/hero-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          aria-label="Sección principal"
          id="inicio"
        >
          <div className="text-center z-10 px-4">
            {/* Logo del torneo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/images/logo_torneo_lit.png" 
                alt="Logo I GT de Ceuta" 
                className="w-64 md:w-80 mx-auto"
              />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 text-red-600">I GT DE CEUTA</h1>
            <p className="text-2xl md:text-3xl mb-4">Warhammer 40.000</p>
            <p className="text-xl mb-8">Torneo Oficial - 28 y 29 de junio de 2025</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={toggleForm} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                aria-label="Abrir formulario de inscripción"
              >
                Inscríbete
              </button>
              <button 
                onClick={togglePdf} 
                className="border-2 border-red-600 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                aria-label="Ver bases del torneo"
              >
                <FileTextIcon size={20} aria-hidden="true" />
                <span>Ver Bases del Torneo</span>
              </button>
              <button 
                onClick={togglePoster} 
                className="border-2 border-yellow-600 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                aria-label="Ver cartel del evento"
              >
                <ImageIcon size={20} aria-hidden="true" />
                <span>Ver Cartel</span>
              </button>
            </div>
          </div>
        </section>

        {/* Sección Sobre el Torneo - Nueva sección con más contenido relacionado al título */}
        <section id="sobre" className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black" aria-labelledby="sobre-title">
          <div className="max-w-6xl mx-auto">
            <h2 id="sobre-title" className="text-4xl font-bold text-center mb-8 text-red-600">Sobre el Torneo Oficial de Warhammer 40.000</h2>
            <div className="text-center mb-12">
              <p className="text-lg text-gray-300 mb-4">
                El <strong>I GT de Ceuta</strong> es el primer <strong>Gran Torneo oficial de Warhammer 40.000</strong> que se celebra en la ciudad de Ceuta.
              </p>
              <p className="text-lg text-gray-300 mb-4">
                Este <strong>torneo oficial</strong> seguirá el formato de competición de <strong>Warhammer 40.000</strong> con las últimas actualizaciones y reglamentos de Games Workshop.
              </p>
              <p className="text-lg text-gray-300 mb-4">
                Si eres un apasionado de <strong>Warhammer 40k</strong> y quieres participar en un evento <strong>oficial</strong> con todos los alicientes de un <strong>gran torneo</strong>, ¡este es tu evento!
              </p>
              <div className="flex justify-center mt-8">
                <button 
                  onClick={togglePdf}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                  aria-label="Consultar bases del torneo oficial de Warhammer 40.000"
                >
                  <FileTextIcon size={20} aria-hidden="true" />
                  <span>Consultar Bases Oficiales</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section id="info" className="py-20 px-4 bg-black" aria-labelledby="info-title">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="info-title" className="text-4xl font-bold mb-4 text-red-600">Información del Gran Torneo</h2>
              <p className="text-lg text-gray-300 mb-8">
                Todo lo que necesitas saber sobre el <strong>I GT de Ceuta</strong>, <strong>torneo oficial</strong> de <strong>Warhammer 40.000</strong>. 
                Consulta las <button onClick={togglePdf} className="text-red-600 hover:underline">bases completas</button> o revisa las 
                <a href="#caracteristicas" className="text-red-600 hover:underline"> características del torneo</a>.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <button 
                  onClick={togglePdf}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  aria-label="Ver bases completas del torneo"
                >
                  <FileTextIcon size={20} aria-hidden="true" />
                  <span>Ver Bases Completas</span>
                </button>
                <button 
                  onClick={togglePoster}
                  className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  aria-label="Ver cartel del evento"
                >
                  <ImageIcon size={20} aria-hidden="true" />
                  <span>Ver Cartel del Evento</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InfoCard 
                icon={<CalendarIcon className="w-8 h-8 text-red-600" aria-hidden="true" />}
                title="Fecha del Torneo"
                description="28 y 29 de junio de 2025, Gran Torneo oficial de dos días completos"
                link="#sobre"
              />
              <InfoCard 
                icon={<MapPinIcon className="w-8 h-8 text-red-600" aria-hidden="true" />}
                title="Ubicación"
                description="Centro Cultural 'La Estáción de Ferrocarril', Ceuta"
                link="https://goo.gl/maps/yourmaplink"
              />
              <InfoCard 
                icon={<UsersIcon className="w-8 h-8 text-red-600" aria-hidden="true" />}
                title="Participantes"
                description="36 Jugadores del torneo oficial de Warhammer 40.000"
                link="#caracteristicas"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900" aria-labelledby="features-title" id="caracteristicas">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-title" className="text-4xl font-bold text-center mb-8 text-red-600">Características del Torneo Oficial</h2>
            <p className="text-center text-lg text-gray-300 mb-12">
              El <strong>I GT de Ceuta</strong> seguirá el formato oficial de <strong>Warhammer 40.000</strong> con todos los estándares de un auténtico <strong>gran torneo</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FeatureCard 
                icon={<TrophyIcon className="w-12 h-12 text-red-600" aria-hidden="true" />}
                title="Premios del Gran Torneo"
                description="Importantes premios y sorteos entre todos los participantes del torneo oficial de Warhammer 40.000"
                link="#sobre"
              />
              <FeatureCard 
                icon={<ShieldIcon className="w-12 h-12 text-red-600" aria-hidden="true" />}
                title="Formato Oficial"
                description="4 rondas de juego con las últimas FAQ y Chapter Approved de Games Workshop para Warhammer 40k"
                link={togglePdf}
              />
              <FeatureCard 
                icon={<SwordIcon className="w-12 h-12 text-red-600" aria-hidden="true" />}
                title="Listas para el Torneo"
                description="2000 puntos, siguiendo la normativa oficial de torneos de Warhammer 40.000"
                link={togglePdf}
              />
              <FeatureCard 
                icon={<DicesIcon className="w-12 h-12 text-red-600" aria-hidden="true" />}
                title="Escenarios"
                description="Escenarios oficiales de Warhammer 40k para formato de torneo GT con terreno equilibrado"
                link="#info"
              />
            </div>
            <div className="mt-12 text-center">
              <button 
                onClick={togglePoster}
                className="flex items-center gap-2 mx-auto bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                aria-label="Ver cartel oficial del torneo"
              >
                <ImageIcon size={20} aria-hidden="true" />
                <span>Ver Cartel Oficial del Torneo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Historia de Warhammer Section */}
        <section className="py-20 px-4 bg-black" id="historia" aria-labelledby="historia-title">
          <div className="max-w-6xl mx-auto">
            <h2 id="historia-title" className="text-4xl font-bold text-center mb-8 text-red-600">El Universo de Warhammer 40.000</h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 mb-4">
                <strong>Warhammer 40.000</strong> es uno de los juegos de miniaturas más populares del mundo, ambientado en un futuro distópico donde la humanidad lucha por su supervivencia en un universo hostil. Creado por Games Workshop, este universo ha cautivado a millones de aficionados desde su lanzamiento en 1987.
              </p>
              <p className="text-gray-300 mb-4">
                El <strong>Gran Torneo de Ceuta</strong> ofrece la oportunidad perfecta para experimentar este fascinante universo de ciencia ficción en un entorno competitivo y amistoso. Las partidas de <strong>Warhammer 40k</strong> combinan estrategia, tácticas y un poco de suerte, creando experiencias únicas en cada enfrentamiento.
              </p>
              <h3 className="text-2xl font-bold mb-4 text-gray-200 mt-8">Las Facciones del 41º Milenio</h3>
              <p className="text-gray-300 mb-4">
                El universo de <strong>Warhammer 40.000</strong> está poblado por numerosas facciones, cada una con su propia historia, estética y estilo de juego. Entre las más destacadas encontramos:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-6">
                <li className="mb-2"><strong>Space Marines:</strong> Guerreros genéticamente modificados y superhumanos que defienden el Imperio de la Humanidad.</li>
                <li className="mb-2"><strong>Astra Militarum:</strong> El vasto ejército humano compuesto por billones de soldados regulares.</li>
                <li className="mb-2"><strong>Orkos:</strong> Brutales alienígenas amantes de la guerra cuya tecnología funciona simplemente porque ellos creen que debe funcionar.</li>
                <li className="mb-2"><strong>Tiránidos:</strong> Enjambres de criaturas devoradores de mundos impulsados únicamente por la necesidad de consumir biomasa.</li>
                <li className="mb-2"><strong>Eldars:</strong> Antigua raza alienígena tecnológicamente avanzada pero en decadencia.</li>
                <li className="mb-2"><strong>Necrones:</strong> Ancianos seres mecánicos inmortales que despiertan tras millones de años de hibernación.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                En el <strong>I GT de Ceuta</strong>, los participantes podrán competir con cualquiera de estas facciones siguiendo las reglas oficiales y las últimas actualizaciones del juego. La diversidad de ejércitos garantiza un torneo variado y emocionante.
              </p>
              <h3 className="text-2xl font-bold mb-4 text-gray-200 mt-8">El Sistema de Juego</h3>
              <p className="text-gray-300 mb-4">
                <strong>Warhammer 40.000</strong> es un juego táctico que se desarrolla por turnos sobre una mesa con escenografía representando diversos terrenos. Los jugadores mueven unidades de miniaturas coleccionables, cada una con sus propias características, habilidades y equipamiento.
              </p>
              <p className="text-gray-300 mb-4">
                El sistema combina elementos de movimiento estratégico, gestión de recursos, y combate basado en dados. Las partidas suelen tener objetivos específicos que van más allá de simplemente eliminar al ejército enemigo, lo que añade una capa adicional de profundidad táctica.
              </p>
              <p className="text-gray-300 mb-4">
                Para el <strong>Gran Torneo de Ceuta</strong>, utilizaremos los últimos escenarios competitivos oficiales, garantizando un evento equilibrado y acorde a los estándares internacionales de torneos de <strong>Warhammer 40k</strong>.
              </p>
              <div className="text-center mt-8">
                <button 
                  onClick={togglePdf}
                  className="flex items-center gap-2 mx-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  <FileTextIcon size={20} aria-hidden="true" />
                  <span>Consultar reglamento del torneo</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preguntas Frecuentes Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black" id="faq" aria-labelledby="faq-title">
          <div className="max-w-6xl mx-auto">
            <h2 id="faq-title" className="text-4xl font-bold text-center mb-12 text-red-600">Preguntas Frecuentes</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">¿Cómo me inscribo en el I GT de Ceuta?</h3>
                <p className="text-gray-300">
                  Puedes inscribirte directamente desde esta web haciendo clic en el botón "Inscríbete" que encontrarás en varias secciones. También puedes ponerte en contacto con los organizadores a través de nuestras redes sociales o enviando un correo electrónico a info@gtceuta.com.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">¿Cuánto cuesta la inscripción al torneo?</h3>
                <p className="text-gray-300">
                  El precio de la inscripción al I GT de Ceuta es de 105€, lo que incluye participación en el torneo, comidas durante los dos días del evento, recuerdo del torneo y opción a premios. Para más detalles sobre lo que incluye la inscripción y las diferentes opciones de pago, consulta las bases del torneo.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">¿Qué requisitos deben cumplir las listas de ejército?</h3>
                <p className="text-gray-300">
                  Las listas deben ser de 2000 puntos exactos, siguiendo las últimas actualizaciones del reglamento de Warhammer 40.000 y respetando las restricciones de formato Gran Torneo (GT). Todas las miniaturas deben estar pintadas con al menos tres colores y las bases terminadas. Para conocer todos los detalles específicos sobre composición de listas, consulta el documento oficial de bases del torneo.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">¿Puedo participar si soy principiante en Warhammer 40k?</h3>
                <p className="text-gray-300">
                  ¡Claro que sí! Aunque el formato es competitivo, el ambiente del torneo es amistoso y acogedor. Recomendamos que tengas al menos conocimientos básicos del reglamento para poder disfrutar plenamente de la experiencia. Si tienes dudas, puedes contactar con los organizadores para orientación.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">¿Cómo llegar a Ceuta para participar en el torneo?</h3>
                <p className="text-gray-300">
                  Ceuta es accesible mediante ferry desde Algeciras (España) con varias salidas diarias. También cuenta con helipuerto con conexiones a Málaga y Algeciras. Si vienes desde la Península, recomendamos reservar el ferry con antelación, especialmente para las fechas del torneo. Los participantes de otros lugares pueden contactar con la organización para recomendaciones de alojamiento y transporte.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">¿Habrá miniaturas y productos oficiales de Warhammer a la venta?</h3>
                <p className="text-gray-300">
                  Sí, contaremos con un stand oficial donde se podrán adquirir productos de Games Workshop, incluyendo miniaturas, pinturas, libros de reglas y otros accesorios. También tendremos una selección especial de productos exclusivos del I GT de Ceuta como recuerdos del evento.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <p className="text-gray-300 mb-4">¿Tienes más preguntas sobre el torneo?</p>
              <a 
                href="mailto:info@gtceuta.com" 
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 px-4 bg-black" id="blog" aria-labelledby="blog-title">
          <div className="max-w-6xl mx-auto">
            <h2 id="blog-title" className="text-4xl font-bold text-center mb-8 text-red-600">Artículos y Noticias</h2>
            <p className="text-center text-lg text-gray-300 mb-12">
              Descubre las últimas noticias sobre el Gran Torneo y el mundo de Warhammer 40.000
            </p>
            
            {loadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400">Próximamente nuevos artículos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map(post => (
                  <article key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
                    <Link to={`/blog/${post.slug}`}>
                      <OptimizedImage 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/hero-bg.jpg";
                        }}
                      />
                    </Link>
                    <div className="p-6">
                      <p className="text-gray-400 mb-4 text-sm">Publicado: {formatDate(post.date)}</p>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold mb-2 hover:text-red-600 transition-colors">{post.title}</h3>
                      </Link>
                      <p className="text-gray-300 mb-4">
                        {post.excerpt}
                      </p>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        Leer artículo completo
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link 
                to="/blog"
                className="inline-block bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-lg transition duration-300"
              >
                Ver todos los artículos
              </Link>
            </div>
          </div>
        </section>

        {/* Organizadores Section */}
        <section className="py-20 px-4 bg-gray-900" id="organizadores" aria-labelledby="organizadores-title">
          <div className="max-w-6xl mx-auto">
            <h2 id="organizadores-title" className="text-4xl font-bold text-center mb-8 text-red-600">Organizadores del Torneo Oficial</h2>
            <p className="text-center text-lg text-gray-300 mb-8">
              El <strong>Gran Torneo de Ceuta de Warhammer 40.000</strong> está organizado por:
            </p>
            <div className="text-center">
              <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                <div className="bg-gray-800 p-6 rounded-lg w-full md:w-1/2 max-w-sm">
                  <h3 className="text-2xl font-bold mb-4">Kubos Ludika</h3>
                  <p className="text-gray-400 mb-4">Club oficial de juegos de mesa, organizador de eventos, talleres y ludotecas. Especialistas en torneos de Warhammer 40.000.</p>
                  <a href="#info" className="text-red-600 hover:underline">Más información</a>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg w-full md:w-1/2 max-w-sm">
                  <h3 className="text-2xl font-bold mb-4">Megaverse</h3>
                  <p className="text-gray-400 mb-4">Club de Wargames y Rol de Ceuta, con una amplia experiencia en la organización de eventos oficiales de Warhammer 40k.</p>
                  <a href="#info" className="text-red-600 hover:underline">Más información</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Nueva sección para inscripción */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black" id="inscripcion" aria-labelledby="inscripcion-title">
          <div className="max-w-6xl mx-auto text-center">
            <h2 id="inscripcion-title" className="text-4xl font-bold mb-6 text-red-600">¡Inscríbete al Gran Torneo de Warhammer 40k!</h2>
            <p className="text-lg text-gray-300 mb-8">
              No pierdas la oportunidad de participar en este <strong>torneo oficial de Warhammer 40.000</strong> en Ceuta.
              ¡Plazas limitadas a 36 jugadores!
            </p>
            <button 
              onClick={toggleForm} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-xl"
              aria-label="Inscríbete al torneo oficial de Warhammer 40.000"
            >
              Reserva Tu Plaza
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="font-bold text-lg">I GT de Ceuta - Torneo oficial de Warhammer 40.000</p>
                <p className="text-gray-400">28 y 29 de junio de 2025 - Gran Torneo de Warhammer 40k</p>
              </div>
              <div className="mb-4 md:mb-0">
                <p>Organizado por Kubos Ludika y Megaverse</p>
                <p className="text-sm text-gray-400">© 2025 GT Ceuta. Todos los derechos reservados.</p>
              </div>
              <div className="flex flex-col">
                <p className="mb-2 font-bold">Síguenos</p>
                <div className="flex justify-center gap-4">
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition duration-300" aria-label="Instagram">Instagram</a>
                  <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition duration-300" aria-label="Twitter">X</a>
                  <a href="https://www.facebook.com/gtceuta" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition duration-300" aria-label="Facebook">Facebook</a>
                </div>
              </div>
            </div>
            <nav className="mt-8">
              <ul className="flex flex-wrap justify-center gap-4">
                <li><a href="#inicio" className="hover:text-red-600 transition duration-300">Inicio</a></li>
                <li><a href="#sobre" className="hover:text-red-600 transition duration-300">Sobre el Torneo</a></li>
                <li><a href="#info" className="hover:text-red-600 transition duration-300">Información</a></li>
                <li><a href="#caracteristicas" className="hover:text-red-600 transition duration-300">Características</a></li>
                <li><a href="#organizadores" className="hover:text-red-600 transition duration-300">Organizadores</a></li>
                <li><a href="#inscripcion" className="hover:text-red-600 transition duration-300">Inscripción</a></li>
                <li><button onClick={togglePdf} className="hover:text-red-600 transition duration-300">Bases</button></li>
              </ul>
            </nav>
            <p className="text-center mt-8 text-sm text-gray-400">
              Warhammer 40,000 y todos los logos relacionados son marcas registradas de Games Workshop Limited. Este evento no está afiliado oficialmente con Games Workshop Ltd.
            </p>
          </div>
        </footer>

        {/* Registration Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="relative w-full max-w-lg">
              <button 
                onClick={toggleForm}
                className="absolute top-4 right-4 text-gray-300 hover:text-white"
                aria-label="Cerrar formulario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div id="form-title" className="sr-only">Formulario de inscripción</div>
              <RegistrationForm />
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {showPdf && (
          <PdfViewer 
            pdfUrl="/documents/Bases GT Ceuta.pdf" 
            onClose={togglePdf} 
          />
        )}
        
        {/* Image Viewer Modal */}
        {showPoster && (
          <ImageViewer 
            imageUrl="/images/CARTEL I GT CEUTA.jpg" 
            onClose={togglePoster} 
          />
        )}
      </div>
    </>
  );
}

function InfoCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link?: string | (() => void) }) {
  const renderContent = () => (
    <>
      <div className="flex justify-center mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-2">{description}</p>
    </>
  );

  if (typeof link === 'string') {
    return (
      <article className="bg-gray-800 p-6 rounded-lg text-center">
        <a href={link} className="block hover:scale-105 transition-transform">
          {renderContent()}
          <span className="text-red-600 hover:underline text-sm">Más información</span>
        </a>
      </article>
    );
  } else if (typeof link === 'function') {
    return (
      <article className="bg-gray-800 p-6 rounded-lg text-center">
        <button onClick={link} className="block w-full text-left hover:scale-105 transition-transform">
          {renderContent()}
          <span className="text-red-600 hover:underline text-sm">Más información</span>
        </button>
      </article>
    );
  }

  return (
    <article className="bg-gray-800 p-6 rounded-lg text-center">
      {renderContent()}
    </article>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link?: string | (() => void) }) {
  const renderContent = () => (
    <>
      <div className="mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </>
  );

  if (typeof link === 'string') {
    return (
      <article className="bg-gray-900 p-8 rounded-lg border border-gray-800 hover:border-red-800 transition-all">
        <a href={link} className="block">
          {renderContent()}
          <div className="mt-4">
            <span className="text-red-600 hover:underline text-sm">Ver detalles</span>
          </div>
        </a>
      </article>
    );
  } else if (typeof link === 'function') {
    return (
      <article className="bg-gray-900 p-8 rounded-lg border border-gray-800 hover:border-red-800 transition-all">
        <div className="block">
          {renderContent()}
          <div className="mt-4">
            <button onClick={link} className="text-red-600 hover:underline text-sm">Ver detalles</button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-gray-900 p-8 rounded-lg border border-gray-800">
      {renderContent()}
    </article>
  );
}

export default App;