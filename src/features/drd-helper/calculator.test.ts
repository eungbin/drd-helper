import assert from "node:assert/strict";
import { test } from "node:test";

import { calculateShortage, createEmptyInventory } from "./calculator";
import { emptyRareCounts, unitId } from "./data";

test("서사 손오공 with no inventory requires four rare 손오공 and four gas", () => {
  const result = calculateShortage(unitId("서사", "손오공"), createEmptyInventory());

  assert.deepEqual(result.rareShortage, {
    ...emptyRareCounts(),
    손오공: 4,
  });
  assert.equal(result.gasShortage, 4);
  assert.equal(result.craftable, false);
});

test("서사 손오공 with four rare 손오공 and four gas is craftable", () => {
  const inventory = createEmptyInventory();
  inventory.gas = 4;
  inventory.units[unitId("레어", "손오공")] = 4;

  const result = calculateShortage(unitId("서사", "손오공"), inventory);

  assert.deepEqual(result.rareShortage, emptyRareCounts());
  assert.equal(result.gasShortage, 0);
  assert.equal(result.craftable, true);
});

test("서사 손오공 with one 영웅 손오공 and no gas requires two rare 손오공 and three gas", () => {
  const inventory = createEmptyInventory();
  inventory.units[unitId("영웅", "손오공")] = 1;

  const result = calculateShortage(unitId("서사", "손오공"), inventory);

  assert.deepEqual(result.rareShortage, {
    ...emptyRareCounts(),
    손오공: 2,
  });
  assert.equal(result.gasShortage, 3);
  assert.equal(result.craftable, false);
});

test("서사 손오공 with one 영웅 손오공 and two gas requires two rare 손오공 and one gas", () => {
  const inventory = createEmptyInventory();
  inventory.gas = 2;
  inventory.units[unitId("영웅", "손오공")] = 1;

  const result = calculateShortage(unitId("서사", "손오공"), inventory);

  assert.deepEqual(result.rareShortage, {
    ...emptyRareCounts(),
    손오공: 2,
  });
  assert.equal(result.gasShortage, 1);
  assert.equal(result.craftable, false);
});

test("서사+ 슈퍼 우부 with one 영웅+ 우부 requires remaining rare units and one gas", () => {
  const inventory = createEmptyInventory();
  inventory.units[unitId("영웅+", "우부")] = 1;

  const result = calculateShortage(unitId("서사+", "슈퍼 우부"), inventory);

  assert.deepEqual(result.rareShortage, {
    ...emptyRareCounts(),
    손오천: 1,
    트랭크스: 1,
    피콜로: 1,
  });
  assert.equal(result.gasShortage, 1);
  assert.equal(result.craftable, false);
});

test("신화 비루스 with no inventory requires sixteen rare 베지터 and thirty two gas", () => {
  const result = calculateShortage(unitId("신화", "비루스"), createEmptyInventory());

  assert.deepEqual(result.rareShortage, {
    ...emptyRareCounts(),
    베지터: 16,
  });
  assert.equal(result.gasShortage, 32);
  assert.equal(result.craftable, false);
});

test("절대 슈퍼 사이어인 5 손오공 does not directly require 신화 손오공", () => {
  const targetId = unitId("절대", "슈퍼 사이어인 5 손오공");
  const withoutMythic = createEmptyInventory();
  const withMythic = createEmptyInventory();
  withMythic.units[unitId("신화", "손오공")] = 1;

  assert.deepEqual(
    calculateShortage(targetId, withMythic),
    calculateShortage(targetId, withoutMythic),
  );
});
