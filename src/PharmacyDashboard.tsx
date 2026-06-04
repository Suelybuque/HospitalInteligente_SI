import { useState } from "react";
import "./PharmacyDashboard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = "Stable" | "Low Stock" | "Verified" | "Pending";

interface Prescription {
  id: string;
  patient: string;
  medication: string;
  time: string;
}

interface InventoryItem {
  name: string;
  sub: string;
  batchId: string;
  batchAlert: boolean;
  category: string;
  quantity: number;
  status: StockStatus;
}

interface ChecklistItem {
  label: string;
  checked: boolean;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const prescriptions: Prescription[] = [
  { id: "rx1", patient: "Michael R. Thompson", medication: "Atorvastatin 20mg (30 Tabs)", time: "12:45 PM" },
  { id: "rx2", patient: "Elena Rodriguez", medication: "Amoxicillin 500mg (21 Caps)", time: "01:10 PM" },
  { id: "rx3", patient: "Samuel L. Jackson", medication: "Lisinopril 10mg (90 Tabs)", time: "01:22 PM" },
];

const initialInventory: InventoryItem[] = [
  { name: "Atorvastatin 20mg", sub: "Cholesterol Management", batchId: "#BAT-4491-01", batchAlert: false, category: "Cardio", quantity: 1240, status: "Stable" },
  { name: "Metformin 500mg", sub: "Antidiabetic medication", batchId: "#BAT-9902-12", batchAlert: true, category: "Endocrine", quantity: 24, status: "Low Stock" },
  { name: "Amoxicillin 250mg", sub: "Broad-spectrum Antibiotic", batchId: "#BAT-1102-09", batchAlert: false, category: "Antibiotics", quantity: 415, status: "Verified" },
  { name: "Lisinopril 10mg", sub: "ACE Inhibitor / BP", batchId: "#BAT-3382-05", batchAlert: false, category: "Cardio", quantity: 88, status: "Pending" },
  { name: "Alprazolam 0.5mg", sub: "Schedule IV Controlled", batchId: "#BAT-0021-99", batchAlert: true, category: "Psychiatry", quantity: 12, status: "Low Stock" },
];

const initialChecklist: ChecklistItem[] = [
  { label: "Confirm patient identity via Photo ID", checked: true },
  { label: "Validate prescribing doctor credentials", checked: true },
  { label: "Cross-reference with active allergy list", checked: true },
  { label: "Counseling session completed (New script)", checked: false },
];

const statusClassMap: Record<StockStatus, string> = {
  Stable: "stable",
  "Low Stock": "low-stock",
  Verified: "verified",
  Pending: "pending",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: StockStatus }) => {
  const icon = status === "Low Stock" ? "⚠" : status === "Pending" ? "○" : "✓";
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

export default function PharmFlowDashboard() {
  const [selectedRx, setSelectedRx] = useState<string>("rx1");
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [dispensed, setDispensed] = useState(false);
  const [activeNav, setActiveNav] = useState("rx");

  const allChecked = checklist.every(c => c.checked);

  const toggleCheck = (i: number) => {
    setChecklist(prev => prev.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c));
  };

  const handleDispense = () => {
    if (!allChecked) return;
    setDispensed(true);
    setTimeout(() => setDispensed(false), 2000);
  };

  const handleAddStock = () => {
    const newItem: InventoryItem = {
      name: "New Medication",
      sub: "Category TBD",
      batchId: `#BAT-${Math.floor(Math.random() * 9000 + 1000)}-00`,
      batchAlert: false,
      category: "General",
      quantity: 100,
      status: "Pending",
    };
    setInventory(prev => [newItem, ...prev]);
  };

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
    { id: "info", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    )},
  ];

  return (
    <div className="pharm-dashboard">
      <nav className="pharm-sidebar">
        {navItems.map(n => (
          <button
            key={n.id}
            onClick={() => setActiveNav(n.id)}
            className={`pharm-nav-btn${activeNav === n.id ? " active" : ""}`}
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
              PharmFlow <span className="pharm-logo-accent">Pro</span>
            </span>
          </div>

          <div className="pharm-search">
            <SearchIcon />
            <span className="pharm-search-placeholder">Search medication, patient ID, or batch...</span>
          </div>

          <div className="pharm-header-actions">
            <button type="button" className="pharm-bell-btn">
              <BellIcon />
            </button>
            <div className="pharm-user-block">
              <div className="pharm-user-info">
                <div className="pharm-user-name">Dr. Sarah Jenkins</div>
                <div className="pharm-user-role">Chief Pharmacist</div>
              </div>
              <div className="pharm-avatar-wrap">
                <div className="pharm-avatar">SJ</div>
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
                Prescription Workflow
              </div>
              <span className="pharm-badge-active">4 ACTIVE SCRIPTS</span>
            </div>

            <div className="pharm-rx-queue">
              {prescriptions.map(rx => {
                const active = selectedRx === rx.id;
                return (
                  <button
                    key={rx.id}
                    type="button"
                    onClick={() => setSelectedRx(rx.id)}
                    className={`pharm-rx-card${active ? " active" : ""}`}
                  >
                    <div className="pharm-rx-icon">
                      <DocIcon active={active} />
                    </div>
                    <div className="pharm-rx-info">
                      <div className="pharm-rx-patient">{rx.patient}</div>
                      <div className="pharm-rx-medication">{rx.medication}</div>
                    </div>
                    <div className="pharm-rx-meta">
                      <span className="pharm-rx-time">{rx.time}</span>
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
                Verification Details
              </div>
              <p className="pharm-card-desc">
                Verify patient data and contraindications before dispensing.
              </p>

              <div className="pharm-patient-card">
                <div className="pharm-patient-avatar">MT</div>
                <div className="pharm-patient-grid">
                  <div>
                    <div className="pharm-field-label">Patient ID</div>
                    <div className="pharm-field-value">#PAT-882190</div>
                  </div>
                  <div>
                    <div className="pharm-field-label">DOB</div>
                    <div className="pharm-field-value">May 12, 1978 (45y)</div>
                  </div>
                  <div className="pharm-field-full">
                    <div className="pharm-field-label pharm-field-label-spaced">Known Allergies</div>
                    <div className="pharm-allergies">Sulfa, Shellfish</div>
                  </div>
                </div>
              </div>

              <div className="pharm-checklist-section">
                <div className="pharm-checklist-heading">Compliance Checklist</div>
                <div className="pharm-checklist">
                  {checklist.map((item, i) => (
                    <label key={i} className="pharm-checklist-item">
                      <div className="pharm-checklist-row">
                        <div
                          role="checkbox"
                          aria-checked={item.checked}
                          tabIndex={0}
                          onClick={() => toggleCheck(i)}
                          onKeyDown={e => { if (e.key === " " || e.key === "Enter") toggleCheck(i); }}
                          className={`pharm-checkbox${item.checked ? " checked" : ""}`}
                        >
                          {item.checked && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span className={`pharm-checklist-label${item.checked ? " checked" : ""}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.checked && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pharm-card pharm-dispense-card">
              <div className="pharm-stock-row">
                <span className="pharm-stock-label">Current Stock Status</span>
                <span className="pharm-status-verified">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Verified
                </span>
              </div>
              <button type="button" onClick={handleDispense} className={dispenseBtnClass}>
                {dispensed ? "✓ Dispensed!" : "Dispense Medication"}
              </button>
              {!allChecked && (
                <p className="pharm-dispense-hint">
                  Complete all checklist items to enable dispensing
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
                Inventory & Stock Management
              </div>
              <div className="pharm-inventory-actions">
                <button type="button" className="pharm-btn-secondary">
                  <FilterIcon /> Filter
                </button>
                <button type="button" onClick={handleAddStock} className="pharm-btn-primary">
                  <PlusIcon /> Add Stock
                </button>
              </div>
            </div>

            <div className="pharm-table">
              <div className="pharm-table-head">
                {["Medication Name", "Batch ID", "Category", "Quantity", "Status"].map(h => (
                  <span key={h} className="pharm-table-head-cell">{h}</span>
                ))}
              </div>

              {inventory.map((item, i) => (
                <div
                  key={i}
                  className={`pharm-table-row${item.status === "Low Stock" ? " low-stock" : ""}`}
                >
                  <div>
                    <div className="pharm-med-name">{item.name}</div>
                    <div className="pharm-med-sub">{item.sub}</div>
                  </div>
                  <div className={`pharm-batch-id${item.batchAlert ? " alert" : ""}`}>
                    {item.batchId}
                  </div>
                  <div>
                    <span className="pharm-category-tag">{item.category}</span>
                  </div>
                  <div className={`pharm-quantity${item.quantity < 30 ? " low" : ""}`}>
                    {item.quantity.toLocaleString()}
                  </div>
                  <div><StatusBadge status={item.status} /></div>
                </div>
              ))}

              <div className="pharm-table-footer">
                <span className="pharm-table-footer-text">
                  Showing {inventory.length} of 1,248 medication entries
                </span>
                <div className="pharm-pagination">
                  {["Previous", "Next"].map(label => (
                    <button key={label} type="button" className="pharm-page-btn">{label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pharm-stats">
              {[
                { value: "12", label: "LOW STOCK ALERTS", icon: "⚠", iconClass: "alert" },
                { value: "142", label: "VERIFIED TODAY", icon: "✓", iconClass: "success" },
                { value: "09m", label: "AVG DISPENSE TIME", icon: "◷", iconClass: "info" },
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
