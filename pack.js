"use strict";
const fs = require("fs");

const COLS = 48;
const ROWS = 24;
const MIN_DEPTH = 3; // Minimum recursion depth to allow lossy compression.
const MAX_DEPTH = 10; // Maximum recursion depth (forcing lossy compression).
const EPS = 1e-6; // Epsilon value for floating-point equality checks.
// NOTE: This value (~0.01°) is arbitrary and ported from a prior version. It
// could easily be tuned smaller or larger if appropriate.
const URBAN_HACK_RADIUS = 720/49152;

const tz_geojson = require("./dist/combined.json");
const urban_geojson = require("./ne_10m_urban_areas.json");


// Make the geojson files consistent.
for(const geojson of [tz_geojson, urban_geojson]) {
  for(const feature of geojson.features) {
    // Ensure all features are MultiPolygons.
    switch(feature.geometry.type) {
      case "MultiPolygon":
        break;
      case "Polygon":
        feature.geometry.type = "MultiPolygon";
        feature.geometry.coordinates = [feature.geometry.coordinates];
        break;
      default:
        throw new Error("unrecognized type " + type);
    }

    // geojson includes duplicate vertices at the beginning and end of each
    // vertex list, so remove them. (This makes some of the algorithms used,
    // like clipping and the like, simpler.)
    for(const polygon of feature.geometry.coordinates) {
      for(const vertices of polygon) {
        const first = vertices[0];
        const last = vertices[vertices.length - 1];
        if(first[0] === last[0] && first[1] === last[1]) {
          vertices.pop();
        }
      }
    }

    // Add properties representing the bounding box of the timezone.
    let min_lat = 90;
    let min_lon = 180;
    let max_lat = -90;
    let max_lon = -180;
    for(const [vertices] of feature.geometry.coordinates) {
      for(const [lon, lat] of vertices) {
        if(lat < min_lat) { min_lat = lat; }
        if(lon < min_lon) { min_lon = lon; }
        if(lat > max_lat) { max_lat = lat; }
        if(lon > max_lon) { max_lon = lon; }
      }
    }

    feature.properties.min_lat = min_lat;
    feature.properties.min_lon = min_lon;
    feature.properties.max_lat = max_lat;
    feature.properties.max_lon = max_lon;
  }
}


// HACK: Add custom urban areas in order to fix reported errors.
for(const [lat, lon] of [
  [ 36.8381,  -84.8500],
  [ 37.9643,  -86.7453],
  [ 58.3168, -134.4397],
  [ 36.9147, -111.4558], // fix #7
  [ 44.9280,  -87.1853], // fix #13
  [ 50.7029,  -57.3511], // fix #13
  [ 29.9414,  -85.4064], // fix #14
  [ 49.7261,   -1.9104], // fix #15
  [ 65.5280,   23.5570], // fix #16
  [ 35.8722,  -84.5250], // fix #18
  [ 60.0961,   18.7970], // fix #23
  [ 59.9942,   18.7794], // fix #23
  [ 59.0500,   15.0412], // fix #23
  [ 60.0270,   18.7594], // fix #23
  [ 60.0779,   18.8102], // fix #23
  [ 60.0239,   18.7625], // fix #23
  [ 59.9983,   18.8548], // fix #23
  [ 37.3458,  -85.3456], // fix #24
  [ 46.4547,  -90.1711], // fix #25
  [ 46.4814,  -90.0531], // fix #25
  [ 46.4753,  -89.9400], // fix #25
  [ 46.3661,  -89.5969], // fix #25
  [ 46.2678,  -89.1781], // fix #25
  [ 39.6217,  -87.4522], // fix #27
  [ 39.6631,  -87.4307], // fix #27
  [ 61.7132,   29.3968], // fix #36
  [ 41.6724,  -86.5082], // fix #38
  [ 27.9881,   86.9253], // Mount Everest
  [ 47.3525, -102.6214], // Dunn Center, North Dakota
  [ 19.7500,  -88.7000], // fix #40
  [ 21.1000,  -87.4833], // fix #40
  [-31.6750,  128.8831], // fix #45
  [54.39447, -6.978715], // fix #47
  [54.59160, -7.733996], // fix #47
  [54.54842, -7.834725], // fix #47
  [54.15168, -7.357061], // fix #47
  [54.75062, -7.560825], // fix #47
  [54.20568, -6.738351], // fix #47
  [54.54842, -7.834724], // fix #47
  [ 45.6504,  -67.5790], // fix #48
  [ 46.4392,  -67.7450], // fix #48
  [ 45.3238, -116.5487], // fix #51
  [-37.3786,  140.8362], // fix #52
  [ 44.6972,  -67.3955], // fix #53
  [ 67.9333,   23.4333], // fix #54
  [ 67.8167,   23.1667], // fix #54
  [ 68.1375,   23.1447], // fix #56
  [ 67.8000,   23.1133], // fix #56
  [ 67.9458,   23.6242], // fix #56
  [ 68.0168,   23.4515], // fix #56
  [ 68.1133,   23.3214], // fix #56
]) {
  urban_geojson.features.push({
    properties: {
      min_lat: lat - URBAN_HACK_RADIUS,
      min_lon: lon - URBAN_HACK_RADIUS,
      max_lat: lat + URBAN_HACK_RADIUS,
      max_lon: lon + URBAN_HACK_RADIUS,
    },
  });
}


