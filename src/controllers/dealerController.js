const mysql = require('mysql2/promise');
const validator = require('validator');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

exports.create = async (req, res) => {
  try {
    const dealer = req.body;

    // * se não foi enviado algum parâmetro obrigatório, retorno erro 400.
    if (
      dealer.nome === undefined ||
      dealer.fabricante === undefined ||
      dealer.plano === undefined ||
      dealer.contaFaturamento === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Requisição inválida.',
      });
    }

    // * validação
    if (!dealer.nome.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'nome',
        motivo: 'vazio',
        mensagem: 'O nome não foi informado.',
      });
    }

    // * validação
    if (!dealer.fabricante.trim()) {
      return res.status(400).send({
        status: 'erro',
        tipo: 'validação',
        campo: 'fabricante',
        motivo: 'vazio',
        mensagem: 'O fabricante não foi informado.',
      });
    }


    try {
      const connection2 = await mysql.createConnection(dbConfig);
      // todo: alterar esse insert. nomear os campos.
      const [result2] = await connection2.query('INSERT INTO dealer (nome, fabricante, plano, contaFaturamento) values (?,?,?,?)', [dealer.nome,dealer.fabricante,dealer.plano,dealer.contaFaturamento]);
      await connection2.end();

      const connection3 = await mysql.createConnection(dbConfig);
      const [result3] = await connection3.query(
        'INSERT INTO dealerUsers (user, dealer, permissao) values (?, ?, ?)',
        [
          req.userId,
          result2.insertId,
          4, // * administrador
        ]
      );
      await connection3.end();

      //PEGANDO AS ROTAS DO PLANO SELECIONADO PELO CLIENTE
      const connection4 = await mysql.createConnection(dbConfig);
      const [rows4] = await connection4.query(
        'SELECT rotas FROM  sistemasrotas WHERE (plano <= ?)',[dealer.plano]
      );
      await connection4.end();

      return res.status(200).send({
        status: 'ok',
        mensagem: 'Dealer incluído com sucesso.',
        dealer: result2.insertId,
        getRotas:rows4,
        permissao:4,
        nomeEmpresa:dealer.nome
      });
    } catch (err) {
      console.log(err)
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao inserir o dealer.',
      });
    }
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao inserir o dealer.',
    });
  }
};

//PEGANDO TODOS OS DEALERS CADASTRADOS PELO USUÁRIO
exports.getAll = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [
      dealers,
    ] = await connection.query(
      'SELECT dealer.id, dealer.nome FROM dealerUsers INNER JOIN dealer ON dealerUsers.dealer = dealer.id WHERE user = ?',
      [req.userId]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      dealers,
    });
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao inserir o dealer.',
    });
  }
};

//DEFININDO A EMPRESA PRINCIPAL DO USUÁRIO
exports.principal = async (req, res) => {
  try {
    const { dealer } = req.body;

    // * se não foi enviado algum parâmetro obrigatório, retorno erro 400.
    if (dealer === undefined) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Requisição inválida.',
      });
    }

    try {
      const connection3 = await mysql.createConnection(dbConfig);
      await connection3.query(
        'UPDATE dealerUsers SET principal = IF(dealer = ?, 1, 0) WHERE user = ?',
        [dealer, req.userId]
      );
      await connection3.end();

      const connection4 = await mysql.createConnection(dbConfig);
      const [rows4] = await connection4.query(
        'SELECT plano,nome FROM`rocket-sales`.dealer WHERE (id  = ?)',dealer
      );
      await connection4.end();

      const connection5 = await mysql.createConnection(dbConfig);
      const [rows5] = await connection5.query(
        'SELECT rotas FROM `rocket-sales`. sistemasrotas WHERE (plano <= ?)',rows4[0].plano
      );
      await connection5.end();

      const connection6 = await mysql.createConnection(dbConfig);
      const [rows6] = await connection6.query(
        'SELECT permissao FROM `rocket-sales`.dealerusers WHERE (user = ?) And (dealer = ?)',[req.userId,dealer]
      );
      await connection6.end();

      return res.status(200).send({
        status: 'ok',
        mensagem: 'Dealer principal definido.',
        getRotas:rows5,
        plano:rows4[0].plano,
        nomeEmpresa:rows4[0].nome,
        permissao:rows6.length > 0 ? rows6[0].permissao : 0,
      });

    } catch (err) {
      console.log(err)
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao inserir o dealer.',
      });
    }
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao inserir o dealer.',
    });
  }
};

exports.convidar = async (req, res) => {
  try {
    const convite = req.body;

    // * se não foi enviado algum parâmetro obrigatório, retorno erro 400.
    if (
      convite.email === undefined ||
      convite.permissao === undefined ||
      convite.dealer === undefined
    ) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Requisição inválida.',
      });
    }

    // * validação
    if (!validator.isEmail(convite.email)) {
      return res.status(400).send({
        status: 'erro',
        mensagem: 'E-mail inválido.',
      });
    }

    try {
      const connection3 = await mysql.createConnection(dbConfig);
      await connection3.query(
        'INSERT INTO dealerConvites (dealer, admin, email, permissao) VALUES (?, ?, ?, ?)',
        [convite.dealer, req.userId, convite.email, convite.permissao]
      );
      await connection3.end();

      return res.status(200).send({
        status: 'ok',
        mensagem: 'Usuário convidado com sucesso.',
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao convidar o usuário.',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro ao convidar o usuário.',
    });
  }
};

//* Modulos liberados para o dealer
exports.PlansBycompany = async (req, res) => {
  const dealer = req.query.dealer;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [modulos] = await connection.query(
      'SELECT DISTINCT modulo,rotas, sistemasrotas.id FROM `rocket-sales`.dealer INNER JOIN `rocket-sales`. sistemasrotas ON `rocket-sales`.dealer.plano >= `rocket-sales`. sistemasrotas.plano WHERE (dealer.id = ?) AND (modulo <> "painel")',
      [dealer]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      modulos:modulos
    });
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro.',
    });
  }
};


//* Todas Contas de faturamentos cadastrada pelo o Usuário
exports.UserbillingAccounts = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [contas] = await connection.query(
      'SELECT cnpj,id,razaoSocial FROM faturamento WHERE (user = ?)',
      [req.userId]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      contas:contas
    });
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro.',
    });
  }
};

//* Todas as funcionalidades do Modulo
exports.configurationModulosMenus = async (req, res) => {
  const codModulo = req.query.codModulo
  const permissao = req.query.permissao
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [menus] = await connection.query(
      'SELECT icon,permissao,menu,grupoMenu,CONCAT("/", sistemasrotas.rotas,menumodulos.link) AS link FROM `rocket-sales`.menumodulos INNER JOIN `rocket-sales`. sistemasrotas ON `rocket-sales`.menumodulos.codModulo = `rocket-sales`. sistemasrotas.id WHERE (codModulo = ?) AND (permissao <= ?)',
      [codModulo,permissao]
    );
    await connection.end();

    return res.status(200).send({
      status: 'ok',
      menus:menus
    });
  } catch (err) {
    return res.status(400).send({
      status: 'erro',
      mensagem: 'Ocorreu um erro.',
    });
  }
};
