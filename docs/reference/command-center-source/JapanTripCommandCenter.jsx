// JapanTripCommandCenter.jsx
// Main dashboard component — fujiseat.com /command-center page
//
// Installation:
//   npm install @vis.gl/react-google-maps
//
// .env (Vite):
//   VITE_GOOGLE_MAPS_API_KEY=your_browser_maps_key_here
//   VITE_GOOGLE_MAP_ID=your_optional_map_id   (optional — enables Cloud Console styles)
//
// Usage in your router:
//   import JapanTripCommandCenter from './JapanTripCommandCenter'
//   <Route path="/command-center" element={<JapanTripCommandCenter />} />

import { useState, useEffect } from "react";
import CommandMap from "./CommandMap";
import {
  CITIES,
  MISSION_CHECKLIST,
  INTEL_BRIEFINGS,
  PHRASE_ARSENAL,
} from "./japanTripModel";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// ─── Utility ─────────────────────────────────────────────────────────────────
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatusDot({ status }) {
  const colors = {
    active:  { bg: "#22c55e", shadow: "0 0 6px rgba(34,197,94,0.6)" },
    pending: { bg: "#f59e0b", shadow: "0 0 6px rgba(245,158,11,0.4)" },
    locked:  { bg: "#334155", shadow: "none" },
    ok:      { bg: "#22c55e", shadow: "none" },
    warn:    { bg: "#f59e0b", shadow: "none" },
    info:    { bg: "#4a9eff", shadow: "none" },
  };
  const c = colors[status] || colors.locked;
  return (
    <div style={{
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: c.bg,
      boxShadow: c.shadow,
      flexShrink: 0,
    }} />
  );
}

