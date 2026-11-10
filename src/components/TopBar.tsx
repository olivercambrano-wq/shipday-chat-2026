

import { useState, useEffect, useRef } from "react";
import { useTheme, useThemeToggle } from "../lib/ThemeContext";
import Icon from "./ui/Icon";

function AIIcon() {
  return (
    <svg width="19" height="22" viewBox="0 0 21 24" fill="none" style={{ display: "block" }}>
      <path opacity="0.8" d="M0 8.15625C0.0237463 9.55494 0.730239 10.9144 2.00222 11.7156L14.4269 19.5419C15.7336 20.365 17.3141 20.3954 18.6056 19.7613L12.4847 23.4454C11.255 24.1856 9.7452 24.1856 8.51546 23.4454L2.0154 19.5333C0.769129 18.7832 1.97192e-05 17.3872 -5.24792e-08 15.8753L0 8.15625Z" fill="url(#sui-g1)"/>
      <path opacity="0.8" d="M8.51593 0.555112C9.74567 -0.185037 11.2555 -0.185037 12.4852 0.555112L18.9853 4.46726C20.2315 5.21738 21.0006 6.61337 21.0007 8.12525L21.0007 15.857C20.981 14.4539 20.274 13.0886 18.9982 12.285L6.57352 4.45871C5.26672 3.63557 3.68612 3.60514 2.39453 4.23923L8.51593 0.555112Z" fill="url(#sui-g2)"/>
      <path opacity="0.8" d="M8.09749 0.806397C6.95963 1.5774 6.21199 2.88093 6.21197 4.35892L6.21197 19.6415C6.21197 21.1195 6.95985 22.4228 8.09773 23.1938L2.0154 19.5331C0.769095 18.783 -1.12724e-07 17.3868 -1.02445e-07 15.8749L-4.97604e-08 8.12556C-3.94816e-08 6.61367 0.769136 5.2177 2.0154 4.46756L8.09749 0.806397Z" fill="url(#sui-g3)"/>
      <path opacity="0.8" d="M18.9849 4.46781C20.2312 5.21794 21.0003 6.61391 21.0003 8.1258L21.0003 15.8751C21.0003 17.3871 20.2312 18.7832 18.9849 19.5334L12.9004 23.1953C14.0393 22.4244 14.7881 21.1206 14.7881 19.6418L14.7881 4.35916C14.7881 2.8804 14.0395 1.57651 12.9006 0.805664L18.9849 4.46781Z" fill="url(#sui-g4)"/>
      <defs>
        <linearGradient id="sui-g1" x1="13.8666" y1="22.5989" x2="1.4335e-07" y2="14.4397" gradientUnits="userSpaceOnUse"><stop stopColor="#2FE5C7"/><stop offset="1" stopColor="#018461"/></linearGradient>
        <linearGradient id="sui-g2" x1="7.53372" y1="1.25891" x2="21.0007" y2="9.81751" gradientUnits="userSpaceOnUse"><stop stopColor="#2FE5C7"/><stop offset="1" stopColor="#018461"/></linearGradient>
        <linearGradient id="sui-g3" x1="4.04887" y1="3.3309" x2="4.04887" y2="20.6109" gradientUnits="userSpaceOnUse"><stop stopColor="#208EF5"/><stop offset="0.495192" stopColor="#2FE5C7"/><stop offset="1" stopColor="#78F695"/></linearGradient>
        <linearGradient id="sui-g4" x1="16.9504" y1="3.25633" x2="16.9504" y2="20.5447" gradientUnits="userSpaceOnUse"><stop stopColor="#78F695"/><stop offset="0.509615" stopColor="#2FE5C7"/><stop offset="1" stopColor="#208EF5"/></linearGradient>
      </defs>
    </svg>
  );
}

const iconBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 0,
  borderRadius: 6,
  flexShrink: 0,
};

const navLinks = ["Dispatch", "Orders", "Drivers", "Routes", "Reviews", "Reports", "Marketing"];

