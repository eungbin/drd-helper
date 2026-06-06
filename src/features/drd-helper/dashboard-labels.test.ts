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
