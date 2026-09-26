import { useRef, type PointerEvent, type ReactNode } from "react";
import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_META } from "@/lib/os/catalog";
import { DESKTOP_PAD, useOs } from "@/lib/os/store";
import type { OsWindow, SnapZone } from "@/lib/os/types";

function zoneFromPoint(x: number, y: number, w: number, h: number): SnapZone {
  const edge = 28;
  if (y < edge) return "top";
  if (x < edge && y < h / 2) return "ul";
  if (x < edge && y >= h / 2) return "ll";
  if (x > w - edge && y < h / 2) return "ur";
  if (x > w - edge && y >= h / 2) return "lr";
  if (x < edge) return "left";
  if (x > w - edge) return "right";
  return null;
}

export function geom(win: OsWindow, vw: number, vh: number, mobile: boolean) {
  const p = mobile
    ? { l: 8, r: 8, t: 8, b: 72 }
    : DESKTOP_PAD;
  const W = vw - p.l - p.r;
  const H = vh - p.t - p.b;
  if (mobile || win.maximized || win.snap === "top")
    return { x: p.l, y: p.t, w: W, h: H };
  if (win.snap === "left") return { x: p.l, y: p.t, w: W / 2, h: H };
  if (win.snap === "right") return { x: p.l + W / 2, y: p.t, w: W / 2, h: H };
  if (win.snap === "ul") return { x: p.l, y: p.t, w: W / 2, h: H / 2 };
  if (win.snap === "ur") return { x: p.l + W / 2, y: p.t, w: W / 2, h: H / 2 };
  if (win.snap === "ll") return { x: p.l, y: p.t + H / 2, w: W / 2, h: H / 2 };
  if (win.snap === "lr") return { x: p.l + W / 2, y: p.t + H / 2, w: W / 2, h: H / 2 };
  return { x: win.x, y: win.y, w: win.w, h: win.h };
}

export function WindowFrame({
  win,
  children,
  mobile,
}: {
  win: OsWindow;
  children: ReactNode;
  mobile: boolean;
}) {
  const focusWindow = useOs((s) => s.focusWindow);
  const closeWindow = useOs((s) => s.closeWindow);
  const toggleMinimize = useOs((s) => s.toggleMinimize);
  const toggleMaximize = useOs((s) => s.toggleMaximize);
  const moveWindow = useOs((s) => s.moveWindow);
  const resizeWindow = useOs((s) => s.resizeWindow);
  const snapWindow = useOs((s) => s.snapWindow);
  const drag = useRef<{ dx: number; dy: number; mode: "move" | "resize"; dir?: string } | null>(
    null,
  );
  const Icon = APP_META[win.appId].icon;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const g = geom(win, vw, vh, mobile);

  function onTitleDown(e: PointerEvent<HTMLDivElement>) {
    if (mobile || (e.target as HTMLElement).closest("button")) return;
    focusWindow(win.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - g.x, dy: e.clientY - g.y, mode: "move" };
  }
  function onMove(e: PointerEvent) {
    if (!drag.current) return;
    if (drag.current.mode === "move") {
      moveWindow(win.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy);
    } else {
      const dir = drag.current.dir ?? "";
      let { x, y, w, h } = g;
      if (dir.includes("e")) w = e.clientX - x;
      if (dir.includes("s")) h = e.clientY - y;
      if (dir.includes("w")) {
        const nx = e.clientX;
        w = x + w - nx;
        x = nx;
        moveWindow(win.id, x, y);
      }
      if (dir.includes("n")) {
        const ny = e.clientY;
        h = y + h - ny;
        y = ny;
        moveWindow(win.id, x, y);
      }
      resizeWindow(win.id, w, h);
    }
  }
  function onUp(e: PointerEvent) {
    if (drag.current?.mode === "move") {
      const z = zoneFromPoint(e.clientX, e.clientY, vw, vh);
      if (z) snapWindow(win.id, z);
    }
    drag.current = null;
  }
  function startResize(dir: string) {
    return (e: PointerEvent) => {
      if (mobile) return;
      e.stopPropagation();
      focusWindow(win.id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { dx: 0, dy: 0, mode: "resize", dir };
    };
  }

  if (win.minimized) return null;

  return (
    <section
      role="dialog"
      aria-label={win.title}
      onPointerDown={() => focusWindow(win.id)}
      className="rounded-helix-lg helix-panel absolute flex flex-col overflow-hidden"
      style={{
        left: g.x,
        top: g.y,
        width: g.w,
        height: g.h,
        zIndex: win.z,
      }}
    >
      <div
        onPointerDown={onTitleDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-2"
      >
        <Icon className="size-4 text-accent" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{win.title}</span>
        <div className="flex items-center">
          <button
            aria-label="Minimize"
            className="grid size-9 place-items-center text-muted hover:text-fg"
            onClick={() => toggleMinimize(win.id)}
          >
            <Minus className="size-3.5" />
          </button>
          <button
            aria-label="Maximize"
            className="grid size-9 place-items-center text-muted hover:text-fg"
            onClick={() => toggleMaximize(win.id)}
          >
            <Square className="size-3" />
          </button>
          <button
            aria-label="Close"
            className="grid size-9 place-items-center text-muted hover:text-danger"
            onClick={() => closeWindow(win.id)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-void/40">{children}</div>
      {!mobile &&
        (["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const).map((dir) => (
          <div
            key={dir}
            onPointerDown={startResize(dir)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            className={cn(
              "absolute",
              dir === "n" && "inset-x-3 top-0 h-1 cursor-n-resize",
              dir === "s" && "inset-x-3 bottom-0 h-1 cursor-s-resize",
              dir === "e" && "inset-y-3 right-0 w-1 cursor-e-resize",
              dir === "w" && "inset-y-3 left-0 w-1 cursor-w-resize",
              dir === "ne" && "right-0 top-0 size-3 cursor-ne-resize",
              dir === "nw" && "left-0 top-0 size-3 cursor-nw-resize",
              dir === "se" && "bottom-0 right-0 size-3 cursor-se-resize",
              dir === "sw" && "bottom-0 left-0 size-3 cursor-sw-resize",
            )}
          />
        ))}
    </section>
  );
}
