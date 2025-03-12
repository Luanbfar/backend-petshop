const joi = require('joi');

const phoneSchema = joi.object({
  country: joi.string().length(2).required(),
  area: joi.string().length(2).required(),
  number: joi.string().min(8).max(9).required(),
  type: joi.string().valid('MOBILE', 'HOME', 'BUSINESS').required()
});

const customerSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  tax_id: joi.string().length(11).required(),
  phones: joi.array().items(phoneSchema).required()
});

const itemSchema = joi.object({
  reference_id: joi.string().required(),
  name: joi.string().required(),
  quantity: joi.number().integer().min(1).required(),
  unit_amount: joi.number().integer().min(1).required()
});

const amountSchema = joi.object({
  value: joi.number().integer().min(1).required(),
  currency: joi.string().valid('BRL')
});

const qrCodeSchema = joi.object({
  amount: amountSchema.required(),
  expiration_date: joi.date().iso()
});

const authenticationMethodSchema = joi.object({
  type: joi.string().valid('THREEDS', 'INAPP').required(),
  id: joi.string().required(),
  cavv: joi.string(),
  eci: joi.string().required(),
  xid: joi.string(),
  version: joi.string(),
  dstrans_id: joi.string()
});

const paymentMethodSchema = joi.object({
  type: joi.string().valid('CREDIT_CARD', 'DEBIT_CARD').required(),
  installments: joi.number().integer().min(1),
  capture: joi.boolean().required(),
  card: joi.object({
    encrypted: joi.string().required(),
    store: joi.boolean().required()
  }).required(),
  holder: joi.object({
    name: joi.string().required(),
    tax_id: joi.string().length(11).required()
  }).required(),
  authentication_method: joi.object({
    type: joi.string().valid('THREEDS', 'INAPP').required(),
    id: joi.string().required(),
    cavv: joi.string(),
    eci: joi.string().required(),
    xid: joi.string(),
    version: joi.string(),
    dstrans_id: joi.string()
  }).when('type', { is: 'DEBIT_CARD', then: joi.required(), otherwise: joi.forbidden() })
});

const chargeSchema = joi.object({
  reference_id: joi.string().required(),
  description: joi.string().required(),
  amount: amountSchema.required(),
  payment_method: paymentMethodSchema.required()
});

const orderSchema = joi.object({
  reference_id: joi.string().required(),
  customer: customerSchema.required(),
  items: joi.array().items(itemSchema).required(),
  notification_urls: joi.array().items(joi.string().uri()).required(),
  charges: joi.array().items(chargeSchema),
  qr_codes: joi.array().items(qrCodeSchema).when('charges', { is: joi.exist(), then: joi.forbidden(), otherwise: joi.required() })
});

module.exports = orderSchema;
