tz-lookup
=========
This is a little Javascript library that allows you to look up the time zone of
a location given its latitude and longitude. It works in both the browser and
in Node.JS, and is very fast and lightweight (~121KB) given what it does. We
use it in production for [The Dark Sky API][1].

[1]: https://darksky.net/dev/

Usage
-----
To install:

    npm install tz-lookup

Node.JS usage:

```javascript
var tzlookup = require("tz-lookup");
console.log(tzlookup(42.7235, -73.6931)); // prints "America/New_York"
```

Browser usage:

```html
<script src="tz.js"></script>
<script>
alert(tzlookup(42.7235, -73.6931)); // alerts "America/New_York"
</script>
```

**Please take note of the following:**

*   The exported function call will throw an error if the latitude or longitude
    provided are NaN or out of bounds. Otherwise, it will never throw an error
    and will always return an IANA timezone database string. (Barring bugs.)

*   The timezones returned by this module are approximate: since the timezone
    database is so large, lossy compression is necessary for a small footprint
    and fast lookups. Expect errors near timezone borders far away from
    populated areas. However, for most use-cases, this module's accuracy should
    be adequate.
    
    If you find a real-world case where this module's accuracy is inadequate,
    please open an issue (or, better yet, submit a pull request with a failing
    test) and I'll see what I can do to increase the accuracy for you.

Sources
-------
Versions prior to 6.0.7 used timezone data from Eric Muller's excellent [TZ
timezone maps][2]. As of 6.0.7, we now use timezone data from @evansiroky's
also-excellent [timezone-boundary-builder][3]. To regenerate the library,
simply run `rebuild.sh`. The timezone database was last updated on 11 Apr 2018.

[2]: http://efele.net/maps/tz/
[3]: https://github.com/evansiroky/timezone-boundary-builder/

License
-------
To the extent possible by law, The Dark Sky Company, LLC has [waived all
copyright and related or neighboring rights][cc0] to this library.

[cc0]: http://creativecommons.org/publicdomain/zero/1.0/
