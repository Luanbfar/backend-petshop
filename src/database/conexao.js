require('dotenv').config();
const { DB_URL } = process.env;

const knex = require("knex")({
  client: "pg",
  connection: DB_URL
});

module.exports = knex;