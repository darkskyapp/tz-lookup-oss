var fs    = require("fs"),
    path  = require("path"),
    time  = require("time"),
    util  = require("util"),
    zones = JSON.parse(fs.readFileSync(path.join(__dirname, "tz.json")))

function unpack() {
  var i = zones.length,
      polygons, j, bounds

  while(i) {
    polygons = zones[--i]
    j        = polygons.length
    while(j--)
      polygons[j] = new Buffer(polygons[j], "base64")

    bounds = zones[--i]
    zones[i] = new Buffer(bounds, "base64")

    --i
  }
}

function stringifyOffset(t) {
  var abs = Math.abs(t)

  return String.fromCharCode.apply(null, [
    t > 0 ? 45 : 43,
    48 + Math.floor(abs / 600) % 10,
    48 + Math.floor(abs /  60) % 10,
    48 + Math.floor(abs /  10) %  6,
    48 +            abs        % 10
  ])
}

function pointInZone(lat, lon, bounds, polygons) {
  lat = Math.round(lat * 1000000)
  lon = Math.round(lon * 1000000)

  /* Each timezone has a bounding box, in order to help speed up queries. */
  if(lat < bounds.readInt32BE( 0) ||
     lon < bounds.readInt32BE( 4) ||
     lat > bounds.readInt32BE( 8) ||
     lon > bounds.readInt32BE(12))
    return false

  var i = polygons.length,
      polygon, inside, lati, loni, j, latj, lonj

  while(i--) {
    polygon = polygons[i]
    inside  = false
    lati    = polygon.readInt32BE(0)
    loni    = polygon.readInt32BE(4)
    j       = polygon.length

    while(j) {
      lonj = loni
      loni = polygon.readInt32BE(j -= 4)
      latj = lati
      lati = polygon.readInt32BE(j -= 4)

      if(((loni <= lon && lon < lonj) || (lonj <= lon && lon < loni)) &&
         (lat - lati < (latj - lati) * (lon - loni) / (lonj - loni)))
        inside = !inside
    }

    if(inside)
      return true
  }

  return false
}

function lookup(lat, lon) {
  var i = zones.length,
      polygons, bounds, tzid, now

  /* Every timezone has a list of polygons associated with it. If the requested
   * location is inside any of those polygons, then we're in that timezone and
   * should return it. */
  while(i) {
    polygons = zones[--i]
    bounds   = zones[--i]
    tzid     = zones[--i]

    if(pointInZone(lat, lon, bounds, polygons)) {
      now = new time.Date()
      now.setTimezone(tzid)
      return util.format(
        "%s (%s, %s)",
        tzid,
        now.getTimezoneAbbr(),
        stringifyOffset(now.getTimezoneOffset())
      )
    }
  }

  /* If we can't find the place we were looking for, assume (fairly
   * poorly) that we're in international waters and use the relevant IANA code
   * for it.
   * 
   * If the codes seem backwards, it's because they are backwards by design.
   * See also: ftp://ftp.iana.org/tz/data/etcetera */
  switch(Math.round((lon + 180) / 15)) {
    case  0: return "Etc/GMT+12 (GMT+12, -1200)"
    case  1: return "Etc/GMT+11 (GMT+11, -1100)"
    case  2: return "Etc/GMT+10 (GMT+10, -1000)"
    case  3: return "Etc/GMT+9 (GMT+9, -0900)"
    case  4: return "Etc/GMT+8 (GMT+8, -0800)"
    case  5: return "Etc/GMT+7 (GMT+7, -0700)"
    case  6: return "Etc/GMT+6 (GMT+6, -0600)"
    case  7: return "Etc/GMT+5 (GMT+5, -0500)"
    case  8: return "Etc/GMT+4 (GMT+4, -0400)"
    case  9: return "Etc/GMT+3 (GMT+3, -0300)"
    case 10: return "Etc/GMT+2 (GMT+2, -0200)"
    case 11: return "Etc/GMT+1 (GMT+1, -0100)"
    case 12: return "Etc/GMT (GMT, +0000)"
    case 13: return "Etc/GMT-1 (GMT-1, +0100)"
    case 14: return "Etc/GMT-2 (GMT-2, +0200)"
    case 15: return "Etc/GMT-3 (GMT-3, +0300)"
    case 16: return "Etc/GMT-4 (GMT-4, +0400)"
    case 17: return "Etc/GMT-5 (GMT-5, +0500)"
    case 18: return "Etc/GMT-6 (GMT-6, +0600)"
    case 19: return "Etc/GMT-7 (GMT-7, +0700)"
    case 20: return "Etc/GMT-8 (GMT-8, +0800)"
    case 21: return "Etc/GMT-9 (GMT-9, +0900)"
    case 22: return "Etc/GMT-10 (GMT-10, +1000)"
    case 23: return "Etc/GMT-11 (GMT-11, +1100)"
    case 24: return "Etc/GMT-12 (GMT-12, +1200)"
  }
}

unpack()
module.exports = lookup
