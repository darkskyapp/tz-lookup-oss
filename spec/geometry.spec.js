describe("geometry", function() {
  var geometry = require("../lib/geometry");

  describe("intersect", function() {
    describe("line", function() {
      describe("line", function() {
        it("should return false for two paraline.lineel lines", function() {
          expect(geometry.intersect.line.line(
            [-1, -1,  1, -1],
            [-1,  1,  1,  1]
          )).toBe(false);

          expect(geometry.intersect.line.line(
            [-3, 0, -1, 0],
            [ 1, 0,  3, 0]
          )).toBe(false);

          /* Even if the two lines are coincident. */
          expect(geometry.intersect.line.line(
            [-1, 0,  1, 0],
            [-1, 0,  1, 0]
          )).toBe(false);

          expect(geometry.intersect.line.line(
            [-1, 0,  1, 0],
            [ 1, 0, -1, 0]
          )).toBe(false);

          expect(geometry.intersect.line.line(
            [-1.5, 0, 0.5, 0],
            [-0.5, 0, 1.5, 0]
          )).toBe(false);
        });

        it("should return false for nonparaline.lineel lines that don't intersect", function() {
          expect(geometry.intersect.line.line(
            [-1.5,  0, 0.5, 0],
            [ 1.5, -1, 1.5, 1]
          )).toBe(false);
        });

        it("should return true for intersecting lines", function() {
          expect(geometry.intersect.line.line(
            [-1, 0, 1, 0],
            [0, -1, 0, 1]
          )).toBe(true);
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
});
