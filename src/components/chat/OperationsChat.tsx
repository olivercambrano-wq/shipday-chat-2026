import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

// ── Types ─────────────────────────────────────────────────────────────────
interface Msg {
  role: "user" | "assistant";
  text: string | null;
  card?: () => React.ReactNode;
  followUps?: string[];
  time?: string;
}

function nowTime() { const d = new Date(); return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

// ── Stats card ────────────────────────────────────────────────────────────
function StatsRow({ stats }: { stats: { label: string; value: string; change?: string; positive?: boolean }[] }) {
  const t = useTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 8 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ padding: "14px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted }}>{s.label}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginTop: 2 }}>{s.value}</span>
          {s.change && <span style={{ fontSize: 14, fontWeight: 600, marginTop: 2, color: s.positive === true ? "#16a34a" : s.positive === false ? "#dc2626" : t.textMuted }}>{s.change}</span>}
        </div>
      ))}
    </div>
  );
}

function AlertCard({ icon, title, text, type = "info" }: { icon: string; title?: string; text: string; type?: string }) {
  const t = useTheme();
  const styles: Record<string, { bg: string; accent: string }> = {
    info:    { bg: t.mode === "dark" ? "rgba(32,142,245,0.1)" : "#EFF6FF", accent: "#2563EB" },
    warning: { bg: t.mode === "dark" ? "rgba(234,88,12,0.1)" : "#FFF7ED", accent: "#EA580C" },
    success: { bg: t.mode === "dark" ? "rgba(22,163,74,0.1)" : "#F0FDF4", accent: "#16A34A" },
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
      <span style={{ fontSize: 14, fontWeight: 600, padding: "3px 8px", borderRadius: 6, color: statusColor, flexShrink: 0 }}>{status}</span>
    </div>
  );
}

// ── Rich replies ──────────────────────────────────────────────────────────
const RICH_REPLIES: Record<string, { text: string | null; card?: () => React.ReactNode; followUps?: string[] }> = {
  stats: {
    text: "Here's your delivery overview for today:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Active orders", value: "12", change: "3 pending", positive: true },
          { label: "On-time rate",  value: "91%", change: "↑ 4%", positive: true },
          { label: "Avg delivery",  value: "28 min", change: "↓ 3 min", positive: true },
        ]} />
        <AlertCard type="warning" icon="warning" title="2 orders running late" text="Orders #3480 and #3485 are 10+ minutes behind schedule. Consider reassigning." />
      </>
    ),
    followUps: ["Show late orders", "Show driver status"],
  },
  drivers: {
    text: "Here are your active drivers:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <DriverCard name="Marco Rivera" status="Delivering" orders={3} eta="12 min to next" />
        <DriverCard name="Ana Torres" status="Delivering" orders={2} eta="8 min to next" />
        <DriverCard name="Luis Mendez" status="Returning" orders={0} eta="5 min to store" />
        <DriverCard name="Kira Jones" status="Idle" orders={0} eta="At store" />
      </div>
    ),
    followUps: ["Assign orders to Kira", "Show Marco's route"],
  },
  late: {
    text: "These orders are running late:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <OrderCard id="3480" store="Bella's Pizza" status="Late" time="18 min late · stuck in traffic" />
        <OrderCard id="3485" store="Taco Express" status="Late" time="12 min late · driver en route" />
      </div>
    ),
    followUps: ["Reassign to closest driver", "Notify customers"],
  },
  unassigned: {
    text: "2 orders need a driver:",
    card: () => (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <OrderCard id="3492" store="Sushi Place" status="Unassigned" time="Pickup in 10 min" />
          <OrderCard id="3495" store="Burger Joint" status="Unassigned" time="Pickup in 18 min" />
        </div>
        <AlertCard type="info" icon="person_pin" title="Kira Jones is available" text="She's at the store and can take both orders." />
      </>
    ),
    followUps: ["Assign both to Kira", "Show all available drivers"],
  },
  routes: {
    text: "Today's route summary:",
    card: () => (
      <StatsRow stats={[
        { label: "Total routes", value: "8" },
        { label: "Completed",    value: "5" },
        { label: "In progress",  value: "3" },
      ]} />
    ),
    followUps: ["Show active routes", "Optimize routes"],
  },
  assign: {
    text: null,
    card: () => <AlertCard type="success" icon="check_circle" title="Orders assigned" text="Orders #3492 and #3495 have been assigned to Kira Jones. ETA: 25 min." />,
    followUps: ["Show driver status", "Show all orders"],
  },
  notify: {
    text: null,
    card: () => <AlertCard type="success" icon="check_circle" title="Customers notified" text="Delay notifications sent for orders #3480 and #3485 with updated ETAs." />,
    followUps: ["Show late orders", "Show today's stats"],
  },
  greeting: {
    text: "Hey! I'm your Operations AI. I help you track orders, manage drivers, optimize routes, and keep deliveries on time. What do you need?",
    followUps: ["Today's overview", "Show driver status", "Any late orders?"],
  },
  ack: {
    text: "Anything else I can help with?",
    followUps: ["Today's stats", "Show drivers", "Late orders"],
  },
  help: {
    text: "I can help you with:\n• Track and manage active orders\n• Monitor driver status and locations\n• Reassign orders to available drivers\n• Notify customers about delays\n• Optimize delivery routes\n• View performance stats",
    followUps: ["Today's overview", "Show driver status"],
  },
};

