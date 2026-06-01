import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";
import {
  Terminal, ChevronRight, Copy, CheckCircle,
  Zap, Shield, Code, Settings, Package,
  GitBranch, Play, Layers, Network, Cpu,
} from "lucide-react";

// ── Code block with copy ──────────────────────────────────────────────────────
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs font-mono text-gray-500">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-strain-400 transition-colors">
          {copied ? <><CheckCircle className="w-3 h-3" />copied</> : <><Copy className="w-3 h-3" />copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-black/40">
        <code className="text-sm font-mono text-gray-300 whitespace-pre">{code.trim()}</code>
      </pre>
    </div>
  );
}

// ── Tab switcher ──────────────────────────────────────────────────────────────
function Tabs({ tabs, children }: { tabs: string[]; children: (active: number) => React.ReactNode }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-1 mb-0 border-b border-white/10">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              active === i ? "bg-strain-600/20 text-strain-300 border-b-2 border-strain-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-strain-300 mt-6 mb-3">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 text-sm leading-relaxed mb-4">{children}</p>;
}

// ── Tool badge ────────────────────────────────────────────────────────────────
function ToolBadge({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-strain-500/20 transition-colors">
      <code className="text-strain-300 font-mono text-xs mt-0.5 whitespace-nowrap">{name}</code>
      <span className="text-gray-500 text-xs leading-relaxed">{desc}</span>
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "quickstart",    icon: <Zap className="w-4 h-4" />,     label: "Quick Start" },
  { id: "integration",  icon: <Code className="w-4 h-4" />,     label: "Code Integration" },
  { id: "automation",   icon: <Play className="w-4 h-4" />,     label: "Automation" },
  { id: "tools",        icon: <Layers className="w-4 h-4" />,   label: "Tool Catalog" },
  { id: "agents",       icon: <Network className="w-4 h-4" />,  label: "Sub-Agents" },
  { id: "mcp",          icon: <Cpu className="w-4 h-4" />,      label: "MCP Server" },
  { id: "casestudy",    icon: <Play className="w-4 h-4" />,     label: "Case Study" },
  { id: "cicd",         icon: <GitBranch className="w-4 h-4" />,label: "CI / CD" },
  { id: "config",       icon: <Settings className="w-4 h-4" />, label: "Configuration" },
  { id: "security",     icon: <Shield className="w-4 h-4" />,   label: "Security" },
];

// ── Section content components ────────────────────────────────────────────────
function SectionQuickstart() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Quick Start</h1>
      <P>Install deepstrain, configure your DeepSeek key, and run your first AI task — in under 2 minutes.</P>

      <H2>1. Install</H2>
      <CodeBlock lang="bash" code="pip install deepstrain" />

      <H2>2. Configure</H2>
      <CodeBlock lang="bash" code={`deepstrain configure
# → Enter your DeepSeek API key (platform.deepseek.com)
# → Terminal opens deepstrain.vercel.app for activation
# → Pay once → terminal auto-activates`} />

      <H2>3. Run</H2>
      <CodeBlock lang="bash" code={`# Interactive chat with 48 AI tools
deepstrain chat

# One-shot: pass a task directly
deepstrain chat "review auth.py for security issues"

# Short aliases — all equivalent
ds chat "refactor the User model"
strain chat "write tests for api.py"`} />

      <H2>What happens inside</H2>
      <div className="font-mono text-sm bg-black/40 border border-white/10 rounded-xl p-5 space-y-1.5">
        {[
          ["strain-400", "$ strain chat \"add input validation to register()\""],
          ["gray-500",   "→ reading register() via surgical_read ..."],
          ["gray-500",   "→ detecting framework: FastAPI"],
          ["gray-500",   "→ patching with surgical_patch (AST-verified) ..."],
          ["gray-500",   "→ running tests: pytest tests/test_auth.py ..."],
          ["green-400",  "✓ 3 tests passed · 0 failed"],
          ["green-400",  "✓ Pydantic validators added, rollback-safe"],
        ].map(([color, text], i) => (
          <div key={i} className={`text-${color}`}>{text}</div>
        ))}
      </div>
    </div>
  );
}

