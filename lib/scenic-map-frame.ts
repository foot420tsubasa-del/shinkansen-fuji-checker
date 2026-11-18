export type MapCoordinate = { lat: number; lng: number };

const TILE_SIZE = 256;

// Normalized Web Mercator, the coordinate system of GSI's XYZ tiles.
export function mapWorldPoint({ lat, lng }: MapCoordinate) {
  const latitude = Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180;
  return {
    x: (lng + 180) / 360,
    y: (1 - Math.asinh(Math.tan(latitude)) / Math.PI) / 2,
  };
}

export function makeScenicMapFrame(
  coordinates: MapCoordinate[],
  width: number,
  height: number,
  padding: number,
) {
  const world = coordinates.map(mapWorldPoint);
  const west = Math.min(...world.map(({ x }) => x));
  const east = Math.max(...world.map(({ x }) => x));
  const north = Math.min(...world.map(({ y }) => y));
  const south = Math.max(...world.map(({ y }) => y));
  const scale = Math.min(
    (width - 2 * padding) / Math.max(east - west, 1 / 2 ** 17),
    (height - 2 * padding) / Math.max(south - north, 1 / 2 ** 17),
  );
  const left = (west + east - width / scale) / 2;
  const top = (north + south - height / scale) / 2;

  const project = (coordinate: MapCoordinate) => {
    const { x, y } = mapWorldPoint(coordinate);
    return { x: +((x - left) * scale).toFixed(2), y: +((y - top) * scale).toFixed(2) };
  };

  // GSI's English base ends at zoom 11. Keep the map lightweight by using
  // the closest lower tile resolution when it can fill the viewport.
  const zoom = Math.max(5, Math.min(11, Math.floor(Math.log2(scale / TILE_SIZE))));
  const tilesAcross = 2 ** zoom;
  const tileSize = scale / tilesAcross;
  const firstX = Math.max(0, Math.floor(left * tilesAcross));
  const firstY = Math.max(0, Math.floor(top * tilesAcross));
  const lastX = Math.min(tilesAcross - 1, Math.ceil((left + width / scale) * tilesAcross) - 1);
  const lastY = Math.min(tilesAcross - 1, Math.ceil((top + height / scale) * tilesAcross) - 1);
  const tiles = [];
  for (let y = firstY; y <= lastY; y++) {
    for (let x = firstX; x <= lastX; x++) {
      tiles.push({ path: `${zoom}/${x}/${y}.png`, left: (x / tilesAcross - left) * scale, top: (y / tilesAcross - top) * scale });
    }
  }
  return { width, height, project, tileSize, tiles, zoom };
}
