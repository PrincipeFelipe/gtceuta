import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';
import { Link } from 'react-router-dom';
import SponsorsService from '../services/SponsorsService';
import { Sponsor } from '../types/SponsorTypes';

const Colaboradores = () => {
  const [patrocinadores, setPatrocinadores] = useState<Sponsor[]>([]);
  const [colaboradores, setColaboradores] = useState<Sponsor[]>([]);
  const [medios, setMedios] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSponsors = async () => {
      setIsLoading(true);
      try {
        const [patronData, colabData, mediosData] = await Promise.all([
          SponsorsService.getSponsorsByType('patrocinador'),
          SponsorsService.getSponsorsByType('colaborador'),
          SponsorsService.getSponsorsByType('medio')
        ]);
        
        setPatrocinadores(patronData);
        setColaboradores(colabData);
        setMedios(mediosData);
      } catch (error) {
        console.error('Error al cargar patrocinadores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSponsors();
  }, []);

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
              Empresas, clubes y comunidades que hacen posible el I GT de Warhammer 40.000 en Ceuta
            </p>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                {/* PATROCINADORES PRINCIPALES */}
                {patrocinadores.length > 0 && (
                  <div className="mt-12 mb-20">
                    <h2 className="text-3xl font-bold mb-8 text-white text-center">Patrocinadores Principales</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                      {patrocinadores.map(patrocinador => (
                        <div key={patrocinador.id} className="w-full max-w-md">
                          <div className="bg-gray-800 p-6 rounded-lg text-center">
                            <OptimizedImage 
                              src={patrocinador.image} 
                              alt={`${patrocinador.name} - Patrocinador del I GT Ceuta`} 
                              className="w-full h-40 object-contain mb-4" 
                            />
                            <h3 className="text-xl font-bold mb-2">{patrocinador.name}</h3>
                            <p className="text-gray-400 mb-4">{patrocinador.description}</p>
                            <a 
                              href={patrocinador.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-red-600 hover:underline"
                            >
                              Visitar sitio web
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COLABORADORES DEL EVENTO */}
                {colaboradores.length > 0 && (
                  <div className="mt-20 mb-20">
                    <h2 className="text-3xl font-bold mb-8 text-white text-center">Colaboradores del Evento</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                      {colaboradores.map(colaborador => (
                        <div 
                          key={colaborador.id}
                          className="w-full max-w-[280px] bg-gray-800 p-5 rounded-lg text-center"
                        >
                          <OptimizedImage 
                            src={colaborador.image} 
                            alt={`${colaborador.name} - Colaborador del I GT Ceuta`} 
                            className="w-full h-32 object-contain mb-3" 
                          />
                          <h3 className="text-lg font-bold mb-2">{colaborador.name}</h3>
                          <p className="text-gray-400 mb-3">{colaborador.description}</p>
                          <a 
                            href={colaborador.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-600 hover:underline text-sm"
                          >
                            Visitar sitio
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* BLOGS Y MEDIOS */}
                {medios.length > 0 && (
                  <div className="mt-20 mb-20">
                    <h2 className="text-3xl font-bold mb-8 text-white text-center">Blogs y Medios Especializados</h2>
                    <p className="text-lg text-gray-300 mb-8 text-center">
                      Medios que colaboran en la difusión del evento y la cobertura en directo
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                      {medios.map(medio => (
                        <div 
                          key={medio.id}
                          className="w-full max-w-[350px] bg-gray-800 p-6 rounded-lg text-center"
                        >
                          {medio.image && (
                            <OptimizedImage 
                              src={medio.image} 
                              alt={`${medio.name} - Medio colaborador del I GT Ceuta`} 
                              className="w-full h-32 object-contain mb-3" 
                            />
                          )}
                          <h3 className="text-xl font-bold mb-2">{medio.name}</h3>
                          <p className="text-gray-400 mb-4">{medio.description}</p>
                          <a 
                            href={medio.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-600 hover:underline"
                          >
                            Visitar medio
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* LLAMADO A LA ACCIÓN */}
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