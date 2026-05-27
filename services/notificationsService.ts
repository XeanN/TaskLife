import { getNotifPreferences } from "@/services/storageService";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";

export const REMINDER_CHANNEL_ID = "tasklife-reminders";

type ReminderLike = {
  id?: string;
  reminderId?: string;
  title?: string;
  body?: string;
  message?: string;
  type?: string;
  dueAt?: string;
  scheduledAt?: string;
  status?: string;
};

function toDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getReminderId(reminder: ReminderLike, index: number) {
  return String(reminder.id || reminder.reminderId || `reminder-${index}`);
}

function getReminderTitle(reminder: ReminderLike) {
  return (
    reminder.title ||
    reminder.type?.replace(/_/g, " ")?.toUpperCase() ||
    "Recordatorio TaskLife"
  );
}

function getReminderBody(reminder: ReminderLike) {
  return reminder.body || reminder.message || "Tienes una tarea pendiente.";
}

export async function ensureReminderNotificationChannel() {
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "TaskLife Recordatorios",
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestReminderNotificationsPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelAllReminderNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) => notification.content?.data?.category === "tasklife-reminder")
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
}

export async function syncReminderNotifications(reminders: ReminderLike[] = []) {
  const prefs = await getNotifPreferences();
  if (!prefs.tasks_due) {
    await cancelAllReminderNotifications();
    return { scheduled: 0, skipped: true };
  }

  const granted = await requestReminderNotificationsPermission();
  if (!granted) {
    return { scheduled: 0, skipped: true };
  }

  await ensureReminderNotificationChannel();

  const now = Date.now();
  let scheduled = 0;

  for (let i = 0; i < reminders.length; i += 1) {
    const reminder = reminders[i];
    const id = getReminderId(reminder, i);
    const dueDate = toDate(reminder.dueAt || reminder.scheduledAt);
    const title = getReminderTitle(reminder);
    const body = getReminderBody(reminder);

    if (!dueDate) {
      continue;
    }

    const trigger = dueDate.getTime() > now ? dueDate : new Date(now + 1500);

    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const duplicates = existing.filter(
      (notification) =>
        notification.content?.data?.category === "tasklife-reminder" &&
        String(notification.content?.data?.reminderId) === id,
    );

    await Promise.all(
      duplicates.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          category: "tasklife-reminder",
          reminderId: id,
          dueAt: reminder.dueAt || reminder.scheduledAt || null,
          status: reminder.status || null,
        },
      },
      trigger: {
        date: trigger,
        channelId: REMINDER_CHANNEL_ID,
      },
    });

    scheduled += 1;
  }

  return { scheduled, skipped: false };
}

export async function sendTestReminderNotification() {
  const granted = await requestReminderNotificationsPermission();
  if (!granted) {
    throw new Error("Permiso de notificaciones denegado");
  }

  await ensureReminderNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "TaskLife",
      body: "Este es un recordatorio de prueba con sonido por defecto.",
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: {
        category: "tasklife-test-reminder",
      },
    },
    trigger: {
      seconds: 2,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  return true;
}