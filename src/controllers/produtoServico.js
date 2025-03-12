const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNulos");

require("dotenv").config();

const cadastrarServico = async (req, res) => {
  const { nome, valor, tipo } = req.body;

  try {

    const produto_servico = await knex("produto_servico")
      .insert({
        nome,
        valor,
        tipo
      })
      .returning("*");

    return res.status(201).json(produto_servico);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarServico = async (req, res) => {
  const { id } = req.params;

  const { nome, valor, tipo } = req.body;

  try {

    const dadosAtualizados = {
        nome,
        valor,
        tipo
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    };

    const usr = await knex("produto_servico")
      .update(dadosAtualizados)
      .where("id", id)
      .returning("*");

    delete usr[0].senha;

    return res.status(200).json(usr);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiServico = async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await knex("produto_servico")
      .select("*")
      .where({ id })
      .first();

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: "Este produto_servico ainda não foi cadastrado" });
    }

    await knex("assinatura_servico").where({ servico_id: id }).del();
    await knex("pacote_servico").where({ servico_id: id }).del();
    
    const produto_servicoExcluido = await knex("produto_servico").where({ id }).del();

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarServicos = async (req, res) => {
  try {
    const produto_servicos = await knex("produto_servico").select("*")

    return res.status(200).json(produto_servicos);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarServico = async (req, res) => {
  const { id } = req.params;

  try {
    const produto_servico = await knex("produto_servico")
      .select("*")
      .where({ id })
      .first();

    if (!produto_servico) {
      return res
        .status(400)
        .json({ mensagem: "Este produto_servico ainda não foi cadastrado" });
    }

    return res.status(200).json(produto_servico);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarPorTipo = async (req, res) => {
  const { tipo } = req.query;

  try {
    const produto_servico = await knex("produto_servico")
      .select("*")
      .where({ tipo });

    return res.status(200).json(produto_servico);
  } catch (error) {
    console.log("Erro ao listar servico/produto por tipo",error)
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  editarServico,
  cadastrarServico,
  excluiServico,
  listarServico,
  listarServicos,
  listarPorTipo
};