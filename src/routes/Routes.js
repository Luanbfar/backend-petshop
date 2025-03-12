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
  editarAssinatura,
  editarDataRenovacaoAssinatura,
  editarQuantidadeServicosAssinatura,
  cadastrarAssinatura,
  excluiAssinatura,
  listarAssinatura,
  listarAssinaturas,
  listarAssinaturasPorPacoteId,
  listarAssinaturasPorIdCpf,
} = require("../controllers/assinatura");
const {
  editarCaixa,
  cadastrarCaixa,
  excluiCaixa,
  listarCaixa,
  listarCaixas,
  listarCaixaVenda,
  listarCaixaSaida,
  faturamentoPorData,
  faturamentoPorPeriodo,
} = require("../controllers/caixa");
const {
  bloquearHorario,
  desbloquearHorario,
  editarBloqueioHorario,
  listarHorariosBloqueados,
} = require("../controllers/bloqueioHorarios");
const {
  cadastrarPacote,
  editarPacote,
  editarPacoteServico,
  adicionarPacoteServico,
  excluiPacoteServico,
  excluiPacote,
  listarPacote,
  listarPacotes,
} = require("../controllers/pacote");
const {
  editarServico,
  cadastrarServico,
  excluiServico,
  listarServico,
  listarServicos,
  listarPorTipo,
} = require("../controllers/produtoServico");
const {
  cadastrarAcompanhamento,
  editarAcompanhamento,
  excluiAcompanhamento,
  listarAcompanhamentos,
  listarAcompanhamentosStatus,
  listarAcompanhamentosStatusUsuarioID,
  listarAcompanhamentosUsuarioPorCPF,
  listarAcompanhamentosUsuarioPorID,
  listarAcompanhamento,
  listarAcompanhamentoNomeAnimal,
} = require("../controllers/acompanhamento");
const {
  verificarPagamentoPedido,
  efetuarPagamento,
  criarSession,
  getPublicKey,
} = require("../controllers/pagamento");
const { receberNotificacao } = require("../controllers/notificacao");

const acompanhamentoSchema = require("../schema/acompanhamentoSchema");
const agendamentoSchema = require("../schema/agendamentoSchema");
const animalSchema = require("../schema/animalSchema");
const assinaturaSchema = require("../schema/assinaturaSchema");
const bloqueioHorarioSchema = require("../schema/bloqueioHoraioSchema");
const caixaSchema = require("../schema/caixaSchema");
const loginSchema = require("../schema/loginSchema");
const pacoteSchema = require("../schema/pacoteSchema");
const produtoServicoSchema = require("../schema/pordutoServicoSchema");
const usuarioSchema = require("../schema/usuarioSchema");
const pagamentoSchema = require("../schema/pagamentoSchema");

const adminAutenticacao = require("../middleware/autenticacaoAdmin");
const adminColaboradorAutenticacao = require("../middleware/autenticacaoAdminColaborador");
const loginAutenticacao = require("../middleware/loginAutenticacao");
const validarRequisicao = require("../middleware/validarRequisicao");

const router = express();

router.post("/api/caotinho/notificacao", receberNotificacao);
router.post("/api/caotinho/usuario", validarRequisicao(usuarioSchema), cadastrarUsuarioNaoAutenticado); 
router.post("/api/caotinho/login", validarRequisicao(loginSchema), login); 

router.use(loginAutenticacao);

router.put("/api/caotinho/usuario/:id", editarUsuario); 
router.get("/api/caotinho/usuario/:id", listarUsuario); 
router.get("/api/caotinho/usuario/nome/listagem", listarUsuarioNome);

router.post("/api/caotinho/agendamento", validarRequisicao(agendamentoSchema), agendar); 
router.put("/api/caotinho/agendamento/:id", editarAgendamento); 
router.put("/api/caotinho/agendamento/confirmacao/:id", editarConfirmacaoAgendamento); 
router.delete("/api/caotinho/agendamento/:id", excluiAgendamento); 
router.get("/api/caotinho/agendamento", listarAgendamentos); 
router.get("/api/caotinho/agendamento/data/listagem", listarAgendamentosPorData); 
router.get("/api/caotinho/agendamento/data/cpf/listagem", listarAgendamentosPorDataECpf); 
router.get("/api/caotinho/agendamento/horario/ocupado", listarHorariosOcupados);

router.post("/api/caotinho/assinatura", validarRequisicao(assinaturaSchema), cadastrarAssinatura); 
router.put("/api/caotinho/assinatura/:id", editarAssinatura); 
router.put("/api/caotinho/assinatura/renovacao/:id", editarDataRenovacaoAssinatura); 
router.put("/api/caotinho/assinatura/servico/:assinatura_id/:servico_id", editarQuantidadeServicosAssinatura); 
router.delete("/api/caotinho/assinatura/:id", excluiAssinatura); 
router.get("/api/caotinho/assinatura/:id", listarAssinatura); 
router.get("/api/caotinho/assinatura/pacote/:pacote_id", listarAssinaturasPorPacoteId); 
router.get("/api/caotinho/assinatura/pacote/usr/:pacote_id", listarAssinaturasPorIdCpf); 
router.get("/api/caotinho/assinaturas", listarAssinaturas); 
router.get("/api/caotinho/pacotes", listarPacotes);

