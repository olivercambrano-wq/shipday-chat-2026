import React, { useState } from "react";
import BaseAgentChat, { StatsRow, AlertCard, type Reply, type Msg } from "./BaseAgentChat";
import { useTheme } from "../../lib/ThemeContext";
import Icon from "../ui/Icon";

// ── Marketing-specific cards ──────────────────────────────────────────────

function ApprovableCampaign({ name, type, detail, time, icon }: { name: string; type: string; detail: string; time: string; icon: string }) {
  const t = useTheme();
  const [status, setStatus] = useState<"pending" | "approved">("pending");
  if (status === "approved") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {time}</div>
          </div>
          <Icon name="check_circle" size={22} color={t.accent} fill />
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{type} · {time}</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>&ldquo;{detail}&rdquo;</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStatus("approved")} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", transition: "opacity 120ms ease" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >Approve</button>
      </div>
    </div>
  );
}

function CampaignProposal({ name, type, icon, preview }: { name: string; type: string; icon: string; preview: string }) {
  const t = useTheme();
  const [status, setStatus] = useState<"draft" | "launched">("draft");
  if (status === "launched") {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: t.accentLight, marginBottom: 10 }}>
          <Icon name="check_circle" size={16} color={t.accent} fill />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.accent }}>Campaign scheduled</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{name}</div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 3 }}>{type}</div>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{type}</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: "20px", padding: "10px 12px", borderRadius: 10, background: t.bgTertiary }}>&ldquo;{preview}&rdquo;</div>
      <button onClick={() => setStatus("launched")} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start", transition: "opacity 120ms ease" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >Launch</button>
    </div>
  );
}

function CouponProposal({ code, discount, description }: { code: string; discount: string; description: string }) {
  const t = useTheme();
  const [created, setCreated] = useState(false);
  if (created) {
    return (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sell" size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "0.04em" }}>{code}</div>
            <div style={{ fontSize: 14, color: t.textMuted }}>{discount} · {description}</div>
          </div>
          <Icon name="check_circle" size={22} color={t.accent} fill />
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="sell" size={20} color={t.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "0.04em" }}>{code}</div>
          <div style={{ fontSize: 14, color: t.textMuted }}>{discount} · {description}</div>
        </div>
      </div>
      <button onClick={() => setCreated(true)} style={{ height: 36, padding: "0 18px", borderRadius: 12, border: "none", background: t.accent, fontSize: 14, fontWeight: 600, color: "#FFFFFF", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start", transition: "opacity 120ms ease" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >Create code</button>
    </div>
  );
}

// ── Config ─────────────────────────────────────────────────────────────────

const RICH_REPLIES: Record<string, Reply> = {
  stats: {
    text: "Here's how your campaigns performed this week:",
    card: () => (
      <StatsRow stats={[
        { label: "Revenue driven", value: "$2,840", change: "↑ 18%", positive: true },
        { label: "Orders",         value: "143",    change: "↑ 12%", positive: true },
        { label: "SMS opens",      value: "61%",    change: "↑ 4%",  positive: true },
      ]} />
    ),
    followUps: ["Show pending approvals", "Create a campaign"],
  },
  pending: {
    text: "2 campaigns are waiting for your approval:",
    card: () => (
      <>
        <ApprovableCampaign name="Weekend special" type="SMS" icon="sms" detail="Craving something delicious? Get 20% off this weekend only. Order now →" time="Fri 6 PM · 1,240 subscribers" />
        <ApprovableCampaign name="Order direct" type="Tracking page" icon="pageview" detail="Skip the fees — order directly from us and save!" time="Ongoing · all deliveries" />
      </>
    ),
    followUps: ["Create a new campaign", "Show my budget"],
  },
  sms: {
    text: "Here's your SMS campaign performance:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Sent", value: "1,204" },
          { label: "Open rate", value: "61%", change: "↑ 8%", positive: true },
          { label: "Orders", value: "38", change: "↑ 5", positive: true },
        ]} />
        <AlertCard type="success" icon="check_circle" title="Best open rate yet" text="This week's SMS hit 61% open rate — well above your 48% average." />
      </>
    ),
    followUps: ["Create another SMS campaign", "Show full history"],
  },
  budget: {
    text: "Here's your budget for this month:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Budget", value: "$250" },
          { label: "Spent", value: "$180", change: "72% used", positive: true },
          { label: "Remaining", value: "$70" },
        ]} />
        <AlertCard type="info" icon="info" title="On track" text="At current pace, you'll finish the month within budget. Best ROI: SMS at $4.20 per $1 spent." />
      </>
    ),
    followUps: ["Show ROI breakdown", "Create a campaign"],
  },
  create: {
    text: "I drafted an SMS campaign based on your best performers:",
    card: () => <CampaignProposal name="Weekend special — 20% off" type="SMS · 1,240 subscribers" icon="sms" preview="Craving something delicious? Get 20% off your next order this weekend only. Tap to order →" />,
    followUps: ["Create a coupon code", "Show my stats"],
  },
  createCoupon: {
    text: "Here's a coupon code for you:",
    card: () => <CouponProposal code="WEEKEND20" discount="20% off" description="Valid this weekend · all menu items" />,
    followUps: ["Create another code", "Show active codes"],
  },
  coupon: {
    text: "Here are your active coupon codes:",
    card: () => (
      <>
        <StatsRow stats={[
          { label: "Active codes", value: "3" },
          { label: "Redemptions", value: "84", change: "↑ 22%", positive: true },
          { label: "Revenue", value: "$960", change: "↑ 18%", positive: true },
        ]} />
      </>
    ),
    followUps: ["Create a new code", "Show top codes"],
  },
  greeting: { text: "Hey! I'm your AI Marketing Manager. I help you create campaigns, manage coupon codes, track performance, and grow your restaurant's revenue. What would you like to do?", followUps: ["Create an SMS campaign", "How are my campaigns doing?", "Show pending approvals"] },
  ack: { text: "Anything else I can help with?", followUps: ["Create a campaign", "Show my stats", "Show pending approvals"] },
  help: { text: "I can help you with:\n• Create and manage SMS campaigns\n• Set up tracking page promotions\n• Launch print flyer campaigns\n• Create and manage coupon codes\n• Check campaign stats and ROI\n• Review and approve pending campaigns", followUps: ["Create a campaign", "Show my stats"] },
};

