import { useState, type JSX } from "react";
import VitalLinkDashboard from "./VitalLinkDashboard";
import ClinicalDashboard from "./ClinicalDashboard";
import ManagerDashboard from "./ManagerDashboard";
import PharmacyDashboard from "./PharmacyDashboard";

const API = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "patient" | "manager" | "doctor" | "pharmacist";
type Screen = "role-select" | "login" | "dashboard";

export interface Utilizador {
    id: string;
    nome: string;
    email: string;
    perfil: Role;
    pacienteId?: string;
    especialidade?: string;
    sala?: string;
    cargo?: string;
}

interface RoleConfig {
    id: Role;
    label: string;
    sub: string;
    icon: JSX.Element;
    gradient: string;
    accent: string;
    demo: { email: string; password: string };
}

// ─── Role definitions ─────────────────────────────────────────────────────────

const roles: RoleConfig[] = [
    {
        id: "patient",
        label: "Paciente",
        sub: "Acesse os seus registos de saúde e consultas",
        gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
        accent: "#0ea5e9",
        demo: { email: "paciente@hutomi.co.mz", password: "paciente123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        id: "manager",
        label: "Gestor",
        sub: "Visão executiva e inteligência operacional",
        gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        accent: "#6366f1",
        demo: { email: "gestor@hutomi.co.mz", password: "gestor123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M7 8h2M7 12h10M13 8h4" />
            </svg>
        ),
    },
    {
        id: "doctor",
        label: "Médico",
        sub: "Registos de pacientes, EMR e ferramentas clínicas",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        accent: "#10b981",
        demo: { email: "medico@hutomi.co.mz", password: "medico123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    },
    {
        id: "pharmacist",
        label: "Farmacêutico",
        sub: "Gestão de prescrições e inventário de medicamentos",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        accent: "#f59e0b",
        demo: { email: "farmacia@hutomi.co.mz", password: "farmacia123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        ),
    },
];

// ─── Background decoration ────────────────────────────────────────────────────

const BgDecor = ({ accent }: { accent: string }) => (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{
            position: "absolute", top: "-20%", right: "-10%",
            width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        }} />
        <div style={{
            position: "absolute", bottom: "-15%", left: "-5%",
            width: 400, height: 400, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`,
        }} />
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    </div>
);

// ─── Ecrã de Selecção de Perfil ───────────────────────────────────────────────

const RoleSelectScreen = ({ onSelect }: { onSelect: (r: Role) => void }) => {
    const [hovered, setHovered] = useState<Role | null>(null);
    return (
        <div style={{
            minHeight: "100vh", background: "#0d1117",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative", padding: 24,
        }}>
            <BgDecor accent="#3b82f6" />
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 720, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 40 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                        Huto<span style={{ color: "#3b82f6" }}>mi</span>
                    </span>
                </div>

                <h1 style={{ margin: "0 0 8px", fontSize: 36, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.04em" }}>
                    Quem é você?
                </h1>
                <p style={{ margin: "0 0 40px", fontSize: 15, color: "#475569" }}>
                    Seleccione o seu perfil para aceder ao portal correcto
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                    {roles.map((role, i) => {
                        const isHov = hovered === role.id;
                        return (
                            <button
                                key={role.id}
                                onClick={() => onSelect(role.id)}
                                onMouseEnter={() => setHovered(role.id)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: isHov ? "#111827" : "#0d1117",
                                    border: `1.5px solid ${isHov ? role.accent : "#1e2840"}`,
                                    borderRadius: 16, padding: "24px 22px",
                                    cursor: "pointer", textAlign: "left",
                                    transition: "all 0.2s",
                                    transform: isHov ? "translateY(-2px)" : "none",
                                    boxShadow: isHov ? `0 8px 32px ${role.accent}25` : "none",
                                    animationDelay: `${i * 0.07}s`,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                                        background: role.gradient,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#fff",
                                        boxShadow: isHov ? `0 4px 20px ${role.accent}60` : "none",
                                        transition: "box-shadow 0.2s",
                                    }}>
                                        {role.icon}
                                    </div>
                                    <div style={{ flex: 1, textAlign: "left" }}>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 5 }}>{role.label}</div>
                                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>{role.sub}</div>
                                    </div>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: isHov ? role.gradient : "#1e2840",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.2s", flexShrink: 0,
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <p style={{ marginTop: 32, fontSize: 12, color: "#334155" }}>
                    Hutomi Suite v1.0 · Dados Protegidos · Encriptação Total
                </p>
            </div>
        </div>
    );
};

// ─── Ecrã de Autenticação ─────────────────────────────────────────────────────

const AuthScreen = ({
    role, onBack, onSuccess,
}: {
    role: RoleConfig;
    onBack: () => void;
    onSuccess: (u: Utilizador) => void;
}) => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const fillDemo = () => {
        setEmail(role.demo.email);
        setPassword(role.demo.password);
        setError("");
    };

    const handleSubmit = async () => {
        setError("");
        if (mode === "login") {
            if (!email || !password) { setError("Por favor preencha todos os campos."); return; }
            setLoading(true);
            try {
                const resp = await fetch(`${API}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, senha: password }),
                });
                const data = await resp.json();
                setLoading(false);
                if (!resp.ok) { setError(data.erro || "Credenciais inválidas."); return; }
                onSuccess(data.utilizador as Utilizador);
            } catch {
                setLoading(false);
                setError("Servidor indisponível. Certifique-se que o backend está a correr.");
            }
        } else {
            if (!name || !email || !password || !confirm) { setError("Por favor preencha todos os campos."); return; }
            if (password !== confirm) { setError("As palavras-passe não coincidem."); return; }
            if (password.length < 6) { setError("A palavra-passe deve ter pelo menos 6 caracteres."); return; }
            setLoading(true);
            try {
                const resp = await fetch(`${API}/auth/registo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: name, email, senha: password, perfil: role.id }),
                });
                const data = await resp.json();
                setLoading(false);
                if (!resp.ok) { setError(data.erro || "Erro ao criar conta."); return; }
                onSuccess(data.utilizador as Utilizador);
            } catch {
                setLoading(false);
                setError("Servidor indisponível. Certifique-se que o backend está a correr.");
            }
        }
    };

    const inputStyle = {
        width: "100%", padding: "11px 14px",
        background: "#0d1117", border: "1px solid #1e2840",
        borderRadius: 9, color: "#e2e8f0", fontSize: 14,
        fontFamily: "inherit", outline: "none",
        boxSizing: "border-box" as const,
        transition: "border-color 0.15s",
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#0d1117",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative", padding: 24,
        }}>
            <BgDecor accent={role.accent} />

            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
                <button
                    onClick={onBack}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", color: "#475569",
                        fontSize: 13, cursor: "pointer", marginBottom: 28, padding: 0,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Mudar perfil
                </button>

                <div style={{
                    background: "#111827",
                    border: `1px solid ${role.accent}30`,
                    borderRadius: 20,
                    padding: "32px 32px",
                    boxShadow: `0 20px 60px ${role.accent}15`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: role.gradient,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff",
                            boxShadow: `0 4px 20px ${role.accent}50`,
                        }}>
                            {role.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "0.07em" }}>
                                {mode === "login" ? "ENTRAR COMO" : "REGISTAR COMO"}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{role.label}</div>
                        </div>
                    </div>

                    <div style={{
                        display: "flex", background: "#0d1117",
                        borderRadius: 10, padding: 3, marginBottom: 24,
                    }}>
                        {(["login", "signup"] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(""); }}
                                style={{
                                    flex: 1, padding: "8px 0",
                                    background: mode === m ? role.gradient : "transparent",
                                    border: "none", borderRadius: 8,
                                    color: mode === m ? "#fff" : "#475569",
                                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                {m === "login" ? "Entrar" : "Criar Conta"}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {mode === "signup" && (
                            <div>
                                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Nome Completo</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Dr. Maria Silva"
                                    style={inputStyle}
                                />
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Endereço de Email</label>
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={role.demo.email}
                                type="email"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Palavra-passe</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    type={showPw ? "text" : "password"}
                                    style={{ ...inputStyle, paddingRight: 40 }}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                />
                                <button
                                    onClick={() => setShowPw(p => !p)}
                                    style={{
                                        position: "absolute", right: 12, top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none", border: "none",
                                        color: "#475569", cursor: "pointer", padding: 0,
                                    }}
                                >
                                    {showPw
                                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>
                        {mode === "signup" && (
                            <div>
                                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Confirmar Palavra-passe</label>
                                <input
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    type="password"
                                    style={inputStyle}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            marginTop: 12, padding: "9px 12px",
                            background: "#450a0a", border: "1px solid #7f1d1d",
                            borderRadius: 8, fontSize: 13, color: "#fca5a5",
                        }}>{error}</div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "13px 0",
                            background: loading ? "#1e2840" : role.gradient,
                            border: "none", borderRadius: 10,
                            color: "#fff", fontSize: 15, fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: 20, letterSpacing: "0.01em",
                            transition: "all 0.2s",
                            boxShadow: loading ? "none" : `0 4px 20px ${role.accent}40`,
                        }}
                    >
                        {loading ? "A verificar..." : mode === "login" ? `Entrar como ${role.label}` : "Criar Conta"}
                    </button>

                    {mode === "login" && (
                        <div style={{
                            marginTop: 16, padding: "10px 14px",
                            background: "#0d1117", border: "1px dashed #1e2840",
                            borderRadius: 8,
                        }}>
                            <div style={{ fontSize: 11, color: "#334155", fontWeight: 600, marginBottom: 6 }}>CREDENCIAIS DEMO</div>
                            <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>
                                <span style={{ color: "#64748b" }}>{role.demo.email}</span> / <span style={{ color: "#64748b" }}>{role.demo.password}</span>
                            </div>
                            <button
                                onClick={fillDemo}
                                style={{
                                    background: "none", border: `1px solid ${role.accent}50`,
                                    borderRadius: 6, padding: "4px 10px",
                                    color: role.accent, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                }}
                            >↗ Preencher credenciais demo</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
    const [screen, setScreen] = useState<Screen>("role-select");
    const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
    const [utilizador, setUtilizador] = useState<Utilizador | null>(null);

    const handleRoleSelect = (roleId: Role) => {
        const r = roles.find(r => r.id === roleId)!;
        setSelectedRole(r);
        setScreen("login");
    };

    const handleLoginSuccess = (u: Utilizador) => {
        setUtilizador(u);
        setScreen("dashboard");
    };

    const handleBack = () => { setScreen("role-select"); setSelectedRole(null); };
    const handleLogout = () => { setScreen("role-select"); setSelectedRole(null); setUtilizador(null); };

    if (screen === "role-select") return <RoleSelectScreen onSelect={handleRoleSelect} />;

    if (screen === "login" && selectedRole) {
        return <AuthScreen role={selectedRole} onBack={handleBack} onSuccess={handleLoginSuccess} />;
    }

    if (screen === "dashboard" && selectedRole && utilizador) {
        switch (selectedRole.id) {
            case "patient":    return <VitalLinkDashboard user={utilizador} onLogout={handleLogout} />;
            case "manager":   return <ManagerDashboard user={utilizador} onLogout={handleLogout} />;
            case "doctor":    return <ClinicalDashboard user={utilizador} onLogout={handleLogout} />;
            case "pharmacist": return <PharmacyDashboard user={utilizador} onLogout={handleLogout} />;
        }
    }

    return null;
}
