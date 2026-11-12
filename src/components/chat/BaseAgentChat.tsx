import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme, type Theme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

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

// ── Types ─────────────────────────────────────────────────────────────────
export interface Msg {
  role: "user" | "assistant";
  text: string | null;
  card?: () => React.ReactNode;
  followUps?: string[];
  time?: string;
}

export interface Reply {
  text: string | null;
  card?: () => React.ReactNode;
  followUps?: string[];
}

export interface AgentConfig {
  name: string;
  avatar: string;
  suggestions: string[];
  placeholder: string;
  keywordMap: { keys: string[]; reply: string }[];
  richReplies: Record<string, Reply>;
  plainReplies: Reply[];
  initialMessages?: Msg[];
  /** Optional — intercept message before keyword matching. Return reply or null to fall through. */
  onMessage?: (msg: string, addReply: (reply: Reply, delay?: number) => void, addUserMsg: (text: string) => void) => boolean;
}

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// ── Shared card components ────────────────────────────────────────────────

export function StatsRow({ stats }: { stats: { label: string; value: string; change?: string; positive?: boolean }[] }) {
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

export function AlertCard({ icon, title, text, type = "info" }: { icon: string; title?: string; text: string; type?: string }) {
  const t = useTheme();
  const styles: Record<string, { bg: string; accent: string }> = {
    info:    { bg: t.mode === "dark" ? "rgba(32,142,245,0.1)" : "#EFF6FF", accent: "#2563EB" },
    warning: { bg: t.mode === "dark" ? "rgba(234,88,12,0.1)" : "#FFF7ED", accent: "#EA580C" },
    success: { bg: t.mode === "dark" ? "rgba(22,163,74,0.1)" : "#F0FDF4", accent: "#16A34A" },
  };
  const s = styles[type] ?? styles.info;
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: s.bg }}>
      <Icon name={icon} size={18} color={s.accent} weight={400} style={{ marginTop: 1, flexShrink: 0 }} />
      <div>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 3 }}>{title}</div>}
        <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px" }}>{text}</div>
      </div>
    </div>
  );
}

// ── Base Agent Chat ───────────────────────────────────────────────────────