export default function Navbar() {
  const t = useTheme();
  const { toggle: toggleDark } = useThemeToggle();
  const [logoHovered, setLogoHovered] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: PointerEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: 68,
        boxSizing: "border-box",
        background: t.bg,
        borderBottom: `1px solid ${t.border}`,
        transition: "background 300ms ease, border-color 300ms ease",
        flexShrink: 0,
      }}
    >
      {/* Left: company identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <button
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{
              width: 36, height: 36, padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${logoHovered ? t.accent : t.border}`,
              borderRadius: 6, boxSizing: "border-box",
              background: logoHovered ? t.accentLight : "transparent",
              cursor: "pointer", transition: "all 150ms ease",
            }}
          >
            <Icon name="add_photo_alternate" size={18} color={logoHovered ? t.accent : t.textMuted} />
          </button>
          {logoHovered && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
              background: t.mode === "dark" ? "#333" : "#1A1A1A", color: "#fff",
              fontSize: 13, fontWeight: 500, padding: "5px 10px", borderRadius: 6,
              whiteSpace: "nowrap", zIndex: 9999, pointerEvents: "none",
            }}>
              Add business logo
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", color: t.text, transition: "color 300ms ease" }}>
            Company name
          </span>
          <span style={{ fontSize: 13, fontWeight: 400, lineHeight: "14px", letterSpacing: "0.02em", color: t.textMuted, transition: "color 300ms ease" }}>
            Powered by Shipday
          </span>
        </div>
      </div>

      {/* Right: nav links + action icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <nav style={{ display: "flex", alignItems: "center" }}>
          {navLinks.map((label) => {
            const isActive = label === "Marketing";
            return (
              <button
                key={label}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 7,
                  fontSize: 15, lineHeight: "20px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? t.accent : t.textSecondary,
                  background: "transparent",
                  border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                  transition: "color 0.12s ease, background 0.12s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {label}
                {isActive && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    color: "#FFFFFF", background: t.accent,
                    padding: "2px 6px", borderRadius: 5,
                  }}>
                    New
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ width: 1, height: 20, background: t.border, margin: "0 8px", flexShrink: 0 }} />

        <button style={iconBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="campaign" size={24} color={t.textMuted} />
        </button>

        <button style={iconBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Icon name="help" size={24} color={t.textMuted} />
        </button>

        <div style={{ ...iconBtn, cursor: "default" }}>
          <AIIcon />
        </div>

        {/* Avatar + dropdown */}
        <div ref={avatarRef} style={{ position: "relative", marginLeft: 4 }}>
          <button
            onClick={() => setAvatarOpen((o) => !o)}
            style={{ width: 32, height: 32, border: "none", padding: 0, borderRadius: "50%", cursor: "pointer", background: "transparent" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 14,
              background: `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%), ${t.accent}`,
              userSelect: "none",
            }}>
              K
            </div>
          </button>

          {avatarOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 260, background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,0.14)",
              zIndex: 9999, overflow: "hidden",
            }}>
              <div style={{ padding: "4px 8px" }}>
                {[
                  { icon: "manage_accounts", label: "My Account" },
                  { icon: "settings", label: "Settings" },
                  { icon: "receipt_long", label: "Online Order Forms" },
                  { icon: "logout", label: "Log Out" },
                ].map((item) => (
                  <button key={item.label} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 10px", border: "none", borderRadius: 9,
                    background: "transparent", cursor: "pointer", fontSize: 14,
                    color: t.text, fontFamily: "inherit", textAlign: "left",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon name={item.icon} size={20} color={t.textMuted} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div style={{ height: 1, background: t.border, margin: "4px 0" }} />
              <div style={{ padding: "4px 8px 8px" }}>
                {[
                  { icon: "translate", label: "Language: English" },
                  { icon: "dark_mode", label: `Display: ${t.mode === "dark" ? "Dark" : "Light"}`, action: toggleDark },
                  { icon: "phone_iphone", label: "Download the app" },
                ].map((item) => (
                  <button key={item.label} onClick={item.action} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 10px", border: "none", borderRadius: 9,
                    background: "transparent", cursor: "pointer", fontSize: 14,
                    color: t.text, fontFamily: "inherit", textAlign: "left", justifyContent: "space-between",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Icon name={item.icon} size={20} color={t.textMuted} />
                      {item.label}
                    </div>
                    {(item.label.startsWith("Language") || item.label.startsWith("Display")) && (
                      <Icon name="chevron_right" size={20} color={t.textMuted} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
