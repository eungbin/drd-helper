import assert from "node:assert/strict";
import { test } from "node:test";

import { filterUnitsBySearch } from "./filters";
import { unitId, units } from "./data";

test("filters units by grade and name query", () => {
  const result = filterUnitsBySearch(units, {
    grade: "절대",
    nameQuery: "손오공",
  });

  assert.deepEqual(
    result.map((unit) => unit.id),
    [
      unitId("절대", "슈퍼 사이어인 5 손오공"),
      unitId("절대", "무의식의 극의 완성형 손오공"),
    ],
  );
});

test("filters names with trimmed case-insensitive text", () => {
  const result = filterUnitsBySearch(units, {
    grade: "all",
    nameQuery: "  mr.  ",
  });

  assert.deepEqual(
    result.map((unit) => unit.id),
    [unitId("영웅+", "Mr. 부우"), unitId("유니크", "Mr. 사탄")],
  );
});

test("returns the given units when filters are empty", () => {
  const sample = units.slice(0, 3);

  assert.deepEqual(
    filterUnitsBySearch(sample, { grade: "all", nameQuery: "" }),
    sample,
  );
});
