"use client";

import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
const CommandMap = lazy(() => import("./CommandMap"));
import {
  CITIES,
  MISSION_CHECKLIST,
  INTEL_BRIEFINGS,
  PHRASE_ARSENAL,
  SHINKANSEN_ROUTE,
  TRIP_DEPARTURE_DATE,
  EMERGENCY_CONTACTS,
  RESTAURANTS,
  FOOD_TOUR_LINKS,
  ACCOMMODATIONS,
  DAILY_BRIEFINGS,
  ROUTE_TEMPLATES,
} from "./japanTripModel";
import { getAffUrl } from "./affiliateLinks";
import { AFFILIATE_REL } from "../lib/link-rel";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const LS_KEY = "fujiseat_checklist";
const LS_LAUNCHED = "fujiseat_launched";
const LS_ACTIVITIES = "fujiseat_activities";
const LS_BRIEFING = "fujiseat_briefing_seen";
const LS_TEMPLATE = "fujiseat_template";
const LS_DEPARTURE = "fujiseat_departure";
const LS_PHASE = "fujiseat_trip_phase";

const BOOKING_ESSENTIALS = [
  {
    label: "JR Pass / trains",
    note: "Check before long-distance routes.",
    url: getAffUrl("jrPass"),
  },
  {
    label: "Japan eSIM",
    note: "Maps, translate, transit before you land.",
    url: getAffUrl("esim"),
  },
  {
    label: "Airport transfer",
    note: "Narita/Haneda into Tokyo with less friction.",
    url: getAffUrl("airportTransfer"),
  },
  {
    label: "Travel insurance",
    note: "Medical and cancellation coverage.",
    url: getAffUrl("insurance"),
  },
];

const PHASE_META = {
  planning: {
    label: "Planning",
    shortLabel: "Plan",
    note: "Lock in trains, internet, airport transfer, and the first stay.",
    focus: "Book essentials",
  },
  departure: {
    label: "Departure",
    shortLabel: "Depart",
    note: "Final checks before leaving Japan.",
    focus: "Airport transfer",
  },
};

const CITY_PHASE_META = {
  tokyo: { note: "Arrival base, IC card, cash, and first Tokyo activities.", focus: "Tokyo setup" },
  nikko: { note: "A day-trip decision from Tokyo.", focus: "Day trip" },
  kyoto: { note: "Temple timing, cash, and Kyoto activity bookings.", focus: "Kyoto days" },
  osaka: { note: "Food, nightlife, Osaka stay, and onward transfers.", focus: "Osaka stay" },
  hiroshima: { note: "Long-distance day trip and JR Pass value check.", focus: "Long rail day" },
};

function getTripPhaseOptions(cities) {
  return [
    { id: "planning", ...PHASE_META.planning },
    ...cities.map(city => ({
      id: city.id,
      label: city.name,
      shortLabel: city.name.slice(0, 3),
      note: CITY_PHASE_META[city.id]?.note || city.district,
      focus: CITY_PHASE_META[city.id]?.focus || city.days,
      cityId: city.id,
    })),
    { id: "departure", ...PHASE_META.departure },
  ];
}

function getPhaseOption(phaseId, cities) {
  const options = getTripPhaseOptions(cities);
  return options.find(option => option.id === phaseId) || options[0];
}

function getNextPhaseLabel(phaseId, cities) {
  const options = getTripPhaseOptions(cities);
  const index = options.findIndex(option => option.id === phaseId);
  return options[index + 1]?.label || "Complete";
}

function getPhaseCityId(phaseId, cities, selectedCityId) {
  if (cities.some(city => city.id === phaseId)) return phaseId;
  return selectedCityId || cities[0]?.id || "tokyo";
}

function applyPhaseStatus(cities, phaseId) {
  const activeIndex = cities.findIndex(city => city.id === phaseId);
  if (activeIndex < 0) return cities;
  return cities.map((city, index) => ({
    ...city,
    status: index === activeIndex ? "active" : index < activeIndex ? "pending" : "locked",
  }));
}

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

function useIsMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${bp}px)`);
    setM(mql.matches);
    const h = (e) => setM(e.matches);
    mql.addEventListener("change", h);
    return () => mql.removeEventListener("change", h);
  }, [bp]);
  return m;
}

function interpolateRoute(route, progress) {
  const n = route.length - 1;
  const exact = progress * n;
  const i = Math.min(Math.floor(exact), n - 1);
  const t = exact - i;
  const a = route[i], b = route[i + 1];
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

function MapPlaceholder() {
  return (
    <div style={{
      width: "100%", height: "100%", background: "#060c18",
      border: "1px solid #1e3a5f", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Geist Mono', monospace",
    }}>
      <span style={{ color: "#4a9eff", fontSize: 10, letterSpacing: "0.1em" }}>
        LOADING MAP...
      </span>
    </div>
  );
}

// ─── Launch Overlay ──────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "Connecting to satellite network...", delay: 0.4 },
  { text: "Loading city intel database...", delay: 0.7 },
  { text: "Mapping Shinkansen corridors...", delay: 1.0 },
  { text: "Calibrating Mt. Fuji view zone...", delay: 1.3 },
  { text: "Syncing mission checklist...", delay: 1.6 },
  { text: "All systems operational.", delay: 2.0 },
];

function LaunchOverlay({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1100;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const timer = setTimeout(onComplete, 1400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#0a0e1a",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Geist Mono', 'Courier New', monospace",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ fontSize: 36, color: "#4a9eff", marginBottom: 16 }}
      >
        ⬡
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          fontSize: 16, fontWeight: 600, color: "#4a9eff",
          letterSpacing: "0.15em", marginBottom: 6,
        }}
      >
        JAPAN TRIP COMMAND CENTER
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 10, color: "#2d4a70", marginBottom: 32, letterSpacing: "0.1em" }}
      >
        // fujiseat.com
      </motion.div>

      <div style={{ width: 320, maxWidth: "80vw" }}>
        {BOOT_LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: line.delay, duration: 0.3 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 6, fontSize: 10,
            }}
          >
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: progress > (line.delay + 0.3) / 2.8 ? "#22c55e" : "#1e3a5f",
              transition: "background 0.3s",
            }} />
            <span style={{ color: progress > (line.delay + 0.3) / 2.8 ? "#6b8ab0" : "#2d4a70", transition: "color 0.3s" }}>
              {line.text}
            </span>
            {progress > (line.delay + 0.3) / 2.8 && (
              <span style={{ color: "#22c55e", fontSize: 8, marginLeft: "auto" }}>OK</span>
            )}
          </motion.div>
        ))}

        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: "#4a6080", letterSpacing: "0.1em" }}>INITIALIZING</span>
            <span style={{ fontSize: 8, color: "#4a9eff" }}>{Math.round(progress * 100)}%</span>
          </div>
          <div style={{ height: 3, background: "#1e3a5f", borderRadius: 2, overflow: "hidden" }}>
            <motion.div style={{
              height: "100%", width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #4a9eff, #22c55e)",
              borderRadius: 2,
            }} />
          </div>
        </div>

        {progress >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: 16, textAlign: "center",
              fontSize: 11, fontWeight: 600, color: "#22c55e",
              letterSpacing: "0.2em",
            }}
          >
            ▶ ROUTE READY
          </motion.div>
        )}
      </div>
      <button
        type="button"
        onClick={onComplete}
        style={{
          position: "absolute", right: 16, bottom: 16,
          background: "rgba(74,158,255,0.08)",
          border: "1px solid rgba(74,158,255,0.25)",
          borderRadius: 5, color: "#4a9eff",
          padding: "7px 10px", fontSize: 10,
          fontFamily: "'Geist Mono', monospace",
          letterSpacing: "0.08em", cursor: "pointer",
        }}
      >
        SKIP
      </button>
    </motion.div>
  );
}

// ─── Timeline Playback Controls ──────────────────────────────────────────────
function TimelineControls({ isPlaying, onToggle, progress, onSeek, isMobile }) {
  const cities = ["TYO", "YKH", "FUJI", "SZO", "HMM", "NGY", "KYO", "OSA", "HRS", "FUK"];
  const barRef = useRef(null);

  const handleClick = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: isMobile ? 6 : 10,
      padding: isMobile ? "6px 0" : "0",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: 28, height: 28,
          background: isPlaying ? "rgba(34,197,94,0.15)" : "rgba(74,158,255,0.1)",
          border: `1px solid ${isPlaying ? "#22c55e" : "#1e3a5f"}`,
          borderRadius: 4,
          color: isPlaying ? "#22c55e" : "#4a9eff",
          fontSize: 12, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      <div
        ref={barRef}
        onClick={handleClick}
        style={{
          flex: 1, height: 18,
          background: "#0d1220",
          border: "1px solid #1e3a5f",
          borderRadius: 3,
          position: "relative",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, rgba(74,158,255,0.15), rgba(34,197,94,0.15))",
          transition: isPlaying ? "none" : "width 0.2s",
        }} />
        <div style={{
          position: "absolute", top: 0, left: `${progress * 100}%`, bottom: 0,
          width: 2, background: "#4a9eff",
          transform: "translateX(-1px)",
        }} />
        {!isMobile && cities.map((c, i) => (
          <span key={c} style={{
            position: "absolute",
            left: `${(i / (cities.length - 1)) * 100}%`,
            top: "50%", transform: "translate(-50%, -50%)",
            fontSize: 6, color: "#2d4a70",
            fontFamily: "monospace",
            pointerEvents: "none",
          }}>
            {c}
          </span>
        ))}
      </div>

      <span style={{
        fontSize: 9, color: "#4a6080",
        fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0,
        minWidth: 30,
      }}>
        🚄
      </span>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = {
    active:  { bg: "#22c55e", shadow: "0 0 6px rgba(34,197,94,0.6)" },
    pending: { bg: "#f59e0b", shadow: "0 0 6px rgba(245,158,11,0.4)" },
    locked:  { bg: "#334155", shadow: "none" },
  };
  const c = colors[status] || colors.locked;
  return (
    <div style={{
      width: 7, height: 7, borderRadius: "50%",
      background: c.bg, boxShadow: c.shadow, flexShrink: 0,
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
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, borderRadius: "3px",
      padding: "1px 6px", fontSize: "9px",
      fontFamily: "'Geist Mono', monospace",
      letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

function PanelTitle({ children }) {
  return (
    <div style={{
      color: "#4a9eff", fontSize: "9px", letterSpacing: "0.18em",
      textTransform: "uppercase", fontFamily: "'Geist Mono', monospace",
      fontWeight: "600", marginBottom: "10px", paddingBottom: "6px",
      borderBottom: "1px solid #1e3a5f",
    }}>
      {children}
    </div>
  );
}

function RouteTemplateSelector({ selectedId, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 8, color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>SELECT ROUTE TEMPLATE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {ROUTE_TEMPLATES.map(tmpl => (
          <button key={tmpl.id} onClick={() => onChange(tmpl.id)} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "7px 10px",
            background: selectedId === tmpl.id ? "rgba(74,158,255,0.1)" : "#0d1220",
            border: `1px solid ${selectedId === tmpl.id ? "#4a9eff" : "#1e3a5f"}`,
            borderRadius: 5, cursor: "pointer", textAlign: "left",
            transition: "all 0.15s ease",
          }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", fontWeight: 600, color: selectedId === tmpl.id ? "#4a9eff" : "#94b4d4", letterSpacing: "0.05em" }}>
                {tmpl.name}
              </div>
              <div style={{ fontSize: 9, color: "#4a6080", marginTop: 1 }}>{tmpl.description}</div>
            </div>
            <span style={{
              fontSize: 8, padding: "2px 6px", borderRadius: 3, fontFamily: "monospace",
              background: selectedId === tmpl.id ? "#001228" : "transparent",
              color: selectedId === tmpl.id ? "#4a9eff" : "#4a6080",
              border: `1px solid ${selectedId === tmpl.id ? "#0d2a4a" : "transparent"}`,
            }}>{tmpl.duration}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DepartureDatePicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 8, color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>DEPARTURE DATE</div>
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "#0d1220", border: "1px solid #1e3a5f",
          borderRadius: 4, padding: "6px 8px", color: "#c8d8f0",
          fontSize: 11, fontFamily: "'Geist Mono', monospace", outline: "none",
          colorScheme: "dark",
        }} />
    </div>
  );
}

function TripPhaseSelector({ cities, selectedId, onChange, isMobile }) {
  const phases = getTripPhaseOptions(cities);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 8, color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>TRIP PHASE</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
        gap: 5,
      }}>
        {phases.map(phase => (
          <button
            key={phase.id}
            type="button"
            onClick={() => onChange(phase.id)}
            title={phase.note}
            style={{
              minHeight: 44,
              padding: "7px 8px",
              background: selectedId === phase.id ? "rgba(34,197,94,0.12)" : "#0d1220",
              border: `1px solid ${selectedId === phase.id ? "#22c55e" : "#1e3a5f"}`,
              borderRadius: 5,
              color: selectedId === phase.id ? "#22c55e" : "#94b4d4",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Geist Mono', monospace", letterSpacing: "0.04em" }}>
              {phase.label}
            </div>
            <div style={{ marginTop: 2, fontSize: 8, color: selectedId === phase.id ? "#86efac" : "#4a6080", lineHeight: 1.35 }}>
              {phase.focus}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingContextPanel({ phase, city }) {
  const cityAcc = city ? ACCOMMODATIONS[city.id] : null;
  const foodTour = city ? FOOD_TOUR_LINKS[city.id] : null;
  const planningItems = [
    BOOKING_ESSENTIALS[0],
    BOOKING_ESSENTIALS[1],
    BOOKING_ESSENTIALS[2],
  ];
  const cityItems = [
    city && { label: `${city.name} things to do`, note: city.district, url: city.klookUrl },
    cityAcc && { label: `${city.name} hotels`, note: cityAcc.area, url: cityAcc.klookUrl },
    foodTour && { label: foodTour.label, note: "Food tour and local experiences.", url: foodTour.url },
  ].filter(Boolean);
  const departureItems = [
    BOOKING_ESSENTIALS[2],
    BOOKING_ESSENTIALS[3],
  ];

  const items = phase.id === "planning"
    ? planningItems
    : phase.id === "departure"
      ? departureItems
      : cityItems.length > 0 ? cityItems : [BOOKING_ESSENTIALS[0]];

  return (
    <>
      <PanelTitle>Booking Focus</PanelTitle>
      <div style={{
        background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(74,158,255,0.08))",
        border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: 7,
        padding: "10px 11px",
        marginBottom: 9,
      }}>
        <div style={{ fontSize: 11, color: "#c8d8f0", fontWeight: 700, fontFamily: "'Geist Mono', monospace", marginBottom: 4 }}>
          {phase.label}: {phase.focus}
        </div>
        <div style={{ fontSize: 9, color: "#94b4d4", lineHeight: 1.5 }}>
          {phase.note}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
        {items.map(item => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel={AFFILIATE_REL}
            style={{
              display: "block",
              textDecoration: "none",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#f8d28a", fontSize: 10, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>
                {item.label}
              </span>
              <span style={{ color: "#f59e0b", fontSize: 8, fontFamily: "monospace", flexShrink: 0 }}>OPEN ↗</span>
            </div>
            <div style={{ color: "#9fb3c8", fontSize: 9, marginTop: 3, lineHeight: 1.45 }}>
              {item.note}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

function MissionRoute({ cities, selectedId, phaseId, onSelect }) {
  const statusLabel = { active: "NOW", pending: "VISITED", locked: "NEXT" };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PanelTitle>Trip Route</PanelTitle>
      {cities.map((city, i) => (
        <motion.div
          key={city.id}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          onClick={() => onSelect(city.id)}
          style={{
            display: "flex", gap: "10px", marginBottom: "2px",
            cursor: "pointer",
            opacity: city.status === "locked" ? 0.7 : 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: city.status === "active" ? "#22c55e" : city.status === "pending" ? "#f59e0b" : "#334155",
              border: `1.5px solid ${city.status === "active" ? "#16a34a" : city.status === "pending" ? "#d97706" : "#1e293b"}`,
              boxShadow: city.status === "active" ? "0 0 8px rgba(34,197,94,0.5)" : "none",
              flexShrink: 0, marginTop: 2,
            }} />
            {i < cities.length - 1 && (
              <div style={{
                width: 1, flex: 1, minHeight: 20,
                background: city.status === "active" ? "#22c55e" : "#1e3a5f",
                opacity: 0.5, margin: "3px 0",
              }} />
            )}
          </div>
          <div style={{
            flex: 1,
            background: selectedId === city.id ? "rgba(74,158,255,0.06)" : "transparent",
            border: selectedId === city.id ? "1px solid rgba(74,158,255,0.2)" : "1px solid transparent",
            borderRadius: "4px", padding: "6px 8px",
            marginBottom: i < cities.length - 1 ? "6px" : 0,
            transition: "all 0.15s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{
                fontFamily: "'Geist Mono', monospace", fontSize: "11px", fontWeight: "600",
                color: city.status === "active" ? "#22c55e" : city.status === "pending" ? "#f0c060" : "#6b8ab0",
                letterSpacing: "0.05em",
              }}>{city.name}</span>
              <span style={{ fontSize: "8px", color: phaseId === city.id ? "#22c55e" : "#4a6080", fontFamily: "monospace" }}>
                {phaseId === city.id ? "SELECTED" : statusLabel[city.status]}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "#6b8ab0", marginBottom: 2 }}>{city.days}</div>
            <div style={{ fontSize: "10px", color: "#4a6080" }}>{city.district}</div>
            {phaseId === city.id && (
              <div style={{ marginTop: 4, fontSize: "9px", color: "#4a9eff", fontFamily: "monospace" }}>
                ⬡ {city.seatRecommendation}
              </div>
            )}
            {city.status === "pending" && city.intel.some(i => i.level === "warn") && (
              <div style={{ marginTop: 4, fontSize: "9px", color: "#f59e0b" }}>
                ⚠ {city.intel.filter(i => i.level === "warn").length} item(s) need attention
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CityIntelPanel({ city }) {
  if (!city) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{
        background: "#0d1220", border: "1px solid #1e3a5f",
        borderRadius: "6px", padding: "12px", marginTop: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "#c8d8f0", fontWeight: 600 }}>
          {city.name} — {city.codename}
        </div>
        <a href={city.klookUrl} target="_blank" rel={AFFILIATE_REL} style={{
          fontSize: "9px", color: "#4a9eff", textDecoration: "none",
          border: "1px solid #1e3a5f", borderRadius: "3px", padding: "2px 7px", fontFamily: "monospace",
        }}>OPEN KLOOK ↗</a>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: "9px", color: "#4a6080", marginBottom: 5, fontFamily: "monospace", letterSpacing: "0.1em" }}>HIGHLIGHTS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {city.highlights.map((h) => (
            <span key={h} style={{
              background: "#0d1829", border: "1px solid #1e3a5f", borderRadius: "3px",
              padding: "2px 7px", fontSize: "10px", color: "#94b4d4", fontFamily: "monospace",
            }}>{h}</span>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: "9px", color: "#4a6080", marginBottom: 6, fontFamily: "monospace", letterSpacing: "0.1em" }}>INTEL</div>
        {city.intel.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
            <Tag level={item.level}>{item.tag}</Tag>
            <span style={{ fontSize: "10px", color: "#94b4d4", lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>
      {city.seatRecommendation && (
        <div style={{
          marginTop: 8, background: "rgba(74,158,255,0.06)",
          border: "1px solid rgba(74,158,255,0.15)", borderRadius: "4px",
          padding: "7px 10px", fontSize: "10px", color: "#4a9eff", fontFamily: "monospace",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <span>🚄 {city.seatRecommendation}</span>
          <a href="/" style={{
            fontSize: "8px", color: "#22c55e", textDecoration: "none",
            border: "1px solid #003820", borderRadius: "3px", padding: "2px 6px",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>CHECK SEAT ↗</a>
        </div>
      )}
    </motion.div>
  );
}

function SelectedCityRail({ phase, city }) {
  return (
    <div style={{
      width: 300,
      flexShrink: 0,
      background: "#080c16",
      border: "1px solid #1e3a5f",
      borderRadius: 8,
      padding: 12,
      overflowY: "auto",
      minHeight: 0,
    }}>
      <BookingContextPanel phase={phase} city={city} />
      {city && <CityIntelPanel city={city} />}
    </div>
  );
}

function Checklist({ items, onToggle }) {
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <>
      <PanelTitle>Pre-departure Checklist</PanelTitle>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "9px", color: "#4a6080", fontFamily: "monospace" }}>TRIP READINESS</span>
          <span style={{ fontSize: "9px", color: pct === 100 ? "#22c55e" : "#4a9eff", fontFamily: "monospace" }}>{pct}%</span>
        </div>
        <div style={{ height: 3, background: "#1e3a5f", borderRadius: 2 }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: pct === 100 ? "#22c55e" : "linear-gradient(90deg, #4a9eff, #22c55e)",
            borderRadius: 2, transition: "width 0.4s ease",
          }} />
        </div>
      </div>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
          style={{ marginBottom: 7 }}
        >
          <div onClick={() => onToggle(item.id)} style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none",
          }}>
            <div style={{
              width: 13, height: 13, borderRadius: 2,
              border: item.done ? "none" : `1px solid ${item.critical ? "#f59e0b" : "#1e3a5f"}`,
              background: item.done ? "#22c55e" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 9, color: "#000", fontWeight: "bold",
              transition: "all 0.15s ease",
            }}>{item.done && "✓"}</div>
            <span style={{
              fontSize: "10px", fontFamily: "'Geist Mono', monospace",
              color: item.done ? "#334155" : item.critical ? "#c8d8f0" : "#94b4d4",
              textDecoration: item.done ? "line-through" : "none",
              opacity: item.done ? 0.5 : 1, flex: 1,
            }}>
              {item.critical && !item.done && <span style={{ color: "#f59e0b", marginRight: 3 }}>!</span>}
              {item.label}
            </span>
            {item.actionUrl && !item.done && (
              <a href={item.actionUrl} target="_blank" rel={AFFILIATE_REL}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: "8px", color: "#4a9eff", textDecoration: "none",
                  border: "1px solid #1e3a5f", borderRadius: "3px", padding: "1px 5px",
                  fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0,
                }}>{item.actionLabel} ↗</a>
            )}
          </div>
        </motion.div>
      ))}
    </>
  );
}

function BookingEssentialsPanel() {
  return (
    <>
      <PanelTitle>Book Essentials</PanelTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
        {BOOKING_ESSENTIALS.map(item => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel={AFFILIATE_REL}
            style={{
              display: "block", textDecoration: "none",
              background: "rgba(74,158,255,0.08)",
              border: "1px solid rgba(74,158,255,0.25)",
              borderRadius: 6, padding: "8px 10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#c8d8f0", fontSize: 10, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>
                {item.label}
              </span>
              <span style={{ color: "#4a9eff", fontSize: 8, fontFamily: "monospace", flexShrink: 0 }}>KLOOK ↗</span>
            </div>
            <div style={{ color: "#6b8ab0", fontSize: 9, marginTop: 3, lineHeight: 1.45 }}>
              {item.note}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

function PhraseArsenal({ phrases }) {
  return (
    <>
      <PanelTitle>Useful Phrases</PanelTitle>
      {phrases.map((p, i) => (
        <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < phrases.length - 1 ? "1px solid #0d1829" : "none" }}>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "#c8d8f0", marginBottom: 2 }}>{p.jp}</div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "9px", color: "#4a9eff", marginBottom: 1 }}>{p.romaji}</div>
          <div style={{ fontSize: "10px", color: "#6b8ab0" }}>{p.en}</div>
        </div>
      ))}
    </>
  );
}

function IntelStrip({ briefings }) {
  return (
    <>
      <PanelTitle>Travel Intel</PanelTitle>
      {briefings.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9, alignItems: "flex-start" }}>
          <Tag level={b.level}>{b.tag}</Tag>
          <span style={{ fontSize: "10px", color: "#94b4d4", lineHeight: 1.5 }}>{b.text}</span>
        </div>
      ))}
    </>
  );
}

// ─── Countdown Timer ────────────────────────────────────────────────────────
function CountdownTimer({ departureDate }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const dep = new Date(departureDate + "T00:00:00");
  const diff = dep - now;
  if (diff <= 0) return (
    <span style={{ color: "#22c55e", fontSize: 10, fontFamily: "monospace" }}>TRIP ACTIVE</span>
  );
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 9, color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.1em" }}>T-MINUS</span>
      <span style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", fontWeight: 700, color: days <= 7 ? "#f59e0b" : "#4a9eff" }}>
        {days}D {hours}H
      </span>
    </div>
  );
}

// ─── Emergency Panel ────────────────────────────────────────────────────────
function EmergencyPanel() {
  return (
    <>
      <PanelTitle>Emergency Contacts</PanelTitle>
      <div style={{ fontSize: 9, color: "#f59e0b", marginBottom: 8, fontFamily: "monospace" }}>
        Save these numbers before departure
      </div>
      {EMERGENCY_CONTACTS.map((c, i) => (
        <div key={i} style={{
          display: "flex", gap: 8, alignItems: "flex-start",
          marginBottom: 8, paddingBottom: 8,
          borderBottom: i < EMERGENCY_CONTACTS.length - 1 ? "1px solid #0d1829" : "none",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, width: 20, textAlign: "center" }}>{c.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: "#c8d8f0", fontWeight: 600, fontFamily: "monospace" }}>{c.label}</span>
              <a href={`tel:${c.number}`} style={{
                fontSize: 11, color: "#4a9eff", fontFamily: "'Geist Mono', monospace",
                fontWeight: 700, textDecoration: "none",
              }}>{c.number}</a>
            </div>
            <div style={{ fontSize: 9, color: "#4a6080" }}>{c.note}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Currency Converter ─────────────────────────────────────────────────────
function CurrencyConverter() {
  const [jpy, setJpy] = useState("");
  const [usd, setUsd] = useState("");
  const [rate, setRate] = useState(145);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (data.rates?.JPY) {
          setRate(data.rates.JPY);
          setLastUpdate(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
        }
      })
      .catch(() => {});
  }, []);

  const handleJpy = (v) => {
    setJpy(v);
    const n = parseFloat(v);
    setUsd(isNaN(n) ? "" : (n / rate).toFixed(2));
  };
  const handleUsd = (v) => {
    setUsd(v);
    const n = parseFloat(v);
    setJpy(isNaN(n) ? "" : Math.round(n * rate).toString());
  };

  return (
    <>
      <PanelTitle>Currency Converter</PanelTitle>
      <div style={{ fontSize: 9, color: "#4a6080", marginBottom: 8, fontFamily: "monospace" }}>
        ¥1 = ${(1 / rate).toFixed(4)} USD · Rate: {rate.toFixed(1)}
        {lastUpdate && <span> · {lastUpdate}</span>}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: "#4a6080", marginBottom: 3, fontFamily: "monospace", letterSpacing: "0.1em" }}>JPY</div>
          <input value={jpy} onChange={e => handleJpy(e.target.value)} placeholder="10000"
            style={{
              width: "100%", background: "#0d1220", border: "1px solid #1e3a5f",
              borderRadius: 4, padding: "6px 8px", color: "#c8d8f0",
              fontSize: 13, fontFamily: "'Geist Mono', monospace", outline: "none",
            }} />
        </div>
        <span style={{ color: "#4a6080", fontSize: 12, marginTop: 14 }}>⇄</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: "#4a6080", marginBottom: 3, fontFamily: "monospace", letterSpacing: "0.1em" }}>USD</div>
          <input value={usd} onChange={e => handleUsd(e.target.value)} placeholder="68.97"
            style={{
              width: "100%", background: "#0d1220", border: "1px solid #1e3a5f",
              borderRadius: 4, padding: "6px 8px", color: "#c8d8f0",
              fontSize: 13, fontFamily: "'Geist Mono', monospace", outline: "none",
            }} />
        </div>
      </div>
    </>
  );
}

// ─── Weather Panel ──────────────────────────────────────────────────────────
const WEATHER_META = (code) => {
  if (code <= 0) return { icon: "☀️", label: "Clear", accent: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
  if (code <= 1) return { icon: "🌤️", label: "Mostly Clear", accent: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)" };
  if (code <= 2) return { icon: "⛅", label: "Partly Cloudy", accent: "#94a3b8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.15)" };
  if (code <= 3) return { icon: "☁️", label: "Overcast", accent: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.15)" };
  if (code <= 48) return { icon: "🌫️", label: "Foggy", accent: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.15)" };
  if (code <= 55) return { icon: "🌦️", label: "Drizzle", accent: "#4a9eff", bg: "rgba(74,158,255,0.06)", border: "rgba(74,158,255,0.15)" };
  if (code <= 67) return { icon: "🌧️", label: "Rain", accent: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" };
  if (code <= 77) return { icon: "🌨️", label: "Snow", accent: "#a5b4fc", bg: "rgba(165,180,252,0.08)", border: "rgba(165,180,252,0.2)" };
  if (code <= 82) return { icon: "🌧️", label: "Heavy Rain", accent: "#2563eb", bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.25)" };
  if (code <= 86) return { icon: "🌨️", label: "Heavy Snow", accent: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" };
  return { icon: "⛈️", label: "Thunderstorm", accent: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" };
};

const tempColor = (t) => {
  if (t <= 0) return "#93c5fd";
  if (t <= 10) return "#67e8f9";
  if (t <= 18) return "#22c55e";
  if (t <= 25) return "#f59e0b";
  if (t <= 32) return "#f97316";
  return "#ef4444";
};

function WeatherPanel({ cities }) {
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unique = cities.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
    const lats = unique.map(c => c.lat).join(",");
    const lngs = unique.map(c => c.lng).join(",");
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Tokyo&forecast_days=1`)
      .then(r => r.json())
      .then(data => {
        const results = {};
        const items = Array.isArray(data) ? data : [data];
        items.forEach((d, i) => {
          if (d.current && unique[i]) {
            results[unique[i].id] = {
              temp: d.current.temperature_2m,
              code: d.current.weather_code,
              humidity: d.current.relative_humidity_2m,
              wind: d.current.wind_speed_10m,
              high: d.daily?.temperature_2m_max?.[0],
              low: d.daily?.temperature_2m_min?.[0],
              precip: d.daily?.precipitation_probability_max?.[0],
            };
          }
        });
        setWeather(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cities]);

  return (
    <>
      <PanelTitle>Live Weather</PanelTitle>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 72, background: "#0d1220", borderRadius: 8,
              border: "1px solid #1e3a5f", animation: "pulse 2s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cities.map(city => {
            const w = weather[city.id];
            if (!w) return (
              <div key={city.id} style={{
                padding: "10px 12px", background: "#0d1220", borderRadius: 8,
                border: "1px solid #1e3a5f",
              }}>
                <span style={{ fontSize: 10, color: "#4a6080", fontFamily: "monospace" }}>{city.name} — no data</span>
              </div>
            );
            const meta = WEATHER_META(w.code);
            const tCol = tempColor(w.temp);
            const tempPct = Math.max(0, Math.min(100, ((w.temp + 5) / 45) * 100));
            return (
              <div key={city.id} style={{
                padding: "10px 12px", background: meta.bg, borderRadius: 8,
                border: `1px solid ${meta.border}`, transition: "all 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#c8d8f0", fontWeight: 600, fontFamily: "monospace" }}>{city.name}</div>
                      <div style={{ fontSize: 9, color: meta.accent, fontFamily: "monospace", marginTop: 1 }}>{meta.label}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontFamily: "'Geist Mono', monospace", fontWeight: 700, color: tCol, lineHeight: 1 }}>
                      {Math.round(w.temp)}°
                    </div>
                    {w.high != null && w.low != null && (
                      <div style={{ fontSize: 9, color: "#4a6080", fontFamily: "monospace", marginTop: 2 }}>
                        <span style={{ color: "#f97316" }}>{Math.round(w.high)}°</span>
                        {" / "}
                        <span style={{ color: "#67e8f9" }}>{Math.round(w.low)}°</span>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  height: 3, background: "#1e3a5f", borderRadius: 2, marginBottom: 8, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${tempPct}%`, borderRadius: 2,
                    background: `linear-gradient(90deg, #67e8f9, ${tCol})`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {w.precip != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 10 }}>💧</span>
                      <span style={{
                        fontSize: 9, fontFamily: "monospace", fontWeight: 600,
                        color: w.precip > 60 ? "#3b82f6" : w.precip > 30 ? "#f59e0b" : "#22c55e",
                      }}>{w.precip}%</span>
                    </div>
                  )}
                  {w.humidity != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 9, color: "#4a6080" }}>💨</span>
                      <span style={{ fontSize: 9, color: "#6b8ab0", fontFamily: "monospace" }}>{w.humidity}%</span>
                    </div>
                  )}
                  {w.wind != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 9, color: "#4a6080" }}>🌬️</span>
                      <span style={{ fontSize: 9, color: "#6b8ab0", fontFamily: "monospace" }}>{Math.round(w.wind)}km/h</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Activity Planning Board ────────────────────────────────────────────────
