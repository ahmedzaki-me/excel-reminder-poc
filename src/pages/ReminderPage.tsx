import { memo, useState } from "react";
import type { SyntheticEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { Check } from "lucide-react";

import { NotificationToggle } from "@/components/shared/NotificationToggle";
import { useReminders } from "@/hooks/useReminders";
import type { Reminder } from "@/types/reminder";
import { toast } from "sonner";

const STATUS_STYLES: Record<Reminder["status"], string> = {
  Pending: "bg-blue-100 text-blue-700",
  Read: "bg-green-100 text-green-700",
  Expired: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-700",
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ReminderItem = memo(function ReminderItem({
  reminder,
  onMarkAsRead,
  onCancel,
}: {
  reminder: Reminder;
  onMarkAsRead: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{reminder.title}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[reminder.status]}`}
          >
            {reminder.status}
          </span>
        </div>

        {reminder.message && (
          <p className="truncate text-xs text-muted-foreground">
            {reminder.message}
          </p>
        )}

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatWhen(reminder.meetingTime)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="
    gap-2
    border-green-200
    bg-green-50
    text-green-700
    hover:bg-green-100
    hover:border-green-300

  "
          onClick={() => onMarkAsRead(reminder.id)}
        >
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          Mark as read
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cancel reminder"
          onClick={() => onCancel(reminder.id)}
          className="
    rounded-full
    bg-red-50
    text-red-600
    hover:bg-red-100
    hover:text-red-700
    transition-colors
  "
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
});

export default function ReminderPage() {
  const {
    reminders,
    isLoading,
    isSubmitting,
    error,
    addReminder,
    markAsRead,
    cancel,
  } = useReminders();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [notifyBeforeMinutes, setNotifyBeforeMinutes] = useState(10);
  const [repeatEveryMinutes, setRepeatEveryMinutes] = useState(5);
  const [maxRetryCount, setMaxRetryCount] = useState(12);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !meetingTime) {
      setFormError("Add a title and a date/time to schedule a reminder.");
      return;
    }

    const selected = new Date(meetingTime);
    if (selected.getTime() <= Date.now()) {
      setFormError("Please choose a future date and time.");
      return;
    }

    setFormError("");

    try {
      await addReminder({
        title: title.trim(),
        message: message.trim(),
        meetingTime: selected.toISOString(),
        notifyBeforeMinutes,
        repeatEveryMinutes,
        maxRetryCount,
      });

      setTitle("");
      setMessage("");
      setMeetingTime("");
      toast.success("Reminder created successfully", {
        description: `You'll be notified ${notifyBeforeMinutes} minutes before your meeting.`,
      });
    } catch {
      //
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
        <p className="text-sm text-muted-foreground">
          Meeting reminders synced with the server.
        </p>
      </div>

      <NotificationToggle />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New reminder</CardTitle>
          <CardDescription>
            Notifications repeat until read or until retries run out.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reminder-title">Title</Label>
                <Input
                  id="reminder-title"
                  placeholder="Meeting with client"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-time">Meeting time</Label>
                <Input
                  id="reminder-time"
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-message">Message (optional)</Label>
              <Textarea
                id="reminder-message"
                rows={3}
                placeholder="Any extra details..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="notify-before">Notify before (min)</Label>
                <Input
                  id="notify-before"
                  type="number"
                  min={1}
                  value={notifyBeforeMinutes}
                  onChange={(e) =>
                    setNotifyBeforeMinutes(Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-every">Repeat every (min)</Label>
                <Input
                  id="repeat-every"
                  type="number"
                  min={1}
                  value={repeatEveryMinutes}
                  onChange={(e) =>
                    setRepeatEveryMinutes(Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-retries">Max retries</Label>
                <Input
                  id="max-retries"
                  type="number"
                  min={1}
                  value={maxRetryCount}
                  onChange={(e) => setMaxRetryCount(Number(e.target.value))}
                />
              </div>
            </div>

            {!!formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {!!error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add reminder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming</CardTitle>
          <CardDescription>{reminders.length} pending</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="rounded-lg border border-dashed px-6 py-10 text-center">
              <Clock className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No reminders yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first reminder above.
              </p>
            </div>
          ) : (
            <ul className="divide-y rounded-lg border">
              {reminders.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onMarkAsRead={markAsRead}
                  onCancel={cancel}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
