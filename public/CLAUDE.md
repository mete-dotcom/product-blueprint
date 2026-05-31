# deepstrain MCP — Claude Code Project Brief

> Paste this file into your project root as `CLAUDE.md`.  
> Claude Code will read it automatically and know how to use deepstrain's 51 tools.

---

## Setup (one-time)

```bash
pip install deepstrain
deepstrain configure          # enter DeepSeek API key
claude mcp add deepstrain deepstrain mcp
```

After setup, restart Claude Code. deepstrain tools appear automatically.

---

## Available Tools

### File I/O
| Tool | What it does |
|------|-------------|
| `read_file(path, start?, end?)` | Read file, optional line range |
| `write_file(path, content)` | Write/overwrite a file |
| `patch_file(path, old_text, new_text)` | Surgical replacement — must be unique |
| `chunk_read(filepath, chunk, chunk_size?)` | Read large files in 80-line pages |
| `file_outline(filepath)` | Class/def/import lines only — fast structure view |

### Surgical Editing (prefer over write_file)
| Tool | What it does |
|------|-------------|
| `surgical_read(filepath, symbol)` | Extract ONE function/class — 95% token savings |
| `surgical_patch(filepath, symbol, new_code)` | AST replace — auto-validates syntax |
| `smart_patch(path, old_text, new_text)` | Fuzzy patch with difflib fallback |

### Navigation & Search
| Tool | What it does |
|------|-------------|
| `list_dir(path?)` | Directory listing with icons |
| `find_files(pattern, directory?)` | Glob search |
| `search_in_files(pattern, path?, glob?)` | Regex across Python files |
| `grep_files(pattern, directory?, file_pattern?)` | Regex across any file type |
| `find_definition(symbol, file_pattern?)` | Where is X defined? |
| `find_usages(symbol, directory?, file_pattern?)` | Who calls X? |
| `find_symbols(path, kind?)` | List all functions/classes in a file |

### Code Analysis
| Tool | What it does |
|------|-------------|
| `detect_stack(directory?)` | Auto-detect: framework, DB, auth, test libs |
| `project_summary(directory?, max_depth?)` | Directory tree with file counts |
| `project_context(directory?)` | ~1500 token project snapshot — call at session start |
| `strain_project(directory?, fast?)` | Full scan: stack + map + dead code + cycles |
| `dead_code(directory?, file_pattern?)` | Unused functions and classes |
| `circular_deps(directory?)` | Circular import chains |
| `import_graph(filepath, reverse?)` | What imports what (reverse = who imports me) |
| `read_patterns(directory?, sample?)` | Code conventions: naming, types, imports |
| `detect_duplicates(directory?, min_lines?)` | Copy-paste blocks |

### Execution
| Tool | What it does |
|------|-------------|
| `run_command(command, timeout?)` | Shell command — stdout + stderr |
| `run_tests(path_or_pattern?)` | pytest with parsed results |

### Git
| Tool | What it does |
|------|-------------|
| `git_diff(staged?)` | Show diff |
| `git_log(n?)` | Recent commits |
| `git_commit(message)` | Stage all + commit |

### Memory (session)
| Tool | What it does |
|------|-------------|
| `remember(key, value)` | Store in session RAM |
| `recall(key)` | Retrieve from session RAM |
| `save_note(content)` | Persist to ~/.deepstrain/notes.md |
| `read_notes()` | Read persistent notes |

### Orchestration
| Tool | What it does |
|------|-------------|
| `spawn_agents(tasks, max_workers?)` | Parallel sub-agents (security + perf + test at once) |
| `delegate(task, role?, hint?)` | Single specialist sub-agent |
| `deepstrain_eval(task, max_turns?, context?)` | **Full agent loop** — delegate any complex task |

---

## Usage Rules (follow these for best results)

1. **Start sessions with context**: call `project_context(".")` or `strain_project(".")` first
2. **Read before write**: use `surgical_read` before `surgical_patch` — never blindly overwrite
3. **Large files**: use `file_outline` → `surgical_read` instead of `read_file` on files > 200 lines
4. **Multi-step tasks**: prefer `deepstrain_eval` over chaining 5+ individual calls
5. **Search first**: use `find_definition` / `find_usages` before renaming symbols
6. **Verify edits**: run `run_tests` after any code change

---

## Example Task Patterns

### "Analyze this project"
```
detect_stack(".")
project_context(".")
dead_code(".")
```

### "Fix this bug" (with file path + error)
```
surgical_read("src/auth.py", "validate_token")
surgical_patch("src/auth.py", "validate_token", "<fixed code>")
run_tests("tests/test_auth.py")
```

### "Add a feature to a large file"
```
file_outline("src/api.py")          # see structure without loading all lines
surgical_read("src/api.py", "Router")  # read just the class
surgical_patch("src/api.py", "Router", "<new code>")
run_tests()
git_commit("feat: add X endpoint")
```

### "Delegate a complex task entirely"
```
deepstrain_eval(
  task="find all TODO comments, group by file, create GitHub issues for each",
  max_turns=20
)
```

### "Parallel analysis"
```
spawn_agents([
  {"label": "security", "task": "scan for OWASP top 10 in src/"},
  {"label": "perf",     "task": "find N+1 queries in models/"},
  {"label": "coverage", "task": "list untested public functions"},
])
```

---

## deepstrain_eval — The Power Tool

When a task requires 5+ tool calls, delegate it entirely:

```
deepstrain_eval(
  task="run pytest, fix every failing test, re-run until all pass",
  max_turns=25,
  context="we use FastAPI + SQLAlchemy + pytest-asyncio"
)
```

deepstrain runs its full agent loop autonomously and returns a concise summary.

---

*Generated by deepstrain — https://deepstrain.dev/docs#mcp*  
*Add deepstrain to your project: `claude mcp add deepstrain deepstrain mcp`*
