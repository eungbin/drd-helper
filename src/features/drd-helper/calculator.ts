import { emptyRareCounts, rareUnitNames, recipesByTargetId, unitsById } from "./data";
import type { Inventory, RareCounts, Shortage, UnitId } from "./types";

export type RareProgress = {
  totalRareRequired: number;
  missingRareRequired: number;
  percentage: number;
};

export function createEmptyInventory(): Inventory {
  return { gas: 0, units: {} };
}

export function calculateShortage(
  targetUnitId: UnitId,
  inventory: Inventory,
): Shortage {
  const remainingInventory = cloneInventory(inventory);
  const rareShortage = emptyRareCounts();
  let gasShortage = 0;

  function requireGas(count: number): void {
    const needed = normalizeCount(count);
    const consumed = Math.min(remainingInventory.gas, needed);

    remainingInventory.gas -= consumed;
    gasShortage += needed - consumed;
  }

  function requireUnit(unitId: UnitId, count: number): void {
    const needed = normalizeCount(count);
    const owned = remainingInventory.units[unitId] ?? 0;
    const consumed = Math.min(owned, needed);
    const missing = needed - consumed;

    remainingInventory.units[unitId] = owned - consumed;

    if (missing === 0) {
      return;
    }

    const unitDefinition = unitsById.get(unitId);
    if (!unitDefinition) {
      throw new Error(`Missing unit definition for ${unitId}`);
    }

    const recipe = recipesByTargetId.get(unitId);
    if (recipe) {
      for (const material of recipe.materials) {
        if (material.type === "gas") {
          requireGas(material.count * missing);
        } else {
          requireUnit(material.unitId, material.count * missing);
        }
      }

      return;
    }

    if (isRareUnitName(unitDefinition.name)) {
      addRareShortage(rareShortage, unitDefinition.name, missing, unitId);
      return;
    }

    throw new Error(`Missing recipe for ${unitId}`);
  }

  requireUnit(targetUnitId, 1);

  const normalizedRareShortage = normalizeRareCounts(rareShortage);
  const normalizedGasShortage = normalizeCount(gasShortage);

  return {
    rareShortage: normalizedRareShortage,
    gasShortage: normalizedGasShortage,
    craftable:
      normalizedGasShortage === 0 &&
      rareUnitNames.every((name) => normalizedRareShortage[name] === 0),
  };
}

function cloneInventory(inventory: Inventory): Inventory {
  const units: Inventory["units"] = {};

  for (const [unitId, count] of Object.entries(inventory.units)) {
    units[unitId as UnitId] = normalizeCount(count);
  }

  return {
    gas: normalizeCount(inventory.gas),
    units,
  };
}

function normalizeCount(count: number | undefined): number {
  if (!Number.isFinite(count) || count === undefined) {
    return 0;
  }

  return Math.max(0, Math.floor(count));
}

function normalizeRareCounts(rareCounts: RareCounts): RareCounts {
  const normalized = emptyRareCounts();

  for (const name of rareUnitNames) {
    normalized[name] = normalizeCount(rareCounts[name]);
  }

  return normalized;
}

function addRareShortage(
  rareShortage: RareCounts,
  rareUnitName: string,
  count: number,
  unitId: UnitId,
): void {
  if (!isRareUnitName(rareUnitName)) {
    throw new Error(`Invalid rare unit expansion for ${unitId}`);
  }

  rareShortage[rareUnitName] += normalizeCount(count);
}

function sumRareCounts(rareCounts: RareCounts): number {
  return rareUnitNames.reduce((total, name) => total + rareCounts[name], 0);
}

export function calculateRareProgressPercentage(
  totalRareRequired: number,
  missingRareRequired: number,
): number {
  const total = normalizeCount(totalRareRequired);
  const missing = normalizeCount(missingRareRequired);

  if (total === 0) {
    return 100;
  }

  const fulfilled = Math.min(total, Math.max(0, total - missing));

  return Math.min(100, Math.max(0, Math.round((fulfilled / total) * 100)));
}

export function calculateRareProgress(
  targetUnitId: UnitId,
  inventory: Inventory,
  currentShortage = calculateShortage(targetUnitId, inventory),
): RareProgress {
  const totalShortage = calculateShortage(targetUnitId, createEmptyInventory());
  const totalRareRequired = sumRareCounts(totalShortage.rareShortage);
  const missingRareRequired = sumRareCounts(currentShortage.rareShortage);

  return {
    totalRareRequired,
    missingRareRequired,
    percentage: calculateRareProgressPercentage(
      totalRareRequired,
      missingRareRequired,
    ),
  };
}

function isRareUnitName(rareUnitName: string): rareUnitName is keyof RareCounts {
  return rareUnitNames.some((name) => name === rareUnitName);
}
