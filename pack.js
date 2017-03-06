"use strict";
const width = 24576;
const height = 12288;
const fs = require("fs");
const data = fs.readFileSync("tz_world.pgm").slice(21);
const index = require("./tz_world_index");

// get the raw pixel data at x,y
function getpixel(x, y) {
  return data.readUInt16BE((y * width + x) * 2);
}

function fine(x, y, size) {
  const set = new Set();
  for(let v = 0; v < size; v++) {
    for(let u = 0; u < size; u++) {
      set.add(getpixel(x + u, y + v) - 1);
    }
  }
  set.delete(-1);

  if(set.size === 0) {
    return index.length + Math.round((x + size / 2) * 24 / width) - 25;
  }
  if(set.size === 1) {
    return Array.from(set)[0];
  }

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
  const queue = [];

  root.index = 0;
  list.push(root);

  for(let i = 0; i < root.length; i++) {
    let node = root[i];
    if(Array.isArray(node)) {
      queue.push(node);

      while(queue.length) {
        node = queue.shift();
        node.index = list.length;
        list.push(node);
        for(let i = 0; i < node.length; i++) {
          if(Array.isArray(node[i])) {
            queue.push(node[i]);
          }
        }
      }
    }
  }

  const buffer =
    Buffer.allocUnsafe(1 * 48 * 24 * 3 + (list.length - 1) * 2 * 2 * 2);
  let off = 0;
  {
    const a = list[0];
    for(let j = 0; j < a.length; j++) {
      const b = a[j];
      buffer.writeUIntBE(
        Array.isArray(b)? (b.index - a.index - 1): 16777216 - index.length + b,
        off,
        3
      );
      off += 3;
    }
  }
  for(let i = 1; i < list.length; i++) {
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
