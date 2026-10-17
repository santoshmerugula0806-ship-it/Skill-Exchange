/**
 * Pure matching rules — no database, no sockets — so they can be unit tested.
 *
 * A "profile" is: { userId, teaching: Map, learning: Map }
 * where each Map is  normalizedSkill -> display label  (see toSkillMap).
 */

export const normalizeSkill = (skill) => String(skill ?? "").trim().toLowerCase();

/** ["React", " react ", "Node"] -> Map { "react" => "React", "node" => "Node" } */
export const toSkillMap = (skills = []) => {
  const map = new Map();
  for (const skill of skills) {
    const key = normalizeSkill(skill);
    if (key && !map.has(key)) map.set(key, String(skill).trim());
  }
  return map;
};

export const hasSkills = (profile) =>
  profile.teaching.size > 0 && profile.learning.size > 0;

/** First skill that `teacher` teaches and `learner` wants to learn (teacher's casing), or null. */
export const skillTaughtTo = (teacher, learner) => {
  for (const [key, label] of teacher.teaching) {
    if (learner.learning.has(key)) return label;
  }
  return null;
};

/** A teaches something B wants AND B teaches something A wants. */
export const isComplementary = (a, b) =>
  skillTaughtTo(a, b) !== null && skillTaughtTo(b, a) !== null;

/** First queued profile that complements `me`. Never returns `me`. */
export const findComplement = (queue, me) => {
  for (const [userId, other] of queue) {
    if (userId === me.userId) continue;
    if (isComplementary(me, other)) return other;
  }
  return null;
};

/** Fallback pairing: anyone else who is waiting. Never returns `me`. */
export const findAnyone = (queue, me) => {
  for (const [userId, other] of queue) {
    if (userId !== me.userId) return other;
  }
  return null;
};

const firstLabel = (map) => map.values().next().value ?? null;

/**
 * What each side teaches/learns in this session. For a complementary pair
 * these line up exactly (a.teaches === b.learns); for a fallback pair each
 * side just shows their first listed skills.
 */
export const describeExchange = (a, b) => ({
  a: {
    teaches: skillTaughtTo(a, b) ?? firstLabel(a.teaching),
    learns: skillTaughtTo(b, a) ?? firstLabel(a.learning),
  },
  b: {
    teaches: skillTaughtTo(b, a) ?? firstLabel(b.teaching),
    learns: skillTaughtTo(a, b) ?? firstLabel(b.learning),
  },
});
