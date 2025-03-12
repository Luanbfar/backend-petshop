const joi = require('joi');

const loginSchema = joi.object({
    cpf: joi.string().required().messages({
        'string.empty': 'O campo CPF é obrigatório.',
        'any.required': 'O campo CPF é obrigatório.'
    }),
    senha: joi.string().min(5).required().messages({
        'any.required': 'O campo senha é obrigatório.',
        'string.empty': 'O campo senha é obrigatório.',
        'string.min': 'O campo senha deve conter no mínimo 5 caracteres.'
    }),
})

module.exports = loginSchema