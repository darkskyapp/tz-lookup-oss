var Geometry;

(function() {
  "use strict";

  function intersectionPoint(a, b) {
    var px = a[0] - a[2],
        py = a[1] - a[3],
        qx = b[0] - b[2],
        qy = b[1] - b[3],
        n1 = a[0] * a[3] - a[1] * a[2],
        n2 = b[0] * b[3] - b[1] * b[2], 
        n3 = 1.0 / (px * qy - py * qx);

    return [(n1 * qx - n2 * px) * n3, (n1 * qy - n2 * py) * n3];
  }

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
    convert: {
      point: {
        box: function(point) {
          return [point[0], point[1], point[0], point[1]];
        }
      },
      line: {
        box: function(line) {
          return [
            Math.min(line[0], line[2]),
            Math.min(line[1], line[3]),
            Math.max(line[0], line[2]),
            Math.max(line[1], line[3])
          ];
        }
      },
      box: {
        polygon: function(box) {
          return [
            box[0], box[1],
            box[2], box[1],
            box[2], box[3],
            box[0], box[3]
          ];
        }
      },
      polygon: {
        box: function(poly) {
          var box = [
                Number.POSITIVE_INFINITY,
                Number.POSITIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
                Number.NEGATIVE_INFINITY
              ],
              i   = poly.length;

          while(i) {
            i -= 2;

            if(poly[i    ] < box[0]) box[0] = poly[i    ];
            if(poly[i + 1] < box[1]) box[1] = poly[i + 1];
            if(poly[i    ] > box[2]) box[2] = poly[i    ];
            if(poly[i + 1] > box[3]) box[3] = poly[i + 1];
          }

          return box;
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
      box: {
        box: function(box1, box2) {
          return box1[0] <= box2[2] && box1[1] <= box2[3] &&
                 box1[2] >= box2[0] && box1[3] >= box2[1];
        },
        polygon: function(box, poly) {
          return Geometry.overlap.polygon.polygon(
            Geometry.convert.box.polygon(box),
            poly
          );
        }
      },
      polygon: {
        point: function(poly, point) {
          return Geometry.overlap.point.polygon(point, poly);
        },
        box: function(poly, box) {
          return Geometry.overlap.polygon.polygon(
            poly,
            Geometry.convert.box.polygon(box)
          );
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
    },
    length: {
      line: function(line) {
        var x = line[2] - line[0],
            y = line[3] - line[1];

        return Math.sqrt(x * x + y * y);
      }
    },
    reverse: {
      line: function(line) {
        return [line[2], line[3], line[0], line[1]];
      },
      polygon: function(poly) {
        var i = poly.length,
            j = 0,
            copy = new Array(i);

        while(i) {
          i -= 2;

          copy[j    ] = poly[i    ];
          copy[j + 1] = poly[i + 1];

          j += 2;
        }

        return copy;
      }
    },
    remove: {
      polygon: {
        polygon: function(poly, hole) {
          if(Geometry.intersect.polygon.polygon(poly, hole))
            throw new Error("A polygon and it's hole cannot intersect.");

          var line = new Array(4),
              a    = -1,
              b    = -1,
              min  = Number.POSITIVE_INFINITY,
              i, j, dist;

          for(i = poly.length; i; ) {
            line[1] = poly[--i];
            line[0] = poly[--i];

            for(j = hole.length; j; ) {
              line[3] = hole[--j];
              line[2] = hole[--j];
              dist = Geometry.length.line(line);

              /* FIXME: This might have to be more clever, as the line probably
               * does intersect each polygon at the originating point. We
               * really just want to check it against every line on the two
               * polygons that doesn't share a vertex. */
              if(dist < min &&
                 !Geometry.intersect.line.polygon(line, poly) &&
                 !Geometry.intersect.line.polygon(line, hole)) {
                a = i;
                b = j;
                min = dist;
              }
            }
          }

          if(a === -1 || b === -1)
            throw new Error("Cannot remove hole from polygon.");

          /* Reorient the hole so that it's relevant point is at the start. */
          hole = b === 0 ? hole.slice(b) :
                           hole.slice(b).concat(hole.slice(0, b));

          /* Copy that relevant point onto the end. */
          hole.push(hole[0], hole[1]);

          /* Reverse the direction of the hole. */
          Geometry.reverse.polygon(hole);

          /* Finally, return the polygon up through the relevant point, then
           * the hole, then polygon starting at the relevant point (making sure
           * that the polygon's relevant point is on both sides of the hole). */
          return poly.slice(0, a + 2).concat(hole).concat(poly.slice(a));
        }
      }
    },
    clip: {
      polygon: {
        polygon: function(subj, clip) {
          var a = new Array(4),
              b = new Array(4),
              curr = undefined,
              next = subj,
              i, j, m, n;

          a[2] = clip[clip.length - 2];
          a[3] = clip[clip.length - 1];

          for(i = 0; i !== clip.length; i += 2) {
            a[0] = a[2];
            a[1] = a[3];
            a[2] = clip[i    ];
            a[3] = clip[i + 1];
            curr = next;
            next = [];

            b[2] = curr[curr.length - 2];
            b[3] = curr[curr.length - 1];

            for(j = 0; j !== curr.length; j += 2) {
              b[0] = b[2];
              b[1] = b[3];
              b[2] = curr[j    ];
              b[3] = curr[j + 1];

              m = (a[2] - a[0]) * (b[1] - a[1]) > (a[3] - a[1]) * (b[0] - a[0]);
              n = (a[2] - a[0]) * (b[3] - a[1]) > (a[3] - a[1]) * (b[2] - a[0]);

              if(m !== n)
                Array.prototype.push.apply(next, intersectionPoint(a, b));

              if(n)
                next.push(b[2], b[3]);
            }
          }

          return next;
        }
      }
    }
  };
}());

module.exports = Geometry;
