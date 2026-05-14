# @felipefontoura/pi-skill-model-handoff

`skill-model-handoff` is a minimal Pi extension that applies a skill-scoped model from `SKILL.md` frontmatter.

It keeps Pi's native skill selection behavior intact. Pi still decides _if/when_ to load a skill; this extension only reacts once Pi actually reads `*/skills/*/SKILL.md`.

The goal is simple: **model selection by skill metadata, with near-zero UI noise**.

## Summary

Use this extension when you want different skills to run under different models without manual `/model` switching.

It does the following:

- listens to `tool_call` events for the `read` tool
- reacts only to files matching `*/skills/*/SKILL.md`
- parses frontmatter keys:
  - `model` (required to activate)
  - `thinking` (optional)
- applies `pi.setModel(...)` and optional `pi.setThinkingLevel(...)`

If a skill has no `model` key, the extension stays fully silent.

## Quickstart

### Install from npm

```bash
pi install npm:@felipefontoura/pi-skill-model-handoff
```

### Install from git

```bash
pi install git:github.com/felipefontoura/pi-skill-model-handoff
```

Then reload Pi resources:

```text
/reload
```

## Frontmatter format

Use top-level frontmatter in `SKILL.md`:

```yaml
---
name: explore
description: Brainstorm and idea exploration.
model: opencode-go/glm-5.1
thinking: medium
---
```

### Supported fields

- `model: provider/model-id` (required)
- `thinking: off|minimal|low|medium|high|xhigh` (optional)

Any missing or unsupported mapping is ignored silently.

## Behavior details

### What this extension does

- applies model/thinking when a skill file is actually loaded by Pi
- shows one subtle info notification: `handoff active: <skill>`
- updates status key `skill-model` with applied model info

### What this extension does not do

- does not route by keywords
- does not classify user intent
- does not choose skills
- does not inject skills proactively
- does not require manual `/skill:...` commands

## Example workflow

1. User sends a normal prompt
2. Pi decides to load a skill
3. Pi reads `.../skills/<name>/SKILL.md`
4. Extension sees the read event
5. Extension applies `model` (and optional `thinking`)

No extra workflow is required from the user.

## Notes

- This extension intentionally keeps behavior narrow and predictable.
- If a model is not available in your registry or cannot be selected, Pi shows an error status/notification.

## Development

Local extension source path:

```text
src/skill-model-handoff.ts
```

Basic checks:

```bash
npx prettier --write .
npx tsc -p tsconfig.json --noEmit
```

## License

MIT