function Tag({ level, children }) {
  const styles = {
    ok:   { bg: "#001a0d", color: "#22c55e", border: "#003820" },
    warn: { bg: "#1a1000", color: "#f59e0b", border: "#3a2800" },
    info: { bg: "#001228", color: "#4a9eff", border: "#0d2a4a" },
  };
  const s = styles[level] || styles.info;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: "3px",
      padding: "1px 6px",
      fontSize: "9px",
      fontFamily: "'Geist Mono', monospace",
      letterSpacing: "0.08em",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

function PanelTitle({ children }) {
  return (
    <div style={{
      color: "#4a9eff",
      fontSize: "9px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      fontFamily: "'Geist Mono', monospace",
      fontWeight: "600",
      marginBottom: "10px",
      paddingBottom: "6px",
      borderBottom: "1px solid #1e3a5f",
    }}>
      {children}
    </div>
  );
}

// ─── Left panel: mission route ────────────────────────────────────────────────
function MissionRoute({ cities, selectedId, onSelect }) {
  const statusLabel = { active: "CURRENT", pending: "UPCOMING", locked: "LOCKED" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <PanelTitle>Mission Route</PanelTitle>
      {cities.map((city, i) => (
        <div
          key={city.id}
          onClick={() => onSelect(city.id === selectedId ? null : city.id)}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "2px",
            cursor: city.status !== "locked" ? "pointer" : "default",
            opacity: city.status === "locked" ? 0.55 : 1,
          }}
        >
          {/* Timeline spine */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: city.status === "active" ? "#22c55e" : city.status === "pending" ? "#f59e0b" : "#334155",
              border: `1.5px solid ${city.status === "active" ? "#16a34a" : city.status === "pending" ? "#d97706" : "#1e293b"}`,
              boxShadow: city.status === "active" ? "0 0 8px rgba(34,197,94,0.5)" : "none",
              flexShrink: 0,
              marginTop: 2,
            }} />
            {i < cities.length - 1 && (
              <div style={{
                width: 1,
                flex: 1,
                minHeight: 20,
                background: city.status === "active" ? "#22c55e" : "#1e3a5f",
                opacity: 0.5,
                margin: "3px 0",
              }} />
            )}
          </div>

          {/* City info */}
          <div style={{
            flex: 1,
            background: selectedId === city.id ? "rgba(74,158,255,0.06)" : "transparent",
            border: selectedId === city.id ? "1px solid rgba(74,158,255,0.2)" : "1px solid transparent",
            borderRadius: "4px",
            padding: "6px 8px",
            marginBottom: i < cities.length - 1 ? "6px" : 0,
            transition: "all 0.15s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "11px",
                fontWeight: "600",
                color: city.status === "active" ? "#22c55e" : city.status === "pending" ? "#f0c060" : "#6b8ab0",
                letterSpacing: "0.05em",
              }}>
                {city.name}
              </span>
              <span style={{ fontSize: "8px", color: "#4a6080", fontFamily: "monospace" }}>
                {statusLabel[city.status]}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "#6b8ab0", marginBottom: 2 }}>
              {city.days}
            </div>
            <div style={{ fontSize: "10px", color: "#4a6080" }}>
              {city.district}
            </div>
            {city.status === "active" && (
              <div style={{ marginTop: 4, fontSize: "9px", color: "#4a9eff", fontFamily: "monospace" }}>
                ⬡ {city.seatRecommendation}
              </div>
            )}
            {city.status === "pending" && city.intel.some(i => i.level === "warn") && (
              <div style={{ marginTop: 4, fontSize: "9px", color: "#f59e0b" }}>
                ⚠ {city.intel.filter(i => i.level === "warn").length} item{city.intel.filter(i => i.level === "warn").length > 1 ? "s" : ""} need attention
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── City intel panel (shown when a city is selected) ────────────────────────
function CityIntelPanel({ city }) {
  if (!city) return null;
  return (
    <div style={{
      background: "#0d1220",
      border: "1px solid #1e3a5f",
      borderRadius: "6px",
      padding: "12px",
      marginTop: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "#c8d8f0", fontWeight: 600 }}>
          {city.name} — {city.codename}
        </div>
        <a
          href={city.klookUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "9px",
            color: "#4a9eff",
            textDecoration: "none",
            border: "1px solid #1e3a5f",
            borderRadius: "3px",
            padding: "2px 7px",
            fontFamily: "monospace",
          }}
        >
          BOOK VIA KLOOK ↗
        </a>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: "9px", color: "#4a6080", marginBottom: 5, fontFamily: "monospace", letterSpacing: "0.1em" }}>
          HIGHLIGHTS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {city.highlights.map((h) => (
            <span key={h} style={{
              background: "#0d1829",
              border: "1px solid #1e3a5f",
              borderRadius: "3px",
              padding: "2px 7px",
              fontSize: "10px",
              color: "#94b4d4",
              fontFamily: "monospace",
            }}>
              {h}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "9px", color: "#4a6080", marginBottom: 6, fontFamily: "monospace", letterSpacing: "0.1em" }}>
          INTEL
        </div>
        {city.intel.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
            <Tag level={item.level}>{item.tag}</Tag>
            <span style={{ fontSize: "10px", color: "#94b4d4", lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {city.seatRecommendation && (
        <div style={{
          marginTop: 8,
          background: "rgba(74,158,255,0.06)",
          border: "1px solid rgba(74,158,255,0.15)",
          borderRadius: "4px",
          padding: "7px 10px",
          fontSize: "10px",
          color: "#4a9eff",
          fontFamily: "monospace",
        }}>
          🚄 {city.seatRecommendation}
        </div>
      )}
    </div>
  );
}

// ─── Checklist panel ─────────────────────────────────────────────────────────
function Checklist({ items, onToggle }) {
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <>
      <PanelTitle>Pre-mission Checklist</PanelTitle>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "9px", color: "#4a6080", fontFamily: "monospace" }}>MISSION READINESS</span>
          <span style={{ fontSize: "9px", color: pct === 100 ? "#22c55e" : "#4a9eff", fontFamily: "monospace" }}>{pct}%</span>
        </div>
        <div style={{ height: 3, background: "#1e3a5f", borderRadius: 2 }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: pct === 100 ? "#22c55e" : "linear-gradient(90deg, #4a9eff, #22c55e)",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onToggle(item.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 7,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div style={{
            width: 13,
            height: 13,
            borderRadius: 2,
            border: item.done ? "none" : `1px solid ${item.critical ? "#f59e0b" : "#1e3a5f"}`,
            background: item.done ? "#22c55e" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 9,
            color: "#000",
            fontWeight: "bold",
            transition: "all 0.15s ease",
          }}>
            {item.done && "✓"}
          </div>
          <span style={{
            fontSize: "10px",
            fontFamily: "'Geist Mono', monospace",
            color: item.done ? "#334155" : item.critical ? "#c8d8f0" : "#94b4d4",
            textDecoration: item.done ? "line-through" : "none",
            opacity: item.done ? 0.5 : 1,
          }}>
            {item.critical && !item.done && <span style={{ color: "#f59e0b", marginRight: 3 }}>!</span>}
            {item.label}
          </span>
        </div>
      ))}
    </>
  );
}

