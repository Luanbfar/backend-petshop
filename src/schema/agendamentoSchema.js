const joi = require("joi");

const agendamentoSchema = joi.object({
  cpf_cnpj: joi.string().min(11).required().messages({
    "string.min": "CPF deve ser preenchido corretamente.",
    "string.empty": "CPF é obrigatório.",
    "any.required": "CPF é obrigatório.",
  }),
  servicos: joi.array().allow("").optional(),
  data_marcacao: joi.string().min(8).required().messages({
    "string.empty": "Data do serviço é obrigatória.",
    "any.required": "Data do serviço é obrigatória.",
  }),
  hora_inicio: joi.string().required().messages({
    "string.empty": "Hora do serviço é obrigatória.",
    "any.required": "Hora do serviço é obrigatória.",
  }),
  tamanho: joi.string().required().messages({
    "string.empty": "Tamanho é obrigatório.",
    "any.required": "Tamanho é obrigatório.",
  }),
  animal_id: joi.number().required().messages({
    "any.required": "Animal id é obrigatório.",
  }),
  confirmacao_agendamento: joi.boolean().optional(),
});

module.exports = agendamentoSchema;
