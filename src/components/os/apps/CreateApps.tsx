import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOs } from "@/lib/os/store";
import { cn } from "@/lib/cn";

export function NotesApp() {
  const notes = useOs((s) => s.notes);
  const addNote = useOs((s) => s.addNote);
  const saveNote = useOs((s) => s.saveNote);
  const deleteNote = useOs((s) => s.deleteNote);
  const [id, setId] = useState(notes[0]?.id ?? "");
  const cur = notes.find((n) => n.id === id) ?? notes[0];
  return (
    <div className="flex h-full min-h-0">
      <aside className="w-40 shrink-0 overflow-y-auto border-r border-line p-2">
        <Button size="sm" className="mb-2 w-full" onClick={() => addNote()}>
          New
        </Button>
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => setId(n.id)}
            className={cn(
              "mb-1 block w-full truncate rounded-helix-sm px-2 py-2 text-left text-xs",
              cur?.id === n.id ? "bg-raised" : "text-muted",
            )}
          >
            {n.title || "Untitled"}
          </button>
        ))}
      </aside>
      {cur ? (
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <input
            value={cur.title}
            onChange={(e) => saveNote(cur.id, e.target.value, cur.body)}
            className="h-10 bg-transparent text-lg font-medium outline-none"
          />
          <textarea
            value={cur.body}
            onChange={(e) => saveNote(cur.id, cur.title, e.target.value)}
            className="min-h-0 flex-1 bg-transparent text-sm leading-relaxed outline-none"
          />
          <button className="self-start text-xs text-danger" onClick={() => deleteNote(cur.id)}>
            Delete
          </button>
        </div>
      ) : (
        <p className="p-4 text-sm text-muted">No notes</p>
      )}
    </div>
  );
}

