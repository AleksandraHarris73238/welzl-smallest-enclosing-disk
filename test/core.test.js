import { test } from 'node:test';
import assert from 'node:assert/strict';
import { smallestEnclosingDisk } from '../src/index.js';

// The enclosing disk must contain every input point: its squared distance
// to the centre is at most the squared radius. Comparing squared distances
// avoids a sqrt and the float-equality trap that comes with it.
function assertContains(result, points) {
  const r2 = result.radius * result.radius;
  for (const [x, y] of points) {
    const dx = x - result.center[0];
    const dy = y - result.center[1];
    assert.ok(
      dx * dx + dy * dy <= r2 + 1e-9,
      `point (${x}, ${y}) is outside the disk`
    );
  }
}

test('empty input returns a zero disk at the origin', () => {
  const r = smallestEnclosingDisk([]);
  assert.deepEqual(r.center, [0, 0]);
  assert.equal(r.radius, 0);
});

test('a single point yields a zero-radius disk on that point', () => {
  const r = smallestEnclosingDisk([[3, 4]]);
  assert.deepEqual(r.center, [3, 4]);
  assert.equal(r.radius, 0);
});

test('two points yield a disk with them on a diameter', () => {
  const r = smallestEnclosingDisk([[0, 0], [4, 0]]);
  assert.deepEqual(r.center, [2, 0]);
  assert.equal(r.radius, 2);
});

test('three corners of a square', () => {
  const pts = [[0, 0], [2, 0], [0, 2]];
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.ok(r.radius > 1.41 && r.radius < 1.42);
});

test('all four corners of a unit square', () => {
  const pts = [[0, 0], [2, 0], [0, 2], [2, 2]];
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.deepEqual(r.center, [1, 1]);
  assert.equal(r.radius, Math.SQRT2);
});

test('collinear points are enclosed by the diameter of the extremes', () => {
  const pts = [[0, 0], [3, 0], [6, 0], [1.5, 0]];
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.deepEqual(r.center, [3, 0]);
  assert.equal(r.radius, 3);
});

test('duplicate points collapse correctly', () => {
  const pts = [[1, 1], [1, 1], [1, 1]];
  const r = smallestEnclosingDisk(pts);
  assert.deepEqual(r.center, [1, 1]);
  assert.equal(r.radius, 0);
});

test('duplicate points alongside distinct ones', () => {
  const pts = [[0, 0], [4, 0], [4, 0], [0, 0], [2, 2]];
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.ok(r.radius >= 2 - 1e-9);
});

test('random-looking set still encloses every point', () => {
  const pts = [[1.1, 2.2], [3.3, 4.4], [5.5, 1.1], [0.0, 7.7], [8.8, 0.0], [2.5, 6.5]];
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.ok(r.radius > 0);
});

test('points already on a unit circle', () => {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 2 * Math.PI;
    pts.push([Math.cos(a), Math.sin(a)]);
  }
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.ok(Math.abs(r.radius - 1) < 1e-9, `radius should be 1, got ${r.radius}`);
});

test('triangle whose circumcircle has a known centre', () => {
  // Equilateral triangle, circumradius 2, centre at origin.
  const pts = [
    [2, 0],
    [-1, Math.sqrt(3)],
    [-1, -Math.sqrt(3)],
  ];
  const r = smallestEnclosingDisk(pts);
  assertContains(r, pts);
  assert.ok(Math.abs(r.center[0]) < 1e-9);
  assert.ok(Math.abs(r.center[1]) < 1e-9);
  assert.ok(Math.abs(r.radius - 2) < 1e-9);
});

test('rejects non-array input', () => {
  assert.throws(() => smallestEnclosingDisk(null), TypeError);
  assert.throws(() => smallestEnclosingDisk('nope'), TypeError);
});

test('rejects malformed points', () => {
  assert.throws(() => smallestEnclosingDisk([[1, 'x']]), TypeError);
  assert.throws(() => smallestEnclosingDisk([[1]]), TypeError);
  assert.throws(() => smallestEnclosingDisk([[NaN, 2]]), TypeError);
});
