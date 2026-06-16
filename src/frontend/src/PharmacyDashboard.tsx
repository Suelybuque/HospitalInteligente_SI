import { useState, useEffect } from "react";
import "./PharmacyDashboard.css";
import { initTheme, toggleTheme, type Theme } from "./theme";

const API = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: string;
    nome: string;
    perfil: string;
    cargo?: string;
}

type StockStatus = "Estável" | "Stock Baixo" | "Verificado" | "Pendente";

interface Prescricao {
    id: string;
    pacienteId: string;
    medicamento: string;
    dose: string;
    horario: string;
    estado: string;
    data: string;
}

interface InventoryItem {
    id: string;
    nome: string;
    sub?: string;
    loteId: string;
    alertaLote: boolean;
    categoria: string;
    quantidade: number;
    estado: StockStatus;
}

interface ChecklistItem {
    descricao: string;
    concluido: boolean;
}

interface Checklist {
    id: string;
    prescricaoId: string;
    itens: ChecklistItem[];
    dispensado: boolean;
    dataHora: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusClassMap: Record<StockStatus, string> = {
    "Estável":    "stable",
    "Stock Baixo": "low-stock",
    "Verificado": "verified",
    "Pendente":   "pending",
};

const StatusBadge = ({ status }: { status: StockStatus }) => {
    const icon = status === "Stock Baixo" ? "⚠" : status === "Pendente" ? "○" : "✓";
    return (
        <span className={`pharm-status-badge ${statusClassMap[status]}`}>
            <span className="pharm-status-badge-icon">{icon}</span> {status}
        </span>
    );
};

// ─── Icon components ─────────────────────────────────────────────────────────

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
);
const BellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
);
const FilterIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
);
const PlusIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);
const DocIcon = ({ active }: { active?: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#0ea5e9" : "#9ca3af"} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
);
const ChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PharmacyDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
    const [selectedRxId, setSelectedRxId] = useState<string | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const [dispensed, setDispensed] = useState(false);
    const [dispensing, setDispensing] = useState(false);
    const [activeNav, setActiveNav] = useState("rx");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ alertasStockBaixo: 0, dispensadosHoje: 0, tempoMedioDispensa: "—" });
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => { setTheme(initTheme()); }, []);

    useEffect(() => {
        Promise.all([
            fetch(`${API}/prescricoes?estado=pendente`).then(r => r.json()),
            fetch(`${API}/inventario`).then(r => r.json()),
            fetch(`${API}/farmacia/estatisticas`).then(r => r.json()),
        ]).then(([rxs, inv, st]) => {
            if (Array.isArray(rxs)) {
                setPrescricoes(rxs);
                if (rxs.length > 0) setSelectedRxId(rxs[0].id);
            }
            if (Array.isArray(inv)) setInventory(inv);
            if (st && typeof st === "object") setStats(st);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedRxId) return;
        setChecklist(null);
        setDispensed(false);
        fetch(`${API}/checklists/${selectedRxId}`)
            .then(r => {
                if (r.status === 404) return null;
                return r.json();
            })
            .then(async (data) => {
                if (data) {
                    setChecklist(data);
                    setDispensed(data.dispensado ?? false);
                } else {
                    // criar checklist para esta prescrição
                    const resp = await fetch(`${API}/checklists`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prescricaoId: selectedRxId, farmaceuticoId: user.id }),
                    });
                    const nova = await resp.json();
                    setChecklist(nova);
                }
            })
            .catch(() => {});
    }, [selectedRxId, user.id]);

    const toggleCheck = async (i: number) => {
        if (!checklist || dispensed) return;
        const novosItens = checklist.itens.map((c, idx) =>
            idx === i ? { ...c, concluido: !c.concluido } : c
        );
        const novaChecklist = { ...checklist, itens: novosItens };
        setChecklist(novaChecklist);
        try {
            await fetch(`${API}/checklists/${checklist.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itens: novosItens }),
            });
        } catch {
            /* ignora erro de rede */
        }
    };

    const handleDispense = async () => {
        if (!checklist || dispensed || dispensing) return;
        setDispensing(true);
        try {
            const resp = await fetch(`${API}/checklists/${checklist.id}/dispensar`, { method: "PUT" });
            if (resp.ok) {
                setDispensed(true);
                const data = await resp.json();
                setChecklist(data);
            }
        } catch {
            /* ignora erro de rede */
        } finally {
            setDispensing(false);
        }
    };

    const handleAddStock = async () => {
        const novo = {
            nome: "Novo Medicamento",
            sub: "Categoria TBD",
            loteId: `LOT-${Math.floor(Math.random() * 9000 + 1000)}-00`,
            alertaLote: false,
            categoria: "Geral",
            quantidade: 100,
            estado: "Pendente" as StockStatus,
        };
        try {
            const resp = await fetch(`${API}/inventario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novo),
            });
            const criado = await resp.json();
            setInventory(prev => [criado, ...prev]);
        } catch {
            setInventory(prev => [{ ...novo, id: `INV-${Date.now()}` }, ...prev]);
        }
    };

    const allChecked = checklist?.itens.every(c => c.concluido) ?? false;
    const selectedRx = prescricoes.find(p => p.id === selectedRxId) ?? null;

    const dispenseBtnClass = [
        "pharm-dispense-btn",
        allChecked && (dispensed ? "success" : "ready"),
    ].filter(Boolean).join(" ");

    const navItems = [
        { id: "rx", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        )},
        { id: "inv", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        )},
        { id: "user", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        )},
        { id: "logout", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        )},
    ];

    const userInitials = user.nome.split(" ").map(n => n[0]).slice(0, 2).join("");

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontFamily: "sans-serif" }}>
            A carregar painel da farmácia...
        </div>
    );

    return (
        <div className="pharm-dashboard">
            <nav className="pharm-sidebar">
                {navItems.map(n => (
                    <button
                        key={n.id}
                        onClick={() => n.id === "logout" ? onLogout() : setActiveNav(n.id)}
                        className={`pharm-nav-btn${activeNav === n.id ? " active" : ""}`}
                        title={n.id === "logout" ? "Terminar Sessão" : undefined}
                    >{n.icon}</button>
                ))}
            </nav>

            <div className="pharm-main">
                <header className="pharm-header">
                    <div className="pharm-logo">
                        <div className="pharm-logo-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                            </svg>
                        </div>
                        <span className="pharm-logo-text">
                            Hutomi <span className="pharm-logo-accent">Farmácia</span>
                        </span>
                    </div>

                    <div className="pharm-search">
                        <SearchIcon />
                        <span className="pharm-search-placeholder">Pesquisar medicamento, ID do paciente ou lote...</span>
                    </div>

                    <div className="pharm-header-actions">
                        <button type="button" className="pharm-bell-btn"><BellIcon /></button>
                        <button
                            type="button"
                            className="pharm-theme-btn"
                            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                            onClick={() => setTheme(toggleTheme())}
                        >
                            {theme === "dark" ? "☀" : "🌙"}
                        </button>
                        <div className="pharm-user-block">
                            <div className="pharm-user-info">
                                <div className="pharm-user-name">{user.nome}</div>
                                <div className="pharm-user-role">{user.cargo ?? "Farmacêutico"}</div>
                            </div>
                            <div className="pharm-avatar-wrap">
                                <div className="pharm-avatar">{userInitials}</div>
                                <div className="pharm-avatar-status" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="pharm-body">
                    <div className="pharm-panel-left">
                        <div className="pharm-section-header">
                            <div className="pharm-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                Fluxo de Prescrições
                            </div>
                            <span className="pharm-badge-active">{prescricoes.length} PRESCRIÇÕES ACTIVAS</span>
                        </div>

                        <div className="pharm-rx-queue">
                            {prescricoes.length === 0 ? (
                                <p style={{ color: "#475569", fontSize: 13 }}>Sem prescrições pendentes.</p>
                            ) : prescricoes.map(rx => {
                                const active = selectedRxId === rx.id;
                                return (
                                    <button
                                        key={rx.id}
                                        type="button"
                                        onClick={() => setSelectedRxId(rx.id)}
                                        className={`pharm-rx-card${active ? " active" : ""}`}
                                    >
                                        <div className="pharm-rx-icon"><DocIcon active={active} /></div>
                                        <div className="pharm-rx-info">
                                            <div className="pharm-rx-patient">Paciente #{rx.pacienteId}</div>
                                            <div className="pharm-rx-medication">{rx.medicamento} {rx.dose}</div>
                                        </div>
                                        <div className="pharm-rx-meta">
                                            <span className="pharm-rx-time">{rx.data}</span>
                                            {active && <ChevronRight />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pharm-card">
                            <div className="pharm-card-title">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                Detalhes de Verificação
                            </div>
                            <p className="pharm-card-desc">
                                Verifique os dados do paciente e contraindicações antes da dispensa.
                            </p>

                            {selectedRx && (
                                <div className="pharm-patient-card">
                                    <div className="pharm-patient-avatar">
                                        {selectedRx.pacienteId.replace("PAC-", "").slice(0, 2)}
                                    </div>
                                    <div className="pharm-patient-grid">
                                        <div>
                                            <div className="pharm-field-label">ID Paciente</div>
                                            <div className="pharm-field-value">#{selectedRx.pacienteId}</div>
                                        </div>
                                        <div>
                                            <div className="pharm-field-label">Data Prescrição</div>
                                            <div className="pharm-field-value">{selectedRx.data}</div>
                                        </div>
                                        <div className="pharm-field-full">
                                            <div className="pharm-field-label pharm-field-label-spaced">Medicamento</div>
                                            <div className="pharm-allergies">{selectedRx.medicamento} {selectedRx.dose} — {selectedRx.horario}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pharm-checklist-section">
                                <div className="pharm-checklist-heading">Checklist de Conformidade</div>
                                <div className="pharm-checklist">
                                    {checklist ? checklist.itens.map((item, i) => (
                                        <label key={i} className="pharm-checklist-item">
                                            <div className="pharm-checklist-row">
                                                <div
                                                    role="checkbox"
                                                    aria-checked={item.concluido}
                                                    tabIndex={0}
                                                    onClick={() => toggleCheck(i)}
                                                    onKeyDown={e => { if (e.key === " " || e.key === "Enter") toggleCheck(i); }}
                                                    className={`pharm-checkbox${item.concluido ? " checked" : ""}`}
                                                >
                                                    {item.concluido && (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                            <polyline points="20 6 9 17 4 12"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={`pharm-checklist-label${item.concluido ? " checked" : ""}`}>
                                                    {item.descricao}
                                                </span>
                                            </div>
                                            {item.concluido && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                                </svg>
                                            )}
                                        </label>
                                    )) : (
                                        <p style={{ color: "#475569", fontSize: 13 }}>A carregar checklist...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pharm-card pharm-dispense-card">
                            <div className="pharm-stock-row">
                                <span className="pharm-stock-label">Estado de Stock Actual</span>
                                <span className="pharm-status-verified">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    Verificado
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleDispense}
                                disabled={!allChecked || dispensed || dispensing}
                                className={dispenseBtnClass}
                            >
                                {dispensing ? "A dispensar..." : dispensed ? "✓ Dispensado!" : "Dispensar Medicamento"}
                            </button>
                            {!allChecked && !dispensed && (
                                <p className="pharm-dispense-hint">
                                    Conclua todos os itens da checklist para activar a dispensa
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pharm-panel-right">
                        <div className="pharm-section-header">
                            <div className="pharm-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                </svg>
                                Gestão de Inventário e Stock
                            </div>
                            <div className="pharm-inventory-actions">
                                <button type="button" className="pharm-btn-secondary"><FilterIcon /> Filtrar</button>
                                <button type="button" onClick={handleAddStock} className="pharm-btn-primary"><PlusIcon /> Adicionar Stock</button>
                            </div>
                        </div>

                        <div className="pharm-table">
                            <div className="pharm-table-head">
                                {["Medicamento", "Lote", "Categoria", "Quantidade", "Estado"].map(h => (
                                    <span key={h} className="pharm-table-head-cell">{h}</span>
                                ))}
                            </div>

                            {inventory.length === 0 ? (
                                <p style={{ color: "#475569", fontSize: 13, padding: "12px 0" }}>Sem itens no inventário.</p>
                            ) : inventory.map(item => (
                                <div key={item.id} className={`pharm-table-row${item.estado === "Stock Baixo" ? " low-stock" : ""}`}>
                                    <div>
                                        <div className="pharm-med-name">{item.nome}</div>
                                        <div className="pharm-med-sub">{item.sub ?? ""}</div>
                                    </div>
                                    <div className={`pharm-batch-id${item.alertaLote ? " alert" : ""}`}>{item.loteId}</div>
                                    <div><span className="pharm-category-tag">{item.categoria}</span></div>
                                    <div className={`pharm-quantity${item.quantidade < 30 ? " low" : ""}`}>
                                        {item.quantidade.toLocaleString("pt-PT")}
                                    </div>
                                    <div><StatusBadge status={item.estado} /></div>
                                </div>
                            ))}

                            <div className="pharm-table-footer">
                                <span className="pharm-table-footer-text">A mostrar {inventory.length} entradas</span>
                                <div className="pharm-pagination">
                                    {["Anterior", "Próximo"].map(label => (
                                        <button key={label} type="button" className="pharm-page-btn">{label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pharm-stats">
                            {[
                                { value: String(stats.alertasStockBaixo), label: "ALERTAS STOCK BAIXO",  icon: "⚠", iconClass: "alert"   },
                                { value: String(stats.dispensadosHoje),   label: "VERIFICADOS HOJE",     icon: "✓", iconClass: "success" },
                                { value: stats.tempoMedioDispensa,        label: "TEMPO MÉDIO DISPENSA", icon: "◷", iconClass: "info"    },
                            ].map(stat => (
                                <div key={stat.label} className="pharm-stat-card">
                                    <div className={`pharm-stat-icon ${stat.iconClass}`}>{stat.icon}</div>
                                    <div>
                                        <div className="pharm-stat-value">{stat.value}</div>
                                        <div className="pharm-stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
