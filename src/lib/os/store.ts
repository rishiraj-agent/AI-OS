import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AiaAction,
  AiaMessage,
  AppId,
  DevWorkspace,
  Edition,
  FlowItem,
  GameTitle,
  NoteItem,
  OsNotification,
  OsWindow,
  PerformanceMode,
  PrivacyGrant,
  Proc,
  SnapZone,
  Snapshot,
  TermSession,
  ThemePref,
} from "./types";
import { APP_META, GAMES, PACKAGES, uid } from "./catalog";
import { childrenOf, findByPath, mkdir, pathOf, resolvePath, seedFiles, writeFile } from "./fs";
import type { FileNode, Pkg } from "./types";

const DESKTOP_PAD = { l: 72, r: 16, t: 16, b: 88 };

function defaultProcs(): Proc[] {
  return [
    { pid: 1, name: "helixd", cpu: 0.4, ram: 48, user: "root", status: "running", kind: "system" },
    { pid: 42, name: "aia-core", cpu: 1.2, ram: 210, user: "system", status: "running", kind: "ai" },
    { pid: 88, name: "helix-compositor", cpu: 2.1, ram: 186, user: "system", status: "running", kind: "system" },
    { pid: 104, name: "gamecore", cpu: 0.2, ram: 64, user: "system", status: "idle", kind: "system" },
    { pid: 210, name: "networkd", cpu: 0.3, ram: 32, user: "root", status: "running", kind: "system" },
    { pid: 311, name: "helix-fs", cpu: 0.5, ram: 40, user: "root", status: "running", kind: "system" },
  ];
}

function placeWindow(count: number, workspace: number, appId: AppId): OsWindow {
  const offset = (count % 6) * 28;
  const meta = APP_META[appId];
  const wide = appId === "atlas" || appId === "devspace" || appId === "monitor";
  return {
    id: uid("win"),
    appId,
    title: meta.name,
    x: 96 + offset,
    y: 36 + offset,
    w: wide ? 860 : 720,
    h: wide ? 560 : 480,
    minW: 420,
    minH: 300,
    minimized: false,
    maximized: false,
    snap: null,
    z: 10 + count,
    workspace,
  };
}

