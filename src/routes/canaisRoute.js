const express = require('express');
const controller = require('../controllers/canaisController');

const router = express.Router();

router.post('/enviarEmail', controller.enviarEmail);
router.post('/enviarWhatsApp', controller.enviarWhatsApp);

router.get('/listarMensagens', controller.listarMensagens);

module.exports = router;