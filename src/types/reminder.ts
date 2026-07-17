export type ReminderStatus = "Pending" | "Read" | "Expired" | "Cancelled";

export interface Reminder {
  id: string;
  title: string;
  message: string;
  meetingTime: string;
  nextReminderTime: string | null;
  retryCount: number;
  maxRetryCount: number;
  status: ReminderStatus;
  createdAt: string;
  readAt: string | null;
}

export interface CreateReminderPayload {
  title: string;
  message: string;
  meetingTime: string;
  notifyBeforeMinutes: number;
  repeatEveryMinutes: number;
  maxRetryCount: number;
}
export interface ReminderListResponse {
  reminders: Reminder[];
  totalCount: number;
}

export interface ApiErrorBody {
  error?: string;
}
