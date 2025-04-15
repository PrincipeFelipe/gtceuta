import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import RegistrationForm from '../components/RegistrationForm';
import { Link } from 'react-router-dom';
import { FileTextIcon, CreditCardIcon, UserIcon, UsersIcon } from 'lucide-react';

const InscripcionPage = () => {
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <Layout>
      <Helmet>
        <title>Inscripción | I GT de Ceuta 2025 - Warhammer 40.000</title>
        <meta name="description" content="Inscríbete en el I Gran Torneo oficial de Warhammer 40.000 en Ceuta. Completa el formulario, realiza el pago y asegura tu plaza para este evento único." />
        <meta name="keywords" content="inscripción GT Ceuta, registro torneo Warhammer, participar Warhammer 40k, plazas torneo Ceuta" />
        <link rel="canonical" href="https://gtceuta.com/inscripcion" />
        <meta property="og:title" content="Inscripción | I GT de Ceuta - Warhammer 40.000" />
        <meta property="og:description" content="Reserva tu plaza para el I Gran Torneo de Warhammer 40.000 en Ceuta." />
        <meta property="og:url" content="https://gtceuta.com/inscripcion" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-red-600">Inscripción</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Reserva tu plaza para el I Gran Torneo oficial de Warhammer 40.000 en Ceuta.
              Las plazas son limitadas a 36 participantes, ¡no te quedes sin la tuya!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 bg-gray-900 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-white">Formulario de inscripción</h2>
              <RegistrationForm />
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <CreditCardIcon size={24} className="text-red-600 mr-2" />
                  <span>Precio de inscripción</span>
                </h3>
                <p className="text-gray-300 mb-4">El precio de la inscripción al I GT de Ceuta es de <strong className="text-white">105€</strong>, que incluye:</p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Participación en el torneo (4 partidas)</li>
                  <li>Comidas durante los dos días del evento</li>
                  <li>Recuerdo exclusivo del torneo</li>
                  <li>Opción a premios</li>
                  <li>Materiales del torneo</li>
                </ul>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileTextIcon size={24} className="text-red-600 mr-2" />
                  <span>Documentación necesaria</span>
                </h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Lista de ejército en formato BCP</li>
                  <li>Comprobante de pago</li>
                  <li>Documento de identidad</li>
                </ul>
                <div className="mt-4">
                  <Link to="/bases-del-torneo" className="text-red-600 hover:underline flex items-center">
                    <FileTextIcon size={18} className="mr-2" />
                    Ver bases completas
                  </Link>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <UserIcon size={24} className="text-red-600 mr-2" />
                  <span>Plazas disponibles</span>
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Total de plazas:</span>
                  <span className="font-bold text-white">36</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">Plazas ocupadas:</span>
                  <span className="font-bold text-red-600">18</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div className="bg-red-600 h-4 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="mt-4 text-sm text-gray-400">Actualizado: 15 de abril de 2025</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <UsersIcon size={24} className="text-red-600 mr-2" />
                  <span>Quién puede participar</span>
                </h3>
                <p className="text-gray-300 mb-4">
                  El torneo está abierto a todos los jugadores de Warhammer 40.000, 
                  independientemente de su nivel o experiencia previa en torneos.
                </p>
                <p className="text-gray-300">
                  Las miniaturas deben estar completamente pintadas (mínimo 3 colores) 
                  y las bases terminadas para poder participar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-lg mb-16">
            <h2 className="text-2xl font-bold mb-6 text-white">Proceso de inscripción</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">1</div>
                <h3 className="text-lg font-bold mb-2">Rellena el formulario</h3>
                <p className="text-gray-400">Completa todos los datos requeridos en el formulario de inscripción.</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">2</div>
                <h3 className="text-lg font-bold mb-2">Realiza el pago</h3>
                <p className="text-gray-400">Efectúa el pago siguiendo las instrucciones que recibirás por email.</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">3</div>
                <h3 className="text-lg font-bold mb-2">Confirmación</h3>
                <p className="text-gray-400">Recibirás un email confirmando tu plaza una vez verificado el pago.</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">4</div>
                <h3 className="text-lg font-bold mb-2">Envía tu lista</h3>
                <p className="text-gray-400">Envía tu lista de ejército antes del 15 de junio de 2025.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-lg">
            <button 
              onClick={() => setShowFAQ(!showFAQ)}
              className="w-full flex justify-between items-center"
            >
              <h2 className="text-2xl font-bold text-white">Preguntas frecuentes sobre inscripción</h2>
              <span className="text-red-600 text-2xl">{showFAQ ? '−' : '+'}</span>
            </button>
            
            {showFAQ && (
              <div className="mt-6 space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-3">¿Puedo cancelar mi inscripción?</h3>
                  <p className="text-gray-300">
                    Sí, la política de cancelación es la siguiente:
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-gray-300">
                    <li>Cancelación hasta 30 días antes: reembolso del 100%</li>
                   
                    <li>Cancelación con menos de 15 días: no hay reembolso</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-3">¿Puedo ceder mi plaza a otro jugador?</h3>
                  <p className="text-gray-300">
                    Sí, es posible ceder tu plaza a otro jugador siempre que nos informes con al menos 7 días de antelación 
                    y el nuevo participante acepte las condiciones del torneo y envíe la documentación necesaria.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-3">¿Cuál es la fecha límite para enviar mi lista de ejército?</h3>
                  <p className="text-gray-300">
                    La fecha límite para enviar tu lista de ejército es el 15 de junio de 2025. Las listas deben enviarse 
                    en formato BCP a la dirección de correo electrónico listas@gtceuta.com.
                  </p>
                </div>
                
                
                
                <div className="mt-6 text-center">
                  <Link to="/faq" className="text-red-600 hover:underline">
                    Ver todas las preguntas frecuentes
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schema.org para Event - Mejora SEO */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "I GT de Ceuta - Torneo oficial de Warhammer 40.000",
            "description": "Primer Gran Torneo oficial de Warhammer 40.000 en Ceuta con 36 plazas disponibles.",
            "startDate": "2025-06-28T09:00+01:00",
            "endDate": "2025-06-29T19:00+01:00",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
              "@type": "Place",
              "name": "Centro Cultural 'La Estáción de Ferrocarril'",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Avda. San Juan de Dios s/n",
                "addressLocality": "Ceuta",
                "postalCode": "51001",
                "addressCountry": "ES"
              }
            },
            "offers": {
              "@type": "Offer",
              "name": "Inscripción al I GT de Ceuta",
              "price": "105",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/LimitedAvailability",
              "validFrom": "2024-04-01T00:00+01:00",
              "url": "https://gtceuta.com/inscripcion"
            },
            "organizer": {
              "@type": "Organization",
              "name": "GT Ceuta - Organizadores",
              "url": "https://gtceuta.com"
            }
          }
        `}
      </script>
    </Layout>
  );
};

export default InscripcionPage;