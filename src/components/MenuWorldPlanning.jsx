import React from "react";

export default function MenuWorldPlanning({ almanac, mythScenes }) {
  const forecast = Array.isArray(almanac?.forecast) ? almanac.forecast.slice(0, 3) : [];
  const scenes = Array.isArray(mythScenes?.scenes) ? mythScenes.scenes.slice(0, 3) : [];

  if (!forecast.length && !scenes.length) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {forecast.length > 0 && (
        <div style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(200,168,78,0.08)", borderRadius: 8, padding: 10 }}>
          <div style={{ color: "#f0c060", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>SUN ALMANAC</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(112px,1fr))", gap: 8, marginTop: 8 }}>
            {forecast.map((day) => (
              <div key={day.dayNumber} style={{ background: day.offset === 0 ? "rgba(60,32,8,0.62)" : "rgba(0,0,0,0.16)", border: `1px solid ${day.offset === 0 ? "#c8a84e" : "rgba(200,168,78,0.08)"}`, borderRadius: 6, padding: 8 }}>
                <div style={{ color: day.offset === 0 ? "#f0c060" : "#b79b6f", fontSize: 9, fontWeight: 800 }}>{day.label}</div>
                <div style={{ color: "#ddd", fontSize: 11, fontWeight: 800, marginTop: 3 }}>{day.modifier?.label || "Steady Route"}</div>
                <div style={{ color: "#9f8a73", fontSize: 8, lineHeight: 1.45, marginTop: 4 }}>{day.bestFor || "steady routing"}</div>
              </div>
            ))}
          </div>
          {almanac.planningLine && <div style={{ color: "#8f7d68", fontSize: 9, lineHeight: 1.45, marginTop: 8 }}>{almanac.planningLine}</div>}
        </div>
      )}

      {scenes.length > 0 && (
        <div style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(160,128,220,0.1)", borderRadius: 8, padding: 10 }}>
          <div style={{ color: "#c8a0ff", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{mythScenes?.title || "MYTH SO FAR"}</div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {scenes.map((scene, index) => (
              <div key={`${index}-${scene}`} style={{ color: "#a996c8", fontSize: 9, lineHeight: 1.55, fontStyle: "italic" }}>
                {scene}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
