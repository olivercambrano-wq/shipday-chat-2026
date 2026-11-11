import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";
import MarketingChat from "./MarketingChat";
import OperationsChat from "./OperationsChat";
import ReceptionistChat from "./ReceptionistChat";
import AgentProfile, { type AgentCustomization, getAvatarSrc, getGradient } from "./AgentProfile";

type Tab = "agents" | "team" | "customers" | "inbox";
type Layout = "A" | "B";

const TABS_A: { key: Tab; icon: string; label: string }[] = [
  { key: "agents",    icon: "auto_awesome", label: "Agents" },
  { key: "team",      icon: "chat",         label: "Team" },
  { key: "customers", icon: "people",       label: "Customers" },
];

const TABS_B: { key: Tab; icon: string; label: string }[] = [
  { key: "inbox",     icon: "chat",   label: "Inbox" },
  { key: "customers", icon: "people", label: "Customers" },
];

const AGENTS = [
  { id: "marketing",    name: "Marketing AI",    icon: "/marketing-manager-logo.svg", isImg: true,  status: "Active", statusColor: "#22C55E", desc: "Campaigns, SMS, coupons, print" },
  { id: "operations",   name: "Operations AI",   icon: "/ai-avatar-circle.svg",       isImg: true,  status: "Active", statusColor: "#22C55E", desc: "Orders, drivers, routes, delivery" },
  { id: "receptionist", name: "Receptionist AI",  icon: "/ai-avatar-pill.svg",        isImg: true,  status: "Active", statusColor: "#22C55E", desc: "Phone calls, reservations, FAQs" },
];

// ── Agent list ────────────────────────────────────────────────────────────

function ListHeader({ title, onClose, expanded, onToggleExpand }: { title: string; onClose: () => void; expanded?: boolean; onToggleExpand?: () => void }) {
  const t = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 14px 22px", flexShrink: 0 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {onToggleExpand && (
          <button onClick={onToggleExpand} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name={expanded ? "close_fullscreen" : "open_in_full"} size={18} color={t.textMuted} />
          </button>
        )}
        <button onClick={onClose} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="close" size={22} color={t.textMuted} />
        </button>
      </div>
    </div>
  );
}

type AgentStatus = { isTyping: boolean; lastMsg?: string; unread: boolean };

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: `dotPulse 1.4s ease ${i * 0.16}s infinite` }} />
      ))}
    </div>
  );
}

