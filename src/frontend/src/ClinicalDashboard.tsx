import { useState } from "react";
import "./ClinicalDashboard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "URGENT" | "EMERGENCY" | "ROUTINE";
type OrderStatus = "Active" | "Recent";
type LabStatus = "ELEVATED" | "NORMAL" | "LOW";

interface Patient {
  id: string;
  name: string;
  priority: Priority;
  waitTime: string;
}

interface LabResult {
  name: string;
  status: LabStatus;
  value: string;
  unit: string;
  trend: number[];
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const patients: Patient[] = [
  { id: "PX-99201", name: "Sarah Jenkins", priority: "URGENT", waitTime: "00:08" },
  { id: "PX-99342", name: "Michael O'Connell", priority: "EMERGENCY", waitTime: "00:42" },
  { id: "PX-99411", name: "Elena Rodriguez", priority: "ROUTINE", waitTime: "01:15" },
  { id: "PX-99458", name: "David Thompson", priority: "URGENT", waitTime: "01:30" },
  { id: "PX-99502", name: "Linda Chen", priority: "ROUTINE", waitTime: "02:05" },
];

const labResults: LabResult[] = [
  { name: "Plasma Glucose (Fast)", status: "ELEVATED", value: "132", unit: "mg/dL", trend: [115, 120, 118, 125, 122, 132] },
  { name: "White Blood Cell Count", status: "ELEVATED", value: "11.4", unit: "×10⁶/µL", trend: [8, 9, 9.5, 10, 10.8, 11.4] },
  { name: "Creatinine", status: "NORMAL", value: "0.9", unit: "mg/dL", trend: [1.1, 1.0, 0.95, 0.92, 0.91, 0.9] },
];

const digitalOrders: DigitalOrder[] = [
  { drug: "Insulin Aspart (Novolog)", detail: "5 Units before meals", tag: "Ongoing", tagColor: "#10b981", status: "Active" },
  { drug: "Lisinopril 10mg", detail: "1 Tablet PO Daily", tag: "Chronic", tagColor: "#6366f1", status: "Active" },
  { drug: "Albuterol HFA", detail: "2 Puffs PRN Cough", tag: "PRN", tagColor: "#f59e0b", status: "Recent" },
];

const history: HistoryItem[] = [
  { type: "Routine Follow-up", date: "Jan 15, 2024", note: "HbA1c levels stable at 6.8%. Adjusted Insulin dosage." },
  { type: "Emergency Visit", date: "Oct 02, 2023", note: "Hypoglycemic episode. Treated with IV Dextrose." },
  { type: "Annual Wellness Exam", date: "Aug 22, 2023", note: "No significant changes. Vision screening normal." },
];

const diagnostics = ["CBC + DIFF", "CHEST X-RAY", "METABOLIC PNL", "URINALYSIS", "MRI BRAIN", "ECG/EKG"];

const priorityClass: Record<Priority, string> = {
  URGENT: "urgent",
  EMERGENCY: "emergency",
  ROUTINE: "routine",
};

const labStatusClass = (status: LabStatus) =>
  status === "NORMAL" ? "normal" : "elevated";

// ─── Tiny sparkline ───────────────────────────────────────────────────────────

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const w = 120, h = 32, pad = 2;
  const gradId = `g${color.replace("#", "")}`;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="clin-sparkline">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pad},${h} ${points} ${w - pad},${h}`} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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

export default function AegisClinicalDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string>("PX-99201");
  const [noteText, setNoteText] = useState(
    "Patient presents with persistent cough and low-grade fever for 3 days. Chest sounds indicate mild congestion in the lower right lobe. Previous history of asthma noted. Advised rest and hydration. Prescribing nebulizer session."
  );
  const [orders, setOrders] = useState<DigitalOrder[]>(digitalOrders);

  const addOrder = () => {
    const newOrder: DigitalOrder = {
      drug: "New Prescription",
      detail: "Pending details",
      tag: "New",
      tagColor: "#3b82f6",
      status: "Active",
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const vitals = [
    { label: "BLOOD PRESSURE", value: "118/74", unit: "mmHg", sub: "↗ -2% (Stable)", variant: "bp" as const },
    { label: "HEART RATE", value: "72", unit: "bpm", sub: "↗ +1% (Normal)", variant: "hr" as const },
    { label: "TEMP", value: "36.8", unit: "°C", sub: "", variant: "temp" as const },
    { label: "SPO2", value: "98", unit: "%", sub: "", variant: "spo2" as const },
  ];

  return (
    <div className="clin-dashboard">
      <header className="clin-header">
        <div className="clin-logo">
          <div className="clin-logo-icon">
            <Ic d="M22 12h-4l-3 9L9 3l-3 9H2" color="#fff" size={13} />
          </div>
          <span className="clin-logo-text">AegisClinical</span>
        </div>

        <div className="clin-search">
          <Ic d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} />
          <span className="clin-search-placeholder">Search patients, records, or orders...</span>
        </div>

        <div className="clin-header-actions">
          <button type="button" className="clin-alert-btn">
            <span className="clin-alert-icon">⚠</span> 1 CRITICAL ALERT
          </button>

          <div className="clin-user-block">
            <div className="clin-user-info">
              <div className="clin-user-name">Dr. Alexander Vance</div>
              <div className="clin-user-role">CHIEF CARDIOLOGIST • ROOM 402</div>
            </div>
            <div className="clin-avatar-wrap">
              <div className="clin-avatar">AV</div>
              <div className="clin-avatar-status" />
            </div>
          </div>

          <button type="button" className="clin-bell-btn">
            <Ic d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={14} />
          </button>
        </div>
      </header>

      <div className="clin-body">
        <aside className="clin-queue">
          <div className="clin-queue-header">
            <div className="clin-queue-title">
              <Ic d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={14} color="#3b82f6" />
              Patient Queue
            </div>
            <span className="clin-queue-count">14 Waiting</span>
          </div>

          <div className="clin-queue-list">
            {patients.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPatient(p.id)}
                className={`clin-patient-btn${selectedPatient === p.id ? " active" : ""}`}
              >
                <div className="clin-patient-btn-top">
                  <span className="clin-patient-name">{p.name}</span>
                  <PriorityBadge p={p.priority} />
                </div>
                <div className="clin-patient-btn-bottom">
                  <span className="clin-patient-meta">ID: {p.id}</span>
                  <span className="clin-patient-wait">
                    <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={10} /> {p.waitTime}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="clin-emergency-section">
            <div className="clin-emergency-label">INCOMING EMERGENCIES</div>
            <div className="clin-emergency-card">
              <span className="clin-emergency-icon">⊙</span>
              <div className="clin-emergency-info">
                <div className="clin-emergency-title">MVA - Chest Trauma</div>
                <div className="clin-emergency-sub">Ambulance Bay B</div>
              </div>
              <span className="clin-emergency-time">00:02</span>
            </div>
          </div>

          <button type="button" className="clin-walkin-btn">+ Add Walk-in Patient</button>
        </aside>

        <main className="clin-main">
          <div className="clin-card">
            <div className="clin-patient-header">
              <div className="clin-patient-header-left">
                <div className="clin-patient-avatar-lg">SJ</div>
                <div>
                  <h2 className="clin-patient-title">Sarah Jenkins</h2>
                  <div className="clin-patient-demographics">
                    Female, 34 yrs &nbsp;|&nbsp; DOB: 12/04/1990 &nbsp;|&nbsp; ID: PX-99201
                  </div>
                </div>
              </div>
              <div className="clin-patient-actions">
                <button type="button" className="clin-btn-secondary">
                  <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={13} />
                  Past Encounters
                </button>
                <button type="button" className="clin-btn-primary">✓ Finalize Visit</button>
              </div>
            </div>
            <div className="clin-last-seen">Last seen by: Dr. Marcus (PCP) on Feb 12, 2024</div>
            <div className="clin-tags">
              {["Allergy: Penicillin", "History: Type-1 Diabetes"].map(tag => (
                <span key={tag} className="clin-tag">{tag}</span>
              ))}
            </div>
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
                  Clinical Notes
                </div>
                <button type="button" className="clin-link-btn">Use Template</button>
              </div>
              <textarea
                className="clin-notes-textarea"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div className="clin-notes-footer">
                <span className="clin-autosave">AUTO-SAVED 2M AGO</span>
                <div className="clin-notes-actions">
                  <button type="button" className="clin-btn-ghost">Clear</button>
                  <button type="button" className="clin-btn-save">Append to Record</button>
                </div>
              </div>
            </div>

            <div className="clin-panel">
              <div className="clin-panel-header">
                <div className="clin-panel-title">
                  <Ic d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" size={14} color="#10b981" />
                  Active Digital Orders
                </div>
                <button type="button" onClick={addOrder} className="clin-new-order-btn">+ New Order</button>
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
                    <span className={`clin-order-status ${o.status === "Active" ? "active" : "recent"}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="clin-triage-section">
                <div className="clin-triage-title">
                  <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01" size={13} color="#f59e0b" />
                  Triage Notes & Risks
                </div>
                <div className="clin-triage-box">
                  <p className="clin-triage-text">Elevated risk of ketoacidosis during infectious period.</p>
                  <p className="clin-triage-text">Monitor renal function closely if prescribing diuretics.</p>
                </div>
                <button type="button" className="clin-risk-link">
                  <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" size={12} />
                  View Comprehensive Risk Assessment
                </button>
              </div>
            </div>
          </div>

          <div className="clin-card clin-history-card">
            <div className="clin-history-title">
              <Ic d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={14} color="#8b5cf6" />
              Longitudinal History
            </div>
            <div className="clin-timeline">
              <div className="clin-timeline-line" />
              {history.map((h, i) => (
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
        </main>

        <aside className="clin-sidebar">
          <div>
            <div className="clin-sidebar-header">
              <div className="clin-sidebar-title">
                <Ic d="M10 2v7.31M14 2v7.31M3.5 9.5h17M6.5 13.5h11M4 21l.5-4.5h15L20 21M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" size={13} color="#06b6d4" />
                Recent Lab Data
              </div>
              <button type="button" className="clin-expand-btn">↗</button>
            </div>
            <div className="clin-lab-list">
              {labResults.map(lr => {
                const statusCls = labStatusClass(lr.status);
                return (
                  <div key={lr.name} className="clin-lab-card">
                    <div className="clin-lab-top">
                      <span className="clin-lab-name">{lr.name}</span>
                      <span className={`clin-lab-value ${statusCls}`}>
                        {lr.value}<span className="clin-lab-unit">{lr.unit}</span>
                      </span>
                    </div>
                    <div className={`clin-lab-status ${statusCls}`}>{lr.status}</div>
                    <Sparkline data={lr.trend} color={lr.status === "NORMAL" ? "#22c55e" : "#60a5fa"} />
                  </div>
                );
              })}
            </div>
            <button type="button" className="clin-view-all-btn">View All Results (12) →</button>
          </div>

          <div>
            <div className="clin-sidebar-title clin-diagnostics-title">
              <Ic d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" size={13} color="#8b5cf6" />
              Order Diagnostics
            </div>
            <div className="clin-diagnostics-grid">
              {diagnostics.map(d => (
                <button key={d} type="button" className="clin-diagnostic-btn">
                  <Ic d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18" size={16} color="#3b82f6" />
                  {d}
                </button>
              ))}
            </div>
            <button type="button" className="clin-send-lab-btn">2 PENDING REQUESTS — Send to Lab</button>
          </div>

          <div className="clin-referral-card">
            <div className="clin-referral-icon-wrap">
              <Ic d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={20} />
            </div>
            <div className="clin-referral-title">Specialist Referral</div>
            <div className="clin-referral-desc">
              Instantly refer Sarah to Cardiology, Nephrology, or Diabetes Education.
            </div>
            <button type="button" className="clin-referral-btn">Create Referral</button>
          </div>
        </aside>
      </div>

      <button type="button" className="clin-fab">⚠</button>
    </div>
  );
}
