import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

interface Msg {
  role: "user" | "assistant";
  text: string | null;
  card?: () => React.ReactNode;
  followUps?: string[];
  time?: string;
}

function nowTime() { const d = new Date(); return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

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
    info: { bg: t.mode === "dark" ? "rgba(32,142,245,0.1)" : "#EFF6FF", accent: "#2563EB" },
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

const RICH_REPLIES: Record<string, { text: string | null; card?: () => React.ReactNode; followUps?: string[] }> = {
  stats: {
    text: "Here's your call activity today:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Total calls", value: "34" },
          { label: "Answered",    value: "28", change: "82%", positive: true },
          { label: "Missed",      value: "6", change: "↓ from 9", positive: true },
        ]} />
        <AlertCard type="info" icon="trending_up" title="Peak hours: 11 AM – 1 PM" text="Most calls come during lunch. Consider adding a second line for that window." />
      </>
    ),
    followUps: ["Show missed calls", "Show reservations"],
  },
  calls: {
    text: "Recent calls:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <CallCard caller="Sarah Johnson" time="12:34 PM" duration="2:15" status="Answered" />
        <CallCard caller="Unknown" time="12:20 PM" duration="0:08" status="Missed" />
        <CallCard caller="David Chen" time="11:55 AM" duration="3:42" status="Answered" />
        <CallCard caller="Catering inquiry" time="11:30 AM" duration="5:10" status="Answered" />
      </div>
    ),
    followUps: ["Call back unknown", "Show call stats"],
  },
  missed: {
    text: "You have 6 missed calls today:",
    card: () => (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <CallCard caller="Unknown" time="12:20 PM" duration="0:08" status="Missed" />
          <CallCard caller="+1 (512) 555-0198" time="11:10 AM" duration="0:12" status="Missed" />
          <CallCard caller="Emma Wilson" time="10:45 AM" duration="0:05" status="Missed" />
        </div>
        <AlertCard type="warning" icon="phone_missed" title="3 in the last hour" text="Consider enabling auto-response for missed calls to capture customer intent." />
      </>
    ),
    followUps: ["Enable auto-response", "Call back Emma"],
  },
  reservations: {
    text: "Upcoming reservations:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { name: "Martinez party", time: "6:00 PM", guests: 4, note: "Birthday — need cake" },
          { name: "Johnson", time: "7:30 PM", guests: 2, note: "Window seat requested" },
          { name: "Corporate dinner", time: "8:00 PM", guests: 12, note: "Pre-ordered menu" },
        ].map(r => {
          const t = useTheme();
          return (
            <div key={r.name} style={{ padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{r.name}</span>
                <span style={{ fontSize: 14, color: t.textMuted }}>{r.time} · {r.guests} guests</span>
              </div>
              <div style={{ fontSize: 14, color: t.textMuted }}>{r.note}</div>
            </div>
          );
        })}
      </div>
    ),
    followUps: ["Add a reservation", "Show today's stats"],
  },
  faq: {
    text: "Top questions customers ask:\n\n1. \"What are your hours?\" — Mon–Sat 11 AM – 10 PM, Sun 12 – 9 PM\n2. \"Do you deliver?\" — Yes, via Shipday. Order at order.lafamiliakatonah.com\n3. \"Do you take reservations?\" — Yes, call or book online\n4. \"Is there parking?\" — Free lot behind the building\n5. \"Are you open on holidays?\" — Check our Google page for holiday hours",
    followUps: ["Edit hours", "Show call stats"],
  },
  autoResponse: {
    text: null,
    card: () => <AlertCard type="success" icon="check_circle" title="Auto-response enabled" text="Missed calls will now receive a text: 'Sorry we missed your call! Text us your question or order at order.lafamiliakatonah.com'" />,
    followUps: ["Edit auto-response", "Show call stats"],
  },
  greeting: {
    text: "Hi! I'm your Receptionist AI. I handle phone calls, take reservations, and answer customer questions — so you don't have to. What do you need?",
    followUps: ["Today's call activity", "Show reservations", "Common FAQs"],
  },
  ack: {
    text: "Anything else?",
    followUps: ["Call stats", "Reservations", "Missed calls"],
  },
  help: {
    text: "I can help you with:\n• Monitor incoming calls and missed calls\n• Manage reservations\n• Auto-respond to missed calls\n• Answer common customer questions\n• View call analytics",
    followUps: ["Today's stats", "Show reservations"],
  },
};

const KEYWORD_MAP = [
  { keys: ["ok", "okay", "got it", "thanks", "thank you", "cool"],       reply: "ack" },
  { keys: ["hello", "hi", "hey"],                                         reply: "greeting" },
  { keys: ["help", "what can you"],                                        reply: "help" },
  { keys: ["auto-response", "auto response", "enable auto"],              reply: "autoResponse" },
  { keys: ["missed", "missed call"],                                       reply: "missed" },
  { keys: ["call", "calls", "phone", "recent call", "call log"],          reply: "calls" },
  { keys: ["reservation", "reservations", "booking", "table"],            reply: "reservations" },
  { keys: ["faq", "common question", "hours", "parking", "deliver"],      reply: "faq" },
  { keys: ["stats", "overview", "today", "activity", "summary"],          reply: "stats" },
];

const PLAIN_REPLIES = [
  { text: "I handle calls, reservations, and customer FAQs. Try asking about today's call activity or reservations.", followUps: ["Today's stats", "Reservations"] },
  { text: "Could you be more specific? I work best with questions about calls, reservations, and customer inquiries." },
];

function matchReply(input: string) {
  const lower = input.toLowerCase();
  for (const { keys, reply } of KEYWORD_MAP) {
    if (keys.some(k => lower.includes(k))) return RICH_REPLIES[reply];
  }
  return null;
}

let plainIdx = 0;

const SUGGESTIONS = [
  "Today's call activity",
  "Show reservations",
  "Missed calls",
  "Common FAQs",
];

export default function ReceptionistChat({ onBack }: { onBack: () => void }) {
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
        <img src="/ai-avatar-pill.svg" alt="" width={30} height={30} style={{ display: "block", borderRadius: "50%" }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Receptionist AI</span>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="scroll-subtle" style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", padding: isEmpty ? "0 22px" : "12px 22px 20px", ...(isEmpty ? { justifyContent: "center", alignItems: "center" } : {}) }}>
        {isEmpty ? (
          <div style={{ textAlign: "center", marginTop: -40, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <img src="/ai-avatar-pill.svg" alt="" width={56} height={56} style={{ display: "block", marginBottom: 16, borderRadius: "50%" }} />
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: t.text, display: "block", marginBottom: 16 }}>Receptionist AI</span>
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
            placeholder="Ask about calls, reservations, FAQs..."
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
