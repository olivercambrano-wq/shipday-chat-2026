import React from "react";
import BaseAgentChat, { StatsRow, AlertCard, type Reply } from "./BaseAgentChat";
import { useTheme } from "../../lib/ThemeContext";

// ── Custom cards ──────────────────────────────────────────────────────────

function DriverCard({ name, status, orders, eta }: { name: string; status: string; orders: number; eta: string }) {
  const t = useTheme();
  const statusColor = status === "Delivering" ? "#16a34a" : status === "Returning" ? "#2563EB" : status === "Idle" ? t.textMuted : "#EA580C";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>
        {name.split(" ").map(n => n[0]).join("")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{orders} orders · {eta}</div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: statusColor }}>{status}</span>
    </div>
  );
}

function OrderCard({ id, store, status, time }: { id: string; store: string; status: string; time: string }) {
  const t = useTheme();
  const statusColor = status === "Late" ? "#dc2626" : status === "On time" ? "#16a34a" : status === "Unassigned" ? "#EA580C" : t.textMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>#{id}</span>
          <span style={{ fontSize: 14, color: t.textMuted }}>{store}</span>
        </div>
        <span style={{ fontSize: 14, color: t.textMuted }}>{time}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: statusColor, flexShrink: 0 }}>{status}</span>
    </div>
  );
}

// ── Config ─────────────────────────────────────────────────────────────────

const RICH_REPLIES: Record<string, Reply> = {
  stats: {
    text: "Here's your delivery overview for today:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Active orders", value: "12", change: "3 pending", positive: true },
          { label: "On-time rate",  value: "91%", change: "↑ 4%", positive: true },
          { label: "Avg delivery",  value: "28 min", change: "↓ 3 min", positive: true },
        ]} />
        <AlertCard type="warning" icon="warning" title="2 orders running late" text="Orders #3480 and #3485 are 10+ minutes behind schedule. Consider reassigning." />
      </>
    ),
    followUps: ["Show late orders", "Show driver status"],
  },
  drivers: {
    text: "Here are your active drivers:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <DriverCard name="Marco Rivera" status="Delivering" orders={3} eta="12 min to next" />
        <DriverCard name="Ana Torres" status="Delivering" orders={2} eta="8 min to next" />
        <DriverCard name="Luis Mendez" status="Returning" orders={0} eta="5 min to store" />
        <DriverCard name="Kira Jones" status="Idle" orders={0} eta="At store" />
      </div>
    ),
    followUps: ["Assign orders to Kira", "Show Marco's route"],
  },
  late: {
    text: "These orders are running late:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <OrderCard id="3480" store="Bella's Pizza" status="Late" time="18 min late · stuck in traffic" />
        <OrderCard id="3485" store="Taco Express" status="Late" time="12 min late · driver en route" />
      </div>
    ),
    followUps: ["Reassign to closest driver", "Notify customers"],
  },
  unassigned: {
    text: "2 orders need a driver:",
    card: () => (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <OrderCard id="3492" store="Sushi Place" status="Unassigned" time="Pickup in 10 min" />
          <OrderCard id="3495" store="Burger Joint" status="Unassigned" time="Pickup in 18 min" />
        </div>
        <AlertCard type="info" icon="person_pin" title="Kira Jones is available" text="She's at the store and can take both orders." />
      </>
    ),
    followUps: ["Assign both to Kira", "Show all available drivers"],
  },
  routes: {
    text: "Today's route summary:",
    card: () => <StatsRow stats={[{ label: "Total routes", value: "8" }, { label: "Completed", value: "5" }, { label: "In progress", value: "3" }]} />,
    followUps: ["Show active routes", "Optimize routes"],
  },
  orders: {
    text: "Here are your active orders:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <OrderCard id="3488" store="Bella's Pizza" status="On time" time="In transit · 8 min away" />
        <OrderCard id="3489" store="Taco Express" status="On time" time="Pickup in 3 min" />
        <OrderCard id="3490" store="Sushi Place" status="Late" time="12 min late · driver en route" />
        <OrderCard id="3492" store="Sushi Place" status="Unassigned" time="Pickup in 10 min" />
        <OrderCard id="3495" store="Burger Joint" status="Unassigned" time="Pickup in 18 min" />
      </div>
    ),
    followUps: ["Show late orders", "Unassigned orders"],
  },
  assign:  { text: null, card: () => <AlertCard type="success" icon="check_circle" title="Orders assigned" text="Orders #3492 and #3495 have been assigned to Kira Jones. ETA: 25 min." />, followUps: ["Show driver status", "Show all orders"] },
  notify:  { text: null, card: () => <AlertCard type="success" icon="check_circle" title="Customers notified" text="Delay notifications sent for orders #3480 and #3485 with updated ETAs." />, followUps: ["Show late orders", "Show today's stats"] },
  greeting: { text: "Hey! I'm your Operations AI. I help you track orders, manage drivers, optimize routes, and keep deliveries on time. What do you need?", followUps: ["Today's overview", "Show driver status", "Any late orders?"] },
  ack:     { text: "Anything else I can help with?", followUps: ["Today's stats", "Show drivers", "Late orders"] },
  help:    { text: "I can help you with:\n• Track and manage active orders\n• Monitor driver status and locations\n• Reassign orders to available drivers\n• Notify customers about delays\n• Optimize delivery routes\n• View performance stats", followUps: ["Today's overview", "Show driver status"] },
};