const KEYWORD_MAP = [
  { keys: ["ok", "okay", "got it", "thanks", "thank you", "cool", "nice", "great"],     reply: "ack" },
  { keys: ["hello", "hi", "hey", "good morning"],                                         reply: "greeting" },
  { keys: ["help", "what can you"],                                                        reply: "help" },
  { keys: ["assign", "give to kira", "assign both", "assign to"],                         reply: "assign" },
  { keys: ["notify", "tell customer", "notify customer", "send notification"],             reply: "notify" },
  { keys: ["late", "delayed", "behind", "running late"],                                   reply: "late" },
  { keys: ["unassigned", "no driver", "need driver", "need a driver"],                     reply: "unassigned" },
  { keys: ["driver", "drivers", "active driver", "driver status", "who's available"],      reply: "drivers" },
  { keys: ["route", "routes", "optimize", "routing"],                                      reply: "routes" },
  { keys: ["stats", "overview", "today", "how are", "performance", "summary"],             reply: "stats" },
];

const PLAIN_REPLIES = [
  { text: "I can help with orders, drivers, routes, and delivery tracking. Try asking about today's overview or driver status.", followUps: ["Today's overview", "Show drivers"] },
  { text: "Could you be more specific? I work best with questions about orders, drivers, and delivery operations." },
];

function matchReply(input: string) {
  const lower = input.toLowerCase();
  for (const { keys, reply } of KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) return RICH_REPLIES[reply];
  }
  return null;
}

let plainIdx = 0;

const SUGGESTIONS = [
  "Today's overview",
  "Show driver status",
  "Any late orders?",
  "Unassigned orders",
];

// ── Main component ────────────────────────────────────────────────────────
export default function OperationsChat({ onBack }: { onBack: () => void }) {
  const t = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;
  const hasInput = input.trim().length > 0;

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, followUps: undefined } : m));
    setMessages(prev => [...prev, { role: "user", text: msg, time: nowTime() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = matchReply(msg) ?? PLAIN_REPLIES[plainIdx++ % PLAIN_REPLIES.length];
      setMessages(prev => [...prev, { role: "assistant", text: reply.text, card: reply.card, followUps: reply.followUps, time: nowTime() }]);
      setTyping(false);
    }, 900);
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="arrow_back" size={20} color={t.textMuted} />
        </button>
        <img src="/ai-avatar-circle.svg" alt="" width={30} height={30} style={{ display: "block", borderRadius: "50%" }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Operations AI</span>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="scroll-subtle" style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", padding: isEmpty ? "0 22px" : "12px 22px 20px", ...(isEmpty ? { justifyContent: "center", alignItems: "center" } : {}) }}>
        {isEmpty ? (
          <div style={{ textAlign: "center", marginTop: -40, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <img src="/ai-avatar-circle.svg" alt="" width={56} height={56} style={{ display: "block", marginBottom: 16, borderRadius: "50%" }} />
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: t.text, display: "block", marginBottom: 16 }}>Operations AI</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
              {SUGGESTIONS.map(text => (
                <button key={text} onClick={() => handleSend(text)} style={{ display: "flex", alignItems: "flex-start", padding: "14px 16px", border: "none", borderRadius: 12, background: t.bgTertiary, cursor: "pointer", fontSize: 14, fontWeight: 400, color: t.textSecondary, fontFamily: "inherit", textAlign: "left", lineHeight: "20px", transition: "background 0.15s", minHeight: 52 }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.bgTertiary; }}
                >{text}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {messages.map((msg, i) => msg.role === "user" ? (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ padding: "10px 16px", borderRadius: "14px 14px 4px 14px", background: t.bgTertiary, color: t.text, fontSize: 15, lineHeight: "22px", maxWidth: "85%" }}>{msg.text}</div>
                {msg.time && <span style={{ fontSize: 12, color: t.textMuted, paddingRight: 4 }}>{msg.time}</span>}
              </div>
            ) : (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {msg.text && <div style={{ color: t.text, fontSize: 15, lineHeight: "24px", whiteSpace: "pre-line" }}>{msg.text}</div>}
                {msg.card && msg.card()}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {msg.followUps.map(fu => (
                      <button key={fu} onClick={() => handleSend(fu)} style={{ padding: "8px 16px", border: `1px solid ${t.border}`, borderRadius: 999, background: t.surface, cursor: "pointer", fontSize: 14, fontWeight: 500, color: t.text, fontFamily: "inherit", transition: "background 0.12s, border-color 0.12s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.borderColor = t.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; }}
                      >{fu}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, opacity: 0.4, animation: `mktOrbit 1.2s ease ${i * 0.2}s infinite` }} />)}</div>
                <span style={{ fontSize: 14, color: t.textMuted }}>Checking...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "0 16px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 16, background: t.inputBg, border: `1px solid ${t.borderLight}` }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about orders, drivers, routes..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: "inherit" }}
          />
          <button onClick={() => handleSend()} style={{ width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0, background: hasInput ? t.accent : t.bgTertiary, cursor: hasInput ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s ease" }}>
            <Icon name="arrow_upward" size={20} color={hasInput ? "#FFFFFF" : t.textMuted} weight={500} />
          </button>
        </div>
      </div>
    </div>
  );
}
