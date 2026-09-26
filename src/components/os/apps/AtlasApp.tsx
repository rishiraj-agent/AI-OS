import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "arch",
    title: "1. Architecture",
    body: (
      <div>
        <p className="text-sm text-muted">
          Helix is a modular hybrid: a small verified microkernel core with capability servers for
          memory, I/O, and scheduling, plus a policy-rich service layer. User sessions (Desktop or
          Terminal) never talk to hardware directly.
        </p>
        <Layers
          items={[
            "AIA · AI Flow · Settings · Apps",
            "AIPM · AIX · GameCore · DevSpace · helixd",
            "HelixFS · netd · compositord · compartmentd",
            "HAL · sched · mm · io · crypto",
            "Helix hybrid kernel",
          ]}
        />
      </div>
    ),
  },
  {
    id: "kernel",
    title: "2. Kernel",
    body: (
      <div className="space-y-2 text-sm">
        <p>Hybrid kernel: capability microkernel for isolation, in-kernel fast paths for paging, IPC, and GPU command submission.</p>
        <ul className="list-disc space-y-1 pl-4 text-muted">
          <li>sched.helix — interactive, batch, realtime, game classes</li>
          <li>mm.helix — compartments, W^X, CFI, sealed memory</li>
          <li>io.helix — userspace drivers behind HAL</li>
          <li>ipc.helix — bounded, audited, deadline-aware</li>
        </ul>
      </div>
    ),
  },
  {
    id: "desktop",
    title: "3. Desktop UI",
    body: (
      <p className="text-sm text-muted">
        Helix design language: sheared radii, mineral teal, left Spine, floating Horizon, hexagonal
        Nexus, right-edge AIA prism. Not a taskbar clone, not a top menu bar, not Activities Overview.
        Workspaces are three quiet planes. Windows shear and snap to halves and quarters.
      </p>
    ),
  },
  {
    id: "files",
    title: "4. File manager",
    body: (
      <p className="text-sm text-muted">
        AI Files is a universal manager: HelixFS locally, plus NTFS, exFAT, FAT32, EXT4, Btrfs, ZFS
        where present, and SMB/WebDAV. Linux permissions and Windows-easy ACL overlays share one
        inspector. Version history is CoW, not a recycle bin.
      </p>
    ),
  },
  {
    id: "aia",
    title: "5. AIA",
    body: (
      <p className="text-sm text-muted">
        AIA is a system service, not an app. It searches, launches, explains, writes flows, and
        proposes AIPM work. Destructive verbs always raise a confirmation card. On capable hardware it
        prefers on-device models; cloud is opt-in.
      </p>
    ),
  },
  {
    id: "term",
    title: "6. Terminal",
    body: (
      <pre className="overflow-x-auto rounded-helix-sm bg-raised p-3 font-mono text-[11px] helix-inset">{`helix ~ › ai system status
helix ~ › aipm install blender
helix ~ › ai workspace create GameProject
# apt is intercepted — AIA offers diagnosis, not silent translation`}</pre>
    ),
  },
  {
    id: "settings",
    title: "7. Settings",
    body: (
      <p className="text-sm text-muted">
        One Settings surface with an AIA search box. “Where can I change GPU performance mode?” opens
        Gaming. Categories: System through Accessibility, including AI, Virtualization, Backup.
      </p>
    ),
  },
  {
    id: "sec",
    title: "8. Security",
    body: (
      <Layers
        items={[
          "Policy · signed repos · recovery",
          "Sandbox · permissions · firewall",
          "Secure Boot · measured launch",
          "Memory protection · privilege split",
        ]}
      />
    ),
  },
  {
    id: "aipm",
    title: "9. Packages",
    body: (
      <p className="text-sm text-muted">
        Format <span className="font-mono">.aipkg</span>. Manager AIPM verifies signatures and a
        lockfile of dependencies. Commands: install, update, remove, search, info. Native packages
        are visually distinct from AIX compatibility payloads.
      </p>
    ),
  },
  {
    id: "aix",
    title: "10. AIX compatibility",
    body: (
      <p className="text-sm text-muted">
        AIX runs selected Windows and Linux software in compartments: API translation, GPU and audio
        passthrough, clipboard and files by grant, per-app config. GameCore Proton is the gaming
        path; AIX is the productivity path. Icons in Files and Package Center mark the runtime.
      </p>
    ),
  },
  {
    id: "game",
    title: "11. GameCore",
    body: (
      <p className="text-sm text-muted">
        Dedicated gaming subsystem: Vulkan native, DirectX via translation, controllers, Game Mode
        (service parking, not kernel panic), FPS overlay, frame-time, shader cache, automatic
        profiles, launcher, cloud saves, mods. Game Mode never disables helixd or the firewall.
      </p>
    ),
  },
  {
    id: "dev",
    title: "12. DevSpace",
    body: (
      <p className="text-sm text-muted">
        GCC, Clang, Python, Rust, Go, Java, Node, C/C++, C#/.NET, Git, Docker-class containers,
        Kubernetes tools, SSH, VS Code compatible Helix Code, profilers.{" "}
        <span className="font-mono">ai workspace create</span> builds an isolated project with env,
        path, and AIA context.
      </p>
    ),
  },
  {
    id: "boot",
    title: "13. Boot",
    body: (
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
        <li>Hardware initialization</li>
        <li>Secure verification</li>
        <li>Kernel initialization</li>
        <li>Driver initialization</li>
        <li>AI services</li>
        <li>Desktop / session</li>
      </ol>
    ),
  },
  {
    id: "fsarch",
    title: "14. File system",
    body: (
      <p className="text-sm text-muted">
        HelixFS: copy-on-write, checksums, snapshots, send/receive, optional encryption per folder,
        Linux permission bits plus an easy ACL sheet. Layout: /System (optionally immutable), /Users,
        /Apps, /Snapshots, /Network.
      </p>
    ),
  },
  {
    id: "net",
    title: "15. Networking",
    body: (
      <p className="text-sm text-muted">
        wifi, ethernet, VPN, SSH, DNS (encrypted), firewall, hotspot, Bluetooth PAN, remote desktop,
        file sharing, local discovery. The Network app is a live dashboard of flows and bandwidth.
      </p>
    ),
  },
  {
    id: "recv",
    title: "16. Recovery",
    body: (
      <p className="text-sm text-muted">
        Snapshots, rollback, Safe Mode, Recovery Mode, boot repair, driver/package/config rollback,
        automatic restore points, emergency terminal. Updates are atomic; failure boots the previous
        generation.
      </p>
    ),
  },
  {
    id: "flow",
    title: "17. AI Flow",
    body: (
      <p className="text-sm text-muted">
        Natural language → workflow graph. Users can edit verbs. Example: Monday 09:00 → open
        DevSpace → load GameProject. Flows are local JSON unless the user opts into sync.
      </p>
    ),
  },
  {
    id: "tree",
    title: "18. System tree",
    body: (
      <pre className="overflow-x-auto rounded-helix-sm bg-raised p-3 font-mono text-[11px] helix-inset">{`/System/kernel  helixd  aia-core  compositord
/Users/<name>/Desktop Documents Projects
/Apps/*.aipkg
/Snapshots
/Network`}</pre>
    ),
  },
  {
    id: "road",
    title: "19. Roadmap",
    body: (
      <ol className="space-y-2 text-sm text-muted">
        <li>P1 Bootloader, kernel prototype, mm, processes, basic drivers</li>
        <li>P2 HelixFS, net, compositor, terminal</li>
        <li>P3 AIPM, security, users, settings</li>
        <li>P4 AIX, virtualization, GameCore, DevSpace</li>
        <li>P5 Native AIA, Flow, diagnostics</li>
        <li>P6 Optional cloud, hardware breadth, enterprise, ecosystem</li>
      </ol>
    ),
  },
  {
    id: "src",
    title: "20. Source layout",
    body: (
      <pre className="overflow-x-auto rounded-helix-sm bg-raised p-3 font-mono text-[11px] helix-inset">{`kernel/     sched mm io ipc crypto
services/   helixd aia-core compositord
desktop/    horizon spine nexus windows
aipm/       solver signatures repos
aix/        win linux gpu audio
gamecore/   vulkan dx proton
devspace/   toolchains workspaces`}</pre>
    ),
  },
  {
    id: "cmds",
    title: "21. Commands",
    body: (
      <pre className="overflow-x-auto rounded-helix-sm bg-raised p-3 font-mono text-[11px] helix-inset">{`ai system status | repair | optimize
ai process list
ai network diagnose
ai hardware scan
ai package install blender
ai package update
ai workspace create GameProject
ai snapshot create | restore
ai explain
aipm install | remove | search | info`}</pre>
    ),
  },
  {
    id: "ui",
    title: "22. UI hierarchy",
    body: (
      <pre className="overflow-x-auto rounded-helix-sm bg-raised p-3 font-mono text-[11px] helix-inset">{`Session
  Wallpaper
  Desktop icons
  Spine (advanced)
  Windows (sheared shells)
  Horizon (Nexus · tasks · workspaces · clock)
  AIA prism
  Overlays (search, quick, notify, confirm)`}</pre>
    ),
  },
  {
    id: "api",
    title: "23. API",
    body: (
      <p className="text-sm text-muted">
        helix.sys (syscalls) → helix.svc (service bus) → helix.app (typed app SDK) → helix.ai (AIA
        tools with user-visible consent). Plugins register JSON schemas; they cannot escalate without
        a capability grant.
      </p>
    ),
  },
  {
    id: "plug",
    title: "24. Plugins",
    body: (
      <p className="text-sm text-muted">
        Themes, desktop extensions, AIA tools, AIPM repos, GameCore profiles, driver packages. All
        signed. Alternate desktop environments are first-class; Helix compositor exposes a stable
        protocol.
      </p>
    ),
  },
  {
    id: "docs",
    title: "25. Docs",
    body: (
      <p className="text-sm text-muted">
        /docs/user · /docs/admin · /docs/driver · /docs/packaging · /docs/aia-plugins · /docs/security.
        This Atlas is the living map for the Helix desktop you are using now.
      </p>
    ),
  },
];

function Layers({ items }: { items: string[] }) {
  return (
    <div className="mt-3 space-y-1">
      {items.map((t, i) => (
        <div
          key={t}
          className="rounded-helix-sm bg-raised px-3 py-2 text-center font-mono text-[11px] helix-inset"
          style={{ marginInline: i * 6 }}
        >
          {t}
        </div>
      ))}
    </div>
  );
}

export function AtlasApp() {
  const [id, setId] = useState(SECTIONS[0].id);
  const cur = SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
  return (
    <div className="flex h-full min-h-0">
      <aside className="os-scroll w-40 shrink-0 overflow-y-auto border-r border-line p-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setId(s.id)}
            className={cn(
              "mb-0.5 block w-full rounded-helix-sm px-2 py-1.5 text-left text-[11px]",
              id === s.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
            )}
          >
            {s.title}
          </button>
        ))}
      </aside>
      <div className="os-scroll min-w-0 flex-1 overflow-y-auto p-5">
        <p className="text-xs tracking-wide text-muted uppercase">AI OS Atlas</p>
        <h2 className="mt-1 text-xl font-medium tracking-tight">{cur.title}</h2>
        <div className="mt-4">{cur.body}</div>
      </div>
    </div>
  );
}