export interface OsState {
  booted: boolean;
  setupComplete: boolean;
  userName: string;
  edition: Edition;
  themePref: ThemePref;
  simpleMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontScale: number;
  performanceMode: PerformanceMode;
  gameMode: boolean;
  workspace: number;
  windows: OsWindow[];
  nextZ: number;
  files: FileNode[];
  notes: NoteItem[];
  packages: Pkg[];
  processes: Proc[];
  snapshots: Snapshot[];
  flows: FlowItem[];
  workspaces: DevWorkspace[];
  games: GameTitle[];
  notifications: OsNotification[];
  clipboard: string[];
  privacy: PrivacyGrant[];
  telemetry: boolean;
  localAi: boolean;
  wifi: boolean;
  bluetooth: boolean;
  volume: number;
  brightness: number;
  firewall: boolean;
  secureBoot: boolean;
  diskEncryption: boolean;
  immutableSystem: boolean;
  nexusOpen: boolean;
  aiaOpen: boolean;
  searchOpen: boolean;
  quickOpen: boolean;
  notifyOpen: boolean;
  confirm: AiaAction | null;
  aia: AiaMessage[];
  term: TermSession;
  metrics: { cpu: number; gpu: number; ram: number; disk: number; net: number; bat: number; temp: number };
  pendingOpen: AppId | null;
  bootDone: () => void;
  completeSetup: (p: { userName: string; edition: Edition; themePref: ThemePref; simpleMode: boolean }) => void;
  resetDemo: () => void;
  openApp: (appId: AppId, payload?: Record<string, string>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  snapWindow: (id: string, zone: SnapZone) => void;
  setWorkspace: (n: number) => void;
  setThemePref: (t: ThemePref) => void;
  setSimpleMode: (v: boolean) => void;
  setPerformanceMode: (m: PerformanceMode) => void;
  setGameMode: (v: boolean) => void;
  setNexus: (v: boolean) => void;
  setAia: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  setQuick: (v: boolean) => void;
  setNotify: (v: boolean) => void;
  pushNote: (n: Omit<OsNotification, "id" | "at">) => void;
  dismissNote: (id: string) => void;
  pushAia: (m: Omit<AiaMessage, "id" | "at">) => void;
  setConfirm: (a: AiaAction | null) => void;
  applyAction: (a: AiaAction) => string;
  runShell: (input: string) => void;
  installPkg: (id: string) => void;
  removePkg: (id: string) => void;
  saveNote: (id: string, title: string, body: string) => void;
  addNote: () => void;
  deleteNote: (id: string) => void;
  createFolder: (parentId: string, name: string) => void;
  createFile: (parentId: string, name: string, content?: string) => void;
  updateFile: (id: string, content: string) => void;
  deleteNode: (id: string) => void;
  createSnapshot: (name?: string) => void;
  restoreSnapshot: (id: string) => void;
  addFlow: (f: Omit<FlowItem, "id">) => void;
  toggleFlow: (id: string) => void;
  addWorkspace: (name: string, stack: string[]) => void;
  killProc: (pid: number) => void;
  copyText: (t: string) => void;
  tick: () => void;
  setSetting: (k: Partial<Pick<OsState, "wifi" | "bluetooth" | "volume" | "brightness" | "firewall" | "telemetry" | "localAi" | "reducedMotion" | "highContrast" | "fontScale" | "secureBoot" | "diskEncryption" | "immutableSystem">>) => void;
  togglePrivacy: (app: string, key: keyof Omit<PrivacyGrant, "app">) => void;
  installGame: (id: string) => void;
}

const initialFiles = seedFiles("aria");

export const useOs = create<OsState>()(
  persist(
    (set, get) => ({
      booted: false,
      setupComplete: false,
      userName: "aria",
      edition: "home",
      themePref: "dark",
      simpleMode: true,
      reducedMotion: false,
      highContrast: false,
      fontScale: 1,
      performanceMode: "balanced",
      gameMode: false,
      workspace: 0,
      windows: [],
      nextZ: 20,
      files: initialFiles,
      notes: [
        {
          id: "n1",
          title: "First morning",
          body: "Ask AIA: make my PC ready for game development.",
          updated: Date.now(),
        },
      ],
      packages: PACKAGES,
      processes: defaultProcs(),
      snapshots: [
        {
          id: "snap-origin",
          name: "Factory origin",
          at: Date.now() - 3_600_000,
          note: "Taken at first boot",
          fileCount: initialFiles.length,
        },
      ],
      flows: [],
      workspaces: [],
      games: GAMES,
      notifications: [
        {
          id: "w1",
          title: "Helix is ready",
          body: "Secure Boot verified. AIA is local-first.",
          at: Date.now(),
          tone: "ok",
        },
      ],
      clipboard: [],
      privacy: [
        { app: "AI Browser", files: false, mic: false, camera: false, location: false, network: true },
        { app: "AIA", files: true, mic: false, camera: false, location: false, network: true },
        { app: "Media Studio", files: true, mic: true, camera: false, location: false, network: false },
        { app: "AI GameHub", files: true, mic: false, camera: false, location: false, network: true },
      ],
      telemetry: false,
      localAi: true,
      wifi: true,
      bluetooth: true,
      volume: 62,
      brightness: 78,
      firewall: true,
      secureBoot: true,
      diskEncryption: true,
      immutableSystem: false,
      nexusOpen: false,
      aiaOpen: false,
      searchOpen: false,
      quickOpen: false,
      notifyOpen: false,
      confirm: null,
      aia: [
        {
          id: "a0",
          role: "assistant",
          text: "AIA online. I can search this machine, launch apps, install signed packages, and build workflows. I will ask before anything destructive.",
          at: Date.now(),
        },
      ],
      term: {
        cwd: "/Users/aria",
        lines: [
          { id: "t0", kind: "ok", text: "AI Terminal — Helix shell 1.0" },
          { id: "t1", kind: "out", text: "Type `ai help` or `neofetch`. Linux-style commands are welcome." },
        ],
        history: [],
      },
      metrics: { cpu: 12, gpu: 6, ram: 34, disk: 18, net: 4, bat: 87, temp: 47 },
      pendingOpen: null,

      bootDone: () => set({ booted: true }),
      completeSetup: ({ userName, edition, themePref, simpleMode }) => {
        const files = seedFiles(userName || "aria");
        const home = files.find((f) => f.id === "home");
        set({
          setupComplete: true,
          userName: userName || "aria",
          edition,
          themePref,
          simpleMode,
          files,
          term: {
            cwd: home ? pathOf(files, home.id) : "/Users/aria",
            lines: [
              { id: uid("t"), kind: "ok", text: `Welcome, ${userName || "aria"}. Edition: ${edition}.` },
              { id: uid("t"), kind: "out", text: "ai help · aipm search · ai system status" },
            ],
            history: [],
          },
          performanceMode:
            edition === "gaming"
              ? "gaming"
              : edition === "developer"
                ? "developer"
                : edition === "server"
                  ? "server"
                  : "balanced",
        });
      },
      resetDemo: () => {
        localStorage.removeItem("helix-os");
        window.location.reload();
      },
      openApp: (appId, payload) => {
        const { windows, workspace, nextZ, simpleMode } = get();
        const existing = windows.find(
          (w) => w.appId === appId && w.workspace === workspace && !payload,
        );
        if (existing && !payload) {
          set({
            windows: windows.map((w) =>
              w.id === existing.id ? { ...w, minimized: false, z: nextZ } : w,
            ),
            nextZ: nextZ + 1,
            nexusOpen: false,
            searchOpen: false,
          });
          return;
        }
        const win = placeWindow(windows.length, workspace, appId);
        win.z = nextZ;
        if (payload) win.payload = payload;
        if (simpleMode && (appId === "terminal" || appId === "atlas")) {
          // still allowed — advanced apps can be opened from search
        }
        set({
          windows: [...windows, win],
          nextZ: nextZ + 1,
          nexusOpen: false,
          searchOpen: false,
          processes: [
            ...get().processes,
            {
              pid: 400 + windows.length,
              name: APP_META[appId].name,
              cpu: 1.4,
              ram: 80,
              user: get().userName,
              status: "running",
              kind: "user",
            },
          ],
        });
      },
      closeWindow: (id) =>
        set((s) => ({
          windows: s.windows.filter((w) => w.id !== id),
        })),
      focusWindow: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, z: s.nextZ, minimized: false } : w)),
          nextZ: s.nextZ + 1,
        })),
      moveWindow: (id, x, y) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y), maximized: false, snap: null } : w,
          ),
        })),
      resizeWindow: (id, w, h) =>
        set((s) => ({
          windows: s.windows.map((win) =>
            win.id === id
              ? {
                  ...win,
                  w: Math.max(win.minW, w),
                  h: Math.max(win.minH, h),
                  maximized: false,
                }
              : win,
          ),
        })),
      toggleMinimize: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)),
        })),
      toggleMaximize: (id) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id ? { ...w, maximized: !w.maximized, snap: null } : w,
          ),
        })),
      snapWindow: (id, zone) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id ? { ...w, snap: zone, maximized: zone === "top", minimized: false } : w,
          ),
        })),
      setWorkspace: (n) => set({ workspace: n, nexusOpen: false }),
      setThemePref: (themePref) => set({ themePref }),
      setSimpleMode: (simpleMode) => set({ simpleMode }),
      setPerformanceMode: (performanceMode) => {
        set({ performanceMode, gameMode: performanceMode === "gaming" });
        get().pushNote({
          title: "Performance Engine",
          body: `Mode is now ${performanceMode}. Background services reweighted.`,
          tone: "info",
        });
      },
      setGameMode: (gameMode) =>
        set({
          gameMode,
          performanceMode: gameMode ? "gaming" : "balanced",
        }),
      setNexus: (nexusOpen) =>
        set({ nexusOpen, searchOpen: false, quickOpen: false, notifyOpen: false }),
      setAia: (aiaOpen) => set({ aiaOpen }),
      setSearch: (searchOpen) =>
        set({ searchOpen, nexusOpen: false, quickOpen: false, notifyOpen: false }),
      setQuick: (quickOpen) =>
        set({ quickOpen, notifyOpen: false, nexusOpen: false, searchOpen: false }),
      setNotify: (notifyOpen) =>
        set({ notifyOpen, quickOpen: false, nexusOpen: false, searchOpen: false }),
      pushNote: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid("nt"), at: Date.now() },
            ...s.notifications,
          ].slice(0, 24),
        })),
      dismissNote: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      pushAia: (m) =>
        set((s) => ({
          aia: [...s.aia, { ...m, id: uid("ai"), at: Date.now() }].slice(-40),
        })),
      setConfirm: (confirm) => set({ confirm }),
      applyAction: (a) => {
        const s = get();
        switch (a.type) {
          case "open_app":
            if (a.appId) s.openApp(a.appId);
            return `Opened ${a.appId ?? "app"}.`;
          case "install_package":
            if (a.packageId) s.installPkg(a.packageId);
            return `Installed ${a.packageId}.`;
          case "remove_package":
            if (a.packageId) s.removePkg(a.packageId);
            return `Removed ${a.packageId}.`;
          case "set_mode":
            if (a.mode) s.setPerformanceMode(a.mode);
            return `Performance mode: ${a.mode}.`;
          case "create_workspace":
            s.addWorkspace(a.name || "Workspace", ["git", "python", "helix-code"]);
            return `Workspace ${a.name} created.`;
          case "create_snapshot":
            s.createSnapshot(a.name);
            return "Snapshot created.";
          case "restore_snapshot":
            if (a.snapshotId) s.restoreSnapshot(a.snapshotId);
            return "Snapshot restored.";
          case "create_flow":
            s.addFlow({
              name: a.name || "Untitled flow",
              when: a.when || "manual",
              actions: a.actions || [],
              enabled: true,
              source: "natural",
            });
            return "Flow saved.";
          case "optimize":
            s.setPerformanceMode(s.edition === "gaming" ? "gaming" : "balanced");
            return "Performance Engine rebalanced background work.";
          case "repair":
            s.pushNote({
              title: "System repair",
              body: "Package signatures verified. Boot chain intact.",
              tone: "ok",
            });
            return "Repair complete. No integrity issues.";
          default:
            return "Nothing to apply.";
        }
      },
      runShell: (input) => {
        const raw = input.trim();
        if (!raw) return;
        const result = interpret(raw, get);
        set((s) => ({
          term: {
            cwd: result.cwd ?? s.term.cwd,
            history: [...s.term.history, raw].slice(-80),
            lines: [
              ...s.term.lines,
              { id: uid("t"), kind: "in" as const, text: `${promptPath(s.term.cwd)} ${raw}` },
              ...result.lines.map((l) => ({ id: uid("t"), kind: l.kind, text: l.text })),
            ].slice(-400),
          },
        }));
        if (result.side) result.side();
      },
      installPkg: (id) => {
        set((s) => ({
          packages: s.packages.map((p) => (p.id === id ? { ...p, installed: true } : p)),
        }));
        const pkg = get().packages.find((p) => p.id === id);
        get().pushNote({
          title: "AIPM",
          body: `${pkg?.name ?? id} installed. Signature verified.`,
          tone: "ok",
          appId: "packages",
        });
      },
      removePkg: (id) => {
        set((s) => ({
          packages: s.packages.map((p) => (p.id === id ? { ...p, installed: false } : p)),
        }));
      },
      saveNote: (id, title, body) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, title, body, updated: Date.now() } : n)),
        })),
      addNote: () =>
        set((s) => ({
          notes: [
            { id: uid("note"), title: "Untitled", body: "", updated: Date.now() },
            ...s.notes,
          ],
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      createFolder: (parentId, name) =>
        set((s) => ({ files: mkdir(s.files, parentId, name, s.userName) })),
      createFile: (parentId, name, content = "") =>
        set((s) => ({ files: writeFile(s.files, parentId, name, content, s.userName) })),
      updateFile: (id, content) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id
              ? {
                  ...f,
                  content,
                  size: content.length,
                  modified: Date.now(),
                  versions: [...f.versions, { at: Date.now(), content }].slice(-8),
                }
              : f,
          ),
        })),
      deleteNode: (id) => {
        if (id === "root" || id === "sys" || id === "home") return;
        const drop = new Set<string>();
        const walk = (pid: string) => {
          drop.add(pid);
          get()
            .files.filter((f) => f.parentId === pid)
            .forEach((c) => walk(c.id));
        };
        walk(id);
        set((s) => ({ files: s.files.filter((f) => !drop.has(f.id)) }));
      },
      createSnapshot: (name) =>
        set((s) => ({
          snapshots: [
            {
              id: uid("snap"),
              name: name || `Restore point ${s.snapshots.length + 1}`,
              at: Date.now(),
              note: "User snapshot",
              fileCount: s.files.length,
            },
            ...s.snapshots,
          ],
        })),
      restoreSnapshot: (id) => {
        const snap = get().snapshots.find((s) => s.id === id);
        get().pushNote({
          title: "Recovery",
          body: `Rolled back toward “${snap?.name ?? id}”. Session files preserved; system config restored.`,
          tone: "warn",
          appId: "recovery",
        });
      },
      addFlow: (f) => set((s) => ({ flows: [{ ...f, id: uid("flow") }, ...s.flows] })),
      toggleFlow: (id) =>
        set((s) => ({
          flows: s.flows.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
        })),
      addWorkspace: (name, stack) => {
        const path = `/Users/${get().userName}/Projects/${name.replace(/\s+/g, "")}`;
        const home = get().files.find((f) => f.id === "proj");
        if (home) get().createFolder(home.id, name.replace(/\s+/g, ""));
        set((s) => ({
          workspaces: [
            { id: uid("ws"), name, stack, path, created: Date.now() },
            ...s.workspaces,
          ],
        }));
        get().openApp("devspace");
        get().pushNote({
          title: "DevSpace",
          body: `${name} environment is ready.`,
          tone: "ok",
          appId: "devspace",
        });
      },
      killProc: (pid) =>
        set((s) => ({
          processes: s.processes.map((p) =>
            p.pid === pid && p.kind !== "system" ? { ...p, status: "idle", cpu: 0 } : p,
          ),
        })),
      copyText: (t) =>
        set((s) => ({ clipboard: [t, ...s.clipboard.filter((x) => x !== t)].slice(0, 12) })),
      tick: () => {
        const g = get().gameMode;
        const mode = get().performanceMode;
        const boost =
          mode === "performance" || mode === "gaming" || mode === "creator" ? 8 : 0;
        set((s) => ({
          metrics: {
            cpu: clamp(s.metrics.cpu + jitter(4) + (g ? -3 : 0), 4, 92),
            gpu: clamp(s.metrics.gpu + jitter(6) + (g ? 12 : 0), 2, 96),
            ram: clamp(s.metrics.ram + jitter(2), 22, 86),
            disk: clamp(s.metrics.disk + jitter(3), 4, 70),
            net: clamp(s.metrics.net + jitter(8), 0, 80),
            bat: clamp(s.metrics.bat + (mode === "powersave" ? 0.02 : -0.04) + (g ? -0.08 : 0), 8, 100),
            temp: clamp(s.metrics.temp + jitter(1.4) + boost * 0.05, 38, 86),
          },
          processes: s.processes.map((p) => ({
            ...p,
            cpu: p.status === "idle" ? 0.1 : clamp(p.cpu + jitter(1.2), 0.1, 28),
            ram: clamp(p.ram + jitter(2), 16, 420),
          })),
        }));
      },
      setSetting: (k) => set(k),
      togglePrivacy: (app, key) =>
        set((s) => ({
          privacy: s.privacy.map((p) => (p.app === app ? { ...p, [key]: !p[key] } : p)),
        })),
      installGame: (id) =>
        set((s) => ({
          games: s.games.map((g) => (g.id === id ? { ...g, installed: true } : g)),
        })),
    }),
    {
      name: "helix-os",
      partialize: (s) => ({
        setupComplete: s.setupComplete,
        userName: s.userName,
        edition: s.edition,
        themePref: s.themePref,
        simpleMode: s.simpleMode,
        reducedMotion: s.reducedMotion,
        highContrast: s.highContrast,
        fontScale: s.fontScale,
        performanceMode: s.performanceMode,
        files: s.files,
        notes: s.notes,
        packages: s.packages,
        snapshots: s.snapshots,
        flows: s.flows,
        workspaces: s.workspaces,
        games: s.games,
        privacy: s.privacy,
        telemetry: s.telemetry,
        localAi: s.localAi,
        wifi: s.wifi,
        bluetooth: s.bluetooth,
        volume: s.volume,
        brightness: s.brightness,
        firewall: s.firewall,
        secureBoot: s.secureBoot,
        diskEncryption: s.diskEncryption,
        immutableSystem: s.immutableSystem,
        clipboard: s.clipboard,
      }),
    },
  ),
);

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}
function jitter(n: number) {
  return (Math.random() - 0.5) * n;
}

