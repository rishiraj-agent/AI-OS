import { useEffect, useState } from "react";
import { HelixMark } from "./HelixMark";
import { useOs } from "@/lib/os/store";

const STAGES = [
  "Hardware initialization",
  "Secure verification",
  "Kernel initialization",
  "Driver initialization",
  "AI services",
  "Desktop session",
];

export function Boot() {
  const bootDone = useOs((s) => s.bootDone);
  const setupComplete = useOs((s) => s.setupComplete);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setI((n) => {
        if (n >= STAGES.length - 1) {
          clearInterval(t);
          setTimeout(bootDone, setupComplete ? 280 : 420);
          return n;
        }
        return n + 1;
      });
    }, setupComplete ? 220 : 380);
    return () => clearInterval(t);
  }, [bootDone, setupComplete]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-void px-6 text-fg">
      <div className="stagger-in flex flex-col items-center gap-8">
        <HelixMark className="size-16" />
        <div className="text-center">
          <p className="text-xs tracking-[0.28em] text-muted uppercase">AI OS</p>
          <h1 className="mt-2 font-medium tracking-[-0.03em] text-2xl">Helix</h1>
        </div>
        <ol className="w-64 space-y-2 font-mono text-[11px]">
          {STAGES.map((s, idx) => (
            <li
              key={s}
              className={
                idx < i ? "text-muted" : idx === i ? "text-accent" : "text-faint"
              }
            >
              <span className="mr-2 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
              {s}
              {idx === i ? <span className="ml-2 animate-[helix-pulse_1.2s_ease_infinite]">▸</span> : null}
            </li>
          ))}
        </ol>
        <p className="text-xs text-faint">One System. Every Possibility.</p>
      </div>
    </div>
  );
}
