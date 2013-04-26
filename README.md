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

There are two data files: a small index file (which is loaded on the first call
to `tzLookup()`) and larger polygon files on disk that are loaded as needed,
and then discarded. Performance of any given query will vary depending on its
location on the globe, but should be generally high in any case.

Previous versions of this module stored the entire timezone database in RAM.
This was inefficient for many use-cases and is no longer done. RAM usage from
this module should generally be low.

Regenerating the Database
-------------------------

If you wish to regenerate the database, replace `data/tz_world.json` with a new
version, and run `bin/convert`. This will update the backing data that this
module uses.

`tz_world.json` should, itself, be a GeoJSON of the global data found on this
website: [http://efele.net/maps/tz/](http://efele.net/maps/tz/) It was last
updated by us in December 2012.
