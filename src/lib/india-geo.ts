/**
 * Placeholder India state geometry.
 *
 * These are deliberately low-fidelity outlines in real WGS-84 degrees so the
 * choropleth renders offline with no map API key. Swap `indiaStates` for a real
 * India TopoJSON/GeoJSON FeatureCollection (same shape: Feature[] with
 * `properties.name` / `properties.code` and Polygon coordinates) and every
 * consumer keeps working — the projection below is standard equirectangular.
 */

export interface StateFeature {
  type: "Feature";
  properties: { name: string; code: string };
  geometry: { type: "Polygon"; coordinates: [number, number][][] };
}

export interface StateFeatureCollection {
  type: "FeatureCollection";
  features: StateFeature[];
}

const feature = (name: string, code: string, ring: [number, number][]): StateFeature => ({
  type: "Feature",
  properties: { name, code },
  geometry: { type: "Polygon", coordinates: [ring] },
});

export const indiaStates: StateFeatureCollection = {
  type: "FeatureCollection",
  features: [
    feature("Jammu & Kashmir", "JK", [
      [73.9, 33.4],
      [76.2, 32.6],
      [78.6, 33.6],
      [80.2, 34.6],
      [78.4, 35.9],
      [75.2, 35.4],
      [73.8, 34.4],
    ]),
    feature("Himachal Pradesh", "HP", [
      [75.6, 31.1],
      [78.4, 30.6],
      [79.0, 31.6],
      [77.4, 33.0],
      [76.0, 32.6],
      [75.4, 31.9],
    ]),
    feature("Punjab", "PB", [
      [73.9, 29.9],
      [76.4, 29.7],
      [76.9, 31.4],
      [75.6, 32.5],
      [74.2, 31.6],
      [73.8, 30.6],
    ]),
    feature("Haryana", "HR", [
      [74.6, 29.4],
      [77.4, 28.2],
      [77.9, 29.6],
      [77.3, 30.8],
      [76.4, 30.9],
      [75.3, 30.2],
    ]),
    feature("Uttarakhand", "UK", [
      [77.6, 30.0],
      [80.2, 28.9],
      [81.0, 30.1],
      [79.2, 31.3],
      [77.9, 31.0],
    ]),
    feature("Delhi", "DL", [
      [76.85, 28.4],
      [77.35, 28.4],
      [77.4, 28.85],
      [76.95, 28.85],
    ]),
    feature("Rajasthan", "RJ", [
      [69.5, 26.4],
      [70.2, 23.9],
      [73.0, 23.1],
      [75.8, 24.2],
      [77.3, 25.2],
      [76.9, 27.9],
      [74.6, 29.5],
      [72.4, 28.3],
      [70.1, 27.9],
    ]),
    feature("Uttar Pradesh", "UP", [
      [77.2, 27.4],
      [79.6, 25.6],
      [82.4, 24.4],
      [84.6, 25.2],
      [84.1, 27.4],
      [80.6, 28.9],
      [77.6, 28.4],
    ]),
    feature("Bihar", "BR", [
      [83.4, 24.6],
      [86.6, 24.4],
      [88.2, 25.4],
      [87.6, 26.6],
      [84.4, 27.4],
      [83.3, 26.1],
    ]),
    feature("Jharkhand", "JH", [
      [83.4, 23.3],
      [86.4, 22.4],
      [87.7, 23.6],
      [86.9, 25.0],
      [84.4, 24.9],
      [83.3, 24.3],
    ]),
    feature("West Bengal", "WB", [
      [86.6, 26.5],
      [88.2, 26.9],
      [89.8, 26.4],
      [89.1, 24.6],
      [88.9, 22.0],
      [87.2, 21.7],
      [87.0, 24.0],
      [86.0, 25.2],
    ]),
    feature("Gujarat", "GJ", [
      [68.2, 23.7],
      [70.1, 22.0],
      [72.2, 20.7],
      [74.2, 20.4],
      [74.5, 23.9],
      [72.6, 24.7],
      [70.4, 24.4],
    ]),
    feature("Madhya Pradesh", "MP", [
      [74.5, 23.1],
      [78.0, 21.6],
      [81.6, 22.4],
      [82.8, 23.9],
      [80.2, 25.4],
      [77.1, 25.6],
      [74.7, 24.1],
    ]),
    feature("Chhattisgarh", "CG", [
      [80.3, 18.6],
      [82.6, 18.7],
      [84.1, 21.6],
      [83.2, 24.0],
      [81.4, 23.6],
      [80.4, 21.1],
    ]),
    feature("Maharashtra", "MH", [
      [72.7, 20.2],
      [76.1, 21.6],
      [80.6, 21.3],
      [80.3, 19.0],
      [78.1, 17.6],
      [76.1, 15.9],
      [73.5, 16.1],
      [72.8, 18.6],
    ]),
    feature("Odisha", "OD", [
      [81.4, 20.6],
      [84.1, 21.7],
      [86.6, 22.1],
      [87.2, 21.4],
      [86.1, 19.5],
      [84.6, 18.1],
      [82.1, 18.6],
    ]),
    feature("Telangana", "TG", [
      [77.4, 17.1],
      [79.1, 16.7],
      [80.9, 17.4],
      [80.4, 19.1],
      [78.4, 19.9],
      [77.4, 18.5],
    ]),
    feature("Andhra Pradesh", "AP", [
      [77.1, 15.9],
      [78.4, 13.8],
      [80.2, 13.5],
      [82.4, 16.7],
      [84.8, 18.4],
      [83.0, 19.0],
      [80.9, 17.4],
      [79.1, 16.7],
      [77.4, 17.0],
    ]),
    feature("Karnataka", "KA", [
      [74.1, 15.1],
      [75.0, 12.8],
      [76.2, 11.7],
      [77.7, 12.4],
      [78.6, 14.6],
      [77.5, 16.6],
      [75.9, 17.4],
      [74.2, 16.1],
    ]),
    feature("Goa", "GA", [
      [73.7, 14.9],
      [74.3, 14.9],
      [74.3, 15.7],
      [73.8, 15.7],
    ]),
    feature("Kerala", "KL", [
      [74.9, 12.8],
      [76.3, 11.4],
      [77.2, 8.2],
      [76.4, 8.2],
      [75.1, 11.6],
      [74.6, 12.8],
    ]),
    feature("Tamil Nadu", "TN", [
      [76.4, 11.5],
      [77.3, 8.1],
      [78.3, 8.6],
      [80.3, 13.4],
      [78.6, 13.5],
      [77.0, 12.5],
    ]),
    feature("Assam", "AS", [
      [89.7, 26.0],
      [92.1, 26.9],
      [95.4, 27.7],
      [96.1, 27.0],
      [93.4, 25.0],
      [90.0, 25.1],
    ]),
    feature("North Eastern States", "NE", [
      [91.5, 22.9],
      [94.4, 23.6],
      [95.2, 26.6],
      [93.4, 25.0],
      [92.2, 24.0],
      [91.4, 24.2],
    ]),
  ],
};

