import { test } from "node:test";
import assert from "node:assert/strict";
import { canGenerateReport, buildReportSkeleton, REPORT_SECTION_ORDER } from "../reports";

test("canGenerateReport: false for opportunities still in early stages", () => {
  for (const status of ["discovered", "screening", "researching", "verification_required", "rejected", "paused", "archived"] as const) {
    assert.equal(canGenerateReport({ opportunity_status: status }), false, `expected ${status} to be non-reportable`);
  }
});

test("canGenerateReport: true once qualified or later", () => {
  for (const status of ["qualified", "ready_to_deliver", "delivered"] as const) {
    assert.equal(canGenerateReport({ opportunity_status: status }), true, `expected ${status} to be reportable`);
  }
});

test("buildReportSkeleton: has every section from the template, in order, empty", () => {
  const skeleton = buildReportSkeleton();
  assert.deepEqual(Object.keys(skeleton), REPORT_SECTION_ORDER);
  for (const key of REPORT_SECTION_ORDER) {
    assert.deepEqual(skeleton[key], { content: "", source_ids: [] });
  }
});
