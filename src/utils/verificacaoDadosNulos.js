const verificarDadosNulos = (dados) =>{

    Object.keys(dados).forEach((key) => (dados[key] == null || dados[key] === '') && delete dados[key]);

    if (Object.keys(dados).length === 0) {
      return true;
    }
    return false;
};

module.exports = {verificarDadosNulos}