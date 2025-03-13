const joi = require("joi");

const usuarioSchema = joi.object({
  nome: joi.string().min(2).required().messages({
    "string.min": "O campo nome deve ser preenchido corretamente",
    "any.required": "O campo nome é obrigatório.",
    "string.empty": "O campo nome é obrigatório.",
  }),
  senha: joi.string().min(4).required().messages({
    "any.required": "O campo senha é obrigatório.",
    "string.empty": "O campo senha é obrigatório.",
    "string.min": "O campo senha deve conter no mínimo 5 caracteres.",
  }),
  cpf_cnpj: joi.string().min(11).required().messages({
    "any.required": "O campo cpf/cnpj é obrigatório.",
    "string.empty": "O campo cpf/cnpj é obrigatório.",
    "string.min": "O campo cpf/cnpj deve conter no mínimo 11 caracteres.",
  }),
  celular: joi.string().min(11).required().messages({
    "any.required": "O campo celular é obrigatório.",
    "string.empty": "O campo celular é obrigatório.",
    "string.min": "O campo celular deve conter no mínimo 11 caracteres.",
  }),
  cep: joi.string().allow("").optional(),
  cidade: joi.string().allow("").optional(),
  rua: joi.string().allow("").optional(),
  bairro: joi.string().allow("").optional(),
  numero: joi.number().allow("").optional(),
  cargo: joi.string().allow("").optional(),
});

module.exports = usuarioSchema;
