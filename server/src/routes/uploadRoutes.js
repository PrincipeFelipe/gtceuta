const express = require('express');
const uploadController = require('../controllers/uploadController');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Rutas específicas para subir imágenes (sin /api/)
router.post('/upload/blog-image', uploadController.uploadBlogImage);
router.post('/upload/sponsor-image', uploadController.uploadSponsorImage);
router.post('/upload/content-image', uploadController.uploadContentImage);
router.post('/upload/image', uploadController.uploadImage);

// Añadir esta ruta para diagnóstico

// Ruta para diagnosticar problemas con imágenes
router.get('/image-diagnostic', (req, res) => {
  try {
    const { path: imgPath } = req.query;
    
    if (!imgPath) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el parámetro "path"'
      });
    }
    
    // Construir la ruta completa del archivo
    const normPath = imgPath.toString().replace(/^\/uploads\//, '');
    const fullPath = path.join(__dirname, '../../uploads', normPath);
    
    // Verificar si el archivo existe
    const exists = fs.existsSync(fullPath);
    
    // Obtener información adicional si existe
    const fileInfo = exists ? {
      size: fs.statSync(fullPath).size,
      modified: fs.statSync(fullPath).mtime,
      isDirectory: fs.statSync(fullPath).isDirectory()
    } : null;
    
    // Probar diferentes rutas posibles
    const variations = [
      { type: 'Ruta completa', path: fullPath, exists: exists },
      { type: 'Ruta relativa 1', path: path.join(__dirname, '../../uploads/images/blog', path.basename(fullPath)), exists: fs.existsSync(path.join(__dirname, '../../uploads/images/blog', path.basename(fullPath))) },
      { type: 'Ruta relativa 2', path: path.join(__dirname, '../../uploads/images/blog/content', path.basename(fullPath)), exists: fs.existsSync(path.join(__dirname, '../../uploads/images/blog/content', path.basename(fullPath))) }
    ];
    
    res.json({
      success: true,
      queryPath: imgPath,
      normalizedPath: normPath,
      fullPath,
      exists,
      fileInfo,
      variations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

module.exports = router;