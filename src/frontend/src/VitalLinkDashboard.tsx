import { useState, useEffect, type ReactElement } from "react";
import "./VitalLinkDashboard.css";
import { initTheme, toggleTheme, type Theme } from "./theme";

const API = "http://localhost:3001";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
    id: string;
    nome: string;
    perfil: string;
    pacienteId?: string;
}

interface VitalSigns {
    id: string;
    frequenciaCardiaca: number;
    glicemia: number;
    tensaoSistolica: number;
    tensaoDiastolica: number;
    temperatura: number;
    spo2: number;
    peso: number;
    data: string;
}

interface Consulta {
    id: string;
    medicoNome: string;
    especialidade: string;
    data: string;
    hora: string;
    local: string;
    estado: string;
}

interface Analise {
    id: string;
    nomeExame: string;
    data: string;
    prestador: string;
    estado: "Normal" | "Alto" | "Baixo" | "Pendente";
    relatorio?: string;
}

interface Prescricao {
    id: string;
    medicamento: string;
    dose: string;
    horario: string;
    tomado: boolean;
    estado: string;
    data: string;
}

interface Factura {
    id: string;
    itens: { descricao: string; valor: number }[];
    total: number;
    estado: string;
    dataLimite: string;
}

interface HistoricoItem {
    id: string;
    tipo: string;
    data: string;
    nota: string;
}

type NavSection = "Painel" | "Registos Médicos" | "Consultas" | "Prescrições" | "Análises" | "Facturação";

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
    const icons: Record<string, ReactElement> = {
        heart:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
        droplet:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>,
        activity:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
        weight:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="5" r="3" /><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.46A2 2 0 0 0 17.5 8z" /></svg>,
        calendar:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
        mappin:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
        download:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
        check:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}><polyline points="20 6 9 17 4 12" /></svg>,
        clock:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        bell:         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
        search:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
        grid:         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
        "file-text":  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
        pill:         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" /><circle cx="18" cy="18" r="4" /><path d="m15.5 15.5 5 5" /></svg>,
        flask:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9 3h6l1 9H8L9 3z" /><path d="M6.8 15a5 5 0 1 0 10.4 0" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
        "credit-card":<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
        settings:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
        logout:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
        support:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
        leaf:         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
        sun:          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
        moon:         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    };
    return icons[name] || <span />;
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const estadoBadge = (estado: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        Normal:     { bg: "#dcfce7", color: "#15803d" },
        Alto:       { bg: "#fee2e2", color: "#dc2626" },
        Baixo:      { bg: "#fef9c3", color: "#854d0e" },
        Pendente:   { bg: "#f3f4f6", color: "#6b7280" },
        agendada:   { bg: "#dbeafe", color: "#1d4ed8" },
        "em-curso": { bg: "#fef9c3", color: "#854d0e" },
        "concluída":{ bg: "#dcfce7", color: "#15803d" },
        cancelada:  { bg: "#fee2e2", color: "#dc2626" },
        pendente:   { bg: "#fef9c3", color: "#854d0e" },
        paga:       { bg: "#dcfce7", color: "#15803d" },
        activa:     { bg: "#dbeafe", color: "#1d4ed8" },
    };
    const s = map[estado] || { bg: "#f3f4f6", color: "#6b7280" };
    return (
        <span style={{ background: s.bg, color: s.color, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {estado}
        </span>
    );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{title}</h2>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-4)" }}>{subtitle}</p>}
    </div>
);

const EmptyState = ({ msg }: { msg: string }) => (
    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-5)", fontSize: 14 }}>{msg}</div>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const VitalCard = ({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) => (
    <div className="vital-card">
        <div className="vital-card-header">
            <span className="vital-card-tag">Geral</span>
            <div className="vital-card-icon" style={{ background: color + "18", color }}>
                <Icon name={icon} size={15} />
            </div>
        </div>
        <div>
            <div className="vital-card-label">{label}</div>
            <div className="vital-card-value">{value}</div>
        </div>
        <div className="vital-card-sub">{sub}</div>
    </div>
);

// ─── Views ────────────────────────────────────────────────────────────────────

