import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import "./ManagerDashboard.css";
import { initTheme, toggleTheme, type Theme } from "./theme";

const API = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: string;
    nome: string;
    perfil: string;
    cargo?: string;
}

type AuditStatus = "CRÍTICO" | "AVISO" | "INFO";
type NavItem = { id: string; label: string; icon: ReactElement };
type KpiBadgeVariant = "success" | "danger";

interface AuditLog {
    id: string;
    timestamp: string;
    evento: string;
    actor: string;
    local: string;
    estado: AuditStatus;
}

interface KPI {
    chegadasPacientes: number;
    ocupacaoCamas: number;
    camasDisponiveis: number;
    alertasStock: number;
    receitaDiaria: number;
}

interface FarmaciaCategoria {
    categoria: string;
    consumido: number;
    reservado: number;
}

interface Paciente {
    id: string;
    nome: string;
    dataNascimento?: string;
    genero?: string;
    prioridade: string;
    tempoEspera: string;
    estado: string;
    alergias: string[];
    historico: string[];
}

interface InventoryItem {
    id: string;
    nome: string;
    sub?: string;
    loteId: string;
    alertaLote: boolean;
    categoria: string;
    quantidade: number;
    estado: string;
}

// ─── Audit badge ──────────────────────────────────────────────────────────────

const auditStatusClass: Record<AuditStatus, string> = {
    CRÍTICO: "critical",
    AVISO:   "warning",
    INFO:    "info",
};

const AuditBadge = ({ status }: { status: AuditStatus }) => (
    <span className={`mgr-audit-badge ${auditStatusClass[status]}`}>{status}</span>
);

// ─── SVG Area Chart ───────────────────────────────────────────────────────────

const InfluxChart = ({ data }: { data: number[] }) => {
    const W = 520, H = 200;
    const padL = 36, padR = 8, padT = 10, padB = 30;
    const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
    const yLabels = [0, 25, 50, 75, 100];

    const xScale = (i: number) => padL + (i / (data.length - 1)) * (W - padL - padR);
    const yScale = (v: number) => padT + (1 - v / 100) * (H - padT - padB);

    const pts  = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
    const area = `${padL},${H - padB} ${pts} ${W - padR},${H - padB}`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="mgr-chart-svg">
            <defs>
                <linearGradient id="influxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b8cff" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6b8cff" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {yLabels.map(y => (
                <g key={y}>
                    <line x1={padL} y1={yScale(y)} x2={W - padR} y2={yScale(y)} stroke="#ffffff0d" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={padL - 6} y={yScale(y) + 4} fill="#4a5568" fontSize="9" textAnchor="end">{y}</text>
                </g>
            ))}
            {labels.map((l, i) => {
                const xi = i === labels.length - 1 ? data.length - 1 : Math.round((i / (labels.length - 1)) * (data.length - 1));
                return <text key={l} x={xScale(xi)} y={H - padB + 14} fill="#4a5568" fontSize="9" textAnchor="middle">{l}</text>;
            })}
            <polygon points={area} fill="url(#influxGrad)" />
            <polyline points={pts} fill="none" stroke="#7c9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {data.length > 11 && <circle cx={xScale(11)} cy={yScale(data[11])} r="4" fill="#7c9eff" />}
        </svg>
    );
};

// ─── Pharmacy horizontal bars ─────────────────────────────────────────────────

const PharmacyBars = ({ data }: { data: FarmaciaCategoria[] }) => (
    <div className="mgr-pharmacy-bars">
        {data.map(d => (
            <div key={d.categoria} className="mgr-pharmacy-row">
                <span className="mgr-pharmacy-label">{d.categoria}</span>
                <div className="mgr-pharmacy-tracks">
                    <div className="mgr-bar-track">
                        <div className="mgr-bar-fill consumed" style={{ width: `${Math.min(d.consumido, 100)}%` }} />
                    </div>
                    <div className="mgr-bar-track">
                        <div className="mgr-bar-fill reserved" style={{ width: `${Math.min(d.reservado, 100)}%` }} />
                    </div>
                </div>
            </div>
        ))}
        <div className="mgr-pharmacy-legend">
            <div className="mgr-legend-item"><div className="mgr-legend-dot consumed" />Consumido</div>
            <div className="mgr-legend-item"><div className="mgr-legend-dot reserved" />Reservado</div>
        </div>
    </div>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

const Svg = ({ d, size = 16, color = "currentColor", extra = "" }: { d: string; size?: number; color?: string; extra?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d + extra} />
    </svg>
);

// ─── Shared section components ────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mgr-page-header" style={{ marginBottom: 24 }}>
        <div>
            <h1 className="mgr-page-title">{title}</h1>
            {subtitle && <p className="mgr-page-subtitle">{subtitle}</p>}
        </div>
    </div>
);

