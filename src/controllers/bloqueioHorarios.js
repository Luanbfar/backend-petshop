const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNulos");

const bloquearHorario = async (req, res) => {

    const { data_bloqueio, hora_inicio, hora_termino} = req.body;
  
    try {
     
      const horarioBloqueado = await knex("bloqueiohorarios")
        .insert({
          data_bloqueio,
          hora_inicio,
          hora_termino
        })
        .returning("*");
  
      return res.status(201).json(horarioBloqueado);
  
    } catch (error) {
        console.log("Erro no bloqueio de horario",error);
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const desbloquearHorario = async (req, res) => {

    const { id } = req.params;
  
    try {
  
        const horarioDesbloqueado = await knex("bloqueiohorarios").where({ id }).del();
  
        return res.status(204).json();
  
    } catch (error) {
        console.log("Erro no desbloqueio de horário",error);
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const editarBloqueioHorario = async (req, res) => {

    const { data_bloqueio, hora_inicio, hora_termino} = req.body;

    const { id } = req.params;
  
    try {
     
      const dadosAtualizados = {
          data_bloqueio: data_bloqueio,
          hora_inicio: hora_inicio,
          hora_termino: hora_termino
      };

      const dadosNulos = verificarDadosNulos(dadosAtualizados);
      if (dadosNulos) {
        return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
      }

    const horarioBloqueado = await knex("bloqueiohorarios").update(dadosAtualizados).where("id", id).returning("*");

    return res.status(200).json(horarioBloqueado);
  
    } catch (error) {
        console.log("Erro na edição de horário bloqueado",error);
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const listarHorariosBloqueados = async (req, res) => {
    try {

        const horarios = await knex("bloqueiohorarios").select("*");

        return res.status(200).json(horarios);
    
    } catch (error) {
      console.log("Erro na listagem de horários bloqueados",error);
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

module.exports = { bloquearHorario,desbloquearHorario, editarBloqueioHorario, listarHorariosBloqueados };