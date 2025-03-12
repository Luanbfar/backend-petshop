require('dotenv').config();
const senhaToken = process.env.JWT_SECRET_KEY;

module.exports = senhaToken;