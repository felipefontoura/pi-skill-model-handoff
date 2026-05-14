import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import fs from "node:fs";
import path from "node:path";

type Thinking = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

const THINKING_LEVELS = new Set<Thinking>([
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
]);

type SkillConfig = {
  model?: string;
  thinking?: Thinking;
};

function isSkillFile(file: string): boolean {
  const p = file.replaceAll("\\", "/");
  return p.endsWith("/SKILL.md") && p.includes("/skills/");
}

function parseFrontmatter(file: string): SkillConfig {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const out: SkillConfig = {};

  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*?)\s*$/);
    if (!m) continue;

    const key = m[1];
    const value = m[2].replace(/^["']|["']$/g, "");

    if (key === "model") out.model = value;
    if (key === "thinking" && THINKING_LEVELS.has(value as Thinking)) {
      out.thinking = value as Thinking;
    }
  }

  return out;
}

function resolveModel(raw: string) {
  const i = raw.indexOf("/");
  return i === -1
    ? { provider: undefined, id: raw }
    : { provider: raw.slice(0, i), id: raw.slice(i + 1) };
}

function modelLabel(model: any | undefined) {
  if (!model) return "unknown";
  const provider = model.provider ?? model.providerId ?? model.providerName;
  const id = model.id ?? model.model ?? model.name;
  if (provider && id) return `${provider}/${id}`;
  return id ?? provider ?? "unknown";
}

async function applyModel(pi: ExtensionAPI, ctx: any, config: SkillConfig) {
  if (!config.model) return false;

  const from = modelLabel(ctx.model);
  const { provider, id } = resolveModel(config.model);

  const model = provider
    ? ctx.modelRegistry.find(provider, id)
    : ctx.modelRegistry.find(id);

  if (!model) {
    ctx.ui.notify(
      `skill-model-handoff: model not found: ${config.model}`,
      "error",
    );
    ctx.ui.setStatus("skill-model", `ERROR model not found: ${config.model}`);
    return false;
  }

  const to = modelLabel(model);
  const ok = await pi.setModel(model);

  if (!ok) {
    ctx.ui.notify(
      `skill-model-handoff: failed to switch: ${from} → ${to}`,
      "error",
    );
    ctx.ui.setStatus("skill-model", `ERROR failed: ${from} → ${to}`);
    return false;
  }

  if (config.thinking) {
    pi.setThinkingLevel(config.thinking);
  }

  return true;
}

export default function skillModelHandoff(pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (!isToolCallEventType("read", event)) return;

    const raw =
      (event.input as { path?: unknown; filePath?: unknown }).path ??
      (event.input as { path?: unknown; filePath?: unknown }).filePath;
    if (typeof raw !== "string") return;

    const file = path.isAbsolute(raw) ? raw : path.resolve(ctx.cwd, raw);

    if (!isSkillFile(file)) return;
    if (!fs.existsSync(file)) return;

    const config = parseFrontmatter(file);
    if (!config.model) return;

    const skillName = path.basename(path.dirname(file));

    const ok = await applyModel(pi, ctx, config);
    if (!ok) return;

    ctx.ui.notify(`handoff active: ${skillName}`, "info");
    ctx.ui.setStatus("skill-model", `applied: ${skillName} → ${config.model}`);
  });
}
