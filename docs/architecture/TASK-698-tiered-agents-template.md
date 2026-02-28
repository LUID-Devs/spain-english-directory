# AGENTS.md Template — Tiered Context Structure

> **TASK-698 Implementation** — Optimized context loading to reduce token overhead and improve success rates

This template replaces the monolithic AGENTS.md with a tiered structure that loads only relevant context based on session type.

---

## File Structure

```
workspace/
├── AGENTS.md                 # Core + conditional markers
├── context/
│   ├── extended.md           # Main session guidance
│   ├── subagent.md           # Subagent-specific rules
│   └── platform/
│       ├── discord.md
│       ├── telegram.md
│       └── slack.md
└── shared/                   # System-wide references
    ├── safety.md
    ├── formatting.md
    ├── heartbeats.md
    └── memory-management.md
```

---

## AGENTS.md (Core File)

```markdown
# AGENT_NAME — ROLE_TAGLINE

<!-- CORE: Loaded in ALL sessions -->
## Identity
**Role:** [Role name]  
**Objective:** [One-line objective]

## Critical Rules
1. [Must-follow rule 1]
2. [Must-follow rule 2]
3. [Must-follow rule 3]

## Tools
- Tool references only — see ../shared/tools.md for details

<!-- CORE END -->

<!-- EXTENDED: Loaded in MAIN sessions only -->
## Detailed Workflows
[Agent-specific workflows]

## Memory
- Daily: `memory/YYYY-MM-DD.md`
- Long-term: `MEMORY.md` (main sessions only)

<!-- EXTENDED END -->
```

---

## Size Targets

| Section | Max Lines | Est. Tokens | Load Condition |
|---------|-----------|-------------|----------------|
| Core | 50 | ~750 | Always |
| Extended | 100 | ~1,500 | Main sessions |
| Platform | 30 | ~450 | Per-platform |
| **Total (Main)** | **180** | **~2,700** | — |
| **Total (Subagent)** | **50** | **~750** | — |

---

## Migration Guide

### Step 1: Identify Core Content
Extract into AGENTS.md:
- Agent identity/role
- Non-negotiable rules (3-5 max)
- Essential tool references

### Step 2: Move Extended Content
Move to `context/extended.md`:
- Detailed workflows
- Memory management details
- Platform-specific behaviors

### Step 3: Reference Shared Content
Replace inline content with links:
```markdown
<!-- OLD: -->
## Safety Rules
[50 lines of safety guidelines]

<!-- NEW: -->
## Safety
See [Safety Guidelines](../../shared/safety.md)
```

### Step 4: Update Session Loader
Modify context loading logic to:
1. Always load AGENTS.md (Core section only)
2. Load Extended section for main sessions
3. Load Platform file based on channel
4. Skip MEMORY.md for subagents/group chats

---

## Validation Checklist

- [ ] Core section ≤ 50 lines
- [ ] Extended section ≤ 100 lines
- [ ] No duplication with shared/ files
- [ ] Subagent context ≤ 60 lines total
- [ ] All critical rules in Core section

---

## Expected Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Subagent Context | 212 lines | 50 lines | -76% |
| Main Context | 212 lines | 180 lines | -15% |
| Token Overhead | ~3,200 | ~2,700 | -16% |
| Load Time | Baseline | Faster | Improved |