export function DevSpaceApp() {
  const workspaces = useOs((s) => s.workspaces);
  const addWorkspace = useOs((s) => s.addWorkspace);
  const packages = useOs((s) => s.packages);
  const [name, setName] = useState("GameProject");
  const tools = packages.filter((p) => p.category === "Develop");
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">AI DevSpace</h2>
      <p className="mt-1 text-sm text-muted">
        Isolated project environments. One command: <span className="font-mono">ai workspace create</span>
      </p>
      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 flex-1 rounded-helix-sm bg-raised px-3 text-sm helix-inset outline-none"
        />
        <Button onClick={() => addWorkspace(name, ["git", "rust", "python"])}>Create</Button>
      </div>
      <h3 className="mt-6 text-xs tracking-wide text-muted uppercase">Toolchain</h3>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {tools.map((t) => (
          <li key={t.id} className="rounded-helix-sm bg-raised px-3 py-2 text-xs helix-inset">
            {t.name} {t.installed ? "· ready" : "· not installed"}
          </li>
        ))}
      </ul>
      <h3 className="mt-6 text-xs tracking-wide text-muted uppercase">Workspaces</h3>
      {workspaces.length === 0 && <p className="mt-2 text-sm text-muted">None yet.</p>}
      <ul className="mt-2 space-y-2">
        {workspaces.map((w) => (
          <li key={w.id} className="rounded-helix-sm bg-raised px-3 py-3 helix-inset">
            <p className="text-sm font-medium">{w.name}</p>
            <p className="font-mono text-[11px] text-muted">{w.path}</p>
            <p className="text-xs text-muted">{w.stack.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GameHubApp() {
  const games = useOs((s) => s.games);
  const gameMode = useOs((s) => s.gameMode);
  const setGameMode = useOs((s) => s.setGameMode);
  const installGame = useOs((s) => s.installGame);
  const metrics = useOs((s) => s.metrics);
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">GameCore</h2>
        <Button size="sm" variant={gameMode ? "primary" : "ghost"} onClick={() => setGameMode(!gameMode)}>
          Game Mode {gameMode ? "on" : "off"}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Vulkan · DirectX via Proton-class translation · controller · shader cache · cloud saves · mods.
        GPU {metrics.gpu.toFixed(0)}% · {metrics.temp.toFixed(0)}°C
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {games.map((g) => (
          <li key={g.id} className="rounded-helix-sm bg-raised p-3 helix-inset">
            <p className="text-sm font-medium">{g.name}</p>
            <p className="text-xs text-muted">
              {g.studio} · {g.runtime} · {g.fpsCap} Hz profile
            </p>
            {g.installed ? (
              <p className="mt-2 text-xs text-ok">Ready · auto profile applied</p>
            ) : (
              <Button className="mt-2" size="sm" onClick={() => installGame(g.id)}>
                Install
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MediaApp() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="text-lg font-medium">Media Studio</h2>
      <p className="text-sm text-muted">Play, capture, color. Hardware encode through Helix GPU.</p>
      <div className="mt-4 flex flex-1 items-center justify-center rounded-helix bg-raised helix-inset">
        <div className="text-center">
          <p className="text-sm">{playing ? "Preview — North Rail trailer" : "Timeline empty"}</p>
          <Button className="mt-3" size="sm" onClick={() => setPlaying((v) => !v)}>
            {playing ? "Pause" : "Play sample"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FlowApp() {
  const flows = useOs((s) => s.flows);
  const addFlow = useOs((s) => s.addFlow);
  const toggleFlow = useOs((s) => s.toggleFlow);
  const [text, setText] = useState("Every Monday at 9 AM, open my development tools and load my game-development workspace.");
  return (
    <div className="os-scroll h-full overflow-y-auto p-4">
      <h2 className="text-lg font-medium">AI Flow</h2>
      <p className="mt-1 text-sm text-muted">Describe a workflow. Advanced users can edit the verbs after.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-3 h-24 w-full rounded-helix-sm bg-raised p-3 text-sm helix-inset outline-none"
      />
      <Button
        className="mt-2"
        onClick={() =>
          addFlow({
            name: text.slice(0, 48),
            when: "Monday 09:00",
            actions: ["open DevSpace", "load GameProject", "set mode developer"],
            enabled: true,
            source: "natural",
          })
        }
      >
        Create flow
      </Button>
      <ul className="mt-4 space-y-2">
        {flows.map((f) => (
          <li key={f.id} className="rounded-helix-sm bg-raised px-3 py-3 helix-inset">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{f.name}</p>
              <button className="text-xs text-accent" onClick={() => toggleFlow(f.id)}>
                {f.enabled ? "enabled" : "paused"}
              </button>
            </div>
            <p className="text-xs text-muted">{f.when}</p>
            <p className="text-xs">{f.actions.join(" → ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkspacesApp() {
  const workspaces = useOs((s) => s.workspaces);
  const openApp = useOs((s) => s.openApp);
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium">Workspace Manager</h2>
      <p className="mt-1 text-sm text-muted">Project rooms with environment, files, and AIA context.</p>
      {workspaces.length === 0 && (
        <Button className="mt-4" onClick={() => openApp("devspace")}>
          Create in DevSpace
        </Button>
      )}
      <ul className="mt-4 space-y-2">
        {workspaces.map((w) => (
          <li key={w.id} className="rounded-helix-sm bg-raised px-3 py-3 text-sm helix-inset">
            {w.name}
            <span className="ml-2 font-mono text-[11px] text-muted">{w.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrowserApp() {
  const [url, setUrl] = useState("helix://home");
  const pages: Record<string, { title: string; body: string }> = {
    "helix://home": {
      title: "Helix Net",
      body: "Start page. Try helix://docs, helix://packages, helix://atlas — or ask AIA.",
    },
    "helix://docs": {
      title: "Documentation",
      body: "AI OS command surface: ai system status, aipm install, ai workspace create. Full architecture lives in AI OS Atlas.",
    },
    "helix://packages": {
      title: "Software",
      body: "Signed catalog served by AIPM. Native applications are marked separately from AIX compatibility titles.",
    },
    "helix://atlas": {
      title: "Atlas",
      body: "Open the Atlas app from Nexus for kernel, security, GameCore, and API maps.",
    },
  };
  const page = pages[url] ?? {
    title: "Unreachable",
    body: "This preview sandbox does not embed arbitrary websites. Helix Browser on a full install uses isolated renderer processes.",
  };
  return (
    <div className="flex h-full flex-col">
      <form
        className="flex gap-2 border-b border-line p-2"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-9 flex-1 rounded-helix-sm bg-raised px-3 font-mono text-xs helix-inset outline-none"
        />
      </form>
      <div className="os-scroll flex-1 overflow-y-auto p-6">
        <p className="text-xs tracking-wide text-muted uppercase">Helix Browser</p>
        <h2 className="mt-2 text-2xl font-medium tracking-tight">{page.title}</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{page.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(pages).map((u) => (
            <button key={u} className="text-xs text-accent" onClick={() => setUrl(u)}>
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
