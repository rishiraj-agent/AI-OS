import { cn } from "@/lib/cn";
import { APP_META } from "@/lib/os/catalog";
import { useOs } from "@/lib/os/store";
import type { AppId } from "@/lib/os/types";

const NODES: AppId[] = [
  "control",
  "files",
  "packages",
  "hardware",
  "security",
  "devspace",
  "atlas",
];

export function Spine() {
  const simple = useOs((s) => s.simpleMode);
  const openApp = useOs((s) => s.openApp);
  const windows = useOs((s) => s.windows);
  const workspace = useOs((s) => s.workspace);
  if (simple) return null;
  return (
    <nav
      aria-label="System spine"
      className="helix-panel rounded-helix absolute top-16 bottom-24 left-3 z-[70] hidden w-14 flex-col items-center gap-1 py-2 md:flex"
    >
      {NODES.map((id) => {
        const meta = APP_META[id];
        const Icon = meta.icon;
        const active = windows.some((w) => w.appId === id && w.workspace === workspace && !w.minimized);
        return (
          <button
            key={id}
            title={meta.name}
            onClick={() => openApp(id)}
            className={cn(
              "grid size-10 place-items-center rounded-helix-sm text-muted hover:bg-raised hover:text-fg",
              active && "bg-raised text-accent",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </nav>
  );
}
