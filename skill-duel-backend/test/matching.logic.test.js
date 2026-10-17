import test from "node:test";
import assert from "node:assert/strict";
import {
  toSkillMap,
  hasSkills,
  skillTaughtTo,
  isComplementary,
  findComplement,
  findAnyone,
  describeExchange,
} from "../src/sockets/matching.logic.js";

const profile = (userId, teaching, learning) => ({
  userId,
  teaching: toSkillMap(teaching),
  learning: toSkillMap(learning),
});

const queueOf = (...profiles) => new Map(profiles.map((p) => [p.userId, p]));

test("toSkillMap trims, ignores case duplicates and blanks", () => {
  const map = toSkillMap(["React", " react ", "", "Node.js", "  "]);
  assert.equal(map.size, 2);
  assert.equal(map.get("react"), "React"); // first spelling wins
});

test("hasSkills needs both a teaching and a learning skill", () => {
  assert.equal(hasSkills(profile("a", [], [])), false);
  assert.equal(hasSkills(profile("a", ["React"], [])), false);
  assert.equal(hasSkills(profile("a", [], ["React"])), false);
  assert.equal(hasSkills(profile("a", ["React"], ["Node"])), true);
});

test("complementary match ignores letter case", () => {
  const alice = profile("alice", ["React"], ["Node.js"]);
  const bob = profile("bob", ["node.js"], ["react"]);
  assert.equal(isComplementary(alice, bob), true);
  assert.equal(skillTaughtTo(alice, bob), "React"); // keeps the teacher's casing
  assert.equal(skillTaughtTo(bob, alice), "node.js");
});

test("one-way interest is not complementary", () => {
  const alice = profile("alice", ["React"], ["Python"]);
  const bob = profile("bob", ["Node"], ["React"]); // wants React, but Alice's wish (Python) isn't taught
  assert.equal(isComplementary(alice, bob), false);
});

test("matches on any overlapping skill, not just the first one listed", () => {
  const alice = profile("alice", ["CSS", "React"], ["Go", "Node"]);
  const bob = profile("bob", ["Rust", "Node"], ["Swift", "React"]);
  assert.equal(isComplementary(alice, bob), true);
  assert.equal(skillTaughtTo(alice, bob), "React");
  assert.equal(skillTaughtTo(bob, alice), "Node");
});

test("a user is never matched with themselves, even if they list the same skill twice", () => {
  const solo = profile("solo", ["React"], ["React"]);
  assert.equal(findComplement(queueOf(solo), solo), null);
  assert.equal(findAnyone(queueOf(solo), solo), null);
});

test("two profiles with no skills are never treated as complementary", () => {
  const a = profile("a", [], []);
  const b = profile("b", [], []);
  assert.equal(isComplementary(a, b), false);
});

test("findComplement skips non-matching users and finds the right one", () => {
  const me = profile("me", ["React"], ["Node"]);
  const wrong = profile("wrong", ["Python"], ["Go"]);
  const right = profile("right", ["Node"], ["React"]);
  assert.equal(findComplement(queueOf(wrong, right), me), right);
});

test("findAnyone returns someone else when the queue has others", () => {
  const me = profile("me", ["A"], ["B"]);
  const other = profile("other", ["C"], ["D"]);
  assert.equal(findAnyone(queueOf(me, other), me), other);
});

test("describeExchange lines up for complementary pairs", () => {
  const alice = profile("alice", ["React"], ["Node.js"]);
  const bob = profile("bob", ["node.js"], ["react"]);
  const ex = describeExchange(alice, bob);
  assert.deepEqual(ex.a, { teaches: "React", learns: "node.js" });
  assert.deepEqual(ex.b, { teaches: "node.js", learns: "React" });
});

test("describeExchange falls back to first listed skills for non-complementary pairs", () => {
  const alice = profile("alice", ["React", "CSS"], ["Python"]);
  const bob = profile("bob", ["Go"], ["Rust"]);
  const ex = describeExchange(alice, bob);
  assert.deepEqual(ex.a, { teaches: "React", learns: "Python" });
  assert.deepEqual(ex.b, { teaches: "Go", learns: "Rust" });
});
