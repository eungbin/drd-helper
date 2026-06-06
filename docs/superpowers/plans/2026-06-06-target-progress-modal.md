# Target Progress Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the upper-unit result area into compact progress cards that open a detailed shortage/recipe modal.

**Architecture:** Keep calculation behavior in `src/features/drd-helper/calculator.ts` and keep Dashboard state ownership in `src/features/drd-helper/Dashboard.tsx`. Add a pure rare-progress helper first, then replace the expanded result cards with focused card and modal components that use the existing shortage and recipe data.

**Tech Stack:** Next.js 16 App Router, React 19 Client Components, TypeScript, Tailwind CSS 4, Node 22 built-in test runner through `npm run test:logic`.

---

## Execution Notes

- Approved design spec: `docs/superpowers/specs/2026-06-06-target-progress-modal-design.md`.
- Before editing React code, read the current Next.js client component guide at `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.
- Keep this refactor scoped to the target result area. Do not change inventory input behavior, target filters, mission board, SEO, or data definitions.
- Use existing local patterns: pure calculator tests in `calculator.test.ts`, source-level UI text checks in `dashboard-labels.test.ts`, and Tailwind classes inside `Dashboard.tsx`.
- Preserve Korean UI labels exactly as implemented in the source. If the terminal renders Korean text incorrectly, verify in the editor before editing.

## File Structure

- Modify: `src/features/drd-helper/calculator.ts`
  - Add rare-progress calculation helpers next to `calculateShortage`.
- Modify: `src/features/drd-helper/calculator.test.ts`
  - Add focused tests for rare progress and gas-excluded completion.
- Modify: `src/features/drd-helper/dashboard-labels.test.ts`
  - Add source checks for modal/card implementation labels and removal of a `상세 보기` chip.
- Modify: `src/features/drd-helper/Dashboard.tsx`
  - Track the selected target.
  - Render compact target cards.
  - Render modal details for the selected target.
  - Keep recipe material chip search behavior and close the modal when material search is triggered.

## Task 1: Add Rare Progress Calculator

**Files:**
- Modify: `src/features/drd-helper/calculator.test.ts`
- Modify: `src/features/drd-helper/calculator.ts`

- [ ] **Step 1: Write failing rare-progress tests**

Modify the existing `./calculator` import in `src/features/drd-helper/calculator.test.ts` to include the new helpers:

```ts
import {
  calculateRareProgress,
  calculateShortage,
  calculateRareProgressPercentage,
  createEmptyInventory,
} from "./calculator";
```

Add these test cases after the existing shortage tests:

```ts
test("rare progress is 0 percent with no inventory for a target with rare requirements", () => {
  const progress = calculateRareProgress(
    unitId("서사", "손오공"),
    createEmptyInventory(),
  );

  assert.equal(progress.totalRareRequired, 4);
  assert.equal(progress.missingRareRequired, 4);
  assert.equal(progress.percentage, 0);
});

test("rare progress increases proportionally with owned intermediate units", () => {
  const inventory = createEmptyInventory();
  inventory.units[unitId("영웅", "손오공")] = 1;

  const progress = calculateRareProgress(unitId("서사", "손오공"), inventory);

  assert.equal(progress.totalRareRequired, 4);
  assert.equal(progress.missingRareRequired, 2);
  assert.equal(progress.percentage, 50);
});

test("rare progress reaches 100 percent even when gas is missing", () => {
  const inventory = createEmptyInventory();
  inventory.units[unitId("레어", "손오공")] = 4;

  const shortage = calculateShortage(unitId("서사", "손오공"), inventory);
  const progress = calculateRareProgress(
    unitId("서사", "손오공"),
    inventory,
    shortage,
  );

  assert.equal(shortage.gasShortage, 4);
  assert.equal(shortage.craftable, false);
  assert.equal(progress.totalRareRequired, 4);
  assert.equal(progress.missingRareRequired, 0);
  assert.equal(progress.percentage, 100);
});

