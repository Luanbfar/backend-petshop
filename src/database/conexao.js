require('dotenv').config();
const { DB_URL } = process.env;

const knex = require("knex")({
  client: "pg",
  connection: DB_URL
});

// CONEXÃO LOCAL

// const { DB_HOST, DB_PORT,DB_USER, DB_NAME, DB_PASS } = process.env;

// const knex = require("knex")({
//   client: "pg",
//   connection: {
//     host: 'localhost',
//     port: 5432,
//     user: 'postgres',
//     password: 'postgres',
//     database: 'caotinho',
//     ssl: { rejectUnauthorized: false }
//   },
// });
module.exports = knex;