require('dotenv').config();
const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors());

// * para o express identificar parametros via url e json
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// * importação das rotas
app.use('/user', require('./routes/userRoute'));
app.use('/dealer', require('./routes/dealerRoute'));
app.use('/faturamento', require('./routes/faturamentoRoute'));
app.use('/showroom', require('./routes/showroomRoute'));

module.exports = app;
