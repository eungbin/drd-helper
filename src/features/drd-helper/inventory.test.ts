import assert from "node:assert/strict";
import { test } from "node:test";

import { inventoryGrades } from "./inventory";

test("excludes fully upper grades from inventory input", () => {
  assert.deepEqual(inventoryGrades, [
    "레어",
    "영웅",
    "영웅+",
    "유니크",
    "서사",
    "서사+",
    "전설",
    "전설+",
    "에픽",
  ]);
});
