export type Edition =
  | "home"
  | "pro"
  | "developer"
  | "gaming"
  | "server"
  | "enterprise"
  | "security";

export type PerformanceMode =
  | "balanced"
  | "performance"
  | "powersave"
  | "gaming"
  | "creator"
  | "developer"
  | "server";

export type ThemePref = "dark" | "light" | "auto";

export type AppId =
  | "files"
  | "terminal"
  | "browser"
  | "settings"
  | "monitor"
  | "hardware"
  | "devspace"
  | "gamehub"
  | "notes"
  | "media"
  | "security"
  | "recovery"
  | "packages"
  | "workspaces"
  | "privacy"
  | "control"
  | "flow"
  | "atlas"
  | "network";

export type SnapZone = "left" | "right" | "top" | "ul" | "ur" | "ll" | "lr" | null;

export interface OsWindow {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
  minimized: boolean;
  maximized: boolean;
  snap: SnapZone;
  z: number;
  workspace: number;
  payload?: Record<string, string>;
}

export interface FileNode {
  id: string;
  name: string;
  kind: "file" | "folder";
  parentId: string | null;
  size: number;
  mime: string;
  content: string;
  permissions: string;
  owner: string;
  encrypted: boolean;
  modified: number;
  versions: { at: number; content: string }[];
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  updated: number;
}

export interface Pkg {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  size: string;
  signed: boolean;
  installed: boolean;
  runtime: "native" | "linux" | "windows" | "web" | "container";
}

export interface Proc {
  pid: number;
  name: string;
  cpu: number;
  ram: number;
  user: string;
  status: "running" | "sleeping" | "idle";
  kind: "system" | "user" | "ai";
}

export interface Snapshot {
  id: string;
  name: string;
  at: number;
  note: string;
  fileCount: number;
}

export interface FlowItem {
  id: string;
  name: string;
  when: string;
  actions: string[];
  enabled: boolean;
  source: "natural" | "manual";
}

export interface DevWorkspace {
  id: string;
  name: string;
  stack: string[];
  path: string;
  created: number;
}

export interface GameTitle {
  id: string;
  name: string;
  studio: string;
  runtime: "native" | "gamecore";
  fpsCap: number;
  installed: boolean;
}

export interface OsNotification {
  id: string;
  title: string;
  body: string;
  at: number;
  appId?: AppId;
  tone: "info" | "ok" | "warn" | "danger";
}

export interface AiaAction {
  id: string;
  label: string;
  type:
    | "open_app"
    | "install_package"
    | "remove_package"
    | "set_mode"
    | "create_workspace"
    | "create_snapshot"
    | "restore_snapshot"
    | "create_flow"
    | "optimize"
    | "repair";
  destructive: boolean;
  appId?: AppId;
  packageId?: string;
  mode?: PerformanceMode;
  name?: string;
  snapshotId?: string;
  when?: string;
  actions?: string[];
}

export interface AiaMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  at: number;
  actions?: AiaAction[];
}

export interface PrivacyGrant {
  app: string;
  files: boolean;
  mic: boolean;
  camera: boolean;
  location: boolean;
  network: boolean;
}

export interface HardwareDevice {
  id: string;
  name: string;
  kind:
    | "cpu"
    | "gpu"
    | "ram"
    | "storage"
    | "wifi"
    | "ethernet"
    | "bluetooth"
    | "audio"
    | "display"
    | "input"
    | "camera"
    | "usb";
  status: "ok" | "warn" | "offline";
  detail: string;
  temp?: number;
  usage?: number;
  power?: number;
  driver: string;
  firmware: string;
}

export interface TermLine {
  id: string;
  kind: "in" | "out" | "err" | "ai" | "ok";
  text: string;
}

export interface TermSession {
  cwd: string;
  lines: TermLine[];
  history: string[];
}
