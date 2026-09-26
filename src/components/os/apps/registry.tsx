import type { ComponentType } from "react";
import type { AppId, OsWindow } from "@/lib/os/types";
import { FilesApp } from "./FilesApp";
import { TerminalApp } from "./TerminalApp";
import { SettingsApp } from "./SettingsApp";
import { AtlasApp } from "./AtlasApp";
import {
  BrowserApp,
  DevSpaceApp,
  FlowApp,
  GameHubApp,
  MediaApp,
  NotesApp,
  WorkspacesApp,
} from "./CreateApps";
import {
  ControlApp,
  HardwareApp,
  MonitorApp,
  NetworkApp,
  PackagesApp,
  PrivacyApp,
  RecoveryApp,
  SecurityApp,
} from "./SystemApps";

type AppView = ComponentType<{ win: OsWindow }>;

export const APP_VIEWS: Record<AppId, AppView> = {
  files: FilesApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  atlas: AtlasApp,
  browser: ({ win: _w }) => <BrowserApp />,
  notes: ({ win: _w }) => <NotesApp />,
  devspace: ({ win: _w }) => <DevSpaceApp />,
  gamehub: ({ win: _w }) => <GameHubApp />,
  media: ({ win: _w }) => <MediaApp />,
  flow: ({ win: _w }) => <FlowApp />,
  workspaces: ({ win: _w }) => <WorkspacesApp />,
  monitor: ({ win: _w }) => <MonitorApp />,
  hardware: ({ win: _w }) => <HardwareApp />,
  control: ({ win: _w }) => <ControlApp />,
  network: ({ win: _w }) => <NetworkApp />,
  packages: ({ win: _w }) => <PackagesApp />,
  recovery: ({ win: _w }) => <RecoveryApp />,
  security: ({ win: _w }) => <SecurityApp />,
  privacy: ({ win: _w }) => <PrivacyApp />,
};
