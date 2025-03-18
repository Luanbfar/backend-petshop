const verificarPorteAnimal = (peso) => {
  let porte;

  if (peso <= 8) {
    porte = "Pequeno";
  } else if (peso > 8 && peso <= 20) {
    porte = "Médio";
  } else if (peso > 20) {
    porte = "Grande";
  }
  return porte;
};

module.exports = { verificarPorteAnimal };
