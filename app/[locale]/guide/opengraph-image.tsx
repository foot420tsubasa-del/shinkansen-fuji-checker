import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mt. Fuji Shinkansen Seat Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🗻</div>
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#1e3a5f",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Mt. Fuji Shinkansen Seat Guide
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#e53e3e",
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          Which seat, which side, best time & JR Pass tips
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#4a5568",
            textAlign: "center",
          }}
        >
          Free tool for Tokyo ⇄ Osaka / Kyoto travellers
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 18,
            color: "#718096",
          }}
        >
          fujiseat.com
        </div>
      </div>
    ),
    { ...size }
  );
}
