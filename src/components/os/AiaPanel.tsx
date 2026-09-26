import { useRef, useState, type FormEvent } from "react";
import { ArrowUp, Hexagon, X } from "lucide-react";
import { askAia } from "@/lib/os/aia";
import { useOs } from "@/lib/os/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { AiaAction } from "@/lib/os/types";

export function AiaPanel() {
  const open = useOs((s) => s.aiaOpen);
  const setAia = useOs((s) => s.setAia);
  const messages = useOs((s) => s.aia);
  const pushAia = useOs((s) => s.pushAia);
  const setConfirm = useOs((s) => s.setConfirm);
  const applyAction = useOs((s) => s.applyAction);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  async function send(value?: string) {
    const message = (value ?? text).trim();
    if (!message || busy) return;
    setText("");
    pushAia({ role: "user", text: message });
    setBusy(true);
    const s = useOs.getState();
    const context = [
      `user=${s.userName} edition=${s.edition} mode=${s.performanceMode} simple=${s.simpleMode}`,
      `cpu=${s.metrics.cpu.toFixed(0)} gpu=${s.metrics.gpu.toFixed(0)} ram=${s.metrics.ram.toFixed(0)} temp=${s.metrics.temp.toFixed(0)}`,
      `packages=${s.packages.filter((p) => p.installed).map((p) => p.id).join(",")}`,
      `windows=${s.windows.map((w) => w.appId).join(",")}`,
      `wifi=${s.wifi} firewall=${s.firewall} telemetry=${s.telemetry} localAi=${s.localAi}`,
    ].join("\n");
    const res = await askAia({ data: { message, context } });
    pushAia({
      role: "assistant",
      text: res.text || res.error || "I could not complete that.",
      actions: (res.actions ?? []) as AiaAction[],
    });
    setBusy(false);
    requestAnimationFrame(() => end.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  return (
    <>
      <button
        aria-label="AIA"
        onClick={() => setAia(!open)}
        className={cn(
          "helix-panel rounded-helix absolute right-3 top-1/2 z-[75] hidden size-12 -translate-y-1/2 place-items-center md:grid",
          open ? "bg-accent text-accent-fg" : "text-accent",
        )}
      >
        <Hexagon className="size-5" />
      </button>
      <aside
        hidden={!open}
        className={cn(
          "helix-panel rounded-helix-lg absolute z-[92] flex flex-col overflow-hidden",
          "right-3 top-12 bottom-32 w-[min(360px,calc(100%-1.5rem))] max-md:left-3 max-md:right-3 max-md:bottom-24 max-md:w-auto",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <header className="flex h-12 items-center justify-between border-b border-line px-3">
          <div>
            <p className="text-sm font-medium">AIA</p>
            <p className="text-[11px] text-muted">On-device preferred</p>
          </div>
          <button aria-label="Close AIA" className="grid size-9 place-items-center" onClick={() => setAia(false)}>
            <X className="size-4" />
          </button>
        </header>
        <div className="os-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          {messages.map((m) => (
            <div key={m.id} className={cn("max-w-[95%]", m.role === "user" ? "ml-auto" : "")}>
              <div
                className={cn(
                  "rounded-helix-sm px-3 py-2 text-sm leading-relaxed",
                  m.role === "user" ? "bg-accent text-accent-fg" : "bg-raised helix-inset",
                )}
              >
                {m.text}
              </div>
              {m.actions?.length ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  {m.actions.map((a) => (
                    <Button
                      key={a.id}
                      size="sm"
                      variant={a.destructive ? "danger" : "ghost"}
                      onClick={() => {
                        if (a.destructive || a.type === "install_package" || a.type === "restore_snapshot") {
                          setConfirm(a);
                        } else {
                          const out = applyAction(a);
                          pushAia({ role: "assistant", text: out });
                        }
                      }}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {busy && <p className="text-xs text-muted">AIA is thinking…</p>}
          <div ref={end} />
        </div>
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask AIA to run this machine"
            className="h-10 min-w-0 flex-1 rounded-helix-sm bg-raised px-3 text-sm helix-inset outline-none"
          />
          <Button type="submit" size="icon" disabled={busy} aria-label="Send">
            <ArrowUp className="size-4" />
          </Button>
        </form>
        <div className="flex gap-1 overflow-x-auto px-2 pb-2">
          {["Make my PC ready for game development", "Optimize quietly", "Where is GPU performance mode?"].map(
            (chip) => (
              <button
                key={chip}
                onClick={() => void send(chip)}
                className="h-8 shrink-0 rounded-helix-sm bg-raised px-2 text-[11px] text-muted helix-inset hover:text-fg"
              >
                {chip}
              </button>
            ),
          )}
        </div>
      </aside>
    </>
  );
}
