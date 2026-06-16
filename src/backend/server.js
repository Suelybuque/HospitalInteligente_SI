const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────────

function lerDados(ficheiro) {
  const caminho = path.join(DATA_DIR, ficheiro);
  if (!fs.existsSync(caminho)) return [];
  return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
}

function guardarDados(ficheiro, dados) {
  fs.writeFileSync(path.join(DATA_DIR, ficheiro), JSON.stringify(dados, null, 2), 'utf-8');
}

function novoId(prefixo) {
  return `${prefixo}-${Date.now()}`;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });

  const utilizadores = lerDados('utilizadores.json');
  const utilizador = utilizadores.find(u => u.email === email && u.senha === senha);
  if (!utilizador) return res.status(401).json({ erro: 'Credenciais inválidas.' });

  const { senha: _, ...semSenha } = utilizador;
  res.json({ utilizador: semSenha });
});

// POST /auth/registo
app.post('/auth/registo', (req, res) => {
  const { nome, email, senha, perfil } = req.body;
  if (!nome || !email || !senha || !perfil) return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });

  const utilizadores = lerDados('utilizadores.json');
  if (utilizadores.find(u => u.email === email)) return res.status(400).json({ erro: 'Email já registado.' });

  const novo = { id: novoId('U'), nome, email, senha, perfil };
  utilizadores.push(novo);
  guardarDados('utilizadores.json', utilizadores);

  const { senha: _, ...semSenha } = novo;
  res.status(201).json({ utilizador: semSenha });
});

// ── UTILIZADORES ──────────────────────────────────────────────────────────────

// GET /utilizadores
app.get('/utilizadores', (req, res) => {
  const dados = lerDados('utilizadores.json').map(({ senha, ...u }) => u);
  res.json(dados);
});

// GET /utilizadores/:id
app.get('/utilizadores/:id', (req, res) => {
  const utilizadores = lerDados('utilizadores.json');
  const u = utilizadores.find(u => u.id === req.params.id);
  if (!u) return res.status(404).json({ erro: 'Utilizador não encontrado.' });
  const { senha, ...semSenha } = u;
  res.json(semSenha);
});

// POST /utilizadores
app.post('/utilizadores', (req, res) => {
  const { nome, email, senha, perfil } = req.body;
  if (!nome || !email || !senha || !perfil) return res.status(400).json({ erro: 'Campos obrigatórios em falta.' });

  const utilizadores = lerDados('utilizadores.json');
  if (utilizadores.find(u => u.email === email)) return res.status(400).json({ erro: 'Email já registado.' });

  const novo = { id: novoId('U'), nome, email, senha, perfil };
  utilizadores.push(novo);
  guardarDados('utilizadores.json', utilizadores);
  const { senha: _, ...semSenha } = novo;
  res.status(201).json(semSenha);
});

// PUT /utilizadores/:id
app.put('/utilizadores/:id', (req, res) => {
  const utilizadores = lerDados('utilizadores.json');
  const idx = utilizadores.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Utilizador não encontrado.' });

  utilizadores[idx] = { ...utilizadores[idx], ...req.body, id: req.params.id };
  guardarDados('utilizadores.json', utilizadores);
  const { senha, ...semSenha } = utilizadores[idx];
  res.json(semSenha);
});

// DELETE /utilizadores/:id
app.delete('/utilizadores/:id', (req, res) => {
  const utilizadores = lerDados('utilizadores.json');
  const novos = utilizadores.filter(u => u.id !== req.params.id);
  if (novos.length === utilizadores.length) return res.status(404).json({ erro: 'Utilizador não encontrado.' });
  guardarDados('utilizadores.json', novos);
  res.json({ mensagem: 'Utilizador eliminado.' });
});

// ── PACIENTES ─────────────────────────────────────────────────────────────────

