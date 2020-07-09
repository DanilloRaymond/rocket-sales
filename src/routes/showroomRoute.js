const express = require('express');
const { auth, authDealer } = require('../util/auth');
const controller = require('../controllers/showroomController');

const router = express.Router();

router.post('/cadastro', auth, authDealer, controller.cadastro);
router.post('/atualizar', auth, authDealer, controller.atualizar);
router.post('/registraSaida', auth, authDealer, controller.registraSaida);
router.post('/registraTestDrive', auth, authDealer, controller.registraTestDrive);
router.post('/registraNegativaTestDrive', auth, authDealer, controller.registraNegativaTestDrive);
router.get('/listar', auth, authDealer, controller.listar);
router.post('/alterarStatus', auth, authDealer, controller.alterarStatus);
router.get('/selecionarLead', auth, authDealer, controller.selecionarLead);
router.get('/loglead', auth, authDealer, controller.loglead);

module.exports = router;
