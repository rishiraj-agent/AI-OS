import { useState, type ReactNode } from "react";
import { SETTINGS_INDEX } from "@/lib/os/catalog";
import { useOs } from "@/lib/os/store";
import type { OsWindow, PerformanceMode } from "@/lib/os/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const GROUPS = [
  "System",
  "Display",
  "Sound",
  "Network",
  "Bluetooth",
  "Storage",
  "Power",
  "Security",
  "Privacy",
  "Users",
  "Applications",
  "Gaming",
  "Developer",
  "AI",
  "Updates",
  "Backup",
  "Virtualization",
  "Accessibility",
];

export function SettingsApp({ win }: { win: OsWindow }) {
  const [group, setGroup] = useState(win.payload?.group ?? "System");
  const [q, setQ] = useState("");
  const s = useOs();
  const hits = SETTINGS_INDEX.filter(
    (x) => q && (x.keys.includes(q.toLowerCase()) || x.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="flex h-full min-h-0">
      <aside className="os-scroll hidden w-44 shrink-0 overflow-y-auto border-r border-line p-2 md:block">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={cn(
              "block w-full rounded-helix-sm px-2 py-2 text-left text-xs",
              group === g ? "bg-raised text-fg" : "text-muted hover:text-fg",
            )}
          >
            {g}
          </button>
        ))}
      </aside>
      <div className="os-scroll min-w-0 flex-1 overflow-y-auto p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Where can I change GPU performance mode?"
          className="mb-4 h-10 w-full rounded-helix-sm bg-raised px-3 text-sm helix-inset outline-none"
        />
        {hits.length > 0 && (
          <div className="mb-4 space-y-1">
            {hits.map((h) => (
              <button
                key={h.id}
                onClick={() => setGroup(h.group)}
                className="block text-sm text-accent hover:underline"
              >
                Open {h.title}
              </button>
            ))}
          </div>
        )}
        {group === "System" && (
          <Section title="System">
            <Row label="Edition" value={s.edition} />
            <Row label="User" value={s.userName} />
            <Toggle
              label="Simple Mode"
              on={s.simpleMode}
              onChange={() => s.setSimpleMode(!s.simpleMode)}
              hint="Hide the spine and advanced defaults. Search still finds everything."
            />
            <Button size="sm" variant="ghost" onClick={() => s.resetDemo()}>
              Reset this machine
            </Button>
          </Section>
        )}
        {group === "Display" && (
          <Section title="Display">
            <Row label="Theme" value={s.themePref} />
            <div className="flex gap-2">
              {(["dark", "light", "auto"] as const).map((t) => (
                <Button key={t} size="sm" variant={s.themePref === t ? "primary" : "ghost"} onClick={() => s.setThemePref(t)}>
                  {t}
                </Button>
              ))}
            </div>
            <label className="mt-3 block text-xs text-muted">
              Brightness
              <input
                type="range"
                className="mt-1 w-full"
                min={20}
                max={100}
                value={s.brightness}
                onChange={(e) => s.setSetting({ brightness: Number(e.target.value) })}
              />
            </label>
          </Section>
        )}
        {group === "Sound" && (
          <Section title="Sound">
            <label className="text-xs text-muted">
              Output volume
              <input
                type="range"
                className="mt-1 w-full"
                min={0}
                max={100}
                value={s.volume}
                onChange={(e) => s.setSetting({ volume: Number(e.target.value) })}
              />
            </label>
          </Section>
        )}
        {group === "Network" && (
          <Section title="Network">
            <Toggle label="Wi-Fi" on={s.wifi} onChange={() => s.setSetting({ wifi: !s.wifi })} />
            <p className="text-sm text-muted">HelixNet 6 GHz · encrypted DNS · default-deny firewall</p>
            <Button size="sm" variant="ghost" onClick={() => s.openApp("network")}>
              Open network dashboard
            </Button>
          </Section>
        )}
        {group === "Bluetooth" && (
          <Section title="Bluetooth">
            <Toggle label="Bluetooth" on={s.bluetooth} onChange={() => s.setSetting({ bluetooth: !s.bluetooth })} />
          </Section>
        )}
        {group === "Storage" && (
          <Section title="Storage">
            <Toggle
              label="Full-disk encryption"
              on={s.diskEncryption}
              onChange={() => s.setSetting({ diskEncryption: !s.diskEncryption })}
            />
            <p className="text-sm text-muted">HelixFS on NVMe. Snapshots live in /Snapshots.</p>
          </Section>
        )}
        {group === "Power" && (
          <Section title="Power">
            <p className="mb-2 text-sm text-muted">AI Performance Engine explains every change.</p>
            {(
              ["balanced", "performance", "powersave", "gaming", "creator", "developer", "server"] as PerformanceMode[]
            ).map((m) => (
              <button
                key={m}
                onClick={() => s.setPerformanceMode(m)}
                className={cn(
                  "mr-2 mb-2 rounded-helix-sm px-3 py-1.5 text-xs helix-inset",
                  s.performanceMode === m ? "bg-accent text-accent-fg" : "bg-raised",
                )}
              >
                {m}
              </button>
            ))}
          </Section>
        )}
        {group === "Security" && (
          <Section title="Security">
            <Toggle label="Secure Boot" on={s.secureBoot} onChange={() => s.setSetting({ secureBoot: !s.secureBoot })} />
            <Toggle label="Firewall" on={s.firewall} onChange={() => s.setSetting({ firewall: !s.firewall })} />
            <Toggle
              label="Immutable system"
              on={s.immutableSystem}
              onChange={() => s.setSetting({ immutableSystem: !s.immutableSystem })}
            />
            <Button size="sm" variant="ghost" onClick={() => s.openApp("security")}>
              Security Center
            </Button>
          </Section>
        )}
        {group === "Privacy" && (
          <Section title="Privacy">
            <Toggle label="Telemetry" on={s.telemetry} onChange={() => s.setSetting({ telemetry: !s.telemetry })} hint="Off by default. Nothing leaves without you." />
            <Button size="sm" variant="ghost" onClick={() => s.openApp("privacy")}>
              Privacy Center
            </Button>
          </Section>
        )}
        {group === "Users" && (
          <Section title="Users">
            <p className="text-sm">
              {s.userName} · administrator. Guest, child, developer and service accounts are isolated with home directories and resource limits.
            </p>
          </Section>
        )}
        {group === "Applications" && (
          <Section title="Applications">
            <p className="text-sm text-muted">Native .aipkg, AIX Windows/Linux, web, containers, VMs.</p>
            <Button size="sm" variant="ghost" onClick={() => s.openApp("packages")}>
              Package Center
            </Button>
          </Section>
        )}
        {group === "Gaming" && (
          <Section title="Gaming">
            <Toggle
              label="Game Mode"
              on={s.gameMode}
              onChange={() => s.setGameMode(!s.gameMode)}
              hint="Parks nonessential services. Compositor and AIA stay available."
            />
            <p className="text-sm text-muted">GPU performance, Vulkan, DirectX via GameCore Proton, FPS overlay, shader cache.</p>
            <Button size="sm" variant="ghost" onClick={() => s.openApp("gamehub")}>
              Open GameHub
            </Button>
          </Section>
        )}
        {group === "Developer" && (
          <Section title="Developer">
            <p className="text-sm text-muted">GCC, Clang, Python, Rust, Go, Java, Node, .NET, Docker, Git, SSH — install via AIPM.</p>
            <Button size="sm" variant="ghost" onClick={() => s.openApp("devspace")}>
              Open DevSpace
            </Button>
          </Section>
        )}
        {group === "AI" && (
          <Section title="AI">
            <Toggle label="Prefer on-device AIA" on={s.localAi} onChange={() => s.setSetting({ localAi: !s.localAi })} />
            <p className="text-sm text-muted">AIA never runs destructive work without a confirmation card.</p>
          </Section>
        )}
        {group === "Updates" && (
          <Section title="Updates">
            <p className="text-sm">Automatic security updates. Failed updates roll back to the last HelixFS snapshot.</p>
            <Button size="sm" variant="ghost" onClick={() => s.createSnapshot("Before update")}>
              Create restore point
            </Button>
          </Section>
        )}
        {group === "Backup" && (
          <Section title="Backup">
            <p className="text-sm text-muted">Offline-first. Optional encrypted cloud sync is opt-in per folder.</p>
          </Section>
        )}
        {group === "Virtualization" && (
          <Section title="Virtualization">
            <p className="text-sm text-muted">VMs, containers, Linux environments, Windows AIX, development sandboxes.</p>
          </Section>
        )}
        {group === "Accessibility" && (
          <Section title="Accessibility">
            <Toggle label="Reduced motion" on={s.reducedMotion} onChange={() => s.setSetting({ reducedMotion: !s.reducedMotion })} />
            <Toggle label="High contrast" on={s.highContrast} onChange={() => s.setSetting({ highContrast: !s.highContrast })} />
            <label className="text-xs text-muted">
              Font scale
              <input
                type="range"
                min={0.9}
                max={1.35}
                step={0.05}
                value={s.fontScale}
                onChange={(e) => s.setSetting({ fontScale: Number(e.target.value) })}
                className="mt-1 w-full"
              />
            </label>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-medium tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
function Toggle({
  label,
  on,
  onChange,
  hint,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
  hint?: string;
}) {
  return (
    <div>
      <button onClick={onChange} className="flex w-full items-center justify-between text-sm">
        <span>{label}</span>
        <span className={cn("h-6 w-10 rounded-full p-0.5 helix-inset", on ? "bg-accent" : "bg-raised")}>
          <span className={cn("block size-5 rounded-full bg-fg transition-transform", on ? "translate-x-4" : "translate-x-0")} />
        </span>
      </button>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
