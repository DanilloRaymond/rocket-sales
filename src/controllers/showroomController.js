const mysql = require('mysql2/promise');
const moment = require('moment');
const validator = require('validator');
const cpfValidator = require('cpf');
const tratamentoErros = require('../util/tratamentoErros');
const logLead = require('../util/logLead');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

exports.cadastro = async (req, res) => {
  try {
    const {
      nome,
      email,
      veiculoInteresse,
      vendedor,
      comoconheceu,
      horaEntrada,
      observacao,
      dealer,
    } = req.body;

    let { telefone1 } = req.body;

    if (
      nome === undefined ||
      telefone1 === undefined ||
      email === undefined ||
      veiculoInteresse === undefined ||
      vendedor === undefined ||
      comoconheceu === undefined ||
      horaEntrada === undefined ||
      observacao === undefined ||
      dealer === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    if (!nome.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O nome do cliente não foi informado.',
      });
    }

    if (!telefone1.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O telefone do cliente não foi informado.',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O e-mail do cliente não foi informado ou está inválido.',
      });
    }

    if (!veiculoInteresse.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O veículo de interesse não foi informado.',
      });
    }

    if (!vendedor.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O vendedor não foi informado.',
      });
    }

    if (!horaEntrada.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A hora de entrada do cliente no showroom não foi informada.',
      });
    }

    const horaEntrada1 = moment(horaEntrada, 'DD/MM/YYYY HH:mm:ss', true).format(
      'YYYY-MM-DD HH:mm:ss'
    );
    if (horaEntrada1 === 'Invalid date') {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A hora de entrada do cliente no showroom é inválida.',
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.query(
      'INSERT INTO leads (nome, telefone1, email, veiculoInteresse,  vendedor, comoconheceu, horaEntrada, observacao, dealer, createdBy) VALUES (?, ?, ?, ?, ?, ?, ? ,? ,?, ?);',
      [
        nome,
        telefone1,
        email,
        veiculoInteresse,
        vendedor,
        comoconheceu,
        horaEntrada1,
        observacao,
        dealer,
        req.userId,
      ]
    );
    //* VAI SALVAR O LOG DO LEAD
    logLead("Cliente inserido",req.userId,dealer,result.insertId)
    await connection.end();
    return res.status(200).send({
      status: 'ok',
      mensagem: 'Cliente cadastrado com sucesso!',
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao cadastrar o cliente.',
    });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const {
      lead,
      nome,
      cpf,
      dataNascimento,
      telefone1,
      telefone2,
      email,
      veiculoInteresse,
      vendedor,
      comoconheceu,
      observacao,
      dealer,
    } = req.body;

    if (
      dealer === undefined ||
      lead === undefined ||
      nome === undefined ||
      cpf === undefined ||
      dataNascimento === undefined ||
      telefone1 === undefined ||
      telefone2 === undefined ||
      email === undefined ||
      veiculoInteresse === undefined ||
      vendedor === undefined ||
      comoconheceu === undefined ||
      observacao === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    if (!nome.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O nome do cliente não foi informado.',
      });
    }

    if (!cpfValidator.isValid(cpf)) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O CPF do cliente não foi informado ou é inválido.',
      });
    }

    if (!telefone1.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O telefone do cliente não foi informado.',
      });
    }

    if (!dataNascimento.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A data de nascimento do cliente não foi informada.',
      });
    }

    const dataNascimento1 = moment(dataNascimento, 'DD/MM/YYYY', true).format('YYYY-MM-DD');
    if (dataNascimento1 === 'Invalid date') {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A data de nascimento do cliente é inválida.',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O e-mail do cliente não foi informado ou está inválido.',
      });
    }

    if (!veiculoInteresse.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O veículo de interesse não foi informado.',
      });
    }

    if (!vendedor.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'O vendedor não foi informado.',
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [
      rows,
    ] = await connection.query(
      'UPDATE leads SET nome = ?, cpf = ?, dataNascimento = ?, telefone1 = ?, telefone2 = ?, email = ?, veiculoInteresse = ?, vendedor = ?, observacao = ?, comoconheceu = ? WHERE id = ? and dealer = ?;',
      [
        nome,
        cpf,
        dataNascimento1,
        telefone1,
        telefone2,
        email,
        veiculoInteresse,
        vendedor,
        observacao,
        comoconheceu,
        lead,
        dealer,
      ]
    );
    await connection.end();
    //* VAI SALVAR O LOG DO LEAD
    logLead("Cliente atualizado",req.userId,dealer,lead)
    return res.status(200).send({
      status: 'ok',
      mensagem: 'Cliente atualizado com sucesso!',
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao atualizar o cliente.',
    });
  }
};

