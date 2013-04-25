describe("tz-lookup", function() {
  var lookup = require("../");

  function test(lat, lon, tzid) {
    it("should return \"" + tzid + "\" given " + lat + "," + lon, function(done) {
      lookup(lat, lon, function(err, timezone) {
        expect(err).toBe(null);
        expect(timezone).toBe(tzid);
        done();
      });
    });
  }

  test( 40.7092, -74.01506,             "America/New_York")
  test( 42.3668, -71.05459,             "America/New_York")
  test( 41.8976, -87.62052,              "America/Chicago")
  test( 47.6897, -122.4023,          "America/Los_Angeles")
  test( 42.7235,  -73.6931,             "America/New_York")
  test( 42.5807,  -83.0223,              "America/Detroit")
  test( 36.8381,  -84.8500,  "America/Kentucky/Monticello")
  test( 40.1674,  -85.3583, "America/Indiana/Indianapolis")
  test( 37.9643,  -86.7453,    "America/Indiana/Tell_City")
  test( 38.6043,  -90.2417,              "America/Chicago")
  test( 41.1591, -104.8261,               "America/Denver")
  test( 35.1991, -111.6348,              "America/Phoenix")
  test( 43.1432, -115.6750,                "America/Boise")
  test( 47.5886, -122.3382,          "America/Los_Angeles")
  test( 58.3168, -134.4397,               "America/Juneau")
  test( 21.4381, -158.0493,             "Pacific/Honolulu")
  test( 42.7000,  -80.0000,                    "Etc/GMT+5")
  test( 51.0036, -114.0161,             "America/Edmonton")
  test(-16.4965,  -68.1702,               "America/La_Paz")
  test(-31.9369, 115.84534,              "Australia/Perth")
});
