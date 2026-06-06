import assert from "node:assert/strict";
import { test } from "node:test";

import { gradeLabelParts } from "./grade-styles";

test("uses the same grade color for plus grades", () => {
  assert.equal(
    gradeLabelParts("영웅+")[0].className,
    gradeLabelParts("영웅")[0].className,
  );
  assert.equal(
    gradeLabelParts("초월+")[0].className,
    gradeLabelParts("초월")[0].className,
  );
});

test("uses purple for mythic grade", () => {
  assert.equal(gradeLabelParts("신화")[0].className, "text-purple-600");
});

test("splits absolute grade into red and blue text", () => {
  assert.deepEqual(gradeLabelParts("절대"), [
    { text: "절", className: "text-red-600" },
    { text: "대", className: "text-blue-600" },
  ]);
});
