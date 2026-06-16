# Hutomi — Especificação do Backend Simples (CRUD com Ficheiros)

> **Hutomi** significa *vida* em Changana.  
> Este documento descreve tudo o que o frontend faz e o que o backend precisa de suportar, sem base de dados — todos os dados ficam em ficheiros JSON em disco.

---

## Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Perfis de Utilizador](#2-perfis-de-utilizador)
3. [Autenticação](#3-autenticação)
4. [Ecrã do Paciente — Portal Hutomi](#4-ecrã-do-paciente--portal-hutomi)
5. [Ecrã do Médico — Painel Clínico](#5-ecrã-do-médico--painel-clínico)
6. [Ecrã do Gestor — Painel Executivo](#6-ecrã-do-gestor--painel-executivo)
7. [Ecrã do Farmacêutico — Gestão de Farmácia](#7-ecrã-do-farmacêutico--gestão-de-farmácia)
8. [Estrutura dos Ficheiros de Dados](#8-estrutura-dos-ficheiros-de-dados)
9. [Resumo dos Endpoints REST](#9-resumo-dos-endpoints-rest)
10. [Mapa de Dependências entre Entidades](#10-mapa-de-dependências-entre-entidades)

---

## 1. Visão Geral do Sistema

O sistema **Hutomi** é um portal hospitalar com **4 perfis de utilizador**, cada um com o seu próprio ecrã:

| Perfil | Ecrã Principal | Função |
|---|---|---|
| Paciente | Portal Hutomi | Ver registos de saúde pessoais |
| Médico | Painel Clínico | Gerir pacientes e consultas |
| Gestor | Painel Executivo | Ver métricas e auditoria |
| Farmacêutico | Painel de Farmácia | Gerir prescrições e inventário |

**Fluxo de navegação:**

```
Selecção de Perfil → Login → Dashboard (específico do perfil) → Logout → Selecção de Perfil
```

**Stack técnica prevista para o backend:**
- Linguagem: à escolha (Node.js/Express, Python/Flask, etc.)
- Armazenamento: ficheiros `.json` em disco
- API: REST simples (JSON)
- Sem base de dados

---

## 2. Perfis de Utilizador

### Entidade: `Utilizador`

Cada utilizador tem um perfil, credenciais e dados de identificação.

**Ficheiro:** `data/utilizadores.json`

```json
[
  {
    "id": "U001",
    "nome": "Jonathan Doe",
    "email": "paciente@hutomi.co.mz",
    "senha": "paciente123",
    "perfil": "paciente",
    "pacienteId": "PAC-88291"
  },
  {
    "id": "U002",
    "nome": "Dr. Alexandre Vance",
    "email": "medico@hutomi.co.mz",
    "senha": "medico123",
    "perfil": "medico",
    "especialidade": "Cardiologia",
    "sala": "402"
  },
  {
    "id": "U003",
    "nome": "Dr. Julião Vane",
    "email": "gestor@hutomi.co.mz",
    "senha": "gestor123",
    "perfil": "gestor",
    "cargo": "Director Médico"
  },
  {
    "id": "U004",
    "nome": "Dra. Sara Jenkins",
    "email": "farmacia@hutomi.co.mz",
    "senha": "farmacia123",
    "perfil": "farmaceutico",
    "cargo": "Farmacêutica Chefe"
  }
]
```

### CRUD — Utilizadores

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar | GET | `/utilizadores` | Lista todos os utilizadores |
| Ver um | GET | `/utilizadores/:id` | Detalhes de um utilizador |
| Criar | POST | `/utilizadores` | Registar novo utilizador |
| Actualizar | PUT | `/utilizadores/:id` | Actualizar dados |
| Eliminar | DELETE | `/utilizadores/:id` | Remover utilizador |

---

## 3. Autenticação

O frontend tem um ecrã de login e um ecrã de registo (modo "Criar Conta").

### O que o ecrã de Login faz:

- Campo de **e-mail**
- Campo de **palavra-passe** (com botão mostrar/ocultar)
- Modo **Entrar** / **Criar Conta** (alterna os campos)
  - No modo "Criar Conta" adiciona: Nome Completo, Confirmar Palavra-passe
- Botão **Preencher dados demo** (auto-preenche credenciais de demonstração)
- Mensagem de **erro** se credenciais inválidas
- Botão **Voltar** (regresso à selecção de perfil)

### Endpoints de Autenticação

| Operação | Método | Rota | Body | Resposta |
|---|---|---|---|---|
| Login | POST | `/auth/login` | `{ email, senha }` | `{ token, utilizador }` |
| Registo | POST | `/auth/registo` | `{ nome, email, senha, perfil }` | `{ utilizador }` |

> **Nota:** Como não há base de dados, o "token" pode ser apenas o `id` do utilizador guardado em memória ou num ficheiro de sessões temporárias.

---

## 4. Ecrã do Paciente — Portal Hutomi

### O que este ecrã mostra e permite fazer:

#### 4.1 Sinais Vitais (só leitura)

Mostra 4 cartões: Frequência Cardíaca, Glicemia, Tensão Arterial, Peso.

**Entidade: `SinaisVitais`**  
**Ficheiro:** `data/sinais_vitais.json`

```json
[
  {
    "id": "SV001",
    "pacienteId": "PAC-88291",
    "frequenciaCardiaca": 72,
    "glicemia": 98,
    "tensaoSistolica": 120,
    "tensaoDiastolica": 80,
    "peso": 182,
    "data": "2023-10-22"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver vitais do paciente | GET | `/pacientes/:id/vitais` | Lista sinais vitais do paciente |
| Registar novos vitais | POST | `/pacientes/:id/vitais` | Médico regista novos sinais |

---

#### 4.2 Próxima Consulta

Mostra um cartão com: médico, data, hora, localização. Botões "Ver Detalhes" e "Reagendar".

**Entidade: `Consulta`**  
**Ficheiro:** `data/consultas.json`

```json
[
  {
    "id": "CON001",
    "pacienteId": "PAC-88291",
    "medicoId": "U002",
    "medicoNome": "Dra. Sara Jenkins",
    "especialidade": "Cardiologia",
    "data": "2023-10-24",
    "hora": "10:30",
    "local": "Edifício B, 4º andar, Sala 402",
    "estado": "agendada"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar consultas do paciente | GET | `/pacientes/:id/consultas` | Todas as consultas |
| Ver detalhes | GET | `/consultas/:id` | Uma consulta específica |
| Criar consulta | POST | `/consultas` | Agendar nova consulta |
| Reagendar | PUT | `/consultas/:id` | Alterar data/hora |
| Cancelar | DELETE | `/consultas/:id` | Cancelar consulta |

---

#### 4.3 Resultados de Análises

Tabela com: Nome do exame, Data, Prestador, Estado (Normal/Alto/Baixo/Pendente). Botão "Ver Relatório" por linha. Botão "Descarregar Tudo em PDF".

**Entidade: `ResultadoAnalise`**  
**Ficheiro:** `data/resultados_analises.json`

```json
[
  {
    "id": "RA001",
    "pacienteId": "PAC-88291",
    "nomeExame": "Hemograma Completo",
    "data": "2023-10-15",
    "prestador": "Lab Central",
    "estado": "Normal",
    "relatorio": "Todos os valores dentro do intervalo normal."
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar análises do paciente | GET | `/pacientes/:id/analises` | Todas as análises |
| Ver relatório | GET | `/analises/:id` | Detalhes de uma análise |
| Criar análise | POST | `/analises` | Registar nova análise |
| Actualizar estado | PUT | `/analises/:id` | Actualizar estado/resultado |
| Eliminar | DELETE | `/analises/:id` | Remover registo |

---

#### 4.4 Facturação

Mostra saldo em dívida, lista de itens (consulta, exames), total e data limite. Botão "Pagar Factura Pendente".

**Entidade: `Factura`**  
**Ficheiro:** `data/facturas.json`

```json
[
  {
    "id": "FAC001",
    "pacienteId": "PAC-88291",
    "itens": [
      { "descricao": "Consulta Geral", "valor": 85.00 },
      { "descricao": "Exames Laboratoriais", "valor": 39.50 }
    ],
    "total": 124.50,
    "estado": "pendente",
    "dataLimite": "2023-10-30"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar facturas do paciente | GET | `/pacientes/:id/facturas` | Todas as facturas |
| Ver factura | GET | `/facturas/:id` | Detalhes de uma factura |
| Criar factura | POST | `/facturas` | Nova factura |
| Pagar/actualizar estado | PUT | `/facturas/:id` | Marcar como paga |

---

#### 4.5 Adesão a Prescrições

Mostra lista de medicamentos com horário. Botão "Marcar como Tomado" por medicamento. Barra de progresso diário.

**Entidade: `Prescricao`**  
**Ficheiro:** `data/prescricoes.json`

```json
[
  {
    "id": "PRE001",
    "pacienteId": "PAC-88291",
    "medicoId": "U002",
    "medicamento": "Lisinopril",
    "dose": "10mg",
    "horario": "Manhã",
    "tomado": false,
    "data": "2023-10-22"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar prescrições do paciente | GET | `/pacientes/:id/prescricoes` | Todas as prescrições |
| Ver prescrição | GET | `/prescricoes/:id` | Detalhes |
| Criar prescrição | POST | `/prescricoes` | Nova prescrição (médico) |
| Marcar como tomado | PUT | `/prescricoes/:id` | Actualizar campo `tomado` |
| Eliminar | DELETE | `/prescricoes/:id` | Remover prescrição |

---

## 5. Ecrã do Médico — Painel Clínico

### O que este ecrã mostra e permite fazer:

#### 5.1 Fila de Pacientes

Lista lateral com pacientes à espera: nome, prioridade (URGENTE/EMERGÊNCIA/ROTINA), ID, tempo de espera. Botão "Adicionar Paciente Walk-in". Secção "Emergências Entrantes".

**Entidade: `Paciente`**  
**Ficheiro:** `data/pacientes.json`

```json
[
  {
    "id": "PX-99201",
    "nome": "Sofia Jacinto",
    "dataNascimento": "1990-03-14",
    "genero": "Feminino",
    "prioridade": "URGENTE",
    "tempoEspera": "14 min",
    "estado": "aguardando",
    "alergias": ["Penicilina"],
    "historico": ["Diabetes Tipo 1"]
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar fila | GET | `/pacientes?estado=aguardando` | Pacientes em espera |
| Ver paciente | GET | `/pacientes/:id` | Ficha completa |
| Criar paciente | POST | `/pacientes` | Adicionar walk-in |
| Actualizar | PUT | `/pacientes/:id` | Actualizar dados/prioridade |
| Remover da fila | DELETE | `/pacientes/:id` | Dar alta / remover |

---

#### 5.2 Notas Clínicas

Área de texto editável com indicador "Guardado automaticamente". Botão "Limpar" e "Anexar ao Registo".

**Entidade: `NotaClinica`**  
**Ficheiro:** `data/notas_clinicas.json`

```json
[
  {
    "id": "NC001",
    "pacienteId": "PX-99201",
    "medicoId": "U002",
    "texto": "Paciente queixa-se de dor torácica...",
    "dataHora": "2024-02-15T10:30:00"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver notas do paciente | GET | `/pacientes/:id/notas` | Todas as notas |
| Criar nota | POST | `/notas` | Guardar nova nota |
| Actualizar nota | PUT | `/notas/:id` | Editar nota existente |
| Eliminar nota | DELETE | `/notas/:id` | Remover nota |

---

#### 5.3 Ordens Digitais (Medicação Activa)

Lista de medicamentos prescritos com dosagem e estado (Activo/Recente). Botão "Adicionar Nova Ordem".

> Esta entidade é a mesma `Prescricao` da secção 4.5, vista do lado do médico.

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver prescrições do paciente | GET | `/pacientes/:id/prescricoes` | Lista de ordens |
| Criar ordem | POST | `/prescricoes` | Adicionar medicamento |
| Actualizar estado | PUT | `/prescricoes/:id` | Mudar estado |

---

#### 5.4 Resultados de Análises (laboratório)

Cartões com: nome do exame, valor, unidade, estado (ELEVADO/NORMAL/BAIXO). Botão "Ver Todos os Resultados". Grelha de pedidos de diagnóstico (CBC, Raio-X, etc.). Botão "Enviar para o Laboratório".

> Esta entidade é a mesma `ResultadoAnalise` da secção 4.3, com campos adicionais de laboratório.

**Campos adicionais em `ResultadoAnalise`:**

```json
{
  "valor": "5.8",
  "unidade": "mmol/L",
  "estadoLab": "ELEVADO",
  "tendencia": [5.2, 5.5, 5.8]
}
```

---

#### 5.5 Histórico Clínico do Paciente

Linha do tempo com: tipo de visita, data, nota resumida.

**Entidade: `HistoricoClinico`**  
**Ficheiro:** `data/historico_clinico.json`

```json
[
  {
    "id": "HC001",
    "pacienteId": "PX-99201",
    "tipo": "Consulta de Rotina",
    "data": "2024-01-15",
    "nota": "Acompanhamento de rotina, estável."
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver histórico | GET | `/pacientes/:id/historico` | Linha do tempo |
| Adicionar entrada | POST | `/historico` | Nova entrada histórica |
| Actualizar | PUT | `/historico/:id` | Editar entrada |
| Eliminar | DELETE | `/historico/:id` | Remover entrada |

---

## 6. Ecrã do Gestor — Painel Executivo

### O que este ecrã mostra e permite fazer:

#### 6.1 KPIs (Indicadores-chave)

4 cartões de métricas: Chegadas de Pacientes, Ocupação de Camas, Alertas de Stock, Receita Diária. Botão "Exportar Relatório". Botão "Gerar Insight IA" (simulado).

**Entidade: `Kpi`**  
**Ficheiro:** `data/kpis.json`

```json
[
  {
    "id": "KPI001",
    "data": "2023-10-22",
    "chegadasPacientes": 412,
    "ocupacaoCamas": 88.2,
    "camasDisponiveis": 42,
    "alertasStock": 4,
    "receitaDiaria": 1240000
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver KPIs do dia | GET | `/kpis?data=2023-10-22` | Indicadores diários |
| Registar KPIs | POST | `/kpis` | Adicionar registo diário |
| Actualizar | PUT | `/kpis/:id` | Corrigir valores |

---

#### 6.2 Gráfico de Afluência de Pacientes

Gráfico de área mostrando chegadas reais vs estimadas por hora do dia.

> Os dados são gerados a partir dos registos de `Consulta` e `Paciente`. Não precisa de entidade separada — o backend calcula a partir dos dados existentes.

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Dados do gráfico | GET | `/relatorios/afluencia?data=2023-10-22` | Agregação por hora |

---

#### 6.3 Gráfico de Rotatividade da Farmácia

Barras horizontais por categoria de medicamento: consumido vs reservado.

> Calculado a partir do `Inventario`. Não precisa de entidade separada.

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Dados do gráfico | GET | `/relatorios/farmacia` | Consumo por categoria |

---

#### 6.4 Registo de Auditoria

Tabela com: timestamp, evento, actor, localização, estado (CRÍTICO/AVISO/INFO). Botão "Ver Arquivos Completos".

**Entidade: `LogAuditoria`**  
**Ficheiro:** `data/auditoria.json`

```json
[
  {
    "id": "LOG001",
    "timestamp": "2023-10-22T08:14:22",
    "evento": "Acesso a Registo Clínico",
    "actor": "Dr. Alexandre Vance",
    "local": "Terminal Clínico 04",
    "estado": "INFO"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar logs | GET | `/auditoria` | Todos os registos |
| Ver detalhe | GET | `/auditoria/:id` | Um registo específico |
| Criar log | POST | `/auditoria` | Registar evento (automático) |
| Eliminar | DELETE | `/auditoria/:id` | Remover registo antigo |

---

## 7. Ecrã do Farmacêutico — Gestão de Farmácia

### O que este ecrã mostra e permite fazer:

#### 7.1 Fila de Prescrições

Lista de 3-5 prescrições activas: nome do paciente, medicamento, hora. Seleccionável para ver detalhes.

> Reutiliza a entidade `Prescricao` com filtro por estado `pendente`.

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar prescrições pendentes | GET | `/prescricoes?estado=pendente` | Fila activa |
| Ver detalhes | GET | `/prescricoes/:id` | Prescrição específica |

---

#### 7.2 Verificação do Paciente e Checklist

Mostra dados do paciente (ID, data de nascimento, alergias conhecidas). Checklist interactiva com 4 itens de conformidade. Botão "Dispensar Medicamento" (activado apenas quando todos os itens estão marcados).

**Entidade: `ChecklistDispensa`**  
**Ficheiro:** `data/checklists_dispensa.json`

```json
[
  {
    "id": "CD001",
    "prescricaoId": "PRE001",
    "farmaceuticoId": "U004",
    "itens": [
      { "descricao": "Confirmar identidade do paciente via BI", "concluido": true },
      { "descricao": "Validar credenciais do médico prescritor", "concluido": true },
      { "descricao": "Verificar lista de alergias activas", "concluido": true },
      { "descricao": "Sessão de aconselhamento concluída (nova prescrição)", "concluido": false }
    ],
    "dispensado": false,
    "dataHora": null
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver checklist | GET | `/checklists/:prescricaoId` | Checklist de uma prescrição |
| Criar checklist | POST | `/checklists` | Iniciar verificação |
| Actualizar item | PUT | `/checklists/:id` | Marcar item como concluído |
| Dispensar | PUT | `/checklists/:id/dispensar` | Confirmar dispensa |

---

#### 7.3 Inventário de Medicamentos

Tabela com: Nome, Lote, Categoria, Quantidade, Estado (Estável/Stock Baixo/Verificado/Pendente). Botões "Filtrar" e "Adicionar Stock". Paginação.

**Entidade: `Inventario`**  
**Ficheiro:** `data/inventario.json`

```json
[
  {
    "id": "INV001",
    "nome": "Atorvastatina 20mg",
    "sub": "Comprimidos",
    "loteId": "LOT-4491-01",
    "alertaLote": false,
    "categoria": "Cardiologia",
    "quantidade": 1240,
    "estado": "Estável"
  },
  {
    "id": "INV002",
    "nome": "Metformina 500mg",
    "sub": "Comprimidos",
    "loteId": "LOT-9902-12",
    "alertaLote": true,
    "categoria": "Endocrinologia",
    "quantidade": 24,
    "estado": "Stock Baixo"
  }
]
```

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Listar inventário | GET | `/inventario` | Todos os medicamentos |
| Filtrar por estado | GET | `/inventario?estado=Stock Baixo` | Filtrar |
| Ver item | GET | `/inventario/:id` | Detalhes de um item |
| Adicionar stock | POST | `/inventario` | Novo medicamento |
| Actualizar quantidade | PUT | `/inventario/:id` | Repor/reduzir stock |
| Eliminar | DELETE | `/inventario/:id` | Remover item |

---

#### 7.4 Estatísticas da Farmácia (só leitura)

3 cartões: Alertas de Stock Baixo (12), Dispensados Hoje (142), Tempo Médio de Dispensa (9 min).

> Calculadas a partir do `Inventario` e `ChecklistDispensa`. Sem entidade separada.

| Operação | Método | Rota | Descrição |
|---|---|---|---|
| Ver estatísticas | GET | `/farmacia/estatisticas` | Resumo do dia |

---

## 8. Estrutura dos Ficheiros de Dados

Todos os ficheiros ficam na pasta `data/` na raiz do backend:

```
backend/
├── server.js (ou app.py, etc.)
├── data/
│   ├── utilizadores.json
│   ├── pacientes.json
│   ├── consultas.json
│   ├── sinais_vitais.json
│   ├── resultados_analises.json
│   ├── prescricoes.json
│   ├── notas_clinicas.json
│   ├── historico_clinico.json
│   ├── inventario.json
│   ├── checklists_dispensa.json
│   ├── facturas.json
│   ├── kpis.json
│   └── auditoria.json
└── routes/
    ├── auth.js
    ├── pacientes.js
    ├── consultas.js
    ├── analises.js
    ├── prescricoes.js
    ├── inventario.js
    ├── auditoria.js
    └── relatorios.js
```

**Padrão de leitura/escrita:**
- Cada operação **lê o ficheiro inteiro** para memória
- Faz a operação (criar/actualizar/eliminar)
- **Escreve o ficheiro inteiro** de volta

---

## 9. Resumo dos Endpoints REST

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/registo` | Registo |

### Utilizadores
| Método | Rota | Descrição |
|---|---|---|
| GET | `/utilizadores` | Listar todos |
| GET | `/utilizadores/:id` | Ver um |
| POST | `/utilizadores` | Criar |
| PUT | `/utilizadores/:id` | Actualizar |
| DELETE | `/utilizadores/:id` | Eliminar |

### Pacientes
| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes` | Listar (com filtros: `?estado=aguardando`) |
| GET | `/pacientes/:id` | Ver ficha completa |
| POST | `/pacientes` | Criar |
| PUT | `/pacientes/:id` | Actualizar |
| DELETE | `/pacientes/:id` | Eliminar |

### Consultas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/consultas` | Listar (filtro: `?pacienteId=`) |
| GET | `/pacientes/:id/consultas` | Consultas de um paciente |
| GET | `/consultas/:id` | Ver detalhes |
| POST | `/consultas` | Criar |
| PUT | `/consultas/:id` | Actualizar/Reagendar |
| DELETE | `/consultas/:id` | Cancelar |

### Sinais Vitais
| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes/:id/vitais` | Ver sinais vitais |
| POST | `/pacientes/:id/vitais` | Registar |
| PUT | `/vitais/:id` | Actualizar |

### Resultados de Análises
| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes/:id/analises` | Análises do paciente |
| GET | `/analises/:id` | Ver relatório |
| POST | `/analises` | Criar |
| PUT | `/analises/:id` | Actualizar |
| DELETE | `/analises/:id` | Eliminar |

### Prescrições
| Método | Rota | Descrição |
|---|---|---|
| GET | `/prescricoes` | Listar (filtro: `?estado=pendente&pacienteId=`) |
| GET | `/pacientes/:id/prescricoes` | Prescrições de um paciente |
| GET | `/prescricoes/:id` | Ver detalhes |
| POST | `/prescricoes` | Criar |
| PUT | `/prescricoes/:id` | Actualizar (estado, tomado) |
| DELETE | `/prescricoes/:id` | Eliminar |

### Notas Clínicas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes/:id/notas` | Notas de um paciente |
| POST | `/notas` | Criar nota |
| PUT | `/notas/:id` | Actualizar |
| DELETE | `/notas/:id` | Eliminar |

### Histórico Clínico
| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes/:id/historico` | Histórico do paciente |
| POST | `/historico` | Adicionar entrada |
| PUT | `/historico/:id` | Actualizar |
| DELETE | `/historico/:id` | Eliminar |

### Inventário
| Método | Rota | Descrição |
|---|---|---|
| GET | `/inventario` | Listar (filtro: `?estado=&categoria=`) |
| GET | `/inventario/:id` | Ver item |
| POST | `/inventario` | Adicionar stock |
| PUT | `/inventario/:id` | Actualizar quantidade/estado |
| DELETE | `/inventario/:id` | Eliminar |

### Checklists de Dispensa
| Método | Rota | Descrição |
|---|---|---|
| GET | `/checklists/:prescricaoId` | Ver checklist |
| POST | `/checklists` | Criar checklist |
| PUT | `/checklists/:id` | Actualizar item |
| PUT | `/checklists/:id/dispensar` | Confirmar dispensa |

### Facturas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes/:id/facturas` | Facturas do paciente |
| GET | `/facturas/:id` | Ver factura |
| POST | `/facturas` | Criar |
| PUT | `/facturas/:id` | Actualizar (pagar) |

### KPIs
| Método | Rota | Descrição |
|---|---|---|
| GET | `/kpis` | Listar (filtro: `?data=`) |
| POST | `/kpis` | Registar |
| PUT | `/kpis/:id` | Actualizar |

### Auditoria
| Método | Rota | Descrição |
|---|---|---|
| GET | `/auditoria` | Listar logs |
| GET | `/auditoria/:id` | Ver detalhe |
| POST | `/auditoria` | Registar evento |
| DELETE | `/auditoria/:id` | Remover |

### Relatórios (calculados)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/relatorios/afluencia` | Chegadas por hora |
| GET | `/relatorios/farmacia` | Consumo por categoria |
| GET | `/farmacia/estatisticas` | Resumo diário da farmácia |

---

## 10. Mapa de Dependências entre Entidades

```
Utilizador
    ├── (perfil: paciente) ──→ Paciente
    │                              ├── SinaisVitais
    │                              ├── Consulta ──────→ (medicoId: Utilizador)
    │                              ├── ResultadoAnalise
    │                              ├── Prescricao ────→ ChecklistDispensa
    │                              ├── NotaClinica ──→ (medicoId: Utilizador)
    │                              ├── HistoricoClinico
    │                              └── Factura
    │
    ├── (perfil: medico) ────→ [cria/edita Paciente, Prescricao, NotaClinica, HistoricoClinico, ResultadoAnalise]
    │
    ├── (perfil: gestor) ────→ [lê KPIs, LogAuditoria, Relatórios calculados]
    │
    └── (perfil: farmaceutico) → [lê/actua sobre Prescricao, Inventario, ChecklistDispensa]

LogAuditoria ←── gerado automaticamente por qualquer acção sensível no sistema
```

---

## Ordem Sugerida de Implementação

Para construir o backend de forma incremental, siga esta ordem:

1. **Utilizadores + Auth** — base de tudo (login funcional)
2. **Pacientes** — entidade central
3. **Consultas** — acção mais frequente
4. **Prescrições** — ligação médico ↔ paciente ↔ farmácia
5. **Inventário** — farmácia
6. **Checklist de Dispensa** — fluxo de farmácia
7. **Sinais Vitais + Análises** — portal do paciente
8. **Notas + Histórico Clínico** — médico
9. **Facturas** — portal do paciente
10. **KPIs + Auditoria + Relatórios** — gestor