router.post("/api/caotinho/animal", validarRequisicao(animalSchema), cadastrarAnimal); 
router.post("/api/caotinho/animal/responsavel/:animal_id", adicionarResponsavel); 
router.put("/api/caotinho/animal/:id", editarAnimal); 
router.delete("/api/caotinho/animal/:id", excluiAnimal); 
router.delete("/api/caotinho/animal/responsavel/:id", excluiAnimalResponsavel); 
router.get("/api/caotinho/animal/:id", listarAnimal); 
router.get("/api/caotinho/animal/usr/cpf/listagem", listarAnimaisUsuarioPorCPF); 
router.get("/api/caotinho/animal/usr/id/:usuario_id", listarAnimaisUsuarioPorID); 
router.get("/api/caotinho/animal/usr/nome/:usuario_id", listarAnimalDoUsuarioPorNome); 
router.get("/api/caotinho/animal/nome/listagem", listarAnimalNome); 
router.get("/api/caotinho/animais", listarAnimais);

router.get("/api/caotinho/servicos", listarServicos); 
router.get("/api/caotinho/servicos/tipo/listagem", listarPorTipo);

router.get("/api/caotinho/publickey", getPublicKey);
router.post("/api/caotinho/session", criarSession); 
router.post("/api/caotinho/pagamento", efetuarPagamento); 
router.get("/api/caotinho/verificarpagamento/:order_id", verificarPagamentoPedido);
router.get("/api/caotinho/acompanhamentos/usr/id/:usuario_id", listarAcompanhamentosUsuarioPorID);

router.use(adminColaboradorAutenticacao);

router.post("/api/caotinho/caixa", validarRequisicao(caixaSchema), cadastrarCaixa);


router.post("/api/caotinho/bloqueio-horario", validarRequisicao(bloqueioHorarioSchema), bloquearHorario); 
router.put("/api/caotinho/bloqueio-horario/:id", editarBloqueioHorario); 
router.delete("/api/caotinho/bloqueio-horario/:id", desbloquearHorario); 
router.get("/api/caotinho/bloqueio-horarios", listarHorariosBloqueados);

router.post("/api/caotinho/pacote", validarRequisicao(pacoteSchema), cadastrarPacote); 
router.post("/api/caotinho/pacote/adicionar/servico", adicionarPacoteServico); 
router.put("/api/caotinho/pacote/:id", editarPacote); 
router.put("/api/caotinho/pacote/editar/servico/:pacote_id/:servico_id", editarPacoteServico); 
router.delete("/api/caotinho/pacote/servico/:pacote_id/:servico_id", excluiPacoteServico); 
router.delete("/api/caotinho/pacote/:id", excluiPacote); 
router.get("/api/caotinho/pacote/:id", listarPacote);

router.post("/api/caotinho/servico", validarRequisicao(produtoServicoSchema), cadastrarServico); 
router.put("/api/caotinho/servico/:id", editarServico); 
router.delete("/api/caotinho/servico/:id", excluiServico); 
router.get("/api/caotinho/servico/:id", listarServico);

router.delete("/api/caotinho/usuario/:id", excluiUsuario); 
router.get("/api/caotinho/usuario/cargo/listagem", listarUsuarioCargo); 
router.get("/api/caotinho/usuario/funcionarios/listagem", listarFuncionarios);

router.post("/api/caotinho/acompanhamento", validarRequisicao(acompanhamentoSchema), cadastrarAcompanhamento); 
router.put("/api/caotinho/acompanhamento/:id", editarAcompanhamento); 
router.delete("/api/caotinho/acompanhamento/:id", excluiAcompanhamento); 
router.get("/api/caotinho/acompanhamento/:id", listarAcompanhamento); 
router.get("/api/caotinho/acompanhamentos", listarAcompanhamentos); 
router.get("/api/caotinho/acompanhamentos/status", listarAcompanhamentosStatus); 
router.get("/api/caotinho/acompanhamentos/status/usr/:usuario_id", listarAcompanhamentosStatusUsuarioID); 
router.get("/api/caotinho/acompanhamentos/usr/cpf", listarAcompanhamentosUsuarioPorCPF); 
router.get("/api/caotinho/acompanhamentos/animal/nome", listarAcompanhamentoNomeAnimal);

//só administrador
router.use(adminAutenticacao);
router.post("/api/caotinho/usuario/autenticado", validarRequisicao(usuarioSchema), cadastrarUsuarioAutenticado);

router.put("/api/caotinho/caixa/:id", editarCaixa); 
router.delete("/api/caotinho/caixa/:id", excluiCaixa); 
router.get("/api/caotinho/caixa/:id", listarCaixa); 
router.get("/api/caotinho/caixas", listarCaixas); 
router.get("/api/caotinho/caixas/venda", listarCaixaVenda); 
router.get("/api/caotinho/caixas/saida", listarCaixaSaida); 
router.get("/api/caotinho/caixa/faturamento/data", faturamentoPorData); 
router.get("/api/caotinho/caixa/faturamento/periodo", faturamentoPorPeriodo);

module.exports = router;
