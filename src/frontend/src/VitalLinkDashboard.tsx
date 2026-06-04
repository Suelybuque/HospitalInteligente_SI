import { useState, type ReactElement } from "react";
import "./VitalLinkDashboard.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LabResult {
  testName: string;
  date: string;
  provider: string;
  status: "Normal" | "High" | "Low" | "Pending";
}

interface Prescription {
  name: string;
  dose: string;
  schedule: string;
  taken: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const labResults: LabResult[] = [
  { testName: "Complete Blood Count (CBC)", date: "Oct 15, 2023", provider: "General Lab", status: "Normal" },
  { testName: "Lipid Panel", date: "Oct 15, 2023", provider: "General Lab", status: "Normal" },
  { testName: "HbA1c (Diabetes Screen)", date: "Oct 15, 2023", provider: "Metabolic Clinic", status: "High" },
  { testName: "Vitamin D, 25-Hydroxy", date: "Sep 22, 2023", provider: "General Lab", status: "Normal" },
  { testName: "Thyroid Stimulating Hormone", date: "Sep 22, 2023", provider: "Endocrinology Dept", status: "Pending" },
];

const prescriptions: Prescription[] = [
  { name: "Lisinopril", dose: "10mg", schedule: "Morning", taken: true },
  { name: "Atorvastatin", dose: "20mg", schedule: "Evening", taken: false },
  { name: "Multivitamin", dose: "1 Capsule", schedule: "Morning", taken: true },
];

const navItems = [
  { label: "Dashboard", icon: "grid", active: true },
  { label: "Medical Records", icon: "file-text", active: false },
  { label: "Appointments", icon: "calendar", active: false },
  { label: "Prescriptions", icon: "pill", active: false },
  { label: "Lab Results", icon: "flask", active: false },
  { label: "Billing & Pay", icon: "credit-card", active: false },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const icons: Record<string, ReactElement> = {
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    droplet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    weight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="5" r="3" /><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.46A2 2 0 0 0 17.5 8z" /></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    mappin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}><polyline points="20 6 9 17 4 12" /></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    "file-text": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    pill: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" /><circle cx="18" cy="18" r="4" /><path d="m15.5 15.5 5 5" /></svg>,
    flask: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9 3h6l1 9H8L9 3z" /><path d="M6.8 15a5 5 0 1 0 10.4 0" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    "credit-card": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    support: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    leaf: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  };
  return icons[name] || <span />;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const VitalCard = ({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
}) => (
  <div className="vital-card">
    <div className="vital-card-header">
      <span className="vital-card-tag">General</span>
      <div
        className="vital-card-icon"
        style={{
          background: color + "18",
          color: color,
        }}
      >
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

const StatusBadge = ({ status }: { status: LabResult["status"] }) => {
  const map: Record<string, { bg: string; color: string }> = {
    Normal: { bg: "#dcfce7", color: "#15803d" },
    High: { bg: "#fee2e2", color: "#dc2626" },
    Low: { bg: "#fef9c3", color: "#854d0e" },
    Pending: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[status] || map.Pending;
  return (
    <span
      className="status-badge"
      style={{
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VitalLinkDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [prescriptionState, setPrescriptionState] = useState<Prescription[]>(prescriptions);

  const markTaken = (i: number) => {
    setPrescriptionState(prev => prev.map((p, idx) => idx === i ? { ...p, taken: true } : p));
  };

  const takenCount = prescriptionState.filter(p => p.taken).length;
  const progress = Math.round((takenCount / prescriptionState.length) * 100);

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo-container">
          <div className="sidebar-logo-icon">
            <Icon name="activity" size={16} />
          </div>
          <span className="sidebar-logo-text">VitalLink</span>
        </div>

        {/* Nav */}
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

          <div className="sidebar-section-title">
            Account Settings
          </div>
          {[
            { label: "Notifications", icon: "bell" },
            { label: "Profile Settings", icon: "settings" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`sidebar-nav-btn ${activeNav === item.label ? "active" : ""}`}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn">
            <Icon name="support" size={16} /> Support Center
          </button>
          <button className="sidebar-footer-btn">
            <Icon name="logout" size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content-wrapper">
        {/* Top bar */}
        <header className="topbar">
          <div className="search-bar">
            <Icon name="search" size={15} />
            <span>Search medical records, doctors, or results...</span>
          </div>
          <div className="topbar-right">
            <div className="notification-container">
              <button className="notification-btn">
                <Icon name="bell" size={16} />
              </button>
              <span className="notification-badge">3</span>
            </div>
            <div className="user-profile">
              <div className="user-info">
                <div className="user-name">Jonathan Doe</div>
                <div className="user-id">Patient ID: #88291</div>
              </div>
              <div className="user-avatar">JD</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="main-content">
          {/* Greeting */}
          <div className="greeting-container">
            <div>
              <h1 className="greeting-title">Good morning, Jonathan!</h1>
              <p className="greeting-subtitle">Welcome back to your health portal. Here is what's happening today.</p>
            </div>
            <div className="greeting-date">
              <Icon name="calendar" size={14} />
              Wednesday, October 22, 2023
            </div>
          </div>

          {/* Vitals row */}
          <div className="vitals-row">
            <VitalCard icon="heart" label="Recent Heart Rate" value="72 BPM" sub="Measured 1 hour ago during morning check." color="#ef4444" />
            <VitalCard icon="droplet" label="Blood Glucose" value="98 mg/dL" sub="Stabilized within the recommended range." color="#3b82f6" />
            <VitalCard icon="activity" label="Blood Pressure" value="120/80" sub="Excellent. No changes from last month." color="#10b981" />
            <VitalCard icon="weight" label="Weight Progress" value="182 lbs" sub="Down 2 lbs since your last wellness check." color="#8b5cf6" />
          </div>

          {/* Two-column lower section */}
          <div className="dashboard-grid">
            {/* Left column */}
            <div className="grid-left-col">
              {/* Next appointment */}
              <div className="card appointment-card">
                <div className="appointment-card-header">
                  <div className="appointment-header-title">
                    <Icon name="calendar" size={15} /> Next Appointment
                  </div>
                  <span className="appointment-badge">In 2 Days</span>
                </div>
                <div className="appointment-body">
                  <div className="appointment-avatar">SJ</div>
                  <div className="appointment-details">
                    <div className="appointment-doctor">Dr. Sarah Jenkins</div>
                    <div className="appointment-specialty">Senior Cardiologist • Heart Health Center</div>
                    <div className="appointment-meta">
                      <span className="meta-item"><Icon name="calendar" size={13} /> Thursday, Oct 24 • 10:30 AM</span>
                      <span className="meta-item"><Icon name="mappin" size={13} /> Building B, 4th Floor, Room 402</span>
                    </div>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button className="btn btn-primary">View Details</button>
                  <button className="btn btn-secondary">Reschedule</button>
                </div>
              </div>

              {/* Lab results */}
              <div className="card lab-results-card">
                <div className="lab-results-header">
                  <div>
                    <div className="card-title">Recent Lab Results</div>
                    <div className="card-subtitle">Visual summary of your most recent diagnostic tests.</div>
                  </div>
                  <button className="btn-download">
                    <Icon name="download" size={13} /> Download All PDF
                  </button>
                </div>
                <table className="results-table">
                  <thead>
                    <tr className="table-header-row">
                      {["Test Name", "Date", "Provider", "Result Status", "Action"].map(h => (
                        <th key={h} className="table-header-cell">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map((r, i) => (
                      <tr key={i} className="table-body-row">
                        <td className="table-cell test-name">{r.testName}</td>
                        <td className="table-cell test-date">{r.date}</td>
                        <td className="table-cell test-provider">{r.provider}</td>
                        <td className="table-cell"><StatusBadge status={r.status} /></td>
                        <td className="table-cell">
                          <button className="btn-link">View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="grid-right-col">
              {/* Billing */}
              <div className="card billing-card">
                <div className="card-title-with-icon">
                  <Icon name="credit-card" size={16} /> Billing Summary
                </div>
                <div className="billing-balance-box">
                  <div className="balance-label">Outstanding Balance</div>
                  <div className="balance-amount">$124.50</div>
                </div>
                {[
                  { label: "General Consult Fee", amount: "$85.00" },
                  { label: "Laboratory Tests", amount: "$39.50" },
                ].map(item => (
                  <div key={item.label} className="billing-item">
                    <span>{item.label}</span><span>{item.amount}</span>
                  </div>
                ))}
                <div className="billing-total-row">
                  <span>Total Due</span><span className="total-amount">$124.50</span>
                </div>
                <button className="btn btn-primary btn-full-width">Pay Outstanding Bill</button>
                <div className="billing-due-date">
                  <Icon name="clock" size={11} /> Due by Oct 30, 2023
                </div>
              </div>

              {/* Prescription adherence */}
              <div className="card adherence-card">
                <div className="adherence-header">
                  <div className="card-title-with-icon">
                    <Icon name="pill" size={16} /> Prescription Adherence
                  </div>
                  <span className="adherence-progress-text">Today's Progress: <b className="bold-text">{progress}%</b></span>
                </div>
                {/* Progress bar */}
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                {prescriptionState.map((p, i) => (
                  <div key={p.name} className="prescription-item">
                    <div className={`prescription-status-icon ${p.taken ? "taken" : ""}`}>
                      {p.taken
                        ? <Icon name="check" size={14} />
                        : <Icon name="clock" size={14} />
                      }
                    </div>
                    <div className="prescription-info">
                      <div className="prescription-name">{p.name}</div>
                      <div className="prescription-details">{p.dose} • {p.schedule}</div>
                    </div>
                    {p.taken
                      ? <span className="prescription-taken-label">Taken</span>
                      : (
                        <button
                          onClick={() => markTaken(i)}
                          className="btn-mark-taken"
                        >Mark Taken</button>
                      )
                    }
                  </div>
                ))}
                <button className="btn-link mt-10">
                  Manage all prescriptions
                </button>
              </div>

              {/* Health tip */}
              <div className="health-tip-card">
                <div className="health-tip-icon-box">
                  <Icon name="leaf" size={15} />
                </div>
                <div>
                  <div className="health-tip-title">Health Tip of the Day</div>
                  <div className="health-tip-content">
                    Stay hydrated! Drinking at least 8 glasses of water today can help lower your cortisol levels and improve cognitive function.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
