const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNullos");

require("dotenv").config();

//alterar a quantidade de banhos utilizados, tosas e hidratação;
// não precisa saber a quantidade disponivel ?
const cadastrarAssinatura = async (req, res) => {
  let { pacote_id, animal_id } = req.body;

  try {
    const pacote = await knex("pacote")
      .select("*")
      .where("id", pacote_id)
      .first();
    const animal = await knex("animal")
      .select("*")
      .where("id", animal_id)
      .first();

    if (!pacote) {
      return res.status(404).json({ mensagem: "Pacote não encontrado." });
    }

    if (!animal) {
      return res.status(404).json({ mensagem: "Animal não encontrado." });
    }

    const data_assinatura = new Date();
    const data_renovacao = new Date(data_assinatura);
    data_renovacao.setDate(data_renovacao.getDate() + 30);

    const [novaAssinatura] = await knex("assinatura")
      .insert({
        pacote_id,
        animal_id,
        data_assinatura,
        data_renovacao,
      })
      .returning("*");

    const servicosPacote = await knex("pacote_servico")
      .select("servico_id", "quantidade")
      .where("pacote_id", pacote_id);

    const assinaturaServicos = servicosPacote.map((servico) => ({
      assinatura_id: novaAssinatura.id,
      servico_id: servico.servico_id,
      quantidade_disponivel: servico.quantidade,
      quantidade_utilizada: 0,
    }));

    await knex("assinatura_servico").insert(assinaturaServicos);

    return res.status(201).json(novaAssinatura);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarAssinatura = async (req, res) => {
  const { id } = req.params;
  const { pacote_id, animal_id } = req.body;

  try {
    const dadosAtualizados = { pacote_id, animal_id };

    if (!pacote_id && !animal_id) {
      return res
        .status(400)
        .json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    }

    if (pacote_id) {
      const pacote = await knex("pacote")
        .select("*")
        .where("id", pacote_id)
        .first();

      if (!pacote) {
        return res.status(404).json({ mensagem: "Pacote não encontrado." });
      }

      await knex("assinatura_servico").where("assinatura_id", id).del();

      const servicosPacote = await knex("pacote_servico")
        .select("servico_id", "quantidade")
        .where("pacote_id", pacote_id);

      const assinaturaServicos = servicosPacote.map((servico) => ({
        assinatura_id: id,
        servico_id: servico.servico_id,
        quantidade_disponivel: servico.quantidade,
        quantidade_utilizada: 0,
      }));

      await knex("assinatura_servico").insert(assinaturaServicos);
    }

    const assinaturaAtualizada = await knex("assinatura")
      .update(dadosAtualizados)
      .where("id", id)
      .returning("*");

    if (assinaturaAtualizada.length === 0) {
      return res.status(404).json({ mensagem: "Assinatura não encontrada." });
    }

    return res.status(200).json(assinaturaAtualizada[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarDataRenovacaoAssinatura = async (req, res) => {
  const { id } = req.params;
  const { data_renovacao } = req.body;

  try {
    if (!data_renovacao) {
      return res
        .status(400)
        .json({ mensagem: "Data de renovação não fornecida." });
    }

    const assinaturaAtualizada = await knex("assinatura")
      .update({ data_renovacao })
      .where("id", id)
      .returning("*");

    if (assinaturaAtualizada.length === 0) {
      return res.status(404).json({ mensagem: "Assinatura não encontrada." });
    }

    return res.status(200).json(assinaturaAtualizada[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarQuantidadeServicosAssinatura = async (req, res) => {
  const { assinatura_id, servico_id } = req.params;
  const { quantidade_disponivel, quantidade_utilizada } = req.body;

  try {
    const assinaturaServico = await knex("assinatura_servico")
      .select("*")
      .where({ assinatura_id, servico_id })
      .first();

    if (!assinaturaServico) {
      return res
        .status(404)
        .json({ mensagem: "Assinatura Serviço não encontrado." });
    }

    // Dados a serem atualizados
    const dadosAtualizados = {};
    if (quantidade_disponivel !== undefined) {
      dadosAtualizados.quantidade_disponivel = quantidade_disponivel;
    }
    if (quantidade_utilizada !== undefined) {
      dadosAtualizados.quantidade_utilizada = quantidade_utilizada;
    }

    // Verificar se há dados para atualizar
    if (Object.keys(dadosAtualizados).length === 0) {
      return res
        .status(400)
        .json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    }

    // Atualizar dados
    const assinaturaAtualizada = await knex("assinatura_servico")
      .update(dadosAtualizados)
      .where({ assinatura_id, servico_id })
      .returning("*");

    return res.status(200).json(assinaturaAtualizada);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiAssinatura = async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await knex("assinatura").select("*").where({ id }).first();

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: "Esta assinatura ainda não foi cadastrado" });
    }

    await knex("assinatura_servico").where({ assinatura_id: id }).del();

    const assinaturaExcluido = await knex("assinatura").where({ id }).del();

    return res.status(204).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAssinaturas = async (req, res) => {
  try {
    const assinaturas = await knex("assinatura")
      .select(
        "assinatura.id",
        "assinatura.animal_id",
        "assinatura.pacote_id",
        "assinatura.data_assinatura",
        "assinatura.data_renovacao",
        "animal.nome as animal_nome",
        "pacote.tipo as pacote_tipo",
        "usuario.cpf_cnpj as usuario_cpf",
        knex.raw(`
          json_agg(
            json_build_object(
              'servico_id', produto_servico.id,
              'nome', produto_servico.nome,
              'quantidade_disponivel', assinatura_servico.quantidade_disponivel,
              'quantidade_utilizada', assinatura_servico.quantidade_utilizada
            )
          ) as servicos
        `)
      )
      .join("animal", "assinatura.animal_id", "animal.id")
      .join("pacote", "assinatura.pacote_id", "pacote.id")
      .join("usuario", "animal.usuario_id", "usuario.id")
      .join(
        "assinatura_servico",
        "assinatura.id",
        "assinatura_servico.assinatura_id"
      )
      .join(
        "produto_servico",
        "assinatura_servico.servico_id",
        "produto_servico.id"
      )
      .groupBy(
        "assinatura.id",
        "animal.nome",
        "pacote.tipo",
        "usuario.cpf_cnpj"
      );

    return res.status(200).json(assinaturas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAssinaturasPorPacoteId = async (req, res) => {
  const { pacote_id } = req.params;
  try {
    const assinaturasComServicos = await knex
      .select(
        "a.id as assinatura_id",
        "a.pacote_id",
        "a.animal_id",
        "a.data_assinatura",
        "a.data_renovacao",
        "an.id as animal_id",
        "an.nome as animal_nome",
        "u.cpf_cnpj as usuario_cpf",
        knex.raw(
          `json_agg(
            json_build_object(
              'servico_id', asv.servico_id,
              'servico_nome', ps.nome,
              'quantidade_disponivel', asv.quantidade_disponivel,
              'quantidade_utilizada', asv.quantidade_utilizada
            )
          ) as servicos`
        )
      )
      .from("assinatura as a")
      .join("animal as an", "a.animal_id", "an.id")
      .join("usuario as u", "an.usuario_id", "u.id")
      .leftJoin("assinatura_servico as asv", "a.id", "asv.assinatura_id")
      .leftJoin("produto_servico as ps", "asv.servico_id", "ps.id")
      .where("a.pacote_id", pacote_id)
      .groupBy("a.id", "an.id", "u.cpf_cnpj");

    return res.status(200).json(assinaturasComServicos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAssinaturasPorIdCpf = async (req, res) => {
  const { pacote_id } = req.params;
  const { cpf } = req.query;

  const validarCPF = (cpf) => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return cpfRegex.test(cpf);
  };

  if (!cpf) {
    return res.status(400).json({ mensagem: "CPF não fornecido." });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ mensagem: "CPF inválido." });
  }

  try {
    const assinaturas = await knex("assinatura")
      .select(
        "assinatura.id",
        "assinatura.animal_id",
        "assinatura.pacote_id",
        "assinatura.data_assinatura",
        "assinatura.data_renovacao",
        "animal.nome as animal_nome",
        "pacote.tipo as pacote_tipo",
        "usuario.cpf_cnpj as usuario_cpf",
        knex.raw(`
      json_agg(
        json_build_object(
          'servico_id', produto_servico.id,
          'nome', produto_servico.nome,
          'quantidade_disponivel', assinatura_servico.quantidade_disponivel,
          'quantidade_utilizada', assinatura_servico.quantidade_utilizada
        )
      ) as servicos
    `)
      )
      .join("animal", "assinatura.animal_id", "animal.id")
      .join("pacote", "assinatura.pacote_id", "pacote.id")
      .join("usuario", "animal.usuario_id", "usuario.id")
      .join(
        "assinatura_servico",
        "assinatura.id",
        "assinatura_servico.assinatura_id"
      )
      .join(
        "produto_servico",
        "assinatura_servico.servico_id",
        "produto_servico.id"
      )
      .where("assinatura.pacote_id", pacote_id)
      .andWhere("usuario.cpf_cnpj", cpf)
      .groupBy(
        "assinatura.id",
        "animal.nome",
        "pacote.tipo",
        "usuario.cpf_cnpj",
        "assinatura.data_assinatura",
        "assinatura.data_renovacao"
      );
      
    return res.status(200).json(assinaturas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAssinatura = async (req, res) => {
  const { id } = req.params;

  try {
    const assinatura = await knex("assinatura")
      .select("*")
      .where({ id })
      .first();

    if (!assinatura) {
      return res
        .status(400)
        .json({ mensagem: "Este assinatura ainda não foi cadastrado" });
    }

    return res.status(200).json(assinatura);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  editarAssinatura,
  editarDataRenovacaoAssinatura,
  editarQuantidadeServicosAssinatura,
  cadastrarAssinatura,
  listarAssinaturasPorPacoteId,
  listarAssinaturasPorIdCpf,
  excluiAssinatura,
  listarAssinatura,
  listarAssinaturas,
};
