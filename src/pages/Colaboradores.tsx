import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';
import { Link } from 'react-router-dom';

const Colaboradores = () => {
  return (
    <Layout>
      <Helmet>
        <title>Colaboradores y Patrocinadores | I GT de Ceuta 2025 - Warhammer 40.000</title>
        <meta name="description" content="Conoce a los colaboradores y patrocinadores oficiales del I Gran Torneo de Warhammer 40.000 en Ceuta. Clubs de juegos, tiendas especializadas y medios que hacen posible este evento." />
        <meta name="keywords" content="patrocinadores Warhammer 40k, colaboradores torneo Warhammer, Megaverse, Kubos Ludika, sponsors Warhammer, GT Ceuta patrocinadores" />
        <link rel="canonical" href="https://gtceuta.com/colaboradores" />
        <meta property="og:title" content="Colaboradores y Patrocinadores | I GT de Ceuta" />
        <meta property="og:description" content="Conoce a los colaboradores y patrocinadores que hacen posible el I Gran Torneo de Warhammer 40.000 en Ceuta." />
        <meta property="og:url" content="https://gtceuta.com/colaboradores" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-6 text-red-600 text-center">Colaboradores y Patrocinadores</h1>
            <p className="text-xl text-gray-300 mb-8 text-center">
              Empresas, clubes y comunidades que hacen posible el I Gran Torneo de Warhammer 40.000 en Ceuta
            </p>
            
            <div className="mt-12 mb-20">
              <h2 className="text-3xl font-bold mb-8 text-white text-center">Patrocinadores Principales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/megaverse.jpg" 
                    alt="Megaverse - Tienda oficial de Games Workshop en Ceuta" 
                    className="w-full h-40 object-contain mb-4" 
                  />
                  <h3 className="text-xl font-bold mb-2">Megaverse</h3>
                  <p className="text-gray-400 mb-4">Tienda oficial de Games Workshop en Ceuta, especializada en todo tipo de juegos de mesa y miniaturas. Ofrece talleres de pintura, eventos regulares y una amplia gama de productos para el hobby.</p>
                  <a href="https://megaverse.es" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Visitar sitio web</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/kubos-ludika.jpg" 
                    alt="Kubos Ludika - Club de juegos especializado en Warhammer 40.000" 
                    className="w-full h-40 object-contain mb-4" 
                  />
                  <h3 className="text-xl font-bold mb-2">Kubos Ludika</h3>
                  <p className="text-gray-400 mb-4">Club de juegos de Ceuta dedicado a promover la afición por los juegos de mesa y wargames, con especial énfasis en Warhammer 40.000. Organizan eventos, torneos y actividades formativas.</p>
                  <a href="https://kubosludika.es" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Visitar sitio web</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/ayuntamiento-ceuta.jpg" 
                    alt="Ayuntamiento de Ceuta - Apoyo institucional al torneo" 
                    className="w-full h-40 object-contain mb-4" 
                  />
                  <h3 className="text-xl font-bold mb-2">Ayuntamiento de Ceuta</h3>
                  <p className="text-gray-400 mb-4">El Ayuntamiento de Ceuta apoya esta iniciativa cultural y deportiva cediendo espacios y proporcionando recursos para que el I GT de Ceuta sea un éxito y sitúe a la ciudad en el mapa de los eventos de Warhammer.</p>
                  <a href="https://www.ceuta.es" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Visitar sitio web</a>
                </div>
              </div>
            </div>
            
            <div className="mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-8 text-white text-center">Colaboradores del Evento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/games-workshop.jpg" 
                    alt="Games Workshop - Creadores de Warhammer 40.000" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Games Workshop</h3>
                  <p className="text-gray-400 mb-3">Creadores de Warhammer 40.000 y referentes mundiales en el mundo de los wargames con miniaturas.</p>
                  <a href="https://www.games-workshop.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Sitio web oficial</a>
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/hotel-ulises.jpg" 
                    alt="Hotel Ulises - Alojamiento oficial del torneo" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Hotel Ulises</h3>
                  <p className="text-gray-400 mb-3">Alojamiento oficial del torneo con tarifas especiales para participantes. Ubicación céntrica y excelentes instalaciones.</p>
                  <a href="https://www.hotelulises.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Reservas con descuento</a>
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/warhammer-community.jpg" 
                    alt="Warhammer Community - Portal oficial de noticias" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Warhammer Community</h3>
                  <p className="text-gray-400 mb-3">Portal oficial de noticias y actualizaciones sobre el universo Warhammer, que dará cobertura a nuestro evento.</p>
                  <a href="https://www.warhammer-community.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Visitar portal</a>
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/gamemat-eu.jpg" 
                    alt="Gamemat.eu - Proveedor de tapetes de juego" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Gamemat.eu</h3>
                  <p className="text-gray-400 mb-3">Proveedor oficial de tapetes de juego de alta calidad para todos los tableros del torneo.</p>
                  <a href="https://www.gamemat.eu" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Ver productos</a>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/army-painter.jpg" 
                    alt="The Army Painter - Pinturas para miniaturas" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">The Army Painter</h3>
                  <p className="text-gray-400 mb-3">Especialistas en pinturas y accesorios para la pintura de miniaturas, patrocinan los premios de pintura del torneo.</p>
                  <a href="https://www.thearmypainter.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Ver productos</a>
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/feldherr.jpg" 
                    alt="Feldherr - Soluciones de transporte para miniaturas" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Feldherr</h3>
                  <p className="text-gray-400 mb-3">Especialistas en soluciones de transporte seguro para miniaturas, contribuyen con productos para los premios.</p>
                  <a href="https://www.feldherr.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Ver productos</a>
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/battlesystems.jpg" 
                    alt="Battle Systems - Escenografía para wargames" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Battle Systems</h3>
                  <p className="text-gray-400 mb-3">Proveedores de escenografía modular de alta calidad que se utilizará en las mesas de juego del torneo.</p>
                  <a href="https://www.battlesystems.co.uk" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Ver productos</a>
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <OptimizedImage 
                    src="/images/sponsors/frontline-gaming.jpg" 
                    alt="Frontline Gaming - Comunidad de jugadores competitivos" 
                    className="w-full h-32 object-contain mb-3" 
                  />
                  <h3 className="text-lg font-bold mb-2">Frontline Gaming</h3>
                  <p className="text-gray-400 mb-3">Comunidad internacional de jugadores competitivos de Warhammer 40.000, que dará cobertura al evento en su plataforma.</p>
                  <a href="https://www.frontlinegaming.org" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">Visitar sitio</a>
                </div>
              </div>
            </div>
            
            <div className="mt-20 mb-20">
              <h2 className="text-3xl font-bold mb-8 text-white text-center">Blogs y Medios Especializados</h2>
              <p className="text-lg text-gray-300 mb-8 text-center">
                Medios que colaboran en la difusión del evento y la cobertura en directo
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Goonhammer</h3>
                  <p className="text-gray-400 mb-4">Portal especializado en análisis tácticos, reseñas y cobertura de torneos de Warhammer 40.000 a nivel mundial.</p>
                  <a href="https://www.goonhammer.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Visitar portal</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">La Voz de Horus</h3>
                  <p className="text-gray-400 mb-4">Podcast y blog en español dedicado a la actualidad de Warhammer 40.000, con especial atención a la escena competitiva.</p>
                  <a href="https://www.lavozdehorus.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Escuchar podcast</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">40K Stats Centre</h3>
                  <p className="text-gray-400 mb-4">Portal estadístico que recopila y analiza resultados de torneos de Warhammer 40.000 a nivel mundial.</p>
                  <a href="https://40kstats.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Ver estadísticas</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Spikey Bits</h3>
                  <p className="text-gray-400 mb-4">Portal de noticias y análisis sobre Warhammer 40.000 y otros juegos de miniaturas.</p>
                  <a href="https://spikeybits.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Leer noticias</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">El Descanso del Escriba</h3>
                  <p className="text-gray-400 mb-4">Blog español dedicado a Warhammer y otros juegos de rol y estrategia, con una gran comunidad de seguidores.</p>
                  <a href="https://www.eldescansodelesciba.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Visitar blog</a>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Miniaturas TV</h3>
                  <p className="text-gray-400 mb-4">Canal de YouTube en español especializado en Warhammer 40.000, con tutoriales, batinformes y análisis.</p>
                  <a href="https://www.youtube.com/c/MiniaturasTv" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Ver canal</a>
                </div>
              </div>
            </div>
            
            <div className="mt-20">
              <h2 className="text-3xl font-bold mb-8 text-white text-center">¿Quieres ser colaborador?</h2>
              <p className="text-lg text-gray-300 mb-8 text-center max-w-3xl mx-auto">
                Si representas a una empresa o medio relacionado con el hobby de Warhammer 40.000 y estás interesado en colaborar con el I GT de Ceuta, ponte en contacto con nosotros. 
                Ofrecemos diferentes opciones de patrocinio y colaboración adaptadas a tus necesidades y objetivos.
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/contacto" 
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  Información para colaboradores
                </Link>
              </div>
            </div>
            
            {/* Schema.org para organizaciones - Mejora SEO */}
            <script type="application/ld+json">
              {`
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "GT Ceuta - Organizadores",
                  "url": "https://gtceuta.com",
                  "logo": "https://gtceuta.com/images/logo.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+34-XXX-XXX-XXX",
                    "contactType": "customer service",
                    "email": "info@gtceuta.com"
                  },
                  "sponsor": [
                    {
                      "@type": "Organization",
                      "name": "Megaverse",
                      "url": "https://megaverse.es"
                    },
                    {
                      "@type": "Organization",
                      "name": "Kubos Ludika",
                      "url": "https://kubosludika.es"
                    },
                    {
                      "@type": "Organization",
                      "name": "Ayuntamiento de Ceuta",
                      "url": "https://www.ceuta.es"
                    }
                  ]
                }
              `}
            </script>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Colaboradores;