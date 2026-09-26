import { Bell, Hexagon, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_META } from "@/lib/os/catalog";
import { useOs } from "@/lib/os/store";
import { HelixMark } from "./HelixMark";
import { useEffect, useState } from "react";

export function Horizon({ mobile }: { mobile: boolean }) {
  const windows = useOs((s) => s.windows);
  const workspace = useOs((s) => s.workspace);
  const setWorkspace = useOs((s) => s.setWorkspace);
  const focusWindow = useOs((s) => s.focusWindow);
  const toggleMinimize = useOs((s) => s.toggleMinimize);
  const setNexus = useOs((s) => s.setNexus);
  const setSearch = useOs((s) => s.setSearch);
  const setQuick = useOs((s) => s.setQuick);
  const setNotify = useOs((s) => s.setNotify);
  const nexusOpen = useOs((s) => s.nexusOpen);
  const notes = useOs((s) => s.notifications);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  const visible = windows.filter((w) => w.workspace === workspace);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-3 z-[80] flex justify-center px-3",
        mobile && "bottom-2",
      )}
    >
      <div className="pointer-events-auto helix-panel rounded-helix flex h-14 max-w-[920px] items-center gap-1 px-2">
        <button
          aria-label="Nexus launcher"
          onClick={() => setNexus(!nexusOpen)}
          className={cn(
            "grid size-11 place-items-center rounded-helix-sm",
            nexusOpen ? "bg-accent text-accent-fg" : "text-accent hover:bg-raised",
          )}
        >
          <HelixMark className="size-7" />
        </button>
        <div className="mx-1 hidden h-7 w-px bg-line sm:block" />
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {visible.map((w) => {
            const Icon = APP_META[w.appId].icon;
            return (
              <button
                key={w.id}
                onClick={() => (w.minimized ? toggleMinimize(w.id) : focusWindow(w.id))}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-helix-sm px-2.5 text-xs",
                  w.minimized ? "text-muted" : "bg-raised text-fg",
                )}
                title={w.title}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden max-w-[8rem] truncate md:inline">{w.title}</span>
              </button>
            );
          })}
        </div>
        <div className="mx-1 hidden h-7 w-px bg-line sm:block" />
        <div className="hidden items-center gap-1 md:flex">
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              aria-label={`Workspace ${n + 1}`}
              onClick={() => setWorkspace(n)}
              className={cn(
                "size-2 rounded-full",
                workspace === n ? "bg-accent" : "bg-faint/50 hover:bg-muted",
              )}
            />
          ))}
        </div>
        <button aria-label="Search" className="grid size-10 place-items-center text-muted hover:text-fg" onClick={() => setSearch(true)}>
          <Search className="size-4" />
        </button>
        <button aria-label="Notifications" className="relative grid size-10 place-items-center text-muted hover:text-fg" onClick={() => setNotify(true)}>
          <Bell className="size-4" />
          {notes.length > 0 && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />}
        </button>
        <button aria-label="Quick settings" className="grid size-10 place-items-center text-muted hover:text-fg" onClick={() => setQuick(true)}>
          <SlidersHorizontal className="size-4" />
        </button>
        <div className="hidden items-center gap-2 px-2 font-mono text-xs tabular-nums text-muted sm:flex">
          <Hexagon className="size-3 text-accent" />
          {clock}
        </div>
      </div>
    </div>
  );
}
