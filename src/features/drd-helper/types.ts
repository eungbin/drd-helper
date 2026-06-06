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