// Build up a tree representing a raster version of the timezone map.
function box_overlap(feature, min_lat, min_lon, max_lat, max_lon) {
  return min_lat <= feature.properties.max_lat &&
         min_lon <= feature.properties.max_lon &&
         max_lat >= feature.properties.min_lat &&
         max_lon >= feature.properties.min_lon;
}

function clip(polygon, min_lat, min_lon, max_lat, max_lon) {
  const p = Array.from(polygon);
  const q = [];
  let b;

  b = p[p.length - 1];
  for(let i = 0; i < p.length; i++) {
    const a = b;
    b = p[i];
    if((a[0] >= min_lon) !== (b[0] >= min_lon)) {
      q.push([min_lon, a[1] + (b[1] - a[1]) * (min_lon - a[0]) / (b[0] - a[0])]);
    }
    if(b[0] >= min_lon) {
      q.push(b);
    }
  }

  p.length = 0;
  b = q[q.length - 1];
  for(let i = 0; i < q.length; i++) {
    const a = b;
    b = q[i];
    if((a[1] >= min_lat) !== (b[1] >= min_lat)) {
      p.push([a[0] + (b[0] - a[0]) * (min_lat - a[1]) / (b[1] - a[1]), min_lat]);
    }
    if(b[1] >= min_lat) {
      p.push(b);
    }
  }

  q.length = 0;
  b = p[p.length - 1];
  for(let i = 0; i < p.length; i++) {
    const a = b;
    b = p[i];
    if((a[0] <= max_lon) !== (b[0] <= max_lon)) {
      q.push([max_lon, a[1] + (b[1] - a[1]) * (max_lon - a[0]) / (b[0] - a[0])]);
    }
    if(b[0] <= max_lon) {
      q.push(b);
    }
  }

  p.length = 0;
  b = q[q.length - 1];
  for(let i = 0; i < q.length; i++) {
    const a = b;
    b = q[i];
    if((a[1] <= max_lat) !== (b[1] <= max_lat)) {
      p.push([a[0] + (b[0] - a[0]) * (max_lat - a[1]) / (b[1] - a[1]), max_lat]);
    }
    if(b[1] <= max_lat) {
      p.push(b);
    }
  }

  return p;
}

function area(polygon) {
  let sum = 0;
  let b = polygon[polygon.length - 1];
  for(let i = 0; i < polygon.length; i++) {
    const a = b;
    b = polygon[i];
    sum += a[0] * b[1] - a[1] * b[0];
  }
  return Math.abs(sum * 0.5);
}