const StatCard = ({ label, value, color = "#7c9eff", sub }: { label: string; value: string | number; color?: string; sub?: string }) => (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-5)", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.03em" }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 6 }}>{sub}</div>}
    </div>
);

const prioridadeColor: Record<string, { bg: string; color: string }> = {
    EMERGÊNCIA: { bg: "#fef2f2", color: "#dc2626" },
    URGENTE:    { bg: "#fff7ed", color: "#c2410c" },
    ROTINA:     { bg: "#f0fdf4", color: "#15803d" },
};

const estadoColor: Record<string, { bg: string; color: string }> = {
    "aguardando":   { bg: "#fef9c3", color: "#854d0e" },
    "em-consulta":  { bg: "#dbeafe", color: "#1d4ed8" },
    "concluído":    { bg: "#dcfce7", color: "#15803d" },
    "internado":    { bg: "#ede9fe", color: "#6d28d9" },
};

const PillBadge = ({ label, map }: { label: string; map: Record<string, { bg: string; color: string }> }) => {
    const s = map[label] ?? { bg: "#f3f4f6", color: "#6b7280" };
    return (
        <span style={{ background: s.bg, color: s.color, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {label}
        </span>
    );
};

// ─── Section Views ────────────────────────────────────────────────────────────

const PatientsView = ({ pacientes }: { pacientes: Paciente[] }) => {
    const [filtro, setFiltro] = useState<string>("TODOS");
    const [pesquisa, setPesquisa] = useState("");

    const prioridades = ["TODOS", "EMERGÊNCIA", "URGENTE", "ROTINA"];
    const filtrados = pacientes
        .filter(p => filtro === "TODOS" || p.prioridade === filtro)
        .filter(p => p.nome.toLowerCase().includes(pesquisa.toLowerCase()) || p.id.toLowerCase().includes(pesquisa.toLowerCase()));

    const emergencia = pacientes.filter(p => p.prioridade === "EMERGÊNCIA").length;
    const urgente    = pacientes.filter(p => p.prioridade === "URGENTE").length;
    const rotina     = pacientes.filter(p => p.prioridade === "ROTINA").length;
    const emConsulta = pacientes.filter(p => p.estado === "em-consulta").length;

    return (
        <div>
            <SectionHeader title="Gestão de Pacientes" subtitle="VISÃO GERAL DA POPULAÇÃO DE PACIENTES" />

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <StatCard label="TOTAL DE PACIENTES" value={pacientes.length} sub="Registados no sistema" />
                <StatCard label="EMERGÊNCIA" value={emergencia} color="#ef4444" sub="Prioridade máxima" />
                <StatCard label="URGENTE" value={urgente} color="#f97316" sub="Atenção elevada" />
                <StatCard label="EM CONSULTA" value={emConsulta} color="#22c55e" sub="Actualmente atendidos" />
                <StatCard label="ROTINA" value={rotina} color="#64748b" sub="Aguardam triagem" />
            </div>

            <div className="mgr-card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                        <Svg d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="currentColor" />
                        <input
                            value={pesquisa}
                            onChange={e => setPesquisa(e.target.value)}
                            placeholder="Pesquisar por nome ou ID..."
                            style={{ background: "none", border: "none", outline: "none", color: "var(--text-2)", fontSize: 13, flex: 1 }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {prioridades.map(p => (
                            <button
                                key={p}
                                onClick={() => setFiltro(p)}
                                style={{
                                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    border: filtro === p ? "1px solid #3b82f6" : "1px solid var(--border)",
                                    background: filtro === p ? "#1d4ed820" : "var(--bg-surface)",
                                    color: filtro === p ? "#3b82f6" : "var(--text-4)",
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mgr-audit-table-head" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr" }}>
                    {["NOME", "ID", "DATA NASC.", "PRIORIDADE", "ESTADO", "ALERGIAS"].map(h => (
                        <span key={h} className="mgr-audit-head-cell">{h}</span>
                    ))}
                </div>

                {filtrados.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-5)", fontSize: 13 }}>Nenhum paciente encontrado.</div>
                ) : filtrados.map(p => (
                    <div key={p.id} className="mgr-audit-row" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr" }}>
                        <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{p.nome}</span>
                        <span style={{ color: "var(--text-3)", fontFamily: "monospace", fontSize: 12 }}>{p.id}</span>
                        <span style={{ color: "var(--text-3)" }}>{p.dataNascimento ?? "—"}</span>
                        <PillBadge label={p.prioridade} map={prioridadeColor} />
                        <PillBadge label={p.estado} map={estadoColor} />
                        <span style={{ color: p.alergias.length > 0 ? "#ef4444" : "var(--text-5)", fontSize: 12 }}>
                            {p.alergias.length > 0 ? p.alergias.join(", ") : "Nenhuma"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ClinicalView = ({ pacientes }: { pacientes: Paciente[] }) => {
    const comAlergias = pacientes.filter(p => p.alergias.length > 0);
    const comHistorico = pacientes.filter(p => p.historico.length > 0);

    return (
        <div>
            <SectionHeader title="Registos Clínicos" subtitle="RESUMO CLÍNICO E ALERTAS POR PACIENTE" />

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <StatCard label="PACIENTES COM ALERGIAS" value={comAlergias.length} color="#ef4444" sub="Requerem atenção na prescrição" />
                <StatCard label="COM HISTÓRICO CLÍNICO" value={comHistorico.length} color="#f97316" sub="Condições pré-existentes" />
                <StatCard label="SEM REGISTO ANTERIOR" value={pacientes.filter(p => p.historico.length === 0).length} color="#64748b" sub="Primeiras visitas" />
            </div>

            <div className="mgr-card" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Svg d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={14} color="#ef4444" />
                    Alertas Clínicos — Alergias Activas
                </div>
                {comAlergias.length === 0 ? (
                    <div style={{ color: "var(--text-5)", fontSize: 13 }}>Sem alertas de alergias.</div>
                ) : comAlergias.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {p.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{p.nome}</div>
                            <div style={{ fontSize: 12, color: "var(--text-3)" }}>ID: {p.id}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {p.alergias.map(a => (
                                <span key={a} style={{ background: "#fef2f2", color: "#dc2626", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                    ⚠ {a}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mgr-card">
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Svg d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={14} color="#8b5cf6" />
                    Condições Pré-existentes por Paciente
                </div>
                {pacientes.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e1b4b", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {p.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{p.nome}</div>
                            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{p.genero ?? "—"}{p.dataNascimento ? ` | DN: ${p.dataNascimento}` : ""}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {p.historico.length === 0
                                ? <span style={{ color: "var(--text-5)", fontSize: 12 }}>Sem histórico</span>
                                : p.historico.map(h => (
                                    <span key={h} style={{ background: "#1e1b4b", color: "#8b5cf6", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                        {h}
                                    </span>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PharmacyView = ({ inventario, farmaciaData }: { inventario: InventoryItem[]; farmaciaData: FarmaciaCategoria[] }) => {
    const stockBaixo  = inventario.filter(i => i.estado === "Stock Baixo");
    const alertasLote = inventario.filter(i => i.alertaLote);
    const estavel     = inventario.filter(i => i.estado === "Estável");

    const stockColor: Record<string, { bg: string; color: string }> = {
        "Estável":    { bg: "#dcfce7", color: "#15803d" },
        "Stock Baixo":{ bg: "#fee2e2", color: "#dc2626" },
        "Verificado": { bg: "#dbeafe", color: "#1d4ed8" },
        "Pendente":   { bg: "#fef9c3", color: "#854d0e" },
    };

    return (
        <div>
            <SectionHeader title="Farmácia e Stock" subtitle="GESTÃO DE INVENTÁRIO E ALERTAS DE STOCK" />

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <StatCard label="TOTAL DE ITENS"    value={inventario.length} sub="No inventário activo" />
                <StatCard label="STOCK BAIXO"       value={stockBaixo.length}  color="#ef4444" sub="Requerem reabastecimento" />
                <StatCard label="ALERTAS DE LOTE"   value={alertasLote.length} color="#f97316" sub="Validade ou lote em risco" />
                <StatCard label="ESTÁVEL"           value={estavel.length}    color="#22c55e" sub="Dentro do nível mínimo" />
            </div>

            {stockBaixo.length > 0 && (
                <div className="mgr-card" style={{ marginBottom: 20, borderColor: "#7f1d1d" }}>
                    <div style={{ fontWeight: 700, color: "#ef4444", fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <Svg d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={14} color="#ef4444" />
                        Alertas Críticos — Stock Baixo
                    </div>
                    {stockBaixo.map(item => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#ef4444", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{item.nome}</div>
                                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{item.categoria} · Lote {item.loteId}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{item.quantidade}</div>
                                <div style={{ fontSize: 11, color: "var(--text-3)" }}>unidades</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mgr-card" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14, marginBottom: 16 }}>Inventário Completo</div>
                <div className="mgr-audit-table-head" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 80px 80px" }}>
                    {["MEDICAMENTO", "CATEGORIA", "LOTE", "QTD.", "ESTADO"].map(h => (
                        <span key={h} className="mgr-audit-head-cell">{h}</span>
                    ))}
                </div>
                {inventario.map(item => {
                    const s = stockColor[item.estado] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                        <div key={item.id} className="mgr-audit-row" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 80px 80px" }}>
                            <span>
                                <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{item.nome}</div>
                                {item.sub && <div style={{ fontSize: 11, color: "var(--text-4)" }}>{item.sub}</div>}
                                {item.alertaLote && <span style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>⚠ ALERTA DE LOTE</span>}
                            </span>
                            <span style={{ color: "var(--text-3)", fontSize: 13 }}>{item.categoria}</span>
                            <span style={{ color: "var(--text-4)", fontFamily: "monospace", fontSize: 11 }}>{item.loteId}</span>
                            <span style={{ fontWeight: 700, color: item.quantidade < 30 ? "#ef4444" : "#e2e8f0" }}>{item.quantidade}</span>
                            <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{item.estado}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mgr-card">
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14, marginBottom: 12 }}>Rotatividade por Categoria</div>
                <div style={{ fontSize: 12, color: "var(--text-4)", marginBottom: 14 }}>Taxa de consumo vs. stock reservado por classe de medicamento</div>
                {farmaciaData.length > 0 ? <PharmacyBars data={farmaciaData} /> : <div style={{ color: "var(--text-5)", fontSize: 13 }}>Sem dados.</div>}
            </div>
        </div>
    );
};

const SecurityView = ({ auditLogs }: { auditLogs: AuditLog[] }) => {
    const [filtro, setFiltro] = useState<"TODOS" | AuditStatus>("TODOS");

    const filtrados = filtro === "TODOS" ? auditLogs : auditLogs.filter(l => l.estado === filtro);
    const criticos  = auditLogs.filter(l => l.estado === "CRÍTICO").length;
    const avisos    = auditLogs.filter(l => l.estado === "AVISO").length;
    const infos     = auditLogs.filter(l => l.estado === "INFO").length;

    const filtroOpcoes: { label: string; value: "TODOS" | AuditStatus; color: string }[] = [
        { label: `TODOS (${auditLogs.length})`,   value: "TODOS",   color: "var(--text-2)" },
        { label: `CRÍTICO (${criticos})`,          value: "CRÍTICO", color: "#ef4444" },
        { label: `AVISO (${avisos})`,              value: "AVISO",   color: "#f97316" },
        { label: `INFO (${infos})`,                value: "INFO",    color: "#3b82f6" },
    ];

    return (
        <div>
            <SectionHeader title="Centro de Segurança" subtitle="AUDITORIA DE ACESSOS E ALERTAS OPERACIONAIS" />

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <StatCard label="CRÍTICOS"  value={criticos} color="#ef4444" sub="Requerem acção imediata" />
                <StatCard label="AVISOS"    value={avisos}   color="#f97316" sub="Monitorização necessária" />
                <StatCard label="INFORMATIVOS" value={infos} color="#3b82f6" sub="Registos de rotina" />
                <StatCard label="TOTAL LOGS" value={auditLogs.length} sub="Últimas 24h" />
            </div>

            <div className="mgr-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={14} color="#3b82f6" />
                        Registo de Auditoria Completo
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {filtroOpcoes.map(o => (
                            <button
                                key={o.value}
                                onClick={() => setFiltro(o.value)}
                                style={{
                                    padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                    border: filtro === o.value ? `1px solid ${o.color}` : "1px solid var(--border)",
                                    background: filtro === o.value ? o.color + "20" : "var(--bg-surface)",
                                    color: filtro === o.value ? o.color : "var(--text-4)",
                                }}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mgr-audit-table-head">
                    {["HORA", "EVENTO", "ACTOR", "LOCAL", "ESTADO", ""].map(h => (
                        <span key={h} className="mgr-audit-head-cell">{h}</span>
                    ))}
                </div>

                {filtrados.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-5)", fontSize: 13 }}>Sem registos para o filtro seleccionado.</div>
                ) : filtrados.map(log => (
                    <div key={log.id} className={`mgr-audit-row${log.estado === "CRÍTICO" ? " critical" : ""}`}>
                        <span className="mgr-audit-timestamp">
                            {new Date(log.timestamp).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        <span className="mgr-audit-event">{log.evento}</span>
                        <span className="mgr-audit-actor">{log.actor}</span>
                        <span className="mgr-audit-location">{log.local}</span>
                        <AuditBadge status={log.estado} />
                        <button type="button" className="mgr-audit-menu-btn">⋮</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Static data ──────────────────────────────────────────────────────────────

const staticInflux = [42, 40, 38, 37, 38, 42, 50, 62, 74, 82, 86, 88, 87, 84, 79, 73, 68, 63, 57, 51, 47, 44, 42, 41];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ManagerDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [activeNav, setActiveNav]         = useState("dashboard");
    const [insightLoading, setInsightLoading] = useState(false);
    const [insightDone, setInsightDone]     = useState(false);
    const [kpi, setKpi]                     = useState<KPI | null>(null);
    const [auditLogs, setAuditLogs]         = useState<AuditLog[]>([]);
    const [farmaciaData, setFarmaciaData]   = useState<FarmaciaCategoria[]>([]);
    const [pacientes, setPacientes]         = useState<Paciente[]>([]);
    const [inventario, setInventario]       = useState<InventoryItem[]>([]);
    const [loading, setLoading]             = useState(true);
    const [theme, setTheme]                 = useState<Theme>("dark");

    useEffect(() => { setTheme(initTheme()); }, []);

    useEffect(() => {
        Promise.all([
            fetch(`${API}/kpis`).then(r => r.json()),
            fetch(`${API}/auditoria`).then(r => r.json()),
            fetch(`${API}/relatorios/farmacia`).then(r => r.json()),
            fetch(`${API}/pacientes`).then(r => r.json()),
            fetch(`${API}/inventario`).then(r => r.json()),
        ]).then(([kpis, audit, farma, pacs, inv]) => {
            if (Array.isArray(kpis) && kpis.length > 0) setKpi(kpis[kpis.length - 1]);
            if (Array.isArray(audit)) setAuditLogs(audit);
            if (Array.isArray(farma)) setFarmaciaData(farma);
            if (Array.isArray(pacs)) setPacientes(pacs);
            if (Array.isArray(inv)) setInventario(inv);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleInsight = () => {
        setInsightLoading(true);
        setTimeout(() => { setInsightLoading(false); setInsightDone(true); }, 1800);
        setTimeout(() => setInsightDone(false), 4000);
    };

    const navItems: NavItem[] = [
        { id: "dashboard", label: "Painel Executivo",    icon: <Svg d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" size={15} /> },
        { id: "patients",  label: "Gestão de Pacientes", icon: <Svg d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={15} /> },
        { id: "clinical",  label: "Registos Clínicos",   icon: <Svg d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={15} /> },
        { id: "pharmacy",  label: "Farmácia e Stock",    icon: <Svg d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" size={15} /> },
        { id: "security",  label: "Centro de Segurança", icon: <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={15} /> },
    ];

    const kpiCards: {
        icon: ReactElement; badge: string; badgeVariant: KpiBadgeVariant;
        label: string; value: string; sub: string;
    }[] = [
        {
            icon: <Svg d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={24} color="#7c9eff" />,
            badge: "+12,4%", badgeVariant: "success",
            label: "CHEGADAS DE PACIENTES",
            value: kpi ? String(kpi.chegadasPacientes) : "—",
            sub: "Entradas nas últimas 24h",
        },
        {
            icon: <Svg d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={24} color="#7c9eff" />,
            badge: "2,1%", badgeVariant: "danger",
            label: "OCUPAÇÃO DE CAMAS",
            value: kpi ? `${kpi.ocupacaoCamas}%` : "—",
            sub: kpi ? `${kpi.camasDisponiveis} camas disponíveis` : "—",
        },
        {
            icon: <Svg d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={24} color="#f87171" />,
            badge: "Crítico", badgeVariant: "danger",
            label: "ALERTAS DE STOCK",
            value: kpi ? String(kpi.alertasStock).padStart(2, "0") : "—",
            sub: "Nível de farmácia baixo",
        },
        {
            icon: <Svg d="M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" size={24} color="#7c9eff" />,
            badge: "+5,8%", badgeVariant: "success",
            label: "RECEITA DIÁRIA",
            value: kpi ? `${(kpi.receitaDiaria / 1000).toFixed(0)}K MT` : "—",
            sub: "Ciclo de facturação optimizado",
        },
    ];

    const insightBtnClass = ["mgr-insight-btn", insightDone && "done"].filter(Boolean).join(" ");
    const userInitials = user.nome.split(" ").map(n => n[0]).slice(0, 2).join("");
    const criticos = auditLogs.filter(l => l.estado === "CRÍTICO").length;

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontFamily: "sans-serif" }}>
            A carregar painel executivo...
        </div>
    );

    return (
        <div className="mgr-dashboard">
            <aside className="mgr-sidebar">
                <div className="mgr-logo">
                    <div className="mgr-logo-icon">
                        <Svg d="M22 12h-4l-3 9L9 3l-3 9H2" size={14} color="#fff" />
                    </div>
                    <span className="mgr-logo-text">HUTOMI</span>
                </div>

                <nav className="mgr-nav">
                    {navItems.map(n => (
                        <button
                            key={n.id}
                            type="button"
                            onClick={() => setActiveNav(n.id)}
                            className={`mgr-nav-btn${activeNav === n.id ? " active" : ""}`}
                        >
                            {n.icon}{n.label}
                        </button>
                    ))}
                </nav>

                <div className="mgr-user-card">
                    <div className="mgr-user-avatar">{userInitials}</div>
                    <div>
                        <div className="mgr-user-name">{user.nome}</div>
                        <div className="mgr-user-role">{user.cargo ?? "Gestor"}</div>
                    </div>
                </div>

                <button type="button" onClick={onLogout} className="mgr-settings-btn">
                    <Svg d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={14} />
                    Terminar Sessão
                </button>
            </aside>

            <div className="mgr-main">
                <header className="mgr-header">
                    <div className="mgr-search">
                        <Svg d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="#4b5563" />
                        <span className="mgr-search-placeholder">Pesquisa global (pacientes, equipa, registos)...</span>
                    </div>

                    <div className="mgr-header-actions">
                        <div className="mgr-status-block">
                            <div className="mgr-status-label">ESTADO DO SISTEMA</div>
                            <div className="mgr-status-value">
                                <span className="mgr-status-dot" />
                                TODOS OS NÓS ONLINE
                            </div>
                        </div>
                        <div className="mgr-notif-wrap">
                            <button type="button" className="mgr-notif-btn">
                                <Svg d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={15} color="currentColor" />
                            </button>
                            <span className="mgr-notif-badge">{criticos}</span>
                        </div>

                        <button
                            type="button"
                            className="mgr-theme-btn"
                            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                            onClick={() => setTheme(toggleTheme())}
                        >
                            {theme === "dark"
                                ? <Svg d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" size={15} color="currentColor" />
                                : <Svg d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" size={15} color="currentColor" />
                            }
                        </button>
                    </div>
                </header>

                <main className="mgr-content">
                    {activeNav === "dashboard" && (
                        <>
                            <div className="mgr-page-header">
                                <div>
                                    <h1 className="mgr-page-title">Visão Executiva</h1>
                                    <p className="mgr-page-subtitle">INTELIGÊNCIA OPERACIONAL EM TEMPO REAL</p>
                                </div>
                                <div className="mgr-page-actions">
                                    <button type="button" className="mgr-btn-secondary">
                                        <Svg d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" size={13} color="currentColor" />
                                        Exportar Relatório
                                    </button>
                                    <button type="button" onClick={handleInsight} className={insightBtnClass}>
                                        {insightLoading ? "A analisar..." : insightDone ? "✓ Insight Pronto" : "Gerar Insight IA"}
                                    </button>
                                </div>
                            </div>

                            <div className="mgr-kpi-grid">
                                {kpiCards.map(k => (
                                    <div key={k.label} className="mgr-kpi-card">
                                        <div className="mgr-kpi-top">
                                            <div className="mgr-kpi-icon-wrap">{k.icon}</div>
                                            <span className={`mgr-kpi-badge ${k.badgeVariant}`}>{k.badge}</span>
                                        </div>
                                        <div className="mgr-kpi-label">{k.label}</div>
                                        <div className="mgr-kpi-value">{k.value}</div>
                                        <div className="mgr-kpi-sub">
                                            <Svg d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={11} color="currentColor" />
                                            {k.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mgr-charts-grid">
                                <div className="mgr-card">
                                    <div className="mgr-card-header">
                                        <div>
                                            <div className="mgr-card-title">Previsão de Afluência de Pacientes</div>
                                            <div className="mgr-card-desc">Chegadas reais vs. estimadas ao SU com base em modelação histórica IA</div>
                                        </div>
                                        <span className="mgr-badge-realtime">TEMPO REAL</span>
                                    </div>
                                    <InfluxChart data={staticInflux} />
                                    <div className="mgr-chart-legend">
                                        <div className="mgr-chart-legend-dot" />
                                        <span className="mgr-chart-legend-label">Chegadas Reais</span>
                                    </div>
                                </div>

                                <div className="mgr-card">
                                    <div className="mgr-card-header-simple">
                                        <div className="mgr-card-title">Rotatividade da Farmácia</div>
                                        <div className="mgr-card-desc">Taxa de consumo por classe de medicamentos</div>
                                    </div>
                                    {farmaciaData.length > 0
                                        ? <PharmacyBars data={farmaciaData} />
                                        : <p style={{ color: "var(--text-4)", fontSize: 13, padding: "12px 0" }}>Sem dados de inventário.</p>
                                    }
                                </div>
                            </div>

                            <div className="mgr-card mgr-audit-card">
                                <div className="mgr-audit-header">
                                    <div>
                                        <div className="mgr-audit-title-row">
                                            <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={15} color="#3b82f6" />
                                            Registo de Auditoria de Segurança e Operações
                                        </div>
                                        <div className="mgr-card-desc">
                                            Registo em tempo real de acessos, conformidade médica e alertas de segurança física
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setActiveNav("security")} className="mgr-audit-archives-btn">
                                        Ver Arquivo Completo
                                    </button>
                                </div>

                                <div className="mgr-audit-table-head">
                                    {["HORA", "EVENTO", "ACTOR", "LOCAL", "ESTADO", ""].map(h => (
                                        <span key={h} className="mgr-audit-head-cell">{h}</span>
                                    ))}
                                </div>

                                {auditLogs.length === 0 ? (
                                    <p style={{ color: "var(--text-4)", fontSize: 13, padding: "12px 0" }}>Sem registos de auditoria.</p>
                                ) : auditLogs.slice(0, 5).map((log) => (
                                    <div key={log.id} className={`mgr-audit-row${log.estado === "CRÍTICO" ? " critical" : ""}`}>
                                        <span className="mgr-audit-timestamp">{new Date(log.timestamp).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                                        <span className="mgr-audit-event">{log.evento}</span>
                                        <span className="mgr-audit-actor">{log.actor}</span>
                                        <span className="mgr-audit-location">{log.local}</span>
                                        <AuditBadge status={log.estado} />
                                        <button type="button" className="mgr-audit-menu-btn">⋮</button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeNav === "patients" && <PatientsView pacientes={pacientes} />}
                    {activeNav === "clinical"  && <ClinicalView pacientes={pacientes} />}
                    {activeNav === "pharmacy"  && <PharmacyView inventario={inventario} farmaciaData={farmaciaData} />}
                    {activeNav === "security"  && <SecurityView auditLogs={auditLogs} />}
                </main>
            </div>
        </div>
    );
}
