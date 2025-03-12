const knex = require("../database/conexao");

const verificarHorarioBloqueado = async (data, horaInicio, horaTermino) => {
  try {
    const bloqueios = await knex("bloqueiohorarios")
      .where("data_bloqueio", "=", data)
      .andWhere((builder) => {
        builder
          .where(function () {
            this.where("hora_inicio", "<=", horaInicio).andWhere("hora_termino", ">=", horaInicio);
          })
          .orWhere(function () {
            this.where("hora_inicio", "<=", horaTermino).andWhere("hora_termino", ">=", horaTermino);
          });
      });

    if (bloqueios.length > 0) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar o horário bloqueado:", error);
    throw error;
  }
};

const verificarHorarioOcupado = async (data_marcacao, hora_inicio, hora_termino, cargo) => {
  try {
    const totalFuncionarios = await knex("usuario").where("cargo", cargo).count("* as total").first();
    const numFuncionarios = parseInt(totalFuncionarios.total);

    const numAgendamentos = await knex("agendamento")
      .count("* as total")
      .where("data_marcacao", data_marcacao)
      .andWhere((builder) => {
        builder
          .where(function () {
            this.where("hora_inicio", ">=", hora_inicio).andWhere("hora_inicio", "<", hora_termino);
          })
          .orWhere(function () {
            this.where("hora_inicio", "<=", hora_inicio).andWhere("hora_termino", ">", hora_inicio);
          });
      })
      .first();

    if (parseInt(numAgendamentos.total) > numFuncionarios) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Erro ao verificar o horário ocupado:", error);
    throw error;
  }
};

const verificarHorarioFuncionamento = (horaInicio, horaTermino) => {
  try {
    if (horaInicio >= "09:00" && horaInicio <= "20:00" && horaTermino >= "09:00") {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao verificar o horário de funcionamento:", error);
    throw error;
  }
};

module.exports = { verificarHorarioBloqueado, verificarHorarioOcupado, verificarHorarioFuncionamento };