// POST /pacientes/registar  — cria paciente + conta de acesso numa só operação
app.post('/pacientes/registar', (req, res) => {
  const { nome, dataNascimento, genero, alergias, historico, prioridade,
          email, senha, vitais } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
  }

  const utilizadores = lerDados('utilizadores.json');
  if (utilizadores.find(u => u.email === email)) {
    return res.status(400).json({ erro: 'Email já registado.' });
  }

  // 1. Criar registo de paciente
  const pacientes = lerDados('pacientes.json');
  const pacienteId = novoId('PAC');
  const novoPaciente = {
    id: pacienteId,
    nome,
    dataNascimento: dataNascimento || null,
    genero: genero || null,
    prioridade: prioridade || 'ROTINA',
    tempoEspera: '—',
    estado: 'aguardando',
    alergias: alergias || [],
    historico: historico || [],
  };
  pacientes.push(novoPaciente);
  guardarDados('pacientes.json', pacientes);

  // 2. Criar conta de utilizador vinculada
  const utilizadorId = novoId('U');
  const novoUtilizador = { id: utilizadorId, nome, email, senha, perfil: 'patient', pacienteId };
  utilizadores.push(novoUtilizador);
  guardarDados('utilizadores.json', utilizadores);

  // 3. Registo de entrada no histórico clínico (se existir)
  if (historico && historico.length > 0) {
    const hist = lerDados('historico_clinico.json');
    historico.forEach(condicao => {
      hist.push({ id: novoId('HC'), pacienteId, tipo: 'Condição Crónica', nota: condicao, data: new Date().toISOString().split('T')[0] });
    });
    guardarDados('historico_clinico.json', hist);
  }

  // 4. Guardar sinais vitais iniciais (se fornecidos)
  if (vitais) {
    const sv = lerDados('sinais_vitais.json');
    sv.push({ id: novoId('SV'), pacienteId, data: new Date().toISOString().split('T')[0], ...vitais });
    guardarDados('sinais_vitais.json', sv);
  }

  // 5. Registar auditoria
  const auditoria = lerDados('auditoria.json');
  auditoria.push({
    id: novoId('AUD'),
    timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    evento: `Paciente registado: ${nome}`,
    actor: 'Sistema Clínico',
    local: 'Admissão',
    estado: 'INFO',
  });
  guardarDados('auditoria.json', auditoria);

  const { senha: _, ...utilizadorSemSenha } = novoUtilizador;
  res.status(201).json({ paciente: novoPaciente, utilizador: utilizadorSemSenha });
});

// GET /pacientes
app.get('/pacientes', (req, res) => {
  let dados = lerDados('pacientes.json');
  if (req.query.estado) dados = dados.filter(p => p.estado === req.query.estado);
  if (req.query.prioridade) dados = dados.filter(p => p.prioridade === req.query.prioridade);
  res.json(dados);
});

// GET /pacientes/:id
app.get('/pacientes/:id', (req, res) => {
  const pacientes = lerDados('pacientes.json');
  const p = pacientes.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ erro: 'Paciente não encontrado.' });
  res.json(p);
});

// POST /pacientes
app.post('/pacientes', (req, res) => {
  const pacientes = lerDados('pacientes.json');
  const novo = { id: novoId('PAC'), estado: 'aguardando', prioridade: 'ROTINA', ...req.body };
  pacientes.push(novo);
  guardarDados('pacientes.json', pacientes);
  res.status(201).json(novo);
});

// PUT /pacientes/:id
app.put('/pacientes/:id', (req, res) => {
  const pacientes = lerDados('pacientes.json');
  const idx = pacientes.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Paciente não encontrado.' });
  pacientes[idx] = { ...pacientes[idx], ...req.body, id: req.params.id };
  guardarDados('pacientes.json', pacientes);
  res.json(pacientes[idx]);
});

// DELETE /pacientes/:id
app.delete('/pacientes/:id', (req, res) => {
  const pacientes = lerDados('pacientes.json');
  const novos = pacientes.filter(p => p.id !== req.params.id);
  if (novos.length === pacientes.length) return res.status(404).json({ erro: 'Paciente não encontrado.' });
  guardarDados('pacientes.json', novos);
  res.json({ mensagem: 'Paciente removido.' });
});

// ── CONSULTAS ─────────────────────────────────────────────────────────────────

