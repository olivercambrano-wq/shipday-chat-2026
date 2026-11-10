
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

const FOCUS_RING = "0 0 0 2px rgba(0,128,98,0.3)";

// ── Greeting ──────────────────────────────────────────────────────────────
const GREETINGS = [
  "How can I help today?",
  "What's on your mind?",
  "Let's grow your restaurant",
  "Ready to help",
  "What would you like to launch?",
];
// greeting picked inside component via useRef to avoid SSR mismatch

// ── Suggestion chips ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Create an SMS campaign",
  "How are my campaigns doing?",
  "Show pending approvals",
  "What's my budget this month?",
];

// ── Types ─────────────────────────────────────────────────────────────────
interface Msg {
  role: "user" | "assistant";
  text: string | null;
  card?: () => React.ReactNode;
  followUps?: string[];
  time?: string;
}

interface ChatRecord {
  id: number;
  title: string;
  date: string;
}

// ── Inline card components ────────────────────────────────────────────────

function StatsRow({ stats }: { stats: { label: string; value: string; change?: string; positive?: boolean }[] }) {
  const t = useTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 8 }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          padding: "14px 14px", borderRadius: 12,
          background: "transparent", border: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted }}>{s.label}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginTop: 2 }}>{s.value}</span>
          {s.change && (
            <span style={{ fontSize: 14, fontWeight: 600, marginTop: 2, color: s.positive === true ? "#16a34a" : s.positive === false ? "#dc2626" : t.textMuted }}>
              {s.change}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function MiniBarChart({ title, data, height = 120 }: { title?: string; data: { label: string; value: number; highlight?: boolean }[]; height?: number }) {
  const t = useTheme();
  const max = Math.max(...data.map((d) => d.value));
  const vw = 400, pad = 12, gap = 8;
  const usable = vw - pad * 2;
  const barW = (usable - gap * (data.length - 1)) / data.length;
  const chartH = height - 28;
  return (
    <div style={{ padding: "14px 16px 12px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 10 }}>{title}</div>}
      <svg width="100%" height={height} viewBox={`0 0 ${vw} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        {data.map((d, i) => {
          const barH = max > 0 ? (d.value / max) * chartH : 0;
          const x = pad + i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barW} height={barH} rx={barW > 16 ? 6 : 4}
                fill={d.highlight ? t.accent : t.mode === "dark" ? "rgba(255,255,255,0.12)" : "#D8D8D4"} />
              <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize={13} fontWeight={500} fill={t.textMuted}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CardInput({ label, value, onChange, multiline, t }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; t: ReturnType<typeof useTheme> }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, fontSize: 14, color: t.text, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: "150%", transition: "border-color 0.15s" }}
          onFocus={e => { e.currentTarget.style.borderColor = t.accent; }}
          onBlur={e => { e.currentTarget.style.borderColor = t.border; }}
        />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, fontSize: 14, color: t.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
          onFocus={e => { e.currentTarget.style.borderColor = t.accent; }}
          onBlur={e => { e.currentTarget.style.borderColor = t.border; }}
        />
      )}
    </div>
  );
}

function CardBtn({ label, variant, onClick, t }: { label: string; variant: "primary" | "secondary" | "ghost"; onClick: () => void; t: ReturnType<typeof useTheme> }) {
  const styles = {
    primary:   { height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", transition: "opacity 120ms ease" } as React.CSSProperties,
    secondary: { height: 36, padding: "0 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: "transparent", fontSize: 14, fontWeight: 500, color: t.textSecondary, cursor: "pointer", fontFamily: "inherit", transition: "background 120ms ease" } as React.CSSProperties,
    ghost:     { height: 36, padding: "0 14px", borderRadius: 12, border: "none", background: "transparent", fontSize: 14, fontWeight: 500, color: t.textMuted, cursor: "pointer", fontFamily: "inherit", transition: "color 120ms ease" } as React.CSSProperties,
  };
  return (
    <button onClick={onClick} style={styles[variant]}
      onMouseEnter={e => { if (variant === "primary") e.currentTarget.style.opacity = "0.88"; else if (variant === "secondary") e.currentTarget.style.background = t.surfaceHover; else e.currentTarget.style.color = t.textSecondary; }}
      onMouseLeave={e => { if (variant === "primary") e.currentTarget.style.opacity = "1"; else if (variant === "secondary") e.currentTarget.style.background = "transparent"; else e.currentTarget.style.color = t.textMuted; }}
    >{label}</button>
  );
}

function DoneBadge({ label, t }: { label: string; t: ReturnType<typeof useTheme> }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: t.accentLight }}>
      <Icon name="check_circle" size={16} color={t.accent} fill />
      <span style={{ fontSize: 14, fontWeight: 600, color: t.accent }}>{label}</span>
    </div>
  );
}

function ApprovableCampaign({ name, type, detail, time, icon }: { name: string; type: string; detail: string; time: string; icon: string }) {
  const t = useTheme();
  const [status, setStatus] = useState<"pending" | "editing" | "approved" | "dismissed">("pending");
  const [msg, setMsg] = useState(detail);

  if (status === "approved" || status === "dismissed") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, opacity: status === "dismissed" ? 0.5 : 1, transition: "all 200ms ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {time}</div>
          </div>
          <Icon name={status === "approved" ? "check_circle" : "block"} size={22} color={status === "approved" ? t.accent : t.textMuted} fill={status === "approved"} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10, transition: "all 200ms ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {time}</div>
        </div>
      </div>
      {status === "editing" ? (
        <CardInput label="Message" value={msg} onChange={setMsg} multiline t={t} />
      ) : (
        <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>
          &ldquo;{msg}&rdquo;
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <CardBtn label={status === "editing" ? "Cancel" : "Edit"} variant="secondary" onClick={() => setStatus(status === "editing" ? "pending" : "editing")} t={t} />
        <CardBtn label={status === "editing" ? "Save & approve" : "Approve"} variant="primary" onClick={() => setStatus("approved")} t={t} />
      </div>
    </div>
  );
}

function CouponProposal({ code: initCode, discount: initDiscount, description: initDesc }: { code: string; discount: string; description: string }) {
  const t = useTheme();
  const [status, setStatus] = useState<"pending" | "editing" | "created" | "skipped">("pending");
  const [code, setCode] = useState(initCode);
  const [discount, setDiscount] = useState(initDiscount);
  const [desc, setDesc] = useState(initDesc);

  if (status === "created" || status === "skipped") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, opacity: status === "skipped" ? 0.5 : 1, transition: "all 200ms ease" }}>
        <DoneBadge label={status === "created" ? "Code created" : "Skipped"} t={t} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sell" size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "0.04em" }}>{code}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{discount} · {desc}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10, transition: "all 200ms ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="sell" size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {status === "editing" ? null : (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "0.04em" }}>{code}</div>
              <div style={{ fontSize: 14, color: t.textMuted }}>{discount} · {desc}</div>
            </>
          )}
        </div>
      </div>
      {status === "editing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><CardInput label="Code" value={code} onChange={setCode} t={t} /></div>
            <div style={{ flex: 1 }}><CardInput label="Discount" value={discount} onChange={setDiscount} t={t} /></div>
          </div>
          <CardInput label="Description" value={desc} onChange={setDesc} t={t} />
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <CardBtn label={status === "editing" ? "Cancel" : "Edit"} variant="secondary" onClick={() => setStatus(status === "editing" ? "pending" : "editing")} t={t} />
        <CardBtn label={status === "editing" ? "Save & create" : "Create code"} variant="primary" onClick={() => setStatus("created")} t={t} />
      </div>
    </div>
  );
}

function CampaignProposal({ name: initName, type, icon, audience: initAudience, schedule: initSchedule, preview: initPreview }: {
  name: string; type: string; icon: string; audience: string; schedule: string; preview: string;
}) {
  const t = useTheme();
  const [status, setStatus] = useState<"draft" | "editing" | "launched" | "discarded">("draft");
  const [name, setName] = useState(initName);
  const [preview, setPreview] = useState(initPreview);
  const [audience, setAudience] = useState(initAudience);
  const [schedule, setSchedule] = useState(initSchedule);

  if (status === "discarded") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, opacity: 0.5, transition: "all 200ms ease" }}>
        <DoneBadge label="Discarded" t={t} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{type}</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "launched") {
    return (
      <div style={{ padding: "16px 18px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 14, transition: "all 200ms ease" }}>
        <DoneBadge label="Campaign scheduled" t={t} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-0.01em" }}>{name}</div>
          <div style={{ fontSize: 14, color: t.textMuted, marginTop: 3 }}>{type}</div>
        </div>
        <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>
          &ldquo;{preview}&rdquo;
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10, transition: "all 200ms ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {status === "editing" ? null : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
              <div style={{ fontSize: 14, color: t.textMuted }}>{type}</div>
            </>
          )}
        </div>
      </div>
      {status === "editing" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <CardInput label="Campaign name" value={name} onChange={setName} t={t} />
          <CardInput label="Message" value={preview} onChange={setPreview} multiline t={t} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><CardInput label="Audience" value={audience} onChange={setAudience} t={t} /></div>
            <div style={{ flex: 1 }}><CardInput label="Schedule" value={schedule} onChange={setSchedule} t={t} /></div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>
            &ldquo;{preview}&rdquo;
          </div>
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <CardBtn label={status === "editing" ? "Cancel" : "Edit"} variant="secondary" onClick={() => setStatus(status === "editing" ? "draft" : "editing")} t={t} />
        <CardBtn label={status === "editing" ? "Save & launch" : "Launch"} variant="primary" onClick={() => setStatus("launched")} t={t} />
      </div>
    </div>
  );
}

function ReadOnlyCampaign({ name, type, icon, meta, status }: { name: string; type: string; icon: string; meta: string; status: string }) {
  const t = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={20} color={t.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {meta}</div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, flexShrink: 0 }}>{status}</span>
    </div>
  );
}

function PausableCampaign({ name, type, icon, meta }: { name: string; type: string; icon: string; meta: string }) {
  const t = useTheme();
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, opacity: paused ? 0.55 : 1, transition: "all 200ms ease" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: paused ? t.bgTertiary : t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={paused ? "pause" : icon} size={20} color={paused ? t.textMuted : t.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {meta}</div>
      </div>
      <CardBtn label={paused ? "Resume" : "Pause"} variant={paused ? "primary" : "secondary"} onClick={() => setPaused(p => !p)} t={t} />
    </div>
  );
}

function BudgetPicker() {
  const t = useTheme();
  const [selected, setSelected] = useState("$250");
  const [confirmed, setConfirmed] = useState(false);
  const options = [
    { value: "$100", label: "$100/mo", desc: "1–2 campaigns" },
    { value: "$250", label: "$250/mo", desc: "4–6 campaigns", popular: true },
    { value: "$500", label: "$500/mo", desc: "10+ campaigns" },
  ];
  if (confirmed) {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <DoneBadge label={`Budget updated to ${selected}/mo`} t={t} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {options.map(o => {
          const sel = selected === o.value;
          return (
            <button key={o.value} onClick={() => setSelected(o.value)} style={{
              padding: "14px 12px", borderRadius: 12, border: `1px solid ${sel ? t.accent : t.border}`,
              background: sel ? t.accentLight : "transparent", cursor: "pointer", fontFamily: "inherit",
              textAlign: "left", transition: "all 150ms ease", position: "relative",
            }}>
              {o.popular && <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 700, color: "#FFFFFF", background: t.accent, padding: "1px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>Current</div>}
              <div style={{ fontSize: 16, fontWeight: 700, color: sel ? t.accent : t.text }}>{o.label}</div>
              <div style={{ fontSize: 14, color: t.textMuted, marginTop: 2 }}>{o.desc}</div>
            </button>
          );
        })}
      </div>
      <CardBtn label={`Confirm ${selected}/mo`} variant="primary" onClick={() => setConfirmed(true)} t={t} />
    </div>
  );
}

// ── Print order templates ─────────────────────────────────────────────────
const PRINT_TEMPLATES = [
  { id: "order-direct",     name: "Order direct",      bg: "#F5D5C8", headline: "ORDER DIRECT FROM US",           accent: "#008062" },
  { id: "weekend-special",  name: "Weekend special",    bg: "#FDE68A", headline: "WEEKEND SPECIALS",               accent: "#B45309" },
  { id: "loyalty-program",  name: "Loyalty program",    bg: "#DBEAFE", headline: "JOIN OUR LOYALTY PROGRAM",       accent: "#2563EB" },
  { id: "free-delivery",    name: "Free delivery",      bg: "#D1FAE5", headline: "FREE DELIVERY",                  accent: "#059669" },
];

function TemplateSelector({ onSelect }: { onSelect: (name: string) => void }) {
  const t = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  if (selected) {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <DoneBadge label={`Selected: ${selected}`} t={t} />
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {PRINT_TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => { setSelected(tpl.name); onSelect(tpl.name); }}
          style={{
            display: "flex", flexDirection: "column", overflow: "hidden",
            borderRadius: 12, border: `1px solid ${t.border}`, cursor: "pointer",
            background: "transparent", fontFamily: "inherit", textAlign: "left",
            transition: "border-color 150ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
        >
          {/* Mini preview */}
          <div style={{ height: 80, background: tpl.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: tpl.accent, textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: "130%", textAlign: "center" }}>{tpl.headline}</span>
          </div>
          {/* Label */}
          <div style={{ padding: "10px 12px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{tpl.name}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

const PRINT_QUANTITIES: Record<string, { count: number; price: string; priceNum: number }> = {
  "250 flyers — $85":    { count: 250,  price: "$85.00",  priceNum: 85 },
  "500 flyers — $160":   { count: 500,  price: "$160.00", priceNum: 160 },
  "1,000 flyers — $280": { count: 1000, price: "$280.00", priceNum: 280 },
};

const FORMAT_TO_CHANNEL: Record<string, string> = {
  "Counter card 4×6": "instore",
  "Bag insert 4×6": "instore",
};

function PrintOrderSummary({ format, quantity, onPlaceOrder, t }: {
  format: string; quantity: string;
  onPlaceOrder: () => void;
  t: ReturnType<typeof useTheme>;
}) {
  const [ordered, setOrdered] = useState(false);
  const q = PRINT_QUANTITIES[quantity] ?? { count: 500, price: "$160.00", priceNum: 160 };
  const discount = Math.round(q.priceNum * 0.2);
  const total = (q.priceNum - discount).toFixed(2);

  if (ordered) {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, transition: "all 200ms ease" }}>
        <DoneBadge label="Order placed" t={t} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="print" size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Order direct — {format.split(" ")[0].toLowerCase()} card</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{q.count.toLocaleString()} flyers · Ships in 4–5 days</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 18px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="print" size={22} color={t.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Order direct — {format.split(" ")[0].toLowerCase()} card</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{format}</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span style={{ color: t.textMuted }}>Quantity</span>
          <span style={{ fontWeight: 500, color: t.text }}>{q.count.toLocaleString()} flyers</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span style={{ color: t.textMuted }}>Subtotal</span>
          <span style={{ color: t.textMuted, textDecoration: "line-through" }}>{q.price}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span style={{ color: t.accent, fontWeight: 600 }}>Launch discount (20% off)</span>
          <span style={{ color: t.accent, fontWeight: 600 }}>−${discount.toFixed(2)}</span>
        </div>
        <div style={{ height: 1, background: t.border }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}>
          <span style={{ fontWeight: 700, color: t.text }}>Total</span>
          <span style={{ fontWeight: 700, color: t.text }}>${total}</span>
        </div>
      </div>

      {/* Shipping */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>
        <Icon name="local_shipping" size={18} color={t.textMuted} />
        <div style={{ fontSize: 14, color: t.textMuted }}>Ships to your store · 4–5 business days</div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { setOrdered(true); onPlaceOrder(); }} style={{
          flex: 1, height: 44, borderRadius: 12, border: "none",
          background: t.accent, color: "#FFFFFF", fontSize: 15, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", transition: "opacity 120ms ease",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          <Icon name="shopping_cart" size={18} color="#FFFFFF" />
          Place order — ${total}
        </button>
      </div>
    </div>
  );
}

function HelpRow({ icon, label }: { icon: string; label: string }) {
  const t = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <Icon name={icon} size={18} color={t.accent} />
      <span style={{ fontSize: 14, color: t.textSecondary }}>{label}</span>
    </div>
  );
}

function AlertCard({ type = "info", icon, title, text }: { type?: string; icon: string; title?: string; text: string }) {
  const t = useTheme();
  const styles: Record<string, { bg: string; accent: string }> = {
    info:    { bg: t.mode === "dark" ? "rgba(32,142,245,0.1)"  : "#EFF6FF", accent: "#2563EB" },
    warning: { bg: t.mode === "dark" ? "rgba(234,88,12,0.1)"   : "#FFF7ED", accent: "#EA580C" },
    success: { bg: t.mode === "dark" ? "rgba(22,163,74,0.1)"   : "#F0FDF4", accent: "#16A34A" },
  };
  const s = styles[type] ?? styles.info;
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: s.bg, borderLeft: `3px solid ${s.accent}` }}>
      <Icon name={icon} size={18} color={s.accent} weight={400} style={{ marginTop: 1, flexShrink: 0 }} />
      <div>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 3 }}>{title}</div>}
        <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px" }}>{text}</div>
      </div>
    </div>
  );
}

function SummaryCard({ title, children }: { title?: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, borderLeft: `3px solid ${t.accent}` }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>{title}</div>}
      <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "21px" }}>{children}</div>
    </div>
  );
}

// ── Rich replies ──────────────────────────────────────────────────────────
const RICH_REPLIES: Record<string, { text: string | null; card?: () => React.ReactNode; followUps?: string[]; nav?: string }> = {
  stats: {
    text: "Here's how your campaigns performed this week:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Revenue driven", value: "$2,840", change: "↑ 18%", positive: true },
          { label: "Orders",         value: "143",    change: "↑ 12%", positive: true },
          { label: "SMS opens",      value: "61%",    change: "↑ 4%",  positive: true },
        ]} />
        <MiniBarChart title="Campaign revenue by day" data={[
          { label: "Mon", value: 320 },
          { label: "Tue", value: 410 },
          { label: "Wed", value: 380 },
          { label: "Thu", value: 520, highlight: true },
          { label: "Fri", value: 640, highlight: true },
          { label: "Sat", value: 390 },
          { label: "Sun", value: 180 },
        ]} />
      </>
    ),
    followUps: ["Show pending approvals", "Compare with last week"],
  },
  pending: {
    text: "2 campaigns are waiting for your approval:",
    card: () => (
      <>
        <ApprovableCampaign name="Weekend special" type="SMS" icon="sms" detail="Craving something delicious? Get 20% off this weekend only. Order now →" time="Fri 6 PM · 1,240 subscribers" />
        <ApprovableCampaign name="Order direct" type="Tracking page" icon="pageview" detail="Skip the fees — order directly from us and save!" time="Ongoing · all deliveries" />
      </>
    ),
    followUps: ["Create a new campaign", "Show my budget"],
  },
  sms: {
    text: "Here's your SMS campaign performance:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Sent",      value: "1,204" },
          { label: "Open rate", value: "61%",   change: "↑ 8%", positive: true },
          { label: "Orders",    value: "38",     change: "↑ 5",  positive: true },
        ]} />
        <AlertCard type="success" icon="check_circle" title="Best open rate yet" text="This week's SMS hit 61% open rate — well above your 48% average. Consider sending on Thursdays more often." />
      </>
    ),
    followUps: ["Create another SMS campaign", "Show full history"],
  },
  tracking: {
    text: "Your tracking page promotions are running:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Impressions", value: "3,841" },
          { label: "Taps",        value: "612",  change: "16% CTR", positive: true },
          { label: "Orders",      value: "49",   change: "↑ 11%",  positive: true },
        ]} />
        <AlertCard type="info" icon="pageview" title="High-converting slot" text="Customers who see the promo while waiting for delivery convert at 8% — 3× higher than SMS." />
      </>
    ),
    followUps: ["Update the promo offer", "Compare with SMS"],
  },
  budget: {
    text: "Here's your budget for this month:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Budget",  value: "$250" },
          { label: "Spent",   value: "$180", change: "72% used", positive: true },
          { label: "Remaining", value: "$70" },
        ]} />
        <AlertCard type="info" icon="info" title="On track" text="At current pace, you'll finish the month within budget. Your best ROI so far is SMS at $4.20 revenue per $1 spent." />
      </>
    ),
    followUps: ["Increase my budget", "Show ROI breakdown"],
  },
  create: {
    text: "I drafted an SMS campaign based on your best performers:",
    card: () => (
      <CampaignProposal
        name="Weekend special — 20% off"
        type="SMS · 1,240 subscribers"
        icon="sms"
        audience="All subscribers"
        schedule="Friday 6 PM"
        preview="Craving something delicious? Get 20% off your next order this weekend only. Tap to order →"
      />
    ),
    followUps: ["Create a tracking page promo", "Create a coupon code"],
  },
  createTracking: {
    text: "Here's a tracking page promo ready to go:",
    card: () => (
      <CampaignProposal
        name="Order direct & save"
        type="Tracking page · all deliveries"
        icon="pageview"
        audience="All tracking visitors"
        schedule="Starts immediately"
        preview="Skip the fees — order directly from us next time and save on every order!"
      />
    ),
    followUps: ["Create an SMS campaign", "Show my stats"],
  },
  createCoupon: {
    text: "I've prepared a coupon code for you:",
    card: () => (
      <CouponProposal code="WEEKEND20" discount="20% off" description="Valid this weekend · all menu items" />
    ),
    followUps: ["Create another code", "Show active codes"],
  },
  coupon: {
    text: "Here are your active coupon codes:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Active codes", value: "3" },
          { label: "Redemptions", value: "84",  change: "↑ 22%", positive: true },
          { label: "Revenue",     value: "$960", change: "↑ 18%", positive: true },
        ]} />
        <CouponProposal code="SAVE15" discount="15% off" description="New customers only · expires Dec 1" />
      </>
    ),
    followUps: ["Create a new code", "Show top performing codes"],
  },
  approveAll: {
    text: "All pending campaigns have been approved:",
    card: () => (
      <AlertCard type="success" icon="check_circle" title="2 campaigns approved" text="Weekend Special (SMS) goes out Friday 6 PM. Order Direct (Tracking) is now live on all deliveries." />
    ),
    followUps: ["Show my stats", "Create a new campaign"],
  },
  createNeighborhood: {
    text: null,
    card: () => (
      <CampaignProposal
        name="Acquire new customers — postcard"
        type="Postcard 5×7 · mailed to nearby homes"
        icon="markunread_mailbox"
        audience="Households within 2 miles"
        schedule="Mails in 5–7 business days"
        preview="Great food is closer than you think — order direct from us and get 15% off your first meal!"
      />
    ),
    followUps: ["Order flyers to store", "Show my budget"],
  },
  compare: {
    text: "Here's this week vs. last week:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Revenue", value: "$2,840", change: "↑ $420 vs last week", positive: true },
          { label: "Orders", value: "143", change: "↑ 18 more", positive: true },
          { label: "SMS open rate", value: "61%", change: "↑ 8% better", positive: true },
        ]} />
        <AlertCard type="success" icon="trending_up" title="Best week this month" text="Thursday and Friday drove most of the growth. Your weekend SMS had 3× the engagement of the midweek one." />
      </>
    ),
    followUps: ["Show detailed breakdown", "Create a new campaign"],
  },
  history: {
    text: "Here's your recent campaign history:",
    card: () => (
      <>
        <ReadOnlyCampaign name="Happy hour reminder" type="SMS" icon="sms" meta="Last Thu 3 PM · 1,180 sent" status="Completed" />
        <ReadOnlyCampaign name="Free delivery weekend" type="Tracking page" icon="pageview" meta="Last Fri · 2,400 impressions" status="Completed" />
        <ReadOnlyCampaign name="Loyalty program launch" type="SMS" icon="sms" meta="Oct 28 · 980 sent" status="Completed" />
      </>
    ),
    followUps: ["Show campaign stats", "Create a new campaign"],
  },
  changeBudget: {
    text: "Your current budget is $250/mo with $70 remaining. Here are your options:",
    card: () => <BudgetPicker />,
    followUps: ["Show ROI breakdown", "Show my stats"],
  },
  roi: {
    text: "Here's your ROI breakdown by channel:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "SMS", value: "$4.20" },
          { label: "Tracking page", value: "$6.80" },
          { label: "Print", value: "$2.10" },
        ]} />
        <AlertCard type="info" icon="insights" title="Best ROI: tracking page" text="Tracking page promos convert at the lowest cost because they reach customers already mid-order. Consider allocating more budget here." />
      </>
    ),
    followUps: ["Increase tracking page budget", "Create a tracking promo"],
  },
  exportReport: {
    text: null,
    card: () => (
      <SummaryCard title="Weekly report ready">
        Covers Nov 3–9: 143 orders driven, $2,840 revenue, 61% SMS open rate, 3 active coupon codes with 84 total redemptions. Report has been sent to your email.
      </SummaryCard>
    ),
    followUps: ["Show detailed stats", "Create a new campaign"],
  },
  pause: {
    text: "Here are your active campaigns. Tap pause on any one:",
    card: () => (
      <>
        <PausableCampaign name="Weekend special" type="SMS" icon="sms" meta="Active · sends Fri 6 PM" />
        <PausableCampaign name="Order direct" type="Tracking page" icon="pageview" meta="Active · ongoing" />
      </>
    ),
    followUps: ["Show my stats", "Create a new campaign"],
  },
  help: {
    text: "Here's what I can do for you:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { icon: "sms", label: "Create & manage SMS campaigns" },
          { icon: "pageview", label: "Set up tracking page promotions" },
          { icon: "print", label: "Launch print flyer campaigns" },
          { icon: "sell", label: "Create and manage coupon codes" },
          { icon: "bar_chart", label: "Check campaign stats & ROI" },
          { icon: "pending_actions", label: "Review and approve pending campaigns" },
          { icon: "account_balance_wallet", label: "View and adjust your budget" },
          { icon: "download", label: "Export performance reports" },
        ].map(r => <HelpRow key={r.label} icon={r.icon} label={r.label} />)}
      </div>
    ),
    followUps: ["Create a campaign", "Show my stats"],
  },
  greeting: {
    text: "Hey! I'm your AI Marketing Manager. I help you create campaigns, manage coupon codes, track performance, and grow your restaurant's revenue. What would you like to do?",
    followUps: ["Create an SMS campaign", "How are my campaigns doing?", "Show pending approvals"],
  },
  ack: {
    text: "Anything else I can help with?",
    followUps: ["Create a campaign", "Show my stats", "Show pending approvals"],
  },
  navSms:       { text: "Opening SMS campaigns...",       nav: "promotions/sms" },
  navTracking:  { text: "Opening tracking page...",        nav: "promotions/tracking" },
  navCoupons:   { text: "Opening coupon codes...",         nav: "coupons" },
  navFlyers:    { text: "Opening flyer printing...",       nav: "flyer-printing" },
  navAudiences: { text: "Opening audiences...",            nav: "audiences" },
  navRules:    { text: "Opening AI rules...", followUps: ["Show my stats", "Create a campaign"] },
  navSettings: { text: "Opening your settings...", followUps: ["Show my stats", "Create a campaign"] },
  analyzeFile: {
    text: "I've analyzed the file. Here's what I found — your top-performing items are burgers and tacos, with weekends driving 60% of orders. I'd recommend a weekend SMS campaign targeting these items.",
    followUps: ["Create an SMS campaign", "Show my stats"],
  },
  cancelFlow: {
    text: "No problem, cancelled. What would you like to do instead?",
    followUps: ["Create a campaign", "Show my stats", "Show pending approvals"],
  },
};

// ── Keyword matching ──────────────────────────────────────────────────────
const KEYWORD_MAP = [
  // Casual acknowledgements
  { keys: ["ok", "okay", "got it", "thanks", "thank you", "cool", "nice", "great", "perfect", "awesome", "sounds good", "sure"], reply: "ack" },
  // Greetings
  { keys: ["hello", "hi", "hey", "good morning", "good afternoon", "hola", "sup"],                                     reply: "greeting" },
  // Help
  { keys: ["help", "what can you", "what do you", "how do i", "features"],                                              reply: "help" },
  // Navigation
  { keys: ["go to sms", "open sms", "take me to sms", "sms tab", "sms page"],                                          reply: "navSms" },
  { keys: ["go to tracking", "open tracking", "take me to tracking", "tracking tab"],                                   reply: "navTracking" },
  { keys: ["go to coupon", "open coupon", "take me to coupon", "coupon tab", "coupon page"],                            reply: "navCoupons" },
  { keys: ["go to flyer", "open flyer", "take me to flyer", "flyer tab", "print tab"],                                 reply: "navFlyers" },
  { keys: ["go to audience", "open audience", "take me to audience", "audience tab"],                                   reply: "navAudiences" },
  // Settings / rules shortcuts
  { keys: ["set up ai rules", "ai rules", "my rules", "edit rules"],                                                    reply: "navRules" },
  { keys: ["check my settings", "my settings", "agent settings", "check settings"],                                     reply: "navSettings" },
  // Attach follow-ups
  { keys: ["analyze this", "analyze file", "summarize the data", "use in next campaign", "use in campaign"],            reply: "analyzeFile" },
  // Cancel flow
  { keys: ["cancel", "nevermind", "never mind", "stop", "forget it", "skip this"],                                      reply: "cancelFlow" },
  // Specific create flows — must be before generic matches
  { keys: ["approve all", "approve everything", "approve both"],                                                        reply: "approveAll" },
  { keys: ["create coupon", "create a coupon", "coupon code", "new coupon", "make a code", "create a code", "new code", "generate code", "create code", "another code"], reply: "createCoupon" },
  { keys: ["create tracking", "tracking promo", "tracking page promo", "create a tracking", "update the promo", "update promo"], reply: "createTracking" },
  // Print — order to store
  { keys: ["print flyer", "order flyer", "flyer to print", "print order", "flyer order", "print to store", "counter card", "bag insert", "create print"],  reply: "createPrint" },
  // Print — neighborhood / postcard mail campaign
  { keys: ["postcard campaign", "neighborhood campaign", "mail to neighborhood", "acquire new customer", "postcard to customer", "direct mail"],  reply: "createNeighborhood" },
  { keys: ["create sms", "create an sms", "new sms", "create campaign", "launch campaign", "new campaign", "create a campaign"], reply: "create" },
  // Compare / history
  { keys: ["compare", "vs last", "versus", "week over week"],                                                           reply: "compare" },
  { keys: ["history", "past campaign", "previous", "campaign history", "full history"],                                  reply: "history" },
  // Budget changes
  { keys: ["increase budget", "change budget", "raise budget", "more budget", "upgrade budget", "increase tracking", "increase sms"],  reply: "changeBudget" },
  { keys: ["roi", "return on", "breakdown", "per dollar"],                                                              reply: "roi" },
  // Export
  { keys: ["export", "download", "generate report", "email report", "weekly report"],                                   reply: "exportReport" },
  // Pause
  { keys: ["pause", "pause campaign", "pause all", "disable", "turn off"],                                               reply: "pause" },
  // Stats & info
  { keys: ["stats", "results", "performance", "revenue", "how are", "doing", "overview"],                               reply: "stats" },
  { keys: ["pending", "approval", "review", "waiting", "approve", "needs review"],                                      reply: "pending" },
  { keys: ["sms", "text", "subscriber", "message", "open rate"],                                                        reply: "sms" },
  { keys: ["tracking", "track", "delivery page", "tracking page", "impression"],                                        reply: "tracking" },
  { keys: ["budget", "spend", "money", "cost", "how much", "remaining"],                                                reply: "budget" },
  { keys: ["coupon", "promo code", "discount", "active codes", "codes", "top performing", "performing codes"],            reply: "coupon" },
];

const PLAIN_REPLIES: { text: string; card?: () => React.ReactNode; followUps?: string[]; nav?: string }[] = [
  { text: "I can create SMS campaigns, tracking page promos, print flyers, and coupon codes. I can also show your stats, check your budget, or tell you what's pending approval. Just ask.", followUps: ["Create an SMS campaign", "Show pending approvals"] },
  { text: "Sure — could you be more specific? I work best with questions about campaigns, revenue, budget, or approvals." },
  { text: "Got it. I'm here to help with anything related to your restaurant's marketing. What would you like to know?", followUps: ["How are my campaigns doing?", "What's my budget this month?"] },
  { text: "On it. Let me know if you want to launch a campaign, check performance, or review anything." },
];

function matchReply(input: string) {
  const lower = input.toLowerCase();
  for (const { keys, reply } of KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) return RICH_REPLIES[reply];
  }
  return null;
}

function matchReplyKey(input: string): string | null {
  const lower = input.toLowerCase();
  for (const { keys, reply } of KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) return reply;
  }
  return null;
}

let plainIdx = 0;
function nowTime() { const d = new Date(); return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

// ── Creation flows (multi-step) ───────────────────────────────────────────
interface FlowStep { question: string; key: string; chips: string[] }
interface FlowDef { steps: FlowStep[]; build: (data: Record<string, string>) => { text: string; card: () => React.ReactNode; followUps: string[] } }

const FLOWS: Record<string, FlowDef> = {
  sms: {
    steps: [
      { question: "What's the campaign about?", key: "offer", chips: ["Weekend discount", "New menu item", "Loyalty reward", "Free delivery"] },
      { question: "Who should receive this?", key: "audience", chips: ["All subscribers (1,240)", "New customers (380)", "Inactive 30+ days (520)", "VIP customers (190)"] },
      { question: "When should it go out?", key: "schedule", chips: ["Today 6 PM", "Tomorrow noon", "This Friday 6 PM", "Next Monday 11 AM"] },
    ],
    build: (d) => ({
      text: "Here's your campaign ready for review:",
      card: () => <CampaignProposal name={d.offer} type={`SMS · ${d.audience}`} icon="sms" audience={d.audience} schedule={d.schedule} preview={SMS_PREVIEWS[d.offer] ?? `Don't miss out — ${d.offer.toLowerCase()} is here. Tap to order now →`} />,
      followUps: ["Create a coupon code", "Show my stats"],
    }),
  },
  createTracking: {
    steps: [
      { question: "What offer should tracking page visitors see?", key: "offer", chips: ["Order direct & save", "Free delivery this week", "New items on the menu", "Join our loyalty program"] },
    ],
    build: (d) => ({
      text: "Here's your tracking page promo:",
      card: () => <CampaignProposal name={d.offer} type="Tracking page · all deliveries" icon="pageview" audience="All tracking visitors" schedule="Starts immediately" preview={TRACKING_PREVIEWS[d.offer] ?? d.offer} />,
      followUps: ["Create an SMS campaign", "Show my stats"],
    }),
  },
  createCoupon: {
    steps: [
      { question: "What discount should the code offer?", key: "discount", chips: ["10% off", "15% off", "20% off", "Free delivery", "$5 off"] },
      { question: "Any restrictions?", key: "restriction", chips: ["All menu items", "First order only", "Orders over $25", "This weekend only"] },
    ],
    build: (d) => {
      const code = COUPON_CODES[d.discount] ?? "SAVE" + Math.floor(Math.random() * 90 + 10);
      return {
        text: "Here's your coupon code ready to activate:",
        card: () => <CouponProposal code={code} discount={d.discount} description={d.restriction} />,
        followUps: ["Create another code", "Show active codes"],
      };
    },
  },
  createPrint: {
    steps: [
      { question: "What size?", key: "format", chips: ["Counter card 4×6", "Bag insert 4×6"] },
      { question: "How many do you need?", key: "quantity", chips: ["250 flyers — $85", "500 flyers — $160", "1,000 flyers — $280"] },
    ],
    build: (d) => ({
      text: "Here's your order summary — review and place your order:",
      card: () => <PrintOrderSummaryConnected format={d.format} quantity={d.quantity} />,
      followUps: ["Show my budget", "Create an SMS campaign"],
    }),
  },
};

const SMS_PREVIEWS: Record<string, string> = {
  "Weekend discount": "This weekend only — get 20% off your entire order. Don't miss out, tap to order now →",
  "New menu item": "We just added something new to the menu and you have to try it. Order now and be the first →",
  "Loyalty reward": "You've earned a reward! Use it on your next order before it expires →",
  "Free delivery": "Free delivery on all orders today — no minimum. Tap to order now →",
};

const TRACKING_PREVIEWS: Record<string, string> = {
  "Order direct & save": "Skip the apps — order directly from us next time and save on every order!",
  "Free delivery this week": "Free delivery all week when you order direct. No fees, no minimum!",
  "New items on the menu": "While you wait — check out the new items we just added to the menu!",
  "Join our loyalty program": "Join our loyalty program and earn rewards on every order. Sign up takes 10 seconds.",
};

const COUPON_CODES: Record<string, string> = {
  "10% off": "SAVE10",
  "15% off": "SAVE15",
  "20% off": "SAVE20",
  "Free delivery": "FREEDEL",
  "$5 off": "FIVE",
};

// ── Entity extraction — parse user intent from natural language ────────────
function extractEntities(input: string): Record<string, string> {
  const lower = input.toLowerCase();
  const data: Record<string, string> = {};

  // Audience
  if (lower.includes("new customer"))                                data.audience = "New customers (380)";
  else if (lower.includes("all subscriber") || lower.includes("everyone")) data.audience = "All subscribers (1,240)";
  else if (lower.includes("inactive") || lower.includes("haven't ordered")) data.audience = "Inactive 30+ days (520)";
  else if (lower.includes("vip") || lower.includes("loyal customer"))       data.audience = "VIP customers (190)";

  // Discount
  if      (/\b10\s*%/.test(lower))        data.discount = "10% off";
  else if (/\b15\s*%/.test(lower))        data.discount = "15% off";
  else if (/\b20\s*%/.test(lower))        data.discount = "20% off";
  else if (/\b25\s*%/.test(lower))        data.discount = "25% off";
  else if (lower.includes("free delivery")) data.discount = "Free delivery";
  else if (/\$5\s*off/.test(lower))       data.discount = "$5 off";

  // Offer (for SMS)
  if (data.discount)                           data.offer = `${data.discount} promotion`;
  else if (lower.includes("new menu"))         data.offer = "New menu item";
  else if (lower.includes("loyalty"))          data.offer = "Loyalty reward";
  else if (lower.includes("free delivery"))    data.offer = "Free delivery";
  else if (lower.includes("weekend"))          data.offer = "Weekend discount";

  // Schedule
  if      (lower.includes("today"))     data.schedule = "Today 6 PM";
  else if (lower.includes("tomorrow"))  data.schedule = "Tomorrow noon";
  else if (lower.includes("friday"))    data.schedule = "This Friday 6 PM";
  else if (lower.includes("monday"))    data.schedule = "Next Monday 11 AM";
  else if (lower.includes("weekend"))   data.schedule = "This Friday 6 PM";

  // Coupon restrictions
  if      (lower.includes("first order"))   data.restriction = "First order only";
  else if (/over \$\d+/.test(lower))        data.restriction = "Orders over $25";
  else if (lower.includes("weekend only"))  data.restriction = "This weekend only";

  // Print format
  if      (lower.includes("counter card")) data.format = "Counter card 4×6";
  else if (lower.includes("bag insert"))   data.format = "Bag insert 4×6";
  else if (lower.includes("postcard"))     data.format = "Postcard 5×7";

  return data;
}

// Detect compound: "sms + coupon" in same message
function isCompoundRequest(input: string): boolean {
  const lower = input.toLowerCase();
  const hasCampaign = ["sms", "campaign", "text"].some(k => lower.includes(k));
  const hasCoupon   = ["coupon", "code", "promo code", "discount code"].some(k => lower.includes(k));
  return hasCampaign && hasCoupon;
}

// Maps quick action keys → flow types (only for create actions that need multi-step)
const ACTION_TO_FLOW: Record<string, string> = {
  create: "sms",
  createTracking: "createTracking",
  createCoupon: "createCoupon",
  createPrint: "createPrint",
};

// Check if a user message should start a flow (instead of keyword match)
function matchFlowStart(input: string): string | null {
  const lower = input.toLowerCase();
  // More specific first
  if (["create coupon", "create a coupon", "coupon code", "new coupon", "new code", "create code"].some(k => lower.includes(k))) return "createCoupon";
  if (["create tracking", "tracking promo", "tracking page promo"].some(k => lower.includes(k))) return "createTracking";
  if (["postcard campaign", "neighborhood", "mail to neighborhood", "acquire new customer", "direct mail"].some(k => lower.includes(k))) return null; // let keyword match handle neighborhood
  if (["print flyer", "create print", "flyer campaign", "order flyer", "flyer to print", "print order", "order to print", "flyer order", "print to store", "counter card", "bag insert"].some(k => lower.includes(k))) return "printOrder";
  if (["create sms", "create an sms", "new sms", "create campaign", "new campaign", "create a campaign", "launch campaign"].some(k => lower.includes(k))) return "sms";
  return null;
}

// ── Main component ────────────────────────────────────────────────────────
// Shared ref for print order callback (accessible from flow-built cards)
let _printOrderCallback: ((channel: string) => void) | null = null;

function PrintOrderSummaryConnected({ format, quantity }: { format: string; quantity: string }) {
  const t = useTheme();
  return <PrintOrderSummary format={format} quantity={quantity} t={t} onPlaceOrder={() => {
    const channel = FORMAT_TO_CHANNEL[format] ?? "instore";
    _printOrderCallback?.(channel);
  }} />;
}

export default function MarketingChatPanel({ open, onClose, initialMessage, userMode, onNavigate, onApproveAll, onOpenPrintOrder }: {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
  userMode?: string;
  onNavigate?: (page: string) => void;
  onApproveAll?: () => void;
  onOpenPrintOrder?: (channel: string) => void;
}) {
  const t = useTheme();
  _printOrderCallback = onOpenPrintOrder ?? null;
  const [input, setInput]           = useState("");
  const [messages, setMessages]     = useState<Msg[]>([]);
  const lastUserModeRef = useRef(userMode);

  // React to userMode changes — inject contextual messages
  useEffect(() => {
    if (userMode === lastUserModeRef.current) return;
    lastUserModeRef.current = userMode;
    if (userMode === "pending") {
      setMessages(prev => [...prev,
        { role: "assistant", text: "You have campaigns ready for review. Approve them to start sending:", time: nowTime(), card: () => (
          <>
            <ApprovableCampaign name="Weekend special — 15% off" type="SMS Campaign" icon="sms" detail="Hey! This weekend only — 15% off at La Familia. Use code CLUB15 →" time="340 subscribers · Saturday 11 AM" />
            <ApprovableCampaign name="Order direct and save" type="Tracking page promo" icon="pageview" detail="Skip the app fees — order direct and save up to 20%." time="~1,200 views · Live after approval" />
          </>
        ), followUps: ["Approve all", "Show my settings"] },
      ]);
    } else if (userMode === "fresh") {
      setMessages(prev => [...prev,
        { role: "assistant", text: "Welcome! I'm your AI Marketing Manager. I'm setting everything up right now — analyzing your order data, building customer segments, and preparing your first campaigns.", time: nowTime() },
        { role: "assistant", text: "Your first campaigns will be ready for review within 24 hours. In the meantime, here's what you can do right now:", time: nowTime(), followUps: ["Create an SMS campaign", "Create a coupon code", "Set up AI rules", "Check my settings"] },
      ]);
    }
  }, [userMode]);

  // Also set initial messages on first mount if userMode is already set
  useEffect(() => {
    if (messages.length > 0) return;
    if (userMode === "pending") {
      setMessages([
        { role: "assistant", text: "You have campaigns ready for review. Approve them to start sending:", time: nowTime(), card: () => (
          <>
            <ApprovableCampaign name="Weekend special — 15% off" type="SMS Campaign" icon="sms" detail="Hey! This weekend only — 15% off at La Familia. Use code CLUB15 →" time="340 subscribers · Saturday 11 AM" />
            <ApprovableCampaign name="Order direct and save" type="Tracking page promo" icon="pageview" detail="Skip the app fees — order direct and save up to 20%." time="~1,200 views · Live after approval" />
          </>
        ), followUps: ["Approve all", "Show my settings"] },
      ]);
    } else if (userMode === "fresh") {
      setMessages([
        { role: "assistant", text: "Welcome! I'm your AI Marketing Manager. I'm setting everything up right now — analyzing your order data, building customer segments, and preparing your first campaigns.", time: nowTime() },
        { role: "assistant", text: "Your first campaigns will be ready for review within 24 hours. In the meantime, here's what you can do right now:", time: nowTime(), followUps: ["Create an SMS campaign", "Create a coupon code", "Set up AI rules", "Check my settings"] },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [typing, setTyping]         = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [activeChatId, setActiveChatId]   = useState<number | null>(null);
  const [chatHistory] = useState<ChatRecord[]>([
    { id: 1, title: "Weekend SMS campaign",       date: "Today" },
    { id: 2, title: "Campaign performance review", date: "Today" },
    { id: 3, title: "Tracking page promo results", date: "Yesterday" },
    { id: 4, title: "Monthly budget check",        date: "Nov 1" },
    { id: 5, title: "Print flyer campaign",        date: "Oct 28" },
  ]);

  const [greeting] = useState(() => GREETINGS[0]);
  const [expanded, setExpanded] = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const uploadRef  = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const flowRef    = useRef<{ type: string; step: number; data: Record<string, string> } | null>(null);

  const hasInput = input.trim().length > 0;
  const isEmpty  = messages.length === 0;

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setActiveChatId(null);
    setDrawerOpen(false);
    flowRef.current = null;
  }, []);

  const handleSelectChat = useCallback((chat: ChatRecord) => {
    setActiveChatId(chat.id);
    const reply = matchReply(chat.title) ?? PLAIN_REPLIES[0];
    setMessages([
      { role: "user",      text: chat.title },
      { role: "assistant", text: reply.text, card: reply.card, followUps: reply.followUps },
    ]);
    setDrawerOpen(false);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handler(e: PointerEvent) {
      if (uploadRef.current  && !uploadRef.current.contains(e.target as Node))  setUploadOpen(false);
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) setFeaturesOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // Clear last follow-ups helper
  const clearLastFollowUps = useCallback(() => {
    setMessages((prev) => prev.map((m, i) =>
      i === prev.length - 1 && m.role === "assistant" ? { ...m, followUps: undefined } : m
    ));
  }, []);

  // Add AI message with typing delay
  const addAiReply = useCallback((reply: { text: string | null; card?: () => React.ReactNode; followUps?: string[] }, delay = 800) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: reply.text, card: reply.card, followUps: reply.followUps, time: nowTime() }]);
      setTyping(false);
    }, delay);
  }, []);

  // Advance a creation flow — ask next question or build final card
  const advanceFlow = useCallback((flow: { type: string; step: number; data: Record<string, string> }) => {
    const def = FLOWS[flow.type];
    if (!def) return;
    if (flow.step >= def.steps.length) {
      // All steps done — build and show the proposal
      flowRef.current = null;
      const result = def.build(flow.data);
      addAiReply(result, 1000);
    } else {
      // Ask next question
      const next = def.steps[flow.step];
      addAiReply({ text: next.question, followUps: next.chips }, 600);
    }
  }, [addAiReply]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    clearLastFollowUps();
    setMessages((prev) => [...prev, { role: "user", text: msg, time: nowTime() }]);
    setInput("");

    // If we're in a creation flow, check for cancel first, then treat as answer
    if (flowRef.current) {
      const lower = msg.toLowerCase();
      if (["cancel", "nevermind", "never mind", "stop", "forget it", "skip this"].some(k => lower.includes(k))) {
        flowRef.current = null;
        addAiReply(RICH_REPLIES.cancelFlow, 600);
        return;
      }
      const flow = flowRef.current;
      const def = FLOWS[flow.type];
      if (def && flow.step < def.steps.length) {
        flow.data[def.steps[flow.step].key] = msg;
        flow.step++;
        advanceFlow(flow);
        return;
      }
    }

    // Check for compound request: "sms campaign with coupon"
    if (isCompoundRequest(msg)) {
      const entities = extractEntities(msg);
      const discount = entities.discount ?? "10% off";
      const code = COUPON_CODES[discount] ?? "PROMO" + Math.floor(Math.random() * 90 + 10);
      const restriction = entities.restriction ?? "All menu items";
      // Auto-create coupon, then start SMS flow with pre-filled data
      setTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: `First, I created a coupon code for the ${discount}:`,
          card: () => <CouponProposal code={code} discount={discount} description={restriction} />,
        }]);
        setTyping(false);
        // Start SMS flow with pre-filled entities + offer referencing the coupon
        setTimeout(() => {
          const smsData: Record<string, string> = { ...entities, offer: `${discount} with code ${code}` };
          const flow = { type: "sms" as string, step: 0, data: smsData };
          const def = FLOWS.sms;
          while (flow.step < def.steps.length && flow.data[def.steps[flow.step].key]) flow.step++;
          flowRef.current = flow;
          advanceFlow(flow);
        }, 1200);
      }, 800);
      return;
    }

    // Check if this message starts a flow
    const flowKey = matchFlowStart(msg);

    // Print order: show template selector first, then continue to format/quantity flow
    if (flowKey === "printOrder") {
      setTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "Choose a design for your flyer:",
          time: nowTime(),
          card: () => <TemplateSelector onSelect={(name) => {
            setMessages(prev => [...prev, { role: "user", text: name, time: nowTime() }]);
            // Start the createPrint flow after template selection
            const flow = { type: "createPrint", step: 0, data: { template: name } };
            flowRef.current = flow;
            setTimeout(() => advanceFlow(flow), 400);
          }} />,
        }]);
        setTyping(false);
      }, 800);
      return;
    }

    if (flowKey && FLOWS[flowKey]) {
      const entities = extractEntities(msg);
      const flow = { type: flowKey, step: 0, data: entities };
      const def = FLOWS[flowKey];
      // Skip steps already answered by entities
      while (flow.step < def.steps.length && flow.data[def.steps[flow.step].key]) flow.step++;
      flowRef.current = flow;
      advanceFlow(flow);
      return;
    }

    // Regular keyword matching
    setTyping(true);
    setTimeout(() => {
      const rich  = matchReply(msg);
      const replyKey = matchReplyKey(msg);
      const reply = rich ?? PLAIN_REPLIES[plainIdx++ % PLAIN_REPLIES.length];
      setMessages((prev) => [...prev, { role: "assistant", text: reply.text, card: reply.card, followUps: reply.followUps, time: nowTime() }]);
      setTyping(false);
      if (reply.nav && onNavigate) {
        setTimeout(() => { onNavigate(reply.nav!); onClose(); }, 800);
      }
      if (replyKey === "approveAll") onApproveAll?.();
    }, 1100);
  }, [input, clearLastFollowUps, advanceFlow, onNavigate, onClose, onApproveAll]);

  // Quick action — starts a flow or shows direct reply
  const handleAction = useCallback((replyKey: string) => {
    clearLastFollowUps();
    // Print order: show template selector
    if (replyKey === "createPrint") {
      setTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant", text: "Choose a design for your flyer:", time: nowTime(),
          card: () => <TemplateSelector onSelect={(name) => {
            setMessages(prev => [...prev, { role: "user", text: name, time: nowTime() }]);
            const flow = { type: "createPrint", step: 0, data: { template: name } };
            flowRef.current = flow;
            setTimeout(() => advanceFlow(flow), 400);
          }} />,
        }]);
        setTyping(false);
      }, 800);
      return;
    }
    // If this key has a flow, start it
    const flowType = ACTION_TO_FLOW[replyKey];
    if (flowType && FLOWS[flowType]) {
      flowRef.current = { type: flowType, step: 0, data: {} };
      advanceFlow(flowRef.current);
      return;
    }
    // Otherwise direct reply
    const reply = RICH_REPLIES[replyKey] ?? PLAIN_REPLIES[0];
    addAiReply(reply);
    if (reply.nav && onNavigate) {
      setTimeout(() => { onNavigate(reply.nav!); onClose(); }, 800);
    }
  }, [clearLastFollowUps, advanceFlow, addAiReply, onNavigate, onClose]);

  // Send initialMessage when panel opens
  useEffect(() => {
    if (open && initialMessage?.trim()) {
      handleSend(initialMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (uploadOpen || featuresOpen) { setUploadOpen(false); setFeaturesOpen(false); }
        else if (drawerOpen) { setDrawerOpen(false); }
        else { onClose(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, uploadOpen, featuresOpen, drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.03)" }} />
      )}

      <FocusStyles />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="AI Marketing Manager"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 76, right: 16, bottom: 16,
          width: expanded ? 680 : 460, zIndex: 1000,
          display: "flex", flexDirection: "column",
          background: t.surface,
          borderRadius: 20,
          border: "none",
          boxShadow: "0 16px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transform: open ? "translateX(0) scale(1)" : "translateX(20px) scale(0.96)",
          opacity: open ? 1 : 0,
          filter: open ? "blur(0px)" : "blur(4px)",
          transition: "transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease, filter 280ms ease, width 250ms cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Background gradient — empty state only */}
        {isEmpty && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, borderRadius: 20,
            background: t.mode === "dark"
              ? "radial-gradient(circle at 50% 65%, rgba(47,229,199,0.14) 0%, transparent 65%)"
              : "radial-gradient(circle at 50% 65%, rgba(47,229,199,0.28) 0%, rgba(120,246,149,0.1) 35%, transparent 60%)",
            animation: "mktGradientPulse 5s ease-in-out infinite",
          }} />
        )}

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 14px", flexShrink: 0, position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              aria-label="Chat history"
              onClick={() => setDrawerOpen((o) => !o)}
              className="copilot-btn"
              style={{
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: drawerOpen ? t.surfaceHover : "transparent",
                cursor: "pointer", borderRadius: 99, transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { if (!drawerOpen) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="menu" size={22} color={t.textMuted} weight={400} />
            </button>
            <img src="/marketing-manager-logo.svg" alt="" width={34} height={34} style={{ display: "block", flexShrink: 0, objectFit: "contain" }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>
              Marketing AI
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              aria-label={expanded ? "Collapse" : "Expand"}
              onClick={() => setExpanded(e => !e)}
              className="copilot-btn"
              style={{
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent", cursor: "pointer", borderRadius: 99,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name={expanded ? "close_fullscreen" : "open_in_full"} size={18} color={t.textMuted} weight={400} />
            </button>
            <button
              aria-label="New chat"
              onClick={handleNewChat}
              className="copilot-btn"
              style={{
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent", cursor: "pointer", borderRadius: 99,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="edit_square" size={18} color={t.textMuted} weight={400} />
            </button>
            <button
              aria-label="Close"
              onClick={onClose}
              className="copilot-btn"
              style={{
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent", cursor: "pointer", borderRadius: 99,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="close" size={22} color={t.textMuted} weight={400} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          className="scroll-subtle"
          style={{
            flex: 1, overflow: "auto", position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column",
            padding: isEmpty ? "0 22px" : "12px 22px 20px",
            ...(isEmpty ? { justifyContent: "center", alignItems: "center" } : {}),
          }}
        >
          {isEmpty ? (
            /* Empty state */
            <div style={{ textAlign: "center", marginTop: -40, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div style={{ marginBottom: 20 }}>
                <AIMarketingIcon />
              </div>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: t.text, display: "block" }}>
                {greeting}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20, width: "100%" }}>
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSend(text)}
                    className="copilot-btn"
                    style={{
                      display: "flex", alignItems: "flex-start",
                      padding: "14px 16px", border: "none", borderRadius: 12,
                      background: t.bgTertiary, cursor: "pointer",
                      fontSize: 14, fontWeight: 400, color: t.textSecondary,
                      fontFamily: "inherit", textAlign: "left",
                      lineHeight: "20px", transition: "background 0.15s", minHeight: 52,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = t.bgTertiary; }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{
                      padding: "10px 16px", borderRadius: "14px 14px 4px 14px",
                      background: t.bgTertiary, color: t.text,
                      fontSize: 15, lineHeight: "22px", fontWeight: 400, maxWidth: "85%",
                    }}>
                      {msg.text}
                    </div>
                    {msg.time && <span style={{ fontSize: 12, color: t.textMuted, paddingRight: 4 }}>{msg.time}</span>}
                  </div>
                ) : (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {msg.text && (
                      <div style={{ color: t.text, fontSize: 15, lineHeight: "24px", fontWeight: 400 }}>
                        {msg.text}
                      </div>
                    )}
                    {msg.card && msg.card()}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                        {msg.followUps.map((fu) => (
                          <button
                            key={fu}
                            onClick={() => handleSend(fu)}
                            className="copilot-btn"
                            style={{
                              padding: "8px 16px", border: `1px solid ${t.border}`,
                              borderRadius: 999, background: t.surface,
                              cursor: "pointer", fontSize: 14, fontWeight: 500,
                              color: t.text, fontFamily: "inherit",
                              transition: "background 0.12s, border-color 0.12s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.borderColor = t.accent; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; }}
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
              {typing && (
                <div role="status" aria-label="AI is thinking" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ThinkingSpinner accent={t.accent} />
                  <span style={{ fontSize: 14, color: t.textMuted, fontWeight: 400 }}>Working on it...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input card */}
        <div style={{ padding: "0 16px 16px", flexShrink: 0, position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex", flexDirection: "column", borderRadius: 16,
            background: t.inputBg, border: `1px solid ${inputFocused ? t.border : t.borderLight}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.2s ease",
            overflow: "hidden",
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a question"
              aria-label="Ask a question"
              style={{
                border: "none", outline: "none",
                background: "transparent", fontSize: 15,
                color: t.text, fontFamily: "inherit",
                lineHeight: "22px", padding: "16px 18px 8px",
                width: "100%", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Upload menu */}
                <div ref={uploadRef} style={{ position: "relative" }}>
                  <InputAction icon="add" label="Attach" t={t} active={uploadOpen}
                    onClick={() => { setUploadOpen((o) => !o); setFeaturesOpen(false); }} />
                  {uploadOpen && (
                    <PopupMenu t={t} parentRef={uploadRef}
                      items={[
                        { icon: "image",       label: "Image" },
                        { icon: "description", label: "Document" },
                        { icon: "table_chart", label: "Spreadsheet" },
                        { icon: "attach_file", label: "Other file" },
                      ]}
                      onSelect={(item) => {
                        setUploadOpen(false);
                        setTyping(true);
                        setTimeout(() => {
                          setMessages((prev) => [...prev, {
                            role: "assistant",
                            text: `I've received your ${item.label.toLowerCase()}. What would you like me to do with it?`,
                            followUps: ["Analyze this file", "Use in next campaign"],
                          }]);
                          setTyping(false);
                        }, 800);
                      }}
                    />
                  )}
                </div>
                {/* Quick actions */}
                <div ref={featuresRef} style={{ position: "relative" }}>
                  <InputAction icon="apps" label="Quick actions" t={t} active={featuresOpen}
                    onClick={() => { setFeaturesOpen((o) => !o); setUploadOpen(false); }} />
                  {featuresOpen && (
                    <PopupMenu t={t} parentRef={featuresRef}
                      items={[
                        { icon: "sms",             label: "Create SMS campaign",    action: "create" },
                        { icon: "pageview",        label: "Tracking page promo",    action: "createTracking" },
                        { icon: "print",           label: "Print flyer campaign",   action: "createPrint" },
                        { icon: "sell",            label: "Create coupon code",     action: "createCoupon" },
                        { icon: "bar_chart",       label: "Campaign performance",   action: "stats" },
                        { icon: "pending_actions", label: "Show pending approvals", action: "pending" },
                      ]}
                      onSelect={(item) => { setFeaturesOpen(false); handleAction(item.action!); }}
                    />
                  )}
                </div>
              </div>
              <button
                aria-label="Send message"
                onClick={() => handleSend()}
                aria-disabled={!hasInput}
                className="copilot-btn"
                style={{
                  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", borderRadius: 99, flexShrink: 0,
                  cursor: hasInput ? "pointer" : "default",
                  background: hasInput ? t.accent : t.bgTertiary,
                  transition: "background 0.2s ease",
                }}
              >
                <Icon name="arrow_upward" size={20} color={hasInput ? "#FFFFFF" : t.textMuted} weight={500} />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer backdrop */}
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.08)",
            opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none",
            transition: "opacity 200ms ease", zIndex: 2, borderRadius: 20,
          }}
        />

        {/* Drawer panel */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "80%",
          background: t.surface, borderRadius: "20px 0 0 20px",
          boxShadow: drawerOpen ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 250ms cubic-bezier(0.4,0,0.2,1)",
          zIndex: 3, display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Drawer header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 10px 18px", flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>Chat history</span>
            <button
              aria-label="New chat"
              onClick={handleNewChat}
              className="copilot-btn"
              style={{
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="edit_square" size={18} color={t.textMuted} weight={400} />
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: t.bgTertiary }}>
              <Icon name="search" size={18} color={t.textMuted} weight={300} />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search"
                aria-label="Search chats"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: t.text, fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 8px 14px" }}>
            {(() => {
              const filtered = chatHistory.filter((c) => c.title.toLowerCase().includes(historySearch.toLowerCase()));
              const groups: Record<string, ChatRecord[]> = {};
              filtered.forEach((c) => { if (!groups[c.date]) groups[c.date] = []; groups[c.date].push(c); });
              return (
                <>
                  {Object.entries(groups).map(([date, chats]) => (
                    <div key={date}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, padding: "10px 10px 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {date}
                      </div>
                      {chats.map((chat) => {
                        const isActive = chat.id === activeChatId;
                        return (
                          <button
                            key={chat.id}
                            onClick={() => handleSelectChat(chat)}
                            className="copilot-btn"
                            style={{
                              width: "100%", display: "flex", alignItems: "center",
                              padding: "10px 10px", border: "none", borderRadius: 10,
                              background: isActive ? t.accentLight : "transparent",
                              cursor: "pointer", fontSize: 14, fontWeight: isActive ? 500 : 400,
                              color: isActive ? t.accentText : t.text,
                              fontFamily: "inherit", textAlign: "left",
                              transition: "background 0.12s",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = t.surfaceHover; }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                          >
                            {chat.title}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <p style={{ fontSize: 14, color: t.textMuted, padding: "20px 10px", textAlign: "center" }}>
                      No chats found
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function AIMarketingIcon() {
  return (
    <img src="/marketing-manager-logo.svg" alt="" width={64} height={64} style={{ display: "block", objectFit: "contain" }} />
  );
}

function InputAction({ icon, label, t, onClick, active }: {
  icon: string; label: string;
  t: ReturnType<typeof useTheme>;
  onClick: () => void; active: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="copilot-btn"
      onClick={onClick}
      style={{
        width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", background: active ? t.surfaceHover : "transparent",
        cursor: "pointer", borderRadius: 99, transition: "background 0.12s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon name={icon} size={20} color={active ? t.text : t.textMuted} weight={400} />
    </button>
  );
}

function PopupMenu({ t, items, onSelect, parentRef }: {
  t: ReturnType<typeof useTheme>;
  items: { icon: string; label: string; action?: string }[];
  onSelect: (item: { icon: string; label: string; action?: string }) => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState({ bottom: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (parentRef?.current) {
      const rect = parentRef.current.getBoundingClientRect();
      setPos({ bottom: window.innerHeight - rect.top + 6, left: rect.left });
    }
  }, [parentRef]);
  return createPortal(
    <div ref={menuRef} style={{
      position: "fixed", bottom: pos.bottom, left: pos.left,
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      padding: 4, zIndex: 1100, minWidth: 200, fontFamily: "inherit",
      animation: "mktFadeUp 150ms ease",
    }}>
      {items.map((item) => (
        <button key={item.label} onClick={() => onSelect(item)} className="copilot-btn" style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", border: "none", borderRadius: 8,
          background: "transparent", cursor: "pointer",
          fontSize: 14, fontWeight: 400, color: t.text,
          fontFamily: "inherit", textAlign: "left", transition: "background 0.12s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name={item.icon} size={20} color={t.textMuted} weight={300} />
          {item.label}
        </button>
      ))}
      <style>{`@keyframes mktFadeUp { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>,
    document.body,
  );
}

function ThinkingSpinner({ accent }: { accent: string }) {
  return (
    <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
      <svg width={28} height={28} viewBox="0 0 28 28"
        style={{ position: "absolute", top: 0, left: 0, animation: "mktOrbit 1.4s linear infinite" }}>
        <circle cx="14" cy="14" r="12" fill="none" stroke={accent} strokeWidth="2"
          strokeLinecap="round" strokeDasharray="20 56" opacity="0.6" />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <svg width={12} height={12} viewBox="0 0 21 24" fill="none">
          <path opacity="0.8" d="M0 8.15625C0.0237463 9.55494 0.730239 10.9144 2.00222 11.7156L14.4269 19.5419C15.7336 20.365 17.3141 20.3954 18.6056 19.7613L12.4847 23.4454C11.255 24.1856 9.7452 24.1856 8.51546 23.4454L2.0154 19.5333C0.769129 18.7832 1.97192e-05 17.3872 -5.24792e-08 15.8753L0 8.15625Z" fill="url(#tsp-g1)"/>
          <path opacity="0.8" d="M8.51593 0.555112C9.74567 -0.185037 11.2555 -0.185037 12.4852 0.555112L18.9853 4.46726C20.2315 5.21738 21.0006 6.61337 21.0007 8.12525L21.0007 15.857C20.981 14.4539 20.274 13.0886 18.9982 12.285L6.57352 4.45871C5.26672 3.63557 3.68612 3.60514 2.39453 4.23923L8.51593 0.555112Z" fill="url(#tsp-g2)"/>
          <path opacity="0.8" d="M8.09749 0.806397C6.95963 1.5774 6.21199 2.88093 6.21197 4.35892L6.21197 19.6415C6.21197 21.1195 6.95985 22.4228 8.09773 23.1938L2.0154 19.5331C0.769095 18.783 -1.12724e-07 17.3868 -1.02445e-07 15.8749L-4.97604e-08 8.12556C-3.94816e-08 6.61367 0.769136 5.2177 2.0154 4.46756L8.09749 0.806397Z" fill="url(#tsp-g3)"/>
          <path opacity="0.8" d="M18.9849 4.46781C20.2312 5.21794 21.0003 6.61391 21.0003 8.1258L21.0003 15.8751C21.0003 17.3871 20.2312 18.7832 18.9849 19.5334L12.9004 23.1953C14.0393 22.4244 14.7881 21.1206 14.7881 19.6418L14.7881 4.35916C14.7881 2.8804 14.0395 1.57651 12.9006 0.805664L18.9849 4.46781Z" fill="url(#tsp-g4)"/>
          <defs>
            <linearGradient id="tsp-g1" x1="13.8666" y1="22.5989" x2="1.4335e-07" y2="14.4397" gradientUnits="userSpaceOnUse"><stop stopColor="#2FE5C7"/><stop offset="1" stopColor="#018461"/></linearGradient>
            <linearGradient id="tsp-g2" x1="7.53372" y1="1.25891" x2="21.0007" y2="9.81751" gradientUnits="userSpaceOnUse"><stop stopColor="#2FE5C7"/><stop offset="1" stopColor="#018461"/></linearGradient>
            <linearGradient id="tsp-g3" x1="4.04887" y1="3.3309" x2="4.04887" y2="20.6109" gradientUnits="userSpaceOnUse"><stop stopColor="#208EF5"/><stop offset="0.509615" stopColor="#2FE5C7"/><stop offset="1" stopColor="#78F695"/></linearGradient>
            <linearGradient id="tsp-g4" x1="16.9504" y1="3.25633" x2="16.9504" y2="20.5447" gradientUnits="userSpaceOnUse"><stop stopColor="#78F695"/><stop offset="0.509615" stopColor="#2FE5C7"/><stop offset="1" stopColor="#208EF5"/></linearGradient>
          </defs>
        </svg>
      </div>
      <style>{`@keyframes mktOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FocusStyles() {
  return (
    <style>{`
      @keyframes mktGradientPulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50%       { transform: scale(1.15); opacity: 1; }
      }
      .copilot-btn:focus-visible {
        outline: none;
        box-shadow: ${FOCUS_RING} !important;
      }
    `}</style>
  );
}
