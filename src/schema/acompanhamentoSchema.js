const joi = require("joi");

const acompanhamentoSchema = joi.object({
    nome_animal: joi.string().min(2).required().messages({
    "string.min": "Nome do animal deve ser preenchido corretamente.",
    "string.empty": "Nome do animal é obrigatório.",
    "any.required": "Nome do animal é obrigatório.",
  }),
  cpf_proprietario: joi.string().min(11).required().messages({
    "string.min": "CPF do proprietário deve ser preenchido corretamente.",
    "string.empty": "CPF do proprietário é obrigatório.",
    "any.required": "CPF do proprietário é obrigatório.",
  }),
  data_marcacao: joi.string().min(8).required().messages({
    "string.empty": "Data do serviço é obrigatória.",
    "any.required": "Data do serviço é obrigatória.",
  }),
  hora_inicio: joi.string().required().messages({
    "string.empty": "Hora do serviço é obrigatória.",
    "any.required": "Hora do serviço é obrigatória.",
  }),
  hora_termino: joi.string().required().messages({
    "string.empty": "Hora do término serviço é obrigatória.",
    "any.required": "Hora do término serviço é obrigatória.",
  }),
  status_acompanhamento: joi.string().required().messages({
    "string.empty": "Status Acompanhamento é obrigatório.",
    "any.required": "Status Acompanhamento é obrigatória.",
  }),
  observacao: joi.string().allow('').optional(),
  servicos:joi.array().allow('').optional()
});

module.exports = acompanhamentoSchema;