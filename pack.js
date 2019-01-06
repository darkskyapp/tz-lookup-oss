"use strict";
const GEOJSON = require("./dist/combined.json");
const COLS = 48;
const ROWS = 24;
const EPS = 1e-6;


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

function maritime_zone(lon) {
  const x = Math.round(12 - (lon + 180) / 15);
  if(x > 0) { return "Etc/GMT+" + x; }
  if(x < 0) { return "Etc/GMT" + x; }
  return "Etc/GMT";
}

function by_coverage_and_tzid([a, a_coverage], [b, b_coverage]) {
  const order = b_coverage - a_coverage;
  if(order !== 0) { return order; }

  return a.properties.tzid.localeCompare(b.properties.tzid);
}

function tile(candidates, min_lat, min_lon, max_lat, max_lon, depth) {
  const mid_lat = min_lat + (max_lat - min_lat) / 2;
  const mid_lon = min_lon + (max_lon - min_lon) / 2;

  const subset = [];
  for(const candidate of candidates) {
    let overlap = polygon_overlap(candidate, min_lat, min_lon, max_lat, max_lon);
    if(overlap < EPS) {
      continue;
    }

    if(overlap > 1 - EPS) {
      overlap = 1;
    }
    subset.push([candidate, overlap]);
  }

  // No coverage means use maritime zone.
  if(subset.length === 0) {
    return maritime_zone(mid_lon);
  }

  // One zone means use it.
  if(subset.length === 1) {
    return subset[0][0].properties.tzid;
  }

  // All zones have max coverage.
  if(subset[0][1] === 1 && subset[subset.length - 1][1] === 1) {
    return subset.map(x => x[0].properties.tzid).join(" ");
  }

  // Maximum recursion: use whichever zone is best.
  // FIXME: Maximum recursion depth should depend on whether this location is
  // urban or rural.
  if(depth === 4) {
    return subset[0][0].properties.tzid;
  }

  // No easy way to pick a timezone for this tile. Recurse!
  const subset_candidates = subset.map(x => x[0]);
  const child_depth = depth + 1;
  const children = [
    tile(subset_candidates, min_lat, min_lon, mid_lat, mid_lon, child_depth),
    tile(subset_candidates, min_lat, mid_lon, mid_lat, max_lon, child_depth),
    tile(subset_candidates, mid_lat, min_lon, max_lat, mid_lon, child_depth),
    tile(subset_candidates, mid_lat, mid_lon, max_lat, max_lon, child_depth),
  ];

  // If all the children are leaves, and they're either identical or a maritime
  // zone, then collapse them up into a single node.
  if(!Array.isArray(children[0]) &&
     !Array.isArray(children[1]) &&
     !Array.isArray(children[2]) &&
     !Array.isArray(children[3])) {
    const clean_children = children.filter(x => !x.startsWith("Etc/"));
    if(clean_children.length === 0) {
      return maritime_zone(mid_lon);
    }

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


// Make the geojson file consistent.
for(const feature of GEOJSON.features) {
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
  // vertex list, so remove them. (This makes some of the algorithms used, like
  // clipping and the like, simpler.)
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


// Build up a tree representing a raster version of the timezone map.
const root = new Array(COLS * ROWS);

for(let row = 0; row < ROWS; row++) {
  const min_lat = 90 - (row + 1) * 180 / ROWS;
  const max_lat = 90 - (row + 0) * 180 / ROWS;

  for(let col = 0; col < COLS; col++) {
    const min_lon = -180 + (col + 0) * 360 / COLS;
    const max_lon = -180 + (col + 1) * 360 / COLS;

    // Determine which timezones potentially overlap this tile.
    const candidates = [];
    for(const feature of GEOJSON.features) {
      if(box_overlap(feature, min_lat, min_lon, max_lat, max_lon)) {
        candidates.push(feature);
      }
    }

    root[row * COLS + col] = tile(candidates, min_lat, min_lon, max_lat, max_lon, 1);
  }
}

console.log("%s", JSON.stringify(root, null, 2));
