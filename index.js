var cache = require("cache"),
    fs    = require("fs"),
    path  = require("path"),
    time  = require("time"),
    util  = require("util"),
    cacheZones = cache.once(function(callback) {
      return fs.readFile(path.join(__dirname, "tz.json"), function(err, data) {
        if(err)
          return callback(err)

        var zones = JSON.parse(data),
            i     = zones.length,
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

        return callback(null, zones)
      })
    })

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
  lat = Math.round((lat + 90) * 65535 / 180)
  lon = Math.round((lon + 180) * 65535 / 360)

  /* Each timezone has a bounding box, in order to help speed up queries. */
  if(lat < bounds.readUInt16BE(0) ||
     lon < bounds.readUInt16BE(2) ||
     lat > bounds.readUInt16BE(4) ||
     lon > bounds.readUInt16BE(6))
    return false

  var i = polygons.length,
      polygon, inside, lati, loni, j, latj, lonj

  while(i--) {
    polygon = polygons[i]
    inside  = false
    lati    = polygon.readUInt16BE(0)
    loni    = polygon.readUInt16BE(2)
    j       = polygon.length

    while(j) {
      lonj = loni
      loni = polygon.readUInt16BE(j -= 2)
      latj = lati
      lati = polygon.readUInt16BE(j -= 2)

      if(((loni <= lon && lon < lonj) || (lonj <= lon && lon < loni)) &&
         (lat - lati < (latj - lati) * (lon - loni) / (lonj - loni)))
        inside = !inside
    }

    if(inside)
      return true
  }

  return false
}

function getTimezone(lat, lon, callback) {
  return cacheZones(function(err, zones) {
    if(err)
      return callback(err)

    var i = zones.length,
        polygons, bounds, tzid, now

    /* Every timezone has a list of polygons associated with it. If the
     * requested location is inside any of those polygons, then we're in that
     * timezone and should return it. */
    while(i) {
      polygons = zones[--i]
      bounds   = zones[--i]
      tzid     = zones[--i]

      if(pointInZone(lat, lon, bounds, polygons)) {
        now = new time.Date()
        now.setTimezone(tzid)
        return callback(null, util.format(
          "%s (%s, %s)",
          tzid,
          now.getTimezoneAbbr(),
          stringifyOffset(now.getTimezoneOffset())
        ))
      }
    }

    /* If we can't find the place we were looking for, assume (fairly
     * poorly) that we're in international waters and use the relevant IANA code
     * for it.
     * 
     * If the codes seem backwards, it's because they are backwards by design.
     * See also: ftp://ftp.iana.org/tz/data/etcetera */
    switch(Math.round((lon + 180) / 15)) {
      case  0: return callback(null, "Etc/GMT+12 (GMT+12, -1200)")
      case  1: return callback(null, "Etc/GMT+11 (GMT+11, -1100)")
      case  2: return callback(null, "Etc/GMT+10 (GMT+10, -1000)")
      case  3: return callback(null, "Etc/GMT+9 (GMT+9, -0900)")
      case  4: return callback(null, "Etc/GMT+8 (GMT+8, -0800)")
      case  5: return callback(null, "Etc/GMT+7 (GMT+7, -0700)")
      case  6: return callback(null, "Etc/GMT+6 (GMT+6, -0600)")
      case  7: return callback(null, "Etc/GMT+5 (GMT+5, -0500)")
      case  8: return callback(null, "Etc/GMT+4 (GMT+4, -0400)")
      case  9: return callback(null, "Etc/GMT+3 (GMT+3, -0300)")
      case 10: return callback(null, "Etc/GMT+2 (GMT+2, -0200)")
      case 11: return callback(null, "Etc/GMT+1 (GMT+1, -0100)")
      case 12: return callback(null, "Etc/GMT (GMT, +0000)")
      case 13: return callback(null, "Etc/GMT-1 (GMT-1, +0100)")
      case 14: return callback(null, "Etc/GMT-2 (GMT-2, +0200)")
      case 15: return callback(null, "Etc/GMT-3 (GMT-3, +0300)")
      case 16: return callback(null, "Etc/GMT-4 (GMT-4, +0400)")
      case 17: return callback(null, "Etc/GMT-5 (GMT-5, +0500)")
      case 18: return callback(null, "Etc/GMT-6 (GMT-6, +0600)")
      case 19: return callback(null, "Etc/GMT-7 (GMT-7, +0700)")
      case 20: return callback(null, "Etc/GMT-8 (GMT-8, +0800)")
      case 21: return callback(null, "Etc/GMT-9 (GMT-9, +0900)")
      case 22: return callback(null, "Etc/GMT-10 (GMT-10, +1000)")
      case 23: return callback(null, "Etc/GMT-11 (GMT-11, +1100)")
      case 24: return callback(null, "Etc/GMT-12 (GMT-12, +1200)")
    }
  })
}

function getTzidFromString(str) {
  return str.slice(0, str.indexOf(" "))
}

function getOffsetFromString(str) {
  var len        = str.length,
      dir        = 44 - str.charCodeAt(len - 6),
      hourTens   = str.charCodeAt(len - 5) - 48,
      hourOnes   = str.charCodeAt(len - 4) - 48,
      minuteTens = str.charCodeAt(len - 3) - 48,
      minuteOnes = str.charCodeAt(len - 2) - 48

  return dir * (hourTens * 10 + hourOnes + minuteTens / 6 + minuteOnes / 60)
}

function parseTimestamp(timestamp, timezone) {
  var date      = new time.Date(timestamp * 1000, getTzidFromString(timezone)),
      year      = date.getFullYear(),
      month     = date.getMonth(),
      day       = date.getDate(),
      hour      = date.getHours(),
      minute    = date.getMinutes(),
      second    = date.getSeconds(),
      dayOfYear = day

  switch(month) {
    case  0: dayOfYear +=   0; break
    case  1: dayOfYear +=  31; break
    case  2: dayOfYear +=  59; break
    case  3: dayOfYear +=  90; break
    case  4: dayOfYear += 120; break
    case  5: dayOfYear += 151; break
    case  6: dayOfYear += 181; break
    case  7: dayOfYear += 212; break
    case  8: dayOfYear += 243; break
    case  9: dayOfYear += 273; break
    case 10: dayOfYear += 304; break
    case 11: dayOfYear += 334; break
  }

  var secOfYear = second + minute * 60 + hour * 3600 + dayOfYear * 86400

  /* FIXME: The consequences of the above is that Feb 29 is considered the same
   * day as March 1st. Oh well? */

  return {
    year:         year,
    month:        month,
    day:          day,
    hour:         hour,
    minute:       minute,
    second:       second,
    dayOfYear:    dayOfYear,
    hourOfYear:   Math.round(secOfYear / 3600),
    offset:       getOffsetFromString(timezone)
  }
}

function getTimezoneOffset(lat, lon, callback) {
  return getTimezone(lat, lon, function(err, str) {
    if(err)
      return callback(err)

    return callback(null, getOffsetFromString(str))
  })
}

exports.getTimezone         = getTimezone
exports.getOffsetFromString = getOffsetFromString
exports.getTimezoneOffset   = getTimezoneOffset
exports.parseTimestamp      = parseTimestamp
