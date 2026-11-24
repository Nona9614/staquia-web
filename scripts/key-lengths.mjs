// Measures the length of staquia positions for the Comparison page: reproducible, no randomness without a seed.
//
//   node scripts/key-lengths.mjs
//
// For every preset: the longest position after 10,000 appends, after 10,000 moves to random places (spacing the
// list again when a gap is full, as an app would), and how many moves fit into the same gap before the list
// asks for a rebalance (a move fails with a "position" error at the threshold).
import Staquia, { LexicalList } from "staquia";

const presets = ["default", "ascii", "urlSafe", "base36", "alphabet"];

/** A seeded random generator (mulberry32). */
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rows = [];
for (const name of presets) {
  const system = Staquia[name]();
  const list = new LexicalList(system);
  const items = [];
  for (let id = 1; id <= 10_000; id++) {
    const item = { id, position: "" };
    items.push(item);
    list.push(item);
  }
  const appended = Math.max(...items.map((item) => item.position.length));

  // Random moves; a full gap is spaced again like an app does (rebalance), and the move retried
  const random = seeded(42);
  let rebalances = 0;
  let longest = 0;
  for (let i = 0; i < 10_000; i++) {
    const order = list.toArray().value;
    const id = order[Math.floor(random() * order.length)].id;
    const others = order.filter((item) => item.id !== id);
    const at = Math.floor(random() * (others.length + 1));
    const previous = others[at - 1]?.id;
    const next = others[at]?.id;
    let moved = list.move(id, previous, next);
    if (!moved.ok && moved.error.type === "position") {
      list.rebalance();
      rebalances++;
      moved = list.move(id, previous, next);
    }
    if (moved.ok) longest = Math.max(longest, moved.value.position.toString().length);
  }
  const average = items.reduce((sum, item) => sum + item.position.length, 0) / items.length;

  // Moves into the same gap: always between the first item and the one after it
  const gap = new LexicalList(system);
  for (let id = 1; id <= 3; id++) gap.push({ id, position: "" });
  let sameGap = 0;
  for (let moves = 1; moves < 1000; moves++) {
    const order = gap.toArray().value;
    if (!gap.move(order[2].id, order[0].id, order[1].id).ok) {
      sameGap = moves - 1;
      break;
    }
  }
  rows.push({ preset: name, appended, randomMoves: longest, average: average.toFixed(1), rebalances, sameGap });
}
console.table(rows);
