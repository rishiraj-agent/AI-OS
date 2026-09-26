import { HARDWARE } from "@/lib/os/catalog";
import { useOs } from "@/lib/os/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";

function spark(v: number) {
  return Array.from({ length: 16 }, (_, i) => ({
    i,
    v: Math.max(2, Math.min(98, v + Math.sin(i / 2) * 8 + (i % 3) * 2)),
  }));
}

export function MonitorApp() {
  const metrics = useOs((s) => s.metrics);
  const processes = useOs((s) => s.processes);
  const killProc = useOs((s) => s.killProc);
  const data = useMemo(() => spark(metrics.cpu), [metrics.cpu]);
  return (
    <div className="os-scroll flex h-full flex-col gap-3 overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["CPU", metrics.cpu],
          ["GPU", metrics.gpu],
          ["RAM", metrics.ram],
          ["Temp", metrics.temp],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-helix-sm bg-raised p-3 helix-inset">
            <p className="text-xs text-muted">{k}</p>
            <p className="font-mono text-xl tabular-nums">
              {typeof v === "number" ? v.toFixed(0) : v}
              {k === "Temp" ? "°" : "%"}
            </p>
          </div>
        ))}
      </div>
      <div className="h-36 rounded-helix-sm bg-raised p-2 helix-inset">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip />
            <Area type="monotone" dataKey="v" stroke="var(--helix-accent)" fill="color-mix(in oklab, var(--helix-accent) 20%, transparent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="text-muted">
          <tr>
            <th className="py-1 font-medium">PID</th>
            <th>Name</th>
            <th>CPU</th>
            <th>RAM</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.pid} className="border-t border-line">
              <td className="py-2 font-mono tabular-nums">{p.pid}</td>
              <td>{p.name}</td>
              <td className="tabular-nums">{p.cpu.toFixed(1)}%</td>
              <td className="tabular-nums">{p.ram.toFixed(0)} MB</td>
              <td>
                {p.kind !== "system" && (
                  <button className="text-danger" onClick={() => killProc(p.pid)}>
                    stop
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HardwareApp() {
  const metrics = useOs((s) => s.metrics);
  return (
    <div className="os-scroll grid h-full grid-cols-1 gap-2 overflow-y-auto p-4 md:grid-cols-2">
      {HARDWARE.map((d) => (
        <article key={d.id} className="rounded-helix-sm bg-raised p-3 helix-inset">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium">{d.name}</h3>
            <span className={cn("text-[11px]", d.status === "ok" ? "text-ok" : d.status === "warn" ? "text-warn" : "text-muted")}>
              {d.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{d.detail}</p>
          <p className="mt-2 font-mono text-[11px] text-faint">
            {d.driver} · {d.firmware}
            {d.kind === "cpu" ? ` · ${metrics.temp.toFixed(0)}°C · ${metrics.cpu.toFixed(0)}%` : ""}
            {d.kind === "gpu" ? ` · ${metrics.gpu.toFixed(0)}%` : ""}
          </p>
        </article>
      ))}
    </div>
  );
}

export function ControlApp() {
  const s = useOs();
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">Control Center</h2>
      <p className="mt-1 text-sm text-muted">Helix at a glance — edition {s.edition}, mode {s.performanceMode}.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
        {[
          ["CPU", `${s.metrics.cpu.toFixed(0)}%`],
          ["GPU", `${s.metrics.gpu.toFixed(0)}%`],
          ["RAM", `${s.metrics.ram.toFixed(0)}%`],
          ["Battery", `${s.metrics.bat.toFixed(0)}%`],
          ["Network", s.wifi ? "HelixNet" : "offline"],
          ["AIA", s.localAi ? "local" : "network"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-helix-sm bg-raised p-3 helix-inset">
            <p className="text-xs text-muted">{k}</p>
            <p className="font-mono text-lg tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => s.openApp("monitor")}>Monitor</Button>
        <Button size="sm" variant="ghost" onClick={() => s.openApp("security")}>Security</Button>
        <Button size="sm" variant="ghost" onClick={() => s.openApp("recovery")}>Recovery</Button>
      </div>
    </div>
  );
}

export function NetworkApp() {
  const s = useOs();
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">Network</h2>
      <div className="mt-3 space-y-2 text-sm">
        <Row k="Wi-Fi" v={s.wifi ? "HelixNet 6 GHz · 1200 Mbps" : "off"} />
        <Row k="Ethernet" v="unplugged" />
        <Row k="VPN" v="none" />
        <Row k="DNS" v="helix.resolver (DoH)" />
        <Row k="Firewall" v={s.firewall ? "default-deny inbound" : "off"} />
        <Row k="Hotspot" v="idle" />
        <Row k="Active" v={`browser  4.2 Mbps · aia-core  0.4 Mbps · helixd  0.1 Mbps`} />
      </div>
      <Button className="mt-4" size="sm" variant="ghost" onClick={() => s.runShell("ai network diagnose")}>
        Diagnose
      </Button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-helix-sm bg-raised px-3 py-2 helix-inset">
      <span className="text-muted">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

export function PackagesApp() {
  const packages = useOs((s) => s.packages);
  const setConfirm = useOs((s) => s.setConfirm);
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">AIPM — AI Package Manager</h2>
      <p className="mt-1 text-sm text-muted">Signed .aipkg only. Native, Linux, Windows (AIX), web, containers.</p>
      <ul className="mt-4 space-y-2">
        {packages.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-helix-sm bg-raised px-3 py-3 helix-inset">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {p.name} <span className="font-mono text-[11px] text-muted">{p.version}</span>
              </p>
              <p className="text-xs text-muted">
                {p.description} · {p.runtime} · {p.size}
                {p.signed ? " · signed" : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant={p.installed ? "ghost" : "primary"}
              onClick={() =>
                setConfirm({
                  id: p.id,
                  label: `${p.installed ? "Remove" : "Install"} ${p.name}`,
                  type: p.installed ? "remove_package" : "install_package",
                  destructive: p.installed,
                  packageId: p.id,
                })
              }
            >
              {p.installed ? "Remove" : "Install"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecoveryApp() {
  const snapshots = useOs((s) => s.snapshots);
  const createSnapshot = useOs((s) => s.createSnapshot);
  const setConfirm = useOs((s) => s.setConfirm);
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Recovery</h2>
        <Button size="sm" onClick={() => createSnapshot()}>
          New snapshot
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Safe Mode, Recovery Mode, boot repair, driver and package rollback. A failed update never requires a full reinstall.
      </p>
      <ul className="mt-4 space-y-2">
        {snapshots.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-helix-sm bg-raised px-3 py-3 helix-inset">
            <div>
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted">{new Date(s.at).toLocaleString()} · {s.fileCount} nodes</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setConfirm({
                  id: s.id,
                  label: `Restore ${s.name}`,
                  type: "restore_snapshot",
                  destructive: true,
                  snapshotId: s.id,
                })
              }
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SecurityApp() {
  const s = useOs();
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">Security Center</h2>
      <ul className="mt-4 space-y-2 text-sm">
        <Item ok={s.secureBoot} label="Secure Boot" />
        <Item ok={s.diskEncryption} label="Full-disk encryption" />
        <Item ok={s.firewall} label="Firewall" />
        <Item ok label="Signed software policy" />
        <Item ok label="Application sandboxing" />
        <Item ok label="Memory protection / CFI" />
        <Item ok={s.immutableSystem} label="Immutable system image" />
      </ul>
      <p className="mt-4 text-xs text-muted">
        Behavioral threat detection watches process graphs. AIA flags suspicious work; it never auto-quarantines without you.
      </p>
    </div>
  );
}

function Item({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between rounded-helix-sm bg-raised px-3 py-2 helix-inset">
      {label}
      <span className={ok ? "text-ok" : "text-muted"}>{ok ? "on" : "off"}</span>
    </li>
  );
}

export function PrivacyApp() {
  const privacy = useOs((s) => s.privacy);
  const toggle = useOs((s) => s.togglePrivacy);
  const telemetry = useOs((s) => s.telemetry);
  const setSetting = useOs((s) => s.setSetting);
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">Privacy Center</h2>
      <p className="mt-1 text-sm text-muted">What each application may touch. Telemetry is off unless you turn it on.</p>
      <Button className="mt-3" size="sm" variant={telemetry ? "primary" : "ghost"} onClick={() => setSetting({ telemetry: !telemetry })}>
        Telemetry {telemetry ? "on" : "off"}
      </Button>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-muted">
            <tr>
              {["App", "Files", "Mic", "Camera", "Location", "Network"].map((h) => (
                <th key={h} className="py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {privacy.map((p) => (
              <tr key={p.app} className="border-t border-line">
                <td className="py-2">{p.app}</td>
                {(["files", "mic", "camera", "location", "network"] as const).map((k) => (
                  <td key={k}>
                    <button className={p[k] ? "text-accent" : "text-faint"} onClick={() => toggle(p.app, k)}>
                      {p[k] ? "allow" : "deny"}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