// GET /consultas
app.get('/consultas', (req, res) => {
  let dados = lerDados('consultas.json');
  if (req.query.pacienteId) dados = dados.filter(c => c.pacienteId === req.query.pacienteId);
  if (req.query.medicoId) dados = dados.filter(c => c.medicoId === req.query.medicoId);
  if (req.query.estado) dados = dados.filter(c => c.estado === req.query.estado);
  res.json(dados);
});

// GET /pacientes/:id/consultas
app.get('/pacientes/:id/consultas', (req, res) => {
  const dados = lerDados('consultas.json').filter(c => c.pacienteId === req.params.id);
  res.json(dados);
});

// GET /consultas/:id
app.get('/consultas/:id', (req, res) => {
  const consultas = lerDados('consultas.json');
  const c = consultas.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ erro: 'Consulta não encontrada.' });
  res.json(c);
});

// POST /consultas
app.post('/consultas', (req, res) => {
  const consultas = lerDados('consultas.json');
  const nova = { id: novoId('CON'), estado: 'agendada', ...req.body };
  consultas.push(nova);
  guardarDados('consultas.json', consultas);
  res.status(201).json(nova);
});

// PUT /consultas/:id
app.put('/consultas/:id', (req, res) => {
  const consultas = lerDados('consultas.json');
  const idx = consultas.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Consulta não encontrada.' });
  consultas[idx] = { ...consultas[idx], ...req.body, id: req.params.id };
  guardarDados('consultas.json', consultas);
  res.json(consultas[idx]);
});

// DELETE /consultas/:id
app.delete('/consultas/:id', (req, res) => {
  const consultas = lerDados('consultas.json');
  const novas = consultas.filter(c => c.id !== req.params.id);
  if (novas.length === consultas.length) return res.status(404).json({ erro: 'Consulta não encontrada.' });
  guardarDados('consultas.json', novas);
  res.json({ mensagem: 'Consulta cancelada.' });
});

// ── SINAIS VITAIS ─────────────────────────────────────────────────────────────

// GET /pacientes/:id/vitais
app.get('/pacientes/:id/vitais', (req, res) => {
  const dados = lerDados('sinais_vitais.json').filter(v => v.pacienteId === req.params.id);
  res.json(dados);
});

// GET /vitais/:id
app.get('/vitais/:id', (req, res) => {
  const vitais = lerDados('sinais_vitais.json');
  const v = vitais.find(v => v.id === req.params.id);
  if (!v) return res.status(404).json({ erro: 'Registo não encontrado.' });
  res.json(v);
});

// POST /pacientes/:id/vitais
app.post('/pacientes/:id/vitais', (req, res) => {
  const vitais = lerDados('sinais_vitais.json');
  const novo = { id: novoId('SV'), pacienteId: req.params.id, data: new Date().toISOString().split('T')[0], ...req.body };
  vitais.push(novo);
  guardarDados('sinais_vitais.json', vitais);
  res.status(201).json(novo);
});

// PUT /vitais/:id
app.put('/vitais/:id', (req, res) => {
  const vitais = lerDados('sinais_vitais.json');
  const idx = vitais.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Registo não encontrado.' });
  vitais[idx] = { ...vitais[idx], ...req.body, id: req.params.id };
  guardarDados('sinais_vitais.json', vitais);
  res.json(vitais[idx]);
});

// ── RESULTADOS DE ANÁLISES ────────────────────────────────────────────────────

// GET /analises
app.get('/analises', (req, res) => {
  let dados = lerDados('resultados_analises.json');
  if (req.query.pacienteId) dados = dados.filter(a => a.pacienteId === req.query.pacienteId);
  res.json(dados);
});

// GET /pacientes/:id/analises
app.get('/pacientes/:id/analises', (req, res) => {
  const dados = lerDados('resultados_analises.json').filter(a => a.pacienteId === req.params.id);
  res.json(dados);
});

