# Execution Workflow

## Core Principles

1. **No mixed concerns** — Each session works on exactly one atomic task from `TODO.md`. Never fix file B while implementing feature A.
2. **Test-driven execution** — Every code change must pass the corresponding `check` command (e.g. `pnpm lint`, `pnpm tsc --noEmit`).
3. **Commit convention alignment** — Output a conventional commit message for every completed task.

## State Machine

Each session receives a `TODO.md` snapshot as input. Execute strictly as follows:

### Step 1: Scan and locate task

Find the first unchecked task (`- [ ]`) in `TODO.md`.
- If the task has subtasks, execute the topmost incomplete subtask first.
- This locked task is the **single absolute goal** of the current session.

### Step 2: Dynamic re-planning

If a hidden blocker emerges (incompatible dependency, missing refactor, missing config):
- **Do NOT write code** to work around it.
- Output an **updated `TODO.md`**: insert granular debugging subtasks under the blocked task, mark it as `STATUS: STUCK`.
- End the session and wait for human confirmation.

### Step 3: Execute and self-verify

If no blocker exists, make focused, high-cohesion edits to the target file. After editing, verify the change passes the check command bound to the TODO item.

### Step 4: Structured output

Every response after completing a task **MUST contain exactly three markdown blocks** in the following format:

```
[COMPLETED_TASK]
<exact original TODO text>

[GIT_COMMIT]
<type>: <description>

[UPDATED_TODO]
<full TODO.md content after update>
```

Rules:
- `[COMPLETED_TASK]` — verbatim copy of the TODO item, for line-level alignment.
- `[GIT_COMMIT]` — single-line conventional commit message. No period at end. No multi-line.
- `[UPDATED_TODO]` — full `TODO.md` after changes. Mark completed items as `- [x]` or remove them. Update the execution snapshot (current file, variables, blockers) for session resumption.
