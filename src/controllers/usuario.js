const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNulos");
const bcrypt = require("bcrypt");
require("dotenv").config();

const cadastrarUsuarioAutenticado = async (req, res) => {
  const { nome, senha, cpf_cnpj, celular, cidade, rua, bairro, numero, cargo, cep } = req.body;

  try {
    const cpfExiste = await knex("usuario").select("*").where("cpf_cnpj", cpf_cnpj).first();
    const celularExiste = await knex("usuario").select("*").where("celular", celular).first();

    if (cpfExiste) {
      return res.status(400).json({ mensagem: "Usuário com este cpf, foi cadastrado." });
    }

    if (celularExiste) {
      return res.status(400).json({ mensagem: "Usuário com este celular, foi cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await knex("usuario")
      .insert({
        nome,
        senha: senhaCriptografada,
        cpf_cnpj,
        celular,
        cidade,
        rua,
        bairro,
        numero,
        cep,
        cargo,
      })
      .returning("*");

    const { senha: _, ...usuarioCadastrado } = usuario[0];

    return res.status(201).json(usuarioCadastrado);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const cadastrarUsuarioNaoAutenticado = async (req, res) => {
  let { nome, senha, cpf_cnpj, celular, cidade, rua, bairro, numero, cep } = req.body;

  try {
    const cpfExiste = await knex("usuario").select("*").where("cpf_cnpj", cpf_cnpj).first();
    const celularExiste = await knex("usuario").select("*").where("celular", celular).first();

    if (cpfExiste) {
      return res.status(400).json({ mensagem: "Usuário com este cpf, foi cadastrado." });
    }

    if (celularExiste) {
      return res.status(400).json({ mensagem: "Usuário com este celular, foi cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await knex("usuario")
      .insert({
        nome,
        senha: senhaCriptografada,
        cpf_cnpj,
        celular,
        cidade,
        rua,
        bairro,
        numero,
        cep,
        cargo: "Cliente",
      })
      .returning("*");

    const { senha: _, ...usuarioCadastrado } = usuario[0];

    return res.status(201).json(usuarioCadastrado);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarUsuario = async (req, res) => {
  const { id } = req.params;

  const { nome, senha, cpf_cnpj, celular, cidade, rua, bairro, numero, cargo, cep } = req.body;

  try {
    if (cpf_cnpj) {
      const cpfExiste = await knex("usuario").select("*").where("cpf_cnpj", cpf_cnpj).whereNot("id", id);

      if (cpfExiste.length > 0) {
        return res
          .status(400)
          .json({ mensagem: "O número de CPF ou CNPJ informado já está sendo utilizado por outro usuário." });
      }
    }

    if (celular) {
      const celularExiste = await knex("usuario").select("*").where("celular", celular).whereNot("id", id);

      if (celularExiste.length > 0) {
        return res
          .status(400)
          .json({ mensagem: "O número de Celular informado já está sendo utilizado por outro usuário." });
      }
    }

    let senhaCriptografada = null;

    if (senha) {
      senhaCriptografada = senha ? await bcrypt.hash(senha, 10) : undefined;
    }

    // Cria um objeto com os dados não nulos ou vazios
    const dadosAtualizados = {
      nome,
      senha: senhaCriptografada,
      cpf_cnpj,
      celular,
      cidade,
      rua,
      bairro,
      numero,
      cargo,
      cep,
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    }

    const usr = await knex("usuario").update(dadosAtualizados).where("id", id).returning("*");

    delete usr[0].senha;

    return res.status(200).json(usr);
  } catch (error) {
    console.log("Error editar usuario", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await knex("usuario").select("*").where({ id }).first();

    if (!usuario) {
      return res.status(400).json({ mensagem: "Este usuario ainda não foi cadastrado" });
    }

    if (usuario.cargo !== "Cliente") {
      return res.status(400).json({ mensagem: "Não é recomendado excluir esse usuário." });
    }

    const animais = await knex("animal").select("id").where("usuario_id", id);

    if (animais.length > 0) {
      await knex("assinatura")
        .whereIn(
          "animal_id",
          animais.map((animal) => animal.id)
        )
        .del();

      await knex("agendamento")
        .whereIn(
          "animal_id",
          animais.map((animal) => animal.id)
        )
        .del();

      await knex("animal").where("usuario_id", id).del();
    }

    const acompanhamento = await knex("acompanhamento").select("*").where("usuario_id", id);

    if (acompanhamento.length > 0) {
      await knex("acompanhamento").where("usuario_id", id).del();
    }

    const clienteExcluido = await knex("usuario").where({ id }).del();

    return res.status(204).json();
  } catch (error) {
    console.log("Erro excluir usuario", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await knex("usuario").select("*");

    return res.status(200).json(usuarios);
  } catch (error) {
    console.log("Erro listar usuarios", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarUsuarioCargo = async (req, res) => {
  const { cargo } = req.query;

  try {
    const Usuarios = await knex("usuario").select("*").where("cargo", cargo);

    return res.status(200).json(Usuarios);
  } catch (error) {
    console.log("Erro listar usuario cargo", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarUsuarioNome = async (req, res) => {
  const { nome } = req.query;
  console.log(nome);
  try {
    const usuarios = await knex("usuario").select("*").where("nome", nome).first();

    return res.status(200).json(usuarios);
  } catch (error) {
    console.log("Erro listar usuario nome", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarFuncionarios = async (req, res) => {
  try {
    const Usuarios = await knex("usuario").select("*").where("cargo", "<>", "Cliente");

    return res.status(200).json(Usuarios);
  } catch (error) {
    console.log("Erro listar funcionarios", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await knex("usuario").select("*").where({ id }).first();

    if (!usuario) {
      return res.status(400).json({ mensagem: "Este usuario ainda não foi cadastrado" });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.log("Erro listar usuario", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  editarUsuario,
  cadastrarUsuarioAutenticado,
  cadastrarUsuarioNaoAutenticado,
  excluiUsuario,
  listarUsuario,
  listarUsuarioCargo,
  listarFuncionarios,
  listarUsuarioNome,
};
