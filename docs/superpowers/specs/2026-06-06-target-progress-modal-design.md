# Target Progress Modal Design

Date: 2026-06-06

## Goal

Refactor the upper-unit result area so users can scan many target units at once. The current card layout is good for reading one unit in detail, but it shows unit name, missing rare units, gas, and recipe for every target at the same time. That makes the result list tall and harder to compare.

The new layout separates scanning from detail:

- Result cards show compact status only.
- Clicking a card opens a modal with the detailed shortage and recipe.
- Rare-unit progress is shown as a bottom progress bar.
- Gas status remains visible on the card because it can block crafting even when rare-unit progress is 100%.

## Non-Goals

- Do not change inventory input behavior.
- Do not change target filtering or search behavior.
- Do not add crafting-order recommendations.
- Do not add batch simulation across multiple targets.
- Do not redesign the rest of the dashboard.

## UI Design

Keep the existing target result filters and search controls. Replace each expanded target result card with a compact clickable card.

Each card shows:

- Grade.
- Unit name.
- Rare-unit progress percentage.
- Gas status: `가스 OK` or `가스 부족 xN`.
- A bottom progress bar.

Example:

```text
[서사+] 슈퍼 사이어인 갓 손오공       18%
가스 부족 x2
[======--------------------------]
```

The card itself opens the modal. There is no separate `상세 보기` chip. The card should visually communicate clickability through hover, focus, and cursor states.

Craftable cards can use a subtle positive border or text color. Do not fill the card background with strong color. The progress bar should preserve text readability by staying below the text content.

## Modal Design

The modal shows the selected unit's details:

- Header: grade, unit name, rare progress percentage, and craftable status.
- Missing rare units.
- Missing gas.
- Recipe materials.

Missing rare units display `없음` when empty. Missing gas displays `0` when there is no gas shortage. Recipe material chips keep the existing behavior where clicking a unit material searches that unit. If a recipe material search is triggered from the modal, close the modal and apply the search.

The modal can close through:

- Close button.
- Escape key.
- Backdrop click.

## Progress Calculation

Progress is based only on rare-unit requirements. Gas is intentionally excluded from the percentage.

For each target:

```text
total rare required = sum of rareShortage from calculating the target with empty inventory
current rare missing = sum of rareShortage from calculating the target with current inventory
progress = (total rare required - current rare missing) / total rare required
```

Display the result as an integer percentage clamped to 0-100.

Rules:

- If total rare required is 0, progress is 100%.
- If current rare missing is 0, progress is 100%.
- Gas shortage does not reduce the progress percentage.
- Craftability still requires both rare shortage 0 and gas shortage 0.

The calculation helper should live with calculator logic, not inside render code.

## Component Structure

`Dashboard.tsx` may be split enough to keep the change readable:

- `TargetResultCard`: compact clickable card.
- `TargetResultModal`: detailed modal.
- Small local helpers for display labels if needed.

Avoid broad restructuring. Keep existing data flow:

- Inventory state stays in `Dashboard`.
- Target filtering and search stay in `Dashboard`.
- `calculateShortage` remains the source for shortage and craftability.

## Accessibility

The compact card must be keyboard accessible.

Requirements:

- Card can receive keyboard focus.
- Enter and Space open the modal.
- Modal uses `role="dialog"` and has an accessible title.
- Escape closes the modal.
- Close button has a clear accessible label.
- Focus styling must be visible.

Do not add body scroll locking in the first pass. Add it only if mobile verification shows that background page scrolling makes the modal hard to use.

## Testing

Add focused tests for the new pure calculation behavior:

- Empty inventory gives 0% progress for a target with rare requirements.
- Partial rare inventory increases progress proportionally.
- Full rare inventory gives 100% progress even if gas is missing.
- A target with no rare requirements returns 100%.

Update source-level dashboard label tests to verify:

- `상세 보기` chip text is not used.
- Modal labels include `부족한 레어 유닛`, `부족한 가스`, and `조합법`.
- Card-level gas labels include `가스 OK` and `가스 부족`.

Run:

- `npm run test:logic`
- `npm run lint`
- `npm run build`

## Success Criteria

- Users can scan many upper-unit cards without reading every missing material list.
- Each card clearly shows rare progress and gas status.
- Clicking anywhere on a card opens detailed shortage and recipe information.
- Text readability is not harmed by progress visualization.
- Existing inventory, filtering, search, and recipe material search behavior still work.
