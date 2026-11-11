import { useState } from "react";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

// ── Color swatches (from Osvaldo's design tokens) ─────────────────────────
const COLORS = [
  { id: "green",  stops: ["#03624C", "#008062", "#01AD85"] },
  { id: "ai",     stops: ["#018461", "#2FE5C7", "#208EF5"] },
  { id: "pink",   stops: ["#C2185B", "#EC4899", "#F9A8D4"] },
  { id: "blue",   stops: ["#1A6FC8", "#208EF5", "#7DBCFA"] },
  { id: "yellow", stops: ["#C98F00", "#F5B400", "#FAD566"] },
  { id: "orange", stops: ["#C2410C", "#F97316", "#FDBA74"] },
  { id: "purple", stops: ["#5B21B6", "#7C3AED", "#C4B5FD"] },
];

// ── Avatar figures ────────────────────────────────────────────────────────
const AVATARS = [
  { id: "default", src: "/ai-default-icon.svg" },
  { id: "circle",  src: "/ai-avatar-circle.svg" },
  { id: "square",  src: "/ai-avatar-square.svg" },
  { id: "pill",    src: "/ai-avatar-pill.svg" },
  { id: "triangle", src: "/ai-avatar-triangle.svg" },
  { id: "hexagon", src: "/ai-avatar-hexagon.svg" },
  { id: "drop",    src: "/ai-avatar-drop.svg" },
  { id: "star",    src: "/ai-avatar-star.svg" },
];

export type AgentCustomization = {
  name: string;
  colorId: string;
  avatarId: string;
};

function gradientForColor(colorId: string): string {
  const c = COLORS.find(c => c.id === colorId) ?? COLORS[0];
  return `linear-gradient(135deg, ${c.stops[0]} 0%, ${c.stops[1]} 50%, ${c.stops[2]} 100%)`;
}

export function getAvatarSrc(avatarId: string): string {
  return AVATARS.find(a => a.id === avatarId && a.id !== "default")?.src ?? AVATARS[1].src;
}

export function getGradient(colorId: string): string {
  return gradientForColor(colorId);
}

// ── Profile editor ────────────────────────────────────────────────────────

export default function AgentProfile({ customization, onChange, onBack }: {
  customization: AgentCustomization;
  onChange: (c: AgentCustomization) => void;
  onBack: () => void;
}) {
  const t = useTheme();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(customization.name);

  function saveName() {
    const trimmed = nameValue.trim();
    if (trimmed) onChange({ ...customization, name: trimmed });
    setEditingName(false);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pushIn 280ms cubic-bezier(0.16,1,0.3,1) both" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 14px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 99, transition: "background 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="arrow_back" size={20} color={t.textMuted} />
        </button>
      </div>

      <div className="scroll-subtle" style={{ flex: 1, overflow: "auto", padding: "0 24px 32px" }}>
        {/* Large avatar preview */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: gradientForColor(customization.colorId),
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {customization.avatarId !== "default" && (
              <img
                src={getAvatarSrc(customization.avatarId)}
                alt=""
                width={80}
                height={80}
                style={{ display: "block", borderRadius: "50%", mixBlendMode: "luminosity" }}
              />
            )}
          </div>
        </div>

        {/* Editable name */}
        <div style={{ marginBottom: 28 }}>
          {editingName ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setNameValue(customization.name); setEditingName(false); } }}
                style={{
                  flex: 1, height: 48, padding: "0 16px", borderRadius: 12,
                  border: `1px solid ${t.accent}`, background: t.inputBg,
                  fontSize: 18, fontWeight: 700, color: t.text, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box", textAlign: "center",
                  boxShadow: `0 0 0 3px ${t.mode === "dark" ? "rgba(0,128,98,0.15)" : "rgba(0,128,98,0.08)"}`,
                }}
              />
              <button onClick={saveName} style={{
                width: 48, height: 48, borderRadius: 12, border: "none",
                background: t.accent, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="check" size={22} color="#FFFFFF" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameValue(customization.name); setEditingName(true); }}
              style={{
                width: "100%", height: 48, padding: "0 16px", borderRadius: 12,
                border: `1px solid ${t.border}`, background: "transparent",
                fontSize: 18, fontWeight: 700, color: t.text, fontFamily: "inherit",
                cursor: "pointer", textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
            >
              {customization.name}
              <Icon name="edit" size={16} color={t.textMuted} />
            </button>
          )}
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.textSecondary, marginBottom: 12 }}>Color</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {COLORS.map(c => {
              const sel = customization.colorId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onChange({ ...customization, colorId: c.id })}
                  style={{
                    width: 40, height: 40, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
                    background: `linear-gradient(135deg, ${c.stops[0]}, ${c.stops[1]}, ${c.stops[2]})`,
                    outline: sel ? `2px solid ${t.text}` : "2px solid transparent",
                    outlineOffset: 3,
                    transition: "outline-color 150ms ease",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Avatar picker */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.textSecondary, marginBottom: 12 }}>Character</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Bot figures */}
            {AVATARS.filter(a => a.id !== "default").map(a => {
              const sel = customization.avatarId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => onChange({ ...customization, avatarId: a.id })}
                  style={{
                    width: 48, height: 48, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
                    background: sel ? gradientForColor(customization.colorId) : t.bgTertiary,
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    outline: sel ? `2px solid ${t.text}` : "2px solid transparent",
                    outlineOffset: 3,
                    transition: "outline-color 150ms ease, background 200ms ease",
                  }}
                >
                  <img
                    src={a.src}
                    alt=""
                    width={48}
                    height={48}
                    style={{
                      display: "block",
                      borderRadius: "50%",
                      mixBlendMode: sel ? "luminosity" : "normal",
                      filter: sel ? "none" : "grayscale(0.5) opacity(0.6)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
