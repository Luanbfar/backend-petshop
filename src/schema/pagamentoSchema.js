const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Phone {
    country: String
    area: String
    number: String
    type: String
  }

  type Customer {
    name: String
    email: String
    tax_id: String
    phones: [Phone]
  }

  type Item {
    reference_id: String
    name: String
    quantity: Int
    unit_amount: Int
  }

  type Amount {
    value: Int
    currency: String
  }

  type QRCode {
    amount: Amount
    expiration_date: String
  }

  type AuthenticationMethod {
    type: String
    id: String
    cavv: String
    eci: String
    xid: String
    version: String
    dstrans_id: String
  }

  type Card {
    number: String
    exp_month: String
    exp_year: String
    security_code: Int
    store: Boolean
    last_digits: String
  }

  type Holder {
    name: String
    tax_id: String
  }

  type PaymentMethod {
    type: String
    installments: Int
    capture: Boolean
    card: Card
    holder: Holder
    authentication_method: AuthenticationMethod
  }

  type Charge {
    id: String
    reference_id: String
    status: String
    description: String
    amount: Amount
    payment_method: PaymentMethod
    created_at: String
    paid_at: String
  }

  type OrderLinks {
    rel: String
    href: String
    media: String
    type: String
  }

  type Order {
    id: String
    reference_id: String
    created_at: String
    customer: Customer
    items: [Item]
    notification_urls: [String]
    charges: [Charge]
    qr_codes: [QRCode]
    links: [OrderLinks]
    valor_total: Float
    detalhes_servicos: [ServicoDetalhado]
  }

  type ServicoDetalhado {
    nome: String
    valor: Float
  }

  type Query {
    getOrder(reference_id: String!): Order
  }

  type Mutation {
    createOrder(
      tipoPagamento: String!
      usuario_id: Int!
      agendamento_id: Int!
      dadosPagamento: PaymentMethodInput!
    ): Order

    createSession: String!
    getPublicKey: String!
  }

  input PhoneInput {
    country: String
    area: String
    number: String
    type: String
  }

  input CustomerInput {
    name: String
    email: String
    tax_id: String
    phones: [PhoneInput]
  }

  input ItemInput {
    reference_id: String
    name: String
    quantity: Int
    unit_amount: Int
  }

  input AmountInput {
    value: Int
    currency: String
  }

  input QRCodeInput {
    amount: AmountInput
    expiration_date: String
  }

  input AuthenticationMethodInput {
    type: String
    id: String
    cavv: String
    eci: String
    xid: String
    version: String
    dstrans_id: String
  }

  input CardInput {
    number: String
    exp_month: Int
    exp_year: Int
    security_code: Int
    store: Boolean
  }

  input HolderInput {
    name: String
    tax_id: String
  }

  input PaymentMethodInput {
    type: String
    installments: Int
    capture: Boolean
    card: CardInput
    holder: HolderInput
    authentication_method: AuthenticationMethodInput
  }
`;

module.exports = typeDefs;
