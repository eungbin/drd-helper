import { grades } from "./data";
import type { Grade } from "./types";

const excludedInventoryGrades = new Set<Grade>([
  "신화",
  "초월",
  "초월+",
  "절대",
]);

export const inventoryGrades = grades.filter(
  (grade) => !excludedInventoryGrades.has(grade),
);
