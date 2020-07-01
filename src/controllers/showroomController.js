const mysql = require('mysql2/promise');
const validator = require('validator');
const moment = require('moment');
const validarCpf = require('validar-cpf');
const {removerCharCelular} = require('../util/removerCharCelular');
const {formatDatetimeIsvalid,func_datetime,func_date} = require('../util/formatDatetimeIsvalid');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

exports.createCliente = async (req, res) => {
  try {

    const cliente = req.body;

    // * se não foi enviado algum parâmetro obrigatório, retorno erro 400.
    if (
      cliente.nomeCliente === undefined ||
      cliente.tel1 === undefined ||
      cliente.email === undefined ||
      cliente.veiculoInteresse === undefined ||
      cliente.vendedor === undefined ||
      cliente.horaentrada === undefined ||
      cliente.tipoclientemidia === undefined ||
      cliente.obscliente === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Requisição inválida.',
      });
    }

    // * validação
    if (!cliente.nomeCliente.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'nome',
        motivo: 'vazio',
        mensagem: 'O nome não foi informado.',
      });
    }

    // * validação
    var validaCelular = removerCharCelular(cliente.tel1)
    if (validaCelular.substring(2, 3) != "9" || validaCelular.length != 11) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'tel1',
        motivo: 'inválido',
        mensagem: 'Não foi informado um celular válido.',
      });
    }

    // * validação
    if (!validator.isEmail(cliente.email)) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'email',
        motivo: 'inválido',
        mensagem: 'Não foi informado um e-mail válido.',
      });
    }

    // * validação
    if (!cliente.veiculoInteresse.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'veiculoInteresse',
        motivo: 'vazio',
        mensagem: 'O veículo não foi informado.',
      });
    }

    // * validação
    if (cliente.vendedor == "") {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'vendedor',
        motivo: 'vazio',
        mensagem: 'O vendedor não foi informado.',
      });
    }

    // * validação
    var horaentrada = formatDatetimeIsvalid(cliente.horaentrada)

    if (formatDatetimeIsvalid(cliente.horaentrada) == null){
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'horaentrada',
        motivo: 'inválido',
        mensagem: 'O data e hora inválida.',
      });
    }

    // * validação
    if (cliente.tipoclientemidia == "") {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'tipoclientemidia',
        motivo: 'vazio',
        mensagem: 'O tipo de mídia não foi informado.',
      });
    }

    // * validação
    if (!cliente.obscliente.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'obscliente',
        motivo: 'vazio',
        mensagem: 'A observação não foi informado.',
      });
    }

    try {
      const connection2 = await mysql.createConnection(dbConfig);
      const [result2] = await connection2.query('INSERT INTO dealerclientes (nome,telefone1,email,veiculo,vendedor,horaentrada,tipomidia,obscliente,cadastradopor,cadastradoem,coddealer) values (?,?,?,?,?,?,?,?,?,?,?)', [cliente.nomeCliente,cliente.tel1,cliente.email,cliente.veiculoInteresse,cliente.vendedor,horaentrada,cliente.tipoclientemidia,cliente.obscliente,req.userId,func_datetime(),cliente.coddealer]);
      await connection2.end();

      return res.status(200).send({
        status: 'ok',
        mensagem: 'Cliente cadastrado com sucesso!.',
      });
    } catch (err) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao inserir o cliente.',
      });
    }
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao inserir o cliente.',
    });
  }
};

// pegando todos os usuários do dealer
exports.getAllUserDealer = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [
      dealersUser,
    ] = await connection.query(
      'SELECT `rocket-sales`.user.id, CONCAT(`rocket-sales`.user.NOME," (",`rocket-sales`.permissoes.NOME,")" ) AS permissao FROM `rocket-sales`.dealerusers  INNER JOIN `rocket-sales`.user ON `rocket-sales`.dealerusers.user =  `rocket-sales`.user.id INNER JOIN `rocket-sales`.permissoes ON `rocket-sales`.dealerusers.permissao = `rocket-sales`.permissoes.id WHERE (dealerusers.dealer = ?)',
      [req.query.coddealer]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      dealersUser,
    });
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro!',
    });
  }
};

// pegando todos os clientes do Dealer
exports.getAllClientesDealer = async (req, res) => {

  filterLoja = req.query.filterLoja

  var filter = "";

  if(filterLoja == "clientenaloja"){
    filter = "AND (horasaida IS NULL) "
  }else if(filterLoja == "clienteforaloja"){
    filter = "AND (horasaida IS NOT NULL) "
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [data] = await connection.query(
      'SELECT dealerclientes.nome,`rocket-sales`.user.nome as vendedor,veiculo,DATE_FORMAT(horaentrada,"%d/%m/%Y %H:%i:%s") AS horaentrada ,DATE_FORMAT(horasaida,"%d/%m/%Y %H:%i:%s") AS horasaida,`rocket-sales`.dealerclientes.id as codcli FROM `rocket-sales`.dealerclientes INNER JOIN `rocket-sales`.user ON `rocket-sales`.dealerclientes.vendedor = `rocket-sales`.user.id  WHERE (coddealer = ?) AND convert(cadastradoem,DATE) BETWEEN convert("'+func_date(req.query.datainicial)+'",DATE) AND convert("'+func_date(req.query.datafinal)+'",DATE) '+filter+'',
      [req.query.coddealer]
    );
    await connection.end();
    return res.status(200).send({data});
    }catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro!',
    });
  }
};

