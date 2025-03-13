const { v4: uuidv4 } = require("uuid");
const knex = require("../database/conexao");
const axios = require("axios");
const { paymentsApiURL, apiKey } = require("../chaveApi");

const buscarDadosAgendamentoPagamento = async (agendamento_id) => {
  try {
    const agendamento = await knex("agendamento")
      .select(
        "agendamento.*",
        "usuario.nome as usuario_nome",
        "usuario.email as usuario_email",
        "usuario.cpf_cnpj as usuario_cpf_cnpj",
        "usuario.celular as usuario_celular",
        "animal.nome as animal_nome"
      )
      .leftJoin("usuario", "agendamento.usuario_id", "usuario.id")
      .leftJoin("animal", "agendamento.animal_id", "animal.id")
      .where("agendamento.id", agendamento_id)
      .first();

    if (!agendamento) {
      throw new Error("Agendamento não encontrado");
    }

    const servicosAgendamento = await Promise.all(
      agendamento.servicos.map(async (nomeServico) => {
        const servico = await knex("produto_servico").select("nome", "valor").where("nome", nomeServico).first();
        return servico ? { nome_servico: servico.nome, valor_servico: servico.valor } : null;
      })
    );

    const sanitizarTaxId = (taxId) => (taxId ? taxId.replace(/\D/g, "") : null);

    const extrairTelefone = (celular) => {
      if (!celular) return null;
      const telefoneNumerico = celular.replace(/\D/g, "");
      if (telefoneNumerico.length < 10) return null;
      return {
        country: "55",
        area: telefoneNumerico.substring(0, 2),
        number: telefoneNumerico.substring(2),
        type: "MOBILE",
      };
    };

    const telefone = extrairTelefone(agendamento.usuario_celular);

    const dadosCliente = {
      name: agendamento.usuario_nome,
      email: agendamento.usuario_email,
      tax_id: sanitizarTaxId(agendamento.usuario_cpf_cnpj),
      phones: telefone ? [telefone] : [],
    };

    const itensServicos = servicosAgendamento.map((servico, index) => ({
      reference_id: `SERV-${index + 1}`,
      name: servico.nome_servico,
      quantity: 1,
      unit_amount: Math.round(servico.valor_servico * 100),
    }));

    return {
      customer: dadosCliente,
      items: itensServicos,
      reference_id: `AGEND-${agendamento.id}`,
      valor_total: agendamento.valor,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do agendamento:", error);
    throw new Error(`Erro ao processar agendamento: ${error.message}`);
  }
};

const pagamentoCredito = async (dadosCliente, dadosPagamento, usuario_id) => {
  const { reference_id, customer, items, valor_total } = dadosCliente;
  const chargeReferenceId = `CHARGE-${uuidv4()}`;

  const charges = [
    {
      reference_id: chargeReferenceId,
      description: "Serviços Petshop - Banho e Tosa",
      amount: { value: Math.round(valor_total * 100), currency: "BRL" },
      payment_method: dadosPagamento,
    },
  ];

  try {
    const response = await axios.post(
      `${paymentsApiURL}/orders`,
      { reference_id, customer, items, charges },
      { headers: { accept: "*/*", Authorization: `Bearer ${apiKey}`, "content-type": "application/json" } }
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
        usuario_id,
      });
    });

    return dadosDoPedido;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("Erro no pagamento com cartão de crédito");
  }
};

const pagamentoDebito = async (dadosCliente, dadosPagamento, usuario_id) => {
  const { reference_id, customer, items, valor_total } = dadosCliente;
  const chargeReferenceId = `CHARGE-${uuidv4()}`;

  const charges = [
    {
      reference_id: chargeReferenceId,
      description: "Serviços Petshop - Banho e Tosa",
      amount: { value: Math.round(valor_total * 100), currency: "BRL" },
      payment_method: dadosPagamento,
    },
  ];

  try {
    const response = await axios.post(
      `${paymentsApiURL}/orders`,
      { reference_id, customer, items, charges },
      { headers: { accept: "*/*", Authorization: `Bearer ${apiKey}`, "content-type": "application/json" } }
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
        usuario_id,
      });
    });

    return dadosDoPedido;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("Erro no pagamento com cartão de débito");
  }
};

const pagamentoPix = async (dadosCliente, dadosPagamento, usuario_id) => {
  const { reference_id, customer, items, valor_total } = dadosCliente;
  const chargeReferenceId = `CHARGE-${uuidv4()}`;

  const qr_codes = [
    {
      reference_id: chargeReferenceId,
      description: "Serviços Petshop - Banho e Tosa",
      amount: { value: Math.round(valor_total * 100), currency: "BRL" },
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  try {
    const response = await axios.post(
      `${paymentsApiURL}/orders`,
      { reference_id, customer, items, qr_codes },
      { headers: { accept: "*/*", Authorization: `Bearer ${apiKey}`, "content-type": "application/json" } }
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
        usuario_id,
      });
    });

    return dadosDoPedido;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("Erro no pagamento com PIX");
  }
};

const consultarPedido = async (order_id) => {
  try {
    const response = await axios.get(`${paymentsApiURL}/orders/${order_id}`, {
      headers: { accept: "*/*", Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Pedido não encontrado");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { buscarDadosAgendamentoPagamento, pagamentoCredito, pagamentoDebito, pagamentoPix, consultarPedido };
