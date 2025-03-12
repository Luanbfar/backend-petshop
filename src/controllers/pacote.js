const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNullos");
require("dotenv").config();

const cadastrarPacote = async (req, res) => {
  const { tipo, lista_servicos, quantidade, valor } = req.body;

  try {

    const pacote = await knex("pacote")
      .insert({
        tipo,  
        valor
      })
      .returning("*");

      const pacoteCriado = pacote[0]

    for ( var servicoId of lista_servicos ){

      let servico = await knex("produto_servico").select("*").where("id",servicoId).first();

      if(!servico){

        await knex("pacote").where("id", pacoteCriado.id).del();
        return res.status(404).json({ mensagem: "Serviço não encontrado." });

      }

      await knex("pacote_servico").insert({
        pacote_id:  pacoteCriado.id,
        servico_id: servico.id,
        quantidade
      }).returning("*");
    }

    return res.status(201).json(pacote);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarPacote = async (req, res) => {
  const { id } = req.params;

  const { tipo, valor } = req.body;

  try {

    const dadosAtualizados = {
      tipo, 
      valor
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    };

    const usr = await knex("pacote")
      .update(dadosAtualizados)
      .where("id", id)
      .returning("*");


    return res.status(200).json(usr);
  } catch (error) {
    console.log("Erro em editar pacote",error)
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarPacoteServico = async (req, res) => {

  const { pacote_id,servico_id } = req.params;

  const { quantidade } = req.body;

  try {
    if (!quantidade) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    };

    const usr = await knex("pacote_servico")
      .update({quantidade})
      .where({ pacote_id, servico_id })
      .returning("*");

    return res.status(200).json(usr);
  } catch (error) {
    console.log("Erro em editar pacote servico",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const adicionarPacoteServico = async (req,res) => {
  const { pacote_id, servico_id, quantidade } = req.body;

  try{
    let servico = await knex("produto_servico").select("*").where("id",servico_id).first();

    if(!servico){
      return res.status(404).json({ mensagem: "Serviço não encontrado." });
    }

    const ServicoEncontrado = await knex("pacote_servico").select("*").where({pacote_id,servico_id}).first();

    if(ServicoEncontrado){
      return res.status(404).json({ mensagem: "Serviço já cadastrado no pacote." });
    }
    const pacoteServico = await knex("pacote_servico").insert({
      pacote_id,
      servico_id,
      quantidade
    }).returning("*");

    return res.status(201).json(pacoteServico);

  }catch(error){
    console.log("Erro ao adicionar serviço ao pacote",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

const excluiPacote = async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await knex("pacote")
      .select("*")
      .where({ id })
      .first();

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: "Este pacote ainda não foi cadastrado" });
    }

    await knex("pacote_servico").where({ pacote_id: id }).del();

    const pacoteExcluido = await knex("pacote").where({ id }).del();

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiPacoteServico = async (req, res) => {
  const { pacote_id, servico_id } = req.params;

  try {
    const produto = await knex("pacote_servico")
      .select("*")
      .where({ pacote_id, servico_id })
      .first();

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: "Este serviço ainda não foi cadastrado no pacote" });
    }

    await knex("pacote_servico").where({ pacote_id, servico_id }).del();

    return res.status(204).json();

  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarPacotes = async (req, res) => {
  try {
    const pacotes = await knex("pacote")
      .select(
        "pacote.id",
        "pacote.tipo",
        "pacote.valor",
        knex.raw(`
          COALESCE(
            json_agg(
              json_build_object(
                'nome', produto_servico.nome, 
                'quantidade', pacote_servico.quantidade,
                'pacote_id', pacote_servico.pacote_id,
                'servico_id',pacote_servico.servico_id
              )
            ) FILTER (WHERE produto_servico.id IS NOT NULL),
            '[]'
          ) AS servicos
        `)
      )
      .leftJoin("pacote_servico", "pacote.id", "pacote_servico.pacote_id")
      .leftJoin("produto_servico", "pacote_servico.servico_id", "produto_servico.id")
      .groupBy("pacote.id");

    return res.status(200).json(pacotes);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarPacote = async (req, res) => {
  const { id } = req.params;

  try {
    const pacote = await knex("pacote")
      .select("*")
      .where({ id })
      .first();

    if (!pacote) {
      return res
        .status(400)
        .json({ mensagem: "Este pacote ainda não foi cadastrado" });
    }

    return res.status(200).json(pacote);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrarPacote,
  editarPacote,
  editarPacoteServico,
  adicionarPacoteServico,
  excluiPacoteServico,
  excluiPacote,
  listarPacote,
  listarPacotes
};