// ─── Phrase Arsenal ───────────────────────────────────────────────────────────
function PhraseArsenal({ phrases }) {
  return (
    <>
      <PanelTitle>Phrase Arsenal</PanelTitle>
      {phrases.map((p, i) => (
        <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < phrases.length - 1 ? "1px solid #0d1829" : "none" }}>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "#c8d8f0", marginBottom: 2 }}>
            {p.jp}
          </div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "9px", color: "#4a9eff", marginBottom: 1 }}>
            {p.romaji}
          </div>
          <div style={{ fontSize: "10px", color: "#6b8ab0" }}>
            {p.en}
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Global Intel strip ───────────────────────────────────────────────────────
function IntelStrip({ briefings }) {
  return (
    <>
      <PanelTitle>Field Intel</PanelTitle>
      {briefings.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9, alignItems: "flex-start" }}>
          <Tag level={b.level}>{b.tag}</Tag>
          <span style={{ fontSize: "10px", color: "#94b4d4", lineHeight: 1.5 }}>{b.text}</span>
        </div>
      ))}
    </>
  );
}

// ─── Top stats bar ────────────────────────────────────────────────────────────
function StatsBar({ cities, checklist }) {
  const warningCount = cities.filter(c => c.intel?.some(i => i.level === "warn")).length;
  const checklistPending = checklist.filter(i => !i.done && i.critical).length;
  const currentCity = cities.find(c => c.status === "active");

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1px",
      background: "#1e3a5f",
      borderBottom: "1px solid #1e3a5f",
    }}>
      {[
        { label: "CURRENT BASE", value: currentCity?.name || "—", color: "#22c55e" },
        { label: "NEXT SECTOR", value: cities.find(c => c.status === "pending")?.name || "—", color: "#f59e0b" },
        { label: "CITIES LOCKED", value: cities.filter(c => c.status === "locked").length, color: "#4a9eff" },
        { label: "CRITICAL ITEMS", value: checklistPending, color: checklistPending > 0 ? "#f59e0b" : "#22c55e" },
      ].map((s) => (
        <div key={s.label} style={{ background: "#0a0e1a", padding: "8px 14px" }}>
          <div style={{ fontSize: "8px", color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 3 }}>
            {s.label}
          </div>
          <div style={{ fontSize: "16px", fontFamily: "'Geist Mono', monospace", fontWeight: 600, color: s.color }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function JapanTripCommandCenter() {
  const [selectedCityId, setSelectedCityId] = useState("tokyo");
  const [checklist, setChecklist] = useState(MISSION_CHECKLIST);
  const [activeTab, setActiveTab] = useState("intel"); // intel | phrases
  const [tick, setTick] = useState(0);

  // Clock tick for live feel
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const jstTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const selectedCity = CITIES.find(c => c.id === selectedCityId) || null;

  function toggleChecklist(id) {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  }

  const warningCount = checklist.filter(i => !i.done && i.critical).length;

  return (
    <div style={{
      background: "#0a0e1a",
      color: "#c8d8f0",
      minHeight: "100vh",
      fontFamily: "'Geist Mono', 'Courier New', monospace",
      fontSize: "12px",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "#0d1220",
        borderBottom: "1px solid #1e3a5f",
        padding: "9px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#4a9eff", fontWeight: 600, fontSize: 13, letterSpacing: "0.05em" }}>
            ⬡ JAPAN TRIP COMMAND CENTER
          </span>
          <span style={{ color: "#2d4a70", fontSize: 10 }}>{"// fujiseat.com"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <StatusDot status="active" />
            <span style={{ color: "#6b8ab0", fontSize: 10 }}>LIVE</span>
          </div>
          <span style={{ color: "#4a6080", fontSize: 10 }}>JST {jstTime}</span>
          {warningCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <StatusDot status="pending" />
              <span style={{ color: "#f59e0b", fontSize: 10 }}>{warningCount} critical item{warningCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <StatsBar cities={CITIES} checklist={checklist} />

      {/* ── Main layout: 3 columns ───────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "220px 1fr 220px",
        gap: "1px",
        background: "#1e3a5f",
        minHeight: 0,
      }}>

        {/* LEFT: Mission route */}
        <div style={{
          background: "#0a0e1a",
          padding: "14px",
          overflowY: "auto",
        }}>
          <MissionRoute
            cities={CITIES}
            selectedId={selectedCityId}
            onSelect={setSelectedCityId}
          />
        </div>

        {/* CENTER: Map + city intel */}
        <div style={{ background: "#0a0e1a", padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <PanelTitle>Operations Map — Japan</PanelTitle>

          {/* Google Map fills most of the center */}
          <div style={{ flex: 1, minHeight: 320 }}>
            <CommandMap
              apiKey={API_KEY}
              cities={CITIES}
              selectedCity={selectedCityId}
              onCityClick={setSelectedCityId}
              showFujiZone={true}
              height="100%"
            />
          </div>

          {/* City intel expands below map when city selected */}
          {selectedCity && <CityIntelPanel city={selectedCity} />}
        </div>

        {/* RIGHT: Checklist + phrases / intel */}
        <div style={{
          background: "#0a0e1a",
          padding: "14px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>
          <div style={{ marginBottom: 16 }}>
            <Checklist items={checklist} onToggle={toggleChecklist} />
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 1, marginBottom: 12 }}>
            {["intel", "phrases"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  background: activeTab === tab ? "#1e3a5f" : "transparent",
                  border: `1px solid ${activeTab === tab ? "#4a9eff" : "#1e3a5f"}`,
                  borderRadius: "3px",
                  color: activeTab === tab ? "#4a9eff" : "#4a6080",
                  fontSize: "9px",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {tab === "intel" ? "Field Intel" : "Phrases"}
              </button>
            ))}
          </div>

          {activeTab === "intel" && <IntelStrip briefings={INTEL_BRIEFINGS} />}
          {activeTab === "phrases" && <PhraseArsenal phrases={PHRASE_ARSENAL} />}
        </div>
      </div>

      {/* ── Footer ticker ────────────────────────────────────────────────── */}
      <div style={{
        background: "#0d1220",
        borderTop: "1px solid #1e3a5f",
        padding: "6px 16px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px",
        color: "#4a6080",
        flexShrink: 0,
      }}>
        <span>fujiseat.com · Japan Trip Command Center</span>
        <span style={{ color: "#22c55e" }}>
          ▶ Seat E (Tokyo→Osaka) · Seat A (Osaka→Tokyo) for Mt. Fuji views · Fuji visibility: check fujiseat.com
        </span>
      </div>
    </div>
  );
}
