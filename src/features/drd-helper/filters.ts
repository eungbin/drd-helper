import type { Grade, UnitDefinition } from "./types";

export type GradeFilter = Grade | "all";

export type UnitSearchFilters = {
  grade: GradeFilter;
  nameQuery: string;
};

export function filterUnitsBySearch(
  unitList: UnitDefinition[],
  filters: UnitSearchFilters,
): UnitDefinition[] {
  const nameQuery = normalizeText(filters.nameQuery);

  return unitList.filter((unit) => {
    const matchesGrade = filters.grade === "all" || unit.grade === filters.grade;
    const matchesName =
      nameQuery.length === 0 || normalizeText(unit.name).includes(nameQuery);

    return matchesGrade && matchesName;
  });
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}
