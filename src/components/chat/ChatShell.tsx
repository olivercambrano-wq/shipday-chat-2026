import { useState, useEffect } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";
import ChatPanel from "./ChatPanel";

type Tab = "agents" | "team" | "customers";

const TABS: { key: Tab; icon: string; label: string; badge?: number }[] = [
  { key: "agents",    icon: "auto_awesome", label: "Agents" },
  { key: "team",      icon: "chat",         label: "Team" },
  { key: "customers", icon: "people",       label: "Customers", badge: 2 },
];

const AGENTS = [
  { id: "marketing",    name: "Marketing AI",    icon: "/marketing-manager-logo.svg", isImg: true,  status: "Active", statusColor: "#22C55E", desc: "Campaigns, SMS, coupons, print" },
  { id: "operations",   name: "Operations AI",   icon: "local_shipping",              isImg: false, status: "Active", statusColor: "#22C55E", desc: "Orders, drivers, routes, delivery" },
  { id: "receptionist", name: "Receptionist AI",  icon: "support_agent",              isImg: false, status: "Active", statusColor: "#22C55E", desc: "Phone calls, reservations, FAQs" },
];

// ── Agent list ────────────────────────────────────────────────────────────

function AgentList({ onSelect }: { onSelect: (id: string) => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 22px 16px", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>AI Agents</div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Talk to your agents to get things done</div>
      </div>

      {/* Agent cards */}
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 16px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 18px", borderRadius: 14,
                border: `1px solid ${t.border}`, background: "transparent",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "background 120ms ease, border-color 120ms ease",
                width: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.borderColor = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = t.border; }}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: agent.isImg ? "transparent" : t.bgTertiary,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                {agent.isImg
                  ? <img src={agent.icon} alt="" width={40} height={40} style={{ display: "block", objectFit: "contain" }} />
                  : <Icon name={agent.icon} size={24} color={t.textMuted} />
                }
                <div style={{
                  position: "absolute", bottom: -1, right: -1,
                  width: 12, height: 12, borderRadius: "50%",
                  background: agent.statusColor, border: `2px solid ${t.surface}`,
                }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{agent.name}</div>
                <div style={{ fontSize: 14, color: t.textMuted, marginTop: 2 }}>{agent.desc}</div>
              </div>

              <Icon name="chevron_right" size={20} color={t.textMuted} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Agent chat wrapper (with back button) ─────────────────────────────────

function AgentChat({ agentId, onBack, onClose }: { agentId: string; onBack: () => void; onClose: () => void }) {
  const t = useTheme();
  const agent = AGENTS.find(a => a.id === agentId);

  if (agentId === "marketing") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ChatPanel open={true} onClose={onClose} embedded onBack={onBack} />
      </div>
    );
  }

  // Placeholder for other agents
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 14px", flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", background: "transparent", cursor: "pointer", borderRadius: 99,
            transition: "background 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="arrow_back" size={20} color={t.textMuted} />
        </button>
        {agent?.isImg
          ? <img src={agent.icon} alt="" width={28} height={28} style={{ display: "block", objectFit: "contain" }} />
          : <div style={{ width: 28, height: 28, borderRadius: 8, background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={agent?.icon ?? "smart_toy"} size={18} color={t.textMuted} />
            </div>
        }
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>
          {agent?.name ?? "Agent"}
        </span>
      </div>

      {/* Empty state */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: t.bgTertiary,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={agent?.icon ?? "smart_toy"} size={32} color={t.textMuted} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{agent?.name}</div>
        <div style={{ fontSize: 15, color: t.textMuted, textAlign: "center", lineHeight: "150%", maxWidth: 280 }}>
          {agent?.desc}. This agent is coming soon.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <div style={{ padding: "6px 14px", borderRadius: 999, background: t.bgTertiary, fontSize: 14, fontWeight: 500, color: t.textMuted }}>Coming soon</div>
        </div>
      </div>

      {/* Input disabled */}
      <div style={{ padding: "0 16px 16px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "14px 18px",
          borderRadius: 16, background: t.bgTertiary, opacity: 0.5,
        }}>
          <span style={{ fontSize: 15, color: t.textMuted }}>Ask a question...</span>
        </div>
      </div>
    </div>
  );
}

// ── Simple conversation chat ──────────────────────────────────────────────

function SimpleChat({ person, onBack }: { person: { name: string; initials: string }; onBack: () => void }) {
  const t = useTheme();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{ from: "me" | "them"; text: string }[]>([
    { from: "them", text: `Hey! How can I help you?` },
  ]);

  function send() {
    const msg = input.trim();
    if (!msg) return;
    setMsgs(prev => [...prev, { from: "me", text: msg }]);
    setInput("");
    setTimeout(() => {
      setMsgs(prev => [...prev, { from: "them", text: "Got it, I'll take care of it!" }]);
    }, 1000);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px", flexShrink: 0, borderBottom: `1px solid ${t.border}` }}>
        <button onClick={onBack} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="arrow_back" size={20} color={t.textMuted} />
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
          {person.initials}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{person.name}</span>
      </div>

      {/* Messages */}
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              padding: "10px 16px", borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.from === "me" ? t.bgTertiary : t.accentLight,
              color: t.text, fontSize: 15, lineHeight: "22px", maxWidth: "80%",
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "0 16px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 16, background: t.inputBg, border: `1px solid ${t.borderLight}` }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: "inherit" }}
          />
          <button onClick={send} style={{
            width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0,
            background: input.trim() ? t.accent : t.bgTertiary,
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s ease",
          }}>
            <Icon name="arrow_upward" size={20} color={input.trim() ? "#FFFFFF" : t.textMuted} weight={500} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Team view ─────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: "Marco Rivera", role: "Driver", msg: "Heading to pickup now", time: "2m", online: true },
  { name: "Ana Torres", role: "Driver", msg: "Order #1042 delivered", time: "8m", online: true },
  { name: "Luis Mendez", role: "Driver", msg: "Running 5 min late", time: "15m", online: false },
  { name: "Sofia Martinez", role: "Manager", msg: "Updated the weekend schedule", time: "1h", online: true },
  { name: "Carlos Rivera", role: "Kitchen", msg: "Out of avocado, switching to guac", time: "2h", online: false },
];

function TeamView({ onSelectPerson }: { onSelectPerson: (p: { name: string; initials: string }) => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "20px 22px 16px", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Team</div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Coordinate with your team in real time</div>
      </div>
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 16px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {TEAM_MEMBERS.map(c => (
            <div key={c.name} onClick={() => onSelectPerson({ name: c.name, initials: c.name.split(" ").map(n => n[0]).join("") })} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12,
              cursor: "pointer", transition: "background 120ms ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
                {c.name.split(" ").map(n => n[0]).join("")}
                {c.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{c.name}</span>
                  <span style={{ fontSize: 14, color: t.textMuted }}>· {c.role}</span>
                </div>
                <div style={{ fontSize: 14, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{c.msg}</div>
              </div>
              <span style={{ fontSize: 14, color: t.textMuted, flexShrink: 0 }}>{c.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Customers view ────────────────────────────────────────────────────────

function CustomersView({ onSelectPerson }: { onSelectPerson: (p: { name: string; initials: string }) => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "20px 22px 16px", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Customers</div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Respond to customer inquiries</div>
      </div>
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 16px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { name: "Sarah Johnson", msg: "Where is my order? It's been 45 minutes", time: "Just now", unread: true },
            { name: "David Chen", msg: "Can I change my delivery address?", time: "5m", unread: true },
            { name: "Emma Wilson", msg: "Thanks for the fast delivery!", time: "1h", unread: false },
            { name: "Michael Brown", msg: "Do you have gluten-free options?", time: "2h", unread: false },
            { name: "Lisa Nguyen", msg: "I'd like to place a catering order", time: "3h", unread: false },
          ].map(c => (
            <div key={c.name} onClick={() => onSelectPerson({ name: c.name, initials: c.name.split(" ").map(n => n[0]).join("") })} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12,
              cursor: "pointer", transition: "background 120ms ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: c.unread ? 700 : 500, color: t.text }}>{c.name}</div>
                <div style={{ fontSize: 14, fontWeight: c.unread ? 500 : 400, color: c.unread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{c.msg}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 14, color: t.textMuted }}>{c.time}</span>
                {c.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────────────────

export default function ChatShell({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>("agents");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [activePerson, setActivePerson] = useState<{ name: string; initials: string } | null>(null);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activeAgent) { setActiveAgent(null); }
        else if (activePerson) { setActivePerson(null); }
        else { onClose(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, activeAgent, activePerson]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.03)" }} />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Shipday Chat"
        style={{
          position: "fixed",
          top: 76, right: 16, bottom: 16,
          width: 460, zIndex: 1000,
          display: "flex", flexDirection: "column",
          background: t.surface,
          borderRadius: 20,
          border: "none",
          boxShadow: "0 16px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transform: open ? "translateX(0) scale(1)" : "translateX(20px) scale(0.96)",
          opacity: open ? 1 : 0,
          filter: open ? "blur(0px)" : "blur(4px)",
          transition: "transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease, filter 280ms ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {tab === "agents" && (
            activeAgent
              ? <AgentChat agentId={activeAgent} onBack={() => setActiveAgent(null)} onClose={onClose} />
              : <AgentList onSelect={setActiveAgent} />
          )}
          {tab === "team" && (
            activePerson
              ? <SimpleChat person={activePerson} onBack={() => setActivePerson(null)} />
              : <TeamView onSelectPerson={setActivePerson} />
          )}
          {tab === "customers" && (
            activePerson
              ? <SimpleChat person={activePerson} onBack={() => setActivePerson(null)} />
              : <CustomersView onSelectPerson={setActivePerson} />
          )}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          display: "flex", flexShrink: 0,
          borderTop: `1px solid ${t.border}`,
          background: t.surface,
        }}>
          {TABS.map(tb => {
            const active = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => { setTab(tb.key); setActiveAgent(null); setActivePerson(null); }}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "10px 0 12px", border: "none", background: "transparent",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "color 120ms ease",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Icon name={tb.icon} size={22} color={active ? t.accent : t.textMuted} fill={active} weight={active ? 500 : 300} />
                  {tb.badge && (
                    <div style={{
                      position: "absolute", top: -4, right: -8,
                      minWidth: 16, height: 16, borderRadius: 99,
                      background: "#EF4444", color: "#FFFFFF",
                      fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px",
                    }}>{tb.badge}</div>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? t.accent : t.textMuted }}>{tb.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
