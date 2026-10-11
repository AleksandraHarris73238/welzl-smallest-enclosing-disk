/**
 * Welzl's algorithm for the minimum enclosing disk of 2D points.
 *
 * Uses a randomized, iterative move-to-front scheme. Points are shuffled
 * once with a Fisher-Yates pass so the recursion sees a random order —
 * this is what gives Welzl its expected linear running time.
 */

/**
 * Represents a circle by its centre (cx, cy) and squared radius.
 * We keep the squared radius internally to avoid a sqrt per recursive
 * step; only the public result converts to a true radius.
 */
class Disk {
  constructor(cx, cy, r2) {
    this.cx = cx;
    this.cy = cy;
    this.r2 = r2;
  }

  contains(px, py) {
    const dx = px - this.cx;
    const dy = py - this.cy;
    return dx * dx + dy * dy <= this.r2;
  }
}

/**
 * Two points are equidistant from their midpoint — a degenerate disk of
 * radius |p1-p2|/2 touching both. This is the smallest disk with exactly
 * these two points on its boundary.
 */
function diskFromTwo(p1, p2) {
  const cx = (p1[0] + p2[0]) / 2;
  const cy = (p1[1] + p2[1]) / 2;
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return new Disk(cx, cy, (dx * dx + dy * dy) / 4);
}

/**
 * Smallest disk whose boundary passes through all three points — the
 * circumscribed circle. Returns null when the three points are collinear,
 * which the caller must handle by falling back to the best two-point disk.
 */
function diskFromThree(p1, p2, p3) {
  const ax = p1[0], ay = p1[1];
  const bx = p2[0], by = p2[1];
  const cx = p3[0], cy = p3[1];

  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  // Near-zero determinant ⇒ collinear (or numerically indistinguishable
  // from it). We refuse rather than divide by something unstable.
  if (Math.abs(d) < 1e-12) return null;

  const aSq = ax * ax + ay * ay;
  const bSq = bx * bx + by * by;
  const cSq = cx * cx + cy * cy;

  const ux = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
  const uy = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;

  const dxA = ax - ux, dyA = ay - uy;
  return new Disk(ux, uy, dxA * dxA + dyA * dyA);
}

/**
 * Recursive Welzl step. `points` is the working set in move-to-front order;
 * `r` is the array of points currently known to lie on the boundary of the
 * final disk (|r| ≤ 3 by the invariant of the algorithm).
 */
function welzl(points, n, r) {
  if (n === 0 || r.length === 3) {
    return trivial(r);
  }
  // Move the last point out, solve for the prefix, then test whether the
  // excluded point still fits. If not, it must be on the boundary.
  const p = points[n - 1];
  const d = welzl(points, n - 1, r);
  if (d !== null && d.contains(p[0], p[1])) {
    return d;
  }
  r = r.concat([p]);
  return welzl(points, n - 1, r);
}

/**
 * Base case: the smallest disk enclosing the boundary set `r`.
 * |r| can be 0, 1, 2, or 3 here — never more, enforced by the caller.
 */
function trivial(r) {
  if (r.length === 0) return new Disk(0, 0, 0);
  if (r.length === 1) return new Disk(r[0][0], r[0][1], 0);
  if (r.length === 2) return diskFromTwo(r[0], r[1]);

  // Three boundary points. The circumscribed circle is the answer unless
  // the points are collinear, in which case the disk is determined by the
  // pair that are farthest apart — the third lies between them.
  const d = diskFromThree(r[0], r[1], r[2]);
  if (d !== null) return d;

  let best = diskFromTwo(r[0], r[1]);
  const d12 = diskFromTwo(r[1], r[2]);
  if (d12.r2 > best.r2) best = d12;
  const d02 = diskFromTwo(r[0], r[2]);
  if (d02.r2 > best.r2) best = d02;
  return best;
}

/**
 * Durstenfeld in-place Fisher-Yates. We shuffle so the move-to-front sees
 * a random permutation — the expected-linear-time guarantee depends on it.
 */
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

/**
 * Computes the minimum-radius circle enclosing a set of 2D points.
 *
 * Each point is a two-element array `[x, y]`. Returns an object with
 * `center` (`[x, y]`) and `radius` (a non-negative number).
 *
 * - Empty input yields `{ center: [0, 0], radius: 0 }`.
 * - A single point yields a radius-0 circle centred on it.
 * - Duplicate and collinear points are handled by falling back to the
 *   best two-point disk when three boundary points are collinear.
 *
 * @param {Array<[number, number]>} points
 * @returns {{center: [number, number], radius: number}}
 */
export function smallestEnclosingDisk(points) {
  if (!Array.isArray(points)) {
    throw new TypeError('points must be an array');
  }
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 ||
        typeof p[0] !== 'number' || typeof p[1] !== 'number' ||
        Number.isNaN(p[0]) || Number.isNaN(p[1])) {
      throw new TypeError('each point must be [number, number]');
    }
  }

  if (points.length === 0) {
    return { center: [0, 0], radius: 0 };
  }

  const work = points.map((p) => [p[0], p[1]]);
  shuffleInPlace(work, Math.random);

  const d = welzl(work, work.length, []);
  return {
    center: [d.cx, d.cy],
    radius: Math.sqrt(d.r2),
  };
}
