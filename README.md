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

    > var tzLookup = require("tz-lookup")
    > tzLookup(42.7235, -73.6931, function(err, tz) {
    >   console.log(tz)
    > })
    "America/New_York"

The data file is only loaded on-demand, so the first call to `tzLookup()`
will take a while, but subsequent calls will go quite quickly.
