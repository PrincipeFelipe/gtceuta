const express = require('express');
const blogController = require('../controllers/blogController');

const router = express.Router();

// Rutas específicas primero
router.get('/posts/slug/:slug', blogController.getPostBySlug);
router.get('/posts/export', blogController.exportPosts);
router.post('/posts/import', blogController.importPosts);

// Rutas genéricas después
router.get('/posts', blogController.getAllPosts);
router.get('/posts/:id', blogController.getPostById);
router.post('/posts', blogController.createPost);
router.put('/posts/:id', blogController.updatePost);
router.delete('/posts/:id', blogController.deletePost);

module.exports = router;