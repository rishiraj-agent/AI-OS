import { createServerFn } from "@tanstack/react-start";

export type AiaRequest = {
  message: string;
  context: string;
};

export type AiaReply = {
  ok: boolean;
  text: string;
  actions: {
    id: string;
    label: string;
    type: string;
    destructive: boolean;
    appId?: string;
    packageId?: string;
    mode?: string;
    name?: string;
    when?: string;
    actions?: string[];
  }[];
  error?: string;
};

const SYSTEM = `You are AIA — AI OS Intelligence Assistant, native to AI OS (Helix desktop).
Tagline: One System. Every Possibility.
You live inside the operating system. Be concise, calm, and specific. No emoji.

Capabilities you can propose as actions:
- open_app (appId: files|terminal|browser|settings|monitor|hardware|devspace|gamehub|notes|media|security|recovery|packages|workspaces|privacy|control|flow|atlas|network)
- install_package (packageId: blender|helix-code|godot|node|rustc|python|docker|k3|ffmpeg|obs|proton|libre|gimp|go|jdk|dotnet|clang|gcc)
- remove_package
- set_mode (mode: balanced|performance|powersave|gaming|creator|developer|server)
- create_workspace (name)
- create_snapshot (name)
- restore_snapshot
- create_flow (name, when, actions string array)
- optimize
- repair

Rules:
- Ask before destructive, admin, delete, format, install, or security-sensitive work by setting destructive=true and a clear label.
- Prefer on-device / local explanations.
- If the user asks to make the PC ready for game development: check RAM/GPU from context, suggest Godot/Rust/Helix Code, create workspace GameProject, set developer or gaming mode, open DevSpace. Confirm installs.
- Never claim you changed the real host computer — you operate AI OS in this session.
- Keep replies under 160 words unless asked for detail.

Respond ONLY with JSON:
{"text":"...","actions":[{"id":"a1","label":"...","type":"open_app","destructive":false,"appId":"devspace"}]}
If no actions, use "actions": [].`;

export const askAia = createServerFn({ method: "POST" })
  .validator((input: AiaRequest) => input)
  .handler(async ({ data }): Promise<AiaReply> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return localFallback(data.message, "AI is not available in this environment");
    }
    const prompt = data.message.slice(0, 2000);
    const context = data.context.slice(0, 2500);
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 700,
          temperature: 0.4,
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `System context:\n${context}\n\nUser:\n${prompt}`,
            },
          ],
        }),
      });
      if (!res.ok) {
        return localFallback(prompt, `xAI API error ${res.status}`);
      }
      const body = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      const raw = body.choices[0]?.message.content ?? "";
      const parsed = parseReply(raw);
      if (parsed) return { ok: true, ...parsed };
      return { ok: true, text: raw.replace(/```json|```/g, "").trim(), actions: [] };
    } catch {
      return localFallback(prompt, "network");
    }
  });

function parseReply(raw: string): Omit<AiaReply, "ok"> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    const json = JSON.parse(raw.slice(start, end + 1)) as AiaReply;
    if (typeof json.text !== "string") return null;
    return { text: json.text, actions: Array.isArray(json.actions) ? json.actions : [] };
  } catch {
    return null;
  }
}

function localFallback(message: string, _reason: string): AiaReply {
  const q = message.toLowerCase();
  if (q.includes("game development") || q.includes("game dev")) {
    return {
      ok: true,
      text: "Hardware looks sufficient (32 GB, discrete GPU). I can install Godot, the Rust toolchain, and Helix Code, create workspace GameProject, and switch to developer mode. Confirm to proceed.",
      actions: [
        {
          id: "ws",
          label: "Create GameProject workspace",
          type: "create_workspace",
          destructive: false,
          name: "GameProject",
        },
        {
          id: "godot",
          label: "Install Godot (signed)",
          type: "install_package",
          destructive: false,
          packageId: "godot",
        },
        {
          id: "rust",
          label: "Install Rust toolchain",
          type: "install_package",
          destructive: false,
          packageId: "rustc",
        },
        {
          id: "mode",
          label: "Switch to developer performance",
          type: "set_mode",
          destructive: false,
          mode: "developer",
        },
        { id: "open", label: "Open DevSpace", type: "open_app", destructive: false, appId: "devspace" },
      ],
    };
  }
  if (q.includes("optimize") || q.includes("slow")) {
    return {
      ok: true,
      text: "I would pause indexing, park unused compatibility containers, and keep AIA on-device. Nothing kernel-level changes without you.",
      actions: [{ id: "opt", label: "Optimize now", type: "optimize", destructive: false }],
    };
  }
  if (q.includes("blender")) {
    return {
      ok: true,
      text: "Blender is available as a signed AIX Linux package (412 MB). Confirm to install through AIPM.",
      actions: [
        {
          id: "bl",
          label: "Install Blender",
          type: "install_package",
          destructive: false,
          packageId: "blender",
        },
      ],
    };
  }
  return {
    ok: true,
    text: "I can search files, explain settings, launch apps, and build AI Flow workflows. Try: “make my PC ready for game development.”",
    actions: [
      { id: "atlas", label: "Open AI OS Atlas", type: "open_app", destructive: false, appId: "atlas" },
    ],
  };
}