exports.registraSaida = async (req, res) => {
  try {
    const { lead, horaSaida, dealer } = req.body;

    if (lead === undefined || horaSaida === undefined || dealer === undefined) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    const horaSaida1 = moment(horaSaida, 'DD/MM/YYYY HH:mm:ss', true).format('YYYY-MM-DD HH:mm:ss');
    if (horaSaida1 === 'Invalid date') {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A hora de saída do cliente é inválida.',
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [
      rows,
    ] = await connection.query('UPDATE leads SET horaSaida = ? WHERE id = ? and dealer = ?;', [
      horaSaida1,
      lead,
      dealer,
    ]);
    await connection.end();
    //* VAI SALVAR O LOG DO LEAD
    logLead("Saída registrada",req.userId,dealer,lead)
    return res.status(200).send({
      status: 'ok',
      mensagem: 'Cliente atualizado com sucesso!',
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao atualizar o cliente.',
    });
  }
};

exports.registraTestDrive = async (req, res) => {
  try {
    const { lead, testDriveHora, dealer } = req.body;

    if (lead === undefined || testDriveHora === undefined) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    const testDriveHora1 = moment(testDriveHora, 'DD/MM/YYYY HH:mm:ss', true).format(
      'YYYY-MM-DD HH:mm:ss'
    );
    if (testDriveHora1 === 'Invalid date') {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A hora de realização do test drive é inválida.',
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [
      rows,
    ] = await connection.query(
      'UPDATE leads SET testDriveHora = ?, testdrive = 1 WHERE id = ? AND dealer = ?;',
      [testDriveHora1, lead, dealer]
    );
    await connection.end();
    //* VAI SALVAR O LOG DO LEAD
    logLead("Test Drive realizado",req.userId,dealer,lead)
    return res.status(200).send({
      status: 'ok',
      mensagem: 'Test Drive registrado com sucesso!',
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao registrar o test drive.',
    });
  }
};

exports.registraNegativaTestDrive = async (req, res) => {
  try {
    const { lead, testDriveMotivo, dealer } = req.body;

    if (lead === undefined || testDriveMotivo === undefined || dealer === undefined) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [
      rows,
    ] = await connection.query(
      'UPDATE leads SET testDriveMotivo = ?, testdrive = 0 ,testDriveHora = null WHERE id = ? and dealer = ?;',
      [testDriveMotivo, lead, dealer]
    );
    await connection.end();
    //* VAI SALVAR O LOG DO LEAD
    logLead("Test Drive não realizado",req.userId,dealer,lead)
    return res.status(200).send({
      status: 'ok',
      mensagem: 'Informações do Test Drive registrado com sucesso!',
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao registrar o test drive.',
    });
  }
};

exports.listar = async (req, res) => {
  try {
    const { dealer, dataInicial, dataFinal, naLoja } = req.body;

    if (
      dealer === undefined ||
      dataInicial === undefined ||
      dataFinal === undefined ||
      naLoja === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    const dataInicial1 = moment(dataInicial, 'DD/MM/YYYY', true).format('YYYY-MM-DD');
    if (dataInicial1 === 'Invalid date') {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A data inicial é inválida.',
      });
    }

    const dataFinal1 = moment(dataFinal, 'DD/MM/YYYY', true).format('YYYY-MM-DD');
    if (dataFinal1 === 'Invalid date') {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Validação',
        mensagem: 'A data final é inválida.',
      });
    }

    let SQLnaLoja = '';
    if (naLoja === 'true') {
      SQLnaLoja = ' AND horaSaida is null';
    }

    const connection = await mysql.createConnection(dbConfig);
    const [
      leads,
    ] = await connection.query(
      `SELECT  leads.id, leads.nome, user.nome as vendedor, veiculoInteresse, DATE_FORMAT(horaEntrada, "%d/%m/%Y %H:%i:%s") as horaEntrada, DATE_FORMAT(horaSaida, "%d/%m/%Y %H:%i:%s") as horaSaida FROM leads INNER JOIN 	user ON leads.vendedor = user.id  WHERE dealer = ? and horaEntrada BETWEEN ? AND ? ${SQLnaLoja}`,
      [dealer, dataInicial1, dataFinal1]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      leads,
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao obter a lista de leads.',
    });
  }
};