function SectionIntegration() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Code Integration</h1>
      <P>Call deepstrain from your own code in three ways: subprocess, pipe, or Python library import.</P>

      <H2>Method 1 — Subprocess (any language)</H2>
      <P>The simplest integration. Deepstrain runs as a child process; stdout is captured.</P>

      <Tabs tabs={["Python", "Node.js", "Go", "Bash"]}>
        {(i) => [
          <CodeBlock key="py" lang="python" code={`import subprocess

result = subprocess.run(
    ["deepstrain", "chat", "review auth.py for SQL injection"],
    capture_output=True, text=True, timeout=120
)
print(result.stdout)  # AI response
`} />,
          <CodeBlock key="js" lang="javascript" code={`const { execSync } = require("child_process");

const output = execSync(
  'deepstrain chat "review auth.py for SQL injection"',
  { encoding: "utf8", timeout: 120_000 }
);
console.log(output);
`} />,
          <CodeBlock key="go" lang="go" code={`out, err := exec.Command(
    "deepstrain", "chat",
    "review auth.py for SQL injection",
).Output()
fmt.Println(string(out))
`} />,
          <CodeBlock key="sh" lang="bash" code={`OUTPUT=$(deepstrain chat "review auth.py for SQL injection")
echo "$OUTPUT"
`} />,
        ][i]}
      </Tabs>

      <H2>Method 2 — Pipe (stdin → stdout)</H2>
      <P>Feed any content via stdin. Perfect for scripting and file-based workflows.</P>
      <CodeBlock lang="bash" code={`# Review a specific file
cat src/api/auth.py | deepstrain chat "find security vulnerabilities"

# Review a git diff before committing
git diff | deepstrain chat "summarize these changes as a commit message"

# Pass multiple files
cat models/*.py | deepstrain chat "find circular imports"

# Chain into other tools
deepstrain chat "list all API endpoints in this repo" | grep POST`} />

      <H2>Method 3 — Python Library</H2>
      <P>Import <code className="text-strain-300 font-mono">chat_loop</code> directly and call it programmatically.</P>
      <CodeBlock lang="python" code={`from deepstrain import chat_loop

# Programmatic chat — pass a task string, get result
chat_loop()  # interactive

# Or embed in your script with env vars
import os
os.environ["DEEPSEEK_API_KEY"] = "sk-..."
from deepstrain.chat import _call_api  # internal, not stable API
`} />

      <H2>Method 4 — Parametric Tool Calls</H2>
      <P>Call individual tools directly from Python — no full chat loop needed.</P>
      <CodeBlock lang="python" code={`# deepstrain/chat.py exports tool handler functions
from deepstrain.chat import (
    _read_file,
    _write_file,
    _surgical_read,
    _surgical_patch,
    _run_command,
    _run_tests,
    _git_diff,
    _git_commit,
)

# Read a specific function without loading the whole file
symbol = _surgical_read("src/api/auth.py", "validate_token")
print(symbol)  # just that function, ~95% less tokens

# Patch a function with AST verification + auto-rollback on failure
result = _surgical_patch(
    "src/api/auth.py",
    "validate_token",
    new_code="""
def validate_token(token: str) -> dict:
    if not token or len(token) < 20:
        raise ValueError("Invalid token")
    return jwt.decode(token, SECRET, algorithms=["HS256"])
"""
)

# Run tests after patching
ok = _run_tests("pytest tests/ -x -q")
print("Tests passed" if "passed" in ok else ok)
`} />

      <H2>Real-World Example — Automated Code Review</H2>
      <P>A full script that reviews every PR diff and comments on issues:</P>
      <CodeBlock lang="python" code={`#!/usr/bin/env python3
"""
deepstrain-review.py — run on every PR in CI
Usage: python deepstrain-review.py
"""
import subprocess, json, sys

def review(diff: str) -> str:
    result = subprocess.run(
        ["deepstrain", "chat",
         "review this diff for bugs, security issues, and style violations. "
         "output as JSON: {issues: [{file, line, severity, message}]}"],
        input=diff, capture_output=True, text=True, timeout=180
    )
    return result.stdout

if __name__ == "__main__":
    diff = subprocess.check_output(["git", "diff", "origin/main...HEAD"], text=True)
    if not diff.strip():
        print("No changes to review.")
        sys.exit(0)

    print("Running deepstrain review...")
    report = review(diff)
    print(report)

    # Fail CI if critical issues found
    try:
        data = json.loads(report)
        critical = [i for i in data.get("issues", []) if i["severity"] == "critical"]
        if critical:
            print(f"\\n❌ {len(critical)} critical issue(s) found.")
            sys.exit(1)
    except json.JSONDecodeError:
        pass  # non-JSON output — just display
`} />
    </div>
  );
}

function SectionAutomation() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Automation</h1>
      <P>Deepstrain is designed as a composable automation primitive. Plug it anywhere in your workflow.</P>

      <H2>Git Pre-Commit Hook</H2>
      <P>Automatically review every commit before it lands.</P>
      <CodeBlock lang="bash" code={`# .git/hooks/pre-commit  (chmod +x)
#!/bin/bash
set -e
DIFF=$(git diff --cached)
if [ -z "$DIFF" ]; then exit 0; fi

echo "🧠 deepstrain reviewing staged changes..."
RESULT=$(echo "$DIFF" | deepstrain chat \\
  "check for: hardcoded secrets, SQL injection, XSS, broken imports. \\
   If issues found, print them and exit 1. If clean, print OK.")

echo "$RESULT"
if echo "$RESULT" | grep -qi "exit 1\\|critical\\|secret"; then
  echo "❌ deepstrain blocked commit. Fix issues above."
  exit 1
fi
echo "✓ deepstrain approved."`} />

      <H2>Makefile Integration</H2>
      <CodeBlock lang="makefile" code={`# Makefile
review:
	git diff | ds chat "code review — list issues by severity"

docs:
	ds chat "generate markdown API docs for src/api/*.py" > docs/api.md

refactor:
	ds chat "refactor $(FILE) for readability and add type hints"

commit:
	git diff --cached | ds chat "write a conventional commit message" | git commit -F -`} />

      <H2>Python Build Script</H2>
      <CodeBlock lang="python" code={`# build.py — deepstrain as a build step
import subprocess, pathlib

TASKS = [
    ("security scan",    "scan all Python files for OWASP top 10 vulnerabilities"),
    ("dead code",        "find unused functions and classes, list them"),
    ("generate types",   "add missing type annotations to public functions"),
    ("update changelog", "write CHANGELOG entry for latest git diff"),
]

for label, prompt in TASKS:
    print(f"→ {label}...")
    result = subprocess.run(
        ["deepstrain", "chat", prompt],
        capture_output=True, text=True, timeout=300, cwd=pathlib.Path(".")
    )
    print(result.stdout[:500])
    print()
`} />

      <H2>PowerShell Automation (Windows)</H2>
      <CodeBlock lang="powershell" code={`# review-pr.ps1
$diff = git diff origin/main...HEAD
$review = $diff | deepstrain chat "review for bugs and security issues"
Write-Host $review

# Conditional commit
$msg = git diff --cached | deepstrain chat "write a commit message (50 chars max)"
git commit -m $msg`} />

      <H2>Scheduled Task (Cron)</H2>
      <CodeBlock lang="bash" code={`# crontab -e
# Every day at 9am: scan the repo and email the report
0 9 * * 1-5 cd /my/project && \\
  deepstrain chat "daily health check: test coverage gaps, stale TODOs, dead code" \\
  | mail -s "deepstrain daily report" team@company.com`} />
    </div>
  );
}

