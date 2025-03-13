const typeDefs = require("../schema/pagamentoSchema");
const resolvers = require("../resolvers/pagamentoResolver");
const { ApolloServer } = require("apollo-server-express");
const router = require("../routes/Routes");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: false,
  cache: "bounded",
  context: ({ req }) => {
    const authorization = req.headers.authorization || "";
    return { user: null };
  },
});

async function startServer(app) {
  try {
    await server.start();
    server.applyMiddleware({ app, path: "/pagamentos" });
    app.use(router);
  } catch (error) {
    console.log(error);
    throw new Error("Erro ao iniciar o servidor");
  }
}

module.exports = startServer;
