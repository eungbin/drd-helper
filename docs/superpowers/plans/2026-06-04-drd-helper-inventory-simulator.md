# DRD Helper Inventory Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DRD Helper dashboard where users enter unit/gas inventory and see target-unit shortages as rare units plus gas.

**Architecture:** Keep the domain model, recipe data, and shortage calculator in small pure modules under `src/features/drd-helper/`. Render the dashboard with one Client Component imported by the App Router page. Use one shared recipe source for the calculator and recipe browser.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Node 22 built-in test runner with a temporary TypeScript compile step.

---

## Execution Notes

- Do not commit unless the user explicitly asks for a commit.
- Preserve unrelated existing changes in `src/app/layout.tsx` and `src/app/globals.css`.
- Next.js docs checked before planning:
  - `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Because inventory inputs need `useState` and event handlers, the dashboard component must use `"use client"`.
- The approved design spec is `docs/superpowers/specs/2026-06-04-drd-helper-design.md`.

## File Structure

- Modify: `.gitignore`
  - Add `.test-build/` so compiled test output stays untracked.
- Modify: `package.json`
  - Add `test:logic` script.
- Create: `tsconfig.test.json`
  - Compile only DRD helper TypeScript files into `.test-build`.
- Create: `src/features/drd-helper/types.ts`
  - Shared grade, unit, recipe, inventory, and shortage types.
- Create: `src/features/drd-helper/data.ts`
  - Unit catalog, recipe definitions, target grade list, and helper functions.
- Create: `src/features/drd-helper/calculator.ts`
  - Pure shortage calculation functions.
- Create: `src/features/drd-helper/calculator.test.ts`
  - Node test-runner coverage for approved calculation examples.
- Create: `src/features/drd-helper/Dashboard.tsx`
  - Interactive dashboard UI.
- Modify: `src/app/page.tsx`
  - Replace starter page with the dashboard import.
- Modify: `src/app/layout.tsx`
  - Update metadata and language only if the existing file still has starter values.
- Modify: `src/app/globals.css`
  - Keep Tailwind import and global tokens, then tune base background/text for the dashboard.

## Task 1: Add Logic Test Harness

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Create: `tsconfig.test.json`

- [ ] **Step 1: Add temporary test output to `.gitignore`**

Append this line if it is not already present:

```gitignore
.test-build/
```

- [ ] **Step 2: Add the logic test script**

Modify `package.json` scripts to include `test:logic`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:logic": "tsc -p tsconfig.test.json && node --test .test-build/src/features/drd-helper/calculator.test.js"
  }
}
```

- [ ] **Step 3: Create `tsconfig.test.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": ".test-build",
    "rootDir": ".",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "types": ["node"],
    "incremental": false,
    "tsBuildInfoFile": ".test-build/tsconfig.test.tsbuildinfo"
  },
  "include": ["src/features/drd-helper/**/*.ts"]
}
```

- [ ] **Step 4: Run the script before tests exist**

Run:

```powershell
npm run test:logic
```

Expected: FAIL with `TS18003: No inputs were found` because Task 2 has not created any matching files under `src/features/drd-helper/` yet.

## Task 2: Define Domain Types and Failing Calculator Tests

**Files:**
- Create: `src/features/drd-helper/types.ts`
- Create: `src/features/drd-helper/calculator.test.ts`

- [ ] **Step 1: Create `types.ts`**

```ts
export type Grade =
  | "레어"
  | "영웅"
  | "영웅+"
  | "유니크"
  | "서사"
  | "서사+"
  | "전설"
  | "전설+"
  | "신화"
  | "초월"
  | "초월+"
  | "에픽"
  | "절대";

export type RareUnitName =
  | "손오공"
  | "베지터"
  | "피콜로"
  | "손오천"
  | "손오반"
  | "트랭크스";

export type UnitId = `${Grade}:${string}`;

export type UnitDefinition = {
  id: UnitId;
  grade: Grade;
  name: string;
};

export type UnitMaterial = {
  type: "unit";
  unitId: UnitId;
  count: number;
};

export type GasMaterial = {
  type: "gas";
  count: number;
};

export type Material = UnitMaterial | GasMaterial;

export type Recipe = {
  targetId: UnitId;
  materials: Material[];
};

export type Inventory = {
  gas: number;
  units: Partial<Record<UnitId, number>>;
};

export type RareCounts = Record<RareUnitName, number>;

export type Shortage = {
  rareShortage: RareCounts;
  gasShortage: number;
  craftable: boolean;
};
```

