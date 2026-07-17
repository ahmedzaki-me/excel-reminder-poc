import { useCallback, useEffect, useMemo, useState } from "react";

import {
  cancelReminder as cancelReminderApi,
  createReminder as createReminderApi,
  fetchReminders,
  markReminderAsRead as markReminderAsReadApi,
} from "@/services/reminder.service";
import type { CreateReminderPayload, Reminder } from "@/types/reminder";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useReminders() {
  const userId = "550e8400-e29b-41d4-a716-446655440000";

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchReminders(userId, "Pending");
      setReminders(data.reminders);
    } catch (err) {
      setError(getErrorMessage(err, "Unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadReminders();
    });
  }, [loadReminders]);

  const addReminder = useCallback(
    async (payload: CreateReminderPayload) => {
      if (!userId) {
        setError("Current user not found.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const created = await createReminderApi(userId, payload);

        setReminders((prev) =>
          [...prev, created].sort(
            (a, b) =>
              new Date(a.meetingTime).getTime() -
              new Date(b.meetingTime).getTime(),
          ),
        );

        return created;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to create reminder."));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) return;

      const previousReminders = reminders;

      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));

      try {
        await markReminderAsReadApi(userId, id);
      } catch (err) {
        setReminders(previousReminders);
        setError(getErrorMessage(err, "Failed to update reminder."));
      }
    },
    [userId, reminders],
  );

  const cancel = useCallback(
    async (id: string) => {
      if (!userId) return;

      const previousReminders = reminders;

      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));

      try {
        await cancelReminderApi(userId, id);
      } catch (err) {
        setReminders(previousReminders);
        setError(getErrorMessage(err, "Failed to cancel reminder."));
      }
    },
    [userId, reminders],
  );

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort(
        (a, b) =>
          new Date(a.meetingTime).getTime() - new Date(b.meetingTime).getTime(),
      ),
    [reminders],
  );

  return {
    reminders: sortedReminders,
    isLoading,
    isSubmitting,
    error,
    addReminder,
    markAsRead,
    cancel,
    refresh: loadReminders,
  };
}