export default function BaseAgentChat({ config, onBack, onClose, onEditProfile, nameOverride, avatarOverride, gradientOverride, onStatusChange, extraActions }: { config: AgentConfig; onBack?: () => void; onClose?: () => void; onEditProfile?: () => void; nameOverride?: string; avatarOverride?: string; gradientOverride?: string; onStatusChange?: (s: { isTyping: boolean; lastMsg?: string }) => void; extraActions?: React.ReactNode }) {
  const t = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(config.initialMessages ?? []);
  const [typing, setTyping] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const plainIdxRef = useRef(0);
  // Keep latest onStatusChange in a ref so callbacks never go stale
  const statusRef = useRef(onStatusChange);
  useEffect(() => { statusRef.current = onStatusChange; }, [onStatusChange]);
  const isEmpty = messages.length === 0;
  const hasInput = input.trim().length > 0;
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const [nameHovered, setNameHovered] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Helpers for onMessage callback
  const addReply = useCallback((reply: Reply, delay = 900) => {
    setTyping(true);
    statusRef.current?.({ isTyping: true });
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", text: reply.text, card: reply.card, followUps: reply.followUps, time: nowTime() }]);
      setTyping(false);
      statusRef.current?.({ isTyping: false, ...(reply.text ? { lastMsg: reply.text, lastTime: nowTime() } : {}) });
    }, delay);
  }, []);

  const addUserMsg = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: "user", text, time: nowTime() }]);
  }, []);

  function matchReply(input: string): Reply | null {
    const lower = input.toLowerCase();
    for (const { keys, reply } of config.keywordMap) {
      if (keys.some(k => lower.includes(k))) return config.richReplies[reply] ?? null;
    }
    return null;
  }

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    // Clear last follow-ups
    setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, followUps: undefined } : m));
    setMessages(prev => [...prev, { role: "user", text: msg, time: nowTime() }]);
    setInput("");

    // Let agent intercept first
    if (config.onMessage?.(msg, addReply, addUserMsg)) return;

    // Standard keyword matching
    setTyping(true);
    statusRef.current?.({ isTyping: true });
    setTimeout(() => {
      const reply = matchReply(msg) ?? config.plainReplies[plainIdxRef.current++ % config.plainReplies.length];
      setMessages(prev => [...prev, { role: "assistant", text: reply.text, card: reply.card, followUps: reply.followUps, time: nowTime() }]);
      setTyping(false);
      statusRef.current?.({ isTyping: false, ...(reply.text ? { lastMsg: reply.text, lastTime: nowTime() } : {}) });
    }, 900);
  }, [input, config, addReply, addUserMsg]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);


  // Escape key
  useEffect(() => {
    if (!onBack) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onBack!();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", flexShrink: 0 }}>
        {onBack && <IconBtn icon="arrow_back" label="Back" onClick={onBack} size={20} />}
        <div
          onClick={onEditProfile}
          onMouseEnter={() => setNameHovered(true)}
          onMouseLeave={() => setNameHovered(false)}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: onEditProfile ? "pointer" : "default", borderRadius: 10, padding: "4px 8px", margin: "-4px -8px", transition: "background 120ms ease", background: nameHovered && onEditProfile ? t.surfaceHover : "transparent" }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            {gradientOverride ? (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: gradientOverride, overflow: "hidden" }}>
                <img src={avatarOverride || config.avatar} alt="" width={30} height={30} style={{ display: "block", borderRadius: "50%", mixBlendMode: "luminosity" }} />
              </div>
            ) : (
              <img src={avatarOverride || config.avatar} alt="" width={30} height={30} style={{ display: "block", borderRadius: "50%", objectFit: "contain" }} />
            )}
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{nameOverride || config.name}</span>
          {onEditProfile && nameHovered && <Icon name="edit" size={14} color={t.textMuted} />}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <IconBtn icon="schedule" label="Chat history" onClick={() => setShowHistory(s => !s)} size={20} />
          {extraActions}
          {onClose && <IconBtn icon="close" label="Close" onClick={onClose} />}
        </div>
      </div>

      {/* History drawer — full overlay from left */}
      {showHistory && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          background: t.surface,
          display: "flex", flexDirection: "column",
          animation: "crossfade 200ms ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 12px 22px", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Chat history</span>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <IconBtn icon="edit_square" label="New chat" onClick={() => setShowHistory(false)} size={20} />
              <IconBtn icon="close" label="Close" onClick={() => setShowHistory(false)} size={20} />
            </div>
          </div>
          {/* Search */}
          <div style={{ padding: "0 16px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", height: 40, borderRadius: 12, background: t.bgTertiary }}>
              <Icon name="search" size={20} color={t.textMuted} />
              <input placeholder="Search" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: t.text, fontFamily: "inherit" }} />
            </div>
          </div>
          <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 8px 16px" }}>
            {[
              { group: "Today", threads: ["Weekend SMS campaign", "Campaign performance review"] },
              { group: "Yesterday", threads: ["Tracking page promo results"] },
              { group: "Nov 9", threads: ["Monthly budget check"] },
              { group: "Nov 8", threads: ["Coupon code creation"] },
              { group: "Nov 7", threads: ["Print flyer campaign"] },
            ].map(section => (
              <div key={section.group}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", padding: "12px 14px 6px" }}>{section.group}</div>
                {section.threads.map(title => (
                  <button key={title} onClick={() => setShowHistory(false)} style={{
                    display: "block", width: "100%", padding: "10px 14px", border: "none", background: "transparent",
                    borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    fontSize: 14, fontWeight: 400, color: t.text, transition: "background 120ms ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >{title}</button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div ref={scrollRef} className="scroll-subtle" style={{
        flex: 1, overflow: "auto", display: "flex", flexDirection: "column",
        padding: isEmpty ? "0 22px" : "12px 22px 20px",
        ...(isEmpty ? { justifyContent: "center", alignItems: "center" } : {}),
      }}>
        {isEmpty ? (
          /* Empty state */
          <div style={{ textAlign: "center", marginTop: -40, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 520, margin: "-40px auto 0" }}>
            {gradientOverride ? (
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: gradientOverride, overflow: "hidden", marginBottom: 16, flexShrink: 0 }}>
                <img src={avatarOverride || config.avatar} alt="" width={56} height={56} style={{ display: "block", borderRadius: "50%", mixBlendMode: "luminosity" }} />
              </div>
            ) : (
              <img src={avatarOverride || config.avatar} alt="" width={56} height={56} style={{ display: "block", marginBottom: 16, borderRadius: "50%", objectFit: "contain" }} />
            )}
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: t.text, display: "block", marginBottom: 16 }}>{nameOverride || config.name}</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
              {config.suggestions.map(text => (
                <button key={text} onClick={() => handleSend(text)} style={{
                  display: "flex", alignItems: "flex-start",
                  padding: "14px 16px", border: "none", borderRadius: 12,
                  background: t.bgTertiary, cursor: "pointer",
                  fontSize: 15, fontWeight: 500, color: t.text,
                  fontFamily: "inherit", textAlign: "left",
                  lineHeight: "20px", transition: "background 0.15s", minHeight: 52,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.bgTertiary; }}
                >{text}</button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720, width: "100%", margin: "0 auto" }}>
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const isLastUser = isLast && msg.role === "user" && !typing;
              return msg.role === "user" ? (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, animation: "bubbleIn 250ms cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{
                  padding: "10px 16px", borderRadius: "14px 14px 4px 14px",
                  background: t.mode === "dark" ? "#03624C" : "#D0FBE7",
                  color: t.text, fontSize: 15, lineHeight: "22px", maxWidth: "85%",
                }}>
                  {msg.text}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 4 }}>
                  {msg.time && <span style={{ fontSize: 12, color: t.textMuted }}>{msg.time}</span>}
                  {isLastUser && <Icon name="done_all" size={14} color={t.accent} />}
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: "flex", gap: 10, animation: "bubbleIn 300ms cubic-bezier(0.16,1,0.3,1) both" }}>
                {/* Agent avatar */}
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {gradientOverride ? (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: gradientOverride, overflow: "hidden" }}>
                      <img src={avatarOverride || config.avatar} alt="" width={28} height={28} style={{ display: "block", borderRadius: "50%", mixBlendMode: "luminosity" }} />
                    </div>
                  ) : (
                    <img src={avatarOverride || config.avatar} alt="" width={28} height={28} style={{ display: "block", borderRadius: "50%", objectFit: "contain" }} />
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                  {msg.text && <div style={{ color: t.text, fontSize: 15, lineHeight: "24px", whiteSpace: "pre-line" }}>{msg.text}</div>}
                  {msg.card && msg.card()}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {msg.followUps.map(fu => (
                        <button key={fu} onClick={() => handleSend(fu)} style={{
                          padding: "8px 16px", border: `1px solid ${t.border}`,
                          borderRadius: 999, background: t.surface,
                          cursor: "pointer", fontSize: 14, fontWeight: 500,
                          color: t.text, fontFamily: "inherit",
                          transition: "background 0.12s, border-color 0.12s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.borderColor = t.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; }}
                        >{fu}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ); })}
            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flexShrink: 0 }}>
                  {gradientOverride ? (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: gradientOverride, overflow: "hidden" }}>
                      <img src={avatarOverride || config.avatar} alt="" width={28} height={28} style={{ display: "block", borderRadius: "50%", mixBlendMode: "luminosity" }} />
                    </div>
                  ) : (
                    <img src={avatarOverride || config.avatar} alt="" width={28} height={28} style={{ display: "block", borderRadius: "50%", objectFit: "contain" }} />
                  )}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: t.accent, animation: `dotPulse 1.4s ease ${i * 0.16}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "0 22px 20px", flexShrink: 0, maxWidth: 768, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{
          display: "flex", flexDirection: "column", borderRadius: 18,
          background: t.inputBg,
          border: `1px solid ${inputFocused ? t.accent : t.borderLight}`,
          boxShadow: inputFocused ? `0 0 0 3px ${t.mode === "dark" ? "rgba(0,128,98,0.15)" : "rgba(0,128,98,0.08)"}` : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={config.placeholder}
            rows={1}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: "inherit", lineHeight: "22px", padding: "14px 18px 6px", width: "100%", boxSizing: "border-box", resize: "none", maxHeight: 120 }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 8px", position: "relative" }}>
            {/* Left: add attachment */}
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
            {/* Attachment menu */}
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
            {/* Right: record + send */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {!hasInput && !recording && (
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
                <button onClick={() => handleSend()} style={{
                  width: 34, height: 34, borderRadius: 99, border: "none", flexShrink: 0,
                  background: hasInput ? t.accent : t.bgTertiary,
                  cursor: hasInput ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s ease, transform 0.12s ease",
                  transform: hasInput ? "scale(1)" : "scale(0.95)",
                }}
                  onMouseDown={e => { if (hasInput) e.currentTarget.style.transform = "scale(0.9)"; }}
                  onMouseUp={e => { e.currentTarget.style.transform = hasInput ? "scale(1)" : "scale(0.95)"; }}
                >
                  <Icon name="arrow_upward" size={20} color={hasInput ? "#FFFFFF" : t.textMuted} weight={500} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
