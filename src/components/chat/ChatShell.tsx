import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";
import MarketingChat from "./MarketingChat";
import OperationsChat from "./OperationsChat";
import ReceptionistChat from "./ReceptionistChat";
import AgentProfile, { type AgentCustomization, getAvatarSrc, getGradient } from "./AgentProfile";

// ── Tooltip icon button ──────────────────────────────────────────────────

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

function CollapsibleSection({ title, count, badge, defaultOpen = true, children }: { title: string; count?: number; badge?: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const t = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0);

  useEffect(() => {
    if (open) {
      const h = contentRef.current?.scrollHeight ?? 0;
      setHeight(h);
      const timer = setTimeout(() => setHeight("auto"), 250);
      return () => clearTimeout(timer);
    } else {
      // Set explicit height first so transition works from current height to 0
      const h = contentRef.current?.scrollHeight ?? 0;
      setHeight(h);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        padding: "11px 16px", border: "none", background: "transparent",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <Icon name={open ? "expand_more" : "chevron_right"} size={20} color={t.textMuted} />
        <span style={{ fontSize: 15, fontWeight: 500, color: t.textSecondary, flex: 1 }}>{title}</span>
        {!open && badge && badge > 0 ? (
          <div style={{ minWidth: 18, height: 18, borderRadius: 99, background: "#EF4444", color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{badge}</div>
        ) : count !== undefined ? (
          <span style={{ fontSize: 13, color: t.textMuted }}>{count}</span>
        ) : null}
      </button>
      <div
        ref={contentRef}
        style={{
          height: height === "auto" ? "auto" : height,
          overflow: "hidden",
          transition: height === "auto" ? "none" : "height 220ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PersonAvatar({ name, avatar, size = 40, online }: { name: string; avatar?: string; size?: number; online?: boolean }) {
  const t = useTheme();
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {avatar ? (
        <img src={avatar} alt="" width={size} height={size} style={{ display: "block", borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: t.textSecondary }}>
          {initials}
        </div>
      )}
      {online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />}
    </div>
  );
}

// ── Agent list ────────────────────────────────────────────────────────────

function ListHeader({ title, onClose, panelSize, onCycleSize }: { title: string; onClose?: () => void; panelSize?: string; onCycleSize?: () => void }) {
  const t = useTheme();
  const icon = panelSize === "full" ? "close_fullscreen" : "open_in_full";
  const label = panelSize === "full" ? "Collapse" : panelSize === "expanded" ? "Full view" : "Expand";
  const hasActions = onCycleSize || onClose;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 16px 22px", flexShrink: 0 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{title}</span>
      {hasActions && (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {onCycleSize && <IconBtn icon={icon} label={label} onClick={onCycleSize} size={18} />}
          {onClose && <IconBtn icon="close" label="Close" onClick={onClose} />}
        </div>
      )}
    </div>
  );
}

type AgentStatus = { isTyping: boolean; lastMsg?: string; lastTime?: string; unread: boolean };

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: `dotPulse 1.4s ease ${i * 0.16}s infinite` }} />
      ))}
    </div>
  );
}