function SectionTools() {
  const categories = [
    {
      label: "File I/O",
      icon: <Package className="w-4 h-4" />,
      tools: [
        ["read_file",      "Read any file with optional line range"],
        ["write_file",     "Write content to a file (creates if missing)"],
        ["patch_file",     "Apply unified diff patch"],
        ["chunk_read",     "Read large files in paginated chunks"],
        ["file_outline",   "Extract structure: classes, functions, imports"],
      ],
    },
    {
      label: "Surgical Editing",
      icon: <Cpu className="w-4 h-4" />,
      tools: [
        ["surgical_read",  "Extract one symbol (func/class) — 95% token savings"],
        ["surgical_patch", "Replace one symbol, AST-verified + auto-rollback"],
        ["smart_patch",    "Context-aware patch with conflict detection"],
        ["project_context","Full project summary: stack, patterns, deps"],
      ],
    },
    {
      label: "Navigation",
      icon: <Layers className="w-4 h-4" />,
      tools: [
        ["list_dir",       "List directory contents with metadata"],
        ["find_files",     "Glob-pattern file search"],
        ["search_in_files","Regex search across all files"],
        ["grep_files",     "Case-insensitive grep with file pattern filter"],
        ["find_definition","Locate symbol definition across the codebase"],
        ["find_usages",    "Find all call sites of a function or class"],
      ],
    },
    {
      label: "Code Analysis",
      icon: <Code className="w-4 h-4" />,
      tools: [
        ["detect_stack",   "Detect: language, framework, package manager"],
        ["project_summary","High-level project overview with file counts"],
        ["read_patterns",  "Identify code patterns and conventions"],
        ["dead_code",      "Find unused functions, classes, imports"],
        ["circular_deps",  "Detect circular dependency chains"],
        ["import_graph",   "Build full import dependency graph"],
        ["detect_duplicates","Find copy-pasted code blocks"],
        ["schema_check",   "Validate DB schemas and migrations"],
      ],
    },
    {
      label: "Execution",
      icon: <Play className="w-4 h-4" />,
      tools: [
        ["run_command",    "Run any shell command, capture stdout+stderr"],
        ["run_tests",      "Run test suite, parse results, report failures"],
      ],
    },
    {
      label: "Git",
      icon: <GitBranch className="w-4 h-4" />,
      tools: [
        ["git_diff",       "Show staged or unstaged diff"],
        ["git_log",        "Commit history with author and message"],
        ["git_commit",     "Stage files and commit with message"],
      ],
    },
    {
      label: "Memory",
      icon: <Zap className="w-4 h-4" />,
      tools: [
        ["remember",       "Store a fact in session RAM"],
        ["recall",         "Retrieve a stored fact"],
        ["save_note",      "Persist a note to disk across sessions"],
        ["read_notes",     "Read all persisted notes"],
      ],
    },
    {
      label: "Orchestration",
      icon: <Network className="w-4 h-4" />,
      tools: [
        ["spawn_agents",   "Run multiple sub-agents in parallel (ThreadPoolExecutor)"],
        ["delegate",       "Delegate a task to a specialist sub-agent"],
        ["list_agent_types","List available built-in agent roles"],
        ["strain_project", "Full project deep-scan: stack + patterns + deps + dead code"],
        ["link_project",   "Link another local project for cross-project tasks"],
        ["cross_project",  "Run a task in a linked project's context"],
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Tool Catalog</h1>
      <P>Deepstrain exposes 48 tools to the AI agent. Each can also be called directly from Python.</P>

      <div className="glass p-4 rounded-xl mb-8 border border-strain-500/20">
        <p className="text-strain-300 text-sm font-mono">
          All tools are available inside chat. The agent picks the right one automatically — or you can direct it: <br />
          <span className="text-gray-300">› "use surgical_read to extract the validate_token function"</span>
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat.label} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-strain-400">{cat.icon}</span>
            <H3>{cat.label}</H3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {cat.tools.map(([name, desc]) => (
              <ToolBadge key={name} name={name} desc={desc} />
            ))}
          </div>
        </div>
      ))}

      <H2>Call Tools Directly from Python</H2>
      <CodeBlock lang="python" code={`from deepstrain.chat import (
    _surgical_read, _surgical_patch,
    _detect_stack, _run_tests, _git_diff,
    _spawn_agents, _dead_code,
)

# Extract one symbol — no full file read needed
fn = _surgical_read("src/auth.py", "hash_password")

# Detect project stack
stack = _detect_stack(".")
# → "Python · FastAPI · PostgreSQL · pytest"

# Find dead code
dead = _dead_code("src/")
# → ["src/utils.py:cleanup_temp (never called)", ...]

# Run in parallel: 3 analysis tasks at once
results = _spawn_agents([
    {"label": "security", "task": "scan for OWASP issues"},
    {"label": "perf",     "task": "find N+1 query patterns"},
    {"label": "types",    "task": "list missing type annotations"},
])
for r in results:
    print(r["label"], "→", r["result"][:200])
`} />
    </div>
  );
}

