import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { FileTextIcon, DownloadIcon, ListIcon, MapIcon, TrophyIcon, ClipboardIcon } from 'lucide-react';

const ReglasPage = () => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
  };

  return (
    <Layout>
      <Helmet>
        <title>Reglamento y Bases | I GT de Ceuta - Torneo oficial de Warhammer 40.000</title>
        <meta 
          name="description" 
          content="Consulta el reglamento oficial y las bases del I Gran Torneo de Warhammer 40.000 en Ceuta. Formato GT, misiones, restricciones, horarios y toda la información que necesitas para participar." 
        />
        <meta name="keywords" content="reglamento warhammer 40k, bases torneo GT, formato gran torneo, misiones warhammer, normativa torneo ceuta" />
        <link rel="canonical" href="https://gtceuta.com/bases-del-torneo" />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-red-600">Reglamento y Bases del Torneo</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Todo lo que necesitas saber sobre las reglas, restricciones y formato 
              del I Gran Torneo de Warhammer 40.000 en Ceuta
            </p>
            
            {/* Botones para ver y descargar PDF - Destacados al principio */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={togglePdfViewer} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
                aria-label="Ver documento completo"
              >
                <FileTextIcon size={20} aria-hidden="true" />
                <span>Ver documento completo</span>
              </button>
              <a 
                href="/documents/bases_gt_ceuta.pdf" // Usa el nombre sin espacios
                download
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
                aria-label="Descargar bases en PDF"
              >
                <DownloadIcon size={20} aria-hidden="true" />
                <span>Descargar bases (PDF)</span>
              </a>
            </div>

            {/* Resto del contenido existente... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="bg-gray-900 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <ListIcon size={32} className="text-red-600" />
                  <h2 className="text-3xl font-bold">Formato del Torneo</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    El I GT de Ceuta seguirá el formato oficial de Gran Torneo de Games Workshop para Warhammer 40.000:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Eventos de 2 días (28 y 29 de junio de 2025)</li>
                    <li>4 rondas de juego (2 por día)</li>
                    <li>Ejércitos de 2000 puntos exactos</li>
                    <li>Misiones del Chapter Approved vigente</li>
                    <li>Normativa WYSIWYG (What You See Is What You Get)</li>
                    <li>Pintado obligatorio (mínimo 3 colores)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <MapIcon size={32} className="text-red-600" />
                  <h2 className="text-3xl font-bold">Misiones</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Se utilizarán las misiones del Chapter Approved: Grand Tournament 2025.
                  </p>
                  <p>
                    Las misiones específicas para cada ronda son:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Ronda 1 (sábado mañana)</strong>: Misión GT1 - Recuperar los datos perdidos</li>
                    <li><strong>Ronda 2 (sábado tarde)</strong>: Misión GT3 - Surcar las líneas enemigas</li>
                    <li><strong>Ronda 3 (domingo mañana)</strong>: Misión GT4 - Prueba de capacidad táctica</li>
                    <li><strong>Ronda 4 (domingo tarde)</strong>: Misión GT5 - La batalla decisiva</li>
                  </ul>
                  <p>
                    Cada jugador deberá elegir sus objetivos secundarios al inicio de cada partida, siguiendo las restricciones establecidas en el reglamento oficial.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="bg-gray-900 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <TrophyIcon size={32} className="text-red-600" />
                  <h2 className="text-3xl font-bold">Sistema de Puntuación</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    La clasificación final se determinará usando el siguiente sistema de puntuación:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Victoria</strong>: 3 puntos</li>
                    <li><strong>Empate</strong>: 1 punto</li>
                    <li><strong>Derrota</strong>: 0 puntos</li>
                  </ul>
                  <p>
                    En caso de empate al final del torneo, los desempates se resolverán por:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Puntos de Batalla acumulados</li>
                    <li>Fuerza de los oponentes (Strength of Schedule)</li>
                    <li>Diferencia de Puntos de Victoria</li>
                  </ol>
                  <p>
                    También se otorgarán puntos de pintura y deportividad que podrán influir en premios específicos, pero no en la clasificación general.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <ClipboardIcon size={32} className="text-red-600" />
                  <h2 className="text-3xl font-bold">Restricciones de Lista</h2>
                </div>
                <div className="text-gray-300 space-y-4">
                  <p>
                    A la hora de crear tu lista de ejército, deberás tener en cuenta:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Seguir todas las reglas de construcción de ejército del reglamento actual de Warhammer 40.000</li>
                    <li>Máximo 3 destacamentos</li>
                    <li>Todos los destacamentos deben compartir al menos una facción clave</li>
                    <li>No se pueden incluir unidades experimentales o Legends</li>
                    <li>Se deben usar las reglas actualizadas según las últimas FAQ y Chapter Approved</li>
                    <li>Las listas deben entregarse con al menos 2 semanas de antelación al torneo</li>
                  </ul>
                  <p>
                    Todas las conversiones deben ser fácilmente reconocibles y representar de forma clara qué unidad son. En caso de duda, consulta con la organización antes del torneo.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-lg mb-16">
              <h2 className="text-3xl font-bold mb-6 text-center">Horario del Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">Sábado 28 de junio</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="font-bold">08:30 - 09:15</span>
                      <span>Recepción y acreditaciones</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">09:15 - 09:30</span>
                      <span>Presentación del torneo</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">09:30 - 12:30</span>
                      <span>Primera ronda</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">12:30 - 14:00</span>
                      <span>Comida</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">14:00 - 17:00</span>
                      <span>Segunda ronda</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">17:30 - 19:00</span>
                      <span>Evaluación de ejércitos pintados</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">20:00</span>
                      <span>Cena de confraternización (opcional)</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">Domingo 29 de junio</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="font-bold">09:00 - 09:30</span>
                      <span>Recepción de jugadores</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">09:30 - 12:30</span>
                      <span>Tercera ronda</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">12:30 - 14:00</span>
                      <span>Comida</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">14:00 - 17:00</span>
                      <span>Cuarta ronda</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">17:30 - 18:30</span>
                      <span>Entrega de premios y clausura</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-gray-300 text-center">
                <p className="italic">
                  Nota: Este horario puede estar sujeto a pequeñas modificaciones. Cualquier cambio será comunicado con antelación.
                </p>
              </div>
            </div>
            
            {/* Banner de descarga al final de la página */}
            <div className="bg-gradient-to-r from-green-800 to-green-600 p-8 rounded-lg shadow-lg mb-16">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-6">
                  <h2 className="text-2xl font-bold text-white mb-2">¿Prefieres leer las bases más tarde?</h2>
                  <p className="text-white opacity-90">
                    Descarga el PDF con todas las bases completas del torneo para consultarlo cuando quieras
                  </p>
                </div>
                <a 
                  href="/documents/bases_gt_ceuta.pdf" 
                  download
                  className="flex items-center gap-2 bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md whitespace-nowrap"
                >
                  <DownloadIcon size={24} aria-hidden="true" />
                  <span>Descargar PDF</span>
                </a>
              </div>
            </div>
            
            {/* Botones finales */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8">Documento completo de las bases</h2>
              <p className="text-gray-300 mb-8 max-w-3xl mx-auto">
                Para consultar todos los detalles del reglamento, incluyendo normativa específica, 
                restricciones detalladas y procedimientos del torneo, puedes acceder al documento completo.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={togglePdfViewer} 
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  <FileTextIcon size={20} aria-hidden="true" />
                  <span>Ver documento completo</span>
                </button>
                <a 
                  href="/documents/bases_gt_ceuta.pdf" 
                  download
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  <DownloadIcon size={20} aria-hidden="true" />
                  <span>Descargar PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF Viewer Modal */}
      {showPdfViewer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-[90vh]">
            <button 
              onClick={togglePdfViewer}
              className="absolute top-4 right-4 z-10 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors"
              aria-label="Cerrar visor de PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="h-full flex flex-col">
              <div className="bg-gray-800 p-3 flex justify-between items-center">
                <h2 className="text-white font-bold">Bases completas - I GT de Ceuta 2025</h2>
                <a 
                  href="/documents/bases_gt_ceuta.pdf" 
                  download
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded transition duration-300"
                  title="Descargar PDF"
                >
                  <DownloadIcon size={16} aria-hidden="true" />
                  <span>Descargar</span>
                </a>
              </div>
              <iframe 
                src="/documents/bases_gt_ceuta.pdf" 
                className="w-full flex-grow"
                title="Bases del Torneo GT Ceuta"
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReglasPage;