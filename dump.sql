create database caotinho;

CREATE TABLE USUARIO (
	id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  senha TEXT NOT NULL,
  cpf_cnpj CHAR(15) NOT NULL,
  celular TEXT,
  cep VARCHAR(10),
  cidade TEXT,
  rua TEXT,
  bairro TEXT,
  numero TEXT,
  cargo TEXT NOT NULL
);

CREATE TABLE ANIMAL(
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  peso DECIMAL(10,2),
  data_nascimento VARCHAR(10),
  foto_animal TEXT,
  raca TEXT,
  tipo TEXT,
  porte TEXT,
  usuario_id INTEGER NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES USUARIO(id)
);

CREATE TABLE ANIMAL_RESPONSAVEL(
  animal_id INTEGER NOT NULL,
  cpf CHAR(15) NOT NULL,
  nome TEXT NOT NULL,
  FOREIGN KEY (animal_id) REFERENCES ANIMAL(id)
);

CREATE TABLE PACOTE (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  valor DECIMAL(10,2)
);

CREATE TABLE PACOTE_SERVICO (
  pacote_id INTEGER NOT NULL,
  servico_id INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  PRIMARY KEY (pacote_id,servico_id),
  FOREIGN KEY (servico_id) REFERENCES PRODUTO_SERVICO(id),
  FOREIGN KEY (pacote_id) REFERENCES PACOTE(id)
);

CREATE TABLE PRODUTO_SERVICO (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor DECIMAL(10,2)
);

CREATE TABLE AGENDAMENTO (
  id SERIAL PRIMARY KEY,
  data_marcacao VARCHAR(10) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_termino TIME NOT NULL,
  servicos TEXT[],
  tipo TEXT,
  confirmacao_agendamento BOOLEAN,
  valor DECIMAL(10,2),
  animal_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES USUARIO(id),
  FOREIGN KEY (animal_id) REFERENCES ANIMAL(id)
);

CREATE TABLE ASSINATURA (
  id SERIAL PRIMARY KEY,
  pacote_id INTEGER NOT NULL,
  animal_id INTEGER NOT NULL,
  data_assinatura DATE,
  data_renovacao DATE,
  FOREIGN KEY (pacote_id) REFERENCES PACOTE(id),
  FOREIGN KEY (animal_id) REFERENCES ANIMAL(id)
);

CREATE TABLE ASSINATURA_SERVICO (
  assinatura_id INTEGER NOT NULL,
  servico_id INTEGER NOT NULL,
  quantidade_disponivel INTEGER NOT NULL,
  quantidade_utilizada INTEGER NOT NULL,
  PRIMARY KEY (assinatura_id, servico_id),
  FOREIGN KEY (assinatura_id) REFERENCES ASSINATURA(id),
  FOREIGN KEY (servico_id) REFERENCES PRODUTO_SERVICO(id)
);

CREATE TABLE CAIXA (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  data_operacao VARCHAR(10) NOT NULL,
  valor DECIMAL(10,2),
  forma_de_pagamento TEXT,
  produtos_servicos TEXT[],
  nome_cliente TEXT,
  usuario_id INTEGER NOT NULL,
  tipo_de_saida TEXT,
  FOREIGN KEY (usuario_id) REFERENCES USUARIO(id)
);

CREATE TABLE BloqueioHorarios (
  id SERIAL PRIMARY KEY,
  data_bloqueio VARCHAR(10) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_termino TIME NOT NULL
);

CREATE TABLE ACOMPANHAMENTO (
  id SERIAL PRIMARY KEY,
  nome_animal TEXT NOT NULL,
  data_marcacao VARCHAR(10) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_termino TIME NOT NULL,
  servicos TEXT[],
  status_acompanhamento TEXT NOT NULL,
  observacao TEXT,
  usuario_id INTEGER NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES USUARIO(id)
);

CREATE TABLE pagamento (
    id SERIAL PRIMARY KEY,
    pagbank_pedido_id VARCHAR(50),
    pagbank_cobranca_id VARCHAR(50),
    pedido_id INTEGER,
    status_pagamento TEXT,
    data_pagamento DATE,
    metodo_pagamento TEXT,
    parcelas INTEGER
);