exports.alterarStatus = async (req, res) => {
  try {
    const { dealer, lead, status, numeroPedido, motivoDesistencia } = req.body;

    if (
      dealer === undefined ||
      lead === undefined ||
      status === undefined ||
      numeroPedido === undefined ||
      motivoDesistencia === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    if (status === 'Comprou') {
      if (numeroPedido === '') {
        return res.status(400).send({
          status: 'erro',
          tipo: 'Validação',
          mensagem: 'O número do pedido não foi informado.',
        });
      }
    }

    if (status === 'Desistiu') {
      if (motivoDesistencia === '') {
        return res.status(400).send({
          status: 'erro',
          tipo: 'Validação',
          mensagem: 'Não foi informado o motivo da desistência.',
        });
      }
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.query(
      'UPDATE leads SET statusNegociacao = ?, numeroPedido = NULLIF(?, ""), motivoDesistencia = NULLIF(?, "") WHERE id = ? and dealer = ?;',
      [status, numeroPedido, motivoDesistencia, lead, dealer]
    );
    await connection.end();
    //* VAI SALVAR O LOG DO LEAD
    logLead("Status Lead foi alterado para ("+status+").",req.userId,dealer,lead)
    return res.status(200).send({
      status: 'ok',
      mensagem: 'Cliente atualizado com sucesso!',
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao atualizar cliente.',
    });
  }
};

exports.selecionarLead = async (req, res) => {
  try {
    const {dealer,lead} = req.body;

    if (
      dealer === undefined ||
      lead === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }


    const connection = await mysql.createConnection(dbConfig);
    const [
      dadoslead,
    ] = await connection.query(
      'SELECT  leads.nome,  cpf, leads.dataNascimento, leads.telefone1, leads.telefone2, leads.email, veiculoInteresse, user.id as vendedor,  leads.comoconheceu, leads.observacao, leads.horaEntrada FROM leads INNER JOIN user ON user.id = leads.vendedor WHERE leads.dealer = ? And leads.id = ? ',[dealer,lead]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      dadoslead,
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao obter ao lead.',
    });
  }
};

exports.loglead = async (req, res) => {
  try {
    const {dealer,lead} = req.body;

    if (
      dealer === undefined ||
      lead === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'Falha na Chamada',
        mensagem: 'Requisição inválida.',
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [
      logLeads,
    ] = await connection.query(
      'SELECT acao, user.nome as criadopor, DATE_FORMAT(logleads.createdAt, "%d/%m/%Y %H:%i:%s") as criadoem FROM `rocket-sales`.logleads INNER JOIN user ON logleads.user = user.id WHERE (logleads.lead = ?) AND (logleads.dealer = ?) ORDER BY logleads.createdAt DESC',[lead,dealer]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      logLeads,
    });
  } catch (err) {
    tratamentoErros(req, res, err);
    return res.status(400).send({
      status: 'erro',
      tipo: 'Erro de Servidor',
      mensagem: 'Erro ao obter ao log do lead.',
    });
  }
};
