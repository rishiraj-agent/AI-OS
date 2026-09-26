import { useMemo, useState } from "react";
import { FileText, Folder, Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { childrenOf, pathOf } from "@/lib/os/fs";
import { useOs } from "@/lib/os/store";
import type { OsWindow } from "@/lib/os/types";
import { cn } from "@/lib/cn";

export function FilesApp({ win }: { win: OsWindow }) {
  const files = useOs((s) => s.files);
  const createFolder = useOs((s) => s.createFolder);
  const createFile = useOs((s) => s.createFile);
  const updateFile = useOs((s) => s.updateFile);
  const deleteNode = useOs((s) => s.deleteNode);
  const copyText = useOs((s) => s.copyText);
  const startId = win.payload?.id ?? "home";
  const start = files.find((f) => f.id === startId) ?? files.find((f) => f.id === "home");
  const [cwd, setCwd] = useState(start?.kind === "folder" ? start.id : start?.parentId ?? "home");
  const [sel, setSel] = useState(start?.kind === "file" ? start.id : "");
  const folder = files.find((f) => f.id === cwd) ?? files.find((f) => f.id === "home")!;
  const kids = childrenOf(files, folder.id);
  const selected = files.find((f) => f.id === sel);
  const crumbs = useMemo(() => {
    const chain: { id: string; name: string }[] = [];
    let cur = folder;
    while (cur) {
      chain.unshift({ id: cur.id, name: cur.name });
      cur = files.find((f) => f.id === cur.parentId)!;
      if (!cur) break;
    }
    return chain;
  }, [folder, files]);

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-40 shrink-0 border-r border-line p-2 md:block">
        {["home", "desktop", "docs", "dl", "proj"].map((id) => {
          const n = files.find((f) => f.id === id);
          if (!n) return null;
          return (
            <button
              key={id}
              onClick={() => setCwd(id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-helix-sm px-2 py-2 text-left text-xs",
                cwd === id ? "bg-raised text-fg" : "text-muted hover:text-fg",
              )}
            >
              <Folder className="size-3.5" />
              {n.name}
            </button>
          );
        })}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 items-center gap-2 border-b border-line px-3 text-xs">
          <div className="min-w-0 flex-1 truncate text-muted">
            {crumbs.map((c, i) => (
              <button key={c.id} className="hover:text-fg" onClick={() => setCwd(c.id)}>
                {i > 0 ? " / " : ""}
                {c.name}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => createFolder(folder.id, "New Folder")}>
            <Plus className="size-3.5" /> Folder
          </Button>
          <Button size="sm" variant="ghost" onClick={() => createFile(folder.id, "untitled.txt", "")}>
            <Plus className="size-3.5" /> File
          </Button>
        </div>
        <div className="os-scroll grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-5">
          <ul className="md:col-span-2">
            {kids.map((k) => (
              <li key={k.id}>
                <button
                  onClick={() => {
                    if (k.kind === "folder") setCwd(k.id);
                    else setSel(k.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-raised",
                    sel === k.id && "bg-raised",
                  )}
                >
                  {k.kind === "folder" ? (
                    <Folder className="size-4 text-accent" />
                  ) : (
                    <FileText className="size-4 text-muted" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{k.name}</span>
                  {k.encrypted && <Lock className="size-3 text-warn" />}
                </button>
              </li>
            ))}
            {kids.length === 0 && <p className="p-4 text-sm text-muted">Empty folder</p>}
          </ul>
          <div className="border-t border-line p-4 md:col-span-3 md:border-t-0 md:border-l">
            {selected ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-medium">{selected.name}</h2>
                    <p className="font-mono text-[11px] text-muted">
                      {pathOf(files, selected.id)} · {selected.permissions} · {selected.owner}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copyText(selected.content)}>
                      Copy
                    </Button>
                    <Button size="sm" variant="quiet" onClick={() => deleteNode(selected.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {selected.encrypted ? (
                  <p className="text-sm text-warn">Encrypted at rest. Unlock from Privacy Center.</p>
                ) : selected.kind === "file" ? (
                  <textarea
                    value={selected.content}
                    onChange={(e) => updateFile(selected.id, e.target.value)}
                    className="os-scroll min-h-40 flex-1 rounded-helix-sm bg-raised p-3 font-mono text-xs helix-inset outline-none"
                  />
                ) : null}
                {selected.versions.length > 1 && (
                  <p className="mt-2 text-[11px] text-muted">{selected.versions.length} versions kept</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">Select a file. NTFS, exFAT, FAT32, EXT4, Btrfs and network shares mount here through HelixFS.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
