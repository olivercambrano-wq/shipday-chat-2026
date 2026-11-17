import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";
import MarketingChat from "../chat/MarketingChat";
import OperationsChat from "../chat/OperationsChat";
import ReceptionistChat from "../chat/ReceptionistChat";
import AgentProfile, { type AgentCustomization, getAvatarSrc, getGradient } from "../chat/AgentProfile";

// ── Constants ────────────────────────────────────────────────────────────

const AGENTS = [
  { id: "marketing",    name: "Marketing AI",    icon: "/marketing-manager-logo.svg", desc: "Campaigns, SMS, coupons, print" },
  { id: "operations",   name: "Operations AI",   icon: "/ai-avatar-circle.svg",       desc: "Orders, drivers, routes, delivery" },
  { id: "receptionist", name: "Receptionist AI",  icon: "/ai-avatar-pill.svg",        desc: "Phone calls, reservations, FAQs" },
];

type AgentStatus = { isTyping: boolean; lastMsg?: string; lastTime?: string; unread: boolean };

// ── Shared: IconBtn ──────────────────────────────────────────────────────

function IconBtn({ icon, label, onClick, size = 22 }: { icon: string; label: string; onClick: () => void; size?: number }) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", outline: "none", background: hovered ? t.surfaceHover : "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}>
        <Icon name={icon} size={size} color={t.textMuted} />
      </button>
      {hovered && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "#0F0F0F", color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.22)", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 99999, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, background: "#0F0F0F", transform: "rotate(45deg)", borderRadius: 1 }} />
          {label}
        </div>
      )}
    </div>
  );
}

// ── Shared: Agent avatar ─────────────────────────────────────────────────

function AgentAvatar({ agentId, customizations, size = 40 }: { agentId: string; customizations: Record<string, AgentCustomization>; size?: number }) {
  const custom = customizations[agentId];
  const hasCustom = custom?.avatarId && custom.avatarId !== "default";
  const src = hasCustom ? getAvatarSrc(custom.avatarId) : AGENTS.find(a => a.id === agentId)?.icon || "";
  const gradient = hasCustom ? getGradient(custom.colorId) : null;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: gradient ?? "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <img src={src} alt="" width={size} height={size} style={{ display: "block", borderRadius: "50%", mixBlendMode: gradient ? "luminosity" : "normal" }} />
    </div>
  );
}

// ── Hub: Pending items + Activity ────────────────────────────────────────

const PENDING_ITEMS: { agentId: string; icon: string; text: string; count: number; type: "warning" | "info" }[] = [
  { agentId: "marketing",    icon: "campaign",     text: "campaigns pending approval",   count: 2, type: "warning" },
  { agentId: "operations",   icon: "local_shipping", text: "orders running late",        count: 2, type: "warning" },
  { agentId: "receptionist", icon: "phone_missed",   text: "missed calls today",         count: 6, type: "warning" },
];

const ACTIVITY_ITEMS: { agentId: string; text: string; time: string }[] = [
  { agentId: "marketing",    text: "Drafted a weekend SMS campaign for 1,240 subscribers", time: "2 min ago" },
  { agentId: "operations",   text: "Assigned orders #3492 and #3495 to Kira Jones",       time: "5 min ago" },
  { agentId: "receptionist", text: "Booked reservation for Martinez party at 6 PM",        time: "12 min ago" },
  { agentId: "marketing",    text: "Created coupon code WEEKEND20 — 20% off",              time: "1h ago" },
  { agentId: "operations",   text: "Notified customers about delayed orders #3480, #3485", time: "1h ago" },
];

