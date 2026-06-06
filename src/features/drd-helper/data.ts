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
  recipe("서사+", "슈퍼 사이어인 베지트", [
    material("영웅", "손오공", 2),
    material("영웅+", "마인 베지터", 2),
  ]),
  recipe("서사+", "슈퍼 사이어인 갓 손오공", [
    material("서사", "손오공"),
    material("영웅", "손오공"),
  ]),
  recipe("서사+", "슈퍼 사이어인 갓 베지터", [
    material("서사", "베지터"),
    material("영웅", "베지터"),
  ]),
  recipe("서사+", "재각성 손오반", [
    material("서사", "손오반"),
    material("영웅", "손오반"),
  ]),
  recipe("서사+", "슈퍼 사이어인 4 손오공", [
    material("서사", "손오공"),
    material("영웅+", "우부"),
  ]),
  recipe("서사+", "슈퍼 사이어인 4 베지터", [
    material("서사", "베지터"),
    material("영웅+", "우부"),
  ]),
  recipe("서사+", "슈퍼 우부", [
    material("영웅+", "우부"),
    material("영웅+", "Mr. 부우"),
  ]),
  recipe("전설", "손오공", [material("서사", "손오공", 2), gas(4)]),
  recipe("전설", "베지터", [material("서사", "베지터", 2), gas(4)]),
  recipe("전설+", "슈퍼 사이어인 블루 계왕권 손오공", [
    material("전설", "손오공"),
    material("서사+", "슈퍼 사이어인 갓 손오공"),
  ]),
  recipe("전설+", "슈퍼 사이어인 블루 베지터", [
    material("전설", "베지터"),
    material("서사+", "슈퍼 사이어인 갓 베지터"),
  ]),
  recipe("전설+", "오렌지 피콜로", [
    material("영웅+", "각성 피콜로", 4),
  ]),
  recipe("전설+", "슈퍼 사이어인 4 한계돌파 손오공", [
    material("서사+", "슈퍼 사이어인 4 손오공", 2),
  ]),
  recipe("전설+", "슈퍼 사이어인 4 한계돌파 베지터", [
    material("서사+", "슈퍼 사이어인 4 베지터", 2),
  ]),
  recipe("신화", "손오공", [material("전설", "손오공", 2), gas(8)]),
  recipe("신화", "비루스", [material("전설", "베지터", 2), gas(8)]),
  recipe("초월", "슈퍼 사이어인 블루 오지터", [
    material("전설", "손오공", 2),
    material("전설", "베지터"),
    material("서사+", "슈퍼 사이어인 오지터"),
  ]),
  recipe("초월", "슈퍼 사이어인 블루 베지트", [
    material("전설+", "슈퍼 사이어인 블루 계왕권 손오공"),
    material("전설+", "슈퍼 사이어인 블루 베지터"),
    material("서사+", "슈퍼 사이어인 베지트"),
  ]),
  recipe("초월", "슈퍼 사이어인 4 오지터", [
    material("서사+", "슈퍼 사이어인 4 손오공", 2),
    material("서사+", "슈퍼 사이어인 4 베지터", 2),
    material("서사", "오천크스", 2),
  ]),
  recipe("초월", "슈퍼 사이어인 4 베지트", [
    material("전설+", "슈퍼 사이어인 4 한계돌파 손오공"),
    material("전설+", "슈퍼 사이어인 4 한계돌파 베지터"),
    material("서사+", "슈퍼 우부"),
  ]),
  recipe("초월+", "원기 검 트랭크스", [
    material("전설", "베지터"),
    material("서사", "오천크스", 5),
    material("레어", "트랭크스", 5),
  ]),
  recipe("초월+", "슈퍼 사이어인 블루 계왕권 오지터", [
    material("초월", "슈퍼 사이어인 블루 오지터"),
    material("전설+", "슈퍼 사이어인 블루 계왕권 손오공"),
  ]),
  recipe("초월+", "슈퍼 사이어인 블루 베지트", [
    material("초월", "슈퍼 사이어인 블루 베지트"),
    material("전설+", "슈퍼 사이어인 블루 베지터"),
  ]),
  recipe("초월+", "슈퍼 사이어인 4 한계돌파 오지터", [
    material("초월", "슈퍼 사이어인 4 오지터"),
    material("전설+", "슈퍼 사이어인 4 한계돌파 손오공"),
  ]),
  recipe("초월+", "슈퍼 사이어인 4 한계돌파 베지트", [
    material("초월", "슈퍼 사이어인 4 베지트"),
    material("전설+", "슈퍼 사이어인 4 한계돌파 베지터"),
  ]),
  recipe("에픽", "팡", [
    material("서사+", "재각성 손오반"),
    material("레어", "손오천", 2),
  ]),
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
  recipe("절대", "무의식의 극의 완성형 손오공", [
    material("초월", "슈퍼 사이어인 블루 오지터"),
    material("신화", "손오공"),
    material("전설+", "슈퍼 사이어인 블루 계왕권 손오공"),
    material("전설", "손오공"),
    material("서사+", "슈퍼 사이어인 갓 손오공"),
  ]),
  recipe("절대", "자의식의 극의 베지터", [
    material("초월", "슈퍼 사이어인 블루 베지트"),
    material("신화", "비루스"),
    material("전설+", "슈퍼 사이어인 블루 베지터"),
    material("전설", "베지터"),
    material("서사+", "슈퍼 사이어인 갓 베지터"),
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
