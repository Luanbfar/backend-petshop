const cors = require("cors");
const express = require("express");
const router = require("../routes/Routes");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(express.json());

app.use(router);

module.exports = app;
