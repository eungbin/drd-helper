import type { Grade } from "./types";

export type GradeLabelPart = {
  text: string;
  className: string;
};

const gradeTextClassByGrade: Record<Exclude<Grade, "절대">, string> = {
  레어: "text-yellow-600",
  영웅: "text-lime-600",
  "영웅+": "text-lime-600",
  유니크: "text-pink-600",
  서사: "text-zinc-500",
  "서사+": "text-zinc-500",
  전설: "text-red-600",
  "전설+": "text-red-600",
  신화: "text-purple-600",
  초월: "text-sky-600",
  "초월+": "text-sky-600",
  에픽: "text-pink-600",
};

export function gradeLabelParts(grade: Grade): GradeLabelPart[] {
  if (grade === "절대") {
    return [
      { text: "절", className: "text-red-600" },
      { text: "대", className: "text-blue-600" },
    ];
  }

  return [{ text: grade, className: gradeTextClassByGrade[grade] }];
}