- [ ] **Step 2: Write failing calculator tests**

Create `src/features/drd-helper/calculator.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { calculateShortage, createEmptyInventory } from "./calculator";
import { emptyRareCounts, unitId } from "./data";

function rareCounts(overrides: Partial<ReturnType<typeof emptyRareCounts>>) {
  return { ...emptyRareCounts(), ...overrides };
}

test("서사 손오공 with no inventory expands to rare 손오공 x4 and gas 4", () => {
  const result = calculateShortage(
    unitId("서사", "손오공"),
    createEmptyInventory(),
  );

  assert.deepEqual(result.rareShortage, rareCounts({ 손오공: 4 }));
  assert.equal(result.gasShortage, 4);
  assert.equal(result.craftable, false);
});

test("owned intermediate unit reduces only the missing branch and keeps target gas", () => {
  const result = calculateShortage(unitId("서사", "손오공"), {
    gas: 0,
    units: {
      [unitId("영웅", "손오공")]: 1,
    },
  });

  assert.deepEqual(result.rareShortage, rareCounts({ 손오공: 2 }));
  assert.equal(result.gasShortage, 3);
});

test("owned gas is consumed before reporting gas shortage", () => {
  const result = calculateShortage(unitId("서사", "손오공"), {
    gas: 2,
    units: {
      [unitId("영웅", "손오공")]: 1,
    },
  });

  assert.deepEqual(result.rareShortage, rareCounts({ 손오공: 2 }));
  assert.equal(result.gasShortage, 1);
});

test("서사+ 슈퍼 우부 uses 영웅+ 우부 and 영웅+ Mr. 부우", () => {
  const result = calculateShortage(unitId("서사+", "슈퍼 우부"), {
    gas: 0,
    units: {
      [unitId("영웅+", "우부")]: 1,
    },
  });

  assert.deepEqual(
    result.rareShortage,
    rareCounts({ 손오천: 1, 트랭크스: 1, 피콜로: 1 }),
  );
  assert.equal(result.gasShortage, 1);
});

test("신화 비루스 expands from 전설 베지터 x2 and gas 8", () => {
  const result = calculateShortage(
    unitId("신화", "비루스"),
    createEmptyInventory(),
  );

  assert.deepEqual(result.rareShortage, rareCounts({ 베지터: 16 }));
  assert.equal(result.gasShortage, 32);
});

test("절대 슈퍼 사이어인 5 손오공 does not require 신화 손오공 directly", () => {
  const withoutMythic = calculateShortage(
    unitId("절대", "슈퍼 사이어인 5 손오공"),
    createEmptyInventory(),
  );
  const withMythicGoku = calculateShortage(unitId("절대", "슈퍼 사이어인 5 손오공"), {
    gas: 0,
    units: {
      [unitId("신화", "손오공")]: 1,
    },
  });

  assert.deepEqual(withMythicGoku, withoutMythic);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```powershell
npm run test:logic
```

Expected: FAIL with module-not-found errors for `./calculator` and `./data`.

## Task 3: Add Unit Catalog and Recipe Data

**Files:**
- Create: `src/features/drd-helper/data.ts`

- [ ] **Step 1: Create the data module**

Create `src/features/drd-helper/data.ts` with this structure:

```ts
import type {
  GasMaterial,
  Grade,
  Material,
  RareCounts,
  RareUnitName,
  Recipe,
  UnitDefinition,
  UnitId,
} from "./types";

export const grades: Grade[] = [
  "레어",
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
];

export const rareUnitNames: RareUnitName[] = [
  "손오공",
  "베지터",
  "피콜로",
  "손오천",
  "손오반",
  "트랭크스",
];

