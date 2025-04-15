import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorios de origen y destino
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

// Asegurar que el directorio dist existe
fs.ensureDirSync(distDir);

// Copiar la carpeta documents completa
const documentsDir = path.join(publicDir, 'documents');
const targetDocumentsDir = path.join(distDir, 'documents');

console.log('Copiando carpeta documents...');
if (fs.existsSync(documentsDir)) {
  fs.copySync(documentsDir, targetDocumentsDir);
  console.log('✅ Carpeta documents copiada correctamente');
  
  // Listar archivos copiados para verificación
  const files = fs.readdirSync(targetDocumentsDir);
  console.log(`   Archivos copiados: ${files.join(', ')}`);
} else {
  console.error('❌ La carpeta documents no existe en public');
}

// Verificar que _redirects exista
const redirectsFile = path.join(publicDir, '_redirects');
const targetRedirectsFile = path.join(distDir, '_redirects');

if (fs.existsSync(redirectsFile)) {
  fs.copySync(redirectsFile, targetRedirectsFile);
  console.log('✅ Archivo _redirects copiado correctamente');
} else {
  console.log('⚠️ Creando archivo _redirects (no existe en public)');
  fs.writeFileSync(targetRedirectsFile, '/*    /index.html   200\n');
  console.log('✅ Archivo _redirects creado correctamente');
}

console.log('Proceso de copia completado con éxito');