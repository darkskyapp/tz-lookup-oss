"use strict";
const fs = require("fs");

// grab the geojson
const geojson = require("./dist/combined.json");
// sort by tzid
geojson.features.sort((a, b) =>
  a.properties["tzid"].localeCompare(b.properties["tzid"]));
const map = new Map();
let count = 0;
// add an index property (this is needed by gdal_rasterize)
for(let feature of geojson.features) {
  const tzid = feature.properties["tzid"];
  if(!map.has(tzid)) {
    map.set(tzid, ++count);
  }
  feature.properties["z"] = map.get(tzid);
}
// write the indexed geojson
fs.writeFileSync("tz_indexed.json", JSON.stringify(geojson));

// grab the index
const index = Array.from(map.keys());
// add international TZIDs (this is needed by the final output file)
index.push(
  "Etc/GMT+12", "Etc/GMT+11", "Etc/GMT+10", "Etc/GMT+9",  "Etc/GMT+8",
  "Etc/GMT+7",  "Etc/GMT+6",  "Etc/GMT+5",  "Etc/GMT+4",  "Etc/GMT+3",
  "Etc/GMT+2",  "Etc/GMT+1",  "Etc/GMT",    "Etc/GMT-1",  "Etc/GMT-2",
  "Etc/GMT-3",  "Etc/GMT-4",  "Etc/GMT-5",  "Etc/GMT-6",  "Etc/GMT-7",
  "Etc/GMT-8",  "Etc/GMT-9",  "Etc/GMT-10", "Etc/GMT-11", "Etc/GMT-12"
);
// write the index
fs.writeFileSync("tz.json", JSON.stringify(index));
