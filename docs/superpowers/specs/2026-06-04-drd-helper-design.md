# DRD Helper Design Spec

Date: 2026-06-04

## Goal

Build a helper site for the StarCraft custom map "드래곤볼 운빨 디펜스". The first version is a dashboard-style inventory simulator:

- Users enter their current unit inventory and gas count.
- The app shows every upper-tier target unit and the missing resources needed to craft it.
- Missing unit requirements are always displayed as rare-unit counts plus gas.
- Users can also browse the original recipe list by grade.

This is not a landing page. The first screen is the usable helper dashboard.

## Assumptions

- A unit is uniquely identified by grade and name, because many names repeat across grades.
- If a material count is omitted in the source recipe, the count is 1.
- Results are calculated independently per target unit. Checking one target does not consume inventory for another target's result.
- When calculating a target, owned units at the exact required grade are consumed before expanding the remaining requirement into lower-tier materials.
- Gas is a resource like units. Users can enter owned gas, and target results show missing gas.
- Final shortage output is limited to the six rare units and gas.
- No account, backend, sharing, or cloud persistence is included in the first version.

## Non-Goals

- Do not recommend an optimal crafting order across multiple target units.
- Do not simulate batch crafting where all displayed targets compete for the same inventory.
- Do not add game guide content beyond unit recipes and shortage calculation.
- Do not add speculative filters or configuration that is not needed for the first working helper.

## Product Structure

The app has three main dashboard regions.

### Inventory Input

Show all units grouped by grade. Each unit has a compact numeric input for owned count. Gas is shown as a resource input near the top.

Required behavior:

- Default all counts to 0.
- Accept only non-negative integers.
- Support input for rare units and upper-tier units.
- Include a clear/reset action for the current inventory.

### Target Results

Show craft status for upper-tier units. The intended primary target groups are 서사+, 전설+, 신화, 초월, 초월+, 에픽, 절대. Lower grades can still appear in recipe browsing and inventory input.

Each result row/card shows:

- Target grade and name.
- Whether the target is currently craftable from the entered inventory.
- Missing rare units and missing gas.
- A concise expanded recipe summary, if space allows.

If there are no missing rare units and no missing gas, the target is craftable.

### Recipe Browser

Show original recipes grouped by grade. Recipe display uses the same source data as the calculator so the UI cannot drift from calculation logic.

Each recipe displays:

- Target grade and name.
- Direct materials with grade, name, count, and gas if present.

## Calculation Design

Represent units and recipes as static TypeScript data.

Use a pure calculation function:

```ts
calculateShortage(targetUnitId, inventory) => {
  rareShortage: Record<RareUnitName, number>;
  gasShortage: number;
}
```

Algorithm:

1. Clone the current inventory for this target calculation.
2. Resolve the required target unit count.
3. If the required unit exists in inventory, consume as many as possible.
4. Expand only the remaining count through its recipe.
5. For gas, consume owned gas and report any remaining shortage.
6. For rare units, consume owned rare units and report any remaining shortage.
7. For non-rare units with no recipe, treat it as a data error during development, not as a user-facing fallback.

The recipe graph is expected to be acyclic.

## UI Direction

Use a restrained SaaS dashboard style inspired by Linear, Vercel, and Notion.

Design constraints:

- Use solid or near-solid backgrounds. Avoid visible gradients unless they are extremely subtle and functional.
- Use borders, spacing, and typography as the primary visual structure.
- Use at most two accent colors.
- Avoid neon colors, decorative effects, and generic landing-page visuals.
- Use flat or semi-flat components.
- Use no heavy shadows. If shadow is needed, keep it very soft, such as `0 4px 12px rgba(0, 0, 0, 0.05)`.
- Keep border radius consistent: 8px for main cards/buttons, 4px for small controls.
- Use an 8px spacing rhythm for padding, gaps, and layout.
- Keep dashboard content breathable. Avoid cramped Tailwind padding values.
- No nested decorative cards. Cards are for repeated data items or functional panels.

Suggested layout:

- Desktop: a top resource summary, then a three-column work surface: inventory, target results, recipe browser.
- Tablet/mobile: stack sections vertically or use compact tabs if the page becomes too long.
- Use dense but readable rows for unit inputs and results.

## Data Model

### Grades

- 레어
- 영웅
- 영웅+
- 유니크
- 서사
- 서사+
- 전설
- 전설+
- 신화
- 초월
- 초월+
- 에픽
- 절대

### Rare Units

- 손오공
- 베지터
- 피콜로
- 손오천
- 손오반
- 트랭크스

### Unit Catalog

레어:

- 손오공
- 베지터
- 피콜로
- 손오천
- 손오반
- 트랭크스

영웅:

- 손오공
- 베지터
- 피콜로
- 손오반
- 오천크스

영웅+:

- 마인 베지터
- 각성 피콜로
- Mr. 부우
- 우부

