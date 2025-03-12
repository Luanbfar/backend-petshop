const express = require("express");
const login = require("../controllers/login");
const {
  editarUsuario,
  cadastrarUsuarioAutenticado,
  cadastrarUsuarioNaoAutenticado,
  excluiUsuario,
  listarUsuario,
  listarUsuarioCargo,
  listarFuncionarios,
  listarUsuarioNome,
} = require("../controllers/usuario");
const {
  agendar,
  listarAgendamentos,
  excluiAgendamento,
  editarAgendamento,
  listarAgendamentosPorData,
  editarConfirmacaoAgendamento,
  listarAgendamentosPorDataECpf,
  listarHorariosOcupados,
} = require("../controllers/agendamento");
const {
  cadastrarAnimal,
  editarAnimal,
  excluiAnimal,
  listarAnimais,
  listarAnimalDoUsuarioPorNome,
  listarAnimaisUsuarioPorCPF,
  listarAnimaisUsuarioPorID,
  listarAnimal,
  listarAnimalNome,
  excluiAnimalResponsavel,
  adicionarResponsavel,
} = require("../controllers/animal");
const {
  bloquearHorario,
  desbloquearHorario,
  editarBloqueioHorario,
  listarHorariosBloqueados,
} = require("../controllers/bloqueioHorarios");
const {
  editarServico,
  cadastrarServico,
  excluiServico,
  listarServico,
  listarServicos,
  listarPorTipo,
} = require("../controllers/produtoServico");

const agendamentoSchema = require("../schema/agendamentoSchema");
const animalSchema = require("../schema/animalSchema");
const bloqueioHorarioSchema = require("../schema/bloqueioHoraioSchema");
const loginSchema = require("../schema/loginSchema");
const produtoServicoSchema = require("../schema/pordutoServicoSchema");
const usuarioSchema = require("../schema/usuarioSchema");

const adminAutenticacao = require("../middleware/autenticacaoAdmin");
const loginAutenticacao = require("../middleware/loginAutenticacao");
const validarRequisicao = require("../middleware/validarRequisicao");

const router = express();

router.get("/", (req, res) => {
  res.send("API Petshop");
});
router.post("/api/usuario", validarRequisicao(usuarioSchema), cadastrarUsuarioNaoAutenticado);
router.post("/api/login", validarRequisicao(loginSchema), login);

router.use(loginAutenticacao);

router.put("/api/usuario/:id", editarUsuario);
router.get("/api/usuario/:id", listarUsuario);
router.get("/api/usuario/nome/listagem", listarUsuarioNome);

router.post("/api/agendamento", validarRequisicao(agendamentoSchema), agendar);
router.put("/api/agendamento/:id", editarAgendamento);
router.put("/api/agendamento/confirmacao/:id", editarConfirmacaoAgendamento);
router.delete("/api/agendamento/:id", excluiAgendamento);
router.get("/api/agendamento", listarAgendamentos);
router.get("/api/agendamento/data/listagem", listarAgendamentosPorData);
router.get("/api/agendamento/data/cpf/listagem", listarAgendamentosPorDataECpf);
router.get("/api/agendamento/horario/ocupado", listarHorariosOcupados);

router.post("/api/animal", validarRequisicao(animalSchema), cadastrarAnimal);
router.put("/api/animal/:id", editarAnimal);
router.delete("/api/animal/:id", excluiAnimal);
router.get("/api/animal/:id", listarAnimal);
router.get("/api/animal/usr/cpf/listagem", listarAnimaisUsuarioPorCPF);
router.get("/api/animal/usr/id/:usuario_id", listarAnimaisUsuarioPorID);
router.get("/api/animal/usr/nome/:usuario_id", listarAnimalDoUsuarioPorNome);
router.get("/api/animal/nome/listagem", listarAnimalNome);
router.get("/api/animais", listarAnimais);

router.use(adminAutenticacao);
router.post("/api/usuario/autenticado", validarRequisicao(usuarioSchema), cadastrarUsuarioAutenticado);
router.post("/api/bloqueio-horario", validarRequisicao(bloqueioHorarioSchema), bloquearHorario);
router.put("/api/bloqueio-horario/:id", editarBloqueioHorario);
router.delete("/api/bloqueio-horario/:id", desbloquearHorario);
router.get("/api/bloqueio-horarios", listarHorariosBloqueados);

router.post("/api/servico", validarRequisicao(produtoServicoSchema), cadastrarServico);
router.put("/api/servico/:id", editarServico);
router.delete("/api/servico/:id", excluiServico);
router.get("/api/servico/:id", listarServico);

router.delete("/api/usuario/:id", excluiUsuario);
router.get("/api/usuario/cargo/listagem", listarUsuarioCargo);
router.get("/api/usuario/funcionarios/listagem", listarFuncionarios);

module.exports = router;
