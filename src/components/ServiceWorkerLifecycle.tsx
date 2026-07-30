import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

let offlineReadyAnnounced = false;
let registrationErrorAnnounced = false;

export const ServiceWorkerLifecycle = () => {
  const [updateReady, setUpdateReady] = useState(false);
  const updateServiceWorker = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    updateServiceWorker.current = registerSW({
      immediate: false,
      onNeedRefresh: () => setUpdateReady(true),
      onOfflineReady: () => {
        if (offlineReadyAnnounced) return;
        offlineReadyAnnounced = true;
        toast.success("App ready for offline use.", { id: "pwa-offline-ready" });
      },
      onRegisterError: () => {
        if (registrationErrorAnnounced) return;
        registrationErrorAnnounced = true;
        toast.error("Offline support could not start. The app still works while online.", {
          id: "pwa-registration-error",
        });
      },
    });
  }, []);

  const applyUpdate = async () => {
    const update = updateServiceWorker.current;
    if (!update) return;
    setUpdateReady(false);
    try {
      await update(true);
    } catch {
      setUpdateReady(true);
      toast.error("The update could not be installed. Your current app remains available.", {
        id: "pwa-update-error",
      });
    }
  };

  if (!updateReady) return null;

  return (
    <section
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg sm:flex-row sm:items-center"
    >
      <p className="flex-1 text-sm">
        An update is ready. Install it when you have finished entering unsaved answers.
      </p>
      <Button className="min-h-11 shrink-0" onClick={applyUpdate}>
        <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
        Update and reload
      </Button>
    </section>
  );
};
