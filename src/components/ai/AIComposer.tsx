import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";
import MarketingChat from "../chat/MarketingChat";
import OperationsChat from "../chat/OperationsChat";
import ReceptionistChat from "../chat/ReceptionistChat";
import AgentProfile, { type AgentCustomization, getAvatarSrc, getGradient } from "../chat/AgentProfile";

// ── Types ────────────────────────────────────────────────────────────────

const AGENTS = [
  { id: "marketing",    name: "Marketing AI",    icon: "/marketing-manager-logo.svg", desc: "Campaigns, SMS, coupons, print" },
  { id: "operations",   name: "Operations AI",   icon: "/ai-avatar-circle.svg",       desc: "Orders, drivers, routes, delivery" },
  { id: "receptionist", name: "Receptionist AI",  icon: "/ai-avatar-pill.svg",        desc: "Phone calls, reservations, FAQs" },
];

type AgentStatus = { isTyping: boolean; lastMsg?: string; lastTime?: string; unread: boolean };

// ── Icon Button with tooltip ─────────────────────────────────────────────

function IconBtn({ icon, label, onClick, size = 22 }: { icon: string; label: string; onClick: () => void; size?: number }) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", outline: "none",
          background: hovered ? t.surfaceHover : "transparent",
          cursor: "pointer", borderRadius: 99, transition: "background 0.12s",
        }}
      >
        <Icon name={icon} size={size} color={t.textMuted} />
      </button>
      {hovered && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "#0F0F0F", color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
          fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
          whiteSpace: "nowrap", zIndex: 99999, pointerEvents: "none",
        }}>
          <div style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, background: "#0F0F0F", transform: "rotate(45deg)", borderRadius: 1 }} />
          {label}
        </div>
      )}
    </div>
  );
}

// ── Agent selector dropdown ──────────────────────────────────────────────

