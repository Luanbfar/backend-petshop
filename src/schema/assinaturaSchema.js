const joi = require("joi");

const assinaturaSchema = joi.object({
    pacote_id: joi.number().required().messages({
        "any.required": "O campo pacote_id é obrigatório.",
    }),
    animal_id: joi.number().required().messages({
        "any.required": "O campo animal_id é obrigatório.",
    }),
});

module.exports = assinaturaSchema;