function polygon_overlap(feature, min_lat, min_lon, max_lat, max_lon) {
  let total = 0;
  for(const polygon of feature.geometry.coordinates) {
    total += area(clip(polygon[0], min_lat, min_lon, max_lat, max_lon));
    for(let i = 1; i < polygon.length; i++) {
      total -= area(clip(polygon[i], min_lat, min_lon, max_lat, max_lon));
    }
  }

  return total / ((max_lat - min_lat) * (max_lon - min_lon));
}

function by_coverage_and_tzid([a, a_coverage], [b, b_coverage]) {
  const order = b_coverage - a_coverage;
  if(order !== 0) { return order; }

  return a.properties.tzid.localeCompare(b.properties.tzid);
}

function contains_city(min_lat, min_lon, max_lat, max_lon) {
  for(const feature of urban_geojson.features) {
    if(
      box_overlap(feature, min_lat, min_lon, max_lat, max_lon) &&
      (
        // HACK: If there's no geometry, it's OK: these were manually added
        // box-shaped zones and we don't want or need the polygon.
        feature.geometry === undefined ||
        polygon_overlap(feature, min_lat, min_lon, max_lat, max_lon) >= EPS
      )
    ) {
      return true;
    }
  }
  return false;
}

function maritime_zone(lon) {
  const x = Math.round(12 - (lon + 180) / 15);
  if(x > 0) { return "Etc/GMT+" + x; }
  if(x < 0) { return "Etc/GMT" + x; }
  return "Etc/GMT";
}

function tile(candidates, etc_tzid, min_lat, min_lon, max_lat, max_lon, depth) {
  const mid_lat = min_lat + (max_lat - min_lat) / 2;
  const mid_lon = min_lon + (max_lon - min_lon) / 2;

  const subset = [];
  for(const candidate of candidates) {
    let overlap = polygon_overlap(candidate, min_lat, min_lon, max_lat, max_lon);
    if(overlap < EPS) {
      continue;
    }

    subset.push([candidate, overlap]);
  }

  // No coverage should not happen?
  if(subset.length === 0) {
    return etc_tzid;
  }

  // One zone means use it.
  if(subset.length === 1) {
    return subset[0][0].properties.tzid;
  }

  subset.sort(by_coverage_and_tzid);

  // If the first zone has max coverage OR we hit the maximum recursion depth
  // OR this is a rural area that doesn't matter, then we're going to return a
  // leaf node rather than recurse further.
  if(
    subset[0][1] > 1 - EPS ||
    depth >= MAX_DEPTH ||
    (depth >= MIN_DEPTH && !contains_city(min_lat, min_lon, max_lat, max_lon))
  ) {
    const a = subset[0][0].properties.tzid;

    // If the second zone in the list has nearly the same coverage level as the
    // first, then sort out how to favor one over the other.
    // NOTE: We assume that no more than two zones ever conflict! This is true
    // as of 2018i, but...
    if(subset[0][1] - subset[1][1] < EPS) {
      const b = subset[1][0].properties.tzid;

      // Xinjiang conflict. We select Asia/Urumqi in order to make it clear
      // that there is, in fact, a conflict.
      if(a === "Asia/Shanghai" && b === "Asia/Urumqi") { return b; }

      // Israeli-Palestinian conflict. We select Asia/Hebron in order to make
      // it clear that there is, in fact, a conflict.
      if(a === "Asia/Hebron" && b === "Asia/Jerusalem") { return a; }

      // Sudan-South Sudan conflict. We select Africa/Khartoum arbitrarily and
      // will tweak it if anyone complains.
      if(a === "Africa/Juba" && b === "Africa/Khartoum") { return b; }

      // These are just conflicts that occur due to the resolution of our data.
      // Resolve them arbitrarily and we'll tweak it if anyone complains.
      if(a === "Europe/Amsterdam" && b === "Europe/Berlin") { return a; }
      if(a === "Australia/Sydney" && b === "Australia/Melbourne") { return a; }

      throw new Error("unresolved zone conflict: " + a + " vs " + b);
    }

    // Otherwise, we just care about the top zone.
    return a;
  }

  // No easy way to pick a timezone for this tile. Recurse!
  const subset_candidates = subset.map(x => x[0]);
  const child_depth = depth + 1;
  const children = [
    tile(subset_candidates, etc_tzid, mid_lat, min_lon, max_lat, mid_lon, child_depth),
    tile(subset_candidates, etc_tzid, mid_lat, mid_lon, max_lat, max_lon, child_depth),
    tile(subset_candidates, etc_tzid, min_lat, min_lon, mid_lat, mid_lon, child_depth),
    tile(subset_candidates, etc_tzid, min_lat, mid_lon, mid_lat, max_lon, child_depth),
  ];

  // If all the children are leaves, and they're either identical or a maritime
  // zone, then collapse them up into a single node.
  if(!Array.isArray(children[0]) &&
     !Array.isArray(children[1]) &&
     !Array.isArray(children[2]) &&
     !Array.isArray(children[3])) {
    const clean_children = children.filter(x => x !== etc_tzid);
    if(clean_children.length === 0) { return etc_tzid; }

    let all_equal = true;
    for(let i = 1; i < clean_children.length; i++) {
      if(clean_children[0] !== clean_children[i]) {
        all_equal = false;
        break;
      }
    }
    if(all_equal) {
      return clean_children[0];
    }
  }

  return children;
}

