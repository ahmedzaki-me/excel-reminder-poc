import type {
  CreateReminderPayload,
  Reminder,
  ReminderListResponse,
  ReminderStatus,
  ApiErrorBody,
} from "@/types/reminder";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? "https://customerexcelapi-production.up.railway.app"}/api/reminders`;

function authHeaders(userId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };
}

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error ?? fallback;
}

export async function fetchReminders(
  userId: string,
  status: ReminderStatus = "Pending",
): Promise<ReminderListResponse> {
  const res = await fetch(`${API_BASE}?status=${status}`, {
    headers: authHeaders(userId),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to load reminders."));
  }

  return res.json();
}

export async function createReminder(
  userId: string,
  payload: CreateReminderPayload,
): Promise<Reminder> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(userId),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to create reminder."));
  }

  return res.json();
}

export async function markReminderAsRead(
  userId: string,
  id: string,
): Promise<Reminder> {
  const res = await fetch(`${API_BASE}/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(userId),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to update reminder."));
  }

  return res.json();
}

export async function cancelReminder(
  userId: string,
  id: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(userId),
  });

  if (res.status !== 204 && !res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to cancel reminder."));
  }
}
