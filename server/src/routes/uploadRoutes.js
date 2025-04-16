const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Rutas específicas para subir imágenes (sin /api/)
router.post('/upload/blog-image', uploadController.uploadBlogImage);
router.post('/upload/sponsor-image', uploadController.uploadSponsorImage);
router.post('/upload/content-image', uploadController.uploadContentImage);
router.post('/upload/image', uploadController.uploadImage);

// Añade esta ruta para eliminar imágenes
router.delete('/delete-image', uploadController.deleteImage);

module.exports = router;