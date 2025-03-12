const knex = require('../database/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaToken = require("../senhaToken");
require("dotenv").config();

const login = async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        const usuario = await knex('usuario')
            .where('cpf_cnpj', cpf).first();

        if (!usuario) {
            return res.status(404).json({ mensagem: 'CPF e/ou senha inválido(s).' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(400).json({ mensagem: 'CPF e/ou senha inválido(s).' });
        }

        const token = jwt.sign({ id: usuario.id }, senhaToken, { expiresIn: "8h" });

        const { senha: _, ...usuarioLogado } = usuario;

        return res.json({ usuario: usuarioLogado, token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = login;