const PainelView = ({
    vitais, consultas, analises, prescricoes, facturas,
    markTaken, pagarFactura, pagarSucesso,
}: {
    vitais: VitalSigns | null;
    consultas: Consulta[];
    analises: Analise[];
    prescricoes: Prescricao[];
    facturas: Factura[];
    markTaken: (id: string) => void;
    pagarFactura: (id: string) => void;
    pagarSucesso: boolean;
}) => {
    const takenCount = prescricoes.filter(p => p.tomado).length;
    const progress = prescricoes.length > 0 ? Math.round((takenCount / prescricoes.length) * 100) : 0;
    const proximaConsulta = consultas.find(c => c.estado === "agendada") ?? null;
    const facturaPendente = facturas.find(f => f.estado === "pendente") ?? null;

    return (
        <>
            <div className="vitals-row">
                <VitalCard icon="heart"    label="Frequência Cardíaca" value={vitais ? `${vitais.frequenciaCardiaca} BPM` : "—"}                       sub={vitais ? `Medido em ${vitais.data}` : "Sem dados"}          color="#ef4444" />
                <VitalCard icon="droplet"  label="Glicemia"            value={vitais ? `${vitais.glicemia} mg/dL` : "—"}                                sub="Intervalo de referência"                                    color="#3b82f6" />
                <VitalCard icon="activity" label="Tensão Arterial"     value={vitais ? `${vitais.tensaoSistolica}/${vitais.tensaoDiastolica}` : "—"}     sub={vitais ? `SpO2: ${vitais.spo2}%` : "Sem dados"}             color="#10b981" />
                <VitalCard icon="weight"   label="Peso Corporal"       value={vitais ? `${vitais.peso} kg` : "—"}                                        sub={vitais ? `Temp: ${vitais.temperatura}°C` : "Sem dados"}    color="#8b5cf6" />
            </div>

            <div className="dashboard-grid">
                <div className="grid-left-col">
                    <div className="card appointment-card">
                        <div className="appointment-card-header">
                            <div className="appointment-header-title"><Icon name="calendar" size={15} /> Próxima Consulta</div>
                            {proximaConsulta && <span className="appointment-badge">Agendada</span>}
                        </div>
                        {proximaConsulta ? (
                            <>
                                <div className="appointment-body">
                                    <div className="appointment-avatar">{proximaConsulta.medicoNome.split(" ").map(n => n[0]).slice(0, 2).join("")}</div>
                                    <div className="appointment-details">
                                        <div className="appointment-doctor">{proximaConsulta.medicoNome}</div>
                                        <div className="appointment-specialty">{proximaConsulta.especialidade}</div>
                                        <div className="appointment-meta">
                                            <span className="meta-item"><Icon name="calendar" size={13} /> {proximaConsulta.data} • {proximaConsulta.hora}</span>
                                            <span className="meta-item"><Icon name="mappin" size={13} /> {proximaConsulta.local}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <button className="btn btn-primary">Ver Detalhes</button>
                                    <button className="btn btn-secondary">Reagendar</button>
                                </div>
                            </>
                        ) : (
                            <EmptyState msg="Sem consultas agendadas." />
                        )}
                    </div>

                    <div className="card lab-results-card">
                        <div className="lab-results-header">
                            <div>
                                <div className="card-title">Análises Recentes</div>
                                <div className="card-subtitle">Últimos exames de diagnóstico.</div>
                            </div>
                            <button className="btn-download"><Icon name="download" size={13} /> PDF</button>
                        </div>
                        <table className="results-table">
                            <thead>
                                <tr className="table-header-row">
                                    {["Exame", "Data", "Prestador", "Estado"].map(h => (
                                        <th key={h} className="table-header-cell">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {analises.length === 0
                                    ? <tr><td colSpan={4}><EmptyState msg="Sem resultados." /></td></tr>
                                    : analises.slice(0, 4).map(a => (
                                        <tr key={a.id} className="table-body-row">
                                            <td className="table-cell test-name">{a.nomeExame}</td>
                                            <td className="table-cell test-date">{a.data}</td>
                                            <td className="table-cell test-provider">{a.prestador}</td>
                                            <td className="table-cell">{estadoBadge(a.estado)}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid-right-col">
                    <div className="card billing-card">
                        <div className="card-title-with-icon"><Icon name="credit-card" size={16} /> Resumo de Facturação</div>
                        {facturaPendente ? (
                            <>
                                <div className="billing-balance-box">
                                    <div className="balance-label">Saldo em Dívida</div>
                                    <div className="balance-amount">{facturaPendente.total.toLocaleString("pt-MZ")} MT</div>
                                </div>
                                {facturaPendente.itens.map(item => (
                                    <div key={item.descricao} className="billing-item">
                                        <span>{item.descricao}</span><span>{item.valor.toLocaleString("pt-MZ")} MT</span>
                                    </div>
                                ))}
                                <div className="billing-total-row">
                                    <span>Total</span><span className="total-amount">{facturaPendente.total.toLocaleString("pt-MZ")} MT</span>
                                </div>
                                <button onClick={() => pagarFactura(facturaPendente.id)} className="btn btn-primary btn-full-width">
                                    {pagarSucesso ? "✓ Pagamento registado!" : "Pagar Factura Pendente"}
                                </button>
                                <div className="billing-due-date"><Icon name="clock" size={11} /> Prazo: {facturaPendente.dataLimite}</div>
                            </>
                        ) : (
                            <p style={{ color: "#10b981", fontSize: 13, margin: "12px 0" }}>✓ Sem facturas pendentes.</p>
                        )}
                    </div>

                    <div className="card adherence-card">
                        <div className="adherence-header">
                            <div className="card-title-with-icon"><Icon name="pill" size={16} /> Adesão à Prescrição</div>
                            <span className="adherence-progress-text">Hoje: <b className="bold-text">{progress}%</b></span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        {prescricoes.length === 0
                            ? <EmptyState msg="Sem prescrições activas." />
                            : prescricoes.map(p => (
                                <div key={p.id} className="prescription-item">
                                    <div className={`prescription-status-icon ${p.tomado ? "taken" : ""}`}>
                                        {p.tomado ? <Icon name="check" size={14} /> : <Icon name="clock" size={14} />}
                                    </div>
                                    <div className="prescription-info">
                                        <div className="prescription-name">{p.medicamento}</div>
                                        <div className="prescription-details">{p.dose} • {p.horario}</div>
                                    </div>
                                    {p.tomado
                                        ? <span className="prescription-taken-label">Tomado</span>
                                        : <button onClick={() => markTaken(p.id)} className="btn-mark-taken">Marcar Tomado</button>
                                    }
                                </div>
                            ))
                        }
                    </div>

                    <div className="health-tip-card">
                        <div className="health-tip-icon-box"><Icon name="leaf" size={15} /></div>
                        <div>
                            <div className="health-tip-title">Dica de Saúde do Dia</div>
                            <div className="health-tip-content">Mantenha-se hidratado! Beber pelo menos 8 copos de água por dia melhora a função cognitiva.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const RegistosMedicosView = ({ historico }: { historico: HistoricoItem[] }) => (
    <div>
        <SectionHeader title="Registos Médicos" subtitle="Histórico clínico completo e longitudinal." />
        {historico.length === 0
            ? <EmptyState msg="Sem registos médicos." />
            : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {historico.map(h => (
                        <div key={h.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 15 }}>{h.tipo}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>{h.data}</div>
                                </div>
                                <span style={{ background: "var(--border)", color: "var(--text-3)", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>
                                    Registo Clínico
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{h.nota}</p>
                        </div>
                    ))}
                </div>
            )
        }
    </div>
);

const ConsultasView = ({ consultas }: { consultas: Consulta[] }) => (
    <div>
        <SectionHeader title="Consultas" subtitle="Todas as consultas agendadas, em curso e anteriores." />
        {consultas.length === 0
            ? <EmptyState msg="Sem consultas registadas." />
            : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {consultas.map(c => (
                        <div key={c.id} className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontWeight: 700, fontSize: 14,
                            }}>
                                {c.medicoNome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 14 }}>{c.medicoNome}</div>
                                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{c.especialidade}</div>
                                <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12, color: "var(--text-4)" }}>
                                    <span><Icon name="calendar" size={12} /> {c.data} • {c.hora}</span>
                                    <span><Icon name="mappin" size={12} /> {c.local}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                {estadoBadge(c.estado)}
                                {c.estado === "agendada" && (
                                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>Reagendar</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    </div>
);

const PrescricoesView = ({ prescricoes, markTaken }: { prescricoes: Prescricao[]; markTaken: (id: string) => void }) => {
    const activas = prescricoes.filter(p => p.estado === "activa");
    const outras  = prescricoes.filter(p => p.estado !== "activa");
    const taken = prescricoes.filter(p => p.tomado).length;
    const progress = prescricoes.length > 0 ? Math.round((taken / prescricoes.length) * 100) : 0;

    return (
        <div>
            <SectionHeader title="Prescrições" subtitle="Medicação prescrita e adesão ao tratamento." />

            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>Adesão hoje</span>
                    <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700 }}>{progress}%</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>

            {activas.length > 0 && (
                <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-5)", letterSpacing: "0.07em", marginBottom: 10 }}>ACTIVAS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                        {activas.map(p => (
                            <div key={p.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                                <div className={`prescription-status-icon ${p.tomado ? "taken" : ""}`} style={{ flexShrink: 0 }}>
                                    {p.tomado ? <Icon name="check" size={14} /> : <Icon name="clock" size={14} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 14 }}>{p.medicamento}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>{p.dose} · {p.horario} · desde {p.data}</div>
                                </div>
                                {p.tomado
                                    ? <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Tomado</span>
                                    : <button onClick={() => markTaken(p.id)} className="btn-mark-taken">Marcar Tomado</button>
                                }
                            </div>
                        ))}
                    </div>
                </>
            )}

            {outras.length > 0 && (
                <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-5)", letterSpacing: "0.07em", marginBottom: 10 }}>OUTRAS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {outras.map(p => (
                            <div key={p.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, opacity: 0.6 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: "var(--text-2)", fontSize: 14 }}>{p.medicamento}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>{p.dose} · {p.horario}</div>
                                </div>
                                {estadoBadge(p.estado)}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {prescricoes.length === 0 && <EmptyState msg="Sem prescrições registadas." />}
        </div>
    );
};

const AnalisesView = ({ analises }: { analises: Analise[] }) => (
    <div>
        <SectionHeader title="Análises e Exames" subtitle="Resultados completos dos exames de diagnóstico." />
        {analises.length === 0
            ? <EmptyState msg="Sem análises registadas." />
            : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {analises.map(a => (
                        <div key={a.id} className="card" style={{ padding: 18 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 15 }}>{a.nomeExame}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>{a.prestador} · {a.data}</div>
                                </div>
                                {estadoBadge(a.estado)}
                            </div>
                            {a.relatorio && (
                                <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                                    {a.relatorio}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )
        }
    </div>
);

const FacturacaoView = ({
    facturas, pagarFactura, pagarSucesso,
}: {
    facturas: Factura[];
    pagarFactura: (id: string) => void;
    pagarSucesso: boolean;
}) => (
    <div>
        <SectionHeader title="Facturação" subtitle="Histórico de facturas e pagamentos." />
        {facturas.length === 0
            ? <EmptyState msg="Sem facturas registadas." />
            : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {facturas.map(f => (
                        <div key={f.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 15 }}>Factura #{f.id}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>Prazo: {f.dataLimite}</div>
                                </div>
                                {estadoBadge(f.estado)}
                            </div>
                            <div style={{ background: "#0d1117", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                                {f.itens.map(item => (
                                    <div key={item.descricao} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: "var(--text-2)" }}>
                                        <span>{item.descricao}</span>
                                        <span>{item.valor.toLocaleString("pt-MZ")} MT</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 6, fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
                                    <span>Total</span>
                                    <span>{f.total.toLocaleString("pt-MZ")} MT</span>
                                </div>
                            </div>
                            {f.estado === "pendente" && (
                                <button onClick={() => pagarFactura(f.id)} className="btn btn-primary btn-full-width">
                                    {pagarSucesso ? "✓ Pagamento registado!" : "Pagar Factura"}
                                </button>
                            )}
                            {f.estado === "paga" && (
                                <div style={{ textAlign: "center", color: "#22c55e", fontSize: 13, fontWeight: 600 }}>✓ Factura paga</div>
                            )}
                        </div>
                    ))}
                </div>
            )
        }
    </div>
);

// ─── Nav config ───────────────────────────────────────────────────────────────

const navItems: { label: NavSection; icon: string }[] = [
    { label: "Painel",           icon: "grid"        },
    { label: "Registos Médicos", icon: "file-text"   },
    { label: "Consultas",        icon: "calendar"    },
    { label: "Prescrições",      icon: "pill"        },
    { label: "Análises",         icon: "flask"       },
    { label: "Facturação",       icon: "credit-card" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VitalLinkDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [activeNav, setActiveNav]     = useState<NavSection>("Painel");
    const [vitais, setVitais]           = useState<VitalSigns | null>(null);
    const [consultas, setConsultas]     = useState<Consulta[]>([]);
    const [analises, setAnalises]       = useState<Analise[]>([]);
    const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
    const [facturas, setFacturas]       = useState<Factura[]>([]);
    const [historico, setHistorico]     = useState<HistoricoItem[]>([]);
    const [loading, setLoading]         = useState(true);
    const [pagarSucesso, setPagarSucesso] = useState(false);
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => { setTheme(initTheme()); }, []);

    const pid = user.pacienteId;

    useEffect(() => {
        if (!pid) { setLoading(false); return; }
        Promise.all([
            fetch(`${API}/pacientes/${pid}/vitais`).then(r => r.json()),
            fetch(`${API}/consultas?pacienteId=${pid}`).then(r => r.json()),
            fetch(`${API}/pacientes/${pid}/analises`).then(r => r.json()),
            fetch(`${API}/pacientes/${pid}/prescricoes`).then(r => r.json()),
            fetch(`${API}/pacientes/${pid}/facturas`).then(r => r.json()),
            fetch(`${API}/pacientes/${pid}/historico`).then(r => r.json()),
        ]).then(([v, c, a, p, f, h]) => {
            if (Array.isArray(v) && v.length > 0) setVitais(v[v.length - 1]);
            setConsultas(Array.isArray(c) ? c : []);
            setAnalises(Array.isArray(a) ? a : []);
            setPrescricoes(Array.isArray(p) ? p : []);
            setFacturas(Array.isArray(f) ? f : []);
            setHistorico(Array.isArray(h) ? h : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [pid]);

    const markTaken = async (prescricaoId: string) => {
        try {
            await fetch(`${API}/prescricoes/${prescricaoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tomado: true }),
            });
            setPrescricoes(prev => prev.map(p => p.id === prescricaoId ? { ...p, tomado: true } : p));
        } catch { /* ignora */ }
    };

    const pagarFactura = async (facturaId: string) => {
        try {
            await fetch(`${API}/facturas/${facturaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: "paga" }),
            });
            setFacturas(prev => prev.map(f => f.id === facturaId ? { ...f, estado: "paga" } : f));
            setPagarSucesso(true);
            setTimeout(() => setPagarSucesso(false), 3000);
        } catch { /* ignora */ }
    };

    const initials     = user.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    const primeiroNome = user.nome.split(" ")[0];

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontFamily: "sans-serif" }}>
            A carregar dados de saúde...
        </div>
    );

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo-container">
                    <div className="sidebar-logo-icon"><Icon name="activity" size={16} /></div>
                    <span className="sidebar-logo-text">Hutomi</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            onClick={() => setActiveNav(item.label)}
                            className={`sidebar-nav-btn ${activeNav === item.label ? "active" : ""}`}
                        >
                            <Icon name={item.icon} size={16} />
                            {item.label}
                        </button>
                    ))}

                    <div className="sidebar-section-title">Conta</div>
                    {([{ label: "Notificações", icon: "bell" }, { label: "Definições do Perfil", icon: "settings" }] as const).map(item => (
                        <button key={item.label} className="sidebar-nav-btn">
                            <Icon name={item.icon} size={16} />{item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-footer-btn"><Icon name="support" size={16} /> Centro de Apoio</button>
                    <button onClick={onLogout} className="sidebar-footer-btn"><Icon name="logout" size={16} /> Terminar Sessão</button>
                </div>
            </aside>

            <div className="main-content-wrapper">
                <header className="topbar">
                    <div className="search-bar">
                        <Icon name="search" size={15} />
                        <span>Pesquisar registos médicos, médicos ou resultados...</span>
                    </div>
                    <div className="topbar-right">
                        <button
                            type="button"
                            className="theme-toggle-btn"
                            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                            onClick={() => setTheme(toggleTheme())}
                        >
                            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
                        </button>
                        <div className="notification-container">
                            <button className="notification-btn"><Icon name="bell" size={16} /></button>
                            <span className="notification-badge">3</span>
                        </div>
                        <div className="user-profile">
                            <div className="user-info">
                                <div className="user-name">{user.nome}</div>
                                <div className="user-id">ID: #{pid?.replace("PAC-", "") ?? "—"}</div>
                            </div>
                            <div className="user-avatar">{initials}</div>
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <div className="greeting-container">
                        <div>
                            <h1 className="greeting-title">Bom dia, {primeiroNome}!</h1>
                            <p className="greeting-subtitle">{activeNav === "Painel" ? "Resumo do seu estado de saúde." : `Secção: ${activeNav}`}</p>
                        </div>
                        <div className="greeting-date">
                            <Icon name="calendar" size={14} />
                            {new Date().toLocaleDateString("pt-MZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </div>
                    </div>

                    {activeNav === "Painel" && (
                        <PainelView
                            vitais={vitais} consultas={consultas} analises={analises}
                            prescricoes={prescricoes} facturas={facturas}
                            markTaken={markTaken} pagarFactura={pagarFactura} pagarSucesso={pagarSucesso}
                        />
                    )}
                    {activeNav === "Registos Médicos" && <RegistosMedicosView historico={historico} />}
                    {activeNav === "Consultas"         && <ConsultasView consultas={consultas} />}
                    {activeNav === "Prescrições"       && <PrescricoesView prescricoes={prescricoes} markTaken={markTaken} />}
                    {activeNav === "Análises"          && <AnalisesView analises={analises} />}
                    {activeNav === "Facturação"        && <FacturacaoView facturas={facturas} pagarFactura={pagarFactura} pagarSucesso={pagarSucesso} />}
                </main>
            </div>
        </div>
    );
}
