# AI OS

**One System. Every Possibility.**

AI OS is a next-generation operating system concept that combines Windows-level simplicity for everyday users with Linux-level control for advanced users — powered by native AI assistance throughout the system.

> This repository documents the design, architecture, and interactive prototype of **AI OS (Helix desktop)**.

---

## Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Simple for beginners** | Install, connect Wi-Fi, browse, play games, change settings — no terminal required |
| **Powerful for experts** | Full terminal control, package management, workspaces, recovery, and system internals |
| **Native AI** | AIA is a system service, not a bolted-on chatbot |
| **High performance** | Low resource use, Game Mode, Performance Engine |
| **Strong security & privacy** | Secure Boot, encryption, sandboxing, telemetry off by default |
| **Modular** | Hybrid kernel, compartments, optional cloud |
| **Developer-friendly** | DevSpace, toolchains, containers, one-command workspaces |
| **Gaming-ready** | GameCore with Vulkan, DirectX translation, controllers |
| **Fully customizable** | Themes, extensions, alternate desktops, plugins |

---

## Identity

| Field | Value |
|-------|--------|
| **Name** | AI OS |
| **Desktop** | Helix |
| **Tagline** | One System. Every Possibility. |
| **Visual language** | Helix — sheared radii, mineral teal, floating Horizon, hexagonal Nexus, AIA prism |
| **Package format** | `.aipkg` |
| **Package manager** | AIPM (AI Package Manager) |
| **Compatibility layer** | AIX (Windows + Linux software) |
| **AI assistant** | AIA — AI OS Intelligence Assistant |
| **Automation** | AI Flow |
| **File system** | HelixFS (CoW, snapshots, encryption) |

---

## Editions

| Edition | Audience |
|---------|----------|
| **Home** | Everyday users |
| **Pro** | Professionals and creators |
| **Developer** | Programmers and engineers |
| **Gaming** | Gaming PCs |
| **Server** | Infrastructure and headless workloads |
| **Enterprise** | Organizations and fleet policy |
| **Security Lab** | Authorized defensive research |

---

## Architecture (high level)

### Core subsystems

- **Hybrid kernel** — capability microkernel core with fast paths for paging, IPC, GPU
- **Hardware abstraction layer (HAL)**
- **Process, memory, device, and service managers**
- **Network stack** — Wi-Fi, Ethernet, VPN, firewall, encrypted DNS
- **HelixFS** — CoW, snapshots, Linux permissions + easy ACLs
- **Security** — Secure Boot, full-disk encryption, sandboxing, signed software
- **Graphics / compositor** — hardware-accelerated Helix UI
- **AI services layer** — on-device preferred, confirmation before destructive work
- **Virtualization** — VMs, containers, development sandboxes
- **AIX** — selected Windows and Linux software in compartments

### Desktop environments

| Environment | Description |
|-------------|-------------|
| **AI OS Desktop (Helix)** | Graphical session — Nexus launcher, Horizon bar, Spine, windows, workspaces |
| **AI Terminal** | Bash-compatible shell + `ai` / `aipm` commands + AIA error help |

---

## Key features

### AIA — AI OS Intelligence Assistant

Native system assistant that can:

- Search files and settings
- Launch apps and manage windows
- Explain terminal errors and generate scripts
- Install packages (with confirmation)
- Create workspaces and automation flows
- Suggest optimizations and diagnose hardware
- Prefer on-device models when hardware allows

**Rule:** AIA always asks before destructive, admin, install, or security-sensitive operations.

### AI Terminal

```text
ai system status
ai system repair
ai system optimize
ai process list
ai network diagnose
ai hardware scan
ai package install blender
ai package update
ai workspace create GameProject
ai snapshot create
ai snapshot restore
ai explain
aipm search | info | install | remove | update
