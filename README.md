tz
==

This is a little module that allows you to look up the current time zone of a
location, given it's latitude and longitude. I wrote it because the existing
Node module that does this (`tzwhere`) was far too slow to be useful in a
production setting. This module attempts to ameliorate that.

Usage
-----

    > var tz = require("tz")
    > tz.getTimezone(42.7235, -73.6931, function(err, string) {
    >   console.log(string)
    > })
    "America/New_York (EDT, -0400)"

The data file is only loaded on-demand, so the first call to `getTimezone()`
will take a while, but subsequent calls will go quite quickly.

If you only want the offset (in hours), you may call the similar method
`getTimezoneOffset()`. Same arguments, different return value.