const CONFIG = {
  name: "Operations AI",
  avatar: "/ai-avatar-circle.svg",
  suggestions: ["Today's overview", "Show driver status", "Any late orders?", "Unassigned orders"],
  placeholder: "Ask about orders, drivers, routes...",
  keywordMap: [
    { keys: ["ok", "okay", "got it", "thanks", "thank you", "cool"],       reply: "ack" },
    { keys: ["hello", "hi", "hey", "good morning"],                         reply: "greeting" },
    { keys: ["help", "what can you"],                                        reply: "help" },
    { keys: ["all orders", "show orders", "order list", "active orders"],    reply: "orders" },
    { keys: ["assign", "give to kira", "assign both"],                      reply: "assign" },
    { keys: ["notify", "tell customer", "notify customer"],                  reply: "notify" },
    { keys: ["late", "delayed", "behind", "running late"],                   reply: "late" },
    { keys: ["unassigned", "no driver", "need driver"],                      reply: "unassigned" },
    { keys: ["driver", "drivers", "who's available", "driver status"],       reply: "drivers" },
    { keys: ["route", "routes", "optimize"],                                 reply: "routes" },
    { keys: ["stats", "overview", "today", "how are", "performance"],        reply: "stats" },
  ],
  richReplies: RICH_REPLIES,
  plainReplies: [
    { text: "I can help with orders, drivers, routes, and delivery tracking. Try asking about today's overview or driver status.", followUps: ["Today's overview", "Show drivers"] },
    { text: "Could you be more specific? I work best with questions about orders, drivers, and deliveries." },
  ],
};

export default function OperationsChat({ onBack, onClose, onEditProfile, nameOverride, avatarOverride, gradientOverride, onStatusChange, extraActions }: { onBack?: () => void; onClose?: () => void; onEditProfile?: () => void; nameOverride?: string; avatarOverride?: string; gradientOverride?: string; onStatusChange?: (s: { isTyping: boolean; lastMsg?: string }) => void; extraActions?: React.ReactNode }) {
  return <BaseAgentChat config={CONFIG} onBack={onBack} onClose={onClose} onEditProfile={onEditProfile} nameOverride={nameOverride} avatarOverride={avatarOverride} gradientOverride={gradientOverride} onStatusChange={onStatusChange} extraActions={extraActions} />;
}