function ActivityBoard({ cities, selectedCityId }) {
  const [activities, setActivities] = useState({});
  const [newText, setNewText] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_ACTIVITIES);
      if (saved) setActivities(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (Object.keys(activities).length > 0) {
      localStorage.setItem(LS_ACTIVITIES, JSON.stringify(activities));
    }
  }, [activities]);

  const cityId = selectedCityId || cities[0]?.id;
  const cityActivities = activities[cityId] || [];

  const addActivity = () => {
    if (!newText.trim()) return;
    const updated = {
      ...activities,
      [cityId]: [...cityActivities, { id: Date.now(), text: newText.trim(), time: newTime, done: false }],
    };
    setActivities(updated);
    setNewText("");
    setNewTime("");
  };

  const toggleActivity = (actId) => {
    setActivities(prev => ({
      ...prev,
      [cityId]: (prev[cityId] || []).map(a => a.id === actId ? { ...a, done: !a.done } : a),
    }));
  };

  const removeActivity = (actId) => {
    setActivities(prev => ({
      ...prev,
      [cityId]: (prev[cityId] || []).filter(a => a.id !== actId),
    }));
  };

  const city = cities.find(c => c.id === cityId);

  return (
    <>
      <PanelTitle>Activity Planner — {city?.name || "Select city"}</PanelTitle>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="09:00"
          style={{
            width: 52, background: "#0d1220", border: "1px solid #1e3a5f",
            borderRadius: 3, padding: "4px 6px", color: "#c8d8f0",
            fontSize: 10, fontFamily: "monospace", outline: "none",
          }} />
        <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Activity..."
          onKeyDown={e => e.key === "Enter" && addActivity()}
          style={{
            flex: 1, background: "#0d1220", border: "1px solid #1e3a5f",
            borderRadius: 3, padding: "4px 6px", color: "#c8d8f0",
            fontSize: 10, fontFamily: "monospace", outline: "none",
          }} />
        <button onClick={addActivity} style={{
          background: "#1e3a5f", border: "none", borderRadius: 3,
          padding: "4px 8px", color: "#4a9eff", fontSize: 10,
          fontFamily: "monospace", cursor: "pointer",
        }}>+</button>
      </div>
      {cityActivities.length === 0 ? (
        <div style={{ fontSize: 9, color: "#4a6080", fontFamily: "monospace", textAlign: "center", padding: 12 }}>
          No activities planned. Add one above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {cityActivities.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map(act => (
            <div key={act.id} style={{
              display: "flex", gap: 6, alignItems: "center",
              padding: "5px 8px", background: "#0d1220",
              borderRadius: 4, border: "1px solid #1e3a5f",
            }}>
              <div onClick={() => toggleActivity(act.id)} style={{
                width: 12, height: 12, borderRadius: 2, flexShrink: 0,
                border: act.done ? "none" : "1px solid #1e3a5f",
                background: act.done ? "#22c55e" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#000", fontWeight: "bold", cursor: "pointer",
              }}>{act.done && "✓"}</div>
              {act.time && (
                <span style={{ fontSize: 9, color: "#4a9eff", fontFamily: "monospace", flexShrink: 0, width: 36 }}>
                  {act.time}
                </span>
              )}
              <span style={{
                flex: 1, fontSize: 10, color: act.done ? "#4a6080" : "#94b4d4",
                fontFamily: "monospace", textDecoration: act.done ? "line-through" : "none",
              }}>{act.text}</span>
              <button onClick={() => removeActivity(act.id)} style={{
                background: "none", border: "none", color: "#4a6080",
                fontSize: 10, cursor: "pointer", padding: "0 2px",
              }}>×</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Restaurant Panel ───────────────────────────────────────────────────────
function RestaurantPanel({ selectedCityId }) {
  const cityId = selectedCityId || "tokyo";
  const recs = RESTAURANTS[cityId] || [];
  const tourLink = FOOD_TOUR_LINKS[cityId];
  const city = CITIES.find(c => c.id === cityId);

  return (
    <>
      <PanelTitle>Dining — {city?.name || cityId.toUpperCase()}</PanelTitle>
      {tourLink && (
        <a href={tourLink.url} target="_blank" rel={AFFILIATE_REL} style={{
          display: "block", marginBottom: 10, padding: "8px 10px",
          background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(74,158,255,0.1))",
          border: "1px solid rgba(245,158,11,0.3)", borderRadius: 5,
          fontSize: 10, color: "#f59e0b", fontFamily: "monospace", textDecoration: "none",
          textAlign: "center", letterSpacing: "0.08em",
        }}>
          ★ {tourLink.label} — Book on Klook ↗
        </a>
      )}
      {recs.length === 0 ? (
        <div style={{ fontSize: 9, color: "#4a6080", fontFamily: "monospace", textAlign: "center", padding: 12 }}>
          No restaurant data for this city yet.
        </div>
      ) : (
        recs.map((r, i) => (
          <div key={i} style={{
            marginBottom: 8, padding: "8px 10px", background: "#0d1220",
            border: "1px solid #1e3a5f", borderRadius: 5,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "#c8d8f0", fontWeight: 600, fontFamily: "monospace" }}>{r.name}</span>
              <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "monospace" }}>{r.price}</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 8, background: "#001228", border: "1px solid #0d2a4a", color: "#4a9eff", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>{r.type}</span>
            </div>
            <div style={{ fontSize: 9, color: "#6b8ab0" }}>{r.note}</div>
          </div>
        ))
      )}
    </>
  );
}

// ─── Accommodation Panel ────────────────────────────────────────────────────
function AccommodationPanel({ selectedCityId }) {
  const cityId = selectedCityId || "tokyo";
  const acc = ACCOMMODATIONS[cityId];
  const city = CITIES.find(c => c.id === cityId);

  if (!acc) {
    return (
      <>
        <PanelTitle>Stay — {city?.name || cityId.toUpperCase()}</PanelTitle>
        <div style={{ fontSize: 9, color: "#4a6080", fontFamily: "monospace", textAlign: "center", padding: 12 }}>
          No accommodation data for this city.
        </div>
      </>
    );
  }

  return (
    <>
      <PanelTitle>Stay — {city?.name || cityId.toUpperCase()}</PanelTitle>
      <a href={acc.klookUrl} target="_blank" rel={AFFILIATE_REL} style={{
        display: "block", marginBottom: 10, padding: "8px 10px",
        background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(74,158,255,0.1))",
        border: "1px solid rgba(34,197,94,0.3)", borderRadius: 5,
        fontSize: 10, color: "#22c55e", fontFamily: "monospace", textDecoration: "none",
        textAlign: "center", letterSpacing: "0.08em",
      }}>
        ★ Browse {city?.name} Hotels on Klook ↗
      </a>
      <div style={{ padding: "8px 10px", background: "#0d1220", border: "1px solid #1e3a5f", borderRadius: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.1em" }}>RECOMMENDED AREA</span>
          <span style={{ fontSize: 8, background: "#001a0d", border: "1px solid #003820", color: "#22c55e", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>{acc.stayType}</span>
        </div>
        <div style={{ fontSize: 11, color: "#c8d8f0", fontWeight: 600, fontFamily: "monospace", marginBottom: 8 }}>{acc.area}</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 8, color: "#4a6080", fontFamily: "monospace" }}>CHECK-IN</div>
            <div style={{ fontSize: 11, color: "#4a9eff", fontFamily: "monospace", fontWeight: 600 }}>{acc.checkIn}</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: "#4a6080", fontFamily: "monospace" }}>CHECK-OUT</div>
            <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "monospace", fontWeight: 600 }}>{acc.checkOut}</div>
          </div>
        </div>
        <div style={{ fontSize: 8, color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 4 }}>TIPS</div>
        {acc.tips.map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "flex-start" }}>
            <span style={{ color: "#1e3a5f", fontSize: 8, marginTop: 2 }}>▸</span>
            <span style={{ fontSize: 9, color: "#94b4d4", lineHeight: 1.5 }}>{tip}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Daily Briefing Modal ───────────────────────────────────────────────────
function DailyBriefingModal({ briefing, onClose }) {
  if (!briefing) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Geist Mono', monospace", padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0d1220", border: "1px solid #1e3a5f",
          borderRadius: 10, padding: 24, maxWidth: 480, width: "100%",
          boxShadow: "0 0 40px rgba(74,158,255,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4a9eff", letterSpacing: "0.1em" }}>{briefing.title}</div>
            <div style={{ fontSize: 9, color: "#4a6080", marginTop: 2 }}>{briefing.dayRange}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1e3a5f", borderRadius: 4, color: "#4a6080", fontSize: 12, padding: "4px 10px", cursor: "pointer", fontFamily: "monospace" }}>×</button>
        </div>

        <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: "0.1em", marginBottom: 8 }}>WATCH ITEMS</div>
        {briefing.watchItems.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
            <span style={{
              fontSize: 8, padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", flexShrink: 0,
              background: item.level === "warn" ? "#1a1000" : "#001a0d",
              color: item.level === "warn" ? "#f59e0b" : "#22c55e",
              border: `1px solid ${item.level === "warn" ? "#3a2800" : "#003820"}`,
            }}>{item.level === "warn" ? "ALERT" : "OK"}</span>
            <span style={{ fontSize: 10, color: "#94b4d4", lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}

        {briefing.recommendedBookings.length > 0 && (
          <>
            <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: "0.1em", marginTop: 14, marginBottom: 8 }}>RECOMMENDED BOOKINGS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {briefing.recommendedBookings.map((b, i) => (
                <a key={i} href={b.url} target="_blank" rel={AFFILIATE_REL} style={{
                  padding: "6px 12px", background: "rgba(74,158,255,0.08)",
                  border: "1px solid rgba(74,158,255,0.25)", borderRadius: 5,
                  fontSize: 10, color: "#4a9eff", fontFamily: "monospace",
                  textDecoration: "none", letterSpacing: "0.05em",
                }}>{b.label} ↗</a>
              ))}
            </div>
          </>
        )}

        <button onClick={onClose} style={{
          marginTop: 18, width: "100%", padding: "10px 0",
          background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e",
          borderRadius: 6, color: "#22c55e", fontSize: 11,
          fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.15em",
          cursor: "pointer",
        }}>ACKNOWLEDGE & PROCEED ▶</button>
      </motion.div>
    </motion.div>
  );
}

