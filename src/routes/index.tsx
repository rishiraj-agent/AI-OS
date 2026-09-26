import { createFileRoute } from "@tanstack/react-router";
import { Boot } from "@/components/os/Boot";
import { Setup } from "@/components/os/Setup";
import { Desktop } from "@/components/os/Desktop";
import { useOs } from "@/lib/os/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const booted = useOs((s) => s.booted);
  const setup = useOs((s) => s.setupComplete);
  if (!booted) return <Boot />;
  if (!setup) return <Setup />;
  return <Desktop />;
}