function AIHub({ customizations, onSelectAgent, onClose, onExpand }: {
  customizations: Record<string, AgentCustomization>;
  onSelectAgent: (id: string) => void;
  onClose: () => void;
  onExpand: () => void;
}) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 14px 22px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>AI Workforce</span>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <IconBtn icon="open_in_full" label="Expand" onClick={onExpand} size={18} />
          <IconBtn icon="close" label="Close" onClick={onClose} />
        </div>
      </div>

      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 16px 20px" }}>
        {/* Pending items */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 6px 10px" }}>Needs your attention</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {PENDING_ITEMS.map((item, i) => {
              const agent = AGENTS.find(a => a.id === item.agentId)!;
              const custom = customizations[item.agentId];
              return (
                <button key={i} onClick={() => onSelectAgent(item.agentId)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                  border: "none", background: t.bgTertiary, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: "background 120ms ease", width: "100%",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.bgTertiary; }}
                >
                  <AgentAvatar agentId={item.agentId} customizations={customizations} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: t.text }}>
                      <span style={{ fontWeight: 700 }}>{item.count}</span> {item.text}
                    </div>
                    <div style={{ fontSize: 13, color: t.textMuted, marginTop: 1 }}>{custom?.name ?? agent.name}</div>
                  </div>
                  <Icon name="chevron_right" size={20} color={t.textMuted} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 6px 10px" }}>Recent activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ACTIVITY_ITEMS.map((item, i) => (
              <button key={i} onClick={() => onSelectAgent(item.agentId)} style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 10,
                border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "background 120ms ease", width: "100%",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <AgentAvatar agentId={item.agentId} customizations={customizations} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: t.text, lineHeight: "20px" }}>{item.text}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{item.time}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent rows — quick access */}
        <div style={{ marginTop: 20, borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 6px 10px" }}>Your agents</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {AGENTS.map(agent => {
              const custom = customizations[agent.id];
              return (
                <button key={agent.id} onClick={() => onSelectAgent(agent.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
                  border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: "background 120ms ease", width: "100%",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ position: "relative" }}>
                    <AgentAvatar agentId={agent.id} customizations={customizations} size={36} />
                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{custom?.name ?? agent.name}</div>
                    <div style={{ fontSize: 13, color: t.textMuted }}>{agent.desc}</div>
                  </div>
                  <Icon name="chevron_right" size={18} color={t.textMuted} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Agent chat wrapper ───────────────────────────────────────────────────

function AgentChat({ agentId, onBack, onClose, onEditProfile, customization, onStatusChange, extraActions }: {
  agentId: string; onBack?: () => void; onClose?: () => void; onEditProfile: () => void;
  customization?: AgentCustomization; onStatusChange?: (s: { isTyping: boolean; lastMsg?: string }) => void;
  extraActions?: React.ReactNode;
}) {
  const hasCustomAvatar = customization?.avatarId && customization.avatarId !== "default";
  const avatarSrc = hasCustomAvatar ? getAvatarSrc(customization!.avatarId) : undefined;
  const gradient = hasCustomAvatar ? getGradient(customization!.colorId) : undefined;
  const props = { onBack, onClose, onEditProfile, nameOverride: customization?.name, avatarOverride: avatarSrc, gradientOverride: gradient, onStatusChange, extraActions };
  if (agentId === "marketing") return <MarketingChat {...props} />;
  if (agentId === "operations") return <OperationsChat {...props} />;
  if (agentId === "receptionist") return <ReceptionistChat {...props} />;
  return null;
}

// ── Main AI Composer ─────────────────────────────────────────────────────

export default function AIComposer() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [barFocused, setBarFocused] = useState(false);
  const [barValue, setBarValue] = useState("");

  const [agentCustom, setAgentCustom] = useState<Record<string, AgentCustomization>>({
    marketing:    { name: "Marketing AI",    colorId: "pink",   avatarId: "square" },
    operations:   { name: "Operations AI",   colorId: "ai",     avatarId: "circle" },
    receptionist: { name: "Receptionist AI", colorId: "purple", avatarId: "circle" },
  });

  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({
    marketing: { isTyping: false, unread: false },
    operations: { isTyping: false, unread: false },
    receptionist: { isTyping: false, unread: false },
  });

  const activeAgentRef = useRef<string | null>(null);
  useEffect(() => { activeAgentRef.current = activeAgent; }, [activeAgent]);

  function handleAgentStatus(agentId: string, update: { isTyping: boolean; lastMsg?: string; lastTime?: string }) {
    setAgentStatuses(prev => {
      const current = prev[agentId] ?? { isTyping: false, unread: false };
      const isActive = activeAgentRef.current === agentId;
      return { ...prev, [agentId]: { isTyping: update.isTyping, lastMsg: update.lastMsg ?? current.lastMsg, lastTime: update.lastTime ?? current.lastTime, unread: update.lastMsg !== undefined && !isActive ? true : current.unread } };
    });
  }

  function openAgent(id: string) {
    setActiveAgent(id);
    setEditingAgent(null);
    setAgentStatuses(prev => ({ ...prev, [id]: { ...prev[id], unread: false } }));
    if (!open) setOpen(true);
  }

  // Simulate incoming
  useEffect(() => {
    function now() { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
    const t1 = setTimeout(() => setAgentStatuses(prev => ({ ...prev, operations: { ...prev.operations, isTyping: true } })), 3000);
    const t2 = setTimeout(() => setAgentStatuses(prev => ({ ...prev, operations: { isTyping: false, lastMsg: "2 orders are running late. Want me to reassign?", lastTime: now(), unread: true } })), 5000);
    const t3 = setTimeout(() => setAgentStatuses(prev => ({ ...prev, marketing: { ...prev.marketing, isTyping: true } })), 8000);
    const t4 = setTimeout(() => setAgentStatuses(prev => ({ ...prev, marketing: { isTyping: false, lastMsg: "I drafted an SMS campaign based on your best performers.", lastTime: now(), unread: true } })), 10000);
    const t5 = setTimeout(() => setAgentStatuses(prev => ({ ...prev, receptionist: { ...prev.receptionist, isTyping: true } })), 14000);
    const t6 = setTimeout(() => setAgentStatuses(prev => ({ ...prev, receptionist: { isTyping: false, lastMsg: "You have 6 missed calls today. 3 in the last hour.", lastTime: now(), unread: true } })), 16000);
    return () => { [t1, t2, t3, t4, t5, t6].forEach(clearTimeout); };
  }, []);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editingAgent) setEditingAgent(null);
        else if (activeAgent) setActiveAgent(null);
        else setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, activeAgent, editingAgent]);

  const unreadCount = Object.values(agentStatuses).filter(s => s.unread).length;

  function handleBarSubmit() {
    const msg = barValue.trim();
    if (!msg) { setOpen(true); return; }
    // Simple routing: check keywords
    if (/campaign|sms|market|coupon|flyer|budget/i.test(msg)) openAgent("marketing");
    else if (/order|driver|late|deliver|route|assign/i.test(msg)) openAgent("operations");
    else if (/call|reserv|phone|faq|miss/i.test(msg)) openAgent("receptionist");
    else openAgent("marketing"); // default
    setBarValue("");
  }

  return (
    <>
      {/* ── Floating composer bar ── */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 997,
        display: "flex", alignItems: "center", gap: 2,
        padding: "6px 8px 6px 16px",
        borderRadius: 99,
        background: t.surface,
        border: `1px solid ${barFocused ? t.accent : t.border}`,
        boxShadow: barFocused
          ? `0 8px 32px rgba(0,0,0,0.12), 0 0 0 3px ${t.mode === "dark" ? "rgba(0,128,98,0.15)" : "rgba(0,128,98,0.08)"}`
          : "0 8px 32px rgba(0,0,0,0.12)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        maxWidth: 480, width: "90vw",
      }}>
        <Icon name="auto_awesome" size={20} color={t.accent} fill style={{ flexShrink: 0 }} />
        <input
          value={barValue}
          onChange={e => setBarValue(e.target.value)}
          onFocus={() => { setBarFocused(true); if (!open) setOpen(true); }}
          onBlur={() => setBarFocused(false)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleBarSubmit(); } }}
          placeholder="Ask anything to your agents"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: "inherit", padding: "8px 8px" }}
        />
        {unreadCount > 0 && !open && (
          <div style={{ minWidth: 20, height: 20, borderRadius: 99, background: "#EF4444", color: "#FFFFFF", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", flexShrink: 0 }}>
            {unreadCount}
          </div>
        )}
        <button onClick={() => setOpen(o => !o)} style={{
          width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0,
          background: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.12s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name={open ? "expand_more" : "expand_less"} size={22} color={t.textMuted} weight={400} />
        </button>
      </div>

      {/* ── Panel ── */}
      <div style={{
        position: "fixed",
        bottom: 84,
        left: "50%",
        transform: open ? "translateX(-50%) translateY(0) scale(1)" : "translateX(-50%) translateY(12px) scale(0.97)",
        width: expanded ? "min(92vw, 900px)" : 480,
        maxHeight: expanded ? "calc(100vh - 120px)" : 560,
        zIndex: 996,
        display: "flex", flexDirection: "column",
        background: t.surface,
        borderRadius: 20,
        boxShadow: "0 16px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
        overflow: "hidden",
        opacity: open ? 1 : 0,
        transition: "transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease, width 320ms cubic-bezier(0.16,1,0.3,1), max-height 320ms cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: open ? "auto" : "none",
      }}>
        {editingAgent ? (
          <AgentProfile customization={agentCustom[editingAgent]} onChange={c => setAgentCustom(prev => ({ ...prev, [editingAgent]: c }))} onBack={() => setEditingAgent(null)} />
        ) : activeAgent ? (
          <div key={`ai-${activeAgent}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <AgentChat
              agentId={activeAgent}
              onBack={() => setActiveAgent(null)}
              onClose={() => setOpen(false)}
              onEditProfile={() => setEditingAgent(activeAgent)}
              customization={agentCustom[activeAgent]}
              onStatusChange={s => handleAgentStatus(activeAgent, s)}
              extraActions={
                <IconBtn icon={expanded ? "close_fullscreen" : "open_in_full"} label={expanded ? "Collapse" : "Expand"} onClick={() => setExpanded(e => !e)} size={18} />
              }
            />
          </div>
        ) : (
          <AIHub
            customizations={agentCustom}
            onSelectAgent={openAgent}
            onClose={() => setOpen(false)}
            onExpand={() => setExpanded(e => !e)}
          />
        )}
      </div>

      {/* Backdrop */}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 995, background: "rgba(0,0,0,0.03)" }} />}
    </>
  );
}
