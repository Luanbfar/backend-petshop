const joi = require("joi");

const produtoServicoSchema = joi.object({
  nome: joi.string().min(2).required().messages({
    "string.min": "O campo Nome deve ser preenchido corretamente",
    "any.required": "O campo Nome é obrigatório.",
    "string.empty": "O campo Nome é obrigatório.",
  }),
  valor: joi.number().required().messages({
    "any.required": "O campo valor é obrigatório.",
  }),
  tipo: joi.string().required().messages({
    "any.required": "O campo tipo é obrigatório.",
  }),
});

module.exports = produtoServicoSchema;
