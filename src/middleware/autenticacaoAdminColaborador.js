const knex = require('../database/conexao');
const jwt = require('jsonwebtoken');
const senhaToken = require('../senhaToken');
require("dotenv").config();

const adminColaboradorAutenticacao = async (req, res, next) => {
    const { authorization } = req.headers;

    try {
        if (!authorization) {
            return res.status(401).json({ mensagem: 'Token de autorização não fornecido.' });
        }

        const token = authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ mensagem: 'Token de autorização malformado.' });
        }

        const { id } = jwt.verify(token, senhaToken);

        const usuario = await knex('usuario')
            .select('*')
            .where('id', id)
            .first();

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
        }

        if (usuario.cargo !== "Administrador" && usuario.cargo !== "Colaborador") {
            return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
}

module.exports = adminColaboradorAutenticacao;