유니크:

- Mr. 사탄

서사:

- 손오공
- 베지터
- 손오반
- 오천크스

서사+:

- 슈퍼 사이어인 오지터
- 슈퍼 사이어인 베지트
- 슈퍼 사이어인 갓 손오공
- 슈퍼 사이어인 갓 베지터
- 재각성 손오반
- 슈퍼 사이어인 4 손오공
- 슈퍼 사이어인 4 베지터
- 슈퍼 우부

전설:

- 손오공
- 베지터

전설+:

- 슈퍼 사이어인 블루 계왕권 손오공
- 슈퍼 사이어인 블루 베지터
- 오렌지 피콜로
- 슈퍼 사이어인 4 한계돌파 손오공
- 슈퍼 사이어인 4 한계돌파 베지터

신화:

- 손오공
- 비루스

초월:

- 슈퍼 사이어인 블루 오지터
- 슈퍼 사이어인 블루 베지트
- 슈퍼 사이어인 4 오지터
- 슈퍼 사이어인 4 베지트

초월+:

- 원기 검 트랭크스
- 슈퍼 사이어인 블루 계왕권 오지터
- 슈퍼 사이어인 블루 베지트
- 슈퍼 사이어인 4 한계돌파 오지터
- 슈퍼 사이어인 4 한계돌파 베지트

에픽:

- 팡

절대:

- 슈퍼 사이어인 5 손오공
- 무의식의 극의 완성형 손오공
- 자의식의 극의 베지터
- 비스트 손오반

## Recipe Data

### 영웅

- `[영웅] 손오공`: `[레어] 손오공 x2` + 가스 1
- `[영웅] 베지터`: `[레어] 베지터 x2` + 가스 1
- `[영웅] 피콜로`: `[레어] 피콜로 x2` + 가스 1
- `[영웅] 손오반`: `[레어] 손오반 x2` + 가스 1
- `[영웅] 오천크스`: `[레어] 손오천` + `[레어] 트랭크스` + 가스 1

### 영웅+

- `[영웅+] 마인 베지터`: `[영웅] 베지터` + `[레어] 베지터`
- `[영웅+] 각성 피콜로`: `[레어] 피콜로 x3`
- `[영웅+] Mr. 부우`: `[영웅] 오천크스` + `[레어] 피콜로`
- `[영웅+] 우부`: `[영웅+] Mr. 부우` + `[레어] 손오공`

### 유니크

- `[유니크] Mr. 사탄`: `[영웅+] Mr. 부우` + `[레어] 손오공` + `[레어] 베지터`

### 서사

- `[서사] 손오공`: `[영웅] 손오공 x2` + 가스 2
- `[서사] 베지터`: `[영웅] 베지터 x2` + 가스 2
- `[서사] 손오반`: `[영웅] 손오반 x2` + 가스 2
- `[서사] 오천크스`: `[영웅] 오천크스 x2` + 가스 2

### 서사+

- `[서사+] 슈퍼 사이어인 오지터`: `[서사] 손오공` + `[영웅] 베지터`
- `[서사+] 슈퍼 사이어인 베지트`: `[영웅] 손오공 x2` + `[영웅+] 마인 베지터 x2`
- `[서사+] 슈퍼 사이어인 갓 손오공`: `[서사] 손오공` + `[영웅] 손오공`
- `[서사+] 슈퍼 사이어인 갓 베지터`: `[서사] 베지터` + `[영웅] 베지터`
- `[서사+] 재각성 손오반`: `[서사] 손오반` + `[영웅] 손오반`
- `[서사+] 슈퍼 사이어인 4 손오공`: `[서사] 손오공` + `[영웅+] 우부`
- `[서사+] 슈퍼 사이어인 4 베지터`: `[서사] 베지터` + `[영웅+] 우부`
- `[서사+] 슈퍼 우부`: `[영웅+] 우부` + `[영웅+] Mr. 부우`

### 전설

- `[전설] 손오공`: `[서사] 손오공 x2` + 가스 4
- `[전설] 베지터`: `[서사] 베지터 x2` + 가스 4

### 전설+

- `[전설+] 슈퍼 사이어인 블루 계왕권 손오공`: `[전설] 손오공` + `[서사+] 슈퍼 사이어인 갓 손오공`
- `[전설+] 슈퍼 사이어인 블루 베지터`: `[전설] 베지터` + `[서사+] 슈퍼 사이어인 갓 베지터`
- `[전설+] 오렌지 피콜로`: `[영웅+] 각성 피콜로 x4`
- `[전설+] 슈퍼 사이어인 4 한계돌파 손오공`: `[서사+] 슈퍼 사이어인 4 손오공 x2`
- `[전설+] 슈퍼 사이어인 4 한계돌파 베지터`: `[서사+] 슈퍼 사이어인 4 베지터 x2`

