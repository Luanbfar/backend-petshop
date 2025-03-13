const {
  pagamentoCredito,
  pagamentoDebito,
  pagamentoPix,
  consultarPedido,
  buscarDadosAgendamentoPagamento,
} = require("../controllers/pagamento");

const resolvers = {
  Query: {
    getOrder: async (_, { reference_id }) => {
      try {
        const order = await consultarPedido(reference_id);
        return order;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    createOrder: async (_, { dadosPagamento, tipoPagamento, usuario_id, agendamento_id }) => {
      try {
        const dadosAgendamento = await buscarDadosAgendamentoPagamento(agendamento_id);
        let result;
        switch (tipoPagamento) {
          case "credito":
            result = await pagamentoCredito(dadosAgendamento, dadosPagamento, usuario_id);
            break;
          case "debito":
            result = await pagamentoDebito(dadosAgendamento, dadosPagamento, usuario_id);
            break;
          case "pix":
            result = await pagamentoPix(dadosAgendamento, dadosPagamento, usuario_id);
            break;
          default:
            throw new Error("Tipo de pagamento inválido");
        }
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

module.exports = resolvers;
