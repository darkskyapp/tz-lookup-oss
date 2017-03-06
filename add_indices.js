"use strict";
const fs = require("fs");

// grab the geojson
const geojson = require("./tz_world_mp");
// sort by TZID
geojson.features.sort((a, b) =>
  a.properties["TZID"].localeCompare(b.properties["TZID"]));
// the last TZID is "uninhabited", which we don't care about
geojson.features.pop();
// add an index property (this is needed by gdal_rasterize)
for(let i = 0;
    i < geojson.features.length;
    geojson.features[i].properties["Z"] = ++i);
// write the indexed geojson
fs.writeFileSync("tz_world_mp_indexed.json", JSON.stringify(geojson));

// grab the index
const index = geojson.features.map(x => x.properties["TZID"]);
// add international TZIDs (this is needed by the final output file)
index.push(
  "Etc/GMT+12", "Etc/GMT+11", "Etc/GMT+10", "Etc/GMT+9",  "Etc/GMT+8",
  "Etc/GMT+7",  "Etc/GMT+6",  "Etc/GMT+5",  "Etc/GMT+4",  "Etc/GMT+3",
  "Etc/GMT+2",  "Etc/GMT+1",  "Etc/GMT",    "Etc/GMT-1",  "Etc/GMT-2",
  "Etc/GMT-3",  "Etc/GMT-4",  "Etc/GMT-5",  "Etc/GMT-6",  "Etc/GMT-7",
  "Etc/GMT-8",  "Etc/GMT-9",  "Etc/GMT-10", "Etc/GMT-11", "Etc/GMT-12"
);
// write the index
fs.writeFileSync("tz_world_index.json", JSON.stringify(index));
