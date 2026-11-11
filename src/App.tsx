import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider, useTheme } from "./lib/ThemeContext";
import Navbar from "./components/TopBar";
import ChatShell, { type Layout } from "./components/chat/ChatShell";
import Icon from "./components/ui/Icon";

type Notif = { id: number; arrivedAt: number; avatar: string; text: string; agent: string; agentId: string; time: string };

function AppInner() {
  const t = useTheme();
  const [chatOpen, setChatOpen] = useState(false);
  const [deepLinkAgent, setDeepLinkAgent] = useState<string | undefined>();
  const [chatLayout, setChatLayout] = useState<Layout>("A");
  const [fabHovered, setFabHovered] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const notifIdRef = useRef(0);
  const notifFiredRef = useRef(false); // fire only once per session

  // Simulate incoming notifications — only once, when chat has never been opened
  useEffect(() => {
    if (chatOpen || notifFiredRef.current) return;
    notifFiredRef.current = true;
    const t1 = setTimeout(() => {
      setNotifications(prev => [...prev, { id: ++notifIdRef.current, arrivedAt: Date.now(), avatar: "/marketing-manager-logo.svg", text: "Your campaigns are ready for review — 2 pending.", agent: "Marketing AI", agentId: "marketing", time: "Just now" }]);
    }, 3000);
    const t2 = setTimeout(() => {
      setNotifications(prev => [...prev, { id: ++notifIdRef.current, arrivedAt: Date.now(), avatar: "/ai-avatar-circle.svg", text: "Order #3480 is running 15 min late. Reassign?", agent: "Operations AI", agentId: "operations", time: "Just now" }]);
    }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [chatOpen]);

  function dismissNotif(id: number) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function openFromNotif(notif: Notif) {
    dismissNotif(notif.id);
    setDeepLinkAgent(notif.agentId);
    setChatOpen(true);
  }

  function openChat() {
    setDeepLinkAgent(undefined);
    setChatOpen(true);
    setNotifications([]);
  }

  const now = Date.now();
  const anyRecent = notifications.some(n => now - n.arrivedAt < 8000);
  const pillsVisible = fabHovered || anyRecent;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: t.bg, transition: "background 300ms ease" }}>
      <Navbar unreadCount={notifications.length} />

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
            onClick={openChat}
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

      {/* Stacking notification pills */}
      {!chatOpen && notifications.length > 0 && (
        <div
          style={{
            position: "fixed", bottom: 96, right: 24, zIndex: 999,
            display: "flex", flexDirection: "column", gap: 8,
            maxWidth: 340, alignItems: "flex-end",
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 250ms ease, transform 250ms ease",
            pointerEvents: pillsVisible ? "auto" : "none",
          }}
        >
          {notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => openFromNotif(n)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 14, width: "100%",
                background: t.mode === "dark" ? "#262626" : "#1A1A1A",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
                animation: `fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
              }}
            >
              <img src={n.avatar} alt="" width={30} height={30} style={{ display: "block", borderRadius: "50%", objectFit: "contain", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.text}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{n.agent} · {n.time}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissNotif(n.id); }}
                style={{ width: 24, height: 24, borderRadius: 99, border: "none", background: "rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 120ms ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >
                <Icon name="close" size={14} color="rgba(255,255,255,0.6)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setChatOpen(o => !o); setDeepLinkAgent(undefined); setNotifications([]); }}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 998,
          width: 60, height: 60, borderRadius: "50%",
          border: "none", cursor: "pointer",
          background: t.mode === "dark" ? "#262626" : "#1A1A1A",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
          transition: "transform 250ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms ease",
          transform: chatOpen ? "scale(0)" : "scale(1)",
        }}
      >
        <Icon name="chat" size={28} color="#FFFFFF" fill />
        {notifications.length > 0 && (
          <div style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 20, height: 20, borderRadius: 99,
            background: "#EF4444", color: "#FFFFFF",
            fontSize: 12, fontWeight: 700, border: `2px solid ${t.mode === "dark" ? "#262626" : "#1A1A1A"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 5px",
          }}>{notifications.length}</div>
        )}
      </button>

      {/* Chat panel */}
      <ChatShell
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        deepLinkAgent={deepLinkAgent}
        layout={chatLayout}
        onLayoutChange={setChatLayout}
      />

      {/* A/B layout pill — fixed bottom-left */}
      <div style={{
        position: "fixed", bottom: 24, left: 24, zIndex: 998,
        display: "flex", borderRadius: 10, overflow: "hidden",
        border: `1px solid ${t.border}`,
        background: t.surface,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}>
        {(["A", "B"] as Layout[]).map(l => (
          <button key={l} onClick={() => setChatLayout(l)}
            style={{
              padding: "6px 14px", border: "none", fontSize: 13, fontWeight: 700,
              fontFamily: "inherit", cursor: "pointer",
              background: chatLayout === l ? t.accent : "transparent",
              color: chatLayout === l ? "#FFFFFF" : t.textMuted,
              transition: "all 150ms ease",
              letterSpacing: "0.02em",
            }}
          >{l}</button>
        ))}
      </div>
    </div>
  );
}

function Router() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (hash === "#catalog") {
    // Lazy-load catalog page
    const CardCatalog = React.lazy(() => import("./pages/CardCatalog"));
    return (
      <React.Suspense fallback={<div style={{ padding: 40 }}>Loading catalog…</div>}>
        <CardCatalog />
      </React.Suspense>
    );
  }
  return <AppInner />;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
