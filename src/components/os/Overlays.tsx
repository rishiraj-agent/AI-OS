import { useState } from "react";
import { FileText, Folder } from "lucide-react";
import { APP_META, SETTINGS_INDEX } from "@/lib/os/catalog";
import { childrenOf } from "@/lib/os/fs";
import { useOs } from "@/lib/os/store";
import { Button } from "@/components/ui/button";
import { Bluetooth, Moon, Shield, Sun, Volume2, Wifi } from "lucide-react";
import type { AppId } from "@/lib/os/types";
import { cn } from "@/lib/cn";

export function SearchPalette() {
  const open = useOs((s) => s.searchOpen);
  const setSearch = useOs((s) => s.setSearch);
  const openApp = useOs((s) => s.openApp);
  const files = useOs((s) => s.files);
  const setAia = useOs((s) => s.setAia);
  const pushAia = useOs((s) => s.pushAia);
  const [q, setQ] = useState("");
  if (!open) return null;
  const query = q.toLowerCase();
  const apps = (Object.keys(APP_META) as AppId[]).filter(
    (id) =>
      !query ||
      APP_META[id].name.toLowerCase().includes(query) ||
      APP_META[id].blurb.toLowerCase().includes(query),
  );
  const settings = SETTINGS_INDEX.filter(
    (s) => query && (s.keys.includes(query) || s.title.toLowerCase().includes(query)),
  );
  const hits = files.filter((f) => query && f.name.toLowerCase().includes(query)).slice(0, 6);
  return (
    <div className="absolute inset-0 z-[95] flex items-start justify-center pt-[12vh]">
      <button className="absolute inset-0 bg-void/50" aria-label="Close search" onClick={() => setSearch(false)} />
      <div className="helix-panel rounded-helix-lg relative z-10 w-[min(560px,calc(100%-1.5rem))] p-3">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSearch(false);
            if (e.key === "Enter" && q.trim()) {
              setSearch(false);
              setAia(true);
              pushAia({ role: "user", text: q.trim() });
            }
          }}
          placeholder="Search apps, files, settings"
          className="h-11 w-full rounded-helix-sm bg-raised px-3 text-sm helix-inset outline-none"
        />
        <div className="os-scroll mt-3 max-h-[50vh] overflow-y-auto">
          {apps.slice(0, 6).map((id) => {
            const Icon = APP_META[id].icon;
            return (
              <button
                key={id}
                onClick={() => {
                  openApp(id);
                  setSearch(false);
                }}
                className="flex w-full items-center gap-3 rounded-helix-sm px-2 py-2 text-left hover:bg-raised"
              >
                <Icon className="size-4 text-accent" />
                <span className="text-sm">{APP_META[id].name}</span>
              </button>
            );
          })}
          {settings.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                openApp("settings", { group: s.group });
                setSearch(false);
              }}
              className="flex w-full items-center gap-3 rounded-helix-sm px-2 py-2 text-left text-sm hover:bg-raised"
            >
              <span className="text-muted">Setting</span>
              {s.title}
            </button>
          ))}
          {hits.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                openApp("files", { id: f.id });
                setSearch(false);
              }}
              className="flex w-full items-center gap-3 rounded-helix-sm px-2 py-2 text-left text-sm hover:bg-raised"
            >
              <span className="text-muted">File</span>
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuickPane() {
  const open = useOs((s) => s.quickOpen);
  const setQuick = useOs((s) => s.setQuick);
  const wifi = useOs((s) => s.wifi);
  const bluetooth = useOs((s) => s.bluetooth);
  const firewall = useOs((s) => s.firewall);
  const volume = useOs((s) => s.volume);
  const themePref = useOs((s) => s.themePref);
  const simpleMode = useOs((s) => s.simpleMode);
  const setSetting = useOs((s) => s.setSetting);
  const setThemePref = useOs((s) => s.setThemePref);
  const setSimpleMode = useOs((s) => s.setSimpleMode);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[94]">
      <button className="absolute inset-0" aria-label="Close quick settings" onClick={() => setQuick(false)} />
      <div className="helix-panel rounded-helix-lg absolute right-4 bottom-20 w-[min(320px,calc(100%-2rem))] p-3">
        <p className="mb-3 text-sm font-medium">Quick settings</p>
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Wi-Fi" on={wifi} icon={Wifi} onClick={() => setSetting({ wifi: !wifi })} />
          <Tile
            label="Bluetooth"
            on={bluetooth}
            icon={Bluetooth}
            onClick={() => setSetting({ bluetooth: !bluetooth })}
          />
          <Tile
            label="Firewall"
            on={firewall}
            icon={Shield}
            onClick={() => setSetting({ firewall: !firewall })}
          />
        </div>
        <label className="mt-4 flex items-center gap-3 text-xs text-muted">
          <Volume2 className="size-4" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setSetting({ volume: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-8 tabular-nums">{volume}</span>
        </label>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setThemePref(themePref === "dark" ? "light" : "dark")}>
            {themePref === "light" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            Theme
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSimpleMode(!simpleMode)}>
            {simpleMode ? "Simple" : "Advanced"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  on,
  icon: Icon,
  onClick,
}: {
  label: string;
  on: boolean;
  icon: typeof Wifi;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-helix-sm px-2 py-3 text-center text-xs helix-inset",
        on ? "bg-accent text-accent-fg" : "bg-raised text-muted",
      )}
    >
      <Icon className="mx-auto mb-1 size-4" />
      {label}
    </button>
  );
}

