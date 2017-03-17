"use strict";
const width = 49152;
const height = 24576;
const fs = require("fs");
const index = require("./tz_world_index");

function read(pathname, offset, buffer) {
  const fd = fs.openSync(pathname, "r");
  const n = fs.readSync(fd, buffer, 0, buffer.length, offset);
  if(n !== buffer.length) {
    throw new Error("unable to read " + buffer.length + " bytes from " + pathname);
  }
  fs.closeSync(fd);
}

function constrain(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

function force_urban(lat, lon, buffer) {
  const x = (180 + lon) * width  / 360.00000000000006,
        y = ( 90 - lat) * height / 180.00000000000003,
        r = 2,
        min_x = constrain(Math.floor(x - r    ), 0, width ),
        min_y = constrain(Math.floor(y - r    ), 0, height),
        max_x = constrain(Math.floor(x + r + 1), 0, width ),
        max_y = constrain(Math.floor(y + r + 1), 0, height);
  for(let v = min_y; v < max_y; v++) {
    for(let u = min_x; u < max_x; u++) {
      const dx = u - x,
            dy = v - y;
      if(dx * dx + dy * dy > r * r) {
        continue;
      }

      const i = v * width + u;
      buffer[i >> 3] &= (~(1 << (i & 7))) & 255;
    }
  }
}

function force_tz(lat, lon, tzid, buffer, tile_x, tile_y) {
  const tile_size = width / 4;

  const x = (180 + lon) * width  / 360.00000000000006 - tile_x * tile_size,
        y = ( 90 - lat) * height / 180.00000000000003 - tile_y * tile_size,
        z = index.indexOf(tzid) + 1;
  if(z === 0) {
    return;
  }

  const r = 10,
        min_x = constrain(Math.floor(x - r    ), 0, tile_size),
        min_y = constrain(Math.floor(y - r    ), 0, tile_size),
        max_x = constrain(Math.floor(x + r + 1), 0, tile_size),
        max_y = constrain(Math.floor(y + r + 1), 0, tile_size);
  for(let y = min_y; y < max_y; y++) {
    for(let x = min_x; x < max_x; x++) {
      buffer.writeUInt16BE(z, (y * tile_size + x) * 2);
    }
  }
}

function fine(urban_data, urban_x, urban_y, tz_data, tz_x, tz_y, size) {
  const tz_width = width / 4;
  const tz_height = height / 4;

  /* Generate a histogram of the relative frequency of timezones in the tile. */
  const map = new Map();
  for(let v = 0; v < size; v++) {
    for(let u = 0; u < size; u++) {
      const key = tz_data.readUInt16BE(((tz_y + v) * tz_width + (tz_x + u)) * 2) - 1;
      if(key === -1) {
        continue;
      }
      if(!map.has(key)) {
        map.set(key, 0);
      }
      map.set(key, map.get(key) + 1);
    }
  }

  /* No explicit timezones means use international timezones. (These are the
   * last 25 in the index.) */
  if(map.size === 0) {
    return index.length + Math.round((urban_x + size / 2) * 24 / width) - 25;
  }

  /* Only one timezone means, let's use it. (Note that this also handles the
   * "we recursed all the way down to a single pixel" case, so there's no need
   * for explicitly handling that case.) */
  if(map.size === 1) {
    return Array.from(map.keys())[0];
  }

  /* Check and see if this tile has any urban centers. If not, it's probably
   * not worth recursing on, so early out with the most common timezone in the
   * tile if it covers a majority of it. */
  let important = false;
  for(let v = 0; v < size; v++) {
    for(let u = 0; u < size; u++) {
      const i = (urban_y + v) * width + (urban_x + u);
      if(((urban_data[i >> 3] >> (i & 7)) & 1) === 0) {
        important = true;
        break;
      }
    }
  }
  if(!important) {
    return Array.from(map).sort((a, b) => b[1] - a[1])[0][0];
  }

  /* Otherwise, recurse down. */
  const half = size / 2;
  return [
    fine(urban_data, urban_x, urban_y, tz_data, tz_x, tz_y, half),
    fine(urban_data, urban_x + half, urban_y, tz_data, tz_x + half, tz_y, half),
    fine(urban_data, urban_x, urban_y + half, tz_data, tz_x, tz_y + half, half),
    fine(urban_data, urban_x + half, urban_y + half, tz_data, tz_x + half, tz_y + half, half),
  ];
}

function coarse() {
  const root = new Array(48 * 24);
  const size = width / 48;

  /* Blanket urban coverage data from MODIS. */
  const urban_data = Buffer.allocUnsafe(width * height / 8);
  read("ne_10m_urban_areas.pbm", 15, urban_data);

  /* Plus automatically block out cities. */
  const cities = require("./ne_10m_populated_places_simple.json");
  for(let feature of cities.features) {
    const geometry = feature.geometry;
    if(geometry && geometry.type === "Point") {
      force_urban(geometry.coordinates[1], geometry.coordinates[0], urban_data);
    }
  }

  /* Manually fix specific resolution problem locations. */
  force_urban(36.8381,  -84.8500, urban_data);
  force_urban(37.9643,  -86.7453, urban_data);
  force_urban(36.9147, -111.4558, urban_data);

  const tz_data = Buffer.allocUnsafe((width / 4) * (height / 2) * 2);
  for(let y = 0; y < 2; y++) {
    for(let x = 0; x < 4; x++) {
      read("tz_world_" + (y * 4 + x + 10).toString(36) + ".pgm", 21, tz_data);

      force_tz(36.9147, -111.4558, "America/Phoenix", tz_data, x, y);

      for(let v = 0; v < 12; v++) {
        for(let u = 0; u < 12; u++) {
          root[(y * 12 + v) * 48 + (x * 12 + u)] = fine(
            urban_data, (x * 12 + u) * size, (y * 12 + v) * size,
            tz_data, u * size, v * size,
            size
          );
        }
      }
    }
  }

  return root;
}

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
    }
  }

  const buffer = Buffer.allocUnsafe((48 * 24 + (list.length - 1) * 2 * 2) * 2);
  let off = 0;
  for(let i = 0; i < list.length; i++) {
    const a = list[i];
    for(let j = 0; j < a.length; j++) {
      const b = a[j];
      buffer.writeUIntBE(
        Array.isArray(b)?
          (b.index - a.index - 1):
          65536 - index.length + b,
        off,
        2
      );
      off += 2;
    }
  }
  if(off !== buffer.length) {
    throw new Error("eep");
  }

  return buffer;
}

fs.writeFileSync("tz_world.bin", pack(coarse()));