function promptPath(cwd: string) {
  const short = cwd.replace(/^\/Users\/[^/]+/, "~");
  return `helix ${short} ›`;
}

type Line = { kind: "out" | "err" | "ai" | "ok"; text: string };

function interpret(
  input: string,
  get: () => OsState,
): { lines: Line[]; cwd?: string; side?: () => void } {
  const s = get();
  const [cmd, ...rest] = split(input);
  const arg = rest.join(" ");

  if (cmd === "help" || input === "ai help") {
    return {
      lines: [
        { kind: "ok", text: "Helix command surface" },
        { kind: "out", text: "ai system status | repair | optimize" },
        { kind: "out", text: "ai process list · ai network diagnose · ai hardware scan" },
        { kind: "out", text: "ai package install <name> · ai package update" },
        { kind: "out", text: "ai workspace create <name> · ai snapshot create | restore" },
        { kind: "out", text: "ai explain <command> · aipm search|info|install|remove" },
        { kind: "out", text: "ls  cd  pwd  cat  mkdir  rm  touch  neofetch  clear  git  python" },
      ],
    };
  }
  if (cmd === "clear") {
    return {
      lines: [],
      side: () =>
        useOs.setState((st) => ({
          term: { ...st.term, lines: [{ id: uid("t"), kind: "ok" as const, text: "AI Terminal" }] },
        })),
    };
  }
  if (cmd === "pwd") return { lines: [{ kind: "out", text: s.term.cwd }] };
  if (cmd === "whoami") return { lines: [{ kind: "out", text: s.userName }] };
  if (cmd === "neofetch" || cmd === "helixfetch") {
    return {
      lines: [
        { kind: "ok", text: "AI OS  ·  Helix  ·  One System. Every Possibility." },
        { kind: "out", text: `host     ${s.userName}-helix` },
        { kind: "out", text: `edition  ${s.edition}` },
        { kind: "out", text: `kernel   helix-hybrid 6.2.0` },
        { kind: "out", text: `mode     ${s.performanceMode}${s.gameMode ? " (game)" : ""}` },
        { kind: "out", text: `cpu      ${s.metrics.cpu.toFixed(0)}%   ram ${s.metrics.ram.toFixed(0)}%` },
        { kind: "out", text: `aia      ${s.localAi ? "on-device preferred" : "network"}` },
      ],
    };
  }
  if (cmd === "ls") {
    const target = arg ? resolvePath(s.term.cwd, arg) : s.term.cwd;
    const node = findByPath(s.files, target) ?? findByPath(s.files, mapHome(target, s.userName));
    if (!node) return { lines: [{ kind: "err", text: `ls: ${arg || target}: not found` }] };
    if (node.kind === "file") return { lines: [{ kind: "out", text: node.name }] };
    const kids = childrenOf(s.files, node.id);
    if (!kids.length) return { lines: [{ kind: "out", text: "(empty)" }] };
    return {
      lines: kids.map((k) => ({
        kind: "out" as const,
        text: `${k.permissions}  ${k.owner.padEnd(8)}  ${String(k.size).padStart(6)}  ${k.name}${k.kind === "folder" ? "/" : ""}`,
      })),
    };
  }
  if (cmd === "cd") {
    const target = arg ? resolvePath(s.term.cwd, arg === "~" ? `/Users/${s.userName}` : arg) : `/Users/${s.userName}`;
    const node = findByPath(s.files, target) ?? findByPath(s.files, mapHome(target, s.userName));
    if (!node || node.kind !== "folder")
      return { lines: [{ kind: "err", text: `cd: ${arg}: no such directory` }] };
    return { lines: [], cwd: pathOf(s.files, node.id) };
  }
  if (cmd === "cat") {
    const target = resolvePath(s.term.cwd, arg);
    const node = findByPath(s.files, target) ?? findByPath(s.files, mapHome(target, s.userName));
    if (!node || node.kind !== "file") return { lines: [{ kind: "err", text: `cat: ${arg}: no such file` }] };
    if (node.encrypted) return { lines: [{ kind: "err", text: "cat: file is encrypted — open AI Files → Permissions" }] };
    return { lines: node.content.split("\n").map((t) => ({ kind: "out" as const, text: t })) };
  }
  if (cmd === "mkdir") {
    const dir = findByPath(s.files, s.term.cwd) ?? s.files.find((f) => f.id === "home");
    if (!dir || !arg) return { lines: [{ kind: "err", text: "mkdir: missing name" }] };
    return { lines: [{ kind: "ok", text: `created ${arg}` }], side: () => get().createFolder(dir.id, arg) };
  }
  if (cmd === "touch") {
    const dir = findByPath(s.files, s.term.cwd) ?? s.files.find((f) => f.id === "home");
    if (!dir || !arg) return { lines: [{ kind: "err", text: "touch: missing name" }] };
    return { lines: [{ kind: "ok", text: arg }], side: () => get().createFile(dir.id, arg, "") };
  }
  if (cmd === "rm") {
    const target = resolvePath(s.term.cwd, rest.filter((x) => !x.startsWith("-")).join(" "));
    const node = findByPath(s.files, target);
    if (!node) return { lines: [{ kind: "err", text: `rm: not found` }] };
    return {
      lines: [{ kind: "ok", text: `removed ${node.name}` }],
      side: () => get().deleteNode(node.id),
    };
  }
  if (cmd === "git") {
    return {
      lines: [
        { kind: "out", text: "git version 2.49.0 (Helix)" },
        { kind: "out", text: arg ? `git ${arg}: working tree clean` : "usage: git status | log | diff" },
      ],
    };
  }
  if (cmd === "python" || cmd === "python3") {
    if (!arg) return { lines: [{ kind: "out", text: "Python 3.13.2 (Helix) — pass a file or use DevSpace" }] };
    return { lines: [{ kind: "out", text: `(python) executed ${arg}` }] };
  }
  if (cmd === "docker" || cmd === "podman") {
    return {
      lines: [
        { kind: "out", text: "Helix containers" },
        { kind: "out", text: "helix-code    running    128MB" },
        { kind: "out", text: "aia-runtime   running    210MB" },
      ],
    };
  }
  if (cmd === "ssh") return { lines: [{ kind: "out", text: `ssh: connected (simulated) ${arg || "localhost"}` }] };
  if (cmd === "sudo" && rest[0] === "apt") {
    return {
      lines: [
        { kind: "err", text: "Error detected. apt is not a native Helix source." },
        {
          kind: "ai",
          text: "AIA: Package source configuration appears incorrect. Use `aipm install <name>` or `ai package install`. Diagnose repository configuration?",
        },
      ],
      side: () => get().setAia(true),
    };
  }
  if (cmd === "top" || (cmd === "ai" && rest[0] === "process")) {
    return {
      lines: s.processes.slice(0, 8).map((p) => ({
        kind: "out" as const,
        text: `${String(p.pid).padStart(5)}  ${p.cpu.toFixed(1).padStart(5)}%  ${String(p.ram).padStart(4)}MB  ${p.name}`,
      })),
    };
  }
  if (cmd === "aipm" || (cmd === "ai" && rest[0] === "package") || cmd === "ai" && rest[0] === "install") {
    return aipm(input, s, get);
  }
  if (cmd === "ai") return aiCmd(rest, s, get);
  return {
    lines: [
      { kind: "err", text: `helix: command not found: ${cmd}` },
      { kind: "ai", text: "AIA: Try `ai help`. I can also explain this from the prism." },
    ],
  };
}

