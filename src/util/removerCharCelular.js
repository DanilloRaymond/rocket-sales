const removerCharCelular = function removerCharCelular(value) {
  if(!value == ""){
    var resultado = value.replace("(","").replace(")", "").replace("-", "").replace(" ", '');
  }

  return resultado
}

module.exports = {
  removerCharCelular,
}
