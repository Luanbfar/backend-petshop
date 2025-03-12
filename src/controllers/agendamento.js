const knex = require("../database/conexao");
const { verificarHorarioBloqueado, verificarHorarioOcupado } = require("../utils/verificacaoHorario");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNullos");
const { tempoPorTamanho, transformandoHora } = require("../utils/agendamentoUtils");
require("dotenv").config();

const TEMPO_P_M = 60;
const TEMPO_G = 120;
const CARGO = 'Colaborador';

const agendar = async (req, res) => {

    const { data_marcacao, cpf_cnpj, hora_inicio, servicos, tipo, confirmacao_agendamento, animal_id } = req.body;

    try {

      const cliente = await knex("usuario").select("*").where('cargo','Cliente').andWhere({cpf_cnpj}).first();
      const animal = await knex("animal").select("*").where("id",animal_id).first();

      if (!cliente) {
        return res.status(404).json({ mensagem: "Cliente não encontrado." });
      };

      if(!animal){
        return res.status(404).json({ mensagem: "Animal não encontrado." });
      };

      const usuario_id = cliente.id;

      const quantidadeServico = servicos.length;
      const [horas, minutos] = hora_inicio.split(':').map(Number);
      let totalMinutos = horas * 60 + minutos;

      totalMinutos = tempoPorTamanho(tipo, totalMinutos, quantidadeServico, TEMPO_P_M, TEMPO_G)
      if (!totalMinutos){
        return res.status(400).json({ mensagem: "Tamanho do animal não identificado." });
      }
      
      const hora_termino = transformandoHora(totalMinutos);
      
      const resposta = await verificarHorarioBloqueado(data_marcacao, hora_inicio, hora_termino);
      if(resposta){
        return res.status(400).json({ mensagem: "Horário indisponível para agendamento." });
      }

      const horarioOcupado = await verificarHorarioOcupado(data_marcacao,hora_inicio,hora_termino, CARGO);
      
      if(!horarioOcupado){
        return res.status(400).json({ mensagem: "Horário ocupado." });
      }

      let valor = null;

      for (let servico of servicos) {

        let serv = await knex('produto_servico').select("*").where('nome', servico).first();

        if (!serv) {
          return res.status(400).json({ mensagem: "Serviço não encontrado." });
        };

        valor+= parseFloat(serv.valor)
      };
      
      const agendamento = await knex("agendamento")
        .insert({
            data_marcacao,
            usuario_id,
            animal_id,
            hora_inicio,
            hora_termino,
            servicos,
            tipo,
            confirmacao_agendamento,
            valor
        })
        .returning("*");
  
      return res.status(201).json(agendamento);
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const excluiAgendamento = async (req, res) => {

    const { id } = req.params;
    try {
      const agendamento = await knex("agendamento")
        .select("*")
        .where({ id })
        .first();
  
      if (!agendamento) {
        return res
          .status(400)
          .json({ mensagem: "Este Cliente ainda não foi cadastrado" });
      }
  
      const agendamentoExcluido = await knex("agendamento").where({ id }).del();
  
      return res.status(204).json();
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const editarAgendamento = async (req, res) => {
  const { id } = req.params;

  const { data_marcacao, hora_inicio, servicos, tipo, confirmacao_agendamento, animal_id } = req.body;

  try {
    
    if(animal_id){

      const animal = await knex("animal").select("*").where("id",animal_id).first();

      if(!animal){
        return res.status(404).json({ mensagem: "Animal não encontrado." });
      };

    }
    const agendamentoAtual = await knex('agendamento').select("*").where({ id }).first();

    let hora_termino;

    if (hora_inicio || servicos || data_marcacao){

      let horaInicio = null;

      if(!hora_inicio){
        horaInicio = agendamentoAtual.hora_inicio;
      }else{
        horaInicio = hora_inicio;
      }

      const [horas, minutos] = horaInicio.split(':');
      let totalMinutos = horas * 60 + minutos;
      let quantidadeServico;
      
      if(!servicos){
        quantidadeServico = agendamentoAtual.servicos.length;
        if(!tipo){
          totalMinutos = tempoPorTamanho(agendamentoAtual.tipo, totalMinutos, quantidadeServico, TEMPO_P_M, TEMPO_G)
        }else if(tipo){
          totalMinutos = tempoPorTamanho(tipo, totalMinutos, quantidadeServico, TEMPO_P_M, TEMPO_G)
        }
      }else if(servicos){
        quantidadeServico = servicos.length;
        if(!tipo){
          totalMinutos = tempoPorTamanho(agendamentoAtual.tipo, totalMinutos, quantidadeServico, TEMPO_P_M, TEMPO_G)
        }else if(tipo){
          totalMinutos = tempoPorTamanho(tipo, totalMinutos, quantidadeServico, TEMPO_P_M, TEMPO_G)
        }
      }

      hora_termino = transformandoHora(totalMinutos);

      const resposta = await verificarHorarioBloqueado(data_marcacao || agendamentoAtual.data_marcacao, horaInicio, hora_termino);
      if(resposta){
        return res.status(400).json({ mensagem: "Horário indisponível para agendamento." });
      }

      const horarioOcupado = verificarHorarioOcupado(data_marcacao,horaInicio,hora_termino,CARGO);

      if (horarioOcupado) {
        return res.status(400).json({ mensagem: "Horário ocupado." });
      }

    };

    let valor = null;

    if(servicos){

      for (let servico of servicos) {

        let serv = await knex('servico').select("*").where('nome', servico).first();
  
        if (!serv) {
          return res.status(400).json({ mensagem: "Serviço não encontrado." });
        };
  
        valor+= serv.valor
      };

    }

    const dadosAtualizados = {
      data_marcacao,
      hora_inicio,
      hora_termino,
      tipo,
      servicos,
      confirmacao_agendamento,
      animal_id,
      valor
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    }

    const agendamento = await knex("agendamento").update(dadosAtualizados).where("id", id).returning("*");

    return res.status(200).json(agendamento);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarConfirmacaoAgendamento = async (req, res) => {
  const { id } = req.params;

  const { confirmacao_agendamento } = req.body;

  try {
  
    const agendamentoAtual = await knex('agendamento').select("*").where({ id }).first();

    const agendamento = await knex("agendamento").update({confirmacao_agendamento}).where("id", agendamentoAtual.id).returning("*");

    return res.status(200).json(agendamento);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAgendamentos = async (req, res) => {
  try {
    
    const agendamentos = await knex("agendamento")
      .join("animal", "agendamento.animal_id", "=", "animal.id") 
      .join("usuario", "agendamento.usuario_id", "=", "usuario.id")
      .select("agendamento.*","animal.nome as nome_animal", "usuario.nome as nome_cliente")
      .orderByRaw("to_date(agendamento.data_marcacao, 'DD/MM/YYYY') DESC")
      .orderBy("agendamento.hora_inicio", "desc");

      return res.status(200).json(agendamentos);
  
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAgendamentosPorData = async (req, res) => {

  const { data } = req.query;
  try {

    const agendamento = await knex("agendamento")
    .join("animal", "agendamento.animal_id", "=", "animal.id")
    .join("usuario", "agendamento.usuario_id", "=", "usuario.id")
    .select("agendamento.*","animal.nome as nome_animal", "usuario.nome as nome_cliente")
    .where("data_marcacao",data)
    .orderBy("agendamento.hora_inicio", "asc");
    
    return res.status(200).json(agendamento);
  
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAgendamentosPorDataECpf = async (req, res) => {

  const { data, cpf_cnpj } = req.query;
  try {

    const cliente = await knex('usuario').select("*").where({cpf_cnpj}).andWhere("cargo","Cliente").first();

    if(!cliente){
      return res.status(404).json({ mensagem: "Cliente não encontrado." });
    }

    const agendamento = await knex("agendamento")
      .join("animal", "agendamento.animal_id", "=", "animal.id")
      .join("usuario", "agendamento.usuario_id", "=", "usuario.id")
      .select(
        "agendamento.*",
        "animal.nome as nome_animal",
        "usuario.nome as nome_cliente"
      )
      .where("agendamento.data_marcacao", data) 
      .andWhere("agendamento.usuario_id", cliente.id) 
      .orderBy("agendamento.hora_inicio", "asc");
    
    return res.status(200).json(agendamento);
  
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarHorariosOcupados = async (req, res) => {

  const { data } = req.query;
  
  try {

    const lista_horarios_ocupados = [];
    
    const bloqueios = await knex('bloqueiohorarios')
    .where('data_bloqueio', '=', data)
    
    if(bloqueios.length>0){

      for ( let bloqueio of bloqueios){

        lista_horarios_ocupados.push(bloqueio.hora_inicios.ubstring(0, 5));

      }
    };

    const horarios = await knex("agendamento")
      .select("hora_inicio")
      .where("data_marcacao", data);

    const totalFuncionarios = await knex("usuario").count("* as count").where("cargo","Colaborador").first();
    const maxFuncionariosDisponiveis = totalFuncionarios.count;

    const horariosCount = {}; 
    
    for (let horario of horarios) {
      const horaInicio = horario.hora_inicio.substring(0, 5);

      if (!horariosCount[horaInicio]) {
        horariosCount[horaInicio] = 0;
      }
      
      horariosCount[horaInicio] += 1;

      if (horariosCount[horaInicio] >= maxFuncionariosDisponiveis) {
        lista_horarios_ocupados.push(horaInicio);
      }
    }


    return res.status(200).json(lista_horarios_ocupados);
  
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
    agendar,
    listarAgendamentos,
    excluiAgendamento,
    editarAgendamento,
    listarAgendamentosPorData,
    editarConfirmacaoAgendamento,
    listarAgendamentosPorDataECpf,
    listarHorariosOcupados
};