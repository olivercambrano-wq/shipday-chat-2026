import React, { useState } from "react";
import { useTheme } from "../lib/ThemeContext";
import { StatsRow, AlertCard } from "../components/chat/BaseAgentChat";
import Icon from "../components/ui/Icon";

// ═══════════════════════════════════════════════════════════════════════════
// Card Catalog — every agent card in one scrollable page for visual QA
// URL: /#catalog
// ═══════════════════════════════════════════════════════════════════════════

// ── Marketing cards ──────────────────────────────────────────────────────

function ApprovableCampaign({ name, type, detail, time, icon }: { name: string; type: string; detail: string; time: string; icon: string }) {
  const t = useTheme();
  const [status, setStatus] = useState<"pending" | "approved">("pending");
  if (status === "approved") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {time}</div>
          </div>
          <Icon name="check_circle" size={22} color={t.accent} fill />
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {time}</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>&ldquo;{detail}&rdquo;</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStatus("approved")} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", transition: "opacity 120ms ease" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >Approve</button>
      </div>
    </div>
  );
}

function CampaignProposal({ name, type, icon, preview }: { name: string; type: string; icon: string; preview: string }) {
  const t = useTheme();
  const [status, setStatus] = useState<"draft" | "launched">("draft");
  if (status === "launched") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: t.accentLight, marginBottom: 10 }}>
          <Icon name="check_circle" size={16} color={t.accent} fill />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.accent }}>Campaign scheduled</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{name}</div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 3 }}>{type}</div>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{type}</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>&ldquo;{preview}&rdquo;</div>
      <button onClick={() => setStatus("launched")} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start", transition: "opacity 120ms ease" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >Launch</button>
    </div>
  );
}

function CouponProposal({ code, discount, description }: { code: string; discount: string; description: string }) {
  const t = useTheme();
  const [created, setCreated] = useState(false);
  if (created) {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sell" size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "0.04em" }}>{code}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{discount} · {description}</div>
          </div>
          <Icon name="check_circle" size={22} color={t.accent} fill />
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="sell" size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "0.04em" }}>{code}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{discount} · {description}</div>
        </div>
      </div>
      <button onClick={() => setCreated(true)} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start", transition: "opacity 120ms ease" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >Create code</button>
    </div>
  );
}

// ── Operations cards ─────────────────────────────────────────────────────

function DriverCard({ name, status, orders, eta }: { name: string; status: string; orders: number; eta: string }) {
  const t = useTheme();
  const statusColor = status === "Delivering" ? "#16a34a" : status === "Returning" ? "#2563EB" : status === "Idle" ? t.textMuted : "#EA580C";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
        {name.split(" ").map(n => n[0]).join("")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{orders} orders · {eta}</div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: statusColor }}>{status}</span>
    </div>
  );
}

function OrderCard({ id, store, status, time }: { id: string; store: string; status: string; time: string }) {
  const t = useTheme();
  const statusColor = status === "Late" ? "#dc2626" : status === "On time" ? "#16a34a" : status === "Unassigned" ? "#EA580C" : t.textMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>#{id}</span>
          <span style={{ fontSize: 14, color: t.textMuted }}>{store}</span>
        </div>
        <span style={{ fontSize: 14, color: t.textMuted }}>{time}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: statusColor, flexShrink: 0 }}>{status}</span>
    </div>
  );
}

// ── Receptionist cards ───────────────────────────────────────────────────

function CallCard({ caller, time, duration, status }: { caller: string; time: string; duration: string; status: string }) {
  const t = useTheme();
  const color = status === "Answered" ? "#16a34a" : status === "Missed" ? "#dc2626" : "#EA580C";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="call" size={18} color={t.textMuted} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{caller}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{time} · {duration}</div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color }}>{status}</span>
    </div>
  );
}

function ReservationCard({ name, time, guests, note }: { name: string; time: string; guests: number; note: string }) {
  const t = useTheme();
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</span>
        <span style={{ fontSize: 14, color: t.textMuted }}>{time} · {guests} guests</span>
      </div>
      <div style={{ fontSize: 14, color: t.textMuted }}>{note}</div>
    </div>
  );
}

function NewReservationCard() {
  const t = useTheme();
  const [confirmed, setConfirmed] = useState(false);
  if (confirmed) {
    return <AlertCard type="success" icon="check_circle" title="Reservation booked" text="Party of 2 tonight at 7:00 PM — confirmation texted to the guest." />;
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Name</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>New guest</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>7:00 PM</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Guests</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>2</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: t.textMuted, padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>Note: window seat if available</div>
      <button onClick={() => setConfirmed(true)} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start", transition: "opacity 120ms ease" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >Confirm reservation</button>
    </div>
  );
}