// ─── Left Sidebar Navigation ────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: "map", icon: "◎", label: "Map" },
  { id: "bookings", icon: "↗", label: "Book" },
  { id: "checklist", icon: "☑", label: "List" },
  { id: "city", icon: "◆", label: "Tips" },
];

function Sidebar({ active, onChange, isMobile }) {
  if (isMobile) return null;
  return (
    <div style={{
      width: 78, background: "#080c16", borderRight: "1px solid #1e3a5f",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "12px 8px", gap: 8, flexShrink: 0,
    }}>
      {SIDEBAR_ITEMS.map(item => (
        <button key={item.id} onClick={() => onChange(item.id)}
          title={item.label}
          style={{
            width: 62, height: 58,
            background: active === item.id
              ? "linear-gradient(180deg, rgba(74,158,255,0.2), rgba(34,197,94,0.08))"
              : "rgba(13,18,32,0.72)",
            border: active === item.id ? "1px solid rgba(74,158,255,0.65)" : "1px solid rgba(30,58,95,0.85)",
            borderRadius: 8,
            color: active === item.id ? "#d7ecff" : "#8aa7c8",
            fontSize: 20, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 5, transition: "all 0.15s ease",
            boxShadow: active === item.id ? "0 0 18px rgba(74,158,255,0.16)" : "none",
          }}>
          <span style={{ lineHeight: 1 }}>{item.icon}</span>
          <span style={{
            fontSize: 10,
            letterSpacing: "0.03em",
            fontFamily: "'Geist Mono', monospace",
            fontWeight: 700,
          }}>{item.label.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Autosave Indicator ─────────────────────────────────────────────────────
function AutosaveIndicator({ lastSave }) {
  if (!lastSave) return null;
  return (
    <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", opacity: 0.7 }} />
      saved
    </span>
  );
}

function StatsBar({ cities, checklist, phaseId, isMobile, t }) {
  const checklistPending = checklist.filter(i => !i.done && i.critical).length;
  const phase = getPhaseOption(phaseId, cities);
  return (
    <div style={{
      display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: "1px", background: "#1e3a5f", borderBottom: "1px solid #1e3a5f",
    }}>
      {[
        { label: "TRIP PHASE", value: phase.label, color: "#22c55e" },
        { label: "NEXT STEP", value: getNextPhaseLabel(phaseId, cities), color: "#f59e0b" },
        { label: "BOOKING FOCUS", value: phase.focus, color: "#4a9eff" },
        { label: t("criticalItems"), value: checklistPending, color: checklistPending > 0 ? "#f59e0b" : "#22c55e" },
      ].map((s) => (
        <div key={s.label} style={{ background: "#0a0e1a", padding: isMobile ? "6px 10px" : "6px 14px" }}>
          <div style={{ fontSize: "8px", color: "#4a6080", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 3 }}>{s.label}</div>
          <div style={{ fontSize: isMobile ? "14px" : "15px", fontFamily: "'Geist Mono', monospace", fontWeight: 600, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

const MOBILE_TABS = [
  { id: "map", label: "MAP" },
  { id: "bookings", label: "BOOK" },
  { id: "checklist", label: "LIST" },
  { id: "city", label: "TIPS" },
  { id: "tools", label: "TOOLS" },
];

function MobileTabBar({ active, onChange }) {
  return (
    <div style={{ display: "flex", background: "#0d1220", borderBottom: "1px solid #1e3a5f", flexShrink: 0 }}>
      {MOBILE_TABS.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          flex: 1, padding: "10px 4px",
          background: active === tab.id ? "rgba(74,158,255,0.1)" : "transparent",
          borderBottom: active === tab.id ? "2px solid #4a9eff" : "2px solid transparent",
          border: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
          color: active === tab.id ? "#4a9eff" : "#4a6080",
          fontSize: "10px", fontFamily: "'Geist Mono', monospace",
          fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function JapanTripCommandCenter() {
  const t = useTranslations("cc");
  const hydrated = useHydrated();
  const isMobile = useIsMobile();
  const [showLaunch, setShowLaunch] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState("tokyo");
  const [checklist, setChecklist] = useState(MISSION_CHECKLIST);
  const [checklistLoaded, setChecklistLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("intel");
  const [sidebarPanel, setSidebarPanel] = useState("bookings");
  const [mobileTab, setMobileTab] = useState("map");
  const [jstTime, setJstTime] = useState("--:--:--");
  const [showBriefing, setShowBriefing] = useState(false);
  const [lastSave, setLastSave] = useState(null);
  const [templateId, setTemplateId] = useState("full-10");
  const [departureDate, setDepartureDate] = useState(TRIP_DEPARTURE_DATE);
  const [tripPhase, setTripPhase] = useState("planning");

  const [isPlaying, setIsPlaying] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const animRef = useRef(null);

  // Load route settings from localStorage
  useEffect(() => {
    try {
      const savedTmpl = localStorage.getItem(LS_TEMPLATE);
      if (savedTmpl && ROUTE_TEMPLATES.find(t => t.id === savedTmpl)) setTemplateId(savedTmpl);
      const savedDep = localStorage.getItem(LS_DEPARTURE);
      if (savedDep) setDepartureDate(savedDep);
      const savedPhase = localStorage.getItem(LS_PHASE);
      if (savedPhase) setTripPhase(savedPhase);
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem(LS_TEMPLATE, templateId); }, [templateId]);
  useEffect(() => { localStorage.setItem(LS_DEPARTURE, departureDate); }, [departureDate]);
  useEffect(() => { localStorage.setItem(LS_PHASE, tripPhase); }, [tripPhase]);

  const routeCities = useMemo(() => {
    const tmpl = ROUTE_TEMPLATES.find(t => t.id === templateId) || ROUTE_TEMPLATES[1];
    return tmpl.cities.map(tc => {
      const base = CITIES.find(c => c.id === tc.id);
      if (!base) return null;
      return { ...base, days: tc.days, status: tc.status };
    }).filter(Boolean);
  }, [templateId]);

  const phaseCities = useMemo(() => applyPhaseStatus(routeCities, tripPhase), [routeCities, tripPhase]);

  useEffect(() => {
    const validPhase = tripPhase === "planning" || tripPhase === "departure" || routeCities.some(city => city.id === tripPhase);
    if (!validPhase) setTripPhase("planning");
  }, [routeCities, tripPhase]);

  useEffect(() => {
    if (sessionStorage.getItem(LS_LAUNCHED)) setShowLaunch(false);
  }, []);

  const handleLaunchComplete = useCallback(() => {
    setShowLaunch(false);
    sessionStorage.setItem(LS_LAUNCHED, "1");
    if (!sessionStorage.getItem(LS_BRIEFING)) {
      setTimeout(() => setShowBriefing(true), 500);
    }
  }, []);

  const closeBriefing = useCallback(() => {
    setShowBriefing(false);
    sessionStorage.setItem(LS_BRIEFING, "1");
  }, []);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
    const update = () => setJstTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setChecklist(MISSION_CHECKLIST.map(item => ({ ...item, done: parsed[item.id] ?? item.done })));
      }
    } catch {}
    setChecklistLoaded(true);
  }, []);

  useEffect(() => {
    if (!checklistLoaded) return;
    const state = {};
    checklist.forEach(item => { state[item.id] = item.done; });
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    setLastSave(new Date());
  }, [checklist, checklistLoaded]);

  // Timeline playback loop
  useEffect(() => {
    if (!isPlaying) { animRef.current = null; return; }
    let prev = null;
    const speed = 0.05; // full route in ~20s
    const tick = (ts) => {
      if (!prev) prev = ts;
      const dt = (ts - prev) / 1000;
      prev = ts;
      setTrainProgress(p => {
        const next = p + dt * speed;
        if (next >= 1) { setIsPlaying(false); return 1; }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    setIsPlaying(p => {
      if (!p && trainProgress >= 1) setTrainProgress(0);
      return !p;
    });
  }, [trainProgress]);

  const seekTimeline = useCallback((v) => {
    setTrainProgress(v);
    setIsPlaying(false);
  }, []);

  const activeCityId = getPhaseCityId(tripPhase, phaseCities, selectedCityId);
  const selectedCity = phaseCities.find(c => c.id === activeCityId) || null;
  const selectedPhase = getPhaseOption(tripPhase, phaseCities);
  const currentBriefing = DAILY_BRIEFINGS.find(b => b.cityId === (selectedCity?.id || "tokyo")) || DAILY_BRIEFINGS[0];

  const selectCityPhase = useCallback((id) => {
    setSelectedCityId(id);
    if (id) setTripPhase(id);
  }, []);

  const toggleChecklist = useCallback((id) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowRight") { e.preventDefault(); seekTimeline(Math.min(1, trainProgress + 0.05)); }
      if (e.code === "ArrowLeft") { e.preventDefault(); seekTimeline(Math.max(0, trainProgress - 0.05)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, seekTimeline, trainProgress]);

  const warningCount = checklist.filter(i => !i.done && i.critical).length;
  const trainPos = interpolateRoute(SHINKANSEN_ROUTE, trainProgress);

  // Night mode: JST 18:00-06:00
  const jstHour = parseInt(jstTime.split(":")[0], 10);
  const isNight = !isNaN(jstHour) && (jstHour >= 18 || jstHour < 6);

  if (!hydrated) {
    return (
      <div style={{
        background: "#0a0e1a", color: "#c8d8f0", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Geist Mono', 'Courier New', monospace",
      }}>
        <span style={{ color: "#4a9eff", fontSize: 10, letterSpacing: "0.1em" }}>
          INITIALIZING...
        </span>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0a0e1a", color: "#c8d8f0", minHeight: "100vh",
      fontFamily: "'Geist Mono', 'Courier New', monospace", fontSize: "12px",
      display: "flex", flexDirection: "column",
    }}>
      {/* Launch overlay */}
      <AnimatePresence>
        {showLaunch && <LaunchOverlay onComplete={handleLaunchComplete} />}
      </AnimatePresence>

      {/* Daily Briefing modal */}
      <AnimatePresence>
        {showBriefing && <DailyBriefingModal briefing={currentBriefing} onClose={closeBriefing} />}
      </AnimatePresence>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: showLaunch ? 0.2 : 0, duration: 0.4 }}
        style={{
          background: "#0d1220", borderBottom: "1px solid #1e3a5f",
          padding: isMobile ? "8px 12px" : "9px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 12 }}>
          <span style={{ color: "#4a9eff", fontWeight: 600, fontSize: isMobile ? 11 : 13, letterSpacing: "0.05em" }}>
            ⬡ {isMobile ? t("titleShort") : t("title")}
          </span>
          {!isMobile && <span style={{ color: "#2d4a70", fontSize: 10 }}>// {t("subtitle")}</span>}
          {!isMobile && <AutosaveIndicator lastSave={lastSave} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
          <CountdownTimer departureDate={departureDate} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <StatusDot status="active" />
            <span style={{ color: "#6b8ab0", fontSize: 10 }}>{t("live")}</span>
          </div>
          {!isMobile && (
            <span style={{ color: "#4a6080", fontSize: 10 }}>
              {isNight ? "🌙" : "☀️"} JST {jstTime}
            </span>
          )}
          {warningCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <StatusDot status="pending" />
              <span style={{ color: "#f59e0b", fontSize: 10 }}>{warningCount}</span>
            </div>
          )}
        </div>
      </motion.div>

      <StatsBar cities={phaseCities} checklist={checklist} phaseId={tripPhase} isMobile={isMobile} t={t} />

      {isMobile ? (
        <>
          <MobileTabBar active={mobileTab} onChange={setMobileTab} />
          <div style={{ flex: 1, overflow: "auto", background: "#0a0e1a" }}>
            <AnimatePresence mode="wait">
              {mobileTab === "map" && (
                <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                  <TimelineControls isPlaying={isPlaying} onToggle={togglePlay} progress={trainProgress} onSeek={seekTimeline} isMobile={true} />
                  <div style={{ height: 260, borderRadius: 6, overflow: "hidden" }}>
                    <Suspense fallback={<MapPlaceholder />}>
                      <CommandMap apiKey={API_KEY} cities={phaseCities} selectedCity={activeCityId}
                        onCityClick={selectCityPhase} showFujiZone={true} height="100%"
                        trainPosition={trainPos} showTrain={trainProgress > 0} />
                    </Suspense>
                  </div>
                  <BookingContextPanel phase={selectedPhase} city={selectedCity} />
                  <TripPhaseSelector cities={phaseCities} selectedId={tripPhase} onChange={setTripPhase} isMobile={true} />
                  <AnimatePresence>
                    {selectedCity && <CityIntelPanel city={selectedCity} />}
                  </AnimatePresence>
                </motion.div>
              )}
              {mobileTab === "bookings" && (
                <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ padding: 14 }}>
                  <TripPhaseSelector cities={phaseCities} selectedId={tripPhase} onChange={setTripPhase} isMobile={true} />
                  <BookingContextPanel phase={selectedPhase} city={selectedCity} />
                  <RouteTemplateSelector selectedId={templateId} onChange={setTemplateId} />
                  <DepartureDatePicker value={departureDate} onChange={setDepartureDate} />
                  <MissionRoute cities={phaseCities} selectedId={activeCityId} phaseId={tripPhase}
                    onSelect={(id) => { selectCityPhase(id); if (id) setMobileTab("map"); }} />
                </motion.div>
              )}
              {mobileTab === "checklist" && (
                <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ padding: 14 }}>
                  <Checklist items={checklist} onToggle={toggleChecklist} />
                </motion.div>
              )}
              {mobileTab === "city" && (
                <motion.div key="city" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ padding: 14 }}>
                  <TripPhaseSelector cities={phaseCities} selectedId={tripPhase} onChange={setTripPhase} isMobile={true} />
                  <div style={{ marginBottom: 16 }}><RestaurantPanel selectedCityId={activeCityId} /></div>
                  <div style={{ marginBottom: 16 }}><AccommodationPanel selectedCityId={activeCityId} /></div>
                  <div style={{ display: "flex", gap: 1, marginBottom: 12 }}>
                    {["intel", "phrases", "emergency"].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, padding: "7px 8px",
                        background: activeTab === tab ? "#1e3a5f" : "transparent",
                        border: `1px solid ${activeTab === tab ? "#4a9eff" : "#1e3a5f"}`,
                        borderRadius: "3px", color: activeTab === tab ? "#4a9eff" : "#4a6080",
                        fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em",
                        cursor: "pointer", textTransform: "uppercase",
                      }}>{tab === "intel" ? "Intel" : tab === "phrases" ? "Phrases" : "SOS"}</button>
                    ))}
                  </div>
                  {activeTab === "intel" && <IntelStrip briefings={INTEL_BRIEFINGS} />}
                  {activeTab === "phrases" && <PhraseArsenal phrases={PHRASE_ARSENAL} />}
                  {activeTab === "emergency" && <EmergencyPanel />}
                </motion.div>
              )}
              {mobileTab === "tools" && (
                <motion.div key="tools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ padding: 14 }}>
                  <BookingEssentialsPanel />
                  <div style={{ marginBottom: 16 }}><CurrencyConverter /></div>
                  <ActivityBoard cities={phaseCities} selectedCityId={activeCityId} />
                  <WeatherPanel cities={phaseCities} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <Sidebar active={sidebarPanel} onChange={setSidebarPanel} isMobile={false} />

          {/* Left panel — driven by sidebar selection */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: showLaunch ? 0.25 : 0.1, duration: 0.4 }}
            style={{
              width: 280, flexShrink: 0, background: "#0a0e1a",
              borderRight: "1px solid #1e3a5f", padding: "12px", overflowY: "auto",
            }}>
            {sidebarPanel === "map" && (
              <>
                <TripPhaseSelector cities={phaseCities} selectedId={tripPhase} onChange={setTripPhase} />
                <div style={{ marginBottom: 16 }}><BookingContextPanel phase={selectedPhase} city={selectedCity} /></div>
                <div style={{ marginBottom: 16 }}><Checklist items={checklist} onToggle={toggleChecklist} /></div>
                <IntelStrip briefings={INTEL_BRIEFINGS} />
              </>
            )}
            {sidebarPanel === "bookings" && (
              <>
                <TripPhaseSelector cities={phaseCities} selectedId={tripPhase} onChange={setTripPhase} />
                <BookingContextPanel phase={selectedPhase} city={selectedCity} />
                <RouteTemplateSelector selectedId={templateId} onChange={setTemplateId} />
                <DepartureDatePicker value={departureDate} onChange={setDepartureDate} />
                <MissionRoute cities={phaseCities} selectedId={activeCityId} phaseId={tripPhase} onSelect={selectCityPhase} />
              </>
            )}
            {sidebarPanel === "checklist" && (
              <>
                <div style={{ marginBottom: 16 }}><Checklist items={checklist} onToggle={toggleChecklist} /></div>
                <ActivityBoard cities={phaseCities} selectedCityId={activeCityId} />
              </>
            )}
            {sidebarPanel === "city" && (
              <>
                <TripPhaseSelector cities={phaseCities} selectedId={tripPhase} onChange={setTripPhase} />
                <BookingContextPanel phase={selectedPhase} city={selectedCity} />
                <div style={{ marginBottom: 16 }}><RestaurantPanel selectedCityId={activeCityId} /></div>
                <div style={{ marginBottom: 16 }}><AccommodationPanel selectedCityId={activeCityId} /></div>
                <div style={{ marginBottom: 16 }}><IntelStrip briefings={INTEL_BRIEFINGS} /></div>
                <div style={{ marginBottom: 16 }}><EmergencyPanel /></div>
                <PhraseArsenal phrases={PHRASE_ARSENAL} />
                <div style={{ marginTop: 16 }}><WeatherPanel cities={phaseCities} /></div>
              </>
            )}
          </motion.div>

          {/* Map area — always visible, takes remaining space */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showLaunch ? 0.3 : 0.2, duration: 0.4 }}
            style={{ flex: 1, background: "#0a0e1a", padding: "12px", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <PanelTitle>Operations Map — Japan</PanelTitle>
            </div>
            <TimelineControls isPlaying={isPlaying} onToggle={togglePlay} progress={trainProgress} onSeek={seekTimeline} isMobile={false} />
            <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0, minHeight: 320 }}>
                <Suspense fallback={<MapPlaceholder />}>
                  <CommandMap apiKey={API_KEY} cities={phaseCities} selectedCity={activeCityId}
                    onCityClick={selectCityPhase} showFujiZone={true} height="100%"
                    trainPosition={trainPos} showTrain={trainProgress > 0} />
                </Suspense>
              </div>
              <SelectedCityRail phase={selectedPhase} city={selectedCity} />
            </div>
          </motion.div>
        </div>
      )}

      <div style={{
        background: "#0d1220", borderTop: "1px solid #1e3a5f",
        padding: isMobile ? "8px 12px" : "6px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "10px", color: "#4a6080", flexShrink: 0, flexWrap: "wrap", gap: 6,
      }}>
        <span>fujiseat.com</span>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          {!isMobile && (
            <span style={{ color: "#22c55e" }}>
              ▶ {t("fujiseatTip")}
            </span>
          )}
          <a href="/" style={{
            color: "#4a9eff", textDecoration: "none",
            border: "1px solid #1e3a5f", borderRadius: "3px",
            padding: "2px 8px", fontSize: "9px", fontFamily: "monospace",
          }}>{t("checkFujiSeat")} →</a>
        </div>
      </div>
    </div>
  );
}
