tz
==

This is a little module that allows you to look up the current time zone of a
location, given it's latitude and longitude. I wrote it because the existing
Node module that does this (`tzwhere`) was far too slow to be useful in a
production setting. This module attempts to ameliorate that.

Usage
-----

    > var tz = require("tz")
    > tz(42.7235, -73.6931)
    "America/New_York (EDT, -0400)"

On my machine, `require` takes 900ms, while a timezone lookup takes about 35ms.
These are adequate but can be further improved.
