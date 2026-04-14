import React from "react";

export default function SharedWorldStatus({ title, briefing, compact = false }) {
  if (!briefing) {
    return null;
  }

  return (
    <div
      style={{
        background: compact ? "rgba(0,0,0,0.22)" : "rgba(20,10,5,0.55)",
        border: "1px solid rgba(200,168,78,0.12)",
        borderRadius: compact ? 12 : 6,
        padding: compact ? 12 : 6,
      }}
    >
      {title && <div style={{ fontSize: compact ? 10 : 8, color: "#f0c060", fontWeight: 700, marginBottom: 6 }}>{title}</div>}
      <div style={{ fontSize: compact ? 10 : 9, color: "#ddd", fontWeight: 700, lineHeight: 1.45 }}>{briefing.headline}</div>
      <div style={{ fontSize: compact ? 9 : 7, color: compact ? "#96826d" : "#8f7d68", lineHeight: 1.5, marginTop: 4 }}>{briefing.detail}</div>
      {briefing.blessing && (
        <div style={{ fontSize: compact ? 9 : 7, color: "#c8a0ff", lineHeight: 1.45, marginTop: 4 }}>
          Next run boon: {briefing.blessing}
        </div>
      )}
      <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
        {briefing.cards.map((card) => (
          <div
            key={card.id}
            style={{
              background: "rgba(0,0,0,0.16)",
              border: "1px solid rgba(200,168,78,0.06)",
              borderRadius: 4,
              padding: compact ? "6px 7px" : "4px 5px",
            }}
          >
            <div style={{ fontSize: compact ? 9 : 7, color: card.accent, fontWeight: 700 }}>{card.title}</div>
            <div style={{ fontSize: compact ? 8 : 7, color: compact ? "#a8947e" : "#8f7d68", lineHeight: 1.45, marginTop: 1 }}>
              {card.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
