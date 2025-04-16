import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import blogRoutes from './routes/blogRoutes';
import sponsorsRoutes from './routes/sponsorsRoutes';
import uploadRoutes from './routes/uploadRoutes';
// Añade esto para programar la limpieza periódica
import * as cron from 'node-cron';
import { cleanOrphanImages } from './scripts/cleanOrphanImages';

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
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Asegurarse de que esto está configurado correctamente
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Middleware de logging para depuración
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas API
app.use('/api', blogRoutes);
app.use('/api', sponsorsRoutes);
app.use('/', uploadRoutes); // Esto permite acceder a /upload/blog-image directamente

// Añadir un middleware para imprimir todas las solicitudes (para depuración)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// Ejecutar limpieza de imágenes cada día a las 3:00 AM
cron.schedule('0 3 * * *', () => {
  console.log('Ejecutando limpieza programada de imágenes...');
  cleanOrphanImages();
});

// Añade esta ruta al final para verificar que el servidor responde correctamente

// Ruta para listar las rutas disponibles y verificar el funcionamiento
app.get('/api/routes', (req, res) => {
  // Recopilar todas las rutas registradas
  const routes: {method: string, path: string}[] = [];
  
  // Función para procesar las rutas en un stack de middleware
  function processStack(stack: any[], baseRoute = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Es una ruta directa
        const methods = Object.keys(middleware.route.methods)
          .filter(method => middleware.route.methods[method])
          .map(method => method.toUpperCase());
        
        routes.push({
          method: methods.join(','),
          path: baseRoute + middleware.route.path
        });
      } else if (middleware.name === 'router') {
        // Es un enrutador, procesar sus rutas
        let subBaseRoute = baseRoute;
        if (middleware.regexp && middleware.regexp.source !== '^\\/?(?=\\/|$)') {
          // Extraer la parte de la ruta base para este enrutador
          const match = middleware.regexp.toString().match(/^\/\^\\\/([^\\]+)/);
          if (match) {
            subBaseRoute += '/' + match[1];
          }
        }
        
        processStack(middleware.handle.stack, subBaseRoute);
      }
    });
  }
  
  // Procesar todas las rutas
  processStack(app._router.stack);
  
  // Enviar información sobre las rutas como respuesta
  res.json({
    routes,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
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