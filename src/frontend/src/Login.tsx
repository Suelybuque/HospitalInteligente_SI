import { useState, type JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "patient" | "manager" | "doctor" | "pharmacist";
type Screen = "role-select" | "login" | "signup" | "dashboard";

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
        label: "Patient",
        sub: "Access your health records & appointments",
        gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
        accent: "#0ea5e9",
        demo: { email: "patient@vitallink.com", password: "patient123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        id: "manager",
        label: "Manager",
        sub: "Executive overview & operational intelligence",
        gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        accent: "#6366f1",
        demo: { email: "manager@aegishealth.com", password: "manager123" },
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
        label: "Doctor",
        sub: "Patient records, EMR & clinical tools",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        accent: "#10b981",
        demo: { email: "doctor@aegisclinical.com", password: "doctor123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    },
    {
        id: "pharmacist",
        label: "Pharmacist",
        sub: "Prescription workflow & inventory management",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        accent: "#f59e0b",
        demo: { email: "pharma@pharmflow.com", password: "pharma123" },
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        ),
    },
];

// ─── Demo dashboard placeholders ──────────────────────────────────────────────

const PatientDashboard = ({ onLogout }: { onLogout: () => void }) => (
    <DashboardShell
        title="VitalLink Patient Portal"
        subtitle="Welcome back, Jonathan Doe"
        accent="#0ea5e9"
        gradient="linear-gradient(135deg, #0ea5e9, #06b6d4)"
        onLogout={onLogout}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
        cards={[
            { label: "Heart Rate", value: "72 BPM", sub: "Measured 1h ago", color: "#ef4444" },
            { label: "Blood Glucose", value: "98 mg/dL", sub: "Within range", color: "#0ea5e9" },
            { label: "Blood Pressure", value: "120/80", sub: "No changes", color: "#10b981" },
            { label: "Weight", value: "182 lbs", sub: "↓ 2 lbs", color: "#8b5cf6" },
        ]}
        quickLinks={["My Appointments", "Lab Results", "Prescriptions", "Billing"]}
    />
);

const ManagerDashboard = ({ onLogout }: { onLogout: () => void }) => (
    <DashboardShell
        title="Aegis Health — Executive"
        subtitle="Welcome back, Dr. Julian Vane"
        accent="#6366f1"
        gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
        onLogout={onLogout}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
        cards={[
            { label: "Patient Arrivals", value: "412", sub: "Current 24h", color: "#6366f1" },
            { label: "Bed Occupancy", value: "88.2%", sub: "42 beds free", color: "#f59e0b" },
            { label: "Stock Alerts", value: "04", sub: "Critical level", color: "#ef4444" },
            { label: "Daily Revenue", value: "$1.24M", sub: "+5.8% today", color: "#10b981" },
        ]}
        quickLinks={["Patient Management", "Clinical Records", "Pharmacy & Stock", "Security Center"]}
    />
);

const DoctorDashboard = ({ onLogout }: { onLogout: () => void }) => (
    <DashboardShell
        title="AegisClinical EMR"
        subtitle="Welcome back, Dr. Alexander Vance"
        accent="#10b981"
        gradient="linear-gradient(135deg, #10b981, #059669)"
        onLogout={onLogout}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
        cards={[
            { label: "Patient Queue", value: "14", sub: "Waiting now", color: "#10b981" },
            { label: "Appointments", value: "8", sub: "Scheduled today", color: "#3b82f6" },
            { label: "Lab Pending", value: "3", sub: "Awaiting review", color: "#f59e0b" },
            { label: "Critical Alerts", value: "1", sub: "Immediate action", color: "#ef4444" },
        ]}
        quickLinks={["Patient Queue", "Clinical Notes", "Lab Results", "Digital Orders"]}
    />
);

const PharmacistDashboard = ({ onLogout }: { onLogout: () => void }) => (
    <DashboardShell
        title="PharmFlow Pro"
        subtitle="Welcome back, Dr. Sarah Jenkins"
        accent="#f59e0b"
        gradient="linear-gradient(135deg, #f59e0b, #d97706)"
        onLogout={onLogout}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>}
        cards={[
            { label: "Active Scripts", value: "4", sub: "Pending dispense", color: "#f59e0b" },
            { label: "Low Stock Alerts", value: "12", sub: "Reorder needed", color: "#ef4444" },
            { label: "Verified Today", value: "142", sub: "Prescriptions", color: "#10b981" },
            { label: "Avg Dispense", value: "09m", sub: "Per prescription", color: "#3b82f6" },
        ]}
        quickLinks={["Prescription Queue", "Inventory", "Compliance Check", "Order Diagnostics"]}
    />
);

