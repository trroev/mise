---
name: task
description: Work on a RECIPE-NNN ticket from TASKS.md. Reads the ticket, explores the codebase, implements acceptance criteria, then commits and pushes. Use when starting or resuming a ticket.
---

Read TASKS.md and find the ticket given in the arguments.

Before writing any code:
1. Read the full ticket — description, dependencies, acceptance criteria
2. Explore the codebase to understand current state; do not ask the user to explain what already exists
3. If any acceptance criteria are genuinely ambiguous, ask before starting — otherwise proceed

Work through the acceptance criteria. When all are met:
- Run `pnpm typecheck` and `pnpm lint` and fix any issues
- Update the ticket's criteria checkboxes in TASKS.md
- Commit and push using conventional atomic commits, grouped logically by concern
