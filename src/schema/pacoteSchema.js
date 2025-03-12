const joi = require("joi");

const pacoteSchema = joi.object({
    tipo: joi.string().min(1).required().messages({
        "string.min": "O campo Tipo deve ser preenchido corretamente",
        "any.required": "O campo Tipo é obrigatório.",
        "string.empty": "O campo Tipo é obrigatório.",
    }),
    lista_servicos: joi.array().required().messages({
        'any.required': 'O campo serviços é obrigatório.',
    }),
    quantidade: joi.number().required().messages({
        'any.required': 'O campo quantidade é obrigatório.',
    }),
    valor: joi.number().required().messages({
        'any.required': 'O campo valor é obrigatório.',
    })
});

module.exports = pacoteSchema;