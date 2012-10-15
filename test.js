var assert = require("assert"),
    util   = require("util"),
    tz     = require("./")

function check(lat, lon, opt1, opt2, offset1, offset2) {
  it(
    util.format("should give the right timezone string for %d,%d", lat, lon),
    function(done) {
      return tz.getTimezone(lat, lon, function(err, str) {
        if(err)
          return done(err)

        if(opt2) {
          assert(
            str === opt1 || str === opt2,
            util.format(
              "expected \"%s\" to equal \"%s\" or \"%s\"",
              str,
              opt1,
              opt2
            )
          )
        }

        else {
          assert.equal(str, opt1)
        }

        var offset = tz.getOffsetFromString(str)

        if(offset2) {
          assert(
            offset === offset1 || offset === offset2,
            util.format(
              "expected \"%s\" to equal \"%s\" or \"%s\"",
              offset,
              offset1,
              offset2
            )
          )
        }

        else {
          assert.equal(offset, offset1)
        }

        done()
      })
    }
  )

  it(
    util.format("should give the right timezone offset for %d,%d", lat, lon),
    function(done) {
      return tz.getTimezoneOffset(lat, lon, function(err, offset) {
        if(err)
          return done(err)

        if(offset2) {
          assert(
            offset === offset1 || offset === offset2,
            util.format(
              "expected \"%s\" to equal \"%s\" or \"%s\"",
              offset,
              offset1,
              offset2
            )
          )
        }

        else {
          assert.equal(offset, offset1)
        }

        done()
      })
    }
  )
}

describe("tz", function() {
  check(40.709176, -74.015064, "America/New_York (EST, -0500)", "America/New_York (EDT, -0400)", -5, -4)
  check(42.366822, -71.054592, "America/New_York (EST, -0500)", "America/New_York (EDT, -0400)", -5, -4)
  check(41.89763, -87.620516, "America/Chicago (CST, -0600)", "America/Chicago (CDT, -0500)", -6, -5)
  check(47.689697,-122.40234, "America/Los_Angeles (PST, -0800)", "America/Los_Angeles (PDT, -0700)", -8, -7)
  check(42.7235,  -73.6931, "America/New_York (EST, -0500)", "America/New_York (EDT, -0400)", -5, -4)
  check(42.5807,  -83.0223, "America/Detroit (EST, -0500)", "America/Detroit (EDT, -0400)", -5, -4)
  check(36.8381,  -84.8500, "America/Kentucky/Monticello (EST, -0500)", "America/Kentucky/Monticello (EDT, -0400)", -5, -4)
  check(40.1674,  -85.3583, "America/Indiana/Indianapolis (EST, -0500)", "America/Indiana/Indianapolis (EDT, -0400)", -5, -4)
  check(37.9643,  -86.7453, "America/Indiana/Tell_City (CST, -0600)", "America/Indiana/Tell_City (CDT, -0500)", -6, -5)
  check(38.6043,  -90.2417, "America/Chicago (CST, -0600)", "America/Chicago (CDT, -0500)", -6, -5)
  check(41.1591, -104.8261, "America/Denver (MST, -0700)", "America/Denver (MDT, -0600)", -7, -6)
  check(35.1991, -111.6348, "America/Phoenix (MST, -0700)", null, -7)
  check(43.1432, -115.6750, "America/Boise (MST, -0700)", "America/Boise (MDT, -0600)", -7, -6)
  check(47.5886, -122.3382, "America/Los_Angeles (PST, -0800)", "America/Los_Angeles (PDT, -0700)", -8, -7)
  check(58.3168, -134.4397, "America/Juneau (AKST, -0700)", "America/Juneau (AKDT, -0800)", -7, -8)
  check(21.4381, -158.0493, "Pacific/Honolulu (HST, -1000)", null, -10)
  check(42.7000,  -80.0000, "Etc/GMT+5 (GMT+5, -0500)", null, -5)
  check(51.003616, -114.016113, "America/Edmonton (MST, -0700)", "America/Edmonton (MDT, -0600)", -7, -6)
  check(-16.49649, -68.170166, "America/La_Paz (BOT, -0400)", null, -4)
  check(-31.936935, 115.845337, "Australia/Perth (WST, +0800)", null, 8)

  describe("parseTimestamp", function() {
    it("should return an object given a timezone and a unix timestamp", function() {
      assert.deepEqual(
        tz.parseTimestamp(1350319948, "America/New_York (EDT, -0400)"),
        {
          year:       2012,
          month:         9,
          day:          15,
          hour:         12,
          minute:       52,
          second:       28,
          dayOfYear:   288,
          hourOfYear: 6925,
          offset:       -4
        }
      )
    })
  })
})
