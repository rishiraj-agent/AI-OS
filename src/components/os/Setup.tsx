import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EDITIONS } from "@/lib/os/catalog";
import { useOs } from "@/lib/os/store";
import type { Edition, ThemePref } from "@/lib/os/types";
import { HelixMark } from "./HelixMark";
import { cn } from "@/lib/cn";

export function Setup() {
  const completeSetup = useOs((s) => s.completeSetup);
  const [name, setName] = useState("aria");
  const [edition, setEdition] = useState<Edition>("home");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [simple, setSimple] = useState(true);

  return (
    <div className="flex h-dvh items-center justify-center bg-void px-4 text-fg">
      <div className="helix-panel rounded-helix-lg w-full max-w-lg p-6 md:p-8">
        <div className="stagger-in flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <HelixMark className="size-10" />
            <div>
              <p className="text-xs tracking-[0.22em] text-muted uppercase">First session</p>
              <h1 className="text-xl font-medium tracking-tight">Choose how Helix should feel</h1>
            </div>
          </div>
          <label className="block text-sm">
            <span className="text-muted">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-helix-sm bg-raised px-3 helix-inset outline-none focus:shadow-[0_0_0_2px_var(--helix-accent)]"
            />
          </label>
          <div>
            <p className="text-sm text-muted">Edition</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EDITIONS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEdition(e.id)}
                  className={cn(
                    "rounded-helix-sm px-3 py-2 text-left helix-inset transition-colors",
                    edition === e.id ? "bg-accent text-accent-fg" : "bg-raised hover:bg-surface",
                  )}
                >
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className={cn("text-xs", edition === e.id ? "opacity-80" : "text-muted")}>
                    {e.blurb}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["dark", "light", "auto"] as ThemePref[]).map((t) => (
              <button
                key={t}
                onClick={() => setThemePref(t)}
                className={cn(
                  "h-9 rounded-helix-sm px-3 text-sm helix-inset",
                  themePref === t ? "bg-accent text-accent-fg" : "bg-raised",
                )}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setSimple((v) => !v)}
              className={cn(
                "h-9 rounded-helix-sm px-3 text-sm helix-inset",
                simple ? "bg-accent text-accent-fg" : "bg-raised",
              )}
            >
              {simple ? "Simple Mode" : "Advanced Mode"}
            </button>
          </div>
          <p className="text-xs text-muted">
            Simple Mode keeps power tools a search away. You can switch later in Settings.
          </p>
          <Button onClick={() => completeSetup({ userName: name, edition, themePref, simpleMode: simple })}>
            Enter AI OS
          </Button>
        </div>
      </div>
    </div>
  );
}
