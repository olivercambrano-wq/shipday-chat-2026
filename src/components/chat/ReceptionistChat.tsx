import React from "react";
import BaseAgentChat, { StatsRow, AlertCard, type Reply } from "./BaseAgentChat";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

function CallCard({ caller, time, duration, status }: { caller: string; time: string; duration: string; status: string }) {
  const t = useTheme();
  const color = status === "Answered" ? "#16a34a" : status === "Missed" ? "#dc2626" : "#EA580C";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgTertiary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="call" size={18} color={t.textMuted} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{caller}</div>
        <div style={{ fontSize: 14, color: t.textMuted }}>{time} · {duration}</div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color }}>{status}</span>
    </div>
  );
}

function ReservationCard({ name, time, guests, note }: { name: string; time: string; guests: number; note: string }) {
  const t = useTheme();
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</span>
        <span style={{ fontSize: 14, color: t.textMuted }}>{time} · {guests} guests</span>
      </div>
      <div style={{ fontSize: 14, color: t.textMuted }}>{note}</div>
    </div>
  );
}

const RICH_REPLIES: Record<string, Reply> = {
  stats: {
    text: "Here's your call activity today:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Total calls", value: "34" },
          { label: "Answered",    value: "28", change: "82%", positive: true },
          { label: "Missed",      value: "6", change: "↓ from 9", positive: true },
        ]} />
        <AlertCard type="info" icon="trending_up" title="Peak hours: 11 AM – 1 PM" text="Most calls come during lunch. Consider adding a second line for that window." />
      </>
    ),
    followUps: ["Show missed calls", "Show reservations"],
  },
  calls: {
    text: "Recent calls:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <CallCard caller="Sarah Johnson" time="12:34 PM" duration="2:15" status="Answered" />
        <CallCard caller="Unknown" time="12:20 PM" duration="0:08" status="Missed" />
        <CallCard caller="David Chen" time="11:55 AM" duration="3:42" status="Answered" />
        <CallCard caller="Catering inquiry" time="11:30 AM" duration="5:10" status="Answered" />
      </div>
    ),
    followUps: ["Call back unknown", "Show call stats"],
  },
  missed: {
    text: "You have 6 missed calls today:",
    card: () => (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <CallCard caller="Unknown" time="12:20 PM" duration="0:08" status="Missed" />
          <CallCard caller="+1 (512) 555-0198" time="11:10 AM" duration="0:12" status="Missed" />
          <CallCard caller="Emma Wilson" time="10:45 AM" duration="0:05" status="Missed" />
        </div>
        <AlertCard type="warning" icon="phone_missed" title="3 in the last hour" text="Consider enabling auto-response for missed calls to capture customer intent." />
      </>
    ),
    followUps: ["Enable auto-response", "Call back Emma"],
  },
  reservations: {
    text: "Upcoming reservations:",
    card: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <ReservationCard name="Martinez party" time="6:00 PM" guests={4} note="Birthday — need cake" />
        <ReservationCard name="Johnson" time="7:30 PM" guests={2} note="Window seat requested" />
        <ReservationCard name="Corporate dinner" time="8:00 PM" guests={12} note="Pre-ordered menu" />
      </div>
    ),
    followUps: ["Add a reservation", "Show today's stats"],
  },
  faq: {
    text: "Top questions customers ask:\n\n1. \"What are your hours?\" — Mon–Sat 11 AM – 10 PM, Sun 12 – 9 PM\n2. \"Do you deliver?\" — Yes, via Shipday\n3. \"Do you take reservations?\" — Yes, call or book online\n4. \"Is there parking?\" — Free lot behind the building\n5. \"Holiday hours?\" — Check our Google page",
    followUps: ["Edit hours", "Show call stats"],
  },
  autoResponse: { text: null, card: () => <AlertCard type="success" icon="check_circle" title="Auto-response enabled" text="Missed calls will receive a text with your ordering link and hours." />, followUps: ["Edit auto-response", "Show call stats"] },
  greeting: { text: "Hi! I'm your Receptionist AI. I handle phone calls, take reservations, and answer customer questions — so you don't have to. What do you need?", followUps: ["Today's call activity", "Show reservations", "Common FAQs"] },
  ack: { text: "Anything else?", followUps: ["Call stats", "Reservations", "Missed calls"] },
  help: { text: "I can help you with:\n• Monitor incoming and missed calls\n• Manage reservations\n• Auto-respond to missed calls\n• Answer common customer questions\n• View call analytics", followUps: ["Today's stats", "Show reservations"] },
};

const CONFIG = {
  name: "Receptionist AI",
  avatar: "/ai-avatar-pill.svg",
  suggestions: ["Today's call activity", "Show reservations", "Missed calls", "Common FAQs"],
  placeholder: "Ask about calls, reservations, FAQs...",
  keywordMap: [
    { keys: ["ok", "okay", "got it", "thanks", "thank you"],          reply: "ack" },
    { keys: ["hello", "hi", "hey"],                                     reply: "greeting" },
    { keys: ["help", "what can you"],                                    reply: "help" },
    { keys: ["auto-response", "auto response", "enable auto"],          reply: "autoResponse" },
    { keys: ["missed", "missed call"],                                   reply: "missed" },
    { keys: ["call", "calls", "phone", "recent call"],                  reply: "calls" },
    { keys: ["reservation", "reservations", "booking", "table"],        reply: "reservations" },
    { keys: ["faq", "common question", "hours", "parking"],             reply: "faq" },
    { keys: ["stats", "overview", "today", "activity", "summary"],      reply: "stats" },
  ],
  richReplies: RICH_REPLIES,
  plainReplies: [
    { text: "I handle calls, reservations, and customer FAQs. Try asking about today's call activity or reservations.", followUps: ["Today's stats", "Reservations"] },
    { text: "Could you be more specific? I work best with questions about calls, reservations, and customer inquiries." },
  ],
};

export default function ReceptionistChat({ onBack }: { onBack: () => void }) {
  return <BaseAgentChat config={CONFIG} onBack={onBack} />;
}