// GET /analises/:id
app.get('/analises/:id', (req, res) => {
  const analises = lerDados('resultados_analises.json');
  const a = analises.find(a => a.id === req.params.id);
  if (!a) return res.status(404).json({ erro: 'Análise não encontrada.' });
  res.json(a);
});

// POST /analises
app.post('/analises', (req, res) => {
  const analises = lerDados('resultados_analises.json');
  const nova = { id: novoId('AN'), estado: 'Pendente', data: new Date().toISOString().split('T')[0], ...req.body };
  analises.push(nova);
  guardarDados('resultados_analises.json', analises);
  res.status(201).json(nova);
});

// PUT /analises/:id
app.put('/analises/:id', (req, res) => {
  const analises = lerDados('resultados_analises.json');
  const idx = analises.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Análise não encontrada.' });
  analises[idx] = { ...analises[idx], ...req.body, id: req.params.id };
  guardarDados('resultados_analises.json', analises);
  res.json(analises[idx]);
});

// DELETE /analises/:id
app.delete('/analises/:id', (req, res) => {
  const analises = lerDados('resultados_analises.json');
  const novas = analises.filter(a => a.id !== req.params.id);
  if (novas.length === analises.length) return res.status(404).json({ erro: 'Análise não encontrada.' });
  guardarDados('resultados_analises.json', novas);
  res.json({ mensagem: 'Análise eliminada.' });
});

// ── PRESCRIÇÕES ───────────────────────────────────────────────────────────────

// GET /prescricoes
app.get('/prescricoes', (req, res) => {
  let dados = lerDados('prescricoes.json');
  if (req.query.pacienteId) dados = dados.filter(p => p.pacienteId === req.query.pacienteId);
  if (req.query.estado) dados = dados.filter(p => p.estado === req.query.estado);
  res.json(dados);
});

// GET /pacientes/:id/prescricoes
app.get('/pacientes/:id/prescricoes', (req, res) => {
  const dados = lerDados('prescricoes.json').filter(p => p.pacienteId === req.params.id);
  res.json(dados);
});

// GET /prescricoes/:id
app.get('/prescricoes/:id', (req, res) => {
  const prescricoes = lerDados('prescricoes.json');
  const p = prescricoes.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ erro: 'Prescrição não encontrada.' });
  res.json(p);
});

// POST /prescricoes
app.post('/prescricoes', (req, res) => {
  const prescricoes = lerDados('prescricoes.json');
  const nova = { id: novoId('PRE'), tomado: false, estado: 'pendente', data: new Date().toISOString().split('T')[0], ...req.body };
  prescricoes.push(nova);
  guardarDados('prescricoes.json', prescricoes);
  res.status(201).json(nova);
});

// PUT /prescricoes/:id
app.put('/prescricoes/:id', (req, res) => {
  const prescricoes = lerDados('prescricoes.json');
  const idx = prescricoes.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Prescrição não encontrada.' });
  prescricoes[idx] = { ...prescricoes[idx], ...req.body, id: req.params.id };
  guardarDados('prescricoes.json', prescricoes);
  res.json(prescricoes[idx]);
});

// DELETE /prescricoes/:id
app.delete('/prescricoes/:id', (req, res) => {
  const prescricoes = lerDados('prescricoes.json');
  const novas = prescricoes.filter(p => p.id !== req.params.id);
  if (novas.length === prescricoes.length) return res.status(404).json({ erro: 'Prescrição não encontrada.' });
  guardarDados('prescricoes.json', novas);
  res.json({ mensagem: 'Prescrição eliminada.' });
});

// ── NOTAS CLÍNICAS ────────────────────────────────────────────────────────────

// GET /pacientes/:id/notas
app.get('/pacientes/:id/notas', (req, res) => {
  const dados = lerDados('notas_clinicas.json').filter(n => n.pacienteId === req.params.id);
  res.json(dados);
});

// GET /notas/:id
app.get('/notas/:id', (req, res) => {
  const notas = lerDados('notas_clinicas.json');
  const n = notas.find(n => n.id === req.params.id);
  if (!n) return res.status(404).json({ erro: 'Nota não encontrada.' });
  res.json(n);
});

