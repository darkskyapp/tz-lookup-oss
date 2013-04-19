var Geometry;

(function() {
  "use strict";

  Geometry = {
    intersect: {
      line: {
        line: function(line1, line2) {
          /* This is just a fancy hack that tests the winding of the points to
           * determine which side of each line the points are on. */
          var a = line1[2] - line1[0],
              b = line1[3] - line1[1],
              c = line2[2] - line2[0],
              d = line2[3] - line2[1];

          return (
            ((line2[1] - line1[1]) * a > (line2[0] - line1[0]) * b) !==
            ((line2[3] - line1[1]) * a > (line2[2] - line1[0]) * b) &&
            ((line1[1] - line2[1]) * c > (line1[0] - line2[0]) * d) !==
            ((line1[3] - line2[1]) * c > (line1[2] - line2[0]) * d)
          );
        },
        polygon: function(line1, poly2) {
          /* A line intersects a polygon if it intersects any of its lines. */
          var line2 = new Array(4),
              i;

          line2[0] = poly2[0];
          line2[1] = poly2[1];

          for(i = poly2.length; i; ) {
            line2[3] = line2[1];
            line2[2] = line2[0];
            line2[1] = poly2[--i];
            line2[0] = poly2[--i];

            if(Geometry.intersect.line.line(line1, line2))
              return true;
          }

          return false;
        }
      },
      polygon: {
        line: function(poly, line) {
          return Geometry.intersect.line.polygon(line, poly);
        },
        polygon: function(poly1, poly2) {
          /* Two polygons intersect if any of the lines of one of them
           * intersects the other polygon. */
          var line1 = new Array(4),
              i;

          line1[0] = poly1[0];
          line1[1] = poly1[1];

          for(i = poly1.length; i; ) {
            line1[3] = line1[1];
            line1[2] = line1[0];
            line1[1] = poly1[--i];
            line1[0] = poly1[--i];

            if(Geometry.intersect.line.polygon(line1, poly2))
              return true;
          }

          return false;
        }
      }
    },
    overlap: {
      point: {
        polygon: function(point, poly) {
          var inside = false,
              line = new Array(4),
              i = poly.length;

          line[0] = poly[0];
          line[1] = poly[1];

          while(i) {
            line[3] = line[1];
            line[2] = line[0];
            line[1] = poly[--i];
            line[0] = poly[--i];

            if(((line[1] <= point[1] && point[1] < line[3]) ||
                (line[3] <= point[1] && point[1] < line[1])) &&
               ((point[0] - line[0]) < ((line[2] - line[0]) *
                (point[1] - line[1])) / (line[3] - line[1])))
              inside = !inside;
          }

          return inside;
        }
      },
      polygon: {
        point: function(poly, point) {
          return Geometry.overlap.point.polygon(point, poly);
        },
        polygon: function(poly1, poly2) {
          /* Two polygons overlap if they intersect, or if one is wholly
           * contained within the other. (Testing a single point is adequate
           * for determining either of those latter cases.) */
          return Geometry.intersect.polygon.polygon(poly1, poly2) ||
                 Geometry.overlap.point.polygon(poly1, poly2) ||
                 Geometry.overlap.point.polygon(poly2, poly1);
        }
      }
    }
  };
}());

module.exports = Geometry;
