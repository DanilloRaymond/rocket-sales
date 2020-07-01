const express = require('express');
const jwt = require('jsonwebtoken');
const controller = require('../controllers/showroomController');

const router = express.Router();

// eslint-disable-next-line consistent-return
function auth(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'Token não informado.' });

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ auth: false, message: 'Token inválido.' });

    req.userId = decoded.user;
    req.userEmail = decoded.email;
    next();
  });
}

router.post('/createCliente', auth, controller.createCliente); // CADASTRAR CLIENTE
router.get('/getAllUserDealer', auth, controller.getAllUserDealer); // PEGANDO USUÁRIOS DO DEALER
router.get('/getAllClientesDealer', auth, controller.getAllClientesDealer); // PEGANDO CLIENTES DO DEALER
router.get('/getClienteForEdit', auth, controller.getClienteForEdit); // PEGANDO DADOS DO CLIENTE PARA EDIÇÃO
router.post('/updateDadosCliente', auth, controller.updateDadosCliente); // ATUALIZANDO DADOS DO CLIENTE
router.post('/registerHourSaidaCliente', auth, controller.registerHourSaidaCliente); // REGISTRANDO HORÁRIO DE SAÍDA DO CLIENTE DA LOJA

module.exports = router;
