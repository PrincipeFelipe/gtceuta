import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const ContactoPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí iría la lógica de envío del formulario a tu backend o servicio de emails
    // Por ahora simulamos una respuesta exitosa
    
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Gracias por tu mensaje. Nos pondremos en contacto contigo lo antes posible.'
    });
    
    // Resetear el formulario
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>Contacto - I GT de Ceuta 2025 - Warhammer 40.000</title>
        <meta name="description" content="Ponte en contacto con los organizadores del I Gran Torneo de Warhammer 40.000 en Ceuta. Resuelve tus dudas sobre inscripción, alojamiento, transporte y más." />
        <meta name="keywords" content="contacto GT Ceuta, contactar organizadores Warhammer, información torneo Ceuta, preguntas Warhammer 40k" />
        <link rel="canonical" href="https://gtceuta.com/contacto" />
        <meta property="og:title" content="Contacto - I GT de Ceuta 2025" />
        <meta property="og:description" content="Ponte en contacto con los organizadores del I Gran Torneo de Warhammer 40.000 en Ceuta." />
        <meta property="og:url" content="https://gtceuta.com/contacto" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-red-600 text-center">Contacto</h1>
          <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
            ¿Tienes dudas sobre el I GT de Ceuta? ¿Necesitas información sobre inscripción, alojamiento o transporte? 
            Ponte en contacto con nosotros y te responderemos lo antes posible.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de contacto */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Información de contacto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-red-600 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold mb-1">Ubicación</h3>
                    <p className="text-gray-300">Centro Cultural 'La Estáción de Ferrocarril'</p>
                    <p className="text-gray-300">Avda. de Madrid s/n</p>
                    <p className="text-gray-300">51001 Ceuta, España</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-red-600 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold mb-1">Email</h3>
                    <p className="text-gray-300">info@gtceuta.com (para dudas sobre inscripciones)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-red-600 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold mb-1">Teléfono</h3>
                    <p className="text-gray-300">+34 661 648 720</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-red-600 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold mb-1">Horario de atención</h3>
                    <p className="text-gray-300">Lunes a viernes: 10:00 - 19:00</p>
                    <p className="text-gray-300">Sábados: 10:00 - 14:00</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6 text-white">Síguenos</h2>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.instagram.com/gtceuta" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-gray-800 hover:bg-red-600 text-white p-3 rounded-full transition duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://x.com/gtceuta" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-gray-800 hover:bg-red-600 text-white p-3 rounded-full transition duration-300"
                    aria-label="Twitter"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://facebook.com/gtceuta" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-gray-800 hover:bg-red-600 text-white p-3 rounded-full transition duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Formulario de contacto */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Envíanos un mensaje</h2>
              
              {formStatus && (
                <div className={`p-4 mb-6 rounded-lg ${formStatus.success ? 'bg-green-800' : 'bg-red-800'}`}>
                  <p className="text-white">{formStatus.message}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="tu.email@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-gray-300 mb-1">
                    Asunto *
                  </label>
                  <select
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="inscripcion">Inscripción al torneo</option>
                    <option value="alojamiento">Alojamiento y transporte</option>
                    <option value="reglas">Reglas y formato del torneo</option>
                    <option value="colaboracion">Colaboración y patrocinios</option>
                    <option value="otro">Otro asunto</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-300 mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-700 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-400">
                    Acepto la <a href="/privacidad" className="text-red-600 hover:underline">política de privacidad</a>
                  </label>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    <Send size={18} className="mr-2" />
                    Enviar mensaje
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Mapa de ubicación */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Dónde estamos</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d808.4390556456585!2d-5.323231395410313!3d35.89132270025772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0ca3e4929e33eb%3A0x41d3eab324ff063b!2sPunto%20Bibliotecario%20%22Estaci%C3%B3n%20del%20Ferrocarril%22!5e0!3m2!1ses!2ses!4v1713981675848!5m2!1ses!2ses" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del I GT de Ceuta - Punto Bibliotecario 'Estación del Ferrocarril'"
                aria-label="Mapa de la ubicación del I GT de Ceuta"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      {/* Schema.org para LocalBusiness - Mejora SEO */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "I GT de Ceuta - Sede del Evento",
            "image": "https://gtceuta.com/images/img01.jpg",
            "url": "https://gtceuta.com",
            "telephone": "+34-661-648-720",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Avda. de Madrid s/n",
              "addressLocality": "Ceuta",
              "postalCode": "51001",
              "addressCountry": "ES"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "10:00",
                "closes": "19:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "10:00",
                "closes": "14:00"
              }
            ]
          }
        `}
      </script>
    </Layout>
  );
};

export default ContactoPage;