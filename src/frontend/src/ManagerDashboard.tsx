import { useState } from "react";
import type { ReactElement } from "react";
import "./ManagerDashboard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditStatus = "CRITICAL" | "WARNING" | "INFO";
type NavItem = { id: string; label: string; icon: ReactElement };
type KpiBadgeVariant = "success" | "danger";

interface AuditLog {
  timestamp: string;
  event: string;
  actor: string;
  location: string;
  status: AuditStatus;
}

interface PharmacyDrug {
  name: string;
  consumed: number;
  reserved: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const auditLogs: AuditLog[] = [
  { timestamp: "14:22:05", event: "Vault Access", actor: "Dr. Sarah Chen", location: "Pharmacy A", status: "CRITICAL" },
  { timestamp: "14:15:32", event: "Patient Data Export", actor: "Admin_User_04", location: "Records", status: "WARNING" },
  { timestamp: "14:00:00", event: "System Backup", actor: "Auto_System", location: "Server Cluster", status: "INFO" },
  { timestamp: "13:45:12", event: "Security Breach Blocked", actor: "Network_Firewall", location: "Gateway", status: "CRITICAL" },
  { timestamp: "13:10:44", event: "New Staff Onboarded", actor: "HR_Portal", location: "Admin", status: "INFO" },
];

const pharmacyData: PharmacyDrug[] = [
  { name: "Antibiotics", consumed: 72, reserved: 88 },
  { name: "Analgesics", consumed: 58, reserved: 74 },
  { name: "Antiviral", consumed: 20, reserved: 82 },
  { name: "Insulin", consumed: 34, reserved: 60 },
  { name: "Vaccines", consumed: 12, reserved: 96 },
];

const influxData = [
  42, 40, 38, 37, 38, 42, 50, 62, 74, 82, 86, 88,
  87, 84, 79, 73, 68, 63, 57, 51, 47, 44, 42, 41,
];

const auditStatusClass: Record<AuditStatus, string> = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
};

// ─── SVG Area Chart ───────────────────────────────────────────────────────────

const InfluxChart = () => {
  const W = 520, H = 200;
  const padL = 36, padR = 8, padT = 10, padB = 30;
  const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
  const yLabels = [0, 25, 50, 75, 100];

  const xScale = (i: number) => padL + (i / (influxData.length - 1)) * (W - padL - padR);
  const yScale = (v: number) => padT + (1 - v / 100) * (H - padT - padB);

  const pts = influxData.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
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
        const xi = i === labels.length - 1 ? influxData.length - 1 : Math.round((i / (labels.length - 1)) * (influxData.length - 1));
        return <text key={l} x={xScale(xi)} y={H - padB + 14} fill="#4a5568" fontSize="9" textAnchor="middle">{l}</text>;
      })}
      <polygon points={area} fill="url(#influxGrad)" />
      <polyline points={pts} fill="none" stroke="#7c9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xScale(11)} cy={yScale(88)} r="4" fill="#7c9eff" />
      <circle cx={xScale(11)} cy={yScale(88)} r="7" fill="#7c9eff" fillOpacity="0.25" />
    </svg>
  );
};

// ─── Pharmacy horizontal bars ─────────────────────────────────────────────────