function mapHome(path: string, user: string) {
  if (path.startsWith("/Users/") && !path.startsWith(`/Users/${user}`)) {
    return path.replace(/^\/Users/, `/Users/${user}`);
  }
  return path.replace(/^~/, `/Users/${user}`);
}

function aipm(
  input: string,
  s: OsState,
  get: () => OsState,
): { lines: Line[]; side?: () => void } {
  const parts = split(input.replace(/^ai package /, "aipm ").replace(/^ai install /, "aipm install "));
  const sub = parts[1];
  const name = parts.slice(2).join(" ").toLowerCase();
  if (sub === "search" || !sub) {
    const q = name;
    const hits = s.packages.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.id.includes(q),
    );
    return {
      lines: hits.map((p) => ({
        kind: "out" as const,
        text: `${p.installed ? "●" : "○"} ${p.id.padEnd(14)} ${p.version.padEnd(8)} ${p.name} — ${p.description}`,
      })),
    };
  }
  if (sub === "info") {
    const p = s.packages.find((x) => x.id === name || x.name.toLowerCase() === name);
    if (!p) return { lines: [{ kind: "err" as const, text: "package not found" }] };
    return {
      lines: [
        { kind: "ok" as const, text: p.name },
        { kind: "out" as const, text: `${p.version}  ${p.size}  ${p.runtime}  signed=${p.signed}` },
        { kind: "out" as const, text: p.description },
      ],
    };
  }
  if (sub === "update") {
    return { lines: [{ kind: "ok" as const, text: "All signed packages current. HelixFS snapshot taken." }] };
  }
  if (sub === "install") {
    const p = s.packages.find((x) => x.id === name || x.name.toLowerCase() === name);
    if (!p) return { lines: [{ kind: "err" as const, text: `aipm: no package matches ${name}` }] };
    return {
      lines: [
        { kind: "ai" as const, text: `AIA: ${p.name} ${p.version} is signed. Confirm installation?` },
      ],
      side: () =>
        get().setConfirm({
          id: uid("act"),
          label: `Install ${p.name}`,
          type: "install_package",
          destructive: false,
          packageId: p.id,
        }),
    };
  }
  if (sub === "remove") {
    const p = s.packages.find((x) => x.id === name || x.name.toLowerCase() === name);
    if (!p) return { lines: [{ kind: "err" as const, text: "not installed" }] };
    return {
      lines: [{ kind: "ai" as const, text: `AIA: Remove ${p.name}? This can be undone from Package Center.` }],
      side: () =>
        get().setConfirm({
          id: uid("act"),
          label: `Remove ${p.name}`,
          type: "remove_package",
          destructive: true,
          packageId: p.id,
        }),
    };
  }
  return { lines: [{ kind: "out" as const, text: "aipm search|info|install|remove|update" }] };
}

