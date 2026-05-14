# AGENTS.md

## Project overview

`@felipefontoura/pi-skill-model-handoff` is a Pi coding-agent extension that applies skill-scoped model selection from `SKILL.md` frontmatter.

The extension listens for `read` tool calls, reacts only to `*/skills/*/SKILL.md`, and applies:

- `model: provider/model-id` (required)
- `thinking: off|minimal|low|medium|high|xhigh` (optional)

The package is published to npm as `@felipefontoura/pi-skill-model-handoff` and is loaded by Pi from `./src/skill-model-handoff.ts`.

## Behavioral constraints

- Keep the extension minimal and predictable.
- Do not implement routing, intent classification, or skill selection logic.
- Only react after Pi has already chosen and loaded a skill file.
- Stay silent when no supported frontmatter mapping is present.

## Git guidance

Use Conventional Commits for commit messages, for example:

- `feat: add model frontmatter support`
- `fix: ignore invalid thinking values`
- `docs: improve README quickstart`
