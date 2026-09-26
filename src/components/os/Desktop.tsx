import { useEffect, useState } from "react";
import { Hexagon } from "lucide-react";
import { useOs } from "@/lib/os/store";
import { WindowFrame } from "./WindowFrame";
import { Horizon } from "./Horizon";
import { Spine } from "./Spine";
import { Nexus } from "./Nexus";
import { AiaPanel } from "./AiaPanel";
import {
  ConfirmDialog,
  DesktopIcons,
  NotifyPane,
  QuickPane,
  SearchPalette,
} from "./Overlays";
import { APP_VIEWS } from "./apps/registry";
import { cn } from "@/lib/cn";

export function Desktop() {
  const windows = useOs((s) => s.windows);
  const workspace = useOs((s) => s.workspace);
  const themePref = useOs((s) => s.themePref);
  const reduced = useOs((s) => s.reducedMotion);
  const contrast = useOs((s) => s.highContrast);
  const fontScale = useOs((s) => s.fontScale);
  const brightness = useOs((s) => s.brightness);
  const tick = useOs((s) => s.tick);
  const setNexus = useOs((s) => s.setNexus);
  const setSearch = useOs((s) => s.setSearch);
  const setAia = useOs((s) => s.setAia);
  const setWorkspace = useOs((s) => s.setWorkspace);
  const openApp = useOs((s) => s.openApp);
  const gameMode = useOs((s) => s.gameMode);
  const gpu = useOs((s) => s.metrics.gpu);
  const [mobile, setMobile] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const compute = () => {
      if (themePref === "auto") setTheme(dark.matches ? "dark" : "light");
      else setTheme(themePref);
    };
    compute();
    dark.addEventListener("change", compute);
    return () => dark.removeEventListener("change", compute);
  }, [themePref]);

  useEffect(() => {
    const t = setInterval(tick, 2200);
    return () => clearInterval(t);
  }, [tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (meta && e.key === " ") {
        e.preventDefault();
        setNexus(true);
      }
      if (meta && e.key === "`") {
        e.preventDefault();
        openApp("terminal");
      }
      if (meta && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAia(true);
      }
      if (meta && ["1", "2", "3"].includes(e.key)) {
        setWorkspace(Number(e.key) - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setNexus, setSearch, setAia, setWorkspace, openApp]);

  const wallpaper =
    theme === "light" ? "/wallpapers/helix-day.jpg" : "/wallpapers/helix-night.jpg";
  const visible = windows.filter((w) => w.workspace === workspace);

  return (
    <div
      className={cn("relative h-dvh overflow-hidden text-fg", reduced && "reduce-motion", contrast && "high-contrast")}
      data-theme={theme}
      style={{ fontSize: `${fontScale * 100}%` }}
    >
      <img
        src={wallpaper}
        alt=""
        className="absolute inset-0 size-full object-cover"
        style={{ filter: `brightness(${brightness / 100})` }}
      />
      <div className="absolute inset-0 bg-void/25" />
      {gameMode && (
        <div className="absolute top-3 right-20 z-20 rounded-helix-sm bg-void/60 px-2 py-1 font-mono text-[11px] tabular-nums text-accent helix-inset">
          GAME {gpu.toFixed(0)}%
        </div>
      )}
      <DesktopIcons />
      <Spine />
      {visible.map((w) => {
        const View = APP_VIEWS[w.appId];
        return (
          <WindowFrame key={w.id} win={w} mobile={mobile}>
            <View win={w} />
          </WindowFrame>
        );
      })}
      <Horizon mobile={mobile} />
      <AiaPanel />
      <Nexus />
      <SearchPalette />
      <QuickPane />
      <NotifyPane />
      <ConfirmDialog />
      <button
        className="helix-panel rounded-helix absolute top-3 right-3 z-30 grid size-11 place-items-center text-accent md:hidden"
        aria-label="AIA"
        onClick={() => setAia(true)}
      >
        <Hexagon className="size-5" />
      </button>
    </div>
  );
}