export const targetGrades: Grade[] = [
  "서사+",
  "전설+",
  "신화",
  "초월",
  "초월+",
  "에픽",
  "절대",
];

export function unitId(grade: Grade, name: string): UnitId {
  return `${grade}:${name}`;
}

function unit(grade: Grade, name: string): UnitDefinition {
  return { id: unitId(grade, name), grade, name };
}

function material(grade: Grade, name: string, count = 1): Material {
  return { type: "unit", unitId: unitId(grade, name), count };
}

function gas(count: number): GasMaterial {
  return { type: "gas", count };
}

function recipe(grade: Grade, name: string, materials: Material[]): Recipe {
  return { targetId: unitId(grade, name), materials };
}

export function emptyRareCounts(): RareCounts {
  return {
    손오공: 0,
    베지터: 0,
    피콜로: 0,
    손오천: 0,
    손오반: 0,
    트랭크스: 0,
  };
}
```

- [ ] **Step 2: Add the complete `units` list**

Continue `data.ts` with all approved units from `docs/superpowers/specs/2026-06-04-drd-helper-design.md`:

```ts
export const units: UnitDefinition[] = [
  unit("레어", "손오공"),
  unit("레어", "베지터"),
  unit("레어", "피콜로"),
  unit("레어", "손오천"),
  unit("레어", "손오반"),
  unit("레어", "트랭크스"),
  unit("영웅", "손오공"),
  unit("영웅", "베지터"),
  unit("영웅", "피콜로"),
  unit("영웅", "손오반"),
  unit("영웅", "오천크스"),
  unit("영웅+", "마인 베지터"),
  unit("영웅+", "각성 피콜로"),
  unit("영웅+", "Mr. 부우"),
  unit("영웅+", "우부"),
  unit("유니크", "Mr. 사탄"),
  unit("서사", "손오공"),
  unit("서사", "베지터"),
  unit("서사", "손오반"),
  unit("서사", "오천크스"),
  unit("서사+", "슈퍼 사이어인 오지터"),
  unit("서사+", "슈퍼 사이어인 베지트"),
  unit("서사+", "슈퍼 사이어인 갓 손오공"),
  unit("서사+", "슈퍼 사이어인 갓 베지터"),
  unit("서사+", "재각성 손오반"),
  unit("서사+", "슈퍼 사이어인 4 손오공"),
  unit("서사+", "슈퍼 사이어인 4 베지터"),
  unit("서사+", "슈퍼 우부"),
  unit("전설", "손오공"),
  unit("전설", "베지터"),
  unit("전설+", "슈퍼 사이어인 블루 계왕권 손오공"),
  unit("전설+", "슈퍼 사이어인 블루 베지터"),
  unit("전설+", "오렌지 피콜로"),
  unit("전설+", "슈퍼 사이어인 4 한계돌파 손오공"),
  unit("전설+", "슈퍼 사이어인 4 한계돌파 베지터"),
  unit("신화", "손오공"),
  unit("신화", "비루스"),
  unit("초월", "슈퍼 사이어인 블루 오지터"),
  unit("초월", "슈퍼 사이어인 블루 베지트"),
  unit("초월", "슈퍼 사이어인 4 오지터"),
  unit("초월", "슈퍼 사이어인 4 베지트"),
  unit("초월+", "원기 검 트랭크스"),
  unit("초월+", "슈퍼 사이어인 블루 계왕권 오지터"),
  unit("초월+", "슈퍼 사이어인 블루 베지트"),
  unit("초월+", "슈퍼 사이어인 4 한계돌파 오지터"),
  unit("초월+", "슈퍼 사이어인 4 한계돌파 베지트"),
  unit("에픽", "팡"),
  unit("절대", "슈퍼 사이어인 5 손오공"),
  unit("절대", "무의식의 극의 완성형 손오공"),
  unit("절대", "자의식의 극의 베지터"),
  unit("절대", "비스트 손오반"),
];
```

- [ ] **Step 3: Add recipes exactly from the approved spec**

Continue `data.ts` with a `recipes` array. Use the recipe list in `docs/superpowers/specs/2026-06-04-drd-helper-design.md` exactly. The first, correction-sensitive, and final entries should match this shape:

```ts
export const recipes: Recipe[] = [
  recipe("영웅", "손오공", [material("레어", "손오공", 2), gas(1)]),
  recipe("영웅", "베지터", [material("레어", "베지터", 2), gas(1)]),
  recipe("영웅", "피콜로", [material("레어", "피콜로", 2), gas(1)]),
  recipe("영웅", "손오반", [material("레어", "손오반", 2), gas(1)]),
  recipe("영웅", "오천크스", [
    material("레어", "손오천"),
    material("레어", "트랭크스"),
    gas(1),
  ]),
  recipe("영웅+", "마인 베지터", [
    material("영웅", "베지터"),
    material("레어", "베지터"),
  ]),
  recipe("영웅+", "각성 피콜로", [material("레어", "피콜로", 3)]),
  recipe("영웅+", "Mr. 부우", [
    material("영웅", "오천크스"),
    material("레어", "피콜로"),
  ]),
  recipe("영웅+", "우부", [
    material("영웅+", "Mr. 부우"),
    material("레어", "손오공"),
  ]),
  recipe("유니크", "Mr. 사탄", [
    material("영웅+", "Mr. 부우"),
    material("레어", "손오공"),
    material("레어", "베지터"),
  ]),
  recipe("서사", "손오공", [material("영웅", "손오공", 2), gas(2)]),
  recipe("서사", "베지터", [material("영웅", "베지터", 2), gas(2)]),
  recipe("서사", "손오반", [material("영웅", "손오반", 2), gas(2)]),
  recipe("서사", "오천크스", [material("영웅", "오천크스", 2), gas(2)]),
  recipe("서사+", "슈퍼 사이어인 오지터", [
    material("서사", "손오공"),
    material("영웅", "베지터"),
  ]),
  recipe("서사+", "슈퍼 우부", [
    material("영웅+", "우부"),
    material("영웅+", "Mr. 부우"),
  ]),
  recipe("신화", "손오공", [material("전설", "손오공", 2), gas(8)]),
  recipe("신화", "비루스", [material("전설", "베지터", 2), gas(8)]),
  recipe("절대", "슈퍼 사이어인 5 손오공", [
    material("초월", "슈퍼 사이어인 4 오지터"),
    material("전설+", "슈퍼 사이어인 4 한계돌파 손오공", 2),
    material("서사+", "슈퍼 사이어인 4 손오공"),
    material("서사+", "슈퍼 우부"),
    material("서사", "손오공"),
    material("레어", "손오공"),
    material("영웅+", "우부"),
    material("영웅", "손오공"),
    material("에픽", "팡"),
  ]),
  recipe("절대", "비스트 손오반", [
    material("전설+", "오렌지 피콜로", 2),
    material("서사+", "재각성 손오반", 6),
    material("서사", "손오반"),
    material("영웅", "손오반"),
    material("레어", "손오반"),
    material("에픽", "팡"),
  ]),
];
```

Before moving on, verify every recipe in the spec's `Recipe Data` section is represented exactly once. Every non-rare unit except direct base inputs should either have a recipe or be intentionally absent from `recipes`.

- [ ] **Step 4: Add data lookup helpers**

Append:

```ts
export const unitsById = new Map(units.map((entry) => [entry.id, entry]));
export const recipesByTargetId = new Map(
  recipes.map((entry) => [entry.targetId, entry]),
);

