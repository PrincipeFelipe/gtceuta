import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import OptimizedImage from '../components/OptimizedImage';
import ImageViewer from '../components/ImageViewer';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  caption: string;
  category: 'torneos' | 'miniaturas' | 'sede' | 'eventos';
}

const GaleriaPage = () => {
  const [activeCategory, setActiveCategory] = useState<'todos' | 'torneos' | 'miniaturas' | 'sede' | 'eventos'>('todos');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Datos de ejemplo para la galería - en producción esto vendría de un CMS
  const galleryImages: GalleryImage[] = [
    {
      id: 1,
      src: '/images/gallery/torneo-anterior-1.jpg',
      alt: 'Torneo anterior de Warhammer 40k',
      caption: 'GT de Warhammer 40k 2024',
      category: 'torneos'
    },
    {
      id: 2,
      src: '/images/gallery/miniatura-1.jpg',
      alt: 'Ejército de Space Marines pintado',
      caption: 'Ejército de Space Marines - Campeón del torneo 2024',
      category: 'miniaturas'
    },
    {
      id: 3,
      src: '/images/gallery/sede-1.jpg',
      alt: 'Centro Cultural La Estación de Ferrocarril',
      caption: 'Sede del I GT de Ceuta',
      category: 'sede'
    },
    {
      id: 4,
      src: '/images/gallery/evento-1.jpg',
      alt: 'Entrega de premios torneo anterior',
      caption: 'Ceremonia de entrega de premios',
      category: 'eventos'
    },
    {
      id: 5,
      src: '/images/gallery/torneo-anterior-2.jpg',
      alt: 'Partidas en curso durante un torneo',
      caption: 'Partidas simultáneas en torneo oficial',
      category: 'torneos'
    },
    {
      id: 6,
      src: '/images/gallery/miniatura-2.jpg',
      alt: 'Ejército de Necrones pintado',
      caption: 'Ejército de Necrones - Mejor pintura 2024',
      category: 'miniaturas'
    },
    {
      id: 7,
      src: '/images/gallery/sede-2.jpg',
      alt: 'Mesas de juego preparadas',
      caption: 'Preparación de las mesas para el torneo',
      category: 'sede'
    },
    {
      id: 8,
      src: '/images/gallery/evento-2.jpg',
      alt: 'Jugadores participantes',
      caption: 'Participantes del último torneo celebrado',
      category: 'eventos'
    },
    {
      id: 9,
      src: '/images/gallery/miniatura-3.jpg',
      alt: 'Diorama de batalla Warhammer 40k',
      caption: 'Diorama presentado en la exposición de pintura',
      category: 'miniaturas'
    }
  ];

  // Filtrar imágenes por categoría
  const filteredImages = activeCategory === 'todos' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const openImageViewer = (src: string) => {
    setSelectedImage(src);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  return (
    <Layout>
      <Helmet>
        <title>Galería | I GT de Ceuta 2025 - Warhammer 40.000</title>
        <meta name="description" content="Galería de imágenes del I Gran Torneo de Warhammer 40.000 en Ceuta. Fotos de torneos anteriores, miniaturas, sede del evento y más." />
        <meta name="keywords" content="galería Warhammer 40k, fotos torneo Ceuta, miniaturas pintadas, imágenes wargame" />
        <link rel="canonical" href="https://gtceuta.com/galeria" />
        <meta property="og:title" content="Galería | I GT de Ceuta - Warhammer 40.000" />
        <meta property="og:description" content="Imágenes de torneos anteriores, miniaturas y eventos relacionados con el I GT de Ceuta." />
        <meta property="og:url" content="https://gtceuta.com/galeria" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-red-600">Galería</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Descubre imágenes de torneos anteriores, miniaturas destacadas y la sede donde 
              se celebrará el I Gran Torneo de Warhammer 40.000 en Ceuta.
            </p>
            
            {/* Filtros de categoría */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setActiveCategory('todos')}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  activeCategory === 'todos' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveCategory('torneos')}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  activeCategory === 'torneos' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Torneos anteriores
              </button>
              <button
                onClick={() => setActiveCategory('miniaturas')}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  activeCategory === 'miniaturas' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Miniaturas
              </button>
              <button
                onClick={() => setActiveCategory('sede')}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  activeCategory === 'sede' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Sede del evento
              </button>
              <button
                onClick={() => setActiveCategory('eventos')}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  activeCategory === 'eventos' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Eventos
              </button>
            </div>
          </div>

          {/* Galería de imágenes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className="group bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:transform hover:scale-[1.02]"
                onClick={() => openImageViewer(image.src)}
              >
                <div className="relative h-64">
                  <OptimizedImage
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-lg font-bold px-4 py-2 bg-red-600 rounded-lg">
                      Ver imagen
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-300 text-center">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje cuando no hay imágenes en la categoría seleccionada */}
          {filteredImages.length === 0 && (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <p className="text-xl text-gray-300">
                No hay imágenes disponibles en esta categoría por el momento.
              </p>
              <button
                onClick={() => setActiveCategory('todos')}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                Ver todas las imágenes
              </button>
            </div>
          )}

          {/* Llamada a participar y enviar fotos */}
          <div className="mt-20 bg-gradient-to-r from-red-900 to-red-700 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">¿Tienes fotos de torneos anteriores?</h2>
            <p className="text-white mb-6">
              Si has participado en torneos anteriores y tienes fotos que te gustaría compartir, 
              envíanoslas y las incluiremos en nuestra galería.
            </p>
            <a 
              href="/contacto" 
              className="inline-block bg-white text-red-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Enviar fotos
            </a>
          </div>
        </div>
      </div>

      {/* Visor de imagen ampliada */}
      {selectedImage && (
        <ImageViewer 
          imageUrl={selectedImage} 
          onClose={closeImageViewer}
          title="Galería GT Ceuta" 
        />
      )}

      {/* Schema.org para ImageGallery - Mejora SEO */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "Galería del I GT de Ceuta - Warhammer 40.000",
            "description": "Colección de imágenes relacionadas con el I Gran Torneo de Warhammer 40.000 en Ceuta.",
            "image": ${JSON.stringify(galleryImages.map(img => `https://gtceuta.com${img.src}`))}
          }
        `}
      </script>
    </Layout>
  );
};

export default GaleriaPage;