const CONFIG = {
  name: "Marketing AI",
  avatar: "/marketing-manager-logo.svg",
  suggestions: ["Create an SMS campaign", "How are my campaigns doing?", "Show pending approvals", "What's my budget this month?"],
  placeholder: "Ask about campaigns, coupons, stats...",
  keywordMap: [
    { keys: ["ok", "okay", "got it", "thanks", "thank you", "cool"],                   reply: "ack" },
    { keys: ["hello", "hi", "hey", "good morning"],                                     reply: "greeting" },
    { keys: ["help", "what can you"],                                                    reply: "help" },
    { keys: ["create coupon", "coupon code", "new coupon", "new code"],                  reply: "createCoupon" },
    { keys: ["create sms", "create an sms", "new sms", "create campaign", "new campaign"], reply: "create" },
    { keys: ["approve all", "approve everything"],                                       reply: "pending" },
    { keys: ["stats", "results", "performance", "revenue", "how are", "doing"],          reply: "stats" },
    { keys: ["pending", "approval", "review", "waiting", "approve"],                     reply: "pending" },
    { keys: ["sms", "text", "subscriber", "open rate"],                                  reply: "sms" },
    { keys: ["budget", "spend", "cost", "how much", "remaining"],                        reply: "budget" },
    { keys: ["coupon", "promo code", "discount", "active codes"],                        reply: "coupon" },
  ],
  richReplies: RICH_REPLIES,
  plainReplies: [
    { text: "I can create SMS campaigns, tracking page promos, print flyers, and coupon codes. I can also show your stats, check your budget, or tell you what's pending approval.", followUps: ["Create an SMS campaign", "Show pending approvals"] },
    { text: "Could you be more specific? I work best with questions about campaigns, revenue, budget, or approvals." },
  ],
};

export default function MarketingChat({ onBack }: { onBack: () => void }) {
  return <BaseAgentChat config={CONFIG} onBack={onBack} />;
}
