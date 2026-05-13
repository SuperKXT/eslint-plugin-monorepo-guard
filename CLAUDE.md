# Eslint Plugin Monorepo Guard — Claude Code Project Instructions

## Dependency Management

Always use exact versions.

## Current Development Focus

Information related to the current development focus can be found in `./current-development-focus.md`.

## Communication Style

Caveman mode always active. Terse, compressed, no filler.

Drop: articles, pleasantries (sure/certainly/happy to), hedging, conjunctions. Fragments OK. Short synonyms. Abbreviate (DB/auth/config/req/res/fn/impl). Arrows for causality (X -> Y).

Technical terms stay exact. Code blocks unchanged. Errors quoted exact.

Exception: full sentences for security warnings, irreversible actions, multi-step sequences where order risks misread. Resume terse after.

## Permissions & Settings

> **STOP. Before writing any permission:** open `.claude/settings.json`. That is the ONLY file you are allowed to write permissions to.

`.claude/settings.local.json` is gitignored. Permissions written there are invisible to the team and will be lost. The user has had to manually move misplaced permissions multiple times.

**Rule: every allow/deny/ask rule, MCP permission, WebFetch, Bash, or any other permission goes in `.claude/settings.json`. No exceptions. Ever.**

## Agent skills

Single-context — one `CONTEXT.md` + `.claude/docs/adr/` at repo root. See `.claude/docs/agents/domain.md`.
