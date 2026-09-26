import type { FileNode } from "./types";
import { uid } from "./catalog";

function node(
  partial: Omit<FileNode, "modified" | "versions" | "encrypted" | "size"> &
    Partial<Pick<FileNode, "modified" | "encrypted" | "size">>,
): FileNode {
  const content = partial.content;
  return {
    encrypted: false,
    modified: Date.now() - 86_400_000,
    versions: content ? [{ at: Date.now() - 86_400_000, content }] : [],
    size: partial.size ?? content.length,
    ...partial,
  };
}

export function seedFiles(owner: string): FileNode[] {
  const root = node({
    id: "root",
    name: "/",
    kind: "folder",
    parentId: null,
    mime: "inode/directory",
    content: "",
    permissions: "drwxr-xr-x",
    owner: "root",
  });
  const system = node({
    id: "sys",
    name: "System",
    kind: "folder",
    parentId: "root",
    mime: "inode/directory",
    content: "",
    permissions: "drwxr-xr-x",
    owner: "root",
  });
  const users = node({
    id: "users",
    name: "Users",
    kind: "folder",
    parentId: "root",
    mime: "inode/directory",
    content: "",
    permissions: "drwxr-xr-x",
    owner: "root",
  });
  const home = node({
    id: "home",
    name: owner,
    kind: "folder",
    parentId: "users",
    mime: "inode/directory",
    content: "",
    permissions: "drwx------",
    owner,
  });
  const folders: [string, string][] = [
    ["desktop", "Desktop"],
    ["docs", "Documents"],
    ["dl", "Downloads"],
    ["pic", "Pictures"],
    ["proj", "Projects"],
    ["mus", "Music"],
    ["vid", "Videos"],
  ];
  const homeFolders = folders.map(([id, name]) =>
    node({
      id,
      name,
      kind: "folder",
      parentId: "home",
      mime: "inode/directory",
      content: "",
      permissions: "drwx------",
      owner,
    }),
  );

  const readme = node({
    id: "readme",
    name: "Welcome to AI OS.md",
    kind: "file",
    parentId: "desktop",
    mime: "text/markdown",
    permissions: "-rw-r-----",
    owner,
    content: `# AI OS — One System. Every Possibility.

You are on Helix, the desktop of AI OS.

- Press the hexagonal Nexus to launch anything
- Ask AIA (right prism) in plain language
- Open AI Terminal for \`ai system status\`
- Simple Mode hides power tools until you want them

This is a living prototype of the operating system — windows, files, packages, recovery, and AIA are real inside this session.
`,
  });

  const spec = node({
    id: "spec",
    name: "helix-kernel-notes.txt",
    kind: "file",
    parentId: "docs",
    mime: "text/plain",
    permissions: "-rw-r-----",
    owner,
    content: `Helix kernel (hybrid)
  HAL → sched.helix → mm.helix → io.helix
  Userland: helixd (service manager) + aia-core
  Isolation: compartments (stronger than cgroups, simpler than seL4 for apps)
  FS: HelixFS (Btrfs-class CoW + Windows-easy ACL overlay)
`,
  });

  const game = node({
    id: "gameproj",
    name: "GameProject",
    kind: "folder",
    parentId: "proj",
    mime: "inode/directory",
    content: "",
    permissions: "drwx------",
    owner,
  });

  const mainRs = node({
    id: "mainrs",
    name: "main.rs",
    kind: "file",
    parentId: "gameproj",
    mime: "text/x-rust",
    permissions: "-rw-r-----",
    owner,
    content: `fn main() {
    println!("Helix GameCore — ready");
}
`,
  });

  const secret = node({
    id: "vault",
    name: "keys.vault",
    kind: "file",
    parentId: "docs",
    mime: "application/octet-stream",
    permissions: "-rw-------",
    owner,
    encrypted: true,
    content: "•••••••••••• (encrypted at rest)",
  });

  const apps = node({
    id: "apps",
    name: "Apps",
    kind: "folder",
    parentId: "root",
    mime: "inode/directory",
    content: "",
    permissions: "drwxr-xr-x",
    owner: "root",
  });

  const snaps = node({
    id: "snaps",
    name: "Snapshots",
    kind: "folder",
    parentId: "root",
    mime: "inode/directory",
    content: "",
    permissions: "drwxr-x---",
    owner: "root",
  });

  return [
    root,
    system,
    users,
    home,
    ...homeFolders,
    readme,
    spec,
    game,
    mainRs,
    secret,
    apps,
    snaps,
  ];
}

export function childrenOf(files: FileNode[], parentId: string | null) {
  return files
    .filter((f) => f.parentId === parentId)
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function pathOf(files: FileNode[], id: string): string {
  const parts: string[] = [];
  let cur = files.find((f) => f.id === id);
  while (cur && cur.id !== "root") {
    parts.unshift(cur.name);
    cur = files.find((f) => f.id === cur!.parentId);
  }
  return "/" + parts.join("/");
}

export function findByPath(files: FileNode[], path: string): FileNode | undefined {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/" || clean === "~" || clean === "/Users") {
    if (clean === "~") return files.find((f) => f.id === "home");
    if (clean === "/") return files.find((f) => f.id === "root");
  }
  const segs = clean.replace(/^~/, "/Users").split("/").filter(Boolean);
  let cur: FileNode | undefined = files.find((f) => f.id === "root");
  if (clean.startsWith("~")) {
    cur = files.find((f) => f.id === "home");
    const rest = clean.slice(1).split("/").filter(Boolean);
    for (const s of rest) {
      cur = files.find((f) => f.parentId === cur?.id && f.name === s);
      if (!cur) return undefined;
    }
    return cur;
  }
  for (const s of segs) {
    cur = files.find((f) => f.parentId === cur?.id && f.name === s);
    if (!cur) return undefined;
  }
  return cur;
}

export function resolvePath(cwd: string, input: string) {
  if (!input) return cwd;
  if (input === "~") return "/Users";
  if (input.startsWith("/")) return input.replace(/\/+/g, "/");
  const parts = (cwd + "/" + input).split("/").filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return "/" + out.join("/");
}

export function mkdir(files: FileNode[], parentId: string, name: string, owner: string): FileNode[] {
  if (files.some((f) => f.parentId === parentId && f.name === name)) return files;
  const now = Date.now();
  return [
    ...files,
    {
      id: uid("dir"),
      name,
      kind: "folder",
      parentId,
      size: 0,
      mime: "inode/directory",
      content: "",
      permissions: "drwx------",
      owner,
      encrypted: false,
      modified: now,
      versions: [],
    },
  ];
}

export function writeFile(
  files: FileNode[],
  parentId: string,
  name: string,
  content: string,
  owner: string,
  mime = "text/plain",
): FileNode[] {
  const existing = files.find((f) => f.parentId === parentId && f.name === name);
  const now = Date.now();
  if (existing) {
    return files.map((f) =>
      f.id === existing.id
        ? {
            ...f,
            content,
            size: content.length,
            modified: now,
            versions: [...f.versions, { at: now, content }].slice(-8),
          }
        : f,
    );
  }
  return [
    ...files,
    {
      id: uid("file"),
      name,
      kind: "file",
      parentId,
      size: content.length,
      mime,
      content,
      permissions: "-rw-r-----",
      owner,
      encrypted: false,
      modified: now,
      versions: [{ at: now, content }],
    },
  ];
}
