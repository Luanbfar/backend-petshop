const joi = require("joi");

const animalSchema = joi.object({
    nome: joi.string().min(2).required().messages({
        "string.min": "O campo nome deve ser preenchido corretamente",
        "any.required": "O campo nome é obrigatório.",
        "string.empty": "O campo nome é obrigatório.",
    }),
    peso: joi.number().required().messages({
        'any.required': 'O campo peso é obrigatório.',
    }),
    data_nascimento: joi.string().min(8).required().messages({
        "string.empty": "Data de nascimento é obrigatória.",
        "any.required": "Data de nascimento é obrigatória.",
    }),
    cpf_dono: joi.string().required().messages({
        'any.required': 'O campo CPF dono é obrigatório.',
    }),
    cliente_id:joi.number().allow('').optional(),
    lista_cpfs:joi.array().allow('').optional(),
    tipo:joi.string().allow('').optional(),
    raca:joi.string().allow('').optional(),
});

module.exports = animalSchema;