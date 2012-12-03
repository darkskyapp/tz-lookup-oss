var assert   = require("assert"),
    util     = require("util"),
    tzLookup = require("./")

function check(lat, lon, tzid, offset1, offset2) {
  it(
    util.format("should give the right tzid and offset for %d,%d", lat, lon),
    function(done) {
      return tzLookup(lat, lon, function(err, tz) {
        if(err)
          return done(err)

        assert.ok(tz.hasOwnProperty("tzid"), "expected object to have property \"tzid\"")
        assert.ok(tz.hasOwnProperty("offset"), "expected object to have property \"offset\"")

        assert.equal(tzid, tz.tzid)

        if(offset2)
          assert(
            tz.offset === offset1 || tz.offset === offset2,
            util.format(
              "expected %d to equal either %d or %d",
              tz.offset,
              offset1,
              offset2
            )
          )

        else
          assert.equal(tz.offset, offset1)

        done()
      })
    }
  )
}

describe("tz", function() {
  check( 40.7092, -74.01506,             "America/New_York",  -5, -4)
  check( 42.3668, -71.05459,             "America/New_York",  -5, -4)
  check( 41.8976, -87.62052,              "America/Chicago",  -6, -5)
  check( 47.6897, -122.4023,          "America/Los_Angeles",  -8, -7)
  check( 42.7235,  -73.6931,             "America/New_York",  -5, -4)
  check( 42.5807,  -83.0223,              "America/Detroit",  -5, -4)
  check( 36.8381,  -84.8500,  "America/Kentucky/Monticello",  -5, -4)
  check( 40.1674,  -85.3583, "America/Indiana/Indianapolis",  -5, -4)
  check( 37.9643,  -86.7453,    "America/Indiana/Tell_City",  -6, -5)
  check( 38.6043,  -90.2417,              "America/Chicago",  -6, -5)
  check( 41.1591, -104.8261,               "America/Denver",  -7, -6)
  check( 35.1991, -111.6348,              "America/Phoenix",  -7)
  check( 43.1432, -115.6750,                "America/Boise",  -7, -6)
  check( 47.5886, -122.3382,          "America/Los_Angeles",  -8, -7)
  check( 58.3168, -134.4397,               "America/Juneau",  -9, -8)
  check( 21.4381, -158.0493,             "Pacific/Honolulu", -10)
  check( 42.7000,  -80.0000,                    "Etc/GMT+5",  -5)
  check( 51.0036, -114.0161,             "America/Edmonton",  -7, -6)
  check(-16.4965,  -68.1702,               "America/La_Paz",  -4)
  check(-31.9369, 115.84534,              "Australia/Perth",   8)
})