// POST /notas
app.post('/notas', (req, res) => {
  const notas = lerDados('notas_clinicas.json');
  const nova = { id: novoId('NC'), dataHora: new Date().toISOString(), ...req.body };
  notas.push(nova);
  guardarDados('notas_clinicas.json', notas);
  res.status(201).json(nova);
});

// PUT /notas/:id
app.put('/notas/:id', (req, res) => {
  const notas = lerDados('notas_clinicas.json');
  const idx = notas.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Nota não encontrada.' });
  notas[idx] = { ...notas[idx], ...req.body, id: req.params.id };
  guardarDados('notas_clinicas.json', notas);
  res.json(notas[idx]);
});

// DELETE /notas/:id
app.delete('/notas/:id', (req, res) => {
  const notas = lerDados('notas_clinicas.json');
  const novas = notas.filter(n => n.id !== req.params.id);
  if (novas.length === notas.length) return res.status(404).json({ erro: 'Nota não encontrada.' });
  guardarDados('notas_clinicas.json', novas);
  res.json({ mensagem: 'Nota eliminada.' });
});

// ── HISTÓRICO CLÍNICO ─────────────────────────────────────────────────────────

// GET /pacientes/:id/historico
app.get('/pacientes/:id/historico', (req, res) => {
  const dados = lerDados('historico_clinico.json').filter(h => h.pacienteId === req.params.id);
  res.json(dados);
});

// GET /historico/:id
app.get('/historico/:id', (req, res) => {
  const historico = lerDados('historico_clinico.json');
  const h = historico.find(h => h.id === req.params.id);
  if (!h) return res.status(404).json({ erro: 'Entrada não encontrada.' });
  res.json(h);
});

// POST /historico
app.post('/historico', (req, res) => {
  const historico = lerDados('historico_clinico.json');
  const nova = { id: novoId('HC'), data: new Date().toISOString().split('T')[0], ...req.body };
  historico.push(nova);
  guardarDados('historico_clinico.json', historico);
  res.status(201).json(nova);
});

// PUT /historico/:id
app.put('/historico/:id', (req, res) => {
  const historico = lerDados('historico_clinico.json');
  const idx = historico.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Entrada não encontrada.' });
  historico[idx] = { ...historico[idx], ...req.body, id: req.params.id };
  guardarDados('historico_clinico.json', historico);
  res.json(historico[idx]);
});

// DELETE /historico/:id
app.delete('/historico/:id', (req, res) => {
  const historico = lerDados('historico_clinico.json');
  const novos = historico.filter(h => h.id !== req.params.id);
  if (novos.length === historico.length) return res.status(404).json({ erro: 'Entrada não encontrada.' });
  guardarDados('historico_clinico.json', novos);
  res.json({ mensagem: 'Entrada eliminada.' });
});

// ── INVENTÁRIO ────────────────────────────────────────────────────────────────

// GET /inventario
app.get('/inventario', (req, res) => {
  let dados = lerDados('inventario.json');
  if (req.query.estado) dados = dados.filter(i => i.estado === req.query.estado);
  if (req.query.categoria) dados = dados.filter(i => i.categoria === req.query.categoria);
  res.json(dados);
});

// GET /inventario/:id
app.get('/inventario/:id', (req, res) => {
  const inventario = lerDados('inventario.json');
  const item = inventario.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
  res.json(item);
});

// POST /inventario
app.post('/inventario', (req, res) => {
  const inventario = lerDados('inventario.json');
  const novo = { id: novoId('INV'), alertaLote: false, estado: 'Estável', ...req.body };
  inventario.push(novo);
  guardarDados('inventario.json', inventario);
  res.status(201).json(novo);
});

// PUT /inventario/:id
app.put('/inventario/:id', (req, res) => {
  const inventario = lerDados('inventario.json');
  const idx = inventario.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Item não encontrado.' });
  inventario[idx] = { ...inventario[idx], ...req.body, id: req.params.id };
  // Actualiza estado automaticamente se quantidade for baixa
  if (inventario[idx].quantidade < 30) inventario[idx].estado = 'Stock Baixo';
  guardarDados('inventario.json', inventario);
  res.json(inventario[idx]);
});

