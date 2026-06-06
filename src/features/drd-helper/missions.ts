import type { Grade } from "./types";

export type MissionRequirement =
  | {
      kind: "grade-all";
      grade: Grade;
    }
  | {
      kind: "unit";
      grade: Grade;
      name: string;
      count: number;
    };

export type Mission = {
  name: string;
  requirements: MissionRequirement[];
};

export const missions: Mission[] = [
  {
    name: "레어",
    requirements: [{ kind: "grade-all", grade: "레어" }],
  },
  {
    name: "영웅",
    requirements: [{ kind: "grade-all", grade: "영웅" }],
  },
  {
    name: "서사",
    requirements: [{ kind: "grade-all", grade: "서사" }],
  },
  {
    name: "전설",
    requirements: [{ kind: "grade-all", grade: "전설" }],
  },
  {
    name: "슈퍼 사이어인",
    requirements: [
      { kind: "unit", grade: "레어", name: "손오공", count: 1 },
      { kind: "unit", grade: "레어", name: "베지터", count: 1 },
      { kind: "unit", grade: "레어", name: "트랭크스", count: 1 },
      { kind: "unit", grade: "레어", name: "손오천", count: 1 },
      { kind: "unit", grade: "레어", name: "손오반", count: 1 },
      { kind: "unit", grade: "영웅", name: "오천크스", count: 1 },
    ],
  },
  {
    name: "숙명의 라이벌",
    requirements: [
      { kind: "unit", grade: "영웅", name: "손오공", count: 2 },
      { kind: "unit", grade: "영웅+", name: "마인 베지터", count: 2 },
      { kind: "unit", grade: "레어", name: "손오공", count: 1 },
      { kind: "unit", grade: "레어", name: "베지터", count: 1 },
    ],
  },
  {
    name: "No. 1",
    requirements: [
      { kind: "unit", grade: "영웅+", name: "Mr. 부우", count: 1 },
      { kind: "unit", grade: "서사", name: "손오공", count: 1 },
      { kind: "unit", grade: "영웅", name: "베지터", count: 1 },
      { kind: "unit", grade: "유니크", name: "Mr. 사탄", count: 1 },
    ],
  },
  {
    name: "후계자",
    requirements: [
      { kind: "unit", grade: "서사", name: "손오공", count: 2 },
      { kind: "unit", grade: "영웅+", name: "우부", count: 2 },
    ],
  },
  {
    name: "신에 도달한 자",
    requirements: [
      { kind: "unit", grade: "전설", name: "손오공", count: 2 },
      { kind: "unit", grade: "전설", name: "베지터", count: 1 },
    ],
  },
];
