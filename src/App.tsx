import { useState } from "react";
import { ThemeProvider, useTheme } from "./lib/ThemeContext";
import TopBar from "./components/TopBar";
import ChatPanel from "./components/chat/ChatPanel";
import Icon from "./components/ui/Icon";

function AppInner() {
  const t = useTheme();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: t.bg, transition: "background 300ms ease" }}>
      <TopBar />

      {/* Main area */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <img src="/marketing-manager-logo.svg" alt="" width={64} height={64} style={{ display: "block", margin: "0 auto 20px", objectFit: "contain" }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Shipday Chat
          </h1>
          <p style={{ fontSize: 16, color: t.textMuted, margin: "0 0 28px", lineHeight: "150%" }}>
            Talk to your AI agents — create campaigns, manage orders, and grow your business.
          </p>
          <button
            onClick={() => setChatOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 48, padding: "0 28px", borderRadius: 12, border: "none",
              background: t.accent, color: "#FFFFFF", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "opacity 120ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <Icon name="chat" size={18} color="#FFFFFF" />
            Open chat
          </button>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setChatOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 998,
          width: 60, height: 60, borderRadius: "50%",
          border: "none", cursor: "pointer",
          background: t.mode === "dark" ? t.surface : t.text,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          transform: chatOpen ? "scale(0)" : "scale(1)",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)"; }}
      >
        <img src="/marketing-manager-logo.svg" alt="" width={40} height={40} style={{ display: "block", objectFit: "contain" }} />
      </button>

      {/* Chat panel */}
      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
