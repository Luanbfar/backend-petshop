const joi = require("joi");

const caixaSchema = joi.object({
    tipo: joi.string().min(2).required().messages({
        "string.min": "O campo tipo deve ser preenchido corretamente",
        "any.required": "O campo tipo é obrigatório.",
        "string.empty": "O campo tipo é obrigatório.",
    }),
    data_operacao: joi.string().min(8).required().messages({
        "string.empty": "Data de operação é obrigatória.",
        "any.required": "Data de operação é obrigatória.",
    }),
    valor: joi.number().required().messages({
        'any.required': 'O campo valor é obrigatório.',
    }),
    usuario_id: joi.number().required().messages({
        "any.required": "O campo usuario_id  é obrigatório.",
    }),
    forma_de_pagamento:joi.string().allow('').optional(), 
    produtos_servicos:joi.array().allow('').optional(),
    nome_cliente:joi.string().allow('').optional(),
    tipo_de_saida:joi.string().allow('').optional()
});

module.exports = caixaSchema;