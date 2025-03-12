const knex = require("../database/conexao");
const { verificarDadosNulos } = require("../utils/verificacaoDadosNullos");
const { verificarPorteAnimal } = require("../utils/verificacaoPorteAnimal");
const { uploadImagem, deleteImagem } = require("../config/upload");
require("dotenv").config();

const cadastrarAnimal = async (req, res) => {
  const { cliente_id ,nome, peso, data_nascimento, foto_animal, cpf_dono, lista_cpfs, raca, tipo } = req.body;

  try {
    let usuarioExiste;

    if(cpf_dono){
      usuarioExiste = await knex('usuario').select('*').where('cpf_cnpj', cpf_dono).first();
    }else if(cliente_id){
      usuarioExiste = await knex('usuario').select('*').where('id', cliente_id).first();
    }

    if (!usuarioExiste) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }

    const usuario_id = usuarioExiste.id;

    const porte = verificarPorteAnimal(parseFloat(peso));

    let animal = await knex("animal")
      .insert({
        nome,
        peso,
        data_nascimento,
        usuario_id,
        raca,
        tipo,
        porte
      })
      .returning("*");

      const id = animal[0].id;

      let arquivo1 = null;
      if(foto_animal){
        const base64Data = foto_animal.replace(/^data:image\/\w+;base64,/, ''); 
        const buffer = Buffer.from(base64Data, 'base64');
        arquivo1 = await uploadImagem(`fotoanimal/${id}/imagem.jpg`, buffer, 'image/jpeg');
      };

      const updateLinksImagens = {
        foto_animal: arquivo1 && arquivo1.url ? arquivo1.url : null
      };

      animal = await knex('animal').update(updateLinksImagens).where({ id }).returning("*");

      if (lista_cpfs.length > 0 && lista_cpfs.every(responsavel => responsavel.cpf !== '' && responsavel.nome !== '')) {
        const dados = lista_cpfs.map(responsavel => ({
          animal_id: id,
          cpf: responsavel.cpf,
          nome: responsavel.nome
        }));
      
        await knex('animal_responsavel').insert(dados);
      }

    return res.status(201).json(animal);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const adicionarResponsavel = async(req,res) => {
  
  const { animal_id } = req.params;
  const  lista_cpfs  = req.body;
  
  try{

    if (lista_cpfs.length > 0 && lista_cpfs.every(responsavel => responsavel.cpf !== '' && responsavel.nome !== '')) {

      const dados = lista_cpfs.map(responsavel => ({
        animal_id,
        cpf: responsavel.cpf,
        nome: responsavel.nome
      }));
    
      const responsavel = await knex('animal_responsavel').insert(dados);

      return res.status(201).json(responsavel);
    }

  }catch(error){
    console.log("Erro ao adicionar responsavel",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

const editarAnimal = async (req, res) => {
  const { id } = req.params;

  const { nome, peso, data_nascimento, foto_animal, cpf_dono , raca, tipo} = req.body;
  
  try {

    const animal = await knex("animal").select("*").where({id}).first();

    if(!animal){
      return res.status(404).json({ mensagem: "Animal não cadastrado." });
    }

    let usuario_id = null;

    if(cpf_dono){
      const usuarioExiste = await knex('usuario').select('*').where('cpf_cnpj', cpf_dono).first();

      if (!usuarioExiste) {
        return res.status(400).json({ mensagem: "Usuário não encontrado." });
      }

      usuario_id = usuarioExiste.id;
    }

    let porte;

    if(peso){
      porte = verificarPorteAnimal(peso);
    }

    let arquivo = null;

    if(foto_animal){
      if( animal.foto_animal ){
        await deleteImagem(animal.foto_animal);
      }
        const base64Data = foto_animal.replace(/^data:image\/\w+;base64,/, ''); 
        const buffer = Buffer.from(base64Data, 'base64');
        arquivo = await uploadImagem(`fotoanimal/${id}/imagem.jpg`, buffer, 'image/jpeg');
    }
    
    const dadosAtualizados = {
      nome,
      peso,
      data_nascimento,
      foto_animal:arquivo && arquivo.url ? arquivo.url : null,
      usuario_id,
      raca,
      tipo,
      porte
    };

    const dadosNulos = verificarDadosNulos(dadosAtualizados);
    if (dadosNulos) {
      return res.status(400).json({ mensagem: "Nenhum dado válido para atualização fornecido." });
    }

    const usr = await knex("animal")
      .update(dadosAtualizados)
      .where("id", id)
      .returning("*");

    return res.status(200).json(usr);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiAnimal = async (req, res) => {
  const { id } = req.params;

  try {
    const animal = await knex("animal")
      .select("*")
      .where({ id })
      .first();

    if (!animal) {
      return res
        .status(400)
        .json({ mensagem: "Este animal ainda não foi cadastrado" });
    }

    const foto_animal = animal.foto_animal;

    await knex("animal_responsavel").where('animal_id',id).del();

    const animalExcluido = await knex("animal").where({ id }).del();

    if (foto_animal) {
      await deleteImagem(foto_animal);
    }

    return res.status(204).json({ mensagem: "Animal excluido." });
  } catch (error) {
    console.log("Erro ao deletar um animal",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluiAnimalResponsavel = async (req, res) => {
  const { id } = req.params;
  const { cpf } = req.query;
  try {
    const animal = await knex("animal")
      .select("*")
      .where({ id })
      .first();

    if (!animal) {
      return res
        .status(400)
        .json({ mensagem: "Este animal ainda não foi cadastrado" });
    }

    await knex("animal_responsavel").where('animal_id',id).andWhere({cpf}).del();


    return res.status(204).json({ mensagem: "Responsável do Animal excluido." });
  } catch (error) {
    console.log("Erro ao deletar um animal",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};


const listarAnimais = async (req, res) => {
  try {

    const animals = await knex("animal")
    .select(
    "animal.*",
    "usuario.cpf_cnpj as cpf_dono",  
    "usuario.nome as nome_tutor",
    knex.raw("COALESCE(json_agg(json_build_object('cpf', animal_responsavel.cpf, 'nome', animal_responsavel.nome)) FILTER (WHERE animal_responsavel.cpf IS NOT NULL), '[]') as responsaveis")
    )
    .leftJoin("animal_responsavel", "animal.id", "animal_responsavel.animal_id")
    .leftJoin("usuario", "animal.usuario_id", "usuario.id")
    .groupBy("animal.id", "usuario.cpf_cnpj","usuario.nome");

    return res.status(200).json(animals);
  
  } catch (error) {
    console.log("Erro listar animais",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAnimaisUsuarioPorCPF = async (req, res) => {
  const { cpf } = req.query;

  try {
    
    const usuario = await knex('usuario').select('*').where('cpf_cnpj', cpf).first();

    if (!usuario) {

      const responsaveis = await knex('animal_responsavel').select('*').where('cpf', cpf);

      if(responsaveis.length === 0){
        return res.status(404).json({ mensagem: "CPF não encontrado." });
      };

      const animalIds = responsaveis.map(responsavel => responsavel.animal_id);

      const animals = await knex('animal').select('*').whereIn('id', animalIds);

      return res.status(200).json(animals);
      
    }

    const Animals = await knex("animal").select("*").where("usuario_id",usuario.id);

    return res.status(200).json(Animals);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAnimaisUsuarioPorID = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    
    const usuario = await knex('usuario').select('*').where("id",usuario_id).first();

    if (!usuario) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }

    const Animals = await knex("animal").select("*").where({usuario_id});

    return res.status(200).json(Animals);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAnimalNome = async (req, res) => {
  const { nome } = req.query;
  try {
    const Animals = await knex("animal").select("*").where("nome", "ILIKE", `%${nome}%`);

    return res.status(200).json(Animals);
  
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAnimalDoUsuarioPorNome = async (req, res) => {
    const { usuario_id } = req.params;
    const { nome } = req.query;
    try {

      const usuario = await knex('usuario').select('*').where("id",usuario_id).first();

      if (!usuario) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
      }

      const Animals = await knex("animal").select("*").where({nome}).andWhere({usuario_id}).first();
      
      return res.status(200).json(Animals);
    
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
  };

const listarAnimal = async (req, res) => {
  const { id } = req.params;

  try {
    
    const animal = await knex("animal")
    .select(
      "animal.*",
      knex.raw("COALESCE(json_agg(json_build_object('cpf', animal_responsavel.cpf, 'nome', animal_responsavel.nome)) FILTER (WHERE animal_responsavel.cpf IS NOT NULL), '[]') as responsaveis"),
      "usuario.cpf_cnpj as cpf_dono"
    )
    .leftJoin("animal_responsavel", "animal.id", "animal_responsavel.animal_id")
    .leftJoin("usuario", "animal.usuario_id", "usuario.id")
    .where("animal.id", id)
    .groupBy("animal.id", "usuario.cpf_cnpj")
    .first();

    if (!animal) {
      return res
        .status(400)
        .json({ mensagem: "Este animal ainda não foi cadastrado" });
    }

    return res.status(200).json(animal);
  } catch (error) {
    console.log("Error listar animal por id",error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  editarAnimal,
  cadastrarAnimal,
  adicionarResponsavel,
  excluiAnimal,
  excluiAnimalResponsavel,
  listarAnimais,
  listarAnimalDoUsuarioPorNome,
  listarAnimaisUsuarioPorCPF,
  listarAnimaisUsuarioPorID,
  listarAnimal,
  listarAnimalNome
};