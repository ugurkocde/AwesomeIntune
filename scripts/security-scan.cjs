// @ts-nocheck — CommonJS CI/build module, executed by Node (and required by
// GitHub Actions github-script), not part of the typed app build.
/**
 * Shared security scanner for tool submissions.
 *
 * Single source of truth used by both `.github/workflows/approve-tool-submission.yml`
 * and `.github/workflows/backfill-security-scans.yml` (required via
 * `require(path.join(process.env.GITHUB_WORKSPACE, "scripts", "security-scan.cjs"))`).
 *
 * Design notes:
 * - Never fails open. If the repo can't be read, the result is `scan_error`, not a
 *   pass. If it reads but has no scannable code, it's `not_applicable`.
 * - Uses the repository's real default branch (the previous code only tried
 *   main/master/develop and silently 0-scanned everything else).
 * - Splits malicious patterns from common-admin techniques: admin techniques are
 *   recorded as informational `notes` and do NOT fail a check; only genuinely
 *   malicious patterns fail `noMaliciousPatterns`.
 *
 * Requires Node 18+ (global fetch). `openai` is required lazily, only when an API
 * key is supplied, so pattern-only scans (e.g. local validation) need no key.
 */

const SCAN_EXTENSIONS = [
  ".ps1", ".psm1", ".psd1", // PowerShell
  ".py", ".pyw", // Python
  ".js", ".mjs", ".cjs", ".jsx", // JavaScript
  ".ts", ".tsx", // TypeScript
  ".cs", // C#
  ".sh", ".bash", // Shell
  ".bat", ".cmd", ".vbs", // Windows scripts
  ".rb", ".go", ".rs", // Other languages
];

const SKIP_DIRS = [
  "node_modules/", "vendor/", ".git/", "dist/", "build/",
  "__pycache__/", "bin/", "obj/",
];

const CHECK_KEYS = [
  "noObfuscatedCode",
  "noRemoteExecution",
  "noCredentialTheft",
  "noDataExfiltration",
  "noMaliciousPatterns",
  "noHardcodedSecrets",
];

function ghHeaders(token) {
  const headers = { "User-Agent": "AwesomeIntune-SecurityScanner/1.0" };
  if (token) headers["Authorization"] = "token " + token;
  return headers;
}

