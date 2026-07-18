/// <reference lib="webworker" />
export {};

import { precacheAndRoute } from "workbox-precaching";
import { markReminderAsRead } from "@/services/reminder.service";

declare const self: ServiceWorkerGlobalScope;

const USER_ID = "550e8400-e29b-41d4-a716-446655440000";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data: {
    title?: string;
    body?: string;
    reminderId?: string;
  };

  try {
    data = event.data?.json() ?? {};
  } catch {
    data = {
      title: "Reminder",
      body: event.data?.text() ?? "",
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Reminder", {
      body: data.body ?? "",
      icon: "/Logo.png",
      badge: "/Logo.png",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        reminderId: data.reminderId,
      },
      actions: [
        {
          action: "open",
          title: "Open",
        },
        {
          action: "mark-read",
          title: "Mark as Read",
        },
      ],
    } as NotificationOptions),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { reminderId } = event.notification.data ?? {};
  const targetUrl = "/reminder";

  event.waitUntil(
    (async () => {
      try {
        switch (event.action) {
          case "mark-read":
            if (reminderId) {
              await markReminderAsRead(USER_ID, reminderId);
            }
            break;
          case "open":
          default: {
            const windowClients = await self.clients.matchAll({
              type: "window",
              includeUncontrolled: true,
            });

            let handled = false;
            for (const client of windowClients) {
              if ("focus" in client) {
                await client.focus();
                if ("navigate" in client) {
                  await (client as WindowClient).navigate(targetUrl);
                }
                handled = true;
                break;
              }
            }

            if (!handled) {
              await self.clients.openWindow(targetUrl);
            }
            break;
          }
        }
      } catch (error) {
        console.error("Notification action failed:", error);
      }
    })(),
  );
});
