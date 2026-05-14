# Pi Skill Model Handoff

Use different Pi models for different skills automatically.

This package lets each Pi skill choose the model that should be selected when that skill is loaded. You keep using Pi normally; no extra commands are required.

## Install

```bash
pi install npm:@felipefontoura/pi-skill-model-handoff
```

Then restart Pi or run:

```text
/reload
```

## How it works

Add a `model` field to the frontmatter of a skill's `SKILL.md` file:

```yaml
---
name: explore
description: Brainstorm and explore ideas.
model: opencode-go/glm-5.1
thinking: medium
---
```

When Pi loads that skill, this extension selects the configured model.

## Supported fields

### `model`

The model to select when the skill is loaded.

```yaml
model: openai/gpt-5.5
```

```yaml
model: anthropic/claude-sonnet-4-5
```

```yaml
model: opencode-go/glm-5.1
```

### `thinking`

Optional thinking level:

```yaml
thinking: medium
```

Allowed values:

```text
off, minimal, low, medium, high, xhigh
```

## What you will see

When a skill model is applied, Pi shows a small message like:

```text
handoff active: explore
```

If a skill does not define `model`, the extension stays silent.

## Example

```yaml
---
name: review
description: Review code changes.
model: openai/gpt-5.5
thinking: high
---
```

When Pi loads the `review` skill, it switches to `openai/gpt-5.5` and sets thinking to `high`.

## Important

- Pi still decides which skill to load.
- This extension does not choose skills for you.
- This extension does not route prompts by keywords.
- It only applies model settings after Pi loads a skill.

## License

MIT