function AgentList({ onSelect, onClose, customizations, agentStatuses, expanded, onToggleExpand }: { onSelect: (id: string) => void; onClose: () => void; customizations: Record<string, AgentCustomization>; agentStatuses: Record<string, AgentStatus>; expanded?: boolean; onToggleExpand?: () => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ListHeader title="AI Agents" onClose={onClose} expanded={expanded} onToggleExpand={onToggleExpand} />

      {/* Agent cards */}
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 10px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {AGENTS.map(agent => {
            const custom = customizations[agent.id];
            const status = agentStatuses[agent.id];
            const hasCustomAvatar = custom?.avatarId && custom.avatarId !== "default";
            const avatarSrc = hasCustomAvatar ? getAvatarSrc(custom!.avatarId) : agent.icon;
            const gradient = hasCustomAvatar ? getGradient(custom!.colorId) : null;
            return (
              <button
                key={agent.id}
                onClick={() => onSelect(agent.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 12,
                  border: "none", background: "transparent",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: "background 120ms ease",
                  width: "100%",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Avatar — outer wrapper holds the green dot so it's not clipped */}
                <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: gradient ?? "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    <img
                      src={avatarSrc}
                      alt=""
                      width={44}
                      height={44}
                      style={{ display: "block", borderRadius: "50%", mixBlendMode: gradient ? "luminosity" : "normal" }}
                    />
                  </div>
                  <div style={{
                    position: "absolute", bottom: -1, right: -1,
                    width: 12, height: 12, borderRadius: "50%",
                    background: "#22C55E", border: `2px solid ${t.surface}`,
                  }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: status?.unread ? 700 : 600, color: t.text }}>{custom?.name ?? agent.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    {status?.isTyping ? (
                      <>
                        <TypingDots color={t.accent} />
                        <span style={{ fontSize: 14, color: t.accent, fontWeight: 500 }}>Typing…</span>
                      </>
                    ) : status?.lastMsg ? (
                      <span style={{ fontSize: 14, color: status.unread ? t.text : t.textMuted, fontWeight: status.unread ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status.lastMsg}</span>
                    ) : (
                      <span style={{ fontSize: 14, color: t.textMuted }}>{agent.desc}</span>
                    )}
                  </div>
                </div>

                {/* Right side: always show chevron, plus red dot if unread */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {status?.unread && (
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />
                  )}
                  <Icon name="chevron_right" size={20} color={t.textMuted} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Agent chat wrapper (with back button) ─────────────────────────────────

function AgentChat({ agentId, onBack, onClose, onEditProfile, customization, onStatusChange }: { agentId: string; onBack: () => void; onClose: () => void; onEditProfile: () => void; customization?: AgentCustomization; onStatusChange?: (s: { isTyping: boolean; lastMsg?: string }) => void }) {
  const hasCustomAvatar = customization?.avatarId && customization.avatarId !== "default";
  const avatarSrc = hasCustomAvatar ? getAvatarSrc(customization!.avatarId) : undefined;
  const gradient = hasCustomAvatar ? getGradient(customization!.colorId) : undefined;
  const props = { onBack, onClose, onEditProfile, nameOverride: customization?.name, avatarOverride: avatarSrc, gradientOverride: gradient, onStatusChange };
  if (agentId === "marketing") return <MarketingChat {...props} />;
  if (agentId === "operations") return <OperationsChat {...props} />;
  if (agentId === "receptionist") return <ReceptionistChat {...props} />;
  return null;
}

// ── Simple conversation chat ──────────────────────────────────────────────

const THREADS: Record<string, { from: "me" | "them"; text: string; day?: string }[]> = {
  "Alex Carter": [
    { from: "me", text: "Alex, can you take the 6 PM run to Westside tomorrow? Three orders.", day: "Yesterday" },
    { from: "them", text: "Sure, I'll be there by 5:45." },
    { from: "me", text: "Order #3472 is ready at the pass 🍕", day: "Today" },
    { from: "them", text: "Picked it up. Leaving now." },
    { from: "them", text: "Customer isn't answering the door. Should I leave it with the concierge?" },
  ],
  "Bella Chong": [
    { from: "me", text: "Morning Bella! You're on the lunch shift today, 11 to 3.", day: "Today" },
    { from: "them", text: "Got it 👍" },
    { from: "me", text: "Two orders for Maple Ave are ready — #3480 and #3481." },
    { from: "them", text: "Traffic on 5th is heavy, I'll be about 10 minutes late on #3481." },
  ],
  "Chris Davis": [
    { from: "them", text: "Car is making a weird noise again.", day: "Monday" },
    { from: "me", text: "Take it to the shop tomorrow morning, we'll cover your first run." },
    { from: "them", text: "Fixed! It was a loose belt.", day: "Yesterday" },
    { from: "me", text: "Great news, thanks for letting me know." },
    { from: "them", text: "Can I swap Friday's shift with Liam? He already said yes.", day: "Today" },
  ],
  "Kira Jones": [
    { from: "me", text: "Kira, the customer for #3490 asked for no-contact delivery.", day: "Today" },
    { from: "them", text: "Noted." },
    { from: "them", text: "Delivered ✅ Left it at the door and sent the photo." },
  ],
  "Diana Kim": [
    { from: "them", text: "I updated the dinner rotation for this week.", day: "Monday" },
    { from: "me", text: "Thanks Diana! Does it include the new drivers?" },
    { from: "them", text: "Yes, Liam and Noah start on Wednesday." },
    { from: "me", text: "Perfect. I'll send them the welcome checklist.", day: "Yesterday" },
  ],
  "Ethan Lee": [
    { from: "them", text: "We're out of garlic bread for tonight.", day: "Yesterday" },
    { from: "me", text: "Okay, I'll mark it as unavailable in the menu." },
    { from: "them", text: "Thanks. Fresh batch tomorrow at 11." },
  ],
};

function SimpleChat({ person, onBack, onClose }: { person: { name: string; initials: string }; onBack: () => void; onClose?: () => void }) {
  const t = useTheme();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const thread = THREADS[person.name] ?? [{ from: "them" as const, text: "Hey! What's up?" }];
  const [msgs, setMsgs] = useState<{ from: "me" | "them"; text: string; day?: string }[]>(thread);

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
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: t.text }}>{person.name}</span>
        {onClose && (
          <button onClick={onClose} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name="close" size={22} color={t.textMuted} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <React.Fragment key={i}>
            {m.day && (i === 0 || msgs[i - 1].day !== m.day) && (
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 500, color: t.textMuted, padding: "8px 0", marginTop: i > 0 ? 8 : 0 }}>{m.day}</div>
            )}
            <div style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", animation: "bubbleIn 250ms cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{
                padding: "10px 16px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.from === "me" ? (t.mode === "dark" ? "#03624C" : "#D0FBE7") : t.bgTertiary,
                color: t.text, fontSize: 15, lineHeight: "22px", maxWidth: "80%",
              }}>
                {m.text}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "0 16px 16px", flexShrink: 0 }}>
        <div style={{
          display: "flex", flexDirection: "column", borderRadius: 18,
          background: t.inputBg,
          border: `1px solid ${focused ? t.accent : t.borderLight}`,
          boxShadow: focused ? `0 0 0 3px ${t.mode === "dark" ? "rgba(0,128,98,0.15)" : "rgba(0,128,98,0.08)"}` : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          overflow: "hidden",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: "inherit", lineHeight: "22px", padding: "14px 18px 6px", width: "100%", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "4px 8px 8px" }}>
            <button onClick={send} style={{
              width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0,
              background: input.trim() ? t.accent : t.bgTertiary,
              cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s ease, transform 0.12s ease",
              transform: input.trim() ? "scale(1)" : "scale(0.95)",
            }}>
              <Icon name="arrow_upward" size={20} color={input.trim() ? "#FFFFFF" : t.textMuted} weight={500} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Team view ─────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: "Alex Carter", role: "Driver", msg: "Customer isn't answering the door. Should I leave it with the concierge?", time: "10:19 AM", online: true, unread: true },
  { name: "Bella Chong", role: "Driver", msg: "Traffic on 5th is heavy, I'll be about 10 minutes late on #3481.", time: "11:46 AM", online: true, unread: true },
  { name: "Chris Davis", role: "Driver", msg: "Can I swap Friday's shift with Liam? He already said yes.", time: "8:47 AM", online: false, unread: true },
  { name: "Kira Jones", role: "Driver", msg: "Delivered ✅ Left it at the door and sent the photo.", time: "12:28 PM", online: true, unread: false },
  { name: "Diana Kim", role: "Dispatcher", msg: "Yes, Liam and Noah start on Wednesday.", time: "Mon", online: false, unread: false },
  { name: "Ethan Lee", role: "Kitchen", msg: "Thanks. Fresh batch tomorrow at 11.", time: "Yesterday", online: false, unread: false },
  { name: "Liam Brooks", role: "Driver", msg: "On my way, be there in 5.", time: "Yesterday", online: true, unread: false },
  { name: "Noah Rivera", role: "Driver", msg: "Can I pick up extra shifts this week?", time: "Mon", online: false, unread: false },
];

const CUSTOMERS = [
  { name: "Sarah Johnson", msg: "Where is my order? It's been 45 minutes", time: "Just now", unread: true },
  { name: "David Chen", msg: "Can I change my delivery address?", time: "5m", unread: true },
  { name: "Emma Wilson", msg: "Thanks for the fast delivery!", time: "1h", unread: false },
  { name: "Michael Brown", msg: "Do you have gluten-free options?", time: "2h", unread: false },
  { name: "Lisa Nguyen", msg: "I'd like to place a catering order", time: "3h", unread: false },
];

function TeamView({ onSelectPerson, onClose, readPersons, expanded, onToggleExpand }: { onSelectPerson: (p: { name: string; initials: string }) => void; onClose: () => void; readPersons: Set<string>; expanded?: boolean; onToggleExpand?: () => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ListHeader title="Team" onClose={onClose} expanded={expanded} onToggleExpand={onToggleExpand} />
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 10px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TEAM_MEMBERS.map(c => {
            const isUnread = c.unread && !readPersons.has(c.name);
            return (
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
                    <span style={{ fontSize: 14, fontWeight: isUnread ? 700 : 600, color: t.text }}>{c.name}</span>
                    <span style={{ fontSize: 14, color: t.textMuted }}>· {c.role}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: isUnread ? 500 : 400, color: isUnread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{c.msg}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, color: t.textMuted }}>{c.time}</span>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Customers view ────────────────────────────────────────────────────────

function CustomersView({ onSelectPerson, onClose, readPersons, expanded, onToggleExpand }: { onSelectPerson: (p: { name: string; initials: string }) => void; onClose: () => void; readPersons: Set<string>; expanded?: boolean; onToggleExpand?: () => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ListHeader title="Customers" onClose={onClose} expanded={expanded} onToggleExpand={onToggleExpand} />
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 10px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CUSTOMERS.map(c => {
            const isUnread = c.unread && !readPersons.has(c.name);
            return (
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
                  <div style={{ fontSize: 14, fontWeight: isUnread ? 700 : 500, color: t.text }}>{c.name}</div>
                  <div style={{ fontSize: 14, fontWeight: isUnread ? 500 : 400, color: isUnread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{c.msg}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, color: t.textMuted }}>{c.time}</span>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Inbox view (Layout B: agents + team combined) ────────────────────────

function InboxView({ onSelectAgent, onSelectPerson, onClose, onCompose, customizations, agentStatuses, readPersons, expanded, onToggleExpand }: {
  onSelectAgent: (id: string) => void;
  onSelectPerson: (p: { name: string; initials: string }) => void;
  onClose: () => void;
  onCompose?: () => void;
  customizations: Record<string, AgentCustomization>;
  agentStatuses: Record<string, AgentStatus>;
  readPersons: Set<string>;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 14px 22px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Inbox</span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {onCompose && (
            <button onClick={onCompose} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="edit_square" size={20} color={t.textMuted} />
            </button>
          )}
          {onToggleExpand && (
            <button onClick={onToggleExpand} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name={expanded ? "close_fullscreen" : "open_in_full"} size={18} color={t.textMuted} />
            </button>
          )}
          <button onClick={onClose} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name="close" size={22} color={t.textMuted} />
          </button>
        </div>
      </div>
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 10px 16px" }}>
        {/* Flat list — agents then team, no section headers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Agents */}
          {AGENTS.map(agent => {
            const custom = customizations[agent.id];
            const status = agentStatuses[agent.id];
            const hasCustomAvatar = custom?.avatarId && custom.avatarId !== "default";
            const avatarSrc = hasCustomAvatar ? getAvatarSrc(custom!.avatarId) : agent.icon;
            const gradient = hasCustomAvatar ? getGradient(custom!.colorId) : null;
            const desc = status?.isTyping ? null : status?.lastMsg ? status.lastMsg : agent.desc;
            return (
              <button key={agent.id} onClick={() => onSelectAgent(agent.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12,
                border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "background 120ms ease", width: "100%",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: gradient ?? "transparent", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={avatarSrc} alt="" width={40} height={40} style={{ display: "block", borderRadius: "50%", mixBlendMode: gradient ? "luminosity" : "normal" }} />
                  </div>
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: status?.unread ? 700 : 600, color: t.text }}>{custom?.name ?? agent.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {status?.isTyping ? (
                      <>
                        <TypingDots color={t.accent} />
                        <span style={{ fontSize: 14, color: t.accent, fontWeight: 500 }}>Typing…</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 14, color: status?.unread ? t.text : t.textMuted, fontWeight: status?.unread ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {status?.unread && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />}
                  <Icon name="chevron_right" size={20} color={t.textMuted} />
                </div>
              </button>
            );
          })}
          {/* Team members */}
          {TEAM_MEMBERS.map(c => {
            const isUnread = c.unread && !readPersons.has(c.name);
            return (
              <div key={c.name} onClick={() => onSelectPerson({ name: c.name, initials: c.name.split(" ").map(n => n[0]).join("") })} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12,
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
                  <div style={{ fontSize: 14, fontWeight: isUnread ? 700 : 600, color: t.text }}>{c.name}</div>
                  <div style={{ fontSize: 14, fontWeight: isUnread ? 500 : 400, color: isUnread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{c.msg}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, color: t.textMuted }}>{c.time}</span>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── New Message view (contact picker with search) ────────────────────────

const ALL_CONTACTS = [
  ...AGENTS.map(a => ({ type: "agent" as const, id: a.id, name: a.name, desc: a.desc })),
  ...TEAM_MEMBERS.map(c => ({ type: "person" as const, id: c.name, name: c.name, desc: c.role })),
  ...CUSTOMERS.map(c => ({ type: "customer" as const, id: c.name, name: c.name, desc: "Customer" })),
];

function NewMessageView({ onSelectAgent, onSelectPerson, onBack }: {
  onSelectAgent: (id: string) => void;
  onSelectPerson: (p: { name: string; initials: string }) => void;
  onBack: () => void;
}) {
  const t = useTheme();
  const [search, setSearch] = useState("");
  const lower = search.toLowerCase();
  const filtered = lower ? ALL_CONTACTS.filter(c => c.name.toLowerCase().includes(lower)) : ALL_CONTACTS;

  function select(c: typeof ALL_CONTACTS[0]) {
    if (c.type === "agent") onSelectAgent(c.id);
    else onSelectPerson({ name: c.name, initials: c.name.split(" ").map(n => n[0]).join("") });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 0 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>New Message</span>
          <button onClick={onBack} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name="close" size={22} color={t.textMuted} />
          </button>
        </div>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 14px", height: 42, borderRadius: 12,
          background: t.bgTertiary, marginBottom: 8,
        }}>
          <span style={{ fontSize: 14, color: t.textMuted, flexShrink: 0 }}>To:</span>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: t.text, fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "4px 10px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map(c => (
            <button key={`${c.type}-${c.id}`} onClick={() => select(c)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12,
              border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              transition: "background 120ms ease", width: "100%",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{c.name}</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>{c.desc}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 14, color: t.textMuted }}>No results for "{search}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────────────────

export { type Layout };

export default function ChatShell({ open, onClose, deepLinkAgent, layout = "A", onLayoutChange }: { open: boolean; onClose: () => void; deepLinkAgent?: string; layout?: Layout; onLayoutChange?: (l: Layout) => void }) {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>(layout === "A" ? "agents" : "inbox");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [activePerson, setActivePerson] = useState<{ name: string; initials: string } | null>(null);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [readPersons, setReadPersons] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [composing, setComposing] = useState(false);
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

  // Track activeAgent in a ref so status callbacks always see the latest value
  const activeAgentRef = useRef<string | null>(null);
  useEffect(() => { activeAgentRef.current = activeAgent; }, [activeAgent]);

  function updateAgent(id: string, c: AgentCustomization) {
    setAgentCustom(prev => ({ ...prev, [id]: c }));
  }

  function handleAgentStatus(agentId: string, update: { isTyping: boolean; lastMsg?: string }) {
    setAgentStatuses(prev => {
      const current = prev[agentId] ?? { isTyping: false, unread: false };
      const isActive = activeAgentRef.current === agentId;
      return {
        ...prev,
        [agentId]: {
          isTyping: update.isTyping,
          lastMsg: update.lastMsg ?? current.lastMsg,
          unread: update.lastMsg !== undefined && !isActive ? true : current.unread,
        },
      };
    });
  }

  function openAgent(id: string) {
    setActiveAgent(id);
    setAgentStatuses(prev => ({ ...prev, [id]: { ...prev[id], unread: false } }));
  }

  function openPerson(p: { name: string; initials: string }) {
    setActivePerson(p);
    setReadPersons(prev => new Set([...prev, p.name]));
  }

  // Sync tab when layout changes
  useEffect(() => {
    const validA: Tab[] = ["agents", "team", "customers"];
    const validB: Tab[] = ["inbox", "customers"];
    const valid = layout === "A" ? validA : validB;
    if (!valid.includes(tab)) {
      setTab(layout === "A" ? "agents" : "inbox");
      setActiveAgent(null);
      setActivePerson(null);
      setEditingAgent(null);
    }
  }, [layout]);

  // Deep-link: when panel opens with a specific agent, navigate directly to it
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current && deepLinkAgent) {
      setTab("agents");
      openAgent(deepLinkAgent);
      setActivePerson(null);
      setEditingAgent(null);
    }
    prevOpenRef.current = open;
  }, [open, deepLinkAgent]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (composing) { setComposing(false); }
        else if (editingAgent) { setEditingAgent(null); }
        else if (activeAgent) { setActiveAgent(null); }
        else if (activePerson) { setActivePerson(null); }
        else { onClose(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, activeAgent, activePerson, editingAgent]);

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
          top: expanded ? 12 : 76,
          right: 16,
          bottom: expanded ? 12 : 16,
          width: expanded ? 680 : 460,
          zIndex: 1000,
          display: "flex", flexDirection: "column",
          background: t.surface,
          borderRadius: 20,
          border: "none",
          boxShadow: "0 16px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transform: open ? "translateX(0) scale(1)" : "translateX(20px) scale(0.96)",
          opacity: open ? 1 : 0,
          filter: open ? "blur(0px)" : "blur(4px)",
          transition: "transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease, filter 280ms ease, top 320ms cubic-bezier(0.16,1,0.3,1), bottom 320ms cubic-bezier(0.16,1,0.3,1), width 320ms cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          {tab === "agents" && (
            editingAgent
              ? <AgentProfile customization={agentCustom[editingAgent]} onChange={c => updateAgent(editingAgent, c)} onBack={() => setEditingAgent(null)} />
              : activeAgent
              ? <div key={`agent-${activeAgent}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><AgentChat agentId={activeAgent} onBack={() => setActiveAgent(null)} onClose={onClose} onEditProfile={() => setEditingAgent(activeAgent)} customization={agentCustom[activeAgent]} onStatusChange={s => handleAgentStatus(activeAgent, s)} /></div>
              : <div key="agent-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><AgentList onSelect={openAgent} onClose={onClose} customizations={agentCustom} agentStatuses={agentStatuses} expanded={expanded} onToggleExpand={() => setExpanded(e => !e)} /></div>
          )}
          {tab === "team" && (
            activePerson
              ? <div key={`team-${activePerson.name}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><SimpleChat person={activePerson} onBack={() => setActivePerson(null)} onClose={onClose} /></div>
              : <div key="team-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><TeamView onSelectPerson={openPerson} onClose={onClose} readPersons={readPersons} expanded={expanded} onToggleExpand={() => setExpanded(e => !e)} /></div>
          )}
          {tab === "inbox" && (
            composing
              ? <NewMessageView onSelectAgent={id => { setComposing(false); openAgent(id); }} onSelectPerson={p => { setComposing(false); openPerson(p); }} onBack={() => setComposing(false)} />
              : editingAgent
              ? <AgentProfile customization={agentCustom[editingAgent]} onChange={c => updateAgent(editingAgent, c)} onBack={() => setEditingAgent(null)} />
              : activeAgent
              ? <div key={`inbox-agent-${activeAgent}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><AgentChat agentId={activeAgent} onBack={() => setActiveAgent(null)} onClose={onClose} onEditProfile={() => setEditingAgent(activeAgent)} customization={agentCustom[activeAgent]} onStatusChange={s => handleAgentStatus(activeAgent, s)} /></div>
              : activePerson
              ? <div key={`inbox-team-${activePerson.name}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><SimpleChat person={activePerson} onBack={() => setActivePerson(null)} onClose={onClose} /></div>
              : <div key="inbox-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><InboxView onSelectAgent={openAgent} onSelectPerson={openPerson} onCompose={() => setComposing(true)} onClose={onClose} customizations={agentCustom} agentStatuses={agentStatuses} readPersons={readPersons} expanded={expanded} onToggleExpand={() => setExpanded(e => !e)} /></div>
          )}
          {tab === "customers" && (
            activePerson
              ? <div key={`cust-${activePerson.name}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><SimpleChat person={activePerson} onBack={() => setActivePerson(null)} onClose={onClose} /></div>
              : <div key="cust-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><CustomersView onSelectPerson={openPerson} onClose={onClose} readPersons={readPersons} expanded={expanded} onToggleExpand={() => setExpanded(e => !e)} /></div>
          )}
        </div>

        {/* Bottom tab bar — hidden when inside a conversation */}
        {!activeAgent && !activePerson && !editingAgent && !composing && (() => {
          const customerUnread = CUSTOMERS.filter(c => c.unread && !readPersons.has(c.name)).length;
          const teamUnread = TEAM_MEMBERS.filter(c => c.unread && !readPersons.has(c.name)).length;
          const agentUnread = Object.values(agentStatuses).filter(s => s.unread).length;
          const badges: Record<string, number> = { customers: customerUnread, team: teamUnread, agents: agentUnread, inbox: agentUnread + teamUnread };
          const tabs = layout === "A" ? TABS_A : TABS_B;
          return (
            <div style={{ flexShrink: 0, borderTop: `1px solid ${t.border}`, background: t.surface, position: "relative" }}>
              <div style={{ display: "flex", padding: "6px 8px 10px", gap: 4 }}>
                {tabs.map(tb => {
                  const active = tab === tb.key;
                  const badge = badges[tb.key] ?? 0;
                  return (
                    <button
                      key={tb.key}
                      onClick={() => { setTab(tb.key); setActiveAgent(null); setActivePerson(null); }}
                      style={{
                        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        padding: "10px 0 8px", border: "none",
                        background: "transparent",
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "opacity 150ms ease",
                        position: "relative",
                        opacity: active ? 1 : 0.55,
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = "0.8"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = "0.55"; }}
                    >
                      <div style={{ position: "relative" }}>
                        <Icon name={tb.icon} size={24} color={t.text} fill={active} weight={active ? 600 : 400} />
                        {badge > 0 && (
                          <div style={{
                            position: "absolute", top: -5, right: -10,
                            minWidth: 18, height: 18, borderRadius: 99,
                            background: "#EF4444", color: "#FFFFFF",
                            fontSize: 12, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "0 5px",
                          }}>{badge}</div>
                        )}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: t.text }}>{tb.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
