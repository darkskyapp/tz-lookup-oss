"use strict";
const width = 24576;
const height = 12288;
const fs = require("fs");
const tz_data = fs.readFileSync("tz_world.pgm").slice(21);
const urban_data = fs.readFileSync("ne_10m_urban_areas.pgm").slice(19);
const index = require("./tz_world_index");

// get the raw pixel data at x,y
function tz_pixel(x, y) {
  return tz_data.readUInt16BE((y * width + x) * 2);
}

function urban_pixel(x, y) {
  return urban_data[y * width + x];
}

function fine(x, y, size) {
  /* Generate a histogram of the relative frequency of timezones in the tile. */
  const map = new Map();
  let count = 0;
  for(let v = 0; v < size; v++) {
    for(let u = 0; u < size; u++) {
      const key = tz_pixel(x + u, y + v) - 1;
      if(key === -1) {
        continue;
      }
      if(!map.has(key)) {
        map.set(key, 0);
      }
      map.set(key, map.get(key) + 1);
      ++count;
    }
  }

  /* No explicit timezones means use international timezones. (These are the
   * last 25 in the index.) */
  if(map.size === 0) {
    return index.length + Math.round((x + size / 2) * 24 / width) - 25;
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
      if(urban_pixel(x + u, y + v) !== 0) {
        important = true;
        break;
      }
    }
  }
  if(!important) {
    const array = Array.from(map).sort((a, b) => b[1] - a[1]);

    if(array[0][1] * 2 >= count) {
      return array[0][0];
    }
  }

  /* Otherwise, recurse down. */
  const half = size / 2;
  return [
    fine(x, y, half),
    fine(x + half, y, half),
    fine(x, y + half, half),
    fine(x + half, y + half, half)
  ];
}

function coarse() {
  const a = new Array(48 * 24);
  const size = width / 48;
  for(let y = 0; y < 24; y++) {
    for(let x = 0; x < 48; x++) {
      a[y * 48 + x] = fine(x * size, y * size, size);
    }
  }
  return a;
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
        Array.isArray(b)? (b.index - a.index - 1): 65536 - index.length + b,
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
