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

  if (event.action === "mark-read") {
    if (reminderId) {
      event.waitUntil(markReminderAsRead(USER_ID, reminderId));
    }
    return;
  }

  const targetUrl = new URL("/reminder", self.registration.scope).href;

  event.waitUntil(self.clients.openWindow(targetUrl));
});
