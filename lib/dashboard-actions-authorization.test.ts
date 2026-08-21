import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const actionsPath = path.join(process.cwd(), "app/dashboard/actions.ts");

function actionBody(source: string, name: string, nextName: string) {
  const start = source.indexOf(`export async function ${name}`);
  const end = source.indexOf(`export async function ${nextName}`, start);
  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must delimit ${name}`);
  return source.slice(start, end);
}

test("analysis actions require owner/admin authorization before privileged work", async () => {
  const source = await readFile(actionsPath, "utf8");
  const manualAnalysis = actionBody(
    source,
    "generateBusinessAnalysis",
    "updateAutomaticAnalysisSettings",
  );
  const automaticAnalysis = source.slice(
    source.indexOf("export async function updateAutomaticAnalysisSettings"),
  );

  for (const body of [manualAnalysis, automaticAnalysis]) {
    assert.match(
      body,
    /requireActiveBusinessBillingContext(?:<[\s\S]*?>)?\([\s\S]*?"manage"/,
      "the action must reject members before privileged work",
    );
  }

  assert.ok(
    manualAnalysis.indexOf("requireActiveBusinessForUser") <
      manualAnalysis.indexOf("generateBusinessAnalysisSnapshot"),
    "manual analysis authorization must happen before the service-role analysis service",
  );
  assert.ok(
    automaticAnalysis.indexOf("requireActiveBusinessForUser") <
      automaticAnalysis.indexOf("createAdminClient"),
    "automation authorization must happen before the service-role write",
  );
});