function AgentList({ onSelect, onClose, customizations, agentStatuses, panelSize, onCycleSize }: { onSelect: (id: string) => void; onClose: () => void; customizations: Record<string, AgentCustomization>; agentStatuses: Record<string, AgentStatus>; panelSize?: string; onCycleSize?: () => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ListHeader title="AI Workforce" onClose={onClose} panelSize={panelSize} onCycleSize={onCycleSize} />

      {/* Agent cards */}
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 6px 16px" }}>
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
                  <div style={{ fontSize: 15, fontWeight: status?.unread ? 600 : 500, color: t.text }}>{custom?.name ?? agent.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    {status?.isTyping ? (
                      <>
                        <TypingDots color={t.accent} />
                        <span style={{ fontSize: 15, color: t.accent, fontWeight: 500 }}>Typing…</span>
                      </>
                    ) : status?.lastMsg ? (
                      <span style={{ fontSize: 15, color: status.unread ? t.text : t.textMuted, fontWeight: status.unread ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status.lastMsg}</span>
                    ) : (
                      <span style={{ fontSize: 15, color: t.textMuted }}>{agent.desc}</span>
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

function AgentChat({ agentId, onBack, onClose, onEditProfile, customization, onStatusChange, hideBack, extraActions }: { agentId: string; onBack: () => void; onClose: () => void; onEditProfile: () => void; customization?: AgentCustomization; onStatusChange?: (s: { isTyping: boolean; lastMsg?: string }) => void; hideBack?: boolean; extraActions?: React.ReactNode }) {
  const hasCustomAvatar = customization?.avatarId && customization.avatarId !== "default";
  const avatarSrc = hasCustomAvatar ? getAvatarSrc(customization!.avatarId) : undefined;
  const gradient = hasCustomAvatar ? getGradient(customization!.colorId) : undefined;
  const props = { onBack: hideBack ? undefined : onBack, onClose, onEditProfile, nameOverride: customization?.name, avatarOverride: avatarSrc, gradientOverride: gradient, onStatusChange, extraActions };
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
  "Emma Wilson": [
    { from: "them", text: "Thanks for the fast delivery!", day: "Today" },
  ],
  "Lisa Nguyen": [
    { from: "them", text: "Food was great but delivery took too long. Over 50 minutes.", day: "Today" },
  ],
  "Maria Garcia": [
    { from: "them", text: "My order arrived cold, very disappointed. The driver seemed lost.", day: "Yesterday" },
  ],
  "James Park": [
    { from: "them", text: "Best pizza in town! Will order again", day: "Today" },
  ],
  "Sarah Johnson": [
    { from: "them", text: "Where is my order? It's been 45 minutes", day: "Today" },
  ],
  "David Chen": [
    { from: "them", text: "Can I change my delivery address? I'm at work not home.", day: "Today" },
  ],
  "Michael Brown": [
    { from: "them", text: "Do you have gluten-free options? My wife has celiac.", day: "Today" },
  ],
};

function ReviewSummaryCard({ review }: { review: ReviewData }) {
  const t = useTheme();
  function Stars({ count }: { count: number }) {
    return (
      <span style={{ display: "inline-flex", gap: 2 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name="star" size={18} color={i < count ? "#F5B400" : t.borderLight} fill />
        ))}
      </span>
    );
  }
  return (
    <div style={{ padding: "18px 20px", borderRadius: 14, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="receipt_long" size={20} color={t.textMuted} />
        <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Order {review.orderId}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px" }}>
        <span style={{ fontSize: 14, color: t.textMuted }}>Placed</span>
        <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{review.placedAt}</span>
        <span style={{ fontSize: 14, color: t.textMuted }}>Delivered</span>
        <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{review.deliveredAt}</span>
        <span style={{ fontSize: 14, color: t.textMuted }}>Total</span>
        <span style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{review.total}</span>
      </div>
      <div style={{ height: 1, background: t.border }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>Food</span>
          <Stars count={review.food} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>Driver</span>
          <Stars count={review.driver} />
        </div>
      </div>
      {review.comment && (
        <>
          <div style={{ height: 1, background: t.border }} />
          <div style={{ fontSize: 15, color: t.text, lineHeight: "22px", fontStyle: "italic" }}>&ldquo;{review.comment}&rdquo;</div>
        </>
      )}
    </div>
  );
}

function SimpleChat({ person, onBack, onClose, reviewData, hideBack, extraActions }: { person: { name: string; initials: string }; onBack: () => void; onClose?: () => void; reviewData?: ReviewData; hideBack?: boolean; extraActions?: React.ReactNode }) {
  const t = useTheme();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = THREADS[person.name] ?? [{ from: "them" as const, text: "Hey! What's up?" }];
  const [msgs, setMsgs] = useState<{ from: "me" | "them"; text: string; day?: string; time?: string }[]>(thread);

  const replyIdx = useRef(0);
  const REPLIES = ["Got it, I'll take care of it!", "Sounds good 👍", "On it!", "Thanks for letting me know.", "Roger that, updating now.", "Will do!", "Sure thing!"];

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, isTyping]);

  function send() {
    const msg = input.trim();
    if (!msg) return;
    setMsgs(prev => [...prev, { from: "me", text: msg, time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMsgs(prev => [...prev, { from: "them", text: REPLIES[replyIdx.current++ % REPLIES.length], time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }]);
    }, 1200);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", flexShrink: 0 }}>
        {!hideBack && <IconBtn icon="arrow_back" label="Back" onClick={onBack} size={20} />}
        <PersonAvatar name={person.name} avatar={TEAM_MEMBERS.find(m => m.name === person.name)?.avatar} size={32} />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: t.text }}>{person.name}</span>
        {extraActions}
        {onClose && <IconBtn icon="close" label="Close" onClick={onClose} />}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "12px 22px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {reviewData && (
          <div style={{ marginBottom: 8 }}>
            <ReviewSummaryCard review={reviewData} />
          </div>
        )}
        {msgs.map((m, i) => {
          const isLast = i === msgs.length - 1;
          const isLastMe = isLast && m.from === "me";
          const avatar = TEAM_MEMBERS.find(t => t.name === person.name)?.avatar;
          return (
            <React.Fragment key={i}>
              {m.day && (i === 0 || msgs[i - 1].day !== m.day) && (
                <div style={{ textAlign: "center", fontSize: 12, fontWeight: 500, color: t.textMuted, padding: "8px 0", marginTop: i > 0 ? 8 : 0 }}>{m.day}</div>
              )}
              {m.from === "me" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, animation: "bubbleIn 250ms cubic-bezier(0.16,1,0.3,1) both" }}>
                  <div style={{
                    padding: "10px 16px", borderRadius: "16px 16px 4px 16px",
                    background: t.mode === "dark" ? "#03624C" : "#D0FBE7",
                    color: t.text, fontSize: 15, lineHeight: "22px", maxWidth: "80%",
                  }}>{m.text}</div>
                  {m.time && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 4 }}>
                      <span style={{ fontSize: 12, color: t.textMuted }}>{m.time}</span>
                      {isLastMe && <Icon name="done_all" size={14} color={t.accent} />}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, animation: "bubbleIn 250ms cubic-bezier(0.16,1,0.3,1) both" }}>
                  <PersonAvatar name={person.name} avatar={avatar} size={28} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{
                      padding: "10px 16px", borderRadius: "16px 16px 16px 4px",
                      background: t.bgTertiary,
                      color: t.text, fontSize: 15, lineHeight: "22px", maxWidth: "80%",
                    }}>{m.text}</div>
                    {m.time && <span style={{ fontSize: 12, color: t.textMuted, paddingLeft: 4 }}>{m.time}</span>}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, animation: "bubbleIn 250ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <PersonAvatar name={person.name} avatar={TEAM_MEMBERS.find(m => m.name === person.name)?.avatar} size={28} />
            <div style={{ display: "flex", gap: 5 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: t.accent, animation: `dotPulse 1.4s ease ${i * 0.16}s infinite` }} />)}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "0 22px 20px", flexShrink: 0, maxWidth: 768, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{
          display: "flex", flexDirection: "column", borderRadius: 18,
          background: t.inputBg,
          border: `1px solid ${focused ? t.accent : t.borderLight}`,
          boxShadow: focused ? `0 0 0 3px ${t.mode === "dark" ? "rgba(0,128,98,0.15)" : "rgba(0,128,98,0.08)"}` : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            rows={1}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: "inherit", lineHeight: "22px", padding: "14px 18px 6px", width: "100%", boxSizing: "border-box", resize: "none", maxHeight: 120 }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 8px", position: "relative" }}>
            <button onClick={() => setShowAttach(s => !s)} style={{
              width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0,
              background: showAttach ? t.surfaceHover : "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.12s, transform 0.2s ease",
              transform: showAttach ? "rotate(45deg)" : "rotate(0deg)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={e => { if (!showAttach) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="add" size={22} color={t.textMuted} weight={400} />
            </button>
            {showAttach && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 4px)", left: 8,
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 4, zIndex: 10,
                display: "flex", flexDirection: "column", minWidth: 180,
              }}>
                {[
                  { icon: "image", label: "Photo or video" },
                  { icon: "attach_file", label: "File" },
                  { icon: "location_on", label: "Location" },
                ].map(item => (
                  <button key={item.label} onClick={() => setShowAttach(false)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    border: "none", background: "transparent", borderRadius: 8,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: t.text,
                    transition: "background 0.1s", width: "100%", textAlign: "left",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon name={item.icon} size={20} color={t.textMuted} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {!input.trim() && !recording && (
                <button onClick={() => { setRecording(true); setTimeout(() => setRecording(false), 3000); }} style={{
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
              )}
              {recording && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "dotPulse 1.4s ease infinite" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Recording...</span>
                  <button onClick={() => setRecording(false)} style={{
                    width: 28, height: 28, borderRadius: 99, border: "none", flexShrink: 0,
                    background: t.bgTertiary, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="stop" size={16} color={t.textMuted} fill />
                  </button>
                </div>
              )}
              {!recording && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Team view ─────────────────────────────────────────────────────────────

const TEAM_MEMBERS: { name: string; role: string; msg: string; time: string; online: boolean; unread: boolean; avatar?: string }[] = [
  { name: "Alex Carter", role: "Driver", msg: "Customer isn't answering the door. Should I leave it with the concierge?", time: "10:19 AM", online: true, unread: true, avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Bella Chong", role: "Driver", msg: "Traffic on 5th is heavy, I'll be about 10 minutes late on #3481.", time: "11:46 AM", online: true, unread: false, avatar: "https://i.pravatar.cc/80?img=5" },
  { name: "Chris Davis", role: "Driver", msg: "Can I swap Friday's shift with Liam? He already said yes.", time: "8:47 AM", online: false, unread: false },
  { name: "Kira Jones", role: "Driver", msg: "Delivered ✅ Left it at the door and sent the photo.", time: "12:28 PM", online: true, unread: false, avatar: "https://i.pravatar.cc/80?img=23" },
  { name: "Diana Kim", role: "Dispatcher", msg: "Yes, Liam and Noah start on Wednesday.", time: "Mon", online: false, unread: false, avatar: "https://i.pravatar.cc/80?img=25" },
  { name: "Ethan Lee", role: "Kitchen", msg: "Thanks. Fresh batch tomorrow at 11.", time: "Yesterday", online: false, unread: false },
  { name: "Liam Brooks", role: "Driver", msg: "On my way, be there in 5.", time: "Yesterday", online: true, unread: false, avatar: "https://i.pravatar.cc/80?img=53" },
  { name: "Noah Rivera", role: "Driver", msg: "Can I pick up extra shifts this week?", time: "Mon", online: false, unread: false, avatar: "https://i.pravatar.cc/80?img=14" },
];

type ReviewData = { orderId: string; placedAt: string; deliveredAt: string; total: string; food: number; driver: number; comment: string };

const CUSTOMERS: { name: string; msg: string; time: string; unread: boolean; type: "support" | "review"; rating?: number; review?: ReviewData }[] = [
  { name: "Sarah Johnson", msg: "Where is my order? It's been 45 minutes", time: "Just now", unread: true, type: "support" },
  { name: "David Chen", msg: "Can I change my delivery address?", time: "5m", unread: false, type: "support" },
  { name: "Emma Wilson", msg: "Thanks for the fast delivery!", time: "1h", unread: false, type: "review", rating: 5, review: { orderId: "#5588991448814", placedAt: "Nov 10 at 12:43 PM", deliveredAt: "Nov 10 at 12:51 PM", total: "$24.50", food: 5, driver: 5, comment: "Thanks for the fast delivery!" } },
  { name: "Michael Brown", msg: "Do you have gluten-free options?", time: "2h", unread: false, type: "support" },
  { name: "Lisa Nguyen", msg: "Food was great but delivery took too long", time: "3h", unread: false, type: "review", rating: 3, review: { orderId: "#5588991449021", placedAt: "Nov 10 at 7:12 PM", deliveredAt: "Nov 10 at 8:05 PM", total: "$38.90", food: 4, driver: 2, comment: "Food was great but delivery took too long. Over 50 minutes." } },
  { name: "James Park", msg: "Best pizza in town! Will order again", time: "5h", unread: false, type: "review", rating: 5, review: { orderId: "#5588991449103", placedAt: "Nov 10 at 6:30 PM", deliveredAt: "Nov 10 at 6:58 PM", total: "$19.99", food: 5, driver: 5, comment: "Best pizza in town! Will order again" } },
  { name: "Maria Garcia", msg: "My order arrived cold, very disappointed", time: "Yesterday", unread: false, type: "review", rating: 2, review: { orderId: "#5588991448590", placedAt: "Nov 9 at 8:15 PM", deliveredAt: "Nov 9 at 9:22 PM", total: "$42.00", food: 2, driver: 1, comment: "My order arrived cold, very disappointed. The driver seemed lost." } },
];

function TeamView({ onSelectPerson, onClose, readPersons, panelSize, onCycleSize }: { onSelectPerson: (p: { name: string; initials: string }) => void; onClose: () => void; readPersons: Set<string>; panelSize?: string; onCycleSize?: () => void }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ListHeader title="Team" onClose={onClose} panelSize={panelSize} onCycleSize={onCycleSize} />
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 6px 16px" }}>
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
                <PersonAvatar name={c.name} avatar={c.avatar} online={c.online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: isUnread ? 600 : 500, color: t.text }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: t.textMuted }}>· {c.role}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: isUnread ? 500 : 400, color: isUnread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{c.msg}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: t.textMuted }}>{c.time}</span>
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

function CustomerRow({ c, isUnread, isActive, onClick }: { c: typeof CUSTOMERS[0]; isUnread: boolean; isActive?: boolean; onClick: () => void }) {
  const t = useTheme();
  const isReview = c.type === "review";
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 16px", borderRadius: 12,
      cursor: "pointer", transition: "background 120ms ease",
      background: isActive ? t.accentLight : "transparent",
    }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.surfaceHover; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.mode === "dark" ? "#2A2A2A" : "#EEECEA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
        {c.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: isUnread ? 600 : 500, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
        {isReview && c.review ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, overflow: "hidden", whiteSpace: "nowrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}><span style={{ fontSize: 13, color: t.textMuted }}>Order</span><span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{c.review.food}</span><Icon name="star" size={13} color="#F5B400" fill /></span>
            <span style={{ fontSize: 13, color: t.textMuted, flexShrink: 0 }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}><span style={{ fontSize: 13, color: t.textMuted }}>Driver</span><span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{c.review.driver}</span><Icon name="star" size={13} color="#F5B400" fill /></span>
            <span style={{ fontSize: 13, color: t.textMuted, flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 14, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis" }}>{c.msg}</span>
          </div>
        ) : (
          <div style={{ fontSize: 15, fontWeight: isUnread ? 500 : 400, color: isUnread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3 }}>{c.msg}</div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: t.textMuted }}>{c.time}</span>
        {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />}
      </div>
    </div>
  );
}

function CustomersView({ onSelectPerson, onClose, readPersons, panelSize, onCycleSize, activePersonName }: { onSelectPerson: (p: { name: string; initials: string }) => void; onClose: () => void; readPersons: Set<string>; panelSize?: string; onCycleSize?: () => void; activePersonName?: string | null }) {
  const t = useTheme();
  const reviews = CUSTOMERS.filter(c => c.type === "review");
  const support = CUSTOMERS.filter(c => c.type === "support");
  const reviewUnread = reviews.filter(c => c.unread && !readPersons.has(c.name)).length;
  const supportUnread = support.filter(c => c.unread && !readPersons.has(c.name)).length;

  function selectPerson(name: string) {
    onSelectPerson({ name, initials: name.split(" ").map(n => n[0]).join("") });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ListHeader title="Customers" onClose={onClose} panelSize={panelSize} onCycleSize={onCycleSize} />
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 6px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <CollapsibleSection title="Reviews" badge={reviewUnread}>
            {reviews.map(c => (
              <CustomerRow key={c.name} c={c} isUnread={c.unread && !readPersons.has(c.name)} isActive={activePersonName === c.name} onClick={() => selectPerson(c.name)} />
            ))}
          </CollapsibleSection>
          <CollapsibleSection title="Support" badge={supportUnread}>
            {support.map(c => (
              <CustomerRow key={c.name} c={c} isUnread={c.unread && !readPersons.has(c.name)} isActive={activePersonName === c.name} onClick={() => selectPerson(c.name)} />
            ))}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

// ── Inbox view (Layout B: agents + team combined) ────────────────────────

function InboxView({ onSelectAgent, onSelectPerson, onClose, onCompose, customizations, agentStatuses, readPersons, panelSize, onCycleSize, activeAgentId, activePersonName }: {
  onSelectAgent: (id: string) => void;
  onSelectPerson: (p: { name: string; initials: string }) => void;
  onClose?: () => void;
  onCompose?: () => void;
  customizations: Record<string, AgentCustomization>;
  agentStatuses: Record<string, AgentStatus>;
  readPersons: Set<string>;
  panelSize?: string;
  onCycleSize?: () => void;
  activeAgentId?: string | null;
  activePersonName?: string | null;
}) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 16px 22px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Inbox</span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {onCompose && <IconBtn icon="edit_square" label="New message" onClick={onCompose} size={20} />}
          {onCycleSize && <IconBtn icon={panelSize === "full" ? "close_fullscreen" : "open_in_full"} label={panelSize === "full" ? "Collapse" : panelSize === "expanded" ? "Full view" : "Expand"} onClick={onCycleSize} size={18} />}
          {onClose && <IconBtn icon="close" label="Close" onClick={onClose} />}
        </div>
      </div>
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 6px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <CollapsibleSection title="AI Workforce" badge={Object.values(agentStatuses).filter(s => s.unread).length}>
          {AGENTS.map(agent => {
            const custom = customizations[agent.id];
            const status = agentStatuses[agent.id];
            const hasCustomAvatar = custom?.avatarId && custom.avatarId !== "default";
            const avatarSrc = hasCustomAvatar ? getAvatarSrc(custom!.avatarId) : agent.icon;
            const gradient = hasCustomAvatar ? getGradient(custom!.colorId) : null;
            const subtext = status?.lastMsg ?? agent.desc;
            const hasConversation = !!status?.lastMsg || status?.isTyping;
            const isActive = activeAgentId === agent.id;
            return (
              <button key={agent.id} onClick={() => onSelectAgent(agent.id)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12,
                border: "none", background: isActive ? t.accentLight : "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "background 120ms ease", width: "100%",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: gradient ?? "transparent", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={avatarSrc} alt="" width={40} height={40} style={{ display: "block", borderRadius: "50%", mixBlendMode: gradient ? "luminosity" : "normal" }} />
                  </div>
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: status?.unread ? 600 : 500, color: t.text }}>{custom?.name ?? agent.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {status?.isTyping ? (
                      <>
                        <TypingDots color={t.accent} />
                        <span style={{ fontSize: 15, color: t.accent, fontWeight: 500 }}>Typing…</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 15, color: status?.unread ? t.text : t.textMuted, fontWeight: status?.unread ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtext}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  {hasConversation && status?.lastTime && <span style={{ fontSize: 12, color: t.textMuted }}>{status.lastTime}</span>}
                  {status?.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />}
                </div>
              </button>
            );
          })}
          </CollapsibleSection>
          <CollapsibleSection title="Team" badge={TEAM_MEMBERS.filter(c => c.unread && !readPersons.has(c.name)).length}>
          {TEAM_MEMBERS.map(c => {
            const isUnread = c.unread && !readPersons.has(c.name);
            const isActive = activePersonName === c.name;
            return (
              <div key={c.name} onClick={() => onSelectPerson({ name: c.name, initials: c.name.split(" ").map(n => n[0]).join("") })} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12,
                cursor: "pointer", transition: "background 120ms ease",
                background: isActive ? t.accentLight : "transparent",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <PersonAvatar name={c.name} avatar={c.avatar} online={c.online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: isUnread ? 600 : 500, color: t.text }}>{c.name}</div>
                  <div style={{ fontSize: 15, fontWeight: isUnread ? 500 : 400, color: isUnread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3 }}>{c.msg}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: t.textMuted }}>{c.time}</span>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />}
                </div>
              </div>
            );
          })}
          </CollapsibleSection>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <IconBtn icon="arrow_back" label="Back" onClick={onBack} size={20} />
          <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>New Message</span>
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
      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "4px 6px 16px" }}>
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
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{c.name}</div>
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

export default function ChatShell({ open, onClose, deepLinkAgent, layout = "A", onLayoutChange, onIncomingMessage }: { open: boolean; onClose: () => void; deepLinkAgent?: string; layout?: Layout; onLayoutChange?: (l: Layout) => void; onIncomingMessage?: (msg: { agentId: string; agentName: string; avatar: string; text: string }) => void }) {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>(layout === "A" ? "agents" : "inbox");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [activePerson, setActivePerson] = useState<{ name: string; initials: string } | null>(null);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [readPersons, setReadPersons] = useState<Set<string>>(new Set());
  type PanelSize = "compact" | "expanded" | "full";
  const [panelSize, setPanelSize] = useState<PanelSize>("compact");
  function cycleSize() {
    setPanelSize(s => s === "compact" ? "expanded" : s === "expanded" ? "full" : "compact");
  }
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

  // ── Simulate incoming messages over time ──────────────────────────────
  const onIncomingRef = useRef(onIncomingMessage);
  useEffect(() => { onIncomingRef.current = onIncomingMessage; }, [onIncomingMessage]);

  useEffect(() => {

    function now() { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

    const AGENTS_META: Record<string, { name: string; avatar: string }> = {
      operations: { name: "Operations AI", avatar: "/ai-avatar-circle.svg" },
      marketing: { name: "Marketing AI", avatar: "/marketing-manager-logo.svg" },
      receptionist: { name: "Receptionist AI", avatar: "/ai-avatar-pill.svg" },
    };

    function simSend(agentId: string, text: string) {
      const meta = AGENTS_META[agentId];
      setAgentStatuses(prev => ({ ...prev, [agentId]: { isTyping: false, lastMsg: text, lastTime: now(), unread: true } }));
      onIncomingRef.current?.({ agentId, agentName: meta.name, avatar: meta.avatar, text });
    }

    // 3s — Operations AI starts typing
    const t1 = setTimeout(() => {
      setAgentStatuses(prev => ({ ...prev, operations: { ...prev.operations, isTyping: true } }));
    }, 3000);

    // 5s — Operations AI sends
    const t2 = setTimeout(() => simSend("operations", "2 orders are running late. Want me to reassign?"), 5000);

    // 8s — Marketing AI starts typing
    const t3 = setTimeout(() => {
      setAgentStatuses(prev => ({ ...prev, marketing: { ...prev.marketing, isTyping: true } }));
    }, 8000);

    // 10s — Marketing AI sends
    const t4 = setTimeout(() => simSend("marketing", "I drafted an SMS campaign based on your best performers."), 10000);

    // 14s — Receptionist starts typing
    const t5 = setTimeout(() => {
      setAgentStatuses(prev => ({ ...prev, receptionist: { ...prev.receptionist, isTyping: true } }));
    }, 14000);

    // 16s — Receptionist sends
    const t6 = setTimeout(() => simSend("receptionist", "You have 6 missed calls today. 3 in the last hour."), 16000);

    return () => { [t1, t2, t3, t4, t5, t6].forEach(clearTimeout); };
  }, []);

  // Track activeAgent in a ref so status callbacks always see the latest value
  const activeAgentRef = useRef<string | null>(null);
  useEffect(() => { activeAgentRef.current = activeAgent; }, [activeAgent]);

  function updateAgent(id: string, c: AgentCustomization) {
    setAgentCustom(prev => ({ ...prev, [id]: c }));
  }

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
    setActivePerson(null);
    setEditingAgent(null);
    setAgentStatuses(prev => ({ ...prev, [id]: { ...prev[id], unread: false } }));
  }

  function getReviewData(name: string): ReviewData | undefined {
    return CUSTOMERS.find(c => c.name === name)?.review;
  }

  function openPerson(p: { name: string; initials: string }) {
    setActivePerson(p);
    setActiveAgent(null);
    setEditingAgent(null);
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
          top: panelSize === "compact" ? 76 : 12,
          right: 16,
          bottom: panelSize === "compact" ? 16 : 12,
          left: panelSize === "full" ? 16 : "auto",
          width: panelSize === "full" ? "auto" : panelSize === "expanded" ? 680 : 460,
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
          transition: "transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease, filter 280ms ease, top 320ms cubic-bezier(0.16,1,0.3,1), bottom 320ms cubic-bezier(0.16,1,0.3,1), width 320ms cubic-bezier(0.16,1,0.3,1), left 320ms cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Content area */}
        {panelSize === "full" ? (
          /* ── Full mode: side-by-side ── */
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Left panel: list + tab bar */}
            <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid ${t.border}` }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {tab === "agents" && <AgentList onSelect={openAgent} customizations={agentCustom} agentStatuses={agentStatuses} />}
                {tab === "team" && <TeamView onSelectPerson={openPerson} readPersons={readPersons} activePersonName={activePerson?.name} />}
                {tab === "inbox" && (
                  composing
                    ? <NewMessageView onSelectAgent={id => { setComposing(false); openAgent(id); }} onSelectPerson={p => { setComposing(false); openPerson(p); }} onBack={() => setComposing(false)} />
                    : <InboxView onSelectAgent={openAgent} onSelectPerson={openPerson} onCompose={() => setComposing(true)} customizations={agentCustom} agentStatuses={agentStatuses} readPersons={readPersons} activeAgentId={activeAgent} activePersonName={activePerson?.name} />
                )}
                {tab === "customers" && <CustomersView onSelectPerson={openPerson} readPersons={readPersons} activePersonName={activePerson?.name} />}
              </div>
              {/* Tab bar inside left panel */}
              {!composing && (() => {
                const customerUnread = CUSTOMERS.filter(c => c.unread && !readPersons.has(c.name)).length;
                const teamUnread = TEAM_MEMBERS.filter(c => c.unread && !readPersons.has(c.name)).length;
                const agentUnread = Object.values(agentStatuses).filter(s => s.unread).length;
                const badges: Record<string, number> = { customers: customerUnread, team: teamUnread, agents: agentUnread, inbox: agentUnread + teamUnread };
                const tabs = layout === "A" ? TABS_A : TABS_B;
                return (
                  <div style={{ display: "flex", flexShrink: 0, borderTop: `1px solid ${t.border}`, background: t.surface, padding: "6px 8px 10px", gap: 4 }}>
                    {tabs.map(tb => {
                      const active = tab === tb.key;
                      const badge = badges[tb.key] ?? 0;
                      return (
                        <button key={tb.key} onClick={() => { setTab(tb.key); setActiveAgent(null); setActivePerson(null); }}
                          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0 8px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", transition: "opacity 150ms ease", position: "relative", opacity: active ? 1 : 0.55 }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = "0.8"; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = "0.55"; }}
                        >
                          <div style={{ position: "relative" }}>
                            <Icon name={tb.icon} size={24} color={t.text} fill={active} weight={active ? 600 : 400} />
                            {badge > 0 && <div style={{ position: "absolute", top: -5, right: -10, minWidth: 18, height: 18, borderRadius: 99, background: "#EF4444", color: "#FFFFFF", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{badge}</div>}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: t.text }}>{tb.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            {/* Right panel: active conversation or empty */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {editingAgent
                ? <AgentProfile customization={agentCustom[editingAgent]} onChange={c => updateAgent(editingAgent, c)} onBack={() => setEditingAgent(null)} />
                : activeAgent
                ? <AgentChat agentId={activeAgent} onBack={() => {}} onClose={onClose} onEditProfile={() => setEditingAgent(activeAgent)} customization={agentCustom[activeAgent]} onStatusChange={s => handleAgentStatus(activeAgent, s)} hideBack extraActions={<IconBtn icon="close_fullscreen" label="Minimize" onClick={cycleSize} size={18} />} />
                : activePerson
                ? <SimpleChat person={activePerson} onBack={() => {}} onClose={onClose} reviewData={getReviewData(activePerson.name)} hideBack extraActions={<IconBtn icon="close_fullscreen" label="Minimize" onClick={cycleSize} size={18} />} />
                : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "14px 20px", flexShrink: 0 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        <IconBtn icon="close_fullscreen" label="Minimize" onClick={cycleSize} size={18} />
                        <IconBtn icon="close" label="Close" onClick={onClose} />
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <Icon name="chat" size={40} color={t.borderLight} />
                        <div style={{ fontSize: 15, color: t.textMuted, marginTop: 12 }}>Select a conversation</div>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        ) : (
          /* ── Compact / Expanded: stacked ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            {tab === "agents" && (
              editingAgent
                ? <AgentProfile customization={agentCustom[editingAgent]} onChange={c => updateAgent(editingAgent, c)} onBack={() => setEditingAgent(null)} />
                : activeAgent
                ? <div key={`agent-${activeAgent}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><AgentChat agentId={activeAgent} onBack={() => setActiveAgent(null)} onClose={onClose} onEditProfile={() => setEditingAgent(activeAgent)} customization={agentCustom[activeAgent]} onStatusChange={s => handleAgentStatus(activeAgent, s)} extraActions={<IconBtn icon="open_in_full" label={panelSize === "compact" ? "Expand" : "Full view"} onClick={cycleSize} size={18} />} /></div>
                : <div key="agent-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><AgentList onSelect={openAgent} onClose={onClose} customizations={agentCustom} agentStatuses={agentStatuses} panelSize={panelSize} onCycleSize={cycleSize} /></div>
            )}
            {tab === "team" && (
              activePerson
                ? <div key={`team-${activePerson.name}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><SimpleChat person={activePerson} onBack={() => setActivePerson(null)} onClose={onClose} extraActions={<IconBtn icon="open_in_full" label={panelSize === "compact" ? "Expand" : "Full view"} onClick={cycleSize} size={18} />} /></div>
                : <div key="team-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><TeamView onSelectPerson={openPerson} onClose={onClose} readPersons={readPersons} panelSize={panelSize} onCycleSize={cycleSize} activePersonName={activePerson?.name} /></div>
            )}
            {tab === "inbox" && (
              composing
                ? <NewMessageView onSelectAgent={id => { setComposing(false); openAgent(id); }} onSelectPerson={p => { setComposing(false); openPerson(p); }} onBack={() => setComposing(false)} />
                : editingAgent
                ? <AgentProfile customization={agentCustom[editingAgent]} onChange={c => updateAgent(editingAgent, c)} onBack={() => setEditingAgent(null)} />
                : activeAgent
                ? <div key={`inbox-agent-${activeAgent}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><AgentChat agentId={activeAgent} onBack={() => setActiveAgent(null)} onClose={onClose} onEditProfile={() => setEditingAgent(activeAgent)} customization={agentCustom[activeAgent]} onStatusChange={s => handleAgentStatus(activeAgent, s)} extraActions={<IconBtn icon="open_in_full" label={panelSize === "compact" ? "Expand" : "Full view"} onClick={cycleSize} size={18} />} /></div>
                : activePerson
                ? <div key={`inbox-team-${activePerson.name}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><SimpleChat person={activePerson} onBack={() => setActivePerson(null)} onClose={onClose} reviewData={getReviewData(activePerson.name)} extraActions={<IconBtn icon="open_in_full" label={panelSize === "compact" ? "Expand" : "Full view"} onClick={cycleSize} size={18} />} /></div>
                : <div key="inbox-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><InboxView onSelectAgent={openAgent} onSelectPerson={openPerson} onCompose={() => setComposing(true)} onClose={onClose} customizations={agentCustom} agentStatuses={agentStatuses} readPersons={readPersons} panelSize={panelSize} onCycleSize={cycleSize} activeAgentId={activeAgent} activePersonName={activePerson?.name} /></div>
            )}
            {tab === "customers" && (
              activePerson
                ? <div key={`cust-${activePerson.name}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}><SimpleChat person={activePerson} onBack={() => setActivePerson(null)} onClose={onClose} reviewData={getReviewData(activePerson.name)} /></div>
                : <div key="cust-list" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "crossfade 200ms ease both" }}><CustomersView onSelectPerson={openPerson} onClose={onClose} readPersons={readPersons} panelSize={panelSize} onCycleSize={cycleSize} activePersonName={activePerson?.name} /></div>
            )}
          </div>
        )}

        {/* Bottom tab bar — only for compact/expanded, hidden inside conversations */}
        {panelSize !== "full" && !activeAgent && !activePerson && !editingAgent && !composing && (() => {
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
