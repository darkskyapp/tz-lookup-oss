tz-lookup
=========

This is a little module that allows you to look up the current time zone of a
location, given it's latitude and longitude. I wrote it because the existing
Node module that does this (`tzwhere`) was far too slow to be useful in a
production setting. This module attempts to ameliorate that.

Usage
-----

To install:

    npm install tz-lookup

To use:

    > var tzLookup = require("tz-lookup");
    > tzLookup(42.7235, -73.6931, function(err, tz) {
    >   console.log(tz);
    > });
    "America/New_York"

Previous versions of this module have experimented with a half-dozen different
mechanisms for storing the timezone data on disk. The current version uses a
single binary data file that essentially acts as a giant compressed bitmap,
storing a timezone for each pixel on the globe. This is not perfectly accurate
(since the source data is vector), but is very quick and easy to read from and
ought to be more than accurate enough for most use-cases.
