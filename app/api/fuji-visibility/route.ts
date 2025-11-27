// app/api/fuji-visibility/route.ts

export const dynamic = "force-dynamic";

type VisibilityLevel = "high" | "medium" | "low";

type FujiVisibilityResponse = {
  visibility: VisibilityLevel;
  cloudPercent: number;
  message: string;
  source: string;
};

const LAT = 35.15; // around Shin-Fuji / Shizuoka
const LON = 138.68;
const HOURS_AHEAD = 6; // 今から6時間ぶんでざっくり平均

function evalVisibility(cloud: number): VisibilityLevel {
  if (cloud <= 30) return "high";
  if (cloud <= 70) return "medium";
  return "low";
}

export async function GET() {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", LAT.toString());
    url.searchParams.set("longitude", LON.toString());
    // ✅ 正しくは cloudcover（アンダースコアなし）
    url.searchParams.set("hourly", "cloudcover");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("timezone", "Asia/Tokyo");

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch weather" }),
        { status: 500 }
      );
    }

    const json = await res.json();

    // ✅ レスポンス側も cloudcover
    const cloudArray: number[] | undefined = json?.hourly?.cloudcover;

    if (!Array.isArray(cloudArray) || cloudArray.length === 0) {
      return new Response(
        JSON.stringify({ error: "No cloudcover data" }),
        { status: 500 }
      );
    }

    // 先頭から6時間ぶんを平均（足りなければある分だけ）
    const take = Math.min(HOURS_AHEAD, cloudArray.length);
    const slice = cloudArray.slice(0, take);
    const avg =
      slice.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0) /
      slice.length;

    const visibility = evalVisibility(avg);

    const msgMap: Record<VisibilityLevel, string> = {
      high:
        "Good chance to see Mt. Fuji today if skies stay similar near Shin-Fuji / Shizuoka.",
      medium:
        "Mt. Fuji might be visible, but clouds or haze are quite possible.",
      low:
        "Mt. Fuji is likely hidden by clouds today, even from the correct seat.",
    };

    const payload: FujiVisibilityResponse = {
      visibility,
      cloudPercent: Math.round(avg),
      message: msgMap[visibility],
      source: "open-meteo.com (cloud cover estimate)",
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("fuji-visibility error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error fetching weather" }),
      { status: 500 }
    );
  }
}
