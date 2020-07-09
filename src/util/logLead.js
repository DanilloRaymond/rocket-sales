
const mysql = require('mysql2/promise');
const tratamentoErros = require('./tratamentoErros');
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const logLead = async function logLead(acao,userId,dealer,lead,observacao) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [
      rows,
    ] = await connection.query(
      'INSERT INTO `rocket-sales`.`logleads` (`acao`, `user`, `dealer`, `lead`, `observacao`) VALUES (?,?,?,?,?)',[acao,userId,dealer,lead,observacao]
    );
    await connection.end();
    return //console.log("Log inserido com sucesso!");
  } catch (err) {
    console.log(err);
    tratamentoErros(null, null, err);
  }
};

module.exports = logLead;
