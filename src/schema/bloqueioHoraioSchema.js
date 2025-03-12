const joi = require("joi");

const horariosBloqueadosSchema = joi.object({
    data_bloqueio: joi.string().min(10).required().messages({
    "string.min": "O campo Data Bloqueio deve ser preenchido corretamente",
    "any.required": "O campo Data Bloqueio é obrigatório.",
    "string.empty": "O campo Data Bloqueio é obrigatório.",
  }),
  hora_inicio: joi.string().required().messages({
    "string.empty": "Hora de inicio é obrigatória.",
    "any.required": "Hora de inicio é obrigatória.",
  }),
  hora_termino: joi.string().required().messages({
    "string.empty": "Hora de termino é obrigatória.",
    "any.required": "Hora de termino é obrigatória.",
  })
});

module.exports = horariosBloqueadosSchema;