export function unitsForGrade(grade: Grade): UnitDefinition[] {
  return units.filter((entry) => entry.grade === grade);
}

export function isRareUnit(unitIdValue: UnitId): boolean {
  const unitDefinition = unitsById.get(unitIdValue);
  return unitDefinition?.grade === "레어";
}
```

- [ ] **Step 5: Run tests to verify calculator still fails**

Run:

```powershell
npm run test:logic
```

Expected: FAIL with module-not-found for `./calculator`.

## Task 4: Implement Shortage Calculator

**Files:**
- Create: `src/features/drd-helper/calculator.ts`
- Test: `src/features/drd-helper/calculator.test.ts`

- [ ] **Step 1: Create `calculator.ts`**

```ts
import {
  emptyRareCounts,
  rareUnitNames,
  recipesByTargetId,
  unitsById,
} from "./data";
import type { Inventory, RareCounts, Shortage, UnitId } from "./types";

function normalizeCount(value: number | undefined): number {
  if (!Number.isFinite(value) || value === undefined) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

export function createEmptyInventory(): Inventory {
  return {
    gas: 0,
    units: {},
  };
}

function cloneInventory(inventory: Inventory): Inventory {
  return {
    gas: normalizeCount(inventory.gas),
    units: { ...inventory.units },
  };
}

function isRareUnitId(unitId: UnitId): boolean {
  return unitsById.get(unitId)?.grade === "레어";
}

function addRareShortage(
  rareShortage: RareCounts,
  unitId: UnitId,
  count: number,
) {
  const unitDefinition = unitsById.get(unitId);

  if (!unitDefinition || unitDefinition.grade !== "레어") {
    throw new Error(`Expected rare unit but received ${unitId}`);
  }

  const rareName = unitDefinition.name;

  if (!rareUnitNames.includes(rareName as keyof RareCounts)) {
    throw new Error(`Unknown rare unit ${unitId}`);
  }

  rareShortage[rareName as keyof RareCounts] += count;
}

export function calculateShortage(targetUnitId: UnitId, inventory: Inventory): Shortage {
  const remainingInventory = cloneInventory(inventory);
  const rareShortage = emptyRareCounts();
  let gasShortage = 0;

  function consumeGas(count: number) {
    const required = normalizeCount(count);
    const used = Math.min(remainingInventory.gas, required);
    remainingInventory.gas -= used;
    gasShortage += required - used;
  }

  function resolveUnit(unitId: UnitId, count: number) {
    const required = normalizeCount(count);

    if (required === 0) {
      return;
    }

    const owned = normalizeCount(remainingInventory.units[unitId]);
    const used = Math.min(owned, required);

    if (used > 0) {
      remainingInventory.units[unitId] = owned - used;
    }

    const missing = required - used;

    if (missing === 0) {
      return;
    }

    if (isRareUnitId(unitId)) {
      addRareShortage(rareShortage, unitId, missing);
      return;
    }

    const recipe = recipesByTargetId.get(unitId);

    if (!recipe) {
      throw new Error(`Missing recipe for ${unitId}`);
    }

    for (const material of recipe.materials) {
      if (material.type === "gas") {
        consumeGas(material.count * missing);
      } else {
        resolveUnit(material.unitId, material.count * missing);
      }
    }
  }

  resolveUnit(targetUnitId, 1);

  return {
    rareShortage,
    gasShortage,
    craftable:
      gasShortage === 0 &&
      Object.values(rareShortage).every((count) => count === 0),
  };
}
```

- [ ] **Step 2: Run calculator tests**

Run:

```powershell
npm run test:logic
```

Expected: PASS for the calculator tests. If the `신화 비루스` gas result fails, check that nested 전설 and 서사 gas costs are included.

## Task 5: Build Dashboard Component

**Files:**
- Create: `src/features/drd-helper/Dashboard.tsx`

- [ ] **Step 1: Create the Client Component shell**

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  grades,
  recipesByTargetId,
  targetGrades,
  unitsForGrade,
} from "./data";
import { calculateShortage, createEmptyInventory } from "./calculator";
import type { Grade, Inventory, UnitDefinition, UnitId } from "./types";

function formatMaterial(unitIdValue: UnitId) {
  const [grade, name] = unitIdValue.split(":");
  return `[${grade}] ${name}`;
}

function sanitizeCount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function Dashboard() {
  const [inventory, setInventory] = useState<Inventory>(() =>
    createEmptyInventory(),
  );

  const targetUnits = useMemo(
    () => targetGrades.flatMap((grade) => unitsForGrade(grade)),
    [],
  );

  const results = useMemo(
    () =>
      targetUnits.map((target) => ({
        target,
        shortage: calculateShortage(target.id, inventory),
      })),
    [inventory, targetUnits],
  );

  function updateGas(value: string) {
    setInventory((current) => ({
      ...current,
      gas: sanitizeCount(value),
    }));
  }

  function updateUnit(unit: UnitDefinition, value: string) {
    setInventory((current) => ({
      ...current,
      units: {
        ...current.units,
        [unit.id]: sanitizeCount(value),
      },
    }));
  }

  function resetInventory() {
    setInventory(createEmptyInventory());
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500">
              드래곤볼 운빨 디펜스 Helper
            </p>
            <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">
              인벤토리 조합 시뮬레이터
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600">
              보유 유닛과 가스를 입력하면 상위 유닛별 부족 재료를 레어 유닛과 가스 기준으로 계산합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-zinc-600">가스</span>
              <input
                className="h-9 w-24 rounded border border-zinc-200 px-3 text-right text-sm outline-none focus:border-zinc-400"
                min={0}
                type="number"
                value={inventory.gas}
                onChange={(event) => updateGas(event.target.value)}
              />
            </label>
            <button
              className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              type="button"
              onClick={resetInventory}
            >
              초기화
            </button>
          </div>
        </header>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add the three dashboard sections**

Inside the outer `<div>` after `<header>`, add a responsive grid:

```tsx
<section className="grid gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(420px,1fr)_minmax(320px,420px)]">
  <InventoryPanel inventory={inventory} onChangeUnit={updateUnit} />
  <ResultsPanel results={results} />
  <RecipePanel />
</section>
```

Then add these helper components in the same file below `Dashboard`:

```tsx
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InventoryPanel({
  inventory,
  onChangeUnit,
}: {
  inventory: Inventory;
  onChangeUnit: (unit: UnitDefinition, value: string) => void;
}) {
  return (
    <Panel title="보유 유닛">
      <div className="space-y-6">
        {grades.map((grade) => (
          <GradeInventoryGroup
            grade={grade}
            inventory={inventory}
            key={grade}
            onChangeUnit={onChangeUnit}
          />
        ))}
      </div>
    </Panel>
  );
}

function GradeInventoryGroup({
  grade,
  inventory,
  onChangeUnit,
}: {
  grade: Grade;
  inventory: Inventory;
  onChangeUnit: (unit: UnitDefinition, value: string) => void;
}) {
  const units = unitsForGrade(grade);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-normal text-zinc-500">
        {grade}
      </h3>
      <div className="space-y-2">
        {units.map((unit) => (
          <label
            className="flex min-h-10 items-center justify-between gap-3 rounded border border-zinc-200 px-3 py-2"
            key={unit.id}
          >
            <span className="text-sm text-zinc-700">{unit.name}</span>
            <input
              className="h-8 w-16 rounded border border-zinc-200 px-2 text-right text-sm outline-none focus:border-zinc-400"
              min={0}
              type="number"
              value={inventory.units[unit.id] ?? 0}
              onChange={(event) => onChangeUnit(unit, event.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add results and recipe panels**

Append:

```tsx
function ResultsPanel({
  results,
}: {
  results: {
    target: UnitDefinition;
    shortage: ReturnType<typeof calculateShortage>;
  }[];
}) {
  return (
    <Panel title="상위 유닛 결과">
      <div className="space-y-3">
        {results.map(({ target, shortage }) => (
          <article
            className="rounded-lg border border-zinc-200 p-4"
            key={target.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-500">
                  {target.grade}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-950">
                  {target.name}
                </h3>
              </div>
              <span
                className={
                  shortage.craftable
                    ? "rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                    : "rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600"
                }
              >
                {shortage.craftable ? "조합 가능" : "재료 부족"}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
              {Object.entries(shortage.rareShortage)
                .filter(([, count]) => count > 0)
                .map(([name, count]) => (
                  <div className="flex justify-between rounded border border-zinc-100 px-3 py-2" key={name}>
                    <span>{name}</span>
                    <strong className="font-semibold">{count}</strong>
                  </div>
                ))}
              {shortage.gasShortage > 0 && (
                <div className="flex justify-between rounded border border-zinc-100 px-3 py-2">
                  <span>가스</span>
                  <strong className="font-semibold">{shortage.gasShortage}</strong>
                </div>
              )}
              {shortage.craftable && (
                <p className="text-sm text-zinc-500">부족한 재료가 없습니다.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function RecipePanel() {
  const recipeTargets = grades
    .flatMap((grade) => unitsForGrade(grade))
    .filter((unit) => recipesByTargetId.has(unit.id));

  return (
    <Panel title="조합법">
      <div className="space-y-4">
        {recipeTargets.map((target) => {
          const recipe = recipesByTargetId.get(target.id);

          if (!recipe) {
            return null;
          }

          return (
            <article className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0" key={target.id}>
              <p className="text-xs font-medium text-zinc-500">{target.grade}</p>
              <h3 className="mt-1 text-sm font-semibold text-zinc-950">{target.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {recipe.materials
                  .map((entry) =>
                    entry.type === "gas"
                      ? `가스 ${entry.count}`
                      : `${formatMaterial(entry.unitId)}${entry.count > 1 ? ` x${entry.count}` : ""}`,
                  )
                  .join(" + ")}
              </p>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
```

- [ ] **Step 4: Run lint to catch JSX/type issues**

Run:

```powershell
npm run lint
```

Expected: PASS. Fix only issues introduced by this dashboard code.

## Task 6: Wire the App Route and Global Presentation

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace starter page**

Replace `src/app/page.tsx` with:

```tsx
import Dashboard from "@/features/drd-helper/Dashboard";

export default function Home() {
  return <Dashboard />;
}
```

- [ ] **Step 2: Update metadata and language**

In `src/app/layout.tsx`, keep the existing structure but update the metadata and `html` language:

```tsx
export const metadata: Metadata = {
  title: "DRD Helper",
  description: "드래곤볼 운빨 디펜스 조합 계산기",
};
```

Set:

```tsx
<html lang="ko" className="h-full antialiased">
```

- [ ] **Step 3: Tune globals without broad refactors**

Keep `@import "tailwindcss";`. Use restrained base colors:

```css
:root {
  --background: #f7f7f8;
  --foreground: #171717;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

Remove starter dark-mode overrides only if they conflict with the solid dashboard background.

- [ ] **Step 4: Run app verification**

Run:

```powershell
npm run test:logic
npm run lint
npm run build
```

Expected: all PASS.

## Task 7: Manual UX Pass

**Files:**
- Modify only files touched in earlier tasks if spacing or readability issues appear.

- [ ] **Step 1: Start local dev server**

Run:

```powershell
npm run dev
```

Expected: Next.js dev server starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Check desktop layout**

Open the local URL and verify:

- Inventory, results, and recipe browser are visible as dashboard sections.
- The UI uses solid backgrounds, borders, and restrained colors.
- Inputs have enough padding and do not feel cramped.
- Result rows do not shift when counts change.
- Long Korean unit names wrap cleanly without overlapping adjacent controls.

- [ ] **Step 3: Check mobile layout**

Use a narrow viewport and verify:

- Sections stack vertically.
- Inputs remain usable.
- Long result names wrap without overlapping status badges.
- No text is clipped inside buttons or input rows.

- [ ] **Step 4: Final command verification**

Run:

```powershell
npm run test:logic
npm run lint
npm run build
```

Expected: all PASS.

## Self-Review

- Spec coverage: inventory input, target results, recipe browser, shared data, rare/gas shortage calculation, and restrained SaaS UI are each covered by tasks.
- Type consistency: `UnitId`, `Inventory`, `Shortage`, `Recipe`, `calculateShortage`, `createEmptyInventory`, `unitId`, and `emptyRareCounts` are defined before use.
- Commit handling: plan intentionally excludes commit steps because the user asked that commits only happen on explicit request.
