const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const startServer = require("./server");

const app = express();

app.use(cors());
app.use(bodyParser.json());

startServer(app);

const PORT = process.env.PORT || 3000;

app.listen({ port: PORT }, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