### 신화

- `[신화] 손오공`: `[전설] 손오공 x2` + 가스 8
- `[신화] 비루스`: `[전설] 베지터 x2` + 가스 8

### 초월

- `[초월] 슈퍼 사이어인 블루 오지터`: `[전설] 손오공 x2` + `[전설] 베지터` + `[서사+] 슈퍼 사이어인 오지터`
- `[초월] 슈퍼 사이어인 블루 베지트`: `[전설+] 슈퍼 사이어인 블루 계왕권 손오공` + `[전설+] 슈퍼 사이어인 블루 베지터` + `[서사+] 슈퍼 사이어인 베지트`
- `[초월] 슈퍼 사이어인 4 오지터`: `[서사+] 슈퍼 사이어인 4 손오공 x2` + `[서사+] 슈퍼 사이어인 4 베지터 x2` + `[서사] 오천크스 x2`
- `[초월] 슈퍼 사이어인 4 베지트`: `[전설+] 슈퍼 사이어인 4 한계돌파 손오공` + `[전설+] 슈퍼 사이어인 4 한계돌파 베지터` + `[서사+] 슈퍼 우부`

### 초월+

- `[초월+] 원기 검 트랭크스`: `[전설] 베지터` + `[서사] 오천크스 x5` + `[레어] 트랭크스 x5`
- `[초월+] 슈퍼 사이어인 블루 계왕권 오지터`: `[초월] 슈퍼 사이어인 블루 오지터` + `[전설+] 슈퍼 사이어인 블루 계왕권 손오공`
- `[초월+] 슈퍼 사이어인 블루 베지트`: `[초월] 슈퍼 사이어인 블루 베지트` + `[전설+] 슈퍼 사이어인 블루 베지터`
- `[초월+] 슈퍼 사이어인 4 한계돌파 오지터`: `[초월] 슈퍼 사이어인 4 오지터` + `[전설+] 슈퍼 사이어인 4 한계돌파 손오공`
- `[초월+] 슈퍼 사이어인 4 한계돌파 베지트`: `[초월] 슈퍼 사이어인 4 베지트` + `[전설+] 슈퍼 사이어인 4 한계돌파 베지터`

### 에픽

- `[에픽] 팡`: `[서사+] 재각성 손오반` + `[레어] 손오천 x2`

### 절대

- `[절대] 슈퍼 사이어인 5 손오공`: `[초월] 슈퍼 사이어인 4 오지터` + `[전설+] 슈퍼 사이어인 4 한계돌파 손오공 x2` + `[서사+] 슈퍼 사이어인 4 손오공` + `[서사+] 슈퍼 우부` + `[서사] 손오공` + `[레어] 손오공` + `[영웅+] 우부` + `[영웅] 손오공` + `[에픽] 팡`
- `[절대] 무의식의 극의 완성형 손오공`: `[초월] 슈퍼 사이어인 블루 오지터` + `[신화] 손오공` + `[전설+] 슈퍼 사이어인 블루 계왕권 손오공` + `[전설] 손오공` + `[서사+] 슈퍼 사이어인 갓 손오공`
- `[절대] 자의식의 극의 베지터`: `[초월] 슈퍼 사이어인 블루 베지트` + `[신화] 비루스` + `[전설+] 슈퍼 사이어인 블루 베지터` + `[전설] 베지터` + `[서사+] 슈퍼 사이어인 갓 베지터`
- `[절대] 비스트 손오반`: `[전설+] 오렌지 피콜로 x2` + `[서사+] 재각성 손오반 x6` + `[서사] 손오반` + `[영웅] 손오반` + `[레어] 손오반` + `[에픽] 팡`

## Verification Plan

Implementation should be verified with focused calculation checks before UI polishing.

Required calculation checks:

- No inventory for `[서사] 손오공` returns `[레어] 손오공 x4` and gas 4.
- One `[영웅] 손오공` owned and no gas owned for `[서사] 손오공` returns `[레어] 손오공 x2` and gas 3.
- `[서사+] 슈퍼 우부` uses `[영웅+] 우부` and `[영웅+] Mr. 부우`.
- `[신화] 비루스` expands from `[전설] 베지터 x2` and gas 8.
- `[절대] 슈퍼 사이어인 5 손오공` includes `[서사] 손오공` and `[레어] 손오공`, and does not include `[신화] 손오공`.

Required app checks:

- `npm run lint`
- `npm run build`
- Manual desktop and mobile viewport check for readable spacing and no text overlap.

## Success Criteria

- Users can enter all unit and gas inventory from one dashboard.
- Users can scan all upper-tier targets and understand what is craftable.
- Missing materials are shown as rare units plus gas.
- Recipe browsing and shortage calculation use one shared data source.
- The UI feels like a restrained SaaS dashboard, with solid backgrounds, borders, generous spacing, and no generic template-style hero section.
