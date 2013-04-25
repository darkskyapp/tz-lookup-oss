describe("tz-lookup", function() {
  var lookup = require("../");

  function test(lat, lon, tzid) {
    it("should return \"" + tzid + "\" given " + lat + "," + lon, function(done) {
      lookup(lat, lon, function(err, timezone) {
        if(err)
          return done(err);

        expect(timezone).toBe(tzid);
        done();
      });
    });
  }

  /* These tests are hand-crafted. */
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

  /* These are automatically-generated fuzz-tests from v1. */
  test(74.157, 171.054, "Etc/GMT-11");
  test(36.3416, -175.968, "Etc/GMT+12");
  test(-76.7597, 23.0093, "Etc/GMT-2");
  test(65.2171, -39.1875, "Etc/GMT+3");
  test(37.8358, -89.0556, "America/Chicago");
  test(6.5049, 132.8593, "Etc/GMT-9");
  test(-33.8291, -126.4846, "Etc/GMT+8");
  test(-2.2708, 86.1435, "Etc/GMT-6");
  test(86.5338, -42.8766, "Etc/GMT+3");
  test(-35.6196, 152.2317, "Etc/GMT-10");
  test(-59.0195, -121.6858, "Etc/GMT+8");
  test(-29.3372, -56.9745, "America/Argentina/Cordoba");
  test(82.3141, -39.1331, "America/Godthab");
  test(-21.9487, 163.8989, "Etc/GMT-11");
  test(-24.5366, -115.1085, "Etc/GMT+8");
  test(-50.8611, -67.6471, "Etc/GMT+5");
  test(3.4135, 71.854, "Etc/GMT-5");
  test(35.3462, -2.0428, "Etc/GMT");
  test(54.1241, 95.1606, "Asia/Krasnoyarsk");
  test(6.957, -78.8378, "Etc/GMT+5");
  test(-80.4809, -74.3079, "Etc/GMT+5");
  test(37.6926, 153.9764, "Etc/GMT-10");
  test(-45.2262, -154.6239, "Etc/GMT+10");
  test(61.1369, -25.1156, "Etc/GMT+2");
  test(35.897, 105.0863, "Asia/Chongqing");
  test(-84.2731, 90.5347, "Etc/GMT-6");
  test(-57.6384, -104.8362, "Etc/GMT+7");
  test(77.6074, 87.3492, "Etc/GMT-6");
  test(-86.2052, 174.8244, "Etc/GMT-12");
  test(-70.1543, -86.0921, "Etc/GMT+6");
  test(38.2739, -123.5385, "Etc/GMT+8");
  test(74.6556, 17.2644, "Etc/GMT-1");
  test(-3.6445, 24.5964, "Africa/Lubumbashi");
  test(21.92, 76.3888, "Asia/Kolkata");
  test(81.0433, -78.2488, "America/Iqaluit");
  test(76.2269, 135.039, "Etc/GMT-9");
  test(-25.3943, 173.9764, "Etc/GMT-12");
  test(78.5923, 140.9452, "Etc/GMT-9");
  test(-88.5266, 49.3084, "Etc/GMT-3");
  test(-53.9534, -129.8685, "Etc/GMT+9");
  test(-57.4418, 70.4723, "Etc/GMT-5");
  test(-70.4054, 88.0473, "Etc/GMT-6");
  test(4.9429, 125.6684, "Etc/GMT-8");
  test(41.4793, -2.7493, "Europe/Madrid");
  test(-12.6669, 56.2598, "Etc/GMT-4");
  test(60.725, -126.4046, "America/Whitehorse");
  test(27.955, -119.2723, "Etc/GMT+8");
  test(-55.109, -25.8169, "Etc/GMT+2");
  test(-63.4157, 161.6944, "Etc/GMT-11");
  test(27.1595, -20.4821, "Etc/GMT+1");
  test(11.9399, 2.3295, "Africa/Ouagadougou");
  test(-61.7108, 97.3103, "Etc/GMT-6");
  test(8.8483, 65.6012, "Etc/GMT-4");
  test(82.4238, -153.8071, "Etc/GMT+10");
  test(16.5041, 103.0204, "Asia/Bangkok");
  test(14.8329, -138.9238, "Etc/GMT+9");
  test(-25.1415, -10.2559, "Etc/GMT+1");
  test(81.6672, 64.5991, "Etc/GMT-4");
  test(-76.4906, 79.6078, "Etc/GMT-5");
  test(72.8356, -6.87, "Etc/GMT");
  test(1.9915, -15.7714, "Etc/GMT+1");
  test(72.475, -122.6775, "America/Yellowknife");
  test(-80.0271, 97.5079, "Etc/GMT-7");
  test(-78.4514, -46.9126, "Etc/GMT+3");
  test(4.8627, -154.9894, "Etc/GMT+10");
  test(-20.3063, -36.6612, "Etc/GMT+2");
  test(64.9576, 144.3597, "Asia/Magadan");
  test(65.7747, -4.2121, "Etc/GMT");
  test(4.484, -163.9921, "Etc/GMT+11");
  test(82.9728, -1.6901, "Etc/GMT");
  test(-72.0376, 85.8574, "Etc/GMT-6");
  test(-67.9902, 85.702, "Etc/GMT-6");
  test(9.3271, -128.6898, "Etc/GMT+9");
  test(88.2995, 103.0078, "Etc/GMT-7");
  test(84.2291, 94.3143, "Etc/GMT-6");
  test(-66.9471, 63.9549, "Etc/GMT-4");
  test(27.0518, 107.9761, "Asia/Chongqing");
  test(-33.3861, -100.8942, "Etc/GMT+7");
  test(20.2716, 28.7996, "Africa/Khartoum");
  test(-18.6123, 137.446, "Australia/Darwin");
  test(57.0724, 104.8747, "Asia/Irkutsk");
  test(30.4075, 113.4049, "Asia/Shanghai");
  test(-53.8292, -140.3125, "Etc/GMT+9");
  test(67.9909, 164.1215, "Asia/Anadyr");
  test(7.2369, 162.8976, "Etc/GMT-11");
  test(86.4356, -7.7277, "Etc/GMT+1");
  test(-69.7742, 98.2968, "Etc/GMT-7");
  test(-81.1398, -100.9004, "Etc/GMT+7");
  test(-66.2857, -158.7325, "Etc/GMT+11");
  test(77.6378, -117.8879, "Etc/GMT+8");
  test(30.7623, -84.098, "America/New_York");
  test(-81.2185, 44.1502, "Etc/GMT-3");
  test(80.4489, -99.0211, "Etc/GMT+7");
  test(-35.2499, 106.777, "Etc/GMT-7");
  test(-27.7215, 155.3404, "Etc/GMT-10");
  test(-13.1575, -157.7665, "Etc/GMT+11");
  test(5.5659, -28.0091, "Etc/GMT+2");
  test(89.0215, 110.073, "Etc/GMT-7");
  test(-48.3466, 114.9363, "Etc/GMT-8");
  test(15.8368, -17.0156, "Etc/GMT+1");
  test(1.9845, 100.4508, "Asia/Jakarta");
  test(8.1223, -90.2728, "Etc/GMT+6");
  test(-58.8423, -56.6807, "Etc/GMT+4");
  test(-63.6216, -19.446, "Etc/GMT+1");
  test(69.3563, -39.2451, "America/Godthab");
  test(-19.5808, 3.5552, "Etc/GMT");
  test(-79.3043, 40.093, "Etc/GMT-3");
  test(16.1784, 106.2894, "Asia/Vientiane");
  test(-0.3317, -152.6356, "Etc/GMT+10");
  test(84.9549, -113.4098, "Etc/GMT+8");
  test(22.1635, -84.3358, "America/Havana");
  test(-43.1612, -80.4872, "Etc/GMT+5");
  test(-6.0676, 148.7402, "Etc/GMT-10");
  test(65.914, -70.596, "America/Iqaluit");
  test(-49.1463, -2.9151, "Etc/GMT");
  test(-47.1088, 9.6141, "Etc/GMT-1");
  test(82.5071, -2.3855, "Etc/GMT");
  test(-13.4519, -133.6416, "Etc/GMT+9");
  test(-51.532, 172.5579, "Etc/GMT-12");
  test(69.8885, -107.6005, "America/Cambridge_Bay");
  test(57.6372, -32.6427, "Etc/GMT+2");
  test(82.2254, -177.5415, "Etc/GMT+12");
  test(76.4427, -106.3772, "Etc/GMT+7");
  test(52.0299, 175.3019, "Etc/GMT-12");
  test(-3.8484, 61.2497, "Etc/GMT-4");
  test(11.307, -141.2751, "Etc/GMT+9");
  test(74.5179, -114.827, "Etc/GMT+8");
  test(-88.008, 0.2568, "Etc/GMT");
  test(39.2287, 32.3653, "Europe/Istanbul");
  test(-38.0034, -162.746, "Etc/GMT+11");
  test(65.9913, 43.2401, "Europe/Moscow");
  test(-81.2278, 84.8423, "Etc/GMT-6");
  test(-77.3309, 4.9714, "Etc/GMT");
  test(-40.3323, -92.7225, "Etc/GMT+6");
  test(-71.4413, 53.977, "Etc/GMT-4");
  test(-81.5634, -176.7552, "Etc/GMT+12");
  test(-31.3366, -57.4872, "America/Montevideo");
  test(-65.9989, -108.7203, "Etc/GMT+7");
  test(-29.738, 4.2692, "Etc/GMT");
  test(67.7696, 158.2245, "Asia/Magadan");
  test(-13.0738, -174.7293, "Etc/GMT+12");
  test(83.3732, -1.8287, "Etc/GMT");
  test(-16.3976, -144.6824, "Etc/GMT+10");
  test(-78.8881, 155.5862, "Etc/GMT-10");
  test(56.794, -134.439, "Etc/GMT+9");
  test(-71.8503, -86.6314, "Etc/GMT+6");
  test(18.7113, 173.7809, "Etc/GMT-12");
  test(-30.2745, 127.9174, "Australia/Perth");
  test(-9.6156, 34.1749, "Africa/Blantyre");
  test(-88.9531, -138.8994, "Etc/GMT+9");
  test(64.4928, -101.4695, "America/Rankin_Inlet");
  test(-13.629, 59.262, "Etc/GMT-4");
  test(65.8424, -52.6658, "America/Godthab");
  test(-51.9663, 87.9671, "Etc/GMT-6");
  test(6.8921, 83.8461, "Etc/GMT-6");
  test(-73.8085, -177.5977, "Etc/GMT+12");
  test(14.5729, -115.0088, "Etc/GMT+8");
  test(38.8582, -78.975, "America/New_York");
  test(-39.3399, 10.6452, "Etc/GMT-1");
  test(-16.7013, 117.9878, "Etc/GMT-8");
  test(-27.8742, 146.6473, "Australia/Brisbane");
  test(45.9379, 62.7043, "Asia/Qyzylorda");
  test(48.2383, -159.1924, "Etc/GMT+11");
  test(35.3628, -60.7545, "Etc/GMT+4");
  test(59.8003, -13.8458, "Etc/GMT+1");
  test(73.6374, 134.6288, "Etc/GMT-9");
  test(64.3534, 73.2775, "Asia/Yekaterinburg");
  test(-12.3055, -146.88, "Etc/GMT+10");
  test(-60.1624, 106.6697, "Etc/GMT-7");
  test(-20.2119, 10.0562, "Etc/GMT-1");
  test(-64.1778, 145.8386, "Etc/GMT-10");
  test(15.1007, -159.4022, "Etc/GMT+11");
  test(29.9944, -99.8165, "America/Chicago");
  test(-8.2125, 89.5989, "Etc/GMT-6");
  test(29.1503, 23.8957, "Africa/Tripoli");
  test(54.5334, 92.8278, "Asia/Krasnoyarsk");
  test(86.6541, 82.8372, "Etc/GMT-6");
  test(-45.9957, -25.9533, "Etc/GMT+2");
  test(-39.9171, -148.8372, "Etc/GMT+10");
  test(-13.6129, 125.3901, "Etc/GMT-8");
  test(-27.8954, -126.858, "Etc/GMT+8");
  test(89.4163, 3.7988, "Etc/GMT");
  test(82.7445, -170.2694, "Etc/GMT+11");
  test(-86.5501, 171.9342, "Etc/GMT-11");
  test(-62.075, -159.4421, "Etc/GMT+11");
  test(87.1261, 98.0827, "Etc/GMT-7");
  test(52.1224, -162.3992, "Etc/GMT+11");
  test(-57.4654, -144.8221, "Etc/GMT+10");
  test(69.5362, 20.2982, "Etc/GMT-1");
  test(43.6327, -10.6603, "Etc/GMT+1");
  test(-67.8373, 143.8463, "Etc/GMT-10");
  test(64.979, -41.9666, "America/Godthab");
  test(-56.5021, 102.1402, "Etc/GMT-7");
  test(59.3773, 175.4929, "Etc/GMT-12");
  test(-42.5784, -150.5788, "Etc/GMT+10");
  test(27.3021, 169.0382, "Etc/GMT-11");
  test(-17.2287, 33.9961, "Africa/Maputo");
  test(-10.6583, -153.0405, "Etc/GMT+10");
  test(68.3552, -149.0941, "America/Anchorage");
  test(-81.2129, -70.0119, "Etc/GMT+5");
  test(-6.0114, 170.2811, "Etc/GMT-11");
  test(34.085, -57.8134, "Etc/GMT+4");
  test(40.8713, 86.7712, "Asia/Urumqi");
  test(58.9104, -108.2242, "America/Regina");
  test(-71.8162, -139.1676, "Etc/GMT+9");
  test(7.7575, -26.1777, "Etc/GMT+2");
  test(-62.3068, -43.796, "Etc/GMT+3");
  test(-60.8906, -80.1729, "Etc/GMT+5");
  test(-81.9434, 148.7109, "Etc/GMT-10");
  test(49.6877, -130.0361, "Etc/GMT+9");
  test(-19.5458, -174.5469, "Etc/GMT+12");
  test(63.9166, 56.0705, "Europe/Moscow");
  test(-55.2495, -171.1726, "Etc/GMT+11");
  test(54.7639, 41.9429, "Europe/Moscow");
  test(-17.0228, -164.8056, "Etc/GMT+11");
  test(46.4048, -139.8344, "Etc/GMT+9");
  test(-67.0837, 87.6011, "Etc/GMT-6");
  test(-49.9741, -23.5196, "Etc/GMT+2");
  test(-74.8532, -178.9206, "Etc/GMT+12");
  test(-74.4876, -148.6521, "Etc/GMT+10");
  test(22.4928, 90.6222, "Etc/GMT-6");
  test(-27.8884, -126.1386, "Etc/GMT+8");
  test(47.8301, -138.8469, "Etc/GMT+9");
  test(-10.1766, 83.71, "Etc/GMT-6");
  test(81.8413, -73.2339, "America/Iqaluit");
  test(-18.2133, -165.2913, "Etc/GMT+11");
  test(51.0044, -168.515, "Etc/GMT+11");
  test(-11.4386, -93.9416, "Etc/GMT+6");
  test(21.5364, -40.3214, "Etc/GMT+3");
  test(-2.1921, 10.6367, "Africa/Libreville");
  test(9.5718, -83.1948, "America/Costa_Rica");
  test(1.7651, 49.223, "Etc/GMT-3");
  test(83.034, 70.0193, "Etc/GMT-5");
  test(11.9618, -71.7086, "America/Bogota");
  test(9.3237, -99.9586, "Etc/GMT+7");
  test(-51.7204, 144.8009, "Etc/GMT-10");
  test(-70.4944, 133.5942, "Etc/GMT-9");
  test(81.9516, -9.3576, "Etc/GMT+1");
  test(0.0683, -42.2255, "Etc/GMT+3");
  test(-18.7081, -168.5762, "Etc/GMT+11");
  test(3.5566, 147.8802, "Etc/GMT-10");
  test(80.8597, -77.3047, "Etc/GMT+5");
  test(65.5352, 74.4143, "Asia/Yekaterinburg");
  test(73.387, 74.9842, "Etc/GMT-5");
  test(-43.3577, -102.7139, "Etc/GMT+7");
  test(50.5575, -93.9996, "America/Winnipeg");
  test(84.9867, -50.2065, "Etc/GMT+3");
  test(-88.1843, 57.8031, "Etc/GMT-4");
  test(-85.9571, -46.276, "Etc/GMT+3");
  test(-59.7937, 120.682, "Etc/GMT-8");
  test(-37.4311, 18.941, "Etc/GMT-1");
  test(-74.8911, 42.0323, "Etc/GMT-3");
  test(51.674, 157.0986, "Asia/Kamchatka");
  test(46.7376, 142.8907, "Asia/Sakhalin");
  test(-54.2821, 72.009, "Etc/GMT-5");
  test(73.7638, -138.824, "Etc/GMT+9");
});
