const cors = require("cors");
const express = require("express");
const router = require("../routes/Routes");
const bodyParser = require('body-parser');

const app = express();

app.use(cors());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(express.json());

app.use(router);

module.exports = app;