export function NotifyPane() {
  const open = useOs((s) => s.notifyOpen);
  const setNotify = useOs((s) => s.setNotify);
  const notes = useOs((s) => s.notifications);
  const dismiss = useOs((s) => s.dismissNote);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[94]">
      <button className="absolute inset-0" aria-label="Close notifications" onClick={() => setNotify(false)} />
      <div className="helix-panel rounded-helix-lg absolute right-4 bottom-20 w-[min(340px,calc(100%-2rem))] p-3">
        <p className="mb-3 text-sm font-medium">Notifications</p>
        <div className="os-scroll max-h-80 space-y-2 overflow-y-auto">
          {notes.length === 0 && <p className="text-sm text-muted">Quiet.</p>}
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => dismiss(n.id)}
              className="block w-full rounded-helix-sm bg-raised px-3 py-2 text-left helix-inset"
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted">{n.body}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog() {
  const confirm = useOs((s) => s.confirm);
  const setConfirm = useOs((s) => s.setConfirm);
  const applyAction = useOs((s) => s.applyAction);
  const pushAia = useOs((s) => s.pushAia);
  if (!confirm) return null;
  return (
    <div className="absolute inset-0 z-[100] grid place-items-center bg-void/55 px-4">
      <div className="helix-panel rounded-helix-lg w-full max-w-sm p-5">
        <p className="text-sm font-medium">AIA needs confirmation</p>
        <p className="mt-2 text-sm text-muted">{confirm.label}</p>
        {confirm.destructive && (
          <p className="mt-2 text-xs text-warn">
            This can change system state. It can be rolled back from Recovery.
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant={confirm.destructive ? "danger" : "primary"}
            onClick={() => {
              const out = applyAction(confirm);
              pushAia({ role: "assistant", text: out });
              setConfirm(null);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DesktopIcons() {
  const files = useOs((s) => s.files);
  const openApp = useOs((s) => s.openApp);
  const desktop = files.find((f) => f.id === "desktop");
  const items = desktop ? childrenOf(files, desktop.id) : [];
  return (
    <div className="absolute top-16 left-20 z-10 hidden flex-col gap-3 md:flex">
      {items.map((f) => (
        <button
          key={f.id}
          onClick={() => openApp("files", { id: f.id })}
          className="w-28 rounded-helix-sm px-2 py-2 text-center text-xs text-fg hover:bg-surface/40"
        >
          <span className="mx-auto mb-1 grid size-10 place-items-center rounded-helix-sm bg-surface/80 text-accent helix-inset">
            {f.kind === "folder" ? <Folder className="size-4" /> : <FileText className="size-4" />}
          </span>
          <span className="line-clamp-2">{f.name}</span>
        </button>
      ))}
    </div>
  );
}