function parseRepo(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function fetchRepoMetadata(repoUrl, token) {
  const parsed = parseRepo(repoUrl);
  if (!parsed) return null;

  try {
    const res = await fetch(
      "https://api.github.com/repos/" + parsed.owner + "/" + parsed.repo,
      { headers: ghHeaders(token) }
    );
    if (res.ok) {
      const data = await res.json();
      return {
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
        openIssues: data.open_issues_count || 0,
        lastUpdated: data.pushed_at || null,
        license: data.license?.spdx_id || null,
        archived: data.archived || false,
        defaultBranch: data.default_branch || null,
      };
    }
  } catch (e) {
    console.log("Error fetching repo metadata: " + e.message);
  }
  return null;
}

/**
 * Fetch scannable file contents from a repo.
 *
 * Returns { files, branch, treeFetched }:
 * - treeFetched=false means NO candidate branch's tree could be read (network /
 *   rate limit / bad repo) -> caller should treat as scan_error.
 * - treeFetched=true with files=[] means the tree was read but had no scannable
 *   code -> caller should treat as not_applicable.
 */
async function fetchRepoFiles(repoUrl, { token, defaultBranch, maxFiles = 50 } = {}) {
  const parsed = parseRepo(repoUrl);
  if (!parsed) return { files: [], branch: null, treeFetched: false };
  const { owner, repo } = parsed;

  const files = [];
  let usedBranch = null;
  let treeFetched = false;
  // True once we've seen a tree that genuinely contains scannable code, so the
  // caller can tell "no code to scan" (not_applicable) apart from "code exists
  // but downloads failed" (transient -> scan_error, retried next run).
  let sawScannable = false;

  // Try the real default branch first, then common fallbacks. Dedup + drop empties.
  const candidates = [...new Set([defaultBranch, "main", "master", "develop"].filter(Boolean))];

  for (const branch of candidates) {
    try {
      const treeRes = await fetch(
        "https://api.github.com/repos/" + owner + "/" + repo + "/git/trees/" + branch + "?recursive=1",
        { headers: ghHeaders(token) }
      );
      if (!treeRes.ok) continue;

      treeFetched = true;
      const tree = await treeRes.json();
      usedBranch = branch;

      const scannableFiles = (tree.tree || [])
        .filter((f) => f.type === "blob")
        .filter((f) => SCAN_EXTENSIONS.some((ext) => f.path.toLowerCase().endsWith(ext)))
        .filter((f) => !SKIP_DIRS.some((dir) => f.path.includes(dir)))
        .filter((f) => (f.size || 0) < 500000)
        // Deterministic order by path (do NOT sort smallest-first; that skips
        // large entrypoints once the cap is hit).
        .sort((a, b) => a.path.localeCompare(b.path));

      if (scannableFiles.length > 0) sawScannable = true;
      if (scannableFiles.length > maxFiles) {
        console.log(
          "  Note: " + scannableFiles.length + " scannable files, scanning first " + maxFiles
        );
      }

      for (const file of scannableFiles.slice(0, maxFiles)) {
        try {
          const contentRes = await fetch(
            "https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + branch + "/" + file.path,
            { headers: { "User-Agent": "AwesomeIntune-SecurityScanner/1.0" } }
          );
          if (contentRes.ok) {
            const content = await contentRes.text();
            files.push({ path: file.path, content, size: content.length });
            console.log("  - " + file.path + " (" + Math.round((content.length / 1024) * 10) / 10 + " KB)");
          }
          await new Promise((r) => setTimeout(r, 50));
        } catch {
          /* skip individual file fetch errors */
        }
      }

      if (files.length > 0) break;
    } catch {
      /* try next candidate branch */
    }
  }

  return { files, branch: usedBranch, treeFetched, sawScannable };
}

function emptyChecks() {
  const checks = {};
  for (const key of CHECK_KEYS) {
    checks[key] = { passed: true, reason: "", details: [] };
  }
  return checks;
}

function runPatternChecks(files, repoInfo = {}) {
  const results = emptyChecks();
  const notes = [];

  const findLineNumbers = (content, patternStr, flags = "gi") => {
    const lines = content.split("\n");
    const lineNumbers = [];
    lines.forEach((line, index) => {
      if (new RegExp(patternStr, flags).test(line)) lineNumbers.push(index + 1);
    });
    return lineNumbers;
  };

  const generateGitHubLink = (filePath, lineNumbers) => {
    if (!repoInfo.owner || !repoInfo.repo || !repoInfo.branch || lineNumbers.length === 0) {
      return null;
    }
    const firstLine = lineNumbers[0];
    const lastLine = lineNumbers.length > 1 ? lineNumbers[Math.min(lineNumbers.length - 1, 4)] : firstLine;
    const lineAnchor = firstLine === lastLine ? "#L" + firstLine : "#L" + firstLine + "-L" + lastLine;
    return "https://github.com/" + repoInfo.owner + "/" + repoInfo.repo + "/blob/" + repoInfo.branch + "/" + filePath + lineAnchor;
  };

  const patterns = {
    obfuscation: [
      { pattern: "\\[System\\.Convert\\]::FromBase64String\\s*\\([^)]*\\)\\s*\\)", desc: "Base64 decode and execute" },
      { pattern: "-enc(odedcommand)?\\s+[A-Za-z0-9+\\/=]{50,}", desc: "Encoded PowerShell command" },
      { pattern: "\\[char\\]\\s*\\d+.*\\[char\\]\\s*\\d+.*\\[char\\]\\s*\\d+", desc: "Character code obfuscation" },
      { pattern: "-join\\s*\\(.*\\[char\\]", desc: "String building obfuscation" },
      { pattern: "\\$[a-z]\\s*=\\s*[\"'][^\"']{1,3}[\"']\\s*;\\s*\\$[a-z]\\s*\\+", desc: "Variable concatenation obfuscation" },
    ],
    remoteExecution: [
      { pattern: "IEX\\s*\\(?\\s*\\(?\\s*New-Object", desc: "IEX with WebClient download" },
      { pattern: "Invoke-Expression\\s*\\(?\\s*\\(?\\s*New-Object", desc: "Invoke-Expression with download" },
      { pattern: "\\.DownloadString\\s*\\([^)]+\\)\\s*\\)", desc: "DownloadString execution" },
      { pattern: "\\.DownloadFile\\s*\\([^)]+\\)\\s*;?\\s*(Start-Process|&|\\.\\\\|Invoke)", desc: "Download and execute file" },
      { pattern: "Invoke-WebRequest[^\\n]*\\|\\s*Invoke-Expression", desc: "IWR piped to IEX" },
      { pattern: "\\biwr\\b[^\\n]*\\|\\s*iex\\b", desc: "iwr piped to iex" },
      { pattern: "curl[^\\n]*\\|\\s*(bash|sh|powershell)", desc: "Curl piped to shell" },
      { pattern: "wget[^\\n]*\\|\\s*(bash|sh)", desc: "Wget piped to shell" },
    ],
    credentialTheft: [
      { pattern: "mimikatz", desc: "Mimikatz reference" },
      { pattern: "sekurlsa::", desc: "Sekurlsa credential dump" },
      { pattern: "lsadump::", desc: "LSA dump" },
      { pattern: "kerberos::golden", desc: "Golden ticket attack" },
      { pattern: "Invoke-Mimikatz", desc: "Invoke-Mimikatz" },
      { pattern: "Get-GPPPassword", desc: "GPP password extraction" },
      { pattern: "SecureString.*\\|.*ConvertFrom-SecureString.*-Key", desc: "SecureString key extraction" },
      { pattern: "\\[Runtime\\.InteropServices\\.Marshal\\]::PtrToStringAuto\\s*\\(\\s*\\[Runtime", desc: "Marshal credential extraction" },
    ],
    dataExfiltration: [
      { pattern: "webhook\\.office\\.com[^\\n]*\\$env:", desc: "Webhook with environment vars" },
      { pattern: "discord(app)?\\.com\\/api\\/webhooks[^\\n]*\\$(env|pwd|home)", desc: "Discord webhook with sensitive data" },
      { pattern: "\\.UploadString\\s*\\([^)]*\\$env:", desc: "Upload environment data" },
      { pattern: "Invoke-RestMethod[^\\n]*-Method\\s+Post[^\\n]*-Body[^\\n]*(\\$env:|Get-Content|Get-ChildItem)", desc: "POST with sensitive data" },
      { pattern: "telegram\\.org\\/bot[^\\n]*\\$env:", desc: "Telegram bot with env vars" },
    ],
    // Genuinely malicious - these FAIL noMaliciousPatterns.
    maliciousPatterns: [
      { pattern: "New-Object\\s+Net\\.Sockets\\.TCPClient\\s*\\([^)]+\\d+", desc: "TCP reverse shell" },
      { pattern: "\\$client\\s*=\\s*New-Object\\s+System\\.Net\\.Sockets", desc: "Socket-based backdoor" },
      { pattern: "Set-MpPreference\\s+-DisableRealtimeMonitoring\\s+\\$true", desc: "Disable Defender realtime" },
      { pattern: "Set-MpPreference\\s+-DisableIOAVProtection\\s+\\$true", desc: "Disable Defender IOAV" },
      { pattern: "Stop-Service\\s+[\"']?WinDefend", desc: "Stop Windows Defender" },
      { pattern: "sc\\s+(stop|delete)\\s+WinDefend", desc: "SC stop Defender" },
    ],
    // Common, legitimate Intune/endpoint-management admin techniques. These are
    // recorded as informational notes and do NOT fail a check.
    adminTechniques: [
      { pattern: "New-ItemProperty[^\\n]*CurrentVersion\\\\Run[^\\n]*-Value", desc: "Registry Run-key startup entry" },
      { pattern: "schtasks\\s+\\/create[^\\n]*\\/sc\\s+(onstart|onlogon|onidle)", desc: "Scheduled task (startup/logon)" },
      { pattern: "Register-ScheduledTask[^\\n]*-AtLogon", desc: "Logon scheduled task" },
      { pattern: "Start-Process\\s+powershell[^\\n]*-WindowStyle\\s+Hidden", desc: "Hidden PowerShell window" },
    ],
    hardcodedSecrets: [
      { pattern: "[\"'][A-Za-z0-9]{32,}[\"']\\s*#?\\s*(api.?key|secret|token|password)", desc: "Potential hardcoded API key" },
      { pattern: "(password|pwd|secret|api.?key|token)\\s*[=:]\\s*[\"'](?!<|\\$\\{|YOUR[-_]|REPLACE[-_]|INSERT[-_]|PLACEHOLDER|EXAMPLE[-_])[^\"'\\s]{8,}[\"']", desc: "Hardcoded credential" },
      { pattern: "AKIA[0-9A-Z]{16}", desc: "AWS Access Key ID" },
      { pattern: "ghp_[a-zA-Z0-9]{36}", desc: "GitHub Personal Access Token" },
      { pattern: "sk-[a-zA-Z0-9]{48}", desc: "OpenAI API Key" },
      { pattern: "xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}", desc: "Slack Token" },
    ],
  };

  const failCheck = (checkKey, file, p, flags = "gi") => {
    const lineNumbers = findLineNumbers(file.content, p.pattern, flags);
    if (lineNumbers.length === 0) return;
    results[checkKey].passed = false;
    const githubLink = generateGitHubLink(file.path, lineNumbers);
    results[checkKey].details.push({ file: file.path, pattern: p.desc, lines: lineNumbers, githubLink });
    if (!results[checkKey].reason) {
      const lineInfo = lineNumbers.length <= 5 ? lineNumbers.join(", ") : lineNumbers.slice(0, 5).join(", ") + "...";
      results[checkKey].reason = p.desc + " in " + file.path + " ([lines: " + lineInfo + "](" + (githubLink || "#") + "))";
      results[checkKey].githubLink = githubLink;
    }
  };

  for (const file of files) {
    for (const p of patterns.obfuscation) failCheck("noObfuscatedCode", file, p);
    for (const p of patterns.remoteExecution) failCheck("noRemoteExecution", file, p);
    for (const p of patterns.credentialTheft) failCheck("noCredentialTheft", file, p, "i");
    for (const p of patterns.dataExfiltration) failCheck("noDataExfiltration", file, p);
    for (const p of patterns.maliciousPatterns) failCheck("noMaliciousPatterns", file, p);
    for (const p of patterns.hardcodedSecrets) failCheck("noHardcodedSecrets", file, p);

    // Admin techniques: informational only.
    for (const p of patterns.adminTechniques) {
      const lineNumbers = findLineNumbers(file.content, p.pattern);
      if (lineNumbers.length > 0) {
        notes.push({
          check: "noMaliciousPatterns",
          pattern: p.desc,
          file: file.path,
          githubLink: generateGitHubLink(file.path, lineNumbers),
        });
      }
    }
  }

  return { checks: results, notes };
}

async function runAISecurityCheck(files, toolName, openaiApiKey) {
  if (!openaiApiKey || files.length === 0) return null;

  let OpenAI;
  try {
    OpenAI = require("openai");
  } catch {
    console.log("openai package not available; skipping AI check");
    return null;
  }
  const openai = new OpenAI({ apiKey: openaiApiKey });

  let codeContext = "";
  let totalSize = 0;
  const maxContextSize = 30000;
  for (const file of files) {
    if (totalSize + file.content.length > maxContextSize) break;
    codeContext += "\n--- " + file.path + " ---\n" + file.content + "\n";
    totalSize += file.content.length;
  }

  const prompt =
    'You are a security analyst reviewing code for a Microsoft Intune tool called "' + toolName + '".\n\n' +
    "Analyze the following code for security issues. Focus on:\n" +
    "1. Obfuscated code (base64 encoded commands, character code obfuscation, string building to hide intent)\n" +
    "2. Remote code execution (downloading and executing scripts from URLs)\n" +
    "3. Credential theft (harvesting tokens, passwords, certificates, using mimikatz patterns)\n" +
    "4. Data exfiltration (sending sensitive data like $env vars to external webhooks/servers)\n" +
    "5. Malicious patterns (reverse shells, disabling security software)\n" +
    "6. Hardcoded secrets (API keys, tokens, passwords embedded in code)\n\n" +
    "Be strict about malicious patterns but do not flag legitimate admin tools. Microsoft Graph API usage, " +
    "Intune management, scheduled tasks, registry Run keys, and proper authentication flows are expected and normal.\n\n" +
    "Code to analyze:\n" + codeContext + "\n\n" +
    'Respond with JSON only:\n' +
    '{"findings": [{"type": "obfuscation|remote_exec|cred_theft|exfiltration|malicious|secrets", "severity": "high|medium|low", "file": "filename", "description": "what was found"}], "summary": "brief overall assessment"}\n\n' +
    'If no issues found, return: {"findings": [], "summary": "No security issues detected. Code appears safe for an Intune management tool."}';

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a security code reviewer specializing in PowerShell and endpoint management tools. Respond only with valid JSON. Be thorough but avoid false positives on legitimate admin tools." },
        { role: "user", content: prompt },
      ],
    });
    console.log("AI security check completed");
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (e) {
    console.log("AI security check failed: " + e.message);
    return null;
  }
}

