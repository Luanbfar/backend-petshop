const axios = require("axios");
const apiKey = require("../chaveApi");
const knex = require("../database/conexao");
const { not } = require("joi");

const criarSession = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.pagseguro.com/checkout-sdk/sessions",
      {},
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const getPublicKey = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.pagseguro.com/public-keys",
      {
        type: "card",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    res.status(200).json(response.data.public_key);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const pagamentoCredito = async (data, usuario_id) => {
  const { reference_id, customer, items, charges, notification_urls } = data;
  try {
    const response = await axios.post(
      "https://api.pagseguro.com/orders",
      {
        reference_id: reference_id,
        customer: customer,
        items: items,
        charges: charges,
        notification_urls: notification_urls,
      },
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      }
    );

    const dadosDoPedido = response.data;
    const pagamento = dadosDoPedido.charges[0];

    await knex.transaction(async (trx) => {
      await trx("pagamento").insert({
        pagbank_pedido_id: dadosDoPedido.id,
        pagbank_cobranca_id: pagamento.id,
        pedido_id: reference_id,
        status_pagamento: pagamento.status,
        data_pagamento: pagamento.paid_at,
        metodo_pagamento: pagamento.payment_method.type,
        parcelas: pagamento.payment_method.installments,
      });

      await trx("caixa").insert({
        tipo: "entrada",
        data_operacao: new Date().toISOString().split("T")[0],
        valor: pagamento.amount.value / 100,
        usuario_id: usuario_id,
      });
    });

    return dadosDoPedido;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("Erro no pagamento com cartão de crédito");
  }
};

const pagamentoDebito = async (data, usuario_id) => {
  const { reference_id, customer, items, charges, notification_urls } = data;
  try {
    const response = await axios.post(
      "https://sandbox.api.pagseguro.com/orders",
      {
        reference_id: reference_id,
        customer: customer,
        items: items,
        charges: charges,
        notification_urls: notification_urls,
      },
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      }
    );

    const dadosDoPedido = response.data;
    const pagamento = dadosDoPedido.charges[0];

    await knex.transaction(async (trx) => {
      await trx("pagamento").insert({
        pagbank_pedido_id: dadosDoPedido.id,
        pagbank_cobranca_id: pagamento.id,
        pedido_id: reference_id,
        status_pagamento: pagamento.status,
        data_pagamento: pagamento.paid_at,
        metodo_pagamento: pagamento.payment_method.type,
        parcelas: 0,
      });

      await trx("caixa").insert({
        tipo: "entrada",
        data_operacao: new Date().toISOString().split("T")[0],
        valor: pagamento.amount.value / 100,
        usuario_id: usuario_id,
      });
    });

    return dadosDoPedido;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("Erro no pagamento com cartão de débito");
  }
};

const pagamentoPix = async (data, usuario_id) => {
  const { reference_id, customer, items, qr_codes, notification_urls } = data;
  try {
    const response = await axios.post(
      "https://api.pagseguro.com/orders",
      {
        reference_id: reference_id,
        customer: customer,
        items: items,
        qr_codes: qr_codes,
        notification_urls: notification_urls,
      },
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      }
    );

    const dadosDoPedido = response.data;
    const pagamento = dadosDoPedido.qr_codes[0];

    await knex.transaction(async (trx) => {
      await trx("pagamento").insert({
        pagbank_pedido_id: dadosDoPedido.id,
        pagbank_cobranca_id: pagamento.id,
        pedido_id: reference_id,
        status_pagamento: pagamento.status,
        data_pagamento: pagamento.paid_at,
        metodo_pagamento: "PIX",
        parcelas: 0,
      });

      await trx("caixa").insert({
        tipo: "entrada",
        data_operacao: new Date().toISOString().split("T")[0],
        valor: pagamento.amount.value / 100,
        usuario_id: usuario_id,
      });
    });

    return dadosDoPedido;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("Erro no pagamento com PIX");
  }
};

const efetuarPagamento = async (req, res) => {
  try {
    let result;
    const { tipoPagamento, usuario_id } = req.query;
    const data = req.body;
    switch (tipoPagamento) {
      case "credito":
        result = await pagamentoCredito(data, usuario_id);
        break;
      case "debito":
        result = await pagamentoDebito(data, usuario_id);
        break;
      case "pix":
        result = await pagamentoPix(data, usuario_id);
        break;
      default:
        return res.status(400).json({ error: "Tipo de pagamento inválido" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const consultarPedido = async (order_id) => {
  try {
    const response = await axios.get(
      `https://api.pagseguro.com/orders/${order_id}`,
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Pedido não encontrado");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const verificarPagamentoPedido = async (req, res) => {
  try {
    const { order_id } = req.params;

    const pedido = await consultarPedido(order_id);

    if (pedido.charges) {
      const cobrado = pedido.charges.some((charge) => charge.status === "PAID");

      if (cobrado) {
        res.status(200).json({ message: "O pedido foi pago." });
      } else {
        res.status(200).json({ message: "O pedido não foi pago." });
      }
    } else {
      res.status(200).json({ message: "O pedido não foi pago." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  efetuarPagamento,
  verificarPagamentoPedido,
  criarSession,
  getPublicKey,
};
