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

// Crear un path absoluto para la carpeta uploads
const uploadsPath = path.resolve(__dirname, '../uploads');

// Verificar que existe el directorio
if (!fs.existsSync(uploadsPath)) {
  console.log(`Creando directorio de uploads: ${uploadsPath}`);
  fs.mkdirSync(uploadsPath, { recursive: true });
}

console.log(`Sirviendo archivos estáticos desde: ${uploadsPath}`);

// Configurar middleware para servir archivos estáticos correctamente
app.use('/uploads', (req, res, next) => {
  // Log detallado para depuración
  console.log(`Solicitud de archivo estático: ${req.url}`);
  
  const filePath = path.join(uploadsPath, req.url);
  
  // Verificar que el archivo existe y registrar resultado
  if (fs.existsSync(filePath)) {
    console.log(`✅ Sirviendo archivo: ${filePath}`);
    // Añadir cabeceras para mejorar el caching y prevenir problemas CORS
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
  }
  
  next();
});

// Este middleware debe estar DESPUÉS del anterior
app.use('/uploads', express.static(uploadsPath));

// Middlewares

// Actualizar la configuración CORS

// Configuración CORS más permisiva para desarrollo
app.use(cors({
  origin: function(origin, callback) {
    // Permitir cualquier origen en desarrollo
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Solo para producción, configura orígenes específicos
/*
app.use(cors({
  origin: ['https://gtceuta.com', 'https://www.gtceuta.com'],
  credentials: true
}));
*/

app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Añadir esta ruta de diagnóstico

// Ruta para verificar archivos estáticos
app.get('/api/check-static', (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un parámetro "path"'
      });
    }
    
    // Normalizar la ruta para asegurarse de que no hay "../" o similar
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    
    // Construir ruta completa
    const fullPath = path.join(uploadsPath, normalizedPath);
    
    // Verificar si existe
    const exists = fs.existsSync(fullPath);
    
    // Obtener información del archivo
    let fileInfo = null;
    if (exists) {
      const stats = fs.statSync(fullPath);
      fileInfo = {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    }
    
    res.json({
      success: true,
      filePath: normalizedPath,
      fullPath,
      exists,
      fileInfo,
      baseUploadsPath: uploadsPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para listar todos los archivos en uploads
app.get('/api/list-uploads', (req, res) => {
  const listFilesRecursive = (dir, baseDir, results = []) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      
      if (fs.statSync(fullPath).isDirectory()) {
        listFilesRecursive(fullPath, baseDir, results);
      } else {
        results.push({
          path: relativePath,
          size: fs.statSync(fullPath).size,
          url: `/uploads/${relativePath}`
        });
      }
    });
    
    return results;
  };
  
  try {
    const files = listFilesRecursive(uploadsPath, uploadsPath);
    
    res.json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('Rutas disponibles:');
  console.log('- POST /upload/blog-image');
  console.log('- POST /upload/content-image');
  console.log('- POST /upload/image');
  console.log(`Archivos estáticos en http://localhost:${port}/uploads`);
  console.log(`Directorio de uploads: ${uploadsPath}`);
});