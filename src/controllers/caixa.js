const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNullos");
require("dotenv").config();

const cadastrarCaixa = async (req, res) => {
  const { tipo, data_operacao, valor, usuario_id, forma_de_pagamento , produtos_servicos, nome_cliente, tipo_de_saida } = req.body;

  try {

    const funcionario = await knex('usuario').select("*").where('id',usuario_id).where("cargo", "<>", "Cliente").first();

    if (!funcionario){
        return res.status(404).json({ mensagem: "Funcionário não encontrado." });
    }

    const caixa = await knex("caixa")
      .insert({
        tipo, 
        usuario_id,
        data_operacao, 
        valor,
        forma_de_pagamento, 
        produtos_servicos, 
        nome_cliente,
        tipo_de_saida
      })
      .returning("*");

    return res.status(201).json(caixa);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarCaixa = async (req, res) => {
  const { id } = req.params;

  const { tipo, data_operacao, valor, usuario_id, forma_de_pagamento , produtos_servicos, nome_cliente, tipo_de_saida } = req.body;

  try {

    const funcionario = await knex('usuario').select("*").where('id',usuario_id).where("cargo", "<>", "Cliente").first();

    if (!funcionario){
        return res.status(404).json({ mensagem: "Funcionário não encontrado." });
    }

    // Cria um objeto com os dados não nulos ou vazios
    const dadosAtualizados = {
        tipo, 
        usuario_id,
        data_operacao, 
        valor,
        forma_de_pagamento, 
        produtos_servicos, 
        nome_cliente,
        tipo_de_saida
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    };

    const usr = await knex("caixa")
      .update(dadosAtualizados)
      .where("id", id)
      .returning("*");

    delete usr[0].senha;

    return res.status(200).json(usr);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiCaixa = async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await knex("caixa")
      .select("*")
      .where({ id })
      .first();

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: "Este caixa ainda não foi cadastrado" });
    }

    const caixaExcluido = await knex("caixa").where({ id }).del();

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarCaixas = async (req, res) => {
  try {
    const caixas = await knex("caixa").select("*")

    return res.status(200).json(caixas);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarCaixa = async (req, res) => {
  const { id } = req.params;

  try {
    const caixa = await knex("caixa")
      .select("*")
      .where({ id })
      .first();

    if (!caixa) {
      return res
        .status(400)
        .json({ mensagem: "Este caixa ainda não foi cadastrado" });
    }

    return res.status(200).json(caixa);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarCaixaVenda = async (req, res) => {
    try {
      const caixa = await knex("caixa")
        .select("*")
        .where("tipo","venda")
        .first();
  
      if (!caixa) {
        return res
          .status(404)
          .json({ mensagem: "Este caixa ainda não foi cadastrado" });
      }
  
      return res.status(200).json(caixa);
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const listarCaixaSaida = async (req, res) => {
  try {
    const caixa = await knex("caixa")
      .select("*")
      .where("tipo","saida")
      .first();

    if (!caixa) {
      return res
        .status(404)
        .json({ mensagem: "Este caixa ainda não foi cadastrado" });
    }

    return res.status(200).json(caixa);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const faturamentoPorData = async (req,res) =>{

  const { data_operacao } = req.query;

  try {
    
    const faturamento = await knex('caixa')
    .select(
      knex.raw("SUM(CASE WHEN tipo = 'venda' THEN valor ELSE 0 END) as receita"),
      knex.raw("SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as despesa"),
      knex.raw("SUM(CASE WHEN tipo = 'venda' THEN valor ELSE 0 END) - SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as lucro")
    )
    .where({data_operacao})
    .first();
  
    return res.status(200).json(faturamento);

} catch (error) {

  console.log("Erro faturamento por data",error);

  return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const faturamentoPorPeriodo = async (req, res) => {
  const { data_inicio, data_termino } = req.query;

  try {
    const faturamento = await knex('caixa')
      .select(
        knex.raw("SUM(CASE WHEN tipo = 'venda' THEN valor ELSE 0 END) as receita"),
        knex.raw("SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as despesa"),
        knex.raw("SUM(CASE WHEN tipo = 'venda' THEN valor ELSE 0 END) - SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as lucro")
      )
      .where('data_operacao', '>=', data_inicio)
      .andWhere('data_operacao', '<=', data_termino)
      .first();

    return res.status(200).json(faturamento);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};


module.exports = {
  editarCaixa,
  cadastrarCaixa,
  excluiCaixa,
  listarCaixa,
  listarCaixas,
  listarCaixaVenda,
  listarCaixaSaida,
  faturamentoPorData,
  faturamentoPorPeriodo
};