// DELETE /inventario/:id
app.delete('/inventario/:id', (req, res) => {
  const inventario = lerDados('inventario.json');
  const novos = inventario.filter(i => i.id !== req.params.id);
  if (novos.length === inventario.length) return res.status(404).json({ erro: 'Item não encontrado.' });
  guardarDados('inventario.json', novos);
  res.json({ mensagem: 'Item eliminado.' });
});

// ── CHECKLISTS DE DISPENSA ────────────────────────────────────────────────────

// GET /checklists/:prescricaoId
app.get('/checklists/:prescricaoId', (req, res) => {
  const checklists = lerDados('checklists_dispensa.json');
  const c = checklists.find(c => c.prescricaoId === req.params.prescricaoId);
  if (!c) return res.status(404).json({ erro: 'Checklist não encontrada.' });
  res.json(c);
});

// POST /checklists
app.post('/checklists', (req, res) => {
  const checklists = lerDados('checklists_dispensa.json');
  const nova = {
    id: novoId('CD'),
    dispensado: false,
    dataHora: null,
    itens: [
      { descricao: 'Confirmar identidade do paciente via BI', concluido: false },
      { descricao: 'Validar credenciais do médico prescritor', concluido: false },
      { descricao: 'Verificar lista de alergias activas', concluido: false },
      { descricao: 'Sessão de aconselhamento concluída (nova prescrição)', concluido: false },
    ],
    ...req.body,
  };
  checklists.push(nova);
  guardarDados('checklists_dispensa.json', checklists);
  res.status(201).json(nova);
});

// PUT /checklists/:id
app.put('/checklists/:id', (req, res) => {
  const checklists = lerDados('checklists_dispensa.json');
  const idx = checklists.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Checklist não encontrada.' });
  checklists[idx] = { ...checklists[idx], ...req.body, id: req.params.id };
  guardarDados('checklists_dispensa.json', checklists);
  res.json(checklists[idx]);
});

// PUT /checklists/:id/dispensar
app.put('/checklists/:id/dispensar', (req, res) => {
  const checklists = lerDados('checklists_dispensa.json');
  const idx = checklists.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Checklist não encontrada.' });

  const todosConcluidos = checklists[idx].itens.every(i => i.concluido);
  if (!todosConcluidos) return res.status(400).json({ erro: 'Todos os itens da checklist devem estar concluídos.' });

  checklists[idx].dispensado = true;
  checklists[idx].dataHora = new Date().toISOString();
  guardarDados('checklists_dispensa.json', checklists);
  res.json(checklists[idx]);
});

// ── FACTURAS ──────────────────────────────────────────────────────────────────

// GET /pacientes/:id/facturas
app.get('/pacientes/:id/facturas', (req, res) => {
  const dados = lerDados('facturas.json').filter(f => f.pacienteId === req.params.id);
  res.json(dados);
});

// GET /facturas/:id
app.get('/facturas/:id', (req, res) => {
  const facturas = lerDados('facturas.json');
  const f = facturas.find(f => f.id === req.params.id);
  if (!f) return res.status(404).json({ erro: 'Factura não encontrada.' });
  res.json(f);
});

// POST /facturas
app.post('/facturas', (req, res) => {
  const facturas = lerDados('facturas.json');
  const nova = { id: novoId('FAC'), estado: 'pendente', ...req.body };
  facturas.push(nova);
  guardarDados('facturas.json', facturas);
  res.status(201).json(nova);
});

// PUT /facturas/:id
app.put('/facturas/:id', (req, res) => {
  const facturas = lerDados('facturas.json');
  const idx = facturas.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Factura não encontrada.' });
  facturas[idx] = { ...facturas[idx], ...req.body, id: req.params.id };
  guardarDados('facturas.json', facturas);
  res.json(facturas[idx]);
});

// ── KPIs ──────────────────────────────────────────────────────────────────────

