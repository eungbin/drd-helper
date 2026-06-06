import assert from "node:assert/strict";
import { test } from "node:test";

import { missions } from "./missions";

test("defines the requested mission table", () => {
  assert.deepEqual(
    missions.map((mission) => mission.name),
    [
      "레어",
      "영웅",
      "서사",
      "전설",
      "슈퍼 사이어인",
      "숙명의 라이벌",
      "No. 1",
      "후계자",
      "신에 도달한 자",
    ],
  );
});

test("keeps No. 1 mission requirements display-only and accurate", () => {
  const mission = missions.find((entry) => entry.name === "No. 1");

  assert.deepEqual(mission?.requirements, [
    { kind: "unit", grade: "영웅+", name: "Mr. 부우", count: 1 },
    { kind: "unit", grade: "서사", name: "손오공", count: 1 },
    { kind: "unit", grade: "영웅", name: "베지터", count: 1 },
    { kind: "unit", grade: "유니크", name: "Mr. 사탄", count: 1 },
  ]);
});

test("keeps grade collection missions structured for colored grade labels", () => {
  assert.deepEqual(missions[0].requirements, [
    { kind: "grade-all", grade: "레어" },
  ]);
});
