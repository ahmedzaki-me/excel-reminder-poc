/**
 * Converts a URL-safe Base64 encoded VAPID public key into a Uint8Array.
 *
 * @param base64 - The VAPID public key string.
 * @returns A Uint8Array representation of the key required by the Web Push API.
 *
 * @note Cross-Browser Compatibility:
 * According to the W3C Web Push spec, `applicationServerKey` must be a `BufferSource`.
 * Chromium browsers tolerate a raw string, but Safari (iOS 16.4+) and Firefox
 * strictly require a Uint8Array and will throw a TypeError otherwise.
 */
function urlBase64ToUint8Array(base64: string) {
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));

  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

// The VAPID public key is fixed/hardcoded by the backend — there is no
// endpoint to fetch it from, so it lives in the env file (see .env.example).
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

async function sendSubscriptionToServer(
  subscription: PushSubscription,
  userId: string,
) {
  const { endpoint, keys } = subscription.toJSON() as {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  const response = await fetch(`${API_BASE_URL}/api/push-subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save push subscription.");
  }
}

export async function subscribeToPush(userId: string) {
  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await sendSubscriptionToServer(subscription, userId);
}

export async function unsubscribeFromPush(userId: string) {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  const response = await fetch(
    `${API_BASE_URL}/api/push-subscriptions?endpoint=${encodeURIComponent(
      subscription.endpoint,
    )}`,
    {
      method: "DELETE",
      headers: {
        "X-User-Id": userId,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to remove push subscription.");
  }

  await subscription.unsubscribe();
}

export async function listPushSubscriptions(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/push-subscriptions`, {
    method: "GET",
    headers: {
      "X-User-Id": userId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch push subscriptions.");
  }

  return response.json();
}
