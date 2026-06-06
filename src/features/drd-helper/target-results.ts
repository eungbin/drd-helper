import { grades, recipesByTargetId, targetGrades, units } from "./data";

export const defaultTargetResultUnits = units.filter(
  (unit) => targetGrades.includes(unit.grade) && recipesByTargetId.has(unit.id),
);

export const searchableTargetResultUnits = units.filter((unit) =>
  recipesByTargetId.has(unit.id),
);

export const targetResultGradeOptions = grades.filter((grade) =>
  searchableTargetResultUnits.some((unit) => unit.grade === grade),
);
