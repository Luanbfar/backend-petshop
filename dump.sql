CREATE TABLE IF NOT EXISTS public.usuario
(
    id SERIAL PRIMARY KEY,
    nome TEXT COLLATE pg_catalog."default" NOT NULL,
    senha TEXT COLLATE pg_catalog."default" NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf_cnpj CHARACTER(15) COLLATE pg_catalog."default" NOT NULL,
    celular TEXT COLLATE pg_catalog."default",
    cep VARCHAR(10) COLLATE pg_catalog."default",
    cidade TEXT COLLATE pg_catalog."default",
    rua TEXT COLLATE pg_catalog."default",
    bairro TEXT COLLATE pg_catalog."default",
    numero TEXT COLLATE pg_catalog."default",
    cargo TEXT COLLATE pg_catalog."default" NOT NULL
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.animal
(
    id SERIAL PRIMARY KEY,
    nome TEXT COLLATE pg_catalog."default" NOT NULL,
    peso NUMERIC(10,2),
    data_nascimento VARCHAR(10) COLLATE pg_catalog."default",
    raca TEXT COLLATE pg_catalog."default",
    tipo TEXT COLLATE pg_catalog."default",
    porte TEXT COLLATE pg_catalog."default",
    usuario_id INTEGER NOT NULL,
    CONSTRAINT animal_usuario_id_fkey FOREIGN KEY (usuario_id)
        REFERENCES public.usuario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.agendamento
(
    id SERIAL PRIMARY KEY,
    data_marcacao VARCHAR(10) COLLATE pg_catalog."default" NOT NULL,
    hora_inicio TIME WITHOUT TIME ZONE NOT NULL,
    hora_termino TIME WITHOUT TIME ZONE NOT NULL,
    servicos TEXT[] COLLATE pg_catalog."default",
    tamanho TEXT COLLATE pg_catalog."default",
    confirmacao_agendamento BOOLEAN,
    valor NUMERIC(10,2),
    animal_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    CONSTRAINT agendamento_animal_id_fkey FOREIGN KEY (animal_id)
        REFERENCES public.animal (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT agendamento_usuario_id_fkey FOREIGN KEY (usuario_id)
        REFERENCES public.usuario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.bloqueiohorarios
(
    id SERIAL PRIMARY KEY,
    data_bloqueio VARCHAR(10) COLLATE pg_catalog."default" NOT NULL,
    hora_inicio TIME WITHOUT TIME ZONE NOT NULL,
    hora_termino TIME WITHOUT TIME ZONE NOT NULL
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.produto_servico
(
    id SERIAL PRIMARY KEY,
    nome TEXT COLLATE pg_catalog."default" NOT NULL,
    tipo TEXT COLLATE pg_catalog."default" NOT NULL,
    valor NUMERIC(10,2)
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.caixa (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    data_operacao VARCHAR(10) NOT NULL,
    valor DECIMAL(10,2),
    forma_de_pagamento TEXT,
    produtos_servicos TEXT[],
    nome_cliente TEXT,
    usuario_id INTEGER NOT NULL,
    tipo_de_saida TEXT,
    FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);

CREATE TABLE IF NOT EXISTS public.pagamento (
    id SERIAL PRIMARY KEY,
    pagbank_pedido_id VARCHAR(50),
    pagbank_cobranca_id VARCHAR(50),
    pedido_id VARCHAR,
    status_pagamento TEXT,
    data_pagamento DATE,
    metodo_pagamento TEXT,
    parcelas INTEGER
);