function CallbackCard({ caller, phone }: { caller: string; phone: string }) {
  const t = useTheme();
  const [state, setState] = useState<"idle" | "calling" | "done">("idle");
  if (state === "done") {
    return <AlertCard type="success" icon="phone" title={`Called ${caller}`} text="Call connected. Duration: 1:34" />;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: state === "calling" ? "#16a34a" : t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 300ms ease" }}>
        <Icon name="call" size={18} color={state === "calling" ? "#FFFFFF" : t.textMuted} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{caller}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{phone}</div>
      </div>
      {state === "idle" ? (
        <button
          onClick={() => { setState("calling"); setTimeout(() => setState("done"), 2200); }}
          style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: "#16a34a", fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, transition: "opacity 120ms ease" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          <Icon name="call" size={16} color="#FFFFFF" />
          Call now
        </button>
      ) : (
        <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 600, flexShrink: 0 }}>Calling…</span>
      )}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────

function Section({ agent, color, children }: { agent: string; color: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>{agent}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {children}
      </div>
    </div>
  );
}

function CardGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CardCatalog() {
  const t = useTheme();
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px 80px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Card Catalog</h1>
      <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 40px" }}>Every agent card for visual QA. Interactive buttons work.</p>

      {/* ── Marketing AI ────────────────────────────────────────────── */}
      <Section agent="Marketing AI" color="#EC4899">

        <CardGroup label="Stats">
          <StatsRow stats={[
            { label: "Revenue driven", value: "$2,840", change: "↑ 18%", positive: true },
            { label: "Orders", value: "143", change: "↑ 12%", positive: true },
            { label: "SMS opens", value: "61%", change: "↑ 4%", positive: true },
          ]} />
        </CardGroup>

        <CardGroup label="Pending Approvals (interactive)">
          <ApprovableCampaign name="Weekend special" type="SMS" icon="sms" detail="Craving something delicious? Get 20% off this weekend only. Order now →" time="Fri 6 PM · 1,240 subscribers" />
          <ApprovableCampaign name="Order direct" type="Tracking page" icon="pageview" detail="Skip the fees — order directly from us and save!" time="Ongoing · all deliveries" />
        </CardGroup>

        <CardGroup label="SMS Performance">
          <StatsRow stats={[
            { label: "Sent", value: "1,204" },
            { label: "Open rate", value: "61%", change: "↑ 8%", positive: true },
            { label: "Orders", value: "38", change: "↑ 5", positive: true },
          ]} />
          <AlertCard type="success" icon="check_circle" title="Best open rate yet" text="This week's SMS hit 61% open rate — well above your 48% average." />
        </CardGroup>

        <CardGroup label="Budget">
          <StatsRow stats={[
            { label: "Budget", value: "$250" },
            { label: "Spent", value: "$180", change: "72% used", positive: true },
            { label: "Remaining", value: "$70" },
          ]} />
          <AlertCard type="info" icon="info" title="On track" text="At current pace, you'll finish the month within budget. Best ROI: SMS at $4.20 per $1 spent." />
        </CardGroup>

        <CardGroup label="Create SMS Campaign (interactive)">
          <CampaignProposal name="Weekend special — 20% off" type="SMS · 1,240 subscribers" icon="sms" preview="Craving something delicious? Get 20% off your next order this weekend only. Tap to order →" />
        </CardGroup>

        <CardGroup label="Print Flyer (interactive)">
          <CampaignProposal name="Weekend Special — Print Flyer" type="Print · A5 / Letter · 500 copies" icon="print" preview="20% off this weekend only. Mention this flyer at checkout or scan the QR code to order online." />
        </CardGroup>

        <CardGroup label="Create Coupon (interactive)">
          <CouponProposal code="WEEKEND20" discount="20% off" description="Valid this weekend · all menu items" />
        </CardGroup>

        <CardGroup label="Active Coupons">
          <StatsRow stats={[
            { label: "Active codes", value: "3" },
            { label: "Redemptions", value: "84", change: "↑ 22%", positive: true },
            { label: "Revenue", value: "$960", change: "↑ 18%", positive: true },
          ]} />
        </CardGroup>

      </Section>

      {/* ── Operations AI ───────────────────────────────────────────── */}
      <Section agent="Operations AI" color="#2FE5C7">

        <CardGroup label="Overview Stats">
          <StatsRow stats={[
            { label: "Active orders", value: "12", change: "3 pending", positive: true },
            { label: "On-time rate", value: "91%", change: "↑ 4%", positive: true },
            { label: "Avg delivery", value: "28 min", change: "↓ 3 min", positive: true },
          ]} />
          <AlertCard type="warning" icon="warning" title="2 orders running late" text="Orders #3480 and #3485 are 10+ minutes behind schedule. Consider reassigning." />
        </CardGroup>

        <CardGroup label="Driver Status">
          <DriverCard name="Marco Rivera" status="Delivering" orders={3} eta="12 min to next" />
          <DriverCard name="Ana Torres" status="Delivering" orders={2} eta="8 min to next" />
          <DriverCard name="Luis Mendez" status="Returning" orders={0} eta="5 min to store" />
          <DriverCard name="Kira Jones" status="Idle" orders={0} eta="At store" />
        </CardGroup>

        <CardGroup label="Late Orders">
          <OrderCard id="3480" store="Bella's Pizza" status="Late" time="18 min late · stuck in traffic" />
          <OrderCard id="3485" store="Taco Express" status="Late" time="12 min late · driver en route" />
        </CardGroup>

        <CardGroup label="Unassigned Orders">
          <OrderCard id="3492" store="Sushi Place" status="Unassigned" time="Pickup in 10 min" />
          <OrderCard id="3495" store="Burger Joint" status="Unassigned" time="Pickup in 18 min" />
          <AlertCard type="info" icon="person_pin" title="Kira Jones is available" text="She's at the store and can take both orders." />
        </CardGroup>

        <CardGroup label="All Active Orders">
          <OrderCard id="3488" store="Bella's Pizza" status="On time" time="In transit · 8 min away" />
          <OrderCard id="3489" store="Taco Express" status="On time" time="Pickup in 3 min" />
          <OrderCard id="3490" store="Sushi Place" status="Late" time="12 min late · driver en route" />
          <OrderCard id="3492" store="Sushi Place" status="Unassigned" time="Pickup in 10 min" />
        </CardGroup>

        <CardGroup label="Routes">
          <StatsRow stats={[{ label: "Total routes", value: "8" }, { label: "Completed", value: "5" }, { label: "In progress", value: "3" }]} />
        </CardGroup>

        <CardGroup label="Action Confirmations">
          <AlertCard type="success" icon="check_circle" title="Orders assigned" text="Orders #3492 and #3495 have been assigned to Kira Jones. ETA: 25 min." />
          <AlertCard type="success" icon="check_circle" title="Customers notified" text="Delay notifications sent for orders #3480 and #3485 with updated ETAs." />
        </CardGroup>

      </Section>

      {/* ── Receptionist AI ─────────────────────────────────────────── */}
      <Section agent="Receptionist AI" color="#7C3AED">

        <CardGroup label="Call Activity Stats">
          <StatsRow stats={[
            { label: "Total calls", value: "34" },
            { label: "Answered", value: "28", change: "82%", positive: true },
            { label: "Missed", value: "6", change: "↓ from 9", positive: true },
          ]} />
          <AlertCard type="info" icon="trending_up" title="Peak hours: 11 AM – 1 PM" text="Most calls come during lunch. Consider adding a second line for that window." />
        </CardGroup>

        <CardGroup label="Recent Calls">
          <CallCard caller="Sarah Johnson" time="12:34 PM" duration="2:15" status="Answered" />
          <CallCard caller="Unknown" time="12:20 PM" duration="0:08" status="Missed" />
          <CallCard caller="David Chen" time="11:55 AM" duration="3:42" status="Answered" />
          <CallCard caller="Catering inquiry" time="11:30 AM" duration="5:10" status="Answered" />
        </CardGroup>

        <CardGroup label="Missed Calls">
          <CallCard caller="Unknown" time="12:20 PM" duration="0:08" status="Missed" />
          <CallCard caller="+1 (512) 555-0198" time="11:10 AM" duration="0:12" status="Missed" />
          <CallCard caller="Emma Wilson" time="10:45 AM" duration="0:05" status="Missed" />
          <AlertCard type="warning" icon="phone_missed" title="3 in the last hour" text="Consider enabling auto-response for missed calls to capture customer intent." />
        </CardGroup>

        <CardGroup label="Reservations">
          <ReservationCard name="Martinez party" time="6:00 PM" guests={4} note="Birthday — need cake" />
          <ReservationCard name="Johnson" time="7:30 PM" guests={2} note="Window seat requested" />
          <ReservationCard name="Corporate dinner" time="8:00 PM" guests={12} note="Pre-ordered menu" />
        </CardGroup>

        <CardGroup label="Add Reservation (interactive)">
          <NewReservationCard />
        </CardGroup>

        <CardGroup label="Call Back (interactive)">
          <CallbackCard caller="Emma Wilson" phone="+1 (512) 555-0147" />
          <CallbackCard caller="+1 (512) 555-0198" phone="Unknown caller · Missed 11:10 AM" />
        </CardGroup>

        <CardGroup label="Auto-response Enabled">
          <AlertCard type="success" icon="check_circle" title="Auto-response enabled" text="Missed calls will receive a text with your ordering link and hours." />
        </CardGroup>

      </Section>
    </div>
  );
}
