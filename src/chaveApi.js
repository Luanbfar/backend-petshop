require("dotenv").config();
const apiKey = process.env.API_KEY;
const paymentsApiURL = process.env.PAYMENTS_API_URL;

module.exports = { apiKey, paymentsApiURL };