test("rare progress percentage returns 100 when total rare requirement is zero", () => {
  assert.equal(calculateRareProgressPercentage(0, 0), 100);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
npm run test:logic
```

Expected: FAIL with TypeScript errors that `calculateRareProgress` and `calculateRareProgressPercentage` are not exported from `./calculator`.

- [ ] **Step 3: Add the rare-progress implementation**

In `src/features/drd-helper/calculator.ts`, add this exported type below the imports:

```ts
export type RareProgress = {
  totalRareRequired: number;
  missingRareRequired: number;
  percentage: number;
};
```

Add these helpers near the bottom of the file, before `isRareUnitName`:

```ts
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
```

- [ ] **Step 4: Run tests to verify pass**

Run:

```powershell
npm run test:logic
```

Expected: PASS for all logic tests.

- [ ] **Step 5: Commit calculator progress helper**

Run:

```powershell
git -c safe.directory=D:/dev/nextjs/drd-helper add src/features/drd-helper/calculator.ts src/features/drd-helper/calculator.test.ts
git -c safe.directory=D:/dev/nextjs/drd-helper commit -m "Add rare progress calculation"
```

Expected: commit succeeds.

## Task 2: Add UI Source-Level Tests

**Files:**
- Modify: `src/features/drd-helper/dashboard-labels.test.ts`

- [ ] **Step 1: Write failing source checks**

Append this test to `src/features/drd-helper/dashboard-labels.test.ts`:

```ts
test("target result details move into an accessible modal with compact card labels", () => {
  const dashboardSource = readFileSync(
    join(process.cwd(), "src/features/drd-helper/Dashboard.tsx"),
    "utf8",
  );

  assert.match(dashboardSource, /function TargetResultCard/);
  assert.match(dashboardSource, /function TargetResultModal/);
  assert.match(dashboardSource, /role="dialog"/);
  assert.match(dashboardSource, /aria-modal="true"/);
  assert.match(dashboardSource, /가스 OK/);
  assert.match(dashboardSource, /가스 부족/);
  assert.match(dashboardSource, /부족한 레어 유닛/);
  assert.match(dashboardSource, /부족한 가스/);
  assert.match(dashboardSource, /조합법/);
  assert.doesNotMatch(dashboardSource, /상세 보기/);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
npm run test:logic
```

Expected: FAIL because `TargetResultCard`, `TargetResultModal`, `role="dialog"`, and card gas labels are not yet present in `Dashboard.tsx`.

## Task 3: Replace Expanded Result Cards With Compact Progress Cards

**Files:**
- Modify: `src/features/drd-helper/Dashboard.tsx`

- [ ] **Step 1: Update imports and selected-target state**

Modify the React import:

```tsx
import { useEffect, useState } from "react";
```

Modify the calculator import:

```tsx
import {
  calculateRareProgress,
  calculateShortage,
  createEmptyInventory,
} from "./calculator";
import type { RareProgress } from "./calculator";
```

Modify the type import:

```tsx
import type {
  Inventory,
  Material,
  Shortage,
  UnitDefinition,
  UnitId,
} from "./types";
```

Inside `Dashboard`, add state after `targetNameQuery`:

```tsx
const [selectedTargetId, setSelectedTargetId] = useState<UnitId | null>(null);
const selectedTarget = selectedTargetId
  ? unitsById.get(selectedTargetId)
  : undefined;
```

- [ ] **Step 2: Add modal close and Escape behavior**

Inside `Dashboard`, after `searchUnit`, add:

```tsx
function closeTargetModal() {
  setSelectedTargetId(null);
}
```

Change `searchUnit` to close the modal before applying filters:

```tsx
function searchUnit(unit: UnitDefinition) {
  setSelectedTargetId(null);
  setTargetGradeFilter(unit.grade);
  setTargetNameQuery(unit.name);
}
```

Add this effect before the `return`:

```tsx
useEffect(() => {
  if (!selectedTargetId) {
    return;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeTargetModal();
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);
}, [selectedTargetId]);
```

- [ ] **Step 3: Replace the target result card body**

In the `filteredTargetUnits.map((unit) => { ... })` block, replace the expanded `<article>` return with:

```tsx
const shortage = calculateShortage(unit.id, inventory);
const progress = calculateRareProgress(unit.id, inventory, shortage);

return (
  <TargetResultCard
    key={unit.id}
    progress={progress}
    shortage={shortage}
    unit={unit}
    onOpen={() => setSelectedTargetId(unit.id)}
  />
);
```

This removes the inline missing rare units, missing gas, and recipe sections from each card.

- [ ] **Step 4: Add compact card helper functions**

Below `InventoryPanel`, add:

```tsx
function getMissingRareUnits(shortage: Shortage) {
  return rareUnitNames
    .map((name) => ({
      name,
      count: shortage.rareShortage[name],
    }))
    .filter((entry) => entry.count > 0);
}

function getGasStatusLabel(shortage: Shortage): string {
  return shortage.gasShortage === 0
    ? "가스 OK"
    : `가스 부족 x${shortage.gasShortage}`;
}

function getProgressBarWidth(progress: RareProgress): string {
  return `${progress.percentage}%`;
}
```

- [ ] **Step 5: Add `TargetResultCard`**

Below the helpers from Step 4, add:

```tsx
function TargetResultCard({
  progress,
  shortage,
  unit,
  onOpen,
}: {
  progress: RareProgress;
  shortage: Shortage;
  unit: UnitDefinition;
  onOpen: () => void;
}) {
  return (
    <button
      className={
        shortage.craftable
          ? "w-full rounded-lg border border-emerald-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          : "w-full rounded-lg border border-zinc-200 bg-white p-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-100"
      }
      type="button"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-zinc-500">
            <GradeText grade={unit.grade} />
          </div>
          <h3 className="mt-1 break-words text-sm font-semibold leading-5 text-zinc-950">
            {unit.name}
          </h3>
        </div>
        <span
          className={
            progress.percentage === 100
              ? "shrink-0 text-sm font-semibold tabular-nums text-emerald-700"
              : "shrink-0 text-sm font-semibold tabular-nums text-zinc-700"
          }
        >
          {progress.percentage}%
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={
            shortage.gasShortage === 0
              ? "rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
              : "rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600"
          }
        >
          {getGasStatusLabel(shortage)}
        </span>
        <span className="text-xs text-zinc-500">레어 기준</span>
      </div>

      <div
        aria-hidden="true"
        className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200"
      >
        <div
          className={
            progress.percentage === 100 ? "h-full bg-emerald-500" : "h-full bg-emerald-400"
          }
          style={{ width: getProgressBarWidth(progress) }}
        />
      </div>
    </button>
  );
}
```

- [ ] **Step 6: Run tests to verify the source-level test still fails only for modal labels**

Run:

```powershell
npm run test:logic
```

Expected: FAIL because `TargetResultModal`, `role="dialog"`, `aria-modal="true"`, and modal detail labels are not implemented yet.

## Task 4: Add Target Detail Modal

**Files:**
- Modify: `src/features/drd-helper/Dashboard.tsx`

- [ ] **Step 1: Render the modal from `Dashboard`**

At the end of `Dashboard`'s returned `<main>`, after the main content `<div>` and before `</main>`, render the selected target modal:

```tsx
{selectedTarget ? (
  <SelectedTargetModal
    inventory={inventory}
    unit={selectedTarget}
    onClose={closeTargetModal}
    onSearchUnit={searchUnit}
  />
) : null}
```

Add `SelectedTargetModal` below `TargetResultCard`:

```tsx
function SelectedTargetModal({
  inventory,
  unit,
  onClose,
  onSearchUnit,
}: {
  inventory: Inventory;
  unit: UnitDefinition;
  onClose: () => void;
  onSearchUnit: (unit: UnitDefinition) => void;
}) {
  const shortage = calculateShortage(unit.id, inventory);
  const progress = calculateRareProgress(unit.id, inventory, shortage);

  return (
    <TargetResultModal
      progress={progress}
      shortage={shortage}
      unit={unit}
      onClose={onClose}
      onSearchUnit={onSearchUnit}
    />
  );
}
```

- [ ] **Step 2: Add `TargetResultModal`**

Add this component below `SelectedTargetModal`:

```tsx
function TargetResultModal({
  progress,
  shortage,
  unit,
  onClose,
  onSearchUnit,
}: {
  progress: RareProgress;
  shortage: Shortage;
  unit: UnitDefinition;
  onClose: () => void;
  onSearchUnit: (unit: UnitDefinition) => void;
}) {
  const missingRareUnits = getMissingRareUnits(shortage);
  const recipe = recipesByTargetId.get(unit.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="target-result-modal-title"
        aria-modal="true"
        className="max-h-[min(44rem,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 shadow-xl"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-zinc-500">
              <GradeText grade={unit.grade} />
            </div>
            <h3
              className="mt-1 break-words text-lg font-semibold leading-6 text-zinc-950"
              id="target-result-modal-title"
            >
              {unit.name}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 font-medium text-zinc-700">
                레어 진척도 {progress.percentage}%
              </span>
              <span
                className={
                  shortage.craftable
                    ? "rounded border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
                    : "rounded border border-zinc-200 bg-zinc-50 px-2 py-1 font-medium text-zinc-600"
                }
              >
                {shortage.craftable ? "조합 가능" : "재료 부족"}
              </span>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 font-medium text-zinc-700">
                {getGasStatusLabel(shortage)}
              </span>
            </div>
          </div>
          <button
            aria-label="상세 모달 닫기"
            className="h-9 w-9 shrink-0 rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-100"
            type="button"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <section className="rounded border border-zinc-200 bg-zinc-50 p-3">
            <h4 className="text-xs font-medium text-zinc-500">
              부족한 레어 유닛
            </h4>
            <div className="mt-2 text-sm text-zinc-800">
              {missingRareUnits.length === 0 ? (
                <span>없음</span>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {missingRareUnits.map((entry) => (
                    <li
                      className="rounded border border-zinc-200 bg-white px-2 py-1"
                      key={entry.name}
                    >
                      {entry.name} x{entry.count}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded border border-zinc-200 bg-zinc-50 p-3">
            <h4 className="text-xs font-medium text-zinc-500">부족한 가스</h4>
            <p className="mt-2 text-sm text-zinc-800">
              {shortage.gasShortage}
            </p>
          </section>

          <section className="rounded border border-zinc-200 bg-zinc-50 p-3">
            <h4 className="text-xs font-medium text-zinc-500">조합법</h4>
            <ul className="mt-2 flex flex-wrap gap-1.5 text-sm text-zinc-700">
              {recipe?.materials.map((material, index) => (
                <li
                  className="min-w-0 max-w-full"
                  key={`${unit.id}-${index}`}
                >
                  <MaterialChip
                    material={material}
                    onSearchUnit={onSearchUnit}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Run logic tests**

Run:

```powershell
npm run test:logic
```

Expected: PASS.

- [ ] **Step 4: Run lint**

Run:

```powershell
npm run lint
```

Expected: PASS. If lint flags a long ternary class expression, extract only that class expression to a small local variable inside the component.

- [ ] **Step 5: Commit compact target result UI**

Run:

```powershell
git -c safe.directory=D:/dev/nextjs/drd-helper add src/features/drd-helper/Dashboard.tsx src/features/drd-helper/dashboard-labels.test.ts
git -c safe.directory=D:/dev/nextjs/drd-helper commit -m "Refactor target results into progress cards"
```

Expected: commit succeeds.

## Task 5: Verify Build and Manual UX

**Files:**
- Modify only files touched in earlier tasks if verification reveals a real issue.

- [ ] **Step 1: Run full verification**

Run:

```powershell
npm run test:logic
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 2: Start local dev server**

Run:

```powershell
npm run dev
```

Expected: Next.js prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 3: Desktop manual check**

Open the local URL and verify:

- Target result cards show grade, unit name, percent, gas label, and progress bar.
- Cards no longer show missing rare units, missing gas, and recipe inline.
- Clicking anywhere on a card opens the modal.
- Modal shows missing rare units, missing gas, and recipe.
- Clicking a recipe material chip inside the modal closes the modal and applies target search.
- Long unit names wrap without overlapping the percentage or gas label.

- [ ] **Step 4: Keyboard check**

Verify:

- Tab can focus a target result card.
- Enter opens the modal.
- Space opens the modal.
- Escape closes the modal.
- Close button closes the modal.
- Backdrop click closes the modal.

- [ ] **Step 5: Mobile manual check**

Use a narrow viewport and verify:

- Target cards remain readable.
- Progress bar does not overlap text.
- Modal fits within the viewport and scrolls internally if content is tall.
- Background page scroll does not make the modal hard to use. If it does, add body scroll locking in `Dashboard.tsx` and rerun lint/build.

- [ ] **Step 6: Final verification**

Run:

```powershell
npm run test:logic
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 7: Final commit**

If any verification-only fixes were needed, commit them:

```powershell
git -c safe.directory=D:/dev/nextjs/drd-helper add src/features/drd-helper/Dashboard.tsx src/features/drd-helper/calculator.ts src/features/drd-helper/calculator.test.ts src/features/drd-helper/dashboard-labels.test.ts
git -c safe.directory=D:/dev/nextjs/drd-helper commit -m "Verify target progress modal behavior"
```

Expected: commit succeeds only if there are staged changes. If no fixes were needed, skip this commit.

## Self-Review

- Spec coverage:
  - Compact cards: Task 3.
  - Whole-card click: Task 3.
  - Detail modal: Task 4.
  - Rare progress bottom bar: Tasks 1 and 3.
  - Gas status on card: Tasks 3 and 4.
  - No `상세 보기` chip: Task 2 and Task 3.
  - Existing filter/search behavior preserved: Task 3 keeps existing search state and Task 4 reuses `searchUnit`.
  - Accessibility requirements: Tasks 3, 4, and 5.
  - Verification commands: Task 5.
- Red-flag scan: Checked for disallowed vague wording; none remains.
- Type consistency:
  - `RareProgress` is exported from `calculator.ts` before `Dashboard.tsx` imports it.
  - `Shortage` is imported from `types.ts`, where it already exists.
  - `calculateRareProgress` accepts the current `Shortage` as an optional third argument so the card render path does not need to calculate shortage twice.
