import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateVerificationGate, VERIFICATION_CHECKS } from "../verification";

function allChecks(overrides: Partial<Record<(typeof VERIFICATION_CHECKS)[number]["key"], boolean>> = {}) {
  const base = Object.fromEntries(VERIFICATION_CHECKS.map((c) => [c.key, true]));
  return { ...base, ...overrides } as Record<(typeof VERIFICATION_CHECKS)[number]["key"], boolean>;
}

test("evaluateVerificationGate: ready when every check passes", () => {
  const result = evaluateVerificationGate(allChecks());
  assert.equal(result.ready, true);
  assert.deepEqual(result.missing, []);
});

test("evaluateVerificationGate: not ready when any single check fails", () => {
  const result = evaluateVerificationGate(allChecks({ verification_conflict_ok: false }));
  assert.equal(result.ready, false);
  assert.equal(result.missing.length, 1);
  assert.equal(result.missing[0].key, "verification_conflict_ok");
});

test("evaluateVerificationGate: reports every failing check, not just the first", () => {
  const result = evaluateVerificationGate(
    allChecks({ verification_identity_ok: false, verification_sources_ok: false })
  );
  assert.equal(result.ready, false);
  assert.deepEqual(
    result.missing.map((m) => m.key).sort(),
    ["verification_identity_ok", "verification_sources_ok"]
  );
});

test("evaluateVerificationGate: all nine checks are covered", () => {
  assert.equal(VERIFICATION_CHECKS.length, 9);
});
