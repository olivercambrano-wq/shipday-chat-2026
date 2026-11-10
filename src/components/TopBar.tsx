import { useTheme, useThemeToggle } from "../lib/ThemeContext";
import Icon from "./ui/Icon";

export default function TopBar() {
  const t = useTheme();
  const { toggle } = useThemeToggle();
  return (
    <header style={{
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", borderBottom: `1px solid ${t.border}`,
      background: t.surface, flexShrink: 0,
      transition: "background 300ms ease, border-color 300ms ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/marketing-manager-logo.svg" alt="" width={28} height={28} style={{ display: "block", objectFit: "contain" }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Shipday Chat</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={toggle}
          style={{
            width: 36, height: 36, borderRadius: 99, border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 120ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name={t.mode === "dark" ? "light_mode" : "dark_mode"} size={20} color={t.textMuted} />
        </button>
      </div>
    </header>
  );
}