/**
 * Scan a repository and return a result with an honest `status`.
 *
 * Result shape (written into the tool JSON by the workflows):
 *   { checks, notes, passed, total, filesScanned, status, branch, repoMetadata, aiSummary, note? }
 * where status is one of: "passed" | "failed" | "not_applicable" | "scan_error".
 */
async function performSecurityScan(repoUrl, toolName, options = {}) {
  const { githubToken, openaiApiKey } = options;
  console.log("Starting security scan for: " + repoUrl);

  const parsed = parseRepo(repoUrl);
  const repoInfo = parsed ? { owner: parsed.owner, repo: parsed.repo, branch: null } : {};

  const repoMeta = await fetchRepoMetadata(repoUrl, githubToken);
  if (repoMeta) {
    console.log("Repository: " + repoMeta.stars + " stars, default branch: " + (repoMeta.defaultBranch || "unknown") + ", archived: " + repoMeta.archived);
  }

  const { files, branch, treeFetched, sawScannable } = await fetchRepoFiles(repoUrl, {
    token: githubToken,
    defaultBranch: repoMeta?.defaultBranch,
  });
  repoInfo.branch = branch;
  console.log("Scanned " + files.length + " files from branch: " + (branch || "n/a") + " (treeFetched=" + treeFetched + ", sawScannable=" + sawScannable + ")");

  if (files.length === 0) {
    // No files scanned. Never report this as a pass. Only "not_applicable" when the
    // tree genuinely had no scannable code; if it had code but downloads failed,
    // that's a transient scan_error to retry, not a permanent "Curated".
    const status = treeFetched && !sawScannable ? "not_applicable" : "scan_error";
    return {
      checks: emptyChecks(),
      notes: [],
      // Cosmetic only; the UI keys on `status`, not these numbers.
      passed: 0,
      total: 6,
      filesScanned: 0,
      status,
      branch,
      repoMetadata: repoMeta,
      aiSummary: null,
      note:
        status === "not_applicable"
          ? "No scannable code files found in repository"
          : "Could not fetch repository contents",
    };
  }

  const { checks: patternResults, notes } = runPatternChecks(files, repoInfo);

  const aiResults = await runAISecurityCheck(files, toolName, openaiApiKey);
  if (aiResults?.findings?.length > 0) {
    const typeMap = {
      obfuscation: "noObfuscatedCode",
      remote_exec: "noRemoteExecution",
      cred_theft: "noCredentialTheft",
      exfiltration: "noDataExfiltration",
      malicious: "noMaliciousPatterns",
      secrets: "noHardcodedSecrets",
    };
    for (const finding of aiResults.findings) {
      if (finding.severity === "high") {
        const checkKey = typeMap[finding.type];
        if (checkKey && patternResults[checkKey].passed) {
          patternResults[checkKey].passed = false;
          patternResults[checkKey].reason = finding.description;
          patternResults[checkKey].details.push({ file: finding.file, pattern: finding.description, source: "AI" });
        }
      }
    }
  }

  const passed = Object.values(patternResults).filter((c) => c.passed).length;
  const total = Object.keys(patternResults).length;

  return {
    checks: patternResults,
    notes,
    passed,
    total,
    filesScanned: files.length,
    status: passed === total ? "passed" : "failed",
    branch,
    repoMetadata: repoMeta,
    aiSummary: aiResults?.summary || null,
  };
}

module.exports = {
  performSecurityScan,
  fetchRepoMetadata,
  fetchRepoFiles,
  runPatternChecks,
  CHECK_KEYS,
};
