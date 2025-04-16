const express = require('express');
const sponsorsController = require('../controllers/sponsorsController');

const router = express.Router();

// Rutas específicas primero
router.post('/sponsors/import', sponsorsController.importSponsors);

// Rutas genéricas después
router.get('/sponsors', sponsorsController.getAllSponsors);
router.get('/sponsors/:id', sponsorsController.getSponsorById);
router.post('/sponsors', sponsorsController.createSponsor);
router.put('/sponsors/:id', sponsorsController.updateSponsor);
router.delete('/sponsors/:id', sponsorsController.deleteSponsor);

module.exports = router;