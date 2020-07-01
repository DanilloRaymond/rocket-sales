const moment = require("moment");

// VALIDA DATA E HORA SE ESTÁ OK NO FORMATO
// CONVERT A DATA E HORA PARA INSERIR NO BANCO DE DADOS NO FORMATO YYYY-MM-DD HH:mm
const formatDatetimeIsvalid = function formatDatetimeIsvalid(data) {
  if(moment(data, 'DD/MM/YYYY HH:mm:ss',true).isValid()){
    var responseDate = moment(data,'DD/MM/YYYY HH:mm:ss',true).format('YYYY-MM-DD HH:mm:ss')
    return responseDate
  }else{
    return null
  }
}

// GETDATE() PARA INSERIR NO BANCO
const func_datetime = function func_datetime() {
    var responseDate = moment().format('YYYY-MM-DD HH:mm:ss')
    return responseDate
}

// CONVERT DATA DE PADRAO MYSQL
const func_date = function func_date(data) {
  if(moment(data, 'DD/MM/YYYY',true).isValid()){
    var responseDate = moment(data, 'DD/MM/YYYY', true).format('YYYY-MM-DD')
    return  responseDate
  }else{
    return null
  }
}

module.exports = {
  formatDatetimeIsvalid,
  func_datetime,
  func_date
}
