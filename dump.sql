-- Table: public.usuario

-- DROP TABLE IF EXISTS public.usuario;

CREATE TABLE IF NOT EXISTS public.usuario
(
    id SERIAL PRIMARY KEY,
    nome text COLLATE pg_catalog."default" NOT NULL,
    senha text COLLATE pg_catalog."default" NOT NULL,
    cpf_cnpj character(15) COLLATE pg_catalog."default" NOT NULL,
    celular text COLLATE pg_catalog."default",
    cep character varying(10) COLLATE pg_catalog."default",
    cidade text COLLATE pg_catalog."default",
    rua text COLLATE pg_catalog."default",
    bairro text COLLATE pg_catalog."default",
    numero text COLLATE pg_catalog."default",
    cargo text COLLATE pg_catalog."default" NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuario
    OWNER to postgres;

-- Table: public.animal

-- DROP TABLE IF EXISTS public.animal;

CREATE TABLE IF NOT EXISTS public.animal
(
    id SERIAL PRIMARY KEY,
    nome text COLLATE pg_catalog."default" NOT NULL,
    peso numeric(10,2),
    data_nascimento character varying(10) COLLATE pg_catalog."default",
    raca text COLLATE pg_catalog."default",
    tipo text COLLATE pg_catalog."default",
    porte text COLLATE pg_catalog."default",
    usuario_id integer NOT NULL,
    CONSTRAINT animal_usuario_id_fkey FOREIGN KEY (usuario_id)
        REFERENCES public.usuario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.animal
    OWNER to postgres;

-- Table: public.agendamento

-- DROP TABLE IF EXISTS public.agendamento;

CREATE TABLE IF NOT EXISTS public.agendamento
(
    id SERIAL PRIMARY KEY,
    data_marcacao character varying(10) COLLATE pg_catalog."default" NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_termino time without time zone NOT NULL,
    servicos text[] COLLATE pg_catalog."default",
    tipo text COLLATE pg_catalog."default",
    confirmacao_agendamento boolean,
    valor numeric(10,2),
    animal_id integer NOT NULL,
    usuario_id integer NOT NULL,
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

ALTER TABLE IF EXISTS public.agendamento
    OWNER to postgres;

-- Table: public.bloqueiohorarios

-- DROP TABLE IF EXISTS public.bloqueiohorarios;

CREATE TABLE IF NOT EXISTS public.bloqueiohorarios
(
    id SERIAL PRIMARY KEY,
    data_bloqueio character varying(10) COLLATE pg_catalog."default" NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_termino time without time zone NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.bloqueiohorarios
    OWNER to postgres;

-- Table: public.produto_servico

-- DROP TABLE IF EXISTS public.produto_servico;

CREATE TABLE IF NOT EXISTS public.produto_servico
(
    id SERIAL PRIMARY KEY,
    nome text COLLATE pg_catalog."default" NOT NULL,
    tipo text COLLATE pg_catalog."default" NOT NULL,
    valor numeric(10,2)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.produto_servico
    OWNER to postgres;