// Selecionando o cliente para edição
exports.getClienteForEdit = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [
      dadosCliente,
    ] = await connection.query(
      'SELECT DATE_FORMAT(horaentrada,"%d/%m/%Y %H:%i:%s") AS horaentrada,dealerclientes.nome, dealerclientes.cpf, DATE_FORMAT(dtnasc,"%d/%m/%Y") AS dtnasc, telefone1, telefone2, dealerclientes.email, veiculo, `rocket-sales`.user.id as vendedor, tipomidia, dealerclientes.obscliente FROM `rocket-sales`.dealerclientes  INNER JOIN `rocket-sales`.user ON `rocket-sales`.dealerclientes.vendedor = `rocket-sales`.user.id  WHERE  (`rocket-sales`.dealerclientes.id = ?) AND dealerclientes.coddealer = ?',
      [req.query.codcli,req.query.coddealer]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      dadosCliente,
    });
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro!',
    });
  }
};

// atualizando dados do cliente
exports.updateDadosCliente = async (req, res) => {
  try {

    const cliente = req.body;

    // * se não foi enviado algum parâmetro obrigatório, retorno erro 400.
    if (
      cliente.nomeCliente === undefined ||
      cliente.tel1 === undefined ||
      cliente.tel2 === undefined ||
      cliente.email === undefined ||
      cliente.cpf === undefined ||
      cliente.dtnasc === undefined ||
      cliente.veiculoInteresse === undefined ||
      cliente.vendedor === undefined ||
      cliente.tipoclientemidia === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Requisição inválida.',
      });
    }

    // * validação
    if (!cliente.nomeCliente.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'nome',
        motivo: 'vazio',
        mensagem: 'O nome não foi informado.',
      });
    }

    // * validação
    var validaCelular = removerCharCelular(cliente.tel1)
    if (validaCelular.substring(2, 3) != "9" || validaCelular.length != 11) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'tel1',
        motivo: 'inválido',
        mensagem: 'Não foi informado um celular válido.',
      });
    }


    // * validação
    if (!validator.isEmail(cliente.email)) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'email',
        motivo: 'inválido',
        mensagem: 'Não foi informado um e-mail válido.',
      });
    }

    // * validação
    if (!cliente.veiculoInteresse.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'veiculoInteresse',
        motivo: 'vazio',
        mensagem: 'O veículo não foi informado.',
      });
    }

    // * validação
    if (cliente.vendedor == "") {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'vendedor',
        motivo: 'vazio',
        mensagem: 'O vendedor não foi informado.',
      });
    }


    // * validação
    if (cliente.tipoclientemidia == "") {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'tipoclientemidia',
        motivo: 'vazio',
        mensagem: 'O tipo de mídia não foi informado.',
      });
    }

    // * validação
    if (!validarCpf(cliente.cpf)) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'cpf',
        motivo: 'vazio',
        mensagem: 'O CPF é inválido.',
      });
    }

    // * validação
    if (func_date(cliente.dtnasc) == null) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'dtnasc',
        motivo: 'vazio',
        mensagem: 'O Data de nascimento é inválida.',
      });
    }

    try {
      const connection2 = await mysql.createConnection(dbConfig);
      const [result2] = await connection2.query('UPDATE `rocket-sales`.`dealerclientes` SET `nome` = ?, `telefone1` = ? ,`telefone2` = ?, `email` = ?, `cpf` = ?, `dtnasc` = ?, `veiculo` = ?, `vendedor` = ?, `tipomidia` = ? WHERE (`id` = ?) AND (`coddealer` = ?)', [cliente.nomeCliente,cliente.tel1,cliente.tel2,cliente.email,cliente.cpf,func_date(cliente.dtnasc),cliente.veiculoInteresse,cliente.vendedor,cliente.tipoclientemidia,cliente.codcli,cliente.coddealer]);
      await connection2.end();

      return res.status(200).send({
        status: 'ok',
        mensagem: 'Cliente atualizado com sucesso!.',
      });

    } catch (err) {
      console.log(err)
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao atualizar o cliente.',
      });
    }
  } catch (err) {

    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao atualizar o cliente.',
    });
  }
};

// registrando horario de saida do cliente
exports.registerHourSaidaCliente = async (req, res) => {
  try {

    const cliente = req.body;

    // * se não foi enviado algum parâmetro obrigatório, retorno erro 400.
    if (
      cliente.horaentrada === undefined ||
      cliente.horasaida === undefined ||
      cliente.codcli === undefined ||
      cliente.coddealer === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Requisição inválida.',
      });
    }

    // validação
    // Verificando se pode inserir esse periodo de date e hora

    if(formatDatetimeIsvalid(cliente.horaentrada) == null || formatDatetimeIsvalid(cliente.horasaida) == null){
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'horasaida',
        motivo: 'vazio',
        mensagem: 'O Data e hora de saída inválida.',
      });
    }

    // Verificando se a data de entrada é menos que a de saída
    if(moment(formatDatetimeIsvalid(cliente.horasaida)).isBefore(formatDatetimeIsvalid(cliente.horaentrada))){
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'horasaida',
        motivo: 'vazio',
        mensagem: 'Você não pode inserir uma data e hora menor que a hora de entrada!',
      });
    }

    try {
      const connection2 = await mysql.createConnection(dbConfig);
      const [result2] = await connection2.query('UPDATE `rocket-sales`.`dealerclientes` SET `horasaida` = ? WHERE (`id` = ?) AND (`coddealer` = ?)', [formatDatetimeIsvalid(cliente.horasaida),cliente.codcli,cliente.coddealer]);
      await connection2.end();

      return res.status(200).send({
        status: 'ok',
        mensagem: 'Horário registrado com sucesso!.',
      });

    } catch (err) {
      console.log(err)
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao registrar o horário.',
      });
    }
  } catch (err) {
    console.log(err)
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao atualizar o horário.',
    });
  }
};
