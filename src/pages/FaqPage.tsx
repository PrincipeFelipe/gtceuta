import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';

const FaqPage = () => {
  // Estado para las preguntas expandidas
  const [expandedQuestions, setExpandedQuestions] = React.useState<{[key: string]: boolean}>({
    'inscripcion-1': true, // Primera pregunta abierta por defecto
  });

  // Función para alternar la visualización de respuestas
  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Layout>
      <Helmet>
        <title>Preguntas Frecuentes | I GT de Ceuta 2025 - Warhammer 40.000</title>
        <meta name="description" content="Encuentra respuestas a las preguntas más frecuentes sobre el I Gran Torneo oficial de Warhammer 40.000 en Ceuta. Todo lo que necesitas saber sobre inscripción, reglas, alojamiento y más." />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-red-600">Preguntas Frecuentes</h1>
            <p className="text-xl text-gray-300">
              Todo lo que necesitas saber sobre el I Gran Torneo de Warhammer 40.000 en Ceuta
            </p>
          </div>

          <div className="space-y-10">
            {/* Sección: Inscripción y Pagos */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white border-b border-red-600 pb-2">Inscripción y Pagos</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('inscripcion-1')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Cómo me inscribo en el I GT de Ceuta?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['inscripcion-1'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['inscripcion-1'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        Puedes inscribirte directamente desde esta web haciendo clic en el botón "Inscríbete" que encontrarás en varias secciones. 
                        También puedes ponerte en contacto con los organizadores a través de nuestras redes sociales o enviando un correo electrónico a 
                        <a href="mailto:info@gtceuta.com" className="text-red-600 hover:underline ml-1">info@gtceuta.com</a>.
                      </p>
                      <p>
                        Una vez  finalizado el periodo de inscripciones, la organización se pondrá en contacto contigo para confirmar tu plaza y proporcionarte
                        toda la información necesaria para el evento.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('inscripcion-2')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Cuánto cuesta la inscripción al torneo?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['inscripcion-2'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['inscripcion-2'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        El precio de la inscripción al I GT de Ceuta es de 30€, lo que incluye:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>Participación en el torneo durante los dos días</li>
                        <li>Merchandising exclusivo del evento</li>
                        <li>Opción a premios del torneo</li>
                      </ul>
                      <p>
                        Para más detalles sobre lo que incluye la inscripción y las diferentes opciones de pago, 
                        <a href="/bases-del-torneo" className="text-red-600 hover:underline ml-1">consulta las bases del torneo</a>.
                      </p>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

            {/* Sección: Reglas y Formato del Torneo */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white border-b border-red-600 pb-2">Reglas y Formato del Torneo</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('reglas-1')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Qué requisitos deben cumplir las listas de ejército?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['reglas-1'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['reglas-1'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        Las listas deben ser de 2000 puntos como máximo, siguiendo las últimas actualizaciones del reglamento de Warhammer 40.000 
                        y respetando las restricciones de formato Gran Torneo (GT). Todas las miniaturas deben estar pintadas con al menos tres 
                        colores y las bases terminadas.
                      </p>
                      <p>
                        Para conocer todos los detalles específicos sobre composición de listas, consulta el 
                        <button className="text-red-600 hover:underline ml-1">documento oficial de bases del torneo</button>.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('reglas-2')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Qué misiones se jugarán en el torneo?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['reglas-2'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['reglas-2'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        El torneo utilizará las misiones oficiales del Chapter Approved: Gran Torneo 2025. Se jugarán un total de 4 rondas:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>2 rondas el sábado</li>
                        <li>2 rondas el domingo</li>
                      </ul>
                      <p>
                        Las misiones específicas se anunciarán una semana antes del evento para que todos los jugadores puedan prepararse adecuadamente.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('reglas-3')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Cómo se realizarán los emparejamientos?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['reglas-3'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['reglas-3'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        Los emparejamientos se realizarán siguiendo el sistema suizo:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>Primera ronda: emparejamiento aleatorio</li>
                        <li>Rondas siguientes: emparejamiento por puntuación acumulada</li>
                      </ul>
                      <p>
                        Se utilizará el software BCP (Best Coast Pairings) para gestionar el torneo, lo que permitirá a los jugadores consultar en tiempo real su puntuación, emparejamientos y clasificación.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección: Logística y Alojamiento */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white border-b border-red-600 pb-2">Logística y Alojamiento</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('logistica-1')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Dónde se celebrará el torneo?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['logistica-1'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['logistica-1'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        El I GT de Ceuta se celebrará en el Centro Cultural 'La Estáción de Ferrocarril', ubicado en la Avenida de Madrid en Ceuta. 
                        Es un espacio amplio y acondicionado específicamente para el evento, con acceso para personas con movilidad reducida.
                      </p>
                      <p>
                        La dirección exacta es: Avda. de Madrid, s/n, 51001 Ceuta.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('logistica-2')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Hay hoteles recomendados para el evento?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['logistica-2'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['logistica-2'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        Sí, tenemos acuerdos con varios hoteles que ofrecen precios especiales para los participantes del torneo:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li><strong>Hotel Ulises</strong>: Céntrico y con vistas al mar. Usa el código "GTCEUTA" para un 15% de descuento.</li>
                        <li><strong>Parador de Ceuta</strong>: Ubicado en un entorno privilegiado.</li>
                        <li><strong>Hotel Puerta de África</strong>: Moderno y bien ubicado.</li>
                      </ul>
                      <p>
                        Los hoteles Ulyses y Puerta de África cuentan con un descuento de 25€ por persona para la primera noche para los participantes del torneo.
                      </p>
                      <p>
                        Para más información sobre alojamiento, consulta nuestra 
                        <a href="/blog/descubriendo-ceuta-guia-visitantes" className="text-red-600 hover:underline ml-1">guía para visitantes</a>.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('logistica-3')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Cómo puedo llegar a Ceuta?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['logistica-3'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['logistica-3'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        La forma más común de llegar a Ceuta es en ferry desde Algeciras. Hay varias compañías que operan esta ruta:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li><strong>Baleària</strong>: Varios viajes diarios con duración aproximada de 1 hora.</li>
                        <li><strong>Trasmediterránea</strong>: También ofrece varios horarios con duración similar.</li>
                        <li><strong>FRS</strong>: Otra alternativa con horarios regulares.</li>
                      </ul>
                      <p>
                        También existe la opción de viajar en helicóptero desde Málaga o Algeciras, aunque con horarios más limitados.
                        Para más detalles sobre cómo llegar, visita nuestra 
                        <a href="/blog/descubriendo-ceuta-guia-visitantes" className="text-red-600 hover:underline ml-1">guía para visitantes</a>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección: Premios y Clasificación */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white border-b border-red-600 pb-2">Premios y Clasificación</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <button 
                    onClick={() => toggleQuestion('premios-1')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-xl font-bold">¿Qué premios habrá en el torneo?</h3>
                    <span className="text-red-600">
                      {expandedQuestions['premios-1'] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedQuestions['premios-1'] && (
                    <div className="mt-4 text-gray-300">
                      <p className="mb-4">
                        El I GT de Ceuta contará con una amplia variedad de premios y sorteos:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li><strong>Campeón del torneo</strong>: Trofeo exclusivo.</li>
                      </ul>
                      <p>
                        Además, habrá sorteos entre todos los participantes con productos donados por nuestros patrocinadores.
                      </p>
                    </div>
                  )}
                </div>
                
                
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6 text-white">¿No encuentras respuesta a tu pregunta?</h2>
            <p className="text-gray-300 mb-8">
              Ponte en contacto con nosotros directamente y te ayudaremos con cualquier duda que tengas.
            </p>
            <a href="/contacto" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
              Contactar con los organizadores
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FaqPage;