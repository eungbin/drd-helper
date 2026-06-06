"use client";

import { useState } from "react";

import { calculateShortage, createEmptyInventory } from "./calculator";
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
import type { Inventory, Material, UnitDefinition, UnitId } from "./types";

export default function Dashboard() {
  const [inventory, setInventory] = useState<Inventory>(() =>
    createEmptyInventory(),
  );
  const [targetGradeFilter, setTargetGradeFilter] =
    useState<GradeFilter>("all");
  const [targetNameQuery, setTargetNameQuery] = useState("");
  const hasTargetSearch =
    targetGradeFilter !== "all" || targetNameQuery.trim().length > 0;
  const targetSearchUnits = hasTargetSearch
    ? searchableTargetResultUnits
    : defaultTargetResultUnits;
  const filteredTargetUnits = filterUnitsBySearch(targetSearchUnits, {
    grade: targetGradeFilter,
    nameQuery: targetNameQuery,
  });

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

  function searchUnit(unit: UnitDefinition) {
    setTargetGradeFilter(unit.grade);
    setTargetNameQuery(unit.name);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8 xl:px-[21rem]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-500">DRD Helper</p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
                인벤토리 조합 시뮬레이터
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                보유 유닛과 가스를 입력하면 상위 유닛별 부족 재료를
                계산합니다.
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
                  const missingRareUnits = rareUnitNames
                    .map((name) => ({
                      name,
                      count: shortage.rareShortage[name],
                    }))
                    .filter((entry) => entry.count > 0);

                  return (
                    <article
                      className="rounded-lg border border-zinc-200 bg-white p-3"
                      key={unit.id}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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
                            shortage.craftable
                              ? "w-fit rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "w-fit rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600"
                          }
                        >
                          {shortage.craftable ? "조합 가능" : "재료 부족"}
                        </span>
                      </div>

                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div className="rounded border border-zinc-200 bg-zinc-50 p-2">
                          <dt className="text-xs font-medium text-zinc-500">
                            부족한 레어 유닛
                          </dt>
                          <dd className="mt-1 min-w-0 break-words text-zinc-800">
                            {missingRareUnits.length === 0
                              ? "없음"
                              : missingRareUnits
                                  .map(
                                    (entry) =>
                                      `${entry.name} x${entry.count}`,
                                  )
                                  .join(", ")}
                          </dd>
                        </div>
                        <div className="rounded border border-zinc-200 bg-zinc-50 p-2">
                          <dt className="text-xs font-medium text-zinc-500">
                            부족한 가스
                          </dt>
                          <dd className="mt-1 text-zinc-800">
                            {shortage.gasShortage}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-3 rounded border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-xs font-medium text-zinc-500">
                          조합법
                        </div>
                        <ul className="mt-2 flex flex-wrap gap-1.5 text-sm text-zinc-700">
                          {recipesByTargetId
                            .get(unit.id)
                            ?.materials.map((material, index) => (
                              <li
                                className="min-w-0 max-w-full"
                                key={`${unit.id}-${index}`}
                              >
                                <MaterialChip
                                  material={material}
                                  onSearchUnit={searchUnit}
                                />
                              </li>
                            ))}
                        </ul>
                      </div>
                    </article>
                  );
                  })
                )}
              </div>
          </section>
        </div>

        <MissionBoard />
      </div>
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
