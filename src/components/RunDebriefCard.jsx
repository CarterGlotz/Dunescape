import React from "react";

export default function RunDebriefCard({ debrief }) {
  if (!debrief) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.16)",
        border: `1px solid ${debrief.accent}44`,
        borderRadius: 4,
        padding: 6,
        marginBottom: 4,
      }}
    >
      <div style={{ color: debrief.accent, fontSize: 8, fontWeight: 700, letterSpacing: 0.4 }}>RUN DEBRIEF</div>
      <div style={{ color: "#ddd", fontSize: 10, fontWeight: 700, marginTop: 2 }}>{debrief.result}</div>
      <div style={{ color: "#8f7d68", fontSize: 7, lineHeight: 1.45, marginTop: 3 }}>{debrief.impact}</div>
      <div style={{ color: "#c8a84e", fontSize: 7, lineHeight: 1.45, marginTop: 4 }}>{debrief.nextStep}</div>
      <div style={{ color: "#777", fontSize: 7, lineHeight: 1.4, marginTop: 3 }}>{debrief.followup}</div>
    </div>
  );
}
