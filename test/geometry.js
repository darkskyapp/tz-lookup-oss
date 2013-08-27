var expect = require("chai").expect;

describe("geometry", function() {
  var Geometry = require("../lib/geometry");

  describe("intersect", function() {
    describe("line", function() {
      describe("line", function() {
        it("should return false for two paraline.lineel lines", function() {
          expect(Geometry.intersect.line.line(
            [-1, -1,  1, -1],
            [-1,  1,  1,  1]
          )).to.equal(false);

          expect(Geometry.intersect.line.line(
            [-3, 0, -1, 0],
            [ 1, 0,  3, 0]
          )).to.equal(false);

          /* Even if the two lines are coincident. */
          expect(Geometry.intersect.line.line(
            [-1, 0,  1, 0],
            [-1, 0,  1, 0]
          )).to.equal(false);

          expect(Geometry.intersect.line.line(
            [-1, 0,  1, 0],
            [ 1, 0, -1, 0]
          )).to.equal(false);

          expect(Geometry.intersect.line.line(
            [-1.5, 0, 0.5, 0],
            [-0.5, 0, 1.5, 0]
          )).to.equal(false);
        });

        it("should return false for nonparaline.lineel lines that don't intersect", function() {
          expect(Geometry.intersect.line.line(
            [-1.5,  0, 0.5, 0],
            [ 1.5, -1, 1.5, 1]
          )).to.equal(false);
        });

        it("should return true for intersecting lines", function() {
          expect(Geometry.intersect.line.line(
            [-1, 0, 1, 0],
            [0, -1, 0, 1]
          )).to.equal(true);
        });
      });

      describe("polygon", function() {
        /* FIXME */
      });
    });

    describe("polygon", function() {
      describe("line", function() {
        /* FIXME */
      });

      describe("polygon", function() {
        /* FIXME */
      });
    });
  });

  describe("convert", function() {
    describe("point", function() {
      describe("box", function() {
        /* FIXME */
      });
    });

    describe("line", function() {
      describe("box", function() {
        /* FIXME */
      });
    });

    describe("box", function() {
      describe("polygon", function() {
        /* FIXME */
      });
    });

    describe("polygon", function() {
      describe("box", function() {
        /* FIXME */
      });
    });
  });

  describe("overlap", function() {
    describe("box", function() {
      describe("box", function() {
        /* FIXME */
      });

      describe("polygon", function() {
        /* FIXME */
      });
    });

    describe("polygon", function() {
      describe("box", function() {
        /* FIXME */
      });

      describe("polygon", function() {
        /* FIXME */
      });
    });
  });

  describe("lengthSquared", function() {
    describe("line", function() {
      it("should return the square of the length of the line", function() {
        expect(Geometry.lengthSquared.line([0, 0, 3, 4])).to.equal(25);
      });
    });
  });

  describe("length", function() {
    describe("line", function() {
      it("should return the square of the length of the line", function() {
        expect(Geometry.length.line([0, 0, 3, 4])).to.equal(5);
      });
    });
  });

  describe("reverse", function() {
    describe("line", function() {
      /* FIXME */
    });

    describe("polygon", function() {
      /* FIXME */
    });
  });

  describe("remove", function() {
    describe("polygon", function() {
      describe("polygon", function() {
        /* FIXME */
      });
    });
  });

  describe("clip", function() {
    describe("polygon", function() {
      describe("polygon", function() {
        /* FIXME */
      });
    });
  });

  describe("distanceSquared", function() {
    describe("point", function() {
      describe("line", function() {
        it("should return the distance squared to the point if the line's endpoints are coincident", function() {
          expect(Geometry.distanceSquared.point.line([3, 4], [0, 0, 0, 0])).to.equal(25);
        });

        it("should return the distance squared from the first point if the first point is closest", function() {
          expect(Geometry.distanceSquared.point.line([3, 4], [0, 0, -1, -1])).to.equal(25);
        });

        it("should return the distance squared from the second point if the second point is closest", function() {
          expect(Geometry.distanceSquared.point.line([3, 4], [-1, -1, 0, 0])).to.equal(25);
        });

        it("should return the distance to the line itself if the point is nearer the line than either endpoint", function() {
          expect(Geometry.distanceSquared.point.line([3, 4], [-4, 3, 4, -3])).to.equal(25);
        });

        it("should return 0 if the point equals the first endpoint", function() {
          expect(Geometry.distanceSquared.point.line([-2, -1], [-2, -1, 2, 1])).to.equal(0);
        });

        it("should return 0 if the point equals the second endpoint", function() {
          expect(Geometry.distanceSquared.point.line([2, 1], [-2, -1, 2, 1])).to.equal(0);
        });

        it("should return 0 if the point is on the line", function() {
          expect(Geometry.distanceSquared.point.line([0, 0], [-2, -1, 2, 1])).to.equal(0);
        });
      });

      describe("polygon", function() {
        var poly = [-4, 3, 3, 4, 4, -3, -3, -4];

        it("should return 0 if the point is in the polygon", function() {
          expect(Geometry.distanceSquared.point.polygon([0, 0], poly)).to.equal(0);
        });

        it("should return 0 if the point is coincident with a vertex of the polygon", function() {
          expect(Geometry.distanceSquared.point.polygon([3, 4], poly)).to.equal(0);
        });

        it("should return 0 if the point is coincident with an edge of the polygon", function() {
          expect(Geometry.distanceSquared.point.polygon([-0.5, 3.5], poly)).to.equal(0);
        });

        it("should return the distance to the nearest vertex if a vertex is the nearest point", function() {
          expect(Geometry.distanceSquared.point.polygon([6, 8], poly)).to.equal(25);
        });

        it("should return the distance to the nearest edge if an edge is the nearest point", function() {
          /* FIXME */
        });
      });
    });

    describe("line", function() {
      describe("point", function() {
        /* FIXME */
      });
    });

    describe("polygon", function() {
      describe("point", function() {
        /* FIXME */
      });
    });
  });

  describe("distance", function() {
    describe("point", function() {
      describe("line", function() {
        it("should return the distance squared to the point if the line's endpoints are coincident", function() {
          expect(Geometry.distance.point.line([3, 4], [0, 0, 0, 0])).to.equal(5);
        });

        it("should return the distance squared from the first point if the first point is closest", function() {
          expect(Geometry.distance.point.line([3, 4], [0, 0, -1, -1])).to.equal(5);
        });

        it("should return the distance squared from the second point if the second point is closest", function() {
          expect(Geometry.distance.point.line([3, 4], [-1, -1, 0, 0])).to.equal(5);
        });

        it("should return the distance to the line itself if the point is nearer the line than either endpoint", function() {
          expect(Geometry.distance.point.line([3, 4], [-4, 3, 4, -3])).to.equal(5);
        });

        it("should return 0 if the point equals the first endpoint", function() {
          expect(Geometry.distance.point.line([-2, -1], [-2, -1, 2, 1])).to.equal(0);
        });

        it("should return 0 if the point equals the second endpoint", function() {
          expect(Geometry.distance.point.line([2, 1], [-2, -1, 2, 1])).to.equal(0);
        });

        it("should return 0 if the point is on the line", function() {
          expect(Geometry.distance.point.line([0, 0], [-2, -1, 2, 1])).to.equal(0);
        });
      });

      describe("polygon", function() {
        /* FIXME */
      });
    });

    describe("line", function() {
      describe("point", function() {
        /* FIXME */
      });
    });

    describe("polygon", function() {
      describe("point", function() {
        /* FIXME */
      });
    });
  });
});
