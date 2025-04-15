import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';
import { Link } from 'react-router-dom';

const SobreElTorneoPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Sobre el Torneo | I GT de Ceuta - Warhammer 40.000</title>
        <meta 
          name="description" 
          content="Conoce todos los detalles sobre el I Gran Torneo oficial de Warhammer 40.000 en Ceuta. Historia, formato, ubicación y todo lo que hace único a este evento." 
        />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-red-600">Sobre el I GT de Ceuta</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              El primer Gran Torneo oficial de Warhammer 40.000 en Ceuta, un evento único 
              para todos los apasionados del hobby
            </p>
          </div>
          
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-white">Un evento histórico</h2>
                <p className="text-gray-300 mb-4">
                  El I GT de Ceuta marca un hito en la historia del hobby en la ciudad. Por primera vez, 
                  Ceuta acogerá un torneo oficial de Warhammer 40.000 de formato Gran Torneo, reuniendo a 
                  36 jugadores de diferentes partes de España y del extranjero.
                </p>
                <p className="text-gray-300 mb-4">
                  Organizado conjuntamente por Kubos Ludika y Megaverse, con el apoyo del Ayuntamiento de Ceuta, 
                  este evento nace con la ambición de convertirse en una cita anual imprescindible en el 
                  calendario de torneos oficiales de Warhammer 40.000.
                </p>
                <p className="text-gray-300">
                  El torneo seguirá el formato oficial de competición con las reglas más actualizadas, 
                  garantizando un evento de primer nivel tanto para jugadores experimentados como para 
                  aquellos que se inician en el mundo competitivo.
                </p>
              </div>
              <div>
                <OptimizedImage 
                  src="/images/img01.jpg" 
                  alt="Imagen representativa del I GT de Ceuta" 
                  className="w-full h-auto rounded-lg shadow-xl"
                  loading="eager" 
                />
                <p className="text-gray-500 text-sm mt-2 text-center italic">Vista de la ciudad de Ceuta, sede del primer Gran Torneo oficial</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
              <div className="order-2 md:order-1">
                <OptimizedImage 
                  src="/images/img02.jpg" 
                  alt="Centro Cultural 'La Estación de Ferrocarril'" 
                  className="w-full h-auto rounded-lg shadow-xl" 
                />
                <p className="text-gray-500 text-sm mt-2 text-center italic">Centro Cultural 'La Estación de Ferrocarril', sede del evento</p>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold mb-6 text-white">Una sede privilegiada</h2>
                <p className="text-gray-300 mb-4">
                  El I GT de Ceuta se celebrará en el Centro Cultural 'La Estación de Ferrocarril', 
                  un espacio emblemático totalmente renovado que combina la historia de la ciudad 
                  con modernas instalaciones.
                </p>
                <p className="text-gray-300 mb-4">
                  Situado en el centro de Ceuta, este recinto cuenta con una amplia sala principal 
                  donde se desarrollarán las partidas, así como espacios auxiliares para descanso, 
                  exposición de miniaturas y zona de restauración.
                </p>
                <p className="text-gray-300">
                  El edificio, antiguo apeadero de ferrocarril transformado en centro cultural, ofrece 
                  todas las comodidades necesarias para disfrutar de un gran torneo: climatización, 
                  buena iluminación, accesibilidad y conexión WiFi.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-white">Warhammer 40.000: El juego</h2>
                <p className="text-gray-300 mb-4">
                  Warhammer 40.000 es el juego de batallas con miniaturas más popular del mundo, ambientado 
                  en un oscuro futuro donde la humanidad lucha por su supervivencia contra innumerables amenazas 
                  en una galaxia en constante guerra.
                </p>
                <p className="text-gray-300 mb-4">
                  Creado por Games Workshop, este juego combina estrategia, coleccionismo y modelismo, permitiendo 
                  a los jugadores crear sus propios ejércitos de miniaturas detalladamente pintadas para después 
                  enfrentarlos en emocionantes batallas sobre el tablero.
                </p>
                <p className="text-gray-300">
                  En el I GT de Ceuta podrás jugar con cualquiera de las facciones del juego: desde los heroicos 
                  Space Marines hasta los brutales Orks, pasando por los tecnológicamente avanzados T'au o los 
                  ancestrales Necrones, entre muchos otros.
                </p>
              </div>
              <div>
                <OptimizedImage 
                  src="/images/img03.webp" 
                  alt="Partida de Warhammer 40.000" 
                  className="w-full h-auto rounded-lg shadow-xl" 
                />
                <p className="text-gray-500 text-sm mt-2 text-center italic">Partida de Warhammer 40.000 con ejércitos completamente pintados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-10 rounded-lg mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">¿Por qué participar?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Experiencia única</h3>
                <p className="text-gray-300">
                  Participa en un evento histórico: el primer Gran Torneo oficial de Warhammer 40.000 
                  celebrado en Ceuta, una ciudad con ubicación privilegiada entre dos continentes.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Nivel competitivo</h3>
                <p className="text-gray-300">
                  Enfréntate a jugadores de diferentes niveles y estilos, pon a prueba tus 
                  habilidades tácticas y mejora como jugador en un entorno competitivo pero amistoso.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Grandes premios</h3>
                <p className="text-gray-300">
                  Opta a importantes premios tanto en metálico como en productos, además de 
                  reconocimientos especiales para mejor ejército pintado y mejor deportividad.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Turismo</h3>
                <p className="text-gray-300">
                  Aprovecha para conocer Ceuta, una ciudad única con influencias europeas y africanas, 
                  rica historia, excelente gastronomía y hermosas playas del Mediterráneo.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Comunidad</h3>
                <p className="text-gray-300">
                  Forma parte de una comunidad apasionada, comparte experiencias, aprende nuevas 
                  tácticas y disfruta del hobby en su máxima expresión durante todo un fin de semana.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Organizadores experimentados</h3>
                <p className="text-gray-300">
                  El evento está organizado por equipos con amplia experiencia en torneos, 
                  garantizando un desarrollo impecable, mesas de calidad y una experiencia satisfactoria.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Los organizadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gray-900 p-8 rounded-lg">
                <div className="mb-6 text-center">
                  <OptimizedImage 
                    src="/images/logo_kubos.png" 
                    alt="Logo de Kubos Ludika" 
                    className="h-32 mx-auto object-contain" 
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Kubos Ludika</h3>
                <p className="text-gray-300 mb-4">
                  Club de juegos de Ceuta especializado en Warhammer 40.000 y otros juegos de miniaturas. 
                  Con más de 10 años de experiencia, Kubos Ludika ha organizado numerosos torneos y eventos 
                  relacionados con el hobby.
                </p>
                <p className="text-gray-300">
                  El club cuenta con jugadores experimentados que han participado en eventos nacionales e 
                  internacionales, aportando su conocimiento para garantizar un torneo de alto nivel.
                </p>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-lg">
                <div className="mb-6 text-center">
                  <OptimizedImage 
                    src="/images/logo_megaverse.png" 
                    alt="Logo de Megaverse" 
                    className="h-32 mx-auto object-contain" 
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Megaverse</h3>
                <p className="text-gray-300 mb-4">
                  Tienda oficial de Games Workshop en Ceuta, Megaverse es el referente en la ciudad para 
                  todos los aficionados a Warhammer. Desde su fundación, se ha destacado por promover el 
                  hobby y crear una comunidad activa en la región.
                </p>
                <p className="text-gray-300">
                  Como tienda oficial, Megaverse aporta al evento el respaldo de Games Workshop, asegurando 
                  que el torneo cumpla con todos los estándares de calidad establecidos por la compañía.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">¿Te animas a participar?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              No pierdas la oportunidad de formar parte de este evento histórico. 
              Las plazas son limitadas a 36 jugadores, ¡reserva la tuya ahora!
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                to="/inscripcion" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Inscríbete ahora
              </Link>
              <Link 
                to="/reglas" 
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Consultar bases
              </Link>
              <Link 
                to="/faq" 
                className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Preguntas frecuentes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SobreElTorneoPage;