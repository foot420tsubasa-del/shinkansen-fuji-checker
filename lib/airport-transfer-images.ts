import fs from "node:fs";
import path from "node:path";

const AIRPORT_TRANSFER_IMAGE_BASE = "/images/airport-transfers";

export const airportTransferImages = {
  hub: `${AIRPORT_TRANSFER_IMAGE_BASE}/airport-transfer-hero.png`,
  narita: `${AIRPORT_TRANSFER_IMAGE_BASE}/narita-airport-arrivals.png`,
  haneda: `${AIRPORT_TRANSFER_IMAGE_BASE}/haneda-airport-arrivals.png`,
  kansai: `${AIRPORT_TRANSFER_IMAGE_BASE}/kansai-airport-arrivals.png`,
} as const;

function publicImageIfExists(src: string) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  return fs.existsSync(filePath) ? src : undefined;
}

export function getAirportTransferHubImage() {
  return publicImageIfExists(airportTransferImages.hub);
}

export function getAirportTransferRouteImage(slug: string) {
  if (slug.includes("narita")) return publicImageIfExists(airportTransferImages.narita);
  if (slug.includes("haneda")) return publicImageIfExists(airportTransferImages.haneda);
  if (slug.includes("kansai")) return publicImageIfExists(airportTransferImages.kansai);
  return undefined;
}
