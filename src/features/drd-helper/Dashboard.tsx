"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import {
  calculateRareProgress,
  calculateShortage,
  createEmptyInventory,
} from "./calculator";
import type { RareProgress } from "./calculator";
import {
  grades,
  rareUnitNames,
  recipesByTargetId,
  unitsById,
  unitsForGrade,
} from "./data";
import { filterUnitsBySearch } from "./filters";
import type { GradeFilter } from "./filters";
import { gradeLabelParts } from "./grade-styles";
import { inventoryGrades } from "./inventory";
import { missions } from "./missions";
import {
  defaultTargetResultUnits,
  searchableTargetResultUnits,
  targetResultGradeOptions,
} from "./target-results";
import type {
  Inventory,
  Material,
  Shortage,
  UnitDefinition,
  UnitId,
} from "./types";

export default function Dashboard() {
  const [inventory, setInventory] = useState<Inventory>(() =>
    createEmptyInventory(),
  );
  const [targetGradeFilter, setTargetGradeFilter] =
    useState<GradeFilter>("all");
  const [targetNameQuery, setTargetNameQuery] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState<UnitId | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const targetSearchInputRef = useRef<HTMLInputElement | null>(null);
  const hasTargetSearch =
    targetGradeFilter !== "all" || targetNameQuery.trim().length > 0;
  const targetSearchUnits = hasTargetSearch
    ? searchableTargetResultUnits
    : defaultTargetResultUnits;
  const filteredTargetUnits = filterUnitsBySearch(targetSearchUnits, {
    grade: targetGradeFilter,
    nameQuery: targetNameQuery,
  });
  const selectedTarget = selectedTargetId
    ? unitsById.get(selectedTargetId)
    : undefined;

  function updateGas(value: string) {
    setInventory((current) => ({
      ...current,
      gas: sanitizeCount(value),
    }));
  }

  function updateUnit(unitId: UnitId, value: string) {
    const count = sanitizeCount(value);

    setInventory((current) => ({
      ...current,
      units: {
        ...current.units,
        [unitId]: count,
      },
    }));
  }

  function resetInventory() {
    setInventory(createEmptyInventory());
  }

  function resetTargetSearch() {
    setTargetGradeFilter("all");
    setTargetNameQuery("");
  }

  function openTargetModal(unitId: UnitId) {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSelectedTargetId(unitId);
  }

  const closeTargetModal = useCallback(() => {
    const previousFocus = previousFocusRef.current;
    setSelectedTargetId(null);
    if (previousFocus) {
      previousFocusRef.current?.focus();
    }
    previousFocusRef.current = null;
  }, []);

  const closeTargetModalWithoutFocusRestore = useCallback(() => {
    previousFocusRef.current = null;
    setSelectedTargetId(null);
  }, []);

  useEffect(() => {
    if (!selectedTargetId) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeTargetModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeTargetModal, selectedTargetId]);

  function searchUnit(unit: UnitDefinition) {
    closeTargetModalWithoutFocusRestore();
    setTargetGradeFilter(unit.grade);
    setTargetNameQuery(unit.name);
    targetSearchInputRef.current?.focus();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8 xl:px-[21rem]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-500">DRD Helper</p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
                드래곤볼 운빨 디펜스 조합 계산기
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                보유 유닛과 가스를 입력하면 상위 유닛별 부족 재료와
                조합법을 빠르게 확인하는 공략 도우미입니다.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                가스
                <input
                  className="h-10 w-full rounded border border-zinc-300 bg-white px-3 text-sm tabular-nums text-zinc-950 outline-none transition focus:border-zinc-500 sm:w-36"
                  min={0}
                  step={1}
                  type="number"
                  value={inventory.gas}
                  onChange={(event) => updateGas(event.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <InventoryPanel
          inventory={inventory}
          onReset={resetInventory}
          onUnitChange={updateUnit}
        />

        <div className="grid gap-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-zinc-950">
                상위 유닛 계산
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                부족 재료와 조합법을 같은 카드에서 확인합니다.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-end">
                <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                  등급
                  <select
                    className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500"
                    value={targetGradeFilter}
                    onChange={(event) =>
                      setTargetGradeFilter(event.target.value as GradeFilter)
                    }
                  >
                    <option value="all">전체 등급</option>
                    {targetResultGradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                  이름 검색
                  <input
                    className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500"
                    placeholder="예: 손오공"
                    ref={targetSearchInputRef}
                    type="search"
                    value={targetNameQuery}
                    onChange={(event) => setTargetNameQuery(event.target.value)}
                  />
                </label>
                <button
                  className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-white"
                  disabled={!hasTargetSearch}
                  type="button"
                  onClick={resetTargetSearch}
                >
                  초기화
                </button>
              </div>

              <div className="mt-4 grid gap-2 min-[1920px]:grid-cols-2">
                {filteredTargetUnits.length === 0 ? (
                  <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 min-[1920px]:col-span-2">
                    검색 결과가 없습니다.
                  </p>
                ) : (
                  filteredTargetUnits.map((unit) => {
                    const shortage = calculateShortage(unit.id, inventory);
                    const progress = calculateRareProgress(
                      unit.id,
                      inventory,
                      shortage,
                    );

                    return (
                      <TargetResultCard
                        key={unit.id}
                        progress={progress}
                        shortage={shortage}
                        unit={unit}
                        onOpen={() => openTargetModal(unit.id)}
                      />
                    );
                  })
                )}
              </div>
          </section>
        </div>

        <MissionBoard />
      </div>
      {selectedTarget ? (
        <SelectedTargetModal
          inventory={inventory}
          unit={selectedTarget}
          onClose={closeTargetModal}
          onSearchUnit={searchUnit}
        />
      ) : null}
    </main>
  );
}

function InventoryPanel({
  inventory,
  onReset,
  onUnitChange,
}: {
  inventory: Inventory;
  onReset: () => void;
  onUnitChange: (unitId: UnitId, value: string) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 xl:fixed xl:left-6 xl:top-6 xl:z-20 xl:max-h-[calc(100vh-3rem)] xl:w-72 xl:overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-zinc-950">보유 유닛</h2>
          <p className="mt-1 text-sm text-zinc-500">
            주요 등급의 보유 수량을 입력하세요.
          </p>
        </div>
        <button
          className="h-10 shrink-0 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
          type="button"
          onClick={onReset}
        >
          초기화
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {inventoryGrades.map((grade) => {
          const gradeUnits = unitsForGrade(grade);

          if (gradeUnits.length === 0) {
            return null;
          }

          return (
            <section
              className="border-t border-zinc-200 pt-4 first:border-t-0 first:pt-0"
              key={grade}
            >
              <h3 className="mb-2 text-sm font-semibold">
                <GradeText grade={grade} />
              </h3>
              <div className="grid gap-2">
                {gradeUnits.map((unit) => (
                  <label
                    className="grid grid-cols-[minmax(0,1fr)_4.75rem] items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2"
                    key={unit.id}
                  >
                    <span className="min-w-0 break-words text-sm leading-5 text-zinc-800">
                      {unit.name}
                    </span>
                    <input
                      className="h-9 rounded border border-zinc-300 bg-white px-2 text-right text-sm tabular-nums text-zinc-950 outline-none transition focus:border-zinc-500"
                      min={0}
                      step={1}
                      type="number"
                      value={inventory.units[unit.id] ?? 0}
                      onChange={(event) =>
                        onUnitChange(unit.id, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function getMissingRareUnits(shortage: Shortage) {
  return rareUnitNames
    .map((name) => ({
      name,
      count: shortage.rareShortage[name],
    }))
    .filter((entry) => entry.count > 0);
}

function getGasStatusLabel(shortage: Shortage): string {
  if (shortage.gasShortage === 0) {
    return "가스 OK";
  }

  return `가스 부족 x${shortage.gasShortage}`;
}

function getProgressBarWidth(progress: RareProgress): string {
  return `${progress.percentage}%`;
}

function getModalFocusableElements(dialog: HTMLElement | null): HTMLElement[] {
  if (!dialog) {
    return [];
  }

  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  return Array.from(dialog.querySelectorAll<HTMLElement>(selector));
}

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
  const gasStatusLabel = getGasStatusLabel(shortage);
  const missingRareUnits = getMissingRareUnits(shortage);
  const progressBarClassName =
    missingRareUnits.length === 0
      ? "block h-full bg-emerald-500"
      : "block h-full bg-sky-500";

  return (
    <button
      aria-haspopup="dialog"
      className="relative block w-full overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 pb-4 text-left text-zinc-950 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
      type="button"
      onClick={onOpen}
    >
      <span className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <span className="min-w-0">
          <span className="block text-xs font-medium text-zinc-500">
            <GradeText grade={unit.grade} />
          </span>
          <span className="mt-1 block break-words text-sm font-semibold leading-5 text-zinc-950">
            {unit.name}
          </span>
        </span>
        <span
          className={
            shortage.gasShortage === 0
              ? "w-fit rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
              : "w-fit rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
          }
        >
          {gasStatusLabel}
        </span>
      </span>

      <span className="mt-4 flex items-end justify-between gap-3">
        <span className="text-xs font-medium text-zinc-500">레어 기준</span>
        <span className="text-2xl font-semibold tabular-nums text-zinc-950">
          {progress.percentage}%
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 h-1 bg-zinc-100">
        <span
          className={progressBarClassName}
          style={{ width: getProgressBarWidth(progress) }}
        />
      </span>
    </button>
  );
}

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
  const gasStatusLabel = getGasStatusLabel(shortage);
  const missingRareUnits = getMissingRareUnits(shortage);
  const recipe = recipesByTargetId.get(unit.id);
  const materialStatusLabel = shortage.craftable ? "조합 가능" : "재료 부족";
  const materialStatusClassName = shortage.craftable
    ? "rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
    : "rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700";
  const gasStatusClassName =
    shortage.gasShortage === 0
      ? "rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
      : "rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700";
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Tab") {
      const focusableElements = getModalFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      const focusIsOutsideDialog =
        !activeElement || !dialogRef.current?.contains(activeElement);

      if (event.shiftKey) {
        if (activeElement === firstElement || focusIsOutsideDialog) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (activeElement === lastElement || focusIsOutsideDialog) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 py-6"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="target-result-modal-title"
        aria-modal="true"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 shadow-xl"
        ref={dialogRef}
        role="dialog"
        onKeyDown={handleDialogKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500">
              <GradeText grade={unit.grade} />
            </p>
            <h2
              className="mt-1 break-words text-lg font-semibold leading-6 text-zinc-950"
              id="target-result-modal-title"
            >
              {unit.name}
            </h2>
          </div>
          <button
            aria-label="상세 모달 닫기"
            className="h-8 w-8 shrink-0 rounded border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-medium text-zinc-500">레어 기준</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950">
              {progress.percentage}%
            </p>
          </div>
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-medium text-zinc-500">재료 상태</p>
            <p className="mt-2">
              <span className={materialStatusClassName}>
                {materialStatusLabel}
              </span>
            </p>
          </div>
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-medium text-zinc-500">가스 상태</p>
            <p className="mt-2">
              <span className={gasStatusClassName}>{gasStatusLabel}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <section>
            <h3 className="text-sm font-semibold text-zinc-950">
              부족한 레어 유닛
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-700">
              {missingRareUnits.length === 0 ? (
                <span className="text-zinc-500">없음</span>
              ) : (
                missingRareUnits.map((entry) => (
                  <span
                    className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1"
                    key={entry.name}
                  >
                    {entry.name} x{entry.count}
                  </span>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-zinc-950">부족한 가스</h3>
            <p className="mt-2 text-sm text-zinc-700">
              {shortage.gasShortage === 0
                ? "없음"
                : `가스 x${shortage.gasShortage}`}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-zinc-950">조합법</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-700">
              {recipe ? (
                recipe.materials.map((material, index) => (
                  <MaterialChip
                    key={index}
                    material={material}
                    onSearchUnit={onSearchUnit}
                  />
                ))
              ) : (
                <span className="text-zinc-500">없음</span>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function sanitizeCount(value: string): number {
  const count = Number(value);

  if (!Number.isFinite(count)) {
    return 0;
  }

  return Math.max(0, Math.floor(count));
}

function GradeText({ grade }: { grade: UnitDefinition["grade"] }) {
  return (
    <>
      {gradeLabelParts(grade).map((part) => (
        <span className={part.className} key={`${grade}-${part.text}`}>
          {part.text}
        </span>
      ))}
    </>
  );
}

function MaterialChip({
  material,
  onSearchUnit,
}: {
  material: Material;
  onSearchUnit: (unit: UnitDefinition) => void;
}) {
  const className =
    "block min-w-0 max-w-full break-words rounded border border-zinc-200 bg-white px-2 py-1 text-left";

  if (material.type === "gas") {
    return <span className={className}>가스 x{material.count}</span>;
  }

  const unit = unitsById.get(material.unitId) as UnitDefinition | undefined;

  if (!unit) {
    return (
      <span className={className}>
        {material.unitId} x{material.count}
      </span>
    );
  }

  const content = (
    <>
      <GradeText grade={unit.grade} /> {unit.name} x{material.count}
    </>
  );

  if (!recipesByTargetId.has(unit.id)) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button
      className={`${className} transition hover:border-zinc-300 hover:bg-zinc-100 focus:border-zinc-500 focus:outline-none`}
      type="button"
      onClick={() => onSearchUnit(unit)}
    >
      {content}
    </button>
  );
}

function MissionBoard() {
  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-4 xl:fixed xl:right-6 xl:top-6 xl:z-20 xl:max-h-[calc(100vh-3rem)] xl:w-72 xl:overflow-y-auto">
      <h2 className="text-lg font-semibold text-zinc-950">임무표</h2>
      <div className="mt-4 flex flex-col gap-3">
        {missions.map((mission) => (
          <section
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
            key={mission.name}
          >
            <h3 className="text-sm font-semibold leading-5 text-zinc-950">
              <MissionTitle name={mission.name} />
            </h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm leading-5 text-zinc-700">
              {mission.requirements.map((requirement, index) => (
                <li className="min-w-0 break-words" key={index}>
                  {requirement.kind === "grade-all" ? (
                    <>
                      <GradeText grade={requirement.grade} />
                      등급 유닛 모두 1기 이상 보유
                    </>
                  ) : (
                    <>
                      <GradeText grade={requirement.grade} />{" "}
                      {requirement.name} x{requirement.count}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}

function MissionTitle({ name }: { name: string }) {
  const grade = grades.find((entry) => entry === name);

  if (!grade) {
    return <>{name}</>;
  }

  return <GradeText grade={grade} />;
}