function SectionAgents() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Sub-Agents</h1>
      <P>Deepstrain can spawn parallel specialist agents — each focused on a different dimension of your task.</P>

      <H2>Built-in Agent Roles</H2>
      <div className="grid gap-2 sm:grid-cols-2 mb-8">
        {[
          ["analyst",     "High-level code and architecture analysis"],
          ["security",    "OWASP, injection, auth, secret scanning"],
          ["performance", "Bottlenecks, N+1 queries, memory leaks"],
          ["test",        "Test coverage gaps, edge cases, fixtures"],
          ["docs",        "API docs, README, inline comments"],
          ["refactor",    "Dead code, naming, duplication, patterns"],
        ].map(([role, desc]) => (
          <ToolBadge key={role} name={role} desc={desc} />
        ))}
      </div>

      <H2>Parallel Spawn Example</H2>
      <P>Ask deepstrain to run multiple agents simultaneously — results merge back to main context.</P>
      <CodeBlock lang="bash" code={`# In chat:
spawn_agents security + performance + test on src/api/

# Deepstrain runs 3 agents in parallel:
#   security → scans OWASP top 10
#   performance → finds bottlenecks
#   test → lists coverage gaps
# Results merged in ~same time as one agent`} />

      <H2>From Python</H2>
      <CodeBlock lang="python" code={`from deepstrain.chat import _spawn_agents, _delegate

# Parallel: 3 independent analyses
results = _spawn_agents([
    {"label": "security",  "task": "OWASP scan src/api/"},
    {"label": "perf",      "task": "find slow queries in models/"},
    {"label": "coverage",  "task": "list untested public functions"},
], max_workers=3)

for r in results:
    print(f"[{r['label']}] {r['result'][:300]}")

# Single specialist delegation
report = _delegate(
    task="audit the JWT implementation for vulnerabilities",
    role="security",
    hint="focus on token expiry and algorithm confusion attacks"
)
print(report)
`} />

      <H2>Cross-Project Tasks</H2>
      <P>Link multiple local repositories and run tasks across them.</P>
      <CodeBlock lang="bash" code={`# Link related projects
link_project /path/to/frontend alias=fe
link_project /path/to/backend  alias=be

# Run task in linked project's context
cross_project fe "find all API calls that don't match the backend spec"
cross_project be "list endpoints that the frontend never calls"`} />
    </div>
  );
}

function SectionMCP() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">MCP Server</h1>
      <P>
        Model Context Protocol (MCP) is an open standard that lets Claude Code, Gemini, and other AI
        assistants use deepstrain's tools directly. One-time setup turns deepstrain into 51 native
        tools inside Claude Code — no copy-paste, no context switching.
      </P>

      <div className="glass p-5 rounded-xl mb-8 border border-strain-500/20 bg-strain-600/5">
        <p className="text-strain-300 text-sm font-semibold mb-1">What is MCP?</p>
        <p className="text-gray-400 text-sm leading-relaxed">
          A tool discovery and invocation protocol over JSON-RPC 2.0. When Claude Code connects to an MCP server,
          it can call every tool on that server as if they were its own built-ins — the user never has to
          describe what the tools do.
        </p>
      </div>

      <H2>Setup (one-time)</H2>
      <P>Register deepstrain as an MCP server in Claude Code:</P>
      <CodeBlock lang="bash" code={`# Claude Code CLI (recommended)
claude mcp add deepstrain deepstrain mcp

# Verify
claude mcp list
# → deepstrain   deepstrain mcp   ✓ running`} />

      <H2>Manual Setup</H2>
      <P>
        Claude Code reads{" "}
        <code className="text-strain-300 font-mono text-xs">~/.claude.json</code>{" "}
        or a project-level{" "}
        <code className="text-strain-300 font-mono text-xs">.claude.json</code>:
      </P>
      <CodeBlock lang="json" code={`{
  "mcpServers": {
    "deepstrain": {
      "command": "deepstrain",
      "args": ["mcp"]
    }
  }
}`} />

      <H2>What Claude Code gains after setup</H2>
      <div className="grid gap-2 sm:grid-cols-2 mb-6">
        {[
          ["read_file",         "Read any file, with optional line range"],
          ["grep_files",        "Regex search across any file type"],
          ["write_file",        "Create or overwrite a file"],
          ["git_log / git_diff","Commit history and diffs"],
          ["run_command",       "Execute any shell command"],
          ["run_tests",         "Run pytest + parse results"],
          ["strain_project",    "Full project scan: stack, deps, dead code"],
          ["deepstrain_eval",   "Delegate an entire task to deepstrain ↓"],
        ].map(([name, desc]) => (
          <ToolBadge key={name} name={name} desc={desc} />
        ))}
      </div>

      <H2>deepstrain_eval — The Meta-Tool</H2>
      <P>
        The most powerful MCP tool. Claude Code delegates an entire engineering task in a single call.
        deepstrain runs its full agent loop with 51 direct tools and returns a concise summary.
      </P>
      <CodeBlock lang="text" code={`# You say to Claude Code:
"use deepstrain to run all tests and fix every failure"

# Claude Code → deepstrain MCP:
tools/call deepstrain_eval {
  "task": "run all tests, fix every failure, re-run until green",
  "max_turns": 20
}

# deepstrain → autonomous agent loop:
→ run_tests       (find failures)
→ read_file       (read broken file)
→ patch_file      (fix it)
→ run_tests       (verify)
→ git_commit      (done)

# Claude Code ← deepstrain:
"Fixed 3 failures in tests/test_auth.py.
 Changed: validate_token(), hash_password().
 All 47 tests green."`} />

      <H2>deepstrain_eval Parameters</H2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Parameter", "Type", "Description"].map(h => (
                <th key={h} className="text-left p-3 text-gray-500 font-mono font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["task",      "string (required)",        "Task to perform. Include file paths, error messages, constraints, and success criteria."],
              ["max_turns", "integer (default: 12)",    "Max agent steps. Use 20–30 for large tasks."],
              ["context",   "string (optional)",        "Extra context: stack traces, file contents, conversation history."],
            ].map(([param, type, desc]) => (
              <tr key={param} className="border-b border-white/5">
                <td className="p-3"><code className="text-strain-300 font-mono text-xs">{param}</code></td>
                <td className="p-3 text-gray-500 text-xs font-mono">{type}</td>
                <td className="p-3 text-gray-400 text-xs">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Protocol Details</H2>
      <div className="grid gap-2 sm:grid-cols-2 mb-6">
        {[
          ["JSON-RPC 2.0",   "Newline-delimited messages over stdio"],
          ["ANSI stripped",  "All color codes removed from tool results"],
          ["64 KB cap",      "Large outputs truncated — protects agent context window"],
          ["isError:true",   "Errors never crash the server — safe return always"],
          ["resources/list", "Returns empty list for protocol compliance"],
          ["prompts/list",   "Returns empty list for protocol compliance"],
        ].map(([name, desc]) => (
          <ToolBadge key={name} name={name} desc={desc} />
        ))}
      </div>

      <H2>Other MCP-Compatible Agents</H2>
      <CodeBlock lang="bash" code={`# Gemini Pro CLI
gemini mcp add deepstrain deepstrain mcp

# Any MCP host (over stdio):
deepstrain mcp          # server starts, speaks JSON-RPC 2.0

# Isolated Docker usage:
docker run --rm -i deepstrain/deepstrain mcp

# Full setup guide in terminal:
deepstrain mcp --info`} />

      <H2>Troubleshooting</H2>
      <CodeBlock lang="bash" code={`# Is the server starting?
deepstrain mcp --info      # print setup guide
deepstrain doctor          # system health check

# Claude Code not seeing the server?
claude mcp remove deepstrain
claude mcp add deepstrain deepstrain mcp

# PATH issue? Use the full path:
which deepstrain           # /usr/local/bin/deepstrain
# In ~/.claude.json:
# "command": "/usr/local/bin/deepstrain"

# Protocol reference: https://spec.modelcontextprotocol.io/`} />
    </div>
  );
}

