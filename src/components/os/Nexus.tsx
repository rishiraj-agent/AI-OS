import { useMemo, useState } from "react";
import { APP_META, FEATURED_BY_EDITION } from "@/lib/os/catalog";
import { useOs } from "@/lib/os/store";
import type { AppId } from "@/lib/os/types";
import { cn } from "@/lib/cn";

const ALL = Object.keys(APP_META) as AppId[];

export function Nexus() {
  const open = useOs((s) => s.nexusOpen);
  const setNexus = useOs((s) => s.setNexus);
  const openApp = useOs((s) => s.openApp);
  const edition = useOs((s) => s.edition);
  const simple = useOs((s) => s.simpleMode);
  const [q, setQ] = useState("");
  const featured = FEATURED_BY_EDITION[edition];
  const apps = useMemo(() => {
    const pool = simple ? featured : ALL;
    const query = q.trim().toLowerCase();
    return pool.filter((id) => {
      const m = APP_META[id];
      return !query || m.name.toLowerCase().includes(query) || m.blurb.toLowerCase().includes(query);
    });
  }, [q, simple, featured]);
  if (!open) return null;
  const groups = [...new Set(apps.map((id) => APP_META[id].category))];
  return (
    <div className="absolute inset-0 z-[90] flex items-end justify-center pb-20 md:items-center md:pb-0">
      <button className="absolute inset-0 bg-void/50" aria-label="Close Nexus" onClick={() => setNexus(false)} />
      <div className="helix-panel rounded-helix-lg relative z-10 m-3 flex max-h-[min(72dvh,640px)] w-[min(920px,100%-1.5rem)] flex-col p-4">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search applications"
          className="h-11 rounded-helix-sm bg-raised px-4 text-sm helix-inset outline-none"
        />
        <div className="os-scroll mt-4 min-h-0 flex-1 overflow-y-auto">
          {groups.map((g) => (
            <div key={g} className="mb-5">
              <p className="mb-2 text-xs tracking-wide text-muted uppercase">{g}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {apps
                  .filter((id) => APP_META[id].category === g)
                  .map((id) => {
                    const m = APP_META[id];
                    const Icon = m.icon;
                    return (
                      <button
                        key={id}
                        onClick={() => openApp(id)}
                        className={cn(
                          "rounded-helix flex items-center gap-3 bg-raised px-3 py-3 text-left helix-inset hover:bg-surface",
                        )}
                      >
                        <span className="grid size-10 place-items-center rounded-helix-sm bg-void text-accent">
                          <Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{m.name}</span>
                          <span className="block text-xs text-muted">{m.blurb}</span>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