function AgentSelector({ agents, activeId, customizations, onSelect }: {
  agents: typeof AGENTS;
  activeId: string;
  customizations: Record<string, AgentCustomization>;
  onSelect: (id: string) => void;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const custom = customizations[activeId];
  const hasCustom = custom?.avatarId && custom.avatarId !== "default";
  const avatarSrc = hasCustom ? getAvatarSrc(custom.avatarId) : AGENTS.find(a => a.id === activeId)?.icon || "";
  const gradient = hasCustom ? getGradient(custom.colorId) : null;

  useEffect(() => {
    if (!open) return;
    function handler(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 4, padding: "4px 6px 4px 4px",
        border: "none", background: "transparent", cursor: "pointer", borderRadius: 99,
        transition: "background 0.12s",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: gradient ?? "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={avatarSrc} alt="" width={28} height={28} style={{ display: "block", borderRadius: "50%", mixBlendMode: gradient ? "luminosity" : "normal" }} />
        </div>
        <Icon name="expand_more" size={18} color={t.textMuted} />
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14,
          boxShadow: "0 12px 36px rgba(0,0,0,0.14)", zIndex: 9999, overflow: "hidden",
          minWidth: 220, padding: 4,
        }}>
          {agents.map(a => {
            const c = customizations[a.id];
            const hasC = c?.avatarId && c.avatarId !== "default";
            const src = hasC ? getAvatarSrc(c.avatarId) : a.icon;
            const grad = hasC ? getGradient(c.colorId) : null;
            const isActive = a.id === activeId;
            return (
              <button key={a.id} onClick={() => { onSelect(a.id); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", border: "none", borderRadius: 10,
                background: isActive ? t.accentLight : "transparent",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? t.accentLight : "transparent"; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: grad ?? "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <img src={src} alt="" width={32} height={32} style={{ display: "block", borderRadius: "50%", mixBlendMode: grad ? "luminosity" : "normal" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{c?.name ?? a.name}</div>
                  <div style={{ fontSize: 13, color: t.textMuted }}>{a.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Home view — agent list ───────────────────────────────────────────────

function AIHome({ agentStatuses, customizations, onSelectAgent, onClose, onExpand }: {
  agentStatuses: Record<string, AgentStatus>;
  customizations: Record<string, AgentCustomization>;
  onSelectAgent: (id: string) => void;
  onClose: () => void;
  onExpand: () => void;
}) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 16px 22px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>AI Workforce</span>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <IconBtn icon="open_in_full" label="Expand" onClick={onExpand} size={18} />
          <IconBtn icon="close" label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 6px 16px" }}>
        {AGENTS.map(agent => {
          const custom = customizations[agent.id];
          const status = agentStatuses[agent.id];
          const hasCustomAvatar = custom?.avatarId && custom.avatarId !== "default";
          const avatarSrc = hasCustomAvatar ? getAvatarSrc(custom.avatarId) : agent.icon;
          const gradient = hasCustomAvatar ? getGradient(custom.colorId) : null;
          return (
            <button key={agent.id} onClick={() => onSelectAgent(agent.id)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12,
              border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              transition: "background 120ms ease", width: "100%",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: gradient ?? "transparent", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={avatarSrc} alt="" width={44} height={44} style={{ display: "block", borderRadius: "50%", mixBlendMode: gradient ? "luminosity" : "normal" }} />
                </div>
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: status?.unread ? 600 : 500, color: t.text }}>{custom?.name ?? agent.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  {status?.isTyping ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: t.accent, animation: `dotPulse 1.4s ease ${i * 0.16}s infinite` }} />)}
                      </div>
                      <span style={{ fontSize: 15, color: t.accent, fontWeight: 500 }}>Typing…</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 15, color: status?.unread ? t.text : t.textMuted, fontWeight: status?.unread ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {status?.lastMsg ?? agent.desc}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                {status?.lastTime && <span style={{ fontSize: 12, color: t.textMuted }}>{status.lastTime}</span>}
                {status?.unread && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />}
              </div>
            </button>
          );
        })}
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
  const [selectedAgent, setSelectedAgent] = useState("marketing");
  const [barFocused, setBarFocused] = useState(false);
  const [barValue, setBarValue] = useState("");
  const barRef = useRef<HTMLInputElement>(null);

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
      return {
        ...prev,
        [agentId]: {
          isTyping: update.isTyping,
          lastMsg: update.lastMsg ?? current.lastMsg,
          lastTime: update.lastTime ?? current.lastTime,
          unread: update.lastMsg !== undefined && !isActive ? true : current.unread,
        },
      };
    });
  }

  function openAgent(id: string) {
    setActiveAgent(id);
    setSelectedAgent(id);
    setAgentStatuses(prev => ({ ...prev, [id]: { ...prev[id], unread: false } }));
    if (!open) setOpen(true);
  }

  // Simulate incoming messages
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
    if (!msg) return;
    openAgent(selectedAgent);
    setBarValue("");
    // TODO: auto-send msg to the agent
  }

  return (
    <>
      {/* Floating composer bar */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 997,
        display: "flex", alignItems: "center", gap: 4,
        padding: "6px 6px 6px 6px",
        borderRadius: 99,
        background: t.surface,
        border: `1px solid ${barFocused ? t.accent : t.border}`,
        boxShadow: barFocused
          ? `0 8px 32px rgba(0,0,0,0.12), 0 0 0 3px ${t.mode === "dark" ? "rgba(0,128,98,0.15)" : "rgba(0,128,98,0.08)"}`
          : "0 8px 32px rgba(0,0,0,0.12)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        maxWidth: 520, width: "90vw",
      }}>
        <AgentSelector agents={AGENTS} activeId={selectedAgent} customizations={agentCustom} onSelect={setSelectedAgent} />
        <input
          ref={barRef}
          value={barValue}
          onChange={e => setBarValue(e.target.value)}
          onFocus={() => setBarFocused(true)}
          onBlur={() => setBarFocused(false)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleBarSubmit(); } }}
          onClick={() => { if (!open) setOpen(true); }}
          placeholder="Ask anything to your agents"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 15, color: t.text, fontFamily: "inherit", padding: "8px 4px",
          }}
        />
        {/* Unread badge */}
        {unreadCount > 0 && !open && (
          <div style={{
            minWidth: 20, height: 20, borderRadius: 99,
            background: "#EF4444", color: "#FFFFFF",
            fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 6px", flexShrink: 0,
          }}>{unreadCount}</div>
        )}
        <button style={{
          width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0,
          background: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.12s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="mic" size={22} color={t.textMuted} weight={400} />
        </button>
      </div>

      {/* Panel — above the composer bar */}
      <div style={{
        position: "fixed",
        bottom: 88,
        left: "50%",
        transform: open ? "translateX(-50%) translateY(0) scale(1)" : "translateX(-50%) translateY(12px) scale(0.97)",
        width: expanded ? "min(90vw, 900px)" : 460,
        maxHeight: expanded ? "calc(100vh - 120px)" : 520,
        zIndex: 996,
        display: "flex", flexDirection: "column",
        background: t.surface,
        borderRadius: 20,
        border: "none",
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
          <AIHome
            agentStatuses={agentStatuses}
            customizations={agentCustom}
            onSelectAgent={openAgent}
            onClose={() => setOpen(false)}
            onExpand={() => setExpanded(e => !e)}
          />
        )}
      </div>

      {/* Backdrop when open */}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 995, background: "rgba(0,0,0,0.03)" }} />}
    </>
  );
}