const root = new Array(COLS * ROWS);

for(let row = 0; row < ROWS; row++) {
  const min_lat = 90 - (row + 1) * 180 / ROWS;
  const max_lat = 90 - (row + 0) * 180 / ROWS;

  for(let col = 0; col < COLS; col++) {
    const min_lon = -180 + (col + 0) * 360 / COLS;
    const max_lon = -180 + (col + 1) * 360 / COLS;
    const etc_tzid = maritime_zone(min_lon + (max_lon - min_lon) / 2);

    // Determine which timezones potentially overlap this tile.
    const candidates = [];
    for(const feature of tz_geojson.features) {
      if(box_overlap(feature, min_lat, min_lon, max_lat, max_lon)) {
        candidates.push(feature);
      }
    }

    root[row * COLS + col] = tile(
      candidates,
      etc_tzid,
      min_lat,
      min_lon,
      max_lat,
      max_lon,
      1
    );
  }
}

// Generate list of timezones.
const tz_set = new Set();

function add(node) {
  if(Array.isArray(node)) {
    node.forEach(add);
  }
  else {
    tz_set.add(node);
  }
}

add(root);

const tz_list = Array.from(tz_set);
tz_list.sort();

// Pack tree into a string.
function pack(root) {
  const list = [];

  for(const queue = [root]; queue.length; ) {
    const node = queue.shift();

    node.index = list.length;
    list.push(node);

    for(let i = 0; i < node.length; i++) {
      if(Array.isArray(node[i])) {
        queue.push(node[i]);
      }
      else {
        node[i] = tz_list.indexOf(node[i]);
      }
    }
  }

  let string = "";
  for(let i = 0; i < list.length; i++) {
    const a = list[i];
    for(let j = 0; j < a.length; j++) {
      const b = a[j];

      let x;
      if(Array.isArray(b)) {
        x = b.index - a.index - 1;
        if(x < 0 || x + tz_list.length >= 3136) {
          throw new Error("cannot pack in the current format");
        }
      }
      else {
        x = 3136 - tz_list.length + b;
      }

      string += String.fromCharCode(Math.floor(x / 56) + 35, (x % 56) + 35);
    }
  }

  return string;
}

const tz_data = pack(root);

console.log(
  "%s",
  fs.readFileSync("tz_template.js", "utf8").
    replace(/__TZDATA__/, () => JSON.stringify(tz_data)).
    replace(/__TZLIST__/, () => JSON.stringify(tz_list))
);
