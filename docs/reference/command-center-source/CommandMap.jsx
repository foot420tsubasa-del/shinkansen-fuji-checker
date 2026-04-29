// CommandMap.jsx
// Google Maps component for Japan Trip Command Center
// Uses @vis.gl/react-google-maps (official Google Maps React library for React 19)
//
// Installation:
//   npm install @vis.gl/react-google-maps
//
// Usage:
//   <CommandMap apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} cities={CITIES} selectedCity={id} onCityClick={fn} />

import { useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { JAPAN_MAP_CENTER, JAPAN_MAP_ZOOM, SHINKANSEN_ROUTE, MAP_DARK_STYLE } from "./japanTripModel";

// ─── Status color config ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  active:  { bg: "#22c55e", glyph: "#000", border: "#16a34a" },
  pending: { bg: "#f59e0b", glyph: "#000", border: "#d97706" },
  locked:  { bg: "#334155", glyph: "#94a3b8", border: "#1e293b" },
};

// ─── Shinkansen polyline overlay (drawn after map is ready) ───────────────────
function ShinkansenRoute() {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    // Remove previous polyline if re-rendered
    if (polylineRef.current) polylineRef.current.setMap(null);

    // Outer glow (wider, semi-transparent)
    const glow = new mapsLib.Polyline({
      path: SHINKANSEN_ROUTE,
      geodesic: true,
      strokeColor: "#4a9eff",
      strokeOpacity: 0.15,
      strokeWeight: 10,
      map,
    });

    // Main track line
    const track = new mapsLib.Polyline({
      path: SHINKANSEN_ROUTE,
      geodesic: true,
      strokeColor: "#4a9eff",
      strokeOpacity: 0.7,
      strokeWeight: 2.5,
      map,
    });

    // Dashed highlight on top for "active" segment (Tokyo → Kyoto)
    const activePath = SHINKANSEN_ROUTE.slice(0, 6); // Tokyo → Shin-Osaka
    const activeTrack = new mapsLib.Polyline({
      path: activePath,
      geodesic: true,
      strokeColor: "#22c55e",
      strokeOpacity: 0.9,
      strokeWeight: 2,
      icons: [{
        icon: {
          path: "M 0,-1 0,1",
          strokeOpacity: 1,
          scale: 3,
        },
        offset: "0",
        repeat: "12px",
      }],
      map,
    });

    // Mt. Fuji viewing zone marker (special pin between Shin-Yokohama and Shin-Fuji)
    const fujiZone = new mapsLib.Circle({
      center: { lat: 35.3, lng: 138.7 },
      radius: 30000, // 30km radius
      strokeColor: "#f59e0b",
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillColor: "#f59e0b",
      fillOpacity: 0.08,
      map,
    });

    polylineRef.current = { glow, track, activeTrack, fujiZone };

    return () => {
      glow.setMap(null);
      track.setMap(null);
      activeTrack.setMap(null);
      fujiZone.setMap(null);
    };
  }, [map, mapsLib]);

  return null;
}

// ─── City marker component ────────────────────────────────────────────────────
function CityMarker({ city, isSelected, onClick }) {
  const colors = STATUS_COLORS[city.status] || STATUS_COLORS.locked;

  return (
    <AdvancedMarker
      position={{ lat: city.lat, lng: city.lng }}
      title={city.name}
      onClick={() => onClick(city.id)}
    >
      <div style={{ position: "relative", cursor: "pointer" }}>
        {/* Pulse ring for active city */}
        {city.status === "active" && (
          <div style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            border: "1.5px solid #22c55e",
            animation: "pulse 2s ease-out infinite",
            opacity: 0.6,
          }} />
        )}

        {/* Selection ring */}
        {isSelected && (
          <div style={{
            position: "absolute",
            inset: "-5px",
            borderRadius: "50%",
            border: "2px solid #fff",
            opacity: 0.9,
          }} />
        )}

        {/* Main dot */}
        <div style={{
          width: city.status === "active" ? 16 : 12,
          height: city.status === "active" ? 16 : 12,
          borderRadius: "50%",
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: city.status === "active"
            ? "0 0 12px rgba(34,197,94,0.6)"
            : city.status === "pending"
            ? "0 0 8px rgba(245,158,11,0.4)"
            : "none",
          transition: "all 0.2s ease",
          transform: isSelected ? "scale(1.3)" : "scale(1)",
        }} />

        {/* City label */}
        <div style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "4px",
          background: "rgba(10,14,26,0.85)",
          border: `1px solid ${colors.border}`,
          borderRadius: "3px",
          padding: "2px 6px",
          whiteSpace: "nowrap",
          fontSize: "9px",
          fontFamily: "'Geist Mono', 'Courier New', monospace",
          fontWeight: "500",
          color: colors.bg,
          letterSpacing: "0.08em",
          pointerEvents: "none",
          backdropFilter: "blur(4px)",
        }}>
          {city.name}
        </div>
      </div>
    </AdvancedMarker>
  );
}

// ─── Mt. Fuji special marker ──────────────────────────────────────────────────
function FujiMarker({ visible }) {
  if (!visible) return null;
  return (
    <AdvancedMarker position={{ lat: 35.3606, lng: 138.7274 }} title="Mt. Fuji">
      <div style={{
        background: "rgba(10,14,26,0.85)",
        border: "1px solid #f59e0b",
        borderRadius: "4px",
        padding: "3px 7px",
        fontSize: "9px",
        fontFamily: "'Geist Mono', monospace",
        color: "#f59e0b",
        whiteSpace: "nowrap",
        backdropFilter: "blur(4px)",
      }}>
        🗻 FUJI VIEW ZONE
      </div>
    </AdvancedMarker>
  );
}

// ─── Map inner content (needs to be inside APIProvider + Map) ─────────────────
function MapContent({ cities, selectedCity, onCityClick, showFujiZone }) {
  return (
    <>
      <ShinkansenRoute />
      {cities.map((city) => (
        <CityMarker
          key={city.id}
          city={city}
          isSelected={selectedCity === city.id}
          onClick={onCityClick}
        />
      ))}
      <FujiMarker visible={showFujiZone} />
    </>
  );
}

// ─── Main CommandMap export ───────────────────────────────────────────────────
export default function CommandMap({
  apiKey,
  cities,
  selectedCity,
  onCityClick,
  showFujiZone = true,
  height = "100%",
}) {
  // Fallback: no API key → show placeholder
  if (!apiKey) {
    return (
      <div style={{
        width: "100%",
        height,
        background: "#060c18",
        border: "1px solid #1e3a5f",
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "'Geist Mono', monospace",
      }}>
        <div style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "0.1em" }}>
          ⚠ MAP OFFLINE
        </div>
        <div style={{ color: "#4a6080", fontSize: "10px" }}>
          Add VITE_GOOGLE_MAPS_API_KEY to .env
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height, borderRadius: "6px", overflow: "hidden" }}>
      {/* Pulse animation keyframe — injected once */}
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={JAPAN_MAP_CENTER}
          defaultZoom={JAPAN_MAP_ZOOM}
          mapId="japan-command-center" // Optional: use your Cloud Console Map ID for custom styles
          styles={MAP_DARK_STYLE}      // Falls back to inline style if no mapId
          disableDefaultUI={true}
          gestureHandling="cooperative"
          backgroundColor="#0a0e1a"
          style={{ width: "100%", height: "100%" }}
        >
          <MapContent
            cities={cities}
            selectedCity={selectedCity}
            onCityClick={onCityClick}
            showFujiZone={showFujiZone}
          />
        </Map>
      </APIProvider>
    </div>
  );
}
