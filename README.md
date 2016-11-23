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

    > var tz = require("tz-lookup");
    > console.log(tz(42.7235, -73.6931));
    "America/New_York"

**Please take note of the following:**

*   The exported function call will throw an error if the latitude or longitude
    provided are NaN or out of bounds. Otherwise, it will never throw an error
    and will always return an IANA timezone database string. (Barring bugs.)
*   The exported function call is synchronous. Previous versions of this module
    were asynchronous, due to the timezone database being too large to
    conveniently fit in memory. Thanks to very careful data compression, this
    is no longer the case.
*   The timezones returned by this module are approximate: since the timezone
    database is so large, lossy compression is necessary for fast lookups. In
    particular, the compression used may be of insufficient resolution for
    several very small timezones (such as Europe/Vatican) and favors country
    timezones over GMT offsets (and so may exaggerate the distance of
    territorial waters). However, the level of accuracy should be adequate for
    most purposes. (For example, this module is used by the [Dark Sky API][1]
    for global timezone lookups.)

If you find a real-world case where this module's accuracy is inadequate,
please open an issue (or, better yet, submit a pull request with a failing
test) and I'll see what I can do to increase the accuracy for you.

Sources
-------

Timezone data is from Eric Muller's excellent [TZ timezone maps][2]. To
regenerate the compressed database, simply run `rebuild.sh`. The timezone
database was last updated on 28 May 2016.

[1]: https://darksky.net/dev/
[2]: http://efele.net/maps/tz/

License
-------

To the extend possible by law, The Dark Sky Company, LLC has [waived all
copyright and related or neighboring rights][cc0] to this library.

[cc0]: http://creativecommons.org/publicdomain/zero/1.0/
