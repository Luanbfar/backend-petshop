const knex = require('../database/conexao');
const jwt = require('jsonwebtoken');
const senhaToken = require('../senhaToken');
require("dotenv").config();

const loginAutenticacao = async (req, res, next) => {
    const { authorization } = req.headers

    try {

        if (!authorization) {
            return res.status(401).json({ mensagem: 'Para acessar este recurso, um token de autenticação válido deve ser enviado.' });
        }
        const token = authorization.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' })
        }
        const { id } = jwt.verify(token, senhaToken);
        let usuario = (await knex('usuario').select('*').where('id', id));


        if (!usuario.length) {
            throw "Erro na autenticação do usuário";
        }

        req.usuario = {
            id,
            nome: usuario[0].nome,
            email: usuario[0].email
        };

        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({ mensagem: 'Não autorizado, Faça o Login novamente.' })
    }
}

module.exports = loginAutenticacao;

