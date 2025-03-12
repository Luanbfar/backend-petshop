const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNullos");
require("dotenv").config();

const cadastrarAcompanhamento = async (req, res) => {
  const { nome_animal, cpf_proprietario, data_marcacao, hora_inicio, hora_termino, status_acompanhamento, servicos } = req.body;

  try {

    const usuarioExiste = await knex('usuario').select('*').where('cpf_cnpj', cpf_proprietario).first();

    if(!usuarioExiste){
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
    };

    const usuario_id = usuarioExiste.id

    const acompanhamento = await knex("acompanhamento")
      .insert({
        nome_animal,
        data_marcacao,
        hora_inicio,
        hora_termino,
        status_acompanhamento,
        servicos,
        usuario_id
      })
      .returning("*");

    return res.status(201).json(acompanhamento);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarAcompanhamento = async (req, res) => {
  const { id } = req.params;

  const { nome_animal, cpf_proprietario, data_marcacao, hora_inicio, hora_termino, status_acompanhamento, servicos } = req.body;
  try {

    let usuario_id = null;

    if(cpf_proprietario){
        const usuarioExiste = await knex('usuario').select('*').where('cpf_cnpj', cpf_proprietario).first();

        if(!usuarioExiste){
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        };

        usuario_id = usuarioExiste.id
    }

    // Cria um objeto com os dados não nulos ou vazios
    const dadosAtualizados = {
        nome_animal,
        data_marcacao,
        hora_inicio,
        hora_termino,
        servicos,
        status_acompanhamento,
        usuario_id
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    }

    const usr = await knex("acompanhamento")
      .update(dadosAtualizados)
      .where("id", id)
      .returning("*");

    return res.status(200).json(usr);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiAcompanhamento = async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await knex("acompanhamento")
      .select("*")
      .where({ id })
      .first();

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: "Este acompanhamento ainda não foi cadastrado" });
    }

    const clienteExcluido = await knex("acompanhamento").where({ id }).del();

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAcompanhamentos = async (req, res) => {
  try {
    
    const acompanhamentos = await knex("acompanhamento").select("acompanhamento.*", "usuario.cpf_cnpj").join("usuario", "acompanhamento.usuario_id", "=", "usuario.id");

    return res.status(200).json(acompanhamentos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAcompanhamentosStatus = async (req, res) => {

  const { status_acompanhamento } = req.query;
  try {
    const acompanhamentos = await knex("acompanhamento").select("*").where({status_acompanhamento});

    return res.status(200).json(acompanhamentos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAcompanhamentosStatusUsuarioID = async (req, res) => {

  const { usuario_id } = req.params;
  const { status_acompanhamento } = req.query;

  try {

    const usuario = await knex('usuario').select('*').where('id', usuario_id);

    if (!usuario) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }

    const acompanhamentos = await knex("acompanhamento").select("*").where({status_acompanhamento}).andWhere({usuario_id});

    return res.status(200).json(acompanhamentos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAcompanhamentosUsuarioPorCPF = async (req, res) => {
  const { cpf_cnpj } = req.query;

  try {
    
    const usuario = await knex('usuario').select('*').where('cpf_cnpj', cpf_cnpj);

    if (!usuario) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }

    const usuario_id = usuario.id

    const Acompanhamentos = await knex("acompanhamento").select("*").where({usuario_id});

    return res.status(200).json(Acompanhamentos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAcompanhamentosUsuarioPorID = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    
    const usuario = await knex('usuario').select('*').where('id', usuario_id);

    if (!usuario) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }


    const Acompanhamentos = await knex("acompanhamento").select("*").where({usuario_id});

    return res.status(200).json(Acompanhamentos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAcompanhamentoNomeAnimal = async (req, res) => {
  const { nome_animal } = req.query;
  try {
    const Acompanhamentos = await knex("acompanhamento").select("*").where("nome_animal",nome_animal).first();

    return res.status(200).json(Acompanhamentos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};


const listarAcompanhamento = async (req, res) => {
  const { id } = req.params;

  try {
    const acompanhamento = await knex("acompanhamento")
      .select("*")
      .where({ id })
      .first();

    if (!acompanhamento) {
      return res
        .status(400)
        .json({ mensagem: "Este acompanhamento ainda não foi cadastrado" });
    }

    return res.status(200).json(acompanhamento);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrarAcompanhamento,
  editarAcompanhamento,
  excluiAcompanhamento,
  listarAcompanhamentos,
  listarAcompanhamentosStatus,
  listarAcompanhamentosStatusUsuarioID,
  listarAcompanhamentosUsuarioPorCPF,
  listarAcompanhamentosUsuarioPorID,
  listarAcompanhamento,
  listarAcompanhamentoNomeAnimal
};