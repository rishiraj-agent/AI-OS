import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useOs } from "@/lib/os/store";
import { cn } from "@/lib/cn";

export function TerminalApp() {
  const term = useOs((s) => s.term);
  const runShell = useOs((s) => s.runShell);
  const setAia = useOs((s) => s.setAia);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [term.lines.length]);

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runShell(value);
      setValue("");
      setHist(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(term.history.length - 1, hist + 1);
      setHist(next);
      setValue(term.history[term.history.length - 1 - next] ?? value);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const hints = ["ai help", "ai system status", "aipm search", "neofetch", "ls", "cd"];
      const hit = hints.find((h) => h.startsWith(value));
      if (hit) setValue(hit);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-void font-mono text-[12.5px]" onClick={() => input.current?.focus()}>
      <div className="flex gap-2 border-b border-line px-3 py-2 text-[11px] text-muted">
        <span>main</span>
        <span className="text-faint">|</span>
        <span>ssh</span>
        <span className="text-faint">|</span>
        <span>git</span>
        <button className="ml-auto text-accent" onClick={() => setAia(true)}>
          Ask AIA about errors
        </button>
      </div>
      <div ref={scroller} className="os-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2 leading-relaxed">
        {term.lines.map((l) => (
          <pre
            key={l.id}
            className={cn(
              "whitespace-pre-wrap",
              l.kind === "in" && "text-muted",
              l.kind === "err" && "text-danger",
              l.kind === "ok" && "text-ok",
              l.kind === "ai" && "text-accent",
              l.kind === "out" && "text-fg",
            )}
          >
            {l.text}
          </pre>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-line px-3 py-2">
        <span className="text-accent">{term.cwd.replace(/^\/Users\/[^/]+/, "~")}</span>
        <span className="text-muted">›</span>
        <input
          ref={input}
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          className="min-w-0 flex-1 bg-transparent outline-none"
          spellCheck={false}
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}