function SectionCaseStudy() {
  const [copied, setCopied] = React.useState(false);

  const claudeMdUrl = "/CLAUDE.md";
  const curlCmd = `curl -o CLAUDE.md https://massiron.com/CLAUDE.md`;

  const copyClaudeCmd = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      id: 1,
      tool: "list_dir",
      args: `{ "path": "." }`,
      what: "Check current project state",
      result: `📁 .git\n📄 README.md`,
      note: "Empty project — only the init commit exists",
    },
    {
      id: 2,
      tool: "write_file",
      args: `{ "path": "watcher.py", "content": "..." }`,
      what: "Write the main module from scratch",
      result: `[OK] Written 3484 chars to watcher.py`,
      note: "write_file created the file on disk — no editor was opened",
    },
    {
      id: 3,
      tool: "write_file",
      args: `{ "path": "requirements.txt", "content": "deepstrain>=0.3.9\\n" }`,
      what: "Write dependency file",
      result: `[OK] Written 18 chars to requirements.txt`,
      note: "",
    },
    {
      id: 4,
      tool: "run_command",
      args: `{ "command": "python -c \\"import ast; ast.parse(open('watcher.py').read())\\"" }`,
      what: "Check for syntax errors",
      result: `[stderr] UnicodeDecodeError: 'charmap' codec...`,
      note: "Bug caught — Windows default encoding couldn't read the file",
    },
    {
      id: 5,
      tool: "patch_file",
      args: `{ "path": "watcher.py", "old_text": "  ✚ {Path(f).name}", "new_text": "  [+] {Path(f).name}" }`,
      what: "Replace Unicode symbols with ASCII (3 separate patches)",
      result: `[OK] Patched watcher.py`,
      note: "patch_file changed only those lines — the rest of the file was untouched",
    },
    {
      id: 6,
      tool: "run_command",
      args: `{ "command": "python -c \\"...ast.parse(open('watcher.py', encoding='utf-8').read())...\\"" }`,
      what: "Re-validate syntax with explicit UTF-8",
      result: `Syntax OK — 3491 chars`,
      note: "Clean ✓",
    },
    {
      id: 7,
      tool: "find_symbols",
      args: `{ "path": "watcher.py", "kind": "function" }`,
      what: "List all functions in the written file",
      result: `def file_hash()  line 18\ndef snapshot()  line 25\ndef analyze()  line 35\ndef log_change()  line 55\ndef watch()  line 69`,
      note: "5 functions at the correct line positions",
    },
    {
      id: 8,
      tool: "surgical_read",
      args: `{ "filepath": "watcher.py", "symbol": "watch" }`,
      what: "Read only the main loop function",
      result: `# watcher.py › watch  (lines 69–105)\ndef watch(root: Path, interval: float = 2.0):\n    ...\n\n# surgical_read: 37/113 lines (67% token savings)`,
      note: "Pulled 37 lines from a 113-line file — 67% token savings vs read_file",
    },
    {
      id: 9,
      tool: "run_command",
      args: `{ "command": "git add watcher.py requirements.txt README.md && git commit -m \\"feat: ds-watch v1.0\\"" }`,
      what: "Commit all changes",
      result: `[master 4534db6] feat: ds-watch v1.0\n3 files changed, 148 insertions(+)`,
      note: "",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Case Study</h1>
      <P>
        Two real projects built entirely through deepstrain MCP — no editor opened, no manual file writes.
        The first shows individual tool calls step by step. The second shows full autonomous delegation via{" "}
        <code className="text-strain-300 font-mono text-xs">deepstrain_eval</code>.
      </P>

      <div className="glass p-5 rounded-xl mb-8 border border-strain-500/20 bg-strain-600/5">
        <p className="text-strain-300 text-sm font-semibold mb-1">ds-watch — what is it?</p>
        <p className="text-gray-400 text-sm leading-relaxed">
          A CLI tool that watches a directory, detects file changes every 2 seconds, runs deepstrain analysis,
          and appends timestamped entries to <code className="text-strain-300 font-mono text-xs">CHANGES.md</code>.
          All coding, fixing, and committing — no editor opened, only MCP tool calls.
        </p>
      </div>

      <H2>Part 1 — Individual Tool Calls (step by step)</H2>

      <div className="space-y-4 mb-10">
        {steps.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/5">
              <span className="w-6 h-6 rounded-full bg-strain-600/30 border border-strain-500/40 flex items-center justify-center text-xs font-mono text-strain-300 flex-shrink-0">
                {s.id}
              </span>
              <code className="text-strain-300 font-mono text-sm font-semibold">{s.tool}</code>
              <span className="text-gray-500 text-xs ml-auto hidden sm:block">{s.what}</span>
            </div>
            {/* Body */}
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="p-4">
                <p className="text-xs text-gray-600 font-mono mb-2">→ call</p>
                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">{s.args}</pre>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-600 font-mono mb-2">← response</p>
                <pre className="text-xs font-mono text-green-400/80 whitespace-pre-wrap leading-relaxed">{s.result}</pre>
                {s.note && (
                  <p className="mt-3 text-xs text-gray-500 italic border-t border-white/5 pt-2">{s.note}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <H2>Tool Summary — Which Tool, Why</H2>
      <div className="grid gap-2 sm:grid-cols-2 mb-8">
        {[
          ["write_file",    "Create a file from scratch"],
          ["patch_file",    "Surgical single-line or block replacement"],
          ["run_command",   "Syntax check, git, any shell command"],
          ["find_symbols",  "Verify the written code structure"],
          ["surgical_read", "Read before editing — 67–95% token savings"],
          ["list_dir",      "Quick snapshot of project state"],
        ].map(([tool, use]) => (
          <ToolBadge key={tool} name={tool} desc={use} />
        ))}
      </div>

      <H2>Part 2 — Full Autonomous Build via deepstrain_eval</H2>
      <P>
        The second project, <strong className="text-white">commitlens</strong>, was built with a single task
        delegated to <code className="text-strain-300 font-mono text-xs">deepstrain_eval</code>.
        No individual tool calls — deepstrain planned and executed everything by itself.
      </P>

      <div className="glass p-5 rounded-xl mb-6 border border-strain-500/20 bg-strain-600/5">
        <p className="text-strain-300 text-sm font-semibold mb-1">commitlens — what is it?</p>
        <p className="text-gray-400 text-sm leading-relaxed">
          A CLI git repo analyzer. Run it against any local repository and get: top contributors,
          hot files, ASCII commit activity chart, commit type breakdown, and a markdown report.
          Built with 3 modules + 14 tests — all by deepstrain, zero human file edits.
        </p>
      </div>

      <H3>The task — one block of text</H3>
      <CodeBlock lang="python" code={`deepstrain_eval(
  task="""
  Build a complete Python CLI tool called commitlens from scratch.

  Features:
  - Top contributors (commits, lines added/removed)
  - Hot files — top 10 most changed files
  - ASCII bar chart of commits per week (last 12 weeks)
  - Commit type breakdown (feat/fix/chore/docs/refactor)
  - Summary: total commits, contributors, date range, avg/day

  Technical:
  - Pure stdlib (no third-party deps)
  - 3 files: commitlens.py, analyzer.py, report.py
  - 5+ pytest tests in tests/test_analyzer.py
  - README.md

  Workflow: write files → syntax check → run tests → fix failures
           → run against a real repo → commit
  """,
  max_turns=30
)`} />

      <H3>What deepstrain did — autonomously</H3>
      <div className="space-y-2 mb-6">
        {[
          ["list_dir",       "Confirmed project directory is empty"],
          ["write_file ×3",  "Wrote analyzer.py (8 KB), report.py (7 KB), commitlens.py (2 KB)"],
          ["write_file ×2",  "Wrote tests/test_analyzer.py (7 KB) and README.md"],
          ["run_command ×3", "Ran py_compile on each file — fixed one encoding issue"],
          ["run_command",    "Ran pytest — 14 tests collected, 14 passed"],
          ["run_command",    "Ran commitlens.py against the deepstrain repo → real output"],
          ["run_command",    "git commit — feat: commitlens v1.0"],
        ].map(([tool, desc]) => (
          <ToolBadge key={tool} name={tool} desc={desc} />
        ))}
      </div>

      <H3>Real output — commitlens on the deepstrain repo</H3>
      <CodeBlock lang="text" code={`$ python commitlens.py /path/to/deepstrain

+----------------------------------------------------------------------+
| COMMITLENS  Git Repository Report                                    |
+----------------------------------------------------------------------+
| Summary                                                              |
|  Total commits:      50                                              |
|  Total contributors: 2                                               |
|  Date range:         2026-05-24 to 2026-05-26                        |
|  Avg commits/day:    50.0                                            |
+----------------------------------------------------------------------+
| Top Contributors                                                     |
|  Name        Commits    Added  Removed                               |
|  ---------- -------- -------- --------                               |
|  Mete             48   13,905    3,473                               |
+----------------------------------------------------------------------+
| Hot Files (Top 10)                                                   |
|  deepstrain/cli.py                   16 changes                      |
|  deepstrain/chat.py                  11 changes                      |
|  build_wheel.py                      11 changes                      |
|  vercel-commerce/src/pages/docs.tsx   7 changes                      |
+----------------------------------------------------------------------+
| Commit Type Breakdown                                                |
|  fix:     16 commits (32%)                                           |
|  feat:    12 commits (24%)                                           |
|  chore:    3 commits ( 6%)                                           |
+----------------------------------------------------------------------+`} />

      <H3>The difference</H3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["", "Individual tools (ds-watch)", "deepstrain_eval (commitlens)"].map(h => (
                <th key={h} className="text-left p-3 text-gray-500 font-normal text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Who planned?",      "You",                       "deepstrain"],
              ["Tool calls",        "9 explicit calls by you",   "~20 calls, chosen autonomously"],
              ["Error handling",    "You noticed, you fixed",    "deepstrain noticed, deepstrain fixed"],
              ["Commit",            "You triggered it",          "deepstrain committed on its own"],
              ["Your input",        "9 separate instructions",   "1 block of text"],
            ].map(([label, a, b]) => (
              <tr key={label} className="border-b border-white/5">
                <td className="p-3 text-gray-500 text-xs font-medium">{label}</td>
                <td className="p-3 text-gray-400 text-xs">{a}</td>
                <td className="p-3 text-strain-300 text-xs">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>CLAUDE.md — Ready-to-use Template</H2>
      <P>
        Drop this file into your project root. Claude Code reads{" "}
        <code className="text-strain-300 font-mono text-xs">CLAUDE.md</code> automatically and learns
        how to use all 51 deepstrain tools — no explanation needed.
      </P>

      <div className="rounded-xl border border-strain-500/30 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 bg-strain-600/10 border-b border-strain-500/20">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-strain-400" />
            <span className="text-sm font-semibold text-strain-300">Download CLAUDE.md template</span>
          </div>
          <a
            href={claudeMdUrl}
            download="CLAUDE.md"
            className="text-xs px-3 py-1.5 bg-strain-600 hover:bg-strain-500 text-white rounded-lg transition-colors"
          >
            İndir
          </a>
        </div>
        <div className="p-4 bg-black/30">
          <p className="text-gray-400 text-sm mb-3">
            Or pull it with one command:
          </p>
          <div className="rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-xs font-mono text-gray-500">bash</span>
              <button
                onClick={copyClaudeCmd}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-strain-400 transition-colors"
              >
                {copied ? <><CheckCircle className="w-3 h-3" />copied</> : <><Copy className="w-3 h-3" />copy</>}
              </button>
            </div>
            <pre className="p-4 bg-black/40">
              <code className="text-sm font-mono text-gray-300">{curlCmd}</code>
            </pre>
          </div>
        </div>
      </div>

      <P>
        Once the file is in your project, you don't need to tell Claude anything.
        Claude reads it and knows when and how to call each of deepstrain's 52 tools.
      </P>

      <div className="rounded-xl border border-white/8 overflow-hidden mb-8">
        <div className="px-4 py-3 bg-white/5 border-b border-white/5">
          <span className="text-xs font-mono text-gray-500">CLAUDE.md contents (preview)</span>
        </div>
        <pre className="p-4 overflow-x-auto bg-black/30 text-xs font-mono text-gray-400 whitespace-pre leading-relaxed">{`# deepstrain MCP — Claude Code Project Brief

## Setup (one-time)
claude mcp add deepstrain deepstrain mcp

## Available Tools
read_file / write_file / patch_file / surgical_read / surgical_patch
list_dir / find_files / grep_files / search_in_files / find_symbols
detect_stack / strain_project / dead_code / circular_deps
run_command / run_tests / git_diff / git_log / git_commit
spawn_agents / delegate / deepstrain_eval

## Usage Rules
1. Start with: project_context(".")
2. Read before write: surgical_read → surgical_patch
3. Large files: file_outline → surgical_read (not read_file)
4. Complex tasks: deepstrain_eval(task="...", max_turns=20)
5. Parallel analysis: spawn_agents([security, perf, test])
6. Always run_tests after code changes`}</pre>
      </div>

      <H2>Full Delegation via deepstrain_eval</H2>
      <P>
        Once your project is connected to deepstrain MCP, you can give complex tasks to Claude Code
        in plain English — one sentence:
      </P>
      <CodeBlock lang="text" code={`# You type in Claude Code:
"use deepstrain to run all tests and fix every failure"

# Claude Code → deepstrain MCP:
tools/call deepstrain_eval {
  "task": "run pytest, fix every failure, re-run until all green",
  "max_turns": 25
}

# deepstrain → autonomous agent loop → result:
"Fixed 3 failures in tests/test_auth.py.
 Changed: validate_token(), hash_password().
 All 47 tests passing."`} />
    </div>
  );
}

function SectionCICD() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">CI / CD</h1>
      <P>Add deepstrain to any CI pipeline. It runs headlessly — no interactive prompts.</P>

      <H2>GitHub Actions</H2>
      <CodeBlock lang="yaml" code={
"# .github/workflows/deepstrain-review.yml\n" +
"name: deepstrain review\n\n" +
"on:\n" +
"  pull_request:\n" +
"    types: [opened, synchronize]\n\n" +
"jobs:\n" +
"  review:\n" +
"    runs-on: ubuntu-latest\n" +
"    steps:\n" +
"      - uses: actions/checkout@v4\n" +
"        with:\n" +
"          fetch-depth: 0\n\n" +
"      - name: Install deepstrain\n" +
"        run: pip install deepstrain\n\n" +
"      - name: Activate license\n" +
"        run: deepstrain activate ${{ secrets.DEEPSTRAIN_KEY }}\n\n" +
"      - name: Review PR diff\n" +
"        env:\n" +
"          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}\n" +
"        run: |\n" +
"          git diff origin/main...HEAD | deepstrain chat \\\n" +
"            \"review this PR diff. critical bugs, security issues,\n" +
"             missing tests. be concise. output markdown.\" \\\n" +
"            > review.md\n" +
"          cat review.md\n\n" +
"      - name: Comment on PR\n" +
"        uses: peter-evans/create-or-update-comment@v4\n" +
"        with:\n" +
"          issue-number: ${{ github.event.pull_request.number }}\n" +
"          body-path: review.md"
      } />

      <H2>GitLab CI</H2>
      <CodeBlock lang="yaml" code={`# .gitlab-ci.yml
deepstrain-review:
  stage: test
  script:
    - pip install deepstrain
    - deepstrain activate $DEEPSTRAIN_KEY
    - git diff origin/main...HEAD |
        deepstrain chat "security and bug review — output JSON"
  only:
    - merge_requests`} />

      <H2>Headless / Non-Interactive Mode</H2>
      <CodeBlock lang="bash" code={`# One-shot — exits after response (no REPL)
deepstrain chat "generate unit tests for src/auth.py"

# Pipe input, pipe output
cat src/auth.py | deepstrain chat "add type annotations" > src/auth_typed.py

# Exit code: 0 = success, 1 = error
deepstrain chat "..." && echo OK || echo FAILED

# JSON output for parsing
deepstrain chat "list all functions missing docstrings as JSON array"
`} />
    </div>
  );
}

function SectionConfig() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Configuration</h1>

      <H2>Config File</H2>
      <P>Config is stored at <code className="text-strain-300 font-mono">~/.deepstrain/config.toml</code></P>
      <CodeBlock lang="toml" code={`# ~/.deepstrain/config.toml
[default]
api_key = "sk-..."          # DeepSeek API key
model   = "deepstrain"      # deepstrain = deepseek-chat alias
                            # deepstrain-r1 = deepseek-reasoner`} />

      <H2>Environment Variables</H2>
      <CodeBlock lang="bash" code={`# Override config with env vars
export DEEPSEEK_API_KEY=sk-...
export DEEPSTRAIN_MODEL=deepseek-reasoner

# For CI: set key inline
DEEPSEEK_API_KEY=sk-... deepstrain chat "..."

# Model options
# deepstrain     → deepseek-chat     (fast, default)
# deepstrain-r1  → deepseek-reasoner (slow, max reasoning)`} />

      <H2>CLI Commands</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Command", "Description"].map(h => (
                <th key={h} className="text-left p-3 text-gray-500 font-mono font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["deepstrain configure",  "Interactive setup: API key + model"],
              ["deepstrain activate KEY","Activate license (auto or manual)"],
              ["deepstrain status",     "Show license info and expiry"],
              ["deepstrain doctor",     "Health check: config, license, tools"],
              ["deepstrain version",    "Show version"],
              ["deepstrain chat",       "Start agent (licensed) or basic chat (free)"],
              ["deepstrain mcp",        "Start MCP server over stdio (Claude Code / Gemini)"],
              ["deepstrain mcp --info", "Show MCP setup guide and exit"],
              ["ds / strain",           "Short aliases for deepstrain"],
            ].map(([cmd, desc]) => (
              <tr key={cmd} className="border-b border-white/5">
                <td className="p-3"><code className="text-strain-300 font-mono text-xs">{cmd}</code></td>
                <td className="p-3 text-gray-400 text-xs">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionSecurity() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Security</h1>

      <H2>Your key never leaves your machine</H2>
      <P>
        Deepstrain is BYOK (bring your own key). Your DeepSeek API key goes directly from
        your terminal to DeepSeek's API — it never passes through deepstrain's servers.
      </P>

      <H2>License Architecture</H2>
      <CodeBlock lang="text" code={`Purchase → Paddle → webhook generates DSTR-XXXXX key
                    ↓
               HMAC-SHA256 signed payload stored locally
               ~/.deepstrain/.license
                    ↓
          deepstrain chat → verify_license() reads local file
          → checks signature offline (no network required)
          → 7-day grace period after expiry`} />

      <H2>What is stored where</H2>
      <div className="grid gap-2 sm:grid-cols-2 mb-6">
        {[
          ["~/.deepstrain/config.toml", "API key + model preference (local only)"],
          ["~/.deepstrain/.license",    "HMAC-signed license token (local only)"],
          ["Vercel KV",                 "License metadata for revocation checks"],
          ["deepstrain servers",        "Nothing — no telemetry, no code, no prompts"],
        ].map(([loc, desc]) => (
          <ToolBadge key={loc} name={loc} desc={desc} />
        ))}
      </div>

      <H2>Offline Mode</H2>
      <P>After activation, deepstrain works completely offline. License verification uses local HMAC — no network needed.</P>

      <H2>Key Rotation</H2>
      <CodeBlock lang="bash" code={`# If your DeepSeek key is compromised:
deepstrain configure   # enter new key — old one replaced locally

# If your license key is compromised:
# Contact support — we revoke server-side, generate a new key`} />
    </div>
  );
}

const SECTION_COMPONENTS: Record<string, () => JSX.Element> = {
  quickstart:   SectionQuickstart,
  integration:  SectionIntegration,
  automation:   SectionAutomation,
  tools:        SectionTools,
  agents:       SectionAgents,
  mcp:          SectionMCP,
  casestudy:    SectionCaseStudy,
  cicd:         SectionCICD,
  config:       SectionConfig,
  security:     SectionSecurity,
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Docs() {
  const [active, setActive] = useState("quickstart");
  const SectionContent = SECTION_COMPONENTS[active] || SectionQuickstart;
  const currentIdx = NAV.findIndex(n => n.id === active);

  return (
    <>
      <Head>
        <title>docs — massiron</title>
        <meta name="description" content="deepstrain documentation: installation, code integration, automation, tool catalog, CI/CD." />
      </Head>

      <MassironNav />

      <div className="min-h-screen pt-14 bg-[#030712] flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 pt-6">
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-3 px-2">documentation</p>
            <nav className="space-y-0.5">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                    active === item.id
                      ? "bg-strain-600/15 text-strain-300 border border-strain-500/20"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <span className={active === item.id ? "text-strain-400" : "text-gray-600"}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-10 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-8">
            <Link href="/" className="hover:text-gray-400 transition-colors">deepstrain</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400">{NAV.find(n => n.id === active)?.label}</span>
          </div>

          {/* Section */}
          <SectionContent />

          {/* Prev / Next */}
          <div className="flex items-center justify-between mt-14 pt-6 border-t border-white/5">
            {currentIdx > 0 ? (
              <button
                onClick={() => setActive(NAV[currentIdx - 1].id)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                {NAV[currentIdx - 1].label}
              </button>
            ) : <div />}
            {currentIdx < NAV.length - 1 ? (
              <button
                onClick={() => setActive(NAV[currentIdx + 1].id)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {NAV[currentIdx + 1].label}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : <div />}
          </div>
        </main>
      </div>

      {/* Cross-sell */}
      <div className="border-t border-white/5 bg-[#030712] py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">also from us</p>
            <p className="text-sm font-mono font-semibold text-gray-300">ATLAS — deterministic code intelligence</p>
            <p className="text-xs text-gray-600 mt-1">offline · no LLM · HMAC-licensed · <code className="text-gray-500">atlas scan .</code> → HTML report</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/bundle" className="text-xs font-mono px-3 py-1.5 rounded border border-strain-500/40 text-strain-400 hover:bg-strain-600 hover:text-white hover:border-strain-600 transition-all">
              bundle — save 20% →
            </Link>
            <Link href="/atlas" className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">atlas →</Link>
          </div>
        </div>
      </div>

      <MassironFooter />
    </>
  );
}
