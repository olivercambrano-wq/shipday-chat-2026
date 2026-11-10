import { useState } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";
import ChatPanel from "./ChatPanel";

type Tab = "agents" | "team" | "customers";

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: "agents",    icon: "auto_awesome", label: "Agents" },
  { key: "team",      icon: "chat",         label: "Team" },
  { key: "customers", icon: "people",       label: "Customers" },
];

// ── Placeholder views ─────────────────────────────────────────────────────

function TeamView() {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 32 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="chat" size={28} color={t.textMuted} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Team chat</div>
      <div style={{ fontSize: 15, color: t.textMuted, textAlign: "center", lineHeight: "150%", maxWidth: 280 }}>
        Message your team in real time. Coordinate deliveries, share updates, and stay in sync.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320, marginTop: 8 }}>
        {[
          { name: "Marco Rivera", msg: "Heading to pickup now", time: "2m", online: true },
          { name: "Ana Torres", msg: "Order #1042 delivered", time: "8m", online: true },
          { name: "Luis Mendez", msg: "Running 5 min late", time: "15m", online: false },
        ].map(c => (
          <div key={c.name} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}`,
            cursor: "pointer", transition: "background 120ms ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
              {c.name.split(" ").map(n => n[0]).join("")}
              {c.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.surface}` }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{c.name}</div>
              <div style={{ fontSize: 14, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.msg}</div>
            </div>
            <span style={{ fontSize: 14, color: t.textMuted, flexShrink: 0 }}>{c.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersView() {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 32 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="people" size={28} color={t.textMuted} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Customer messages</div>
      <div style={{ fontSize: 15, color: t.textMuted, textAlign: "center", lineHeight: "150%", maxWidth: 280 }}>
        See and respond to customer inquiries. Track order questions, delivery updates, and feedback.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320, marginTop: 8 }}>
        {[
          { name: "Sarah Johnson", msg: "Where is my order?", time: "Just now", unread: true },
          { name: "David Chen", msg: "Can I change my address?", time: "5m", unread: true },
          { name: "Emma Wilson", msg: "Thanks for the fast delivery!", time: "1h", unread: false },
        ].map(c => (
          <div key={c.name} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}`,
            cursor: "pointer", transition: "background 120ms ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: c.unread ? 700 : 500, color: t.text }}>{c.name}</div>
              <div style={{ fontSize: 14, fontWeight: c.unread ? 500 : 400, color: c.unread ? t.text : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.msg}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 14, color: t.textMuted }}>{c.time}</span>
              {c.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────────────────

export default function ChatShell({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>("agents");

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
            <ChatPanel open={true} onClose={onClose} embedded />
          )}
          {tab === "team" && <TeamView />}
          {tab === "customers" && <CustomersView />}
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
                onClick={() => setTab(tb.key)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "10px 0 12px", border: "none", background: "transparent",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "color 120ms ease",
                }}
              >
                <Icon name={tb.icon} size={22} color={active ? t.accent : t.textMuted} fill={active} weight={active ? 500 : 300} />
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? t.accent : t.textMuted }}>{tb.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