function aiCmd(
  rest: string[],
  s: OsState,
  get: () => OsState,
): { lines: Line[]; side?: () => void } {
  const sub = rest[0];
  const arg = rest.slice(1).join(" ");
  if (sub === "system" && rest[1] === "status") {
    return {
      lines: [
        { kind: "ok", text: "AI OS healthy" },
        { kind: "out", text: `cpu ${s.metrics.cpu.toFixed(0)}%  gpu ${s.metrics.gpu.toFixed(0)}%  ram ${s.metrics.ram.toFixed(0)}%  temp ${s.metrics.temp.toFixed(0)}°` },
        { kind: "out", text: `secure boot ${s.secureBoot}  firewall ${s.firewall}  encryption ${s.diskEncryption}` },
        { kind: "out", text: `edition ${s.edition}  mode ${s.performanceMode}` },
      ],
    };
  }
  if (sub === "system" && rest[1] === "repair") {
    return {
      lines: [{ kind: "ai", text: "AIA: Repair checks boot chain, package signatures, and HelixFS. Proceed?" }],
      side: () =>
        get().setConfirm({
          id: uid("act"),
          label: "Run system repair",
          type: "repair",
          destructive: false,
        }),
    };
  }
  if (sub === "system" && rest[1] === "optimize") {
    return {
      lines: [{ kind: "ai", text: "AIA: I can reweight background services. No kernel flags will change without you." }],
      side: () =>
        get().setConfirm({
          id: uid("act"),
          label: "Optimize system",
          type: "optimize",
          destructive: false,
        }),
    };
  }
  if (sub === "network") {
    return {
      lines: [
        { kind: "out", text: s.wifi ? "wifi  HelixNet  6GHz  1200 Mbps" : "wifi  down" },
        { kind: "out", text: "ethernet  unplugged" },
        { kind: "out", text: s.firewall ? "firewall  default-deny inbound" : "firewall  off" },
        { kind: "out", text: "dns  helix.resolver (encrypted)" },
      ],
    };
  }
  if (sub === "hardware") {
    return {
      lines: [
        { kind: "out", text: `cpu  16c  ${s.metrics.temp.toFixed(0)}°C  ${s.metrics.cpu.toFixed(0)}%` },
        { kind: "out", text: `gpu  16GB  ${s.metrics.gpu.toFixed(0)}%` },
        { kind: "out", text: `ram  32GB  ${s.metrics.ram.toFixed(0)}%` },
        { kind: "out", text: "storage  1TB NVMe  HelixFS" },
      ],
    };
  }
  if (sub === "snapshot" && rest[1] === "create") {
    return {
      lines: [{ kind: "ok", text: "Snapshot queued." }],
      side: () => get().createSnapshot(arg || undefined),
    };
  }
  if (sub === "snapshot" && rest[1] === "restore") {
    const snap = s.snapshots[0];
    return {
      lines: [{ kind: "ai", text: `AIA: Restore “${snap?.name}”? Open apps stay; system config rolls back.` }],
      side: () =>
        get().setConfirm({
          id: uid("act"),
          label: "Restore snapshot",
          type: "restore_snapshot",
          destructive: true,
          snapshotId: snap?.id,
        }),
    };
  }
  if (sub === "workspace" && rest[1] === "create") {
    const name = rest.slice(2).join(" ") || "GameProject";
    return {
      lines: [{ kind: "ok", text: `Creating workspace ${name}` }],
      side: () => get().addWorkspace(name, ["git", "rust", "godot"]),
    };
  }
  if (sub === "explain") {
    return {
      lines: [
        {
          kind: "ai",
          text: `AIA: “${arg || "ai"}” is a Helix command. Native verbs stay readable: ai, aipm, helixctl. Linux commands are aliased through AIX.`,
        },
      ],
    };
  }
  return {
    lines: [{ kind: "out", text: "ai help — readable system verbs" }],
    side: () => get().setAia(true),
  };
}

function split(s: string) {
  return s.trim().split(/\s+/);
}

export { DESKTOP_PAD, promptPath };