const PharmacyBars = () => (
  <div className="mgr-pharmacy-bars">
    {pharmacyData.map(d => (
      <div key={d.name} className="mgr-pharmacy-row">
        <span className="mgr-pharmacy-label">{d.name}</span>
        <div className="mgr-pharmacy-tracks">
          <div className="mgr-bar-track">
            <div className="mgr-bar-fill consumed" style={{ width: `${d.consumed}%` }} />
          </div>
          <div className="mgr-bar-track">
            <div className="mgr-bar-fill reserved" style={{ width: `${d.reserved}%` }} />
          </div>
        </div>
      </div>
    ))}
    <div className="mgr-pharmacy-legend">
      <div className="mgr-legend-item">
        <div className="mgr-legend-dot consumed" />
        Consumed
      </div>
      <div className="mgr-legend-item">
        <div className="mgr-legend-dot reserved" />
        Reserved
      </div>
    </div>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const AuditBadge = ({ status }: { status: AuditStatus }) => (
  <span className={`mgr-audit-badge ${auditStatusClass[status]}`}>{status}</span>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

const Svg = ({ d, size = 16, color = "currentColor", extra = "" }: { d: string; size?: number; color?: string; extra?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d + extra} />
  </svg>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AegisHealthDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightDone, setInsightDone] = useState(false);

  const handleInsight = () => {
    setInsightLoading(true);
    setTimeout(() => { setInsightLoading(false); setInsightDone(true); }, 1800);
    setTimeout(() => setInsightDone(false), 4000);
  };

  const navItems: NavItem[] = [
    {
      id: "dashboard", label: "Executive Dashboard",
      icon: <Svg d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" size={15} />,
    },
    {
      id: "patients", label: "Patient Management",
      icon: <Svg d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={15} />,
    },
    {
      id: "clinical", label: "Clinical Records",
      icon: <Svg d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={15} />,
    },
    {
      id: "pharmacy", label: "Pharmacy & Stock",
      icon: <Svg d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" size={15} />,
    },
    {
      id: "security", label: "Security Center",
      icon: <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={15} />,
    },
  ];

  const kpis: {
    icon: ReactElement;
    badge: string;
    badgeVariant: KpiBadgeVariant;
    label: string;
    value: string;
    sub: string;
  }[] = [
    {
      icon: <Svg d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={24} color="#7c9eff" />,
      badge: "+12.4%", badgeVariant: "success",
      label: "PATIENT ARRIVALS", value: "412", sub: "Current 24h intake",
    },
    {
      icon: <Svg d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={24} color="#7c9eff" />,
      badge: "2.1%", badgeVariant: "danger",
      label: "BED OCCUPANCY", value: "88.2%", sub: "42 beds available",
    },
    {
      icon: <Svg d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={24} color="#f87171" />,
      badge: "Critical", badgeVariant: "danger",
      label: "STOCK ALERTS", value: "04", sub: "Pharmacy level low",
    },
    {
      icon: <Svg d="M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" size={24} color="#7c9eff" />,
      badge: "+5.8%", badgeVariant: "success",
      label: "DAILY REVENUE", value: "$1.24M", sub: "Billing cycle optimized",
    },
  ];

  const insightBtnClass = ["mgr-insight-btn", insightDone && "done"].filter(Boolean).join(" ");

  return (
    <div className="mgr-dashboard">
      <aside className="mgr-sidebar">
        <div className="mgr-logo">
          <div className="mgr-logo-icon">
            <Svg d="M22 12h-4l-3 9L9 3l-3 9H2" size={14} color="#fff" />
          </div>
          <span className="mgr-logo-text">AEGIS HEALTH</span>
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
          <div className="mgr-user-avatar">JV</div>
          <div>
            <div className="mgr-user-name">Dr. Julian Vane</div>
            <div className="mgr-user-role">Chief Medical Officer</div>
          </div>
        </div>

        <button type="button" className="mgr-settings-btn">
          <Svg d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" size={14} />
          System Settings
        </button>
      </aside>

      <div className="mgr-main">
        <header className="mgr-header">
          <div className="mgr-search">
            <Svg d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="#4b5563" />
            <span className="mgr-search-placeholder">Global system search (patients, staff, records)...</span>
          </div>

          <div className="mgr-header-actions">
            <div className="mgr-status-block">
              <div className="mgr-status-label">SYSTEM STATUS</div>
              <div className="mgr-status-value">
                <span className="mgr-status-dot" />
                ALL NODES ONLINE
              </div>
            </div>
            <div className="mgr-notif-wrap">
              <button type="button" className="mgr-notif-btn">
                <Svg d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={15} color="#64748b" />
              </button>
              <span className="mgr-notif-badge">3</span>
            </div>
          </div>
        </header>

        <main className="mgr-content">
          <div className="mgr-page-header">
            <div>
              <h1 className="mgr-page-title">Executive Overview</h1>
              <p className="mgr-page-subtitle">REAL-TIME FACILITY & OPERATIONAL INTELLIGENCE</p>
            </div>
            <div className="mgr-page-actions">
              <button type="button" className="mgr-btn-secondary">
                <Svg d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" size={13} color="#94a3b8" />
                Export Report
              </button>
              <button type="button" onClick={handleInsight} className={insightBtnClass}>
                {insightLoading ? "Analyzing..." : insightDone ? "✓ Insight Ready" : "Generate AI Insight"}
              </button>
            </div>
          </div>

          <div className="mgr-kpi-grid">
            {kpis.map(k => (
              <div key={k.label} className="mgr-kpi-card">
                <div className="mgr-kpi-top">
                  <div className="mgr-kpi-icon-wrap">{k.icon}</div>
                  <span className={`mgr-kpi-badge ${k.badgeVariant}`}>{k.badge}</span>
                </div>
                <div className="mgr-kpi-label">{k.label}</div>
                <div className="mgr-kpi-value">{k.value}</div>
                <div className="mgr-kpi-sub">
                  <Svg d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={11} color="#475569" />
                  {k.sub}
                </div>
              </div>
            ))}
          </div>

          <div className="mgr-charts-grid">
            <div className="mgr-card">
              <div className="mgr-card-header">
                <div>
                  <div className="mgr-card-title">Patient Influx Prediction</div>
                  <div className="mgr-card-desc">Estimated vs. Actual ER arrivals based on AI historical modeling</div>
                </div>
                <span className="mgr-badge-realtime">REAL-TIME</span>
              </div>
              <InfluxChart />
              <div className="mgr-chart-legend">
                <div className="mgr-chart-legend-dot" />
                <span className="mgr-chart-legend-label">Actual Arrivals</span>
              </div>
            </div>

            <div className="mgr-card">
              <div className="mgr-card-header-simple">
                <div className="mgr-card-title">Pharmacy Turnover</div>
                <div className="mgr-card-desc">Major drug class consumption rate</div>
              </div>
              <PharmacyBars />
            </div>
          </div>

          <div className="mgr-card mgr-audit-card">
            <div className="mgr-audit-header">
              <div>
                <div className="mgr-audit-title-row">
                  <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={15} color="#3b82f6" />
                  Security & Operations Audit Log
                </div>
                <div className="mgr-card-desc">
                  Live feed of system access, medical compliance, and physical security triggers
                </div>
              </div>
              <button type="button" className="mgr-audit-archives-btn">View Full Archives</button>
            </div>

            <div className="mgr-audit-table-head">
              {["TIMESTAMP", "EVENT ACTIVITY", "PRIMARY ACTOR", "LOCATION", "STATUS", ""].map(h => (
                <span key={h} className="mgr-audit-head-cell">{h}</span>
              ))}
            </div>

            {auditLogs.map((log, i) => (
              <div
                key={i}
                className={`mgr-audit-row${log.status === "CRITICAL" ? " critical" : ""}`}
              >
                <span className="mgr-audit-timestamp">{log.timestamp}</span>
                <span className="mgr-audit-event">{log.event}</span>
                <span className="mgr-audit-actor">{log.actor}</span>
                <span className="mgr-audit-location">{log.location}</span>
                <AuditBadge status={log.status} />
                <button type="button" className="mgr-audit-menu-btn">⋮</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
