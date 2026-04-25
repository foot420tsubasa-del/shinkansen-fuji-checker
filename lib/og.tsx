import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

type OgOptions = {
  emoji: string;
  title: string;
  subtitle: string;
  accent?: string;
};

export function createOgImage({ emoji, title, subtitle, accent = "#e53e3e" }: OgOptions) {
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
        <div style={{ fontSize: 80, marginBottom: 20 }}>{emoji}</div>
        <div
          style={{
            fontSize: 44,
            fontWeight: "bold",
            color: "#1e3a5f",
            textAlign: "center",
            marginBottom: 16,
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: accent,
            fontWeight: "bold",
            marginBottom: 12,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          {subtitle}
        </div>
        <div style={{ marginTop: 32, fontSize: 18, color: "#718096" }}>
          fujiseat.com
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