// GET /kpis
app.get('/kpis', (req, res) => {
  let dados = lerDados('kpis.json');
  if (req.query.data) dados = dados.filter(k => k.data === req.query.data);
  res.json(dados);
});

// POST /kpis
app.post('/kpis', (req, res) => {
  const kpis = lerDados('kpis.json');
  const novo = { id: novoId('KPI'), data: new Date().toISOString().split('T')[0], ...req.body };
  kpis.push(novo);
  guardarDados('kpis.json', kpis);
  res.status(201).json(novo);
});

// PUT /kpis/:id
app.put('/kpis/:id', (req, res) => {
  const kpis = lerDados('kpis.json');
  const idx = kpis.findIndex(k => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'KPI não encontrado.' });
  kpis[idx] = { ...kpis[idx], ...req.body, id: req.params.id };
  guardarDados('kpis.json', kpis);
  res.json(kpis[idx]);
});

// ── AUDITORIA ─────────────────────────────────────────────────────────────────

// GET /auditoria
app.get('/auditoria', (req, res) => {
  let dados = lerDados('auditoria.json');
  if (req.query.estado) dados = dados.filter(l => l.estado === req.query.estado);
  res.json(dados.reverse()); // mais recente primeiro
});

// GET /auditoria/:id
app.get('/auditoria/:id', (req, res) => {
  const logs = lerDados('auditoria.json');
  const l = logs.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ erro: 'Registo não encontrado.' });
  res.json(l);
});

// POST /auditoria
app.post('/auditoria', (req, res) => {
  const logs = lerDados('auditoria.json');
  const novo = { id: novoId('LOG'), timestamp: new Date().toISOString(), estado: 'INFO', ...req.body };
  logs.push(novo);
  guardarDados('auditoria.json', logs);
  res.status(201).json(novo);
});

// DELETE /auditoria/:id
app.delete('/auditoria/:id', (req, res) => {
  const logs = lerDados('auditoria.json');
  const novos = logs.filter(l => l.id !== req.params.id);
  if (novos.length === logs.length) return res.status(404).json({ erro: 'Registo não encontrado.' });
  guardarDados('auditoria.json', novos);
  res.json({ mensagem: 'Registo eliminado.' });
});

// ── RELATÓRIOS CALCULADOS ─────────────────────────────────────────────────────

// GET /relatorios/afluencia
app.get('/relatorios/afluencia', (req, res) => {
  const consultas = lerDados('consultas.json');
  const data = req.query.data || new Date().toISOString().split('T')[0];
  const porHora = Array.from({ length: 24 }, (_, h) => {
    const hora = `${String(h).padStart(2, '0')}:00`;
    const count = consultas.filter(c => c.data === data && c.hora && c.hora.startsWith(String(h).padStart(2, '0'))).length;
    return { hora, real: count, estimado: Math.floor(Math.random() * 10 + 5) };
  });
  res.json(porHora);
});

// GET /relatorios/farmacia
app.get('/relatorios/farmacia', (req, res) => {
  const inventario = lerDados('inventario.json');
  const porCategoria = inventario.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = { categoria: item.categoria, consumido: 0, reservado: 0 };
    acc[item.categoria].reservado += item.quantidade;
    acc[item.categoria].consumido += Math.floor(item.quantidade * 0.3);
    return acc;
  }, {});
  res.json(Object.values(porCategoria));
});

// GET /farmacia/estatisticas
app.get('/farmacia/estatisticas', (req, res) => {
  const inventario = lerDados('inventario.json');
  const checklists = lerDados('checklists_dispensa.json');
  const alertasStockBaixo = inventario.filter(i => i.estado === 'Stock Baixo').length;
  const dispensadosHoje = checklists.filter(c => c.dispensado && c.dataHora && c.dataHora.startsWith(new Date().toISOString().split('T')[0])).length;
  res.json({ alertasStockBaixo, dispensadosHoje, tempoMedioDispensa: '09m' });
});

// ── START ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🏥 Hutomi Backend a correr em http://localhost:${PORT}`);
  console.log(`   Dados guardados em: ${DATA_DIR}\n`);
});