export const INDIA_BOUNDS = { minLon: 68.0, maxLon: 97.5, minLat: 7.8, maxLat: 36.6 };

/** Equirectangular projection into an SVG viewbox of the given size. */
export const projectPoint = (
  [lon, lat]: [number, number],
  width: number,
  height: number,
): [number, number] => {
  const { minLon, maxLon, minLat, maxLat } = INDIA_BOUNDS;
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
};

export const featurePath = (state: StateFeature, width: number, height: number): string =>
  state.geometry.coordinates
    .map(
      (ring) =>
        `${ring.map((point, index) => `${index === 0 ? "M" : "L"}${projectPoint(point, width, height).join(" ")}`).join(" ")} Z`,
    )
    .join(" ");

export const featureCentroid = (
  state: StateFeature,
  width: number,
  height: number,
): [number, number] => {
  const ring = state.geometry.coordinates[0] ?? [];
  if (ring.length === 0) return [0, 0];
  const total = ring.reduce<[number, number]>(
    (acc, point) => {
      const [x, y] = projectPoint(point, width, height);
      return [acc[0] + x, acc[1] + y];
    },
    [0, 0],
  );
  return [total[0] / ring.length, total[1] / ring.length];
};

/**
 * Placeholder parcel geometry for a project's embedded map — a small cluster of
 * plots in local (0–100) space; replace with real parcel GeoJSON per ULPIN.
 */
export const parcelGeometry = (
  seed: number,
  count: number,
): { d: string; cx: number; cy: number }[] =>
  Array.from({ length: count }, (_, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const jitter = ((seed + index * 7) % 9) - 4;
    const x = 12 + column * 27 + jitter;
    const y = 14 + row * 30 + (((seed + index * 5) % 7) - 3);
    const w = 20 + ((seed + index) % 5);
    const h = 20 + ((seed + index * 3) % 6);
    return {
      d: `M${x} ${y} L${x + w} ${y - 2} L${x + w + 2} ${y + h} L${x + 1} ${y + h + 2} Z`,
      cx: x + w / 2,
      cy: y + h / 2,
    };
  });
