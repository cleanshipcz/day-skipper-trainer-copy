import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { replayProgressQueue } from "@/features/offline/progressQueue";
import { toast } from "sonner";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const OfflineSupport = () => {
  const { user } = useAuth();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleOffline = () => setOnline(false);
    const handleOnline = async () => {
      setOnline(true);
      if (!user) return;
      try {
        const result = await replayProgressQueue(supabase, user.id);
        if (result.synced > 0) toast.success(`${result.synced} offline progress update${result.synced === 1 ? "" : "s"} synced`);
      } catch {
        toast.error("Offline progress is still queued; sync will retry when you reconnect.");
      }
    };
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("beforeinstallprompt", handleInstall);
    if (navigator.onLine) void handleOnline();
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, [user]);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <>
      {!online && (
        <div role="status" className="sticky top-0 z-50 flex min-h-11 items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950">
          <WifiOff aria-hidden="true" className="h-4 w-4" />
          Offline — theory and quizzes remain available; progress will sync on reconnect.
        </div>
      )}
      {installPrompt && (
        <Button className="fixed bottom-4 right-4 z-50 min-h-11 shadow-lg" onClick={install}>
          <Download aria-hidden="true" className="mr-2 h-4 w-4" />
          Install app
        </Button>
      )}
    </>
  );
};
