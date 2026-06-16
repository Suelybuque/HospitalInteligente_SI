import { useState, useEffect } from "react";
import type React from "react";
import "./ClinicalDashboard.css";
import { initTheme, toggleTheme, type Theme } from "./theme";

const API = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: string;
    nome: string;
    perfil: string;
    especialidade?: string;
    sala?: string;
}

type Priority = "URGENTE" | "EMERGÊNCIA" | "ROTINA";
type OrderStatus = "Activa" | "Recente";
type LabStatus = "ELEVADO" | "NORMAL" | "BAIXO";

interface Paciente {
    id: string;
    nome: string;
    prioridade: Priority;
    tempoEspera: string;
    alergias: string[];
    historico: string[];
    dataNascimento?: string;
    genero?: string;
}

interface DigitalOrder {
    drug: string;
    detail: string;
    tag: string;
    tagColor: string;
    status: OrderStatus;
}

interface HistoryItem {
    type: string;
    date: string;
    note: string;
}

interface VitalSigns {
    frequenciaCardiaca: number;
    tensaoSistolica: number;
    tensaoDiastolica: number;
    temperatura: number;
    spo2: number;
}

interface AnaliseResult {
    id: string;
    nomeExame: string;
    estado: "Normal" | "Alto" | "Baixo" | "Pendente" | "NORMAL" | "ELEVADO";
    valor: string;
    unidade: string;
    estadoLab?: string;
}

interface RegisterForm {
    nome: string;
    dataNascimento: string;
    genero: string;
    prioridade: Priority;
    alergiaInput: string;
    alergias: string[];
    condicaoInput: string;
    historico: string[];
    fc: string;
    tas: string;
    tad: string;
    temp: string;
    spo2: string;
    email: string;
    senha: string;
}

// ─── Register Modal ───────────────────────────────────────────────────────────

const FORM_VAZIO: RegisterForm = {
    nome: "", dataNascimento: "", genero: "", prioridade: "ROTINA",
    alergiaInput: "", alergias: [], condicaoInput: "", historico: [],
    fc: "", tas: "", tad: "", temp: "", spo2: "",
    email: "", senha: "",
};

function RegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (p: Paciente) => void }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<RegisterForm>(FORM_VAZIO);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [done, setDone] = useState<{ paciente: Paciente; email: string; senha: string } | null>(null);

    const set = (k: keyof RegisterForm, v: string | string[]) =>
        setForm(f => ({ ...f, [k]: v }));

    const addTag = (listKey: "alergias" | "historico", inputKey: "alergiaInput" | "condicaoInput") => {
        const val = (form[inputKey] as string).trim();
        if (!val) return;
        set(listKey, [...form[listKey], val]);
        set(inputKey, "");
    };

    const removeTag = (listKey: "alergias" | "historico", idx: number) =>
        set(listKey, (form[listKey] as string[]).filter((_, i) => i !== idx));

    const submit = async () => {
        if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
            setErro("Nome, email e senha são obrigatórios."); return;
        }
        setLoading(true); setErro("");
        const vitais = (form.fc || form.tas || form.temp || form.spo2)
            ? {
                frequenciaCardiaca: Number(form.fc) || undefined,
                tensaoSistolica: Number(form.tas) || undefined,
                tensaoDiastolica: Number(form.tad) || undefined,
                temperatura: Number(form.temp) || undefined,
                spo2: Number(form.spo2) || undefined,
            } : undefined;
        try {
            const r = await fetch(`${API}/pacientes/registar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: form.nome.trim(),
                    dataNascimento: form.dataNascimento || undefined,
                    genero: form.genero || undefined,
                    prioridade: form.prioridade,
                    alergias: form.alergias,
                    historico: form.historico,
                    email: form.email.trim(),
                    senha: form.senha,
                    vitais,
                }),
            });
            const data = await r.json();
            if (!r.ok) { setErro(data.erro ?? "Erro ao registar."); setLoading(false); return; }
            setDone({ paciente: data.paciente, email: form.email.trim(), senha: form.senha });
            onSuccess(data.paciente);
        } catch {
            setErro("Sem ligação ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    const overlay: React.CSSProperties = {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    };
    const modal: React.CSSProperties = {
        background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16,
        width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
        display: "flex", flexDirection: "column",
    };
    const head: React.CSSProperties = {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 22px", borderBottom: "1px solid var(--border)",
    };
    const body: React.CSSProperties = { padding: "22px 22px 0" };
    const foot: React.CSSProperties = {
        padding: "16px 22px", borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", gap: 10, marginTop: 16,
    };
    const fieldLabel: React.CSSProperties = {
        display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-4)",
        letterSpacing: "0.07em", marginBottom: 5,
    };
    const input: React.CSSProperties = {
        width: "100%", background: "var(--bg-overlay)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "9px 12px", color: "var(--text-1)", fontSize: 13,
        outline: "none",
    };
    const select: React.CSSProperties = { ...input, cursor: "pointer" };
    const tag: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "var(--accent-surface-blue)", color: "var(--accent-text-blue)",
        border: "1px solid var(--accent-border-blue)", borderRadius: 20,
        padding: "2px 10px", fontSize: 12, fontWeight: 600,
    };
    const row: React.CSSProperties = { display: "flex", gap: 12, marginBottom: 14 };
    const col: React.CSSProperties = { flex: 1 };
    const stepPill = (n: number): React.CSSProperties => ({
        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        background: step >= n ? "#3b82f6" : "var(--bg-overlay)",
        color: step >= n ? "#fff" : "var(--text-4)",
        border: step >= n ? "none" : "1px solid var(--border)",
    });
    const stepLine: React.CSSProperties = {
        flex: 1, height: 2, background: step > 1 ? "#3b82f6" : "var(--border)", borderRadius: 1,
    };

    if (done) return (
        <div style={overlay}>
            <div style={{ ...modal, padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
                    Paciente Registado
                </div>
                <div style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24 }}>
                    {done.paciente.nome} foi adicionado à fila de espera.
                </div>
                <div style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 24, textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", letterSpacing: "0.07em", marginBottom: 10 }}>
                        CREDENCIAIS DE ACESSO DO PACIENTE
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                        <div><span style={{ color: "var(--text-4)", minWidth: 60, display: "inline-block" }}>ID:</span> <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{done.paciente.id}</span></div>
                        <div><span style={{ color: "var(--text-4)", minWidth: 60, display: "inline-block" }}>Email:</span> <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{done.email}</span></div>
                        <div><span style={{ color: "var(--text-4)", minWidth: 60, display: "inline-block" }}>Senha:</span> <span style={{ color: "var(--text-1)", fontWeight: 600, fontFamily: "monospace" }}>{done.senha}</span></div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: "#3b82f6", border: "none", borderRadius: 8, padding: "10px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                    Fechar
                </button>
            </div>
        </div>
    );

    return (
        <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={modal}>
                <div style={head}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>Registar Novo Paciente</div>
                        <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 2 }}>Cria ficha clínica e conta de acesso</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", fontSize: 20, lineHeight: 1 }}>✕</button>
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 22px" }}>
                    <div style={stepPill(1)}>1</div>
                    <div style={{ ...stepLine, flex: 1 }} />
                    <div style={stepPill(2)}>2</div>
                    <div style={{ ...stepLine, flex: 1, background: step > 2 ? "#3b82f6" : "var(--border)" }} />
                    <div style={stepPill(3)}>3</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 22px 12px", fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>
                    <span>IDENTIFICAÇÃO</span><span>CLÍNICO</span><span>ACESSO</span>
                </div>

                <div style={body}>
                    {/* ── Step 1: Identificação ── */}
                    {step === 1 && <>
                        <div style={row}>
                            <div style={{ ...col, flex: 2 }}>
                                <label style={fieldLabel}>NOME COMPLETO *</label>
                                <input style={input} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome do paciente" />
                            </div>
                        </div>
                        <div style={row}>
                            <div style={col}>
                                <label style={fieldLabel}>DATA DE NASCIMENTO</label>
                                <input style={input} type="date" value={form.dataNascimento} onChange={e => set("dataNascimento", e.target.value)} />
                            </div>
                            <div style={col}>
                                <label style={fieldLabel}>GÉNERO</label>
                                <select style={select} value={form.genero} onChange={e => set("genero", e.target.value)}>
                                    <option value="">Não especificado</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={fieldLabel}>PRIORIDADE DE TRIAGEM</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                {(["ROTINA", "URGENTE", "EMERGÊNCIA"] as Priority[]).map(p => (
                                    <button key={p} type="button" onClick={() => set("prioridade", p)} style={{
                                        flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                        border: form.prioridade === p ? "1.5px solid #3b82f6" : "1px solid var(--border)",
                                        background: form.prioridade === p ? "#1d4ed820" : "var(--bg-overlay)",
                                        color: form.prioridade === p ? "#3b82f6"
                                            : p === "EMERGÊNCIA" ? "#ef4444"
                                            : p === "URGENTE" ? "#f59e0b"
                                            : "var(--text-4)",
                                    }}>{p}</button>
                                ))}
                            </div>
                        </div>
                    </>}

                    {/* ── Step 2: Clínico ── */}
                    {step === 2 && <>
                        <div style={{ marginBottom: 14 }}>
                            <label style={fieldLabel}>ALERGIAS CONHECIDAS</label>
                            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                <input style={{ ...input, flex: 1 }} value={form.alergiaInput}
                                    onChange={e => set("alergiaInput", e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addTag("alergias", "alergiaInput")}
                                    placeholder="Ex: Penicilina, Sulfa..." />
                                <button type="button" onClick={() => addTag("alergias", "alergiaInput")}
                                    style={{ background: "var(--accent-surface-blue)", border: "1px solid var(--accent-border-blue)", borderRadius: 8, padding: "0 14px", color: "var(--accent-text-blue)", cursor: "pointer", fontWeight: 700, fontSize: 18 }}>+</button>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {form.alergias.map((a, i) => (
                                    <span key={i} style={{ ...tag, background: "rgba(239,68,68,0.08)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}>
                                        {a} <button type="button" onClick={() => removeTag("alergias", i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={fieldLabel}>CONDIÇÕES / HISTÓRICO</label>
                            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                <input style={{ ...input, flex: 1 }} value={form.condicaoInput}
                                    onChange={e => set("condicaoInput", e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addTag("historico", "condicaoInput")}
                                    placeholder="Ex: Diabetes Tipo 2, Hipertensão..." />
                                <button type="button" onClick={() => addTag("historico", "condicaoInput")}
                                    style={{ background: "var(--accent-surface-blue)", border: "1px solid var(--accent-border-blue)", borderRadius: 8, padding: "0 14px", color: "var(--accent-text-blue)", cursor: "pointer", fontWeight: 700, fontSize: 18 }}>+</button>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {form.historico.map((h, i) => (
                                    <span key={i} style={tag}>
                                        {h} <button type="button" onClick={() => removeTag("historico", i)} style={{ background: "none", border: "none", color: "var(--accent-text-blue)", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                            <label style={{ ...fieldLabel, marginBottom: 10 }}>SINAIS VITAIS INICIAIS <span style={{ fontWeight: 400, color: "var(--text-5)" }}>(opcional)</span></label>
                            <div style={row}>
                                <div style={col}><label style={fieldLabel}>FC (bpm)</label><input style={input} type="number" value={form.fc} onChange={e => set("fc", e.target.value)} placeholder="—" /></div>
                                <div style={col}><label style={fieldLabel}>TAS (mmHg)</label><input style={input} type="number" value={form.tas} onChange={e => set("tas", e.target.value)} placeholder="—" /></div>
                                <div style={col}><label style={fieldLabel}>TAD (mmHg)</label><input style={input} type="number" value={form.tad} onChange={e => set("tad", e.target.value)} placeholder="—" /></div>
                            </div>
                            <div style={row}>
                                <div style={col}><label style={fieldLabel}>TEMP (°C)</label><input style={input} type="number" step="0.1" value={form.temp} onChange={e => set("temp", e.target.value)} placeholder="—" /></div>
                                <div style={col}><label style={fieldLabel}>SpO2 (%)</label><input style={input} type="number" value={form.spo2} onChange={e => set("spo2", e.target.value)} placeholder="—" /></div>
                                <div style={col} />
                            </div>
                        </div>
                    </>}

                    {/* ── Step 3: Acesso ── */}
                    {step === 3 && <>
                        <div style={{ background: "var(--accent-surface-amber)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "var(--accent-text-amber)" }}>
                            As credenciais criadas aqui serão entregues ao paciente para acesso ao portal VitalLink.
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={fieldLabel}>EMAIL DO PACIENTE *</label>
                            <input style={input} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="paciente@email.com" />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={fieldLabel}>SENHA TEMPORÁRIA *</label>
                            <input style={input} type="text" value={form.senha} onChange={e => set("senha", e.target.value)} placeholder="Mín. 6 caracteres" />
                        </div>
                        {erro && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{erro}</div>}
                    </>}
                </div>

                <div style={foot}>
                    <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 20px", color: "var(--text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        {step > 1 ? "← Anterior" : "Cancelar"}
                    </button>
                    {step < 3
                        ? <button type="button"
                            disabled={step === 1 && !form.nome.trim()}
                            onClick={() => setStep(s => s + 1)}
                            style={{ background: step === 1 && !form.nome.trim() ? "var(--bg-overlay)" : "#3b82f6", border: "none", borderRadius: 8, padding: "9px 24px", color: step === 1 && !form.nome.trim() ? "var(--text-4)" : "#fff", fontSize: 13, fontWeight: 700, cursor: step === 1 && !form.nome.trim() ? "not-allowed" : "pointer" }}>
                            Seguinte →
                        </button>
                        : <button type="button" onClick={submit} disabled={loading}
                            style={{ background: loading ? "var(--bg-overlay)" : "#3b82f6", border: "none", borderRadius: 8, padding: "9px 24px", color: loading ? "var(--text-4)" : "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                            {loading ? "A registar..." : "Registar Paciente"}
                        </button>
                    }
                </div>
            </div>
        </div>
    );
}

// ─── Static supporting data ───────────────────────────────────────────────────

const staticOrders: DigitalOrder[] = [
    { drug: "Insulina Aspart (Novolog)", detail: "5 Unidades antes das refeições", tag: "Contínuo",  tagColor: "#10b981", status: "Activa" },
    { drug: "Lisinopril 10mg",          detail: "1 Comprimido PO Diário",          tag: "Crónico",   tagColor: "#6366f1", status: "Activa" },
    { drug: "Albuterol HFA",            detail: "2 Inalações PRN para Tosse",      tag: "PRN",       tagColor: "#f59e0b", status: "Recente" },
];

const diagnostics = ["HEMOGRAMA", "RX TÓRAX", "PAINEL METAB.", "URINÁLISE", "RMN CÉREBRO", "ECG"];

const priorityClass: Record<Priority, string> = {
    URGENTE:    "urgent",
    EMERGÊNCIA: "emergency",
    ROTINA:     "routine",
};

const labStatusClass = (status: LabStatus) => (status === "NORMAL" ? "normal" : "elevated");

// ─── Icons ────────────────────────────────────────────────────────────────────

const Ic = ({ d, size = 14, color = "currentColor", fill = "none" }: { d: string; size?: number; color?: string; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

// ─── Badge ────────────────────────────────────────────────────────────────────

const PriorityBadge = ({ p }: { p: Priority }) => (
    <span className={`clin-priority-badge ${priorityClass[p]}`}>{p}</span>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ClinicalDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [queue, setQueue] = useState<Paciente[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");
    const [noteSaved, setNoteSaved] = useState(false);
    const [noteSaving, setNoteSaving] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [orders, setOrders] = useState<DigitalOrder[]>(staticOrders);
    const [vitais, setVitais] = useState<VitalSigns | null>(null);
    const [analises, setAnalises] = useState<AnaliseResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<Theme>("dark");
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => { setTheme(initTheme()); }, []);

    useEffect(() => {
        fetch(`${API}/pacientes?estado=aguardando`)
            .then(r => r.json())
            .then((data: Paciente[]) => {
                setQueue(data);
                if (data.length > 0) setSelectedId(data[0].id);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setNoteText("");
        setHistory([]);
        setVitais(null);
        setAnalises([]);
        Promise.all([
            fetch(`${API}/pacientes/${selectedId}/notas`).then(r => r.json()),
            fetch(`${API}/pacientes/${selectedId}/historico`).then(r => r.json()),
            fetch(`${API}/pacientes/${selectedId}/vitais`).then(r => r.json()),
            fetch(`${API}/pacientes/${selectedId}/analises`).then(r => r.json()),
        ]).then(([notas, hist, vits, ans]) => {
            if (Array.isArray(notas) && notas.length > 0) {
                setNoteText(notas[notas.length - 1].texto);
            }
            if (Array.isArray(hist)) {
                setHistory(hist.map((h: { tipo?: string; data: string; nota: string }) => ({
                    type: h.tipo || "Registo",
                    date: h.data,
                    note: h.nota,
                })));
            }
            if (Array.isArray(vits) && vits.length > 0) {
                setVitais(vits[vits.length - 1]);
            }
            if (Array.isArray(ans)) {
                setAnalises(ans);
            }
        }).catch(() => {});
    }, [selectedId]);

    const saveNote = async () => {
        if (!selectedId || !noteText.trim()) return;
        setNoteSaving(true);
        try {
            await fetch(`${API}/notas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pacienteId: selectedId, medicoId: user.id, texto: noteText }),
            });
            setNoteSaved(true);
            setTimeout(() => setNoteSaved(false), 3000);
        } catch {
            /* ignora erro de rede */
        } finally {
            setNoteSaving(false);
        }
    };

    const addOrder = () => {
        setOrders(prev => [{
            drug: "Nova Prescrição",
            detail: "Detalhes pendentes",
            tag: "Novo",
            tagColor: "#3b82f6",
            status: "Activa",
        }, ...prev]);
    };

    const selected = queue.find(p => p.id === selectedId) ?? null;

    const vitals = [
        {
            label: "TENSÃO ARTERIAL",
            value: vitais ? `${vitais.tensaoSistolica}/${vitais.tensaoDiastolica}` : "—",
            unit: "mmHg", sub: "", variant: "bp" as const,
        },
        {
            label: "FREQ. CARDÍACA",
            value: vitais ? String(vitais.frequenciaCardiaca) : "—",
            unit: "bpm", sub: "", variant: "hr" as const,
        },
        {
            label: "TEMPERATURA",
            value: vitais ? String(vitais.temperatura) : "—",
            unit: "°C", sub: "", variant: "temp" as const,
        },
        {
            label: "SPO2",
            value: vitais ? String(vitais.spo2) : "—",
            unit: "%", sub: "", variant: "spo2" as const,
        },
    ];

    const userInitials = user.nome.split(" ").map(n => n[0]).slice(0, 2).join("");

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontFamily: "sans-serif" }}>
            A carregar fila de pacientes...
        </div>
    );

    return (
        <div className="clin-dashboard">
            {showRegister && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onSuccess={novo => {
                        setQueue(q => [...q, novo]);
                        setShowRegister(false);
                    }}
                />
            )}
            <header className="clin-header">
                <div className="clin-logo">
                    <div className="clin-logo-icon">
                        <Ic d="M22 12h-4l-3 9L9 3l-3 9H2" color="#fff" size={13} />
                    </div>
                    <span className="clin-logo-text">Hutomi Clínica</span>
                </div>

                <div className="clin-search">
                    <Ic d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} />
                    <span className="clin-search-placeholder">Pesquisar pacientes, registos ou ordens...</span>
                </div>

                <div className="clin-header-actions">
                    <button type="button" className="clin-alert-btn">
                        <span className="clin-alert-icon">⚠</span> {queue.filter(p => p.prioridade === "EMERGÊNCIA").length} ALERTA(S) CRÍTICO(S)
                    </button>

                    <div className="clin-user-block">
                        <div className="clin-user-info">
                            <div className="clin-user-name">{user.nome}</div>
                            <div className="clin-user-role">{user.especialidade?.toUpperCase() ?? "CLÍNICO"}{user.sala ? ` • SALA ${user.sala}` : ""}</div>
                        </div>
                        <div className="clin-avatar-wrap">
                            <div className="clin-avatar">{userInitials}</div>
                            <div className="clin-avatar-status" />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="clin-theme-btn"
                        title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                        onClick={() => setTheme(toggleTheme())}
                    >
                        {theme === "dark"
                            ? <Ic d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" size={15} />
                            : <Ic d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" size={15} />
                        }
                    </button>

                    <button type="button" onClick={onLogout} className="clin-bell-btn" title="Terminar Sessão">
                        <Ic d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={14} />
                    </button>
                </div>
            </header>

            <div className="clin-body">
                <aside className="clin-queue">
                    <div className="clin-queue-header">
                        <div className="clin-queue-title">
                            <Ic d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={14} color="#3b82f6" />
                            Fila de Pacientes
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="clin-queue-count">{queue.length} em Espera</span>
                            <button
                                type="button"
                                onClick={() => setShowRegister(true)}
                                title="Registar novo paciente"
                                style={{
                                    width: 26, height: 26, borderRadius: 7,
                                    background: "#3b82f6", border: "none",
                                    color: "#fff", fontSize: 18, lineHeight: 1,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", flexShrink: 0,
                                }}
                            >+</button>
                        </div>
                    </div>

                    <div className="clin-queue-list">
                        {queue.length === 0 ? (
                            <p style={{ color: "var(--text-4)", fontSize: 13, padding: "12px 0" }}>Sem pacientes em espera.</p>
                        ) : queue.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedId(p.id)}
                                className={`clin-patient-btn${selectedId === p.id ? " active" : ""}`}
                            >
                                <div className="clin-patient-btn-top">
                                    <span className="clin-patient-name">{p.nome}</span>
                                    <PriorityBadge p={p.prioridade} />
                                </div>
                                <div className="clin-patient-btn-bottom">
                                    <span className="clin-patient-meta">ID: {p.id}</span>
                                    <span className="clin-patient-wait">
                                        <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={10} /> {p.tempoEspera}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="clin-emergency-section">
                        <div className="clin-emergency-label">EMERGÊNCIAS ENTRANTES</div>
                        <div className="clin-emergency-card">
                            <span className="clin-emergency-icon">⊙</span>
                            <div className="clin-emergency-info">
                                <div className="clin-emergency-title">AVA — Trauma Torácico</div>
                                <div className="clin-emergency-sub">Ambulatório B</div>
                            </div>
                            <span className="clin-emergency-time">00:02</span>
                        </div>
                    </div>

                    <button type="button" className="clin-walkin-btn">+ Adicionar Paciente Walk-in</button>
                </aside>

                <main className="clin-main">
                    {selected ? (
                        <>
                            <div className="clin-card">
                                <div className="clin-patient-header">
                                    <div className="clin-patient-header-left">
                                        <div className="clin-patient-avatar-lg">
                                            {selected.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                        </div>
                                        <div>
                                            <h2 className="clin-patient-title">{selected.nome}</h2>
                                            <div className="clin-patient-demographics">
                                                {selected.genero ?? "—"}{selected.dataNascimento ? ` | DN: ${selected.dataNascimento}` : ""} &nbsp;|&nbsp; ID: {selected.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="clin-patient-actions">
                                        <button type="button" className="clin-btn-secondary">
                                            <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={13} />
                                            Encontros Anteriores
                                        </button>
                                        <button type="button" className="clin-btn-primary">✓ Finalizar Visita</button>
                                    </div>
                                </div>
                                {selected.alergias.length > 0 || selected.historico.length > 0 ? (
                                    <div className="clin-tags">
                                        {selected.alergias.map(a => <span key={a} className="clin-tag">Alergia: {a}</span>)}
                                        {selected.historico.map(h => <span key={h} className="clin-tag">Historial: {h}</span>)}
                                    </div>
                                ) : null}
                            </div>

                            <div className="clin-vitals-grid">
                                {vitals.map(v => (
                                    <div key={v.label} className="clin-vital-card">
                                        <div className="clin-vital-label">{v.label}</div>
                                        <div className="clin-vital-row">
                                            <span className={`clin-vital-value ${v.variant}`}>{v.value}</span>
                                            <span className="clin-vital-unit">{v.unit}</span>
                                        </div>
                                        {v.sub && <div className="clin-vital-sub">{v.sub}</div>}
                                    </div>
                                ))}
                            </div>

                            <div className="clin-two-col">
                                <div className="clin-panel">
                                    <div className="clin-panel-header">
                                        <div className="clin-panel-title">
                                            <Ic d="M9 12h6M9 16h6M17 3H7a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V5a2 2 0 0 0-2-2z" size={14} color="#3b82f6" />
                                            Notas Clínicas
                                        </div>
                                        <button type="button" className="clin-link-btn">Usar Modelo</button>
                                    </div>
                                    <textarea
                                        className="clin-notes-textarea"
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="Escreva as suas notas clínicas aqui..."
                                    />
                                    <div className="clin-notes-footer">
                                        <span className="clin-autosave">
                                            {noteSaved ? "✓ GUARDADO" : "NOTAS CLÍNICAS"}
                                        </span>
                                        <div className="clin-notes-actions">
                                            <button type="button" onClick={() => setNoteText("")} className="clin-btn-ghost">Limpar</button>
                                            <button type="button" onClick={saveNote} disabled={noteSaving} className="clin-btn-save">
                                                {noteSaving ? "A guardar..." : "Adicionar ao Registo"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="clin-panel">
                                    <div className="clin-panel-header">
                                        <div className="clin-panel-title">
                                            <Ic d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" size={14} color="#10b981" />
                                            Ordens Digitais Activas
                                        </div>
                                        <button type="button" onClick={addOrder} className="clin-new-order-btn">+ Nova Ordem</button>
                                    </div>
                                    <div className="clin-orders-list">
                                        {orders.map((o, i) => (
                                            <div key={i} className="clin-order-item">
                                                <div>
                                                    <div className="clin-order-drug">{o.drug}</div>
                                                    <div className="clin-order-detail">
                                                        {o.detail} •{" "}
                                                        <span className="clin-order-tag" style={{ color: o.tagColor }}>{o.tag}</span>
                                                    </div>
                                                </div>
                                                <span className={`clin-order-status ${o.status === "Activa" ? "active" : "recent"}`}>
                                                    {o.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="clin-triage-section">
                                        <div className="clin-triage-title">
                                            <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01" size={13} color="#f59e0b" />
                                            Notas de Triagem e Riscos
                                        </div>
                                        <div className="clin-triage-box">
                                            {selected.alergias.length > 0 && (
                                                <p className="clin-triage-text">⚠ Alergias conhecidas: {selected.alergias.join(", ")}.</p>
                                            )}
                                            {selected.historico.length > 0 && (
                                                <p className="clin-triage-text">Historial: {selected.historico.join(", ")}.</p>
                                            )}
                                            {selected.alergias.length === 0 && selected.historico.length === 0 && (
                                                <p className="clin-triage-text">Sem notas de triagem registadas.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="clin-card clin-history-card">
                                <div className="clin-history-title">
                                    <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={14} color="#8b5cf6" />
                                    Histórico Longitudinal
                                </div>
                                <div className="clin-timeline">
                                    <div className="clin-timeline-line" />
                                    {history.length === 0 ? (
                                        <p style={{ color: "var(--text-4)", fontSize: 13 }}>Sem histórico registado.</p>
                                    ) : history.map((h, i) => (
                                        <div key={i} className="clin-timeline-item">
                                            <div className="clin-timeline-dot" />
                                            <div className="clin-timeline-type">
                                                {h.type} <span className="clin-timeline-date">{h.date}</span>
                                            </div>
                                            <div className="clin-timeline-note">{h.note}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ color: "var(--text-4)", padding: 24, fontSize: 14 }}>
                            Seleccione um paciente na fila para ver os detalhes.
                        </div>
                    )}
                </main>

                <aside className="clin-sidebar">
                    <div>
                        <div className="clin-sidebar-header">
                            <div className="clin-sidebar-title">
                                <Ic d="M10 2v7.31M14 2v7.31M3.5 9.5h17M6.5 13.5h11M4 21l.5-4.5h15L20 21M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" size={13} color="#06b6d4" />
                                Dados Laboratoriais Recentes
                            </div>
                            <button type="button" className="clin-expand-btn">↗</button>
                        </div>
                        <div className="clin-lab-list">
                            {analises.length === 0 ? (
                                <p style={{ color: "var(--text-4)", fontSize: 12, padding: "8px 0" }}>
                                    {selected ? "Sem análises registadas." : "Seleccione um paciente."}
                                </p>
                            ) : analises.map(a => {
                                const rawStatus = (a.estadoLab ?? a.estado ?? "").toUpperCase();
                                const isNormal = rawStatus === "NORMAL";
                                const statusCls = isNormal ? "normal" : "elevated";
                                const labelStatus: LabStatus = isNormal ? "NORMAL" : rawStatus === "BAIXO" ? "BAIXO" : "ELEVADO";
                                return (
                                    <div key={a.id} className="clin-lab-card">
                                        <div className="clin-lab-top">
                                            <span className="clin-lab-name">{a.nomeExame}</span>
                                            <span className={`clin-lab-value ${statusCls}`}>
                                                {a.valor !== "Normal" && a.valor !== "Elevado" ? a.valor : "—"}
                                                <span className="clin-lab-unit">{a.unidade}</span>
                                            </span>
                                        </div>
                                        <div className={`clin-lab-status ${statusCls}`}>{labelStatus}</div>
                                    </div>
                                );
                            })}
                        </div>
                        {analises.length > 0 && (
                            <button type="button" className="clin-view-all-btn">Ver Todos os Resultados →</button>
                        )}
                    </div>

                    <div>
                        <div className="clin-sidebar-title clin-diagnostics-title">
                            <Ic d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 1-2-2V9m0 0h18" size={13} color="#8b5cf6" />
                            Pedidos de Diagnóstico
                        </div>
                        <div className="clin-diagnostics-grid">
                            {diagnostics.map(d => (
                                <button key={d} type="button" className="clin-diagnostic-btn">
                                    <Ic d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18" size={16} color="#3b82f6" />
                                    {d}
                                </button>
                            ))}
                        </div>
                        <button type="button" className="clin-send-lab-btn">2 PEDIDOS PENDENTES — Enviar para Lab</button>
                    </div>

                    <div className="clin-referral-card">
                        <div className="clin-referral-icon-wrap">
                            <Ic d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={20} />
                        </div>
                        <div className="clin-referral-title">Referenciação a Especialista</div>
                        <div className="clin-referral-desc">
                            {selected ? `Referencie ${selected.nome.split(" ")[0]} para Cardiologia, Nefrologia ou outra especialidade.` : "Seleccione um paciente para referenciar."}
                        </div>
                        <button type="button" className="clin-referral-btn">Criar Referenciação</button>
                    </div>
                </aside>
            </div>

            <button type="button" className="clin-fab">⚠</button>
        </div>
    );
}
