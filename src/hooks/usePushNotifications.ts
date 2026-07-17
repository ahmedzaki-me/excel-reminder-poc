import { useCallback, useEffect, useState } from "react";

import { subscribeToPush, unsubscribeFromPush } from "@/lib/push";

type Permission = NotificationPermission | "unsupported";

export function usePushNotifications(userId: string) {
  const [permission, setPermission] = useState<Permission>(() => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    async function syncStatus() {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("SW not ready (timeout)")), 5000),
          ),
        ]);

        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;

        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error("Service worker not ready:", err);
        if (!cancelled) setIsSubscribed(false);
      }
    }

    syncStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const enabled = permission === "granted" && isSubscribed;

  const enable = useCallback(async () => {
    if (!("Notification" in window)) return;

    setIsLoading(true);
    try {
      let current = Notification.permission;

      if (current === "default") {
        current = await Notification.requestPermission();
      }

      setPermission(current);

      if (current !== "granted") return;

      await subscribeToPush(userId);
      setIsSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const disable = useCallback(async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush(userId);
      setIsSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    enabled,
    permission,
    isLoading,
    enable,
    disable,
  };
}
