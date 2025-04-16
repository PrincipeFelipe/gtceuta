import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import blogRoutes from './routes/blogRoutes';
import sponsorsRoutes from './routes/sponsorsRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Crear directorios para subidas si no existen
const uploadsDir = path.join(__dirname, '../../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const blogImagesDir = path.join(imagesDir, 'blog');
const contentImagesDir = path.join(blogImagesDir, 'content');
const sponsorsImagesDir = path.join(imagesDir, 'sponsors');

[uploadsDir, imagesDir, blogImagesDir, contentImagesDir, sponsorsImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // O tu URL del frontend
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Asegurarse de que esto está configurado correctamente
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Rutas API
app.use('/api', blogRoutes);
app.use('/api', sponsorsRoutes);
app.use('/', uploadRoutes); // Esto permite acceder a /upload/blog-image directamente

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del GT Ceuta funcionando correctamente');
});

// Middleware para manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('Rutas disponibles:');
  console.log('- POST /upload/blog-image');
  console.log('- POST /upload/content-image');
  console.log('- POST /upload/image');
  console.log(`Archivos estáticos en http://localhost:${port}/uploads`);
  console.log(`Directorio de uploads: ${path.join(__dirname, '../../uploads')}`);
});