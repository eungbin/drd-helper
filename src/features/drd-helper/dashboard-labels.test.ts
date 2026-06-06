import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("labels the target search reset button as initial reset", () => {
  const dashboardSource = readFileSync(
    join(process.cwd(), "src/features/drd-helper/Dashboard.tsx"),
    "utf8",
  );
  const resetHandlerIndex = dashboardSource.indexOf(
    "onClick={resetTargetSearch}",
  );
  const resetButtonSource = dashboardSource.slice(
    resetHandlerIndex,
    dashboardSource.indexOf("</button>", resetHandlerIndex) + "</button>".length,
  );

  assert.notEqual(resetHandlerIndex, -1);
  assert.match(resetButtonSource, />\s*초기화\s*<\/button>/);
});

test("uses SEO-focused dashboard heading and supporting copy", () => {
  const dashboardSource = readFileSync(
    join(process.cwd(), "src/features/drd-helper/Dashboard.tsx"),
    "utf8",
  );

  assert.match(dashboardSource, /드래곤볼 운빨 디펜스 조합 계산기/);
  assert.match(dashboardSource, /공략 도우미/);
  assert.match(dashboardSource, /부족 재료/);
  assert.match(dashboardSource, /조합법/);
  assert.match(dashboardSource, /가스/);
});

test("target result details move into an accessible modal with compact card labels", () => {
  const dashboardSource = readFileSync(
    join(process.cwd(), "src/features/drd-helper/Dashboard.tsx"),
    "utf8",
  );

  assert.match(dashboardSource, /function TargetResultCard/);
  assert.match(dashboardSource, /function TargetResultModal/);
  assert.match(dashboardSource, /role="dialog"/);
  assert.match(dashboardSource, /aria-modal="true"/);
  assert.match(dashboardSource, /가스 OK/);
  assert.match(dashboardSource, /가스 부족/);
  assert.match(dashboardSource, /부족한 레어 유닛/);
  assert.match(dashboardSource, /부족한 가스/);
  assert.match(dashboardSource, /조합법/);
  assert.doesNotMatch(dashboardSource, /상세 보기/);
});

test("target result modal manages keyboard focus", () => {
  const dashboardSource = readFileSync(
    join(process.cwd(), "src/features/drd-helper/Dashboard.tsx"),
    "utf8",
  );

  assert.match(dashboardSource, /import \{[^}]*useRef[^}]*\} from "react"/s);
  assert.match(dashboardSource, /previousFocusRef/);
  assert.match(dashboardSource, /closeButtonRef/);
  assert.match(dashboardSource, /dialogRef/);
  assert.match(dashboardSource, /getModalFocusableElements/);
  assert.match(dashboardSource, /handleDialogKeyDown/);
  assert.match(dashboardSource, /event\.key === "Tab"/);
  assert.match(dashboardSource, /previousFocusRef\.current\?\.focus\(\)/);
  assert.match(dashboardSource, /closeButtonRef\.current\?\.focus\(\)/);
  assert.match(dashboardSource, /onKeyDown=\{handleDialogKeyDown\}/);
});

test("target recipe search restores focus to the target search input", () => {
  const dashboardSource = readFileSync(
    join(process.cwd(), "src/features/drd-helper/Dashboard.tsx"),
    "utf8",
  );

  assert.match(dashboardSource, /targetSearchInputRef/);
  assert.match(dashboardSource, /closeTargetModalWithoutFocusRestore/);
  assert.match(dashboardSource, /targetSearchInputRef\.current\?\.focus\(\)/);
  assert.match(dashboardSource, /ref=\{targetSearchInputRef\}/);
});
