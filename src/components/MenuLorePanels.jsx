import React from "react";
import {
  FEATURE_PILLARS,
  HOW_TO_PLAY_STEPS,
  KNOWLEDGE_BASE,
  UPDATE_LOG_ITEMS,
} from "../game/content.js";

export default function MenuLorePanels({ menuSection }) {
  if (menuSection === "how") {
    return (
      <div>
        <div style={{ color: "#f0c060", fontSize: 11, letterSpacing: 2, fontWeight: 800 }}>HOW TO PLAY</div>
        <div style={{ color: "#ddd", fontSize: 26, fontWeight: 900, marginTop: 6 }}>First five minutes</div>
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {HOW_TO_PLAY_STEPS.map((step, i) => (
            <div
              key={step}
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(200,168,78,0.08)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                gap: 12,
              }}
            >
              <div style={{ color: "#f0c060", fontSize: 18, fontWeight: 900, minWidth: 18 }}>{i + 1}</div>
              <div style={{ color: "#c8b9a6", fontSize: 12, lineHeight: 1.6 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (menuSection === "knowledge") {
    return (
      <div>
        <div style={{ color: "#f0c060", fontSize: 11, letterSpacing: 2, fontWeight: 800 }}>KNOWLEDGE BASE</div>
        <div style={{ color: "#ddd", fontSize: 26, fontWeight: 900, marginTop: 6 }}>Why the world matters</div>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {KNOWLEDGE_BASE.map((item) => (
            <div key={item.title} style={{ background: "rgba(0,0,0,0.22)", border: "1px solid rgba(200,168,78,0.08)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, color: "#f0c060", fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#b9ab98", lineHeight: 1.65 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (menuSection === "features") {
    return (
      <div>
        <div style={{ color: "#f0c060", fontSize: 11, letterSpacing: 2, fontWeight: 800 }}>FEATURES</div>
        <div style={{ color: "#ddd", fontSize: 26, fontWeight: 900, marginTop: 6 }}>Async multiplayer pillars</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 16 }}>
          {FEATURE_PILLARS.map((item) => (
            <div key={item.title} style={{ background: "rgba(0,0,0,0.22)", border: "1px solid rgba(200,168,78,0.08)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, color: "#f0c060", fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#b9ab98", lineHeight: 1.65 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (menuSection === "updates") {
    return (
      <div>
        <div style={{ color: "#f0c060", fontSize: 11, letterSpacing: 2, fontWeight: 800 }}>UPDATE LOG</div>
        <div style={{ color: "#ddd", fontSize: 26, fontWeight: 900, marginTop: 6 }}>Recent build history</div>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {UPDATE_LOG_ITEMS.map((item) => (
            <div key={item.date + item.title} style={{ background: "rgba(0,0,0,0.22)", border: "1px solid rgba(200,168,78,0.08)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#8f7d68", marginBottom: 4 }}>{item.date}</div>
              <div style={{ fontSize: 13, color: "#f0c060", fontWeight: 800, marginBottom: 8 }}>{item.title}</div>
              <div style={{ display: "grid", gap: 6 }}>
                {item.notes.map((note) => (
                  <div key={note} style={{ fontSize: 11, color: "#b9ab98", lineHeight: 1.6 }}>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