// ─── Shared dashboard shell ───────────────────────────────────────────────────

interface ShellProps {
    title: string; subtitle: string; accent: string; gradient: string;
    onLogout: () => void; icon: JSX.Element;
    cards: { label: string; value: string; sub: string; color: string }[];
    quickLinks: string[];
}

const DashboardShell = ({ title, subtitle, accent, gradient, onLogout, icon, cards, quickLinks }: ShellProps) => (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        {/* Header */}
        <div style={{
            background: "#111827", borderBottom: "1px solid #1e2840",
            padding: "0 28px", height: 56,
            display: "flex", alignItems: "center", gap: 12,
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 9,
                background: gradient, borderRadius: 9,
                padding: "6px 14px", color: "#fff",
            }}>
                {icon}
                <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>{title}</span>
            </div>
            <span style={{ fontSize: 13, color: "#475569", marginLeft: 8 }}>{subtitle}</span>
            <button
                onClick={onLogout}
                style={{
                    marginLeft: "auto",
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#1a1d27", border: "1px solid #1e2840",
                    borderRadius: 8, padding: "7px 14px",
                    color: "#94a3b8", fontSize: 13, cursor: "pointer",
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sign Out
            </button>
        </div>

        <div style={{ padding: "32px 28px", maxWidth: 960, margin: "0 auto" }}>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
                Dashboard Overview
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#475569" }}>
                You are logged in as <span style={{ color: accent, fontWeight: 600 }}>{title.split("—")[0].trim()}</span>. Here's your real-time summary.
            </p>

            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                {cards.map(c => (
                    <div key={c.label} style={{
                        background: "#111827", border: "1px solid #1e2840",
                        borderRadius: 12, padding: "18px",
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.07em", marginBottom: 8 }}>{c.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: c.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{c.value}</div>
                        <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{c.sub}</div>
                    </div>
                ))}
            </div>

            {/* Quick links */}
            <div style={{ marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#334155", letterSpacing: "0.07em" }}>QUICK ACCESS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {quickLinks.map(l => (
                    <button key={l} style={{
                        background: "#111827", border: `1px solid ${accent}30`,
                        borderRadius: 10, padding: "14px",
                        color: accent, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s",
                    }}>{l} →</button>
                ))}
            </div>

            {/* Notice */}
            <div style={{
                marginTop: 32, background: "#111827",
                border: `1px dashed ${accent}40`,
                borderRadius: 12, padding: "20px 22px",
                color: "#475569", fontSize: 13, lineHeight: 1.6,
            }}>
                💡 <strong style={{ color: "#94a3b8" }}>Integration note:</strong> This shell connects to the full{" "}
                <span style={{ color: accent }}>{title}</span> dashboard built in the previous steps.
                In production, replace this component with the complete dashboard module.
            </div>
        </div>
    </div>
);

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
        {/* Grid lines */}
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

// ─── Role Select Screen ───────────────────────────────────────────────────────

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
                {/* Logo */}
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
                        Aegis<span style={{ color: "#3b82f6" }}>Health</span>
                    </span>
                </div>

                <h1 style={{ margin: "0 0 8px", fontSize: 36, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.04em" }}>
                    Who are you?
                </h1>
                <p style={{ margin: "0 0 40px", fontSize: 15, color: "#475569" }}>
                    Select your role to access the correct portal
                </p>

                {/* Role cards */}
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
                    Aegis Health Suite v3.1 · HIPAA Compliant · All data encrypted
                </p>
            </div>
        </div>
    );
};

// ─── Auth Screen (Login + Signup) ─────────────────────────────────────────────

const AuthScreen = ({
    role, onBack, onSuccess,
}: {
    role: RoleConfig;
    onBack: () => void;
    onSuccess: () => void;
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

    const handleSubmit = () => {
        setError("");
        if (mode === "login") {
            if (!email || !password) { setError("Please fill in all fields."); return; }
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                if (email === role.demo.email && password === role.demo.password) {
                    onSuccess();
                } else {
                    setError("Invalid credentials. Try the demo account below.");
                }
            }, 1200);
        } else {
            if (!name || !email || !password || !confirm) { setError("Please fill in all fields."); return; }
            if (password !== confirm) { setError("Passwords do not match."); return; }
            if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
            setLoading(true);
            setTimeout(() => { setLoading(false); onSuccess(); }, 1400);
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
                {/* Back */}
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
                    Change role
                </button>

                {/* Card */}
                <div style={{
                    background: "#111827",
                    border: `1px solid ${role.accent}30`,
                    borderRadius: 20,
                    padding: "32px 32px",
                    boxShadow: `0 20px 60px ${role.accent}15`,
                }}>
                    {/* Role badge */}
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
                                {mode === "login" ? "SIGN IN AS" : "REGISTER AS"}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{role.label}</div>
                        </div>
                    </div>

                    {/* Mode tabs */}
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
                                {m === "login" ? "Sign In" : "Create Account"}
                            </button>
                        ))}
                    </div>

                    {/* Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {mode === "signup" && (
                            <div>
                                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Full Name</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Dr. Jane Smith"
                                    style={inputStyle}
                                />
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Email Address</label>
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={role.demo.email}
                                type="email"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    type={showPw ? "text" : "password"}
                                    style={{ ...inputStyle, paddingRight: 40 }}
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
                                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Confirm Password</label>
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

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: 12, padding: "9px 12px",
                            background: "#450a0a", border: "1px solid #7f1d1d",
                            borderRadius: 8, fontSize: 13, color: "#fca5a5",
                        }}>{error}</div>
                    )}

                    {/* Submit */}
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
                        {loading ? "Verifying..." : mode === "login" ? `Enter ${role.label} Portal` : "Create Account"}
                    </button>

                    {/* Demo hint */}
                    {mode === "login" && (
                        <div style={{
                            marginTop: 16, padding: "10px 14px",
                            background: "#0d1117", border: "1px dashed #1e2840",
                            borderRadius: 8,
                        }}>
                            <div style={{ fontSize: 11, color: "#334155", fontWeight: 600, marginBottom: 6 }}>DEMO CREDENTIALS</div>
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
                            >↗ Fill demo credentials</button>
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

    const handleRoleSelect = (roleId: Role) => {
        const r = roles.find(r => r.id === roleId)!;
        setSelectedRole(r);
        setScreen("login");
    };

    const handleLoginSuccess = () => setScreen("dashboard");
    const handleBack = () => { setScreen("role-select"); setSelectedRole(null); };
    const handleLogout = () => { setScreen("role-select"); setSelectedRole(null); };

    if (screen === "role-select") return <RoleSelectScreen onSelect={handleRoleSelect} />;

    if ((screen === "login" || screen === "signup") && selectedRole) {
        return <AuthScreen role={selectedRole} onBack={handleBack} onSuccess={handleLoginSuccess} />;
    }

    if (screen === "dashboard" && selectedRole) {
        switch (selectedRole.id) {
            case "patient": return <PatientDashboard onLogout={handleLogout} />;
            case "manager": return <ManagerDashboard onLogout={handleLogout} />;
            case "doctor": return <DoctorDashboard onLogout={handleLogout} />;
            case "pharmacist": return <PharmacistDashboard onLogout={handleLogout} />;
        }
    }

    return null;
}