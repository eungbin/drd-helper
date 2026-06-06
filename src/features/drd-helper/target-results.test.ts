import assert from "node:assert/strict";
import { test } from "node:test";

import { recipesByTargetId, targetGrades, unitId } from "./data";
import {
  defaultTargetResultUnits,
  searchableTargetResultUnits,
  targetResultGradeOptions,
} from "./target-results";

test("target result units are upper units with displayable recipes", () => {
  assert.ok(defaultTargetResultUnits.length > 0);

  for (const unit of defaultTargetResultUnits) {
    assert.ok(targetGrades.includes(unit.grade));
    assert.ok(recipesByTargetId.has(unit.id));
  }
});

test("searchable target result units include lower recipe units", () => {
  assert.ok(searchableTargetResultUnits.some((unit) => unit.id === unitId("영웅", "손오공")));
  assert.ok(searchableTargetResultUnits.some((unit) => unit.id === unitId("전설", "손오공")));
  assert.equal(
    searchableTargetResultUnits.some((unit) => unit.id === unitId("레어", "손오공")),
    false,
  );
});

test("target result grade options include every recipe grade in order", () => {
  assert.deepEqual(targetResultGradeOptions, [
    "영웅",
    "영웅+",
    "유니크",
    "서사",
    "서사+",
    "전설",
    "전설+",
    "신화",
    "초월",
    "초월+",
    "에픽",
    "절대",
  ]);
});
