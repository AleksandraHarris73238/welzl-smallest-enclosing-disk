# welzl-smallest-enclosing-disk

Computes the minimum-radius circle that encloses a set of 2D points using a randomized move-to-front implementation of Welzl's algorithm.

```js
import { smallestEnclosingDisk } from 'welzl-smallest-enclosing-disk';

const disk = smallestEnclosingDisk([[0, 0], [2, 0], [0, 2]]);
// disk.center -> [1, 1]
// disk.radius -> Math.SQRT2
```

## Why

Given a cloud of points, the smallest enclosing disk is the tightest circle that contains every one of them. It shows up in collision bounding, clustering visuals, and geometric covering problems. Welzl's algorithm is the standard answer because it runs in expected linear time after a single Fisher-Yates shuffle — the shuffle guarantees the move-to-front recursion sees a random permutation, which is what the expected-time analysis requires.

This library is a single dependency-free ESM module. It shuffles once, recurses, and returns `{ center: [x, y], radius }`. The shuffle uses `Math.random`, which is enough for the expected-time guarantee but is not cryptographically seeded — if you need reproducible runs, wrap the input order yourself before calling.

## Edge cases

- **Empty input** returns `{ center: [0, 0], radius: 0 }`.
- **A single point** returns a zero-radius disk centred on that point.
- **Duplicate points** are handled naturally — they never force the disk to grow.
- **Collinear boundary triples** can arise during recursion when three points are nearly on a line. The circumscribed circle is undefined there, so the code falls back to the smallest two-point disk spanning the farthest pair. The three-point determinant is rejected when its magnitude drops below `1e-12` to avoid dividing by noise.

Points are `[x, y]` pairs of finite numbers. Anything else throws a `TypeError`.
