import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type AdminNotificationItem = {
  type: string;
  signature: string;
  title: string;
  description: string;
  count: number;
  path: string;
};

export async function getAdminNotificationSummary() {
  const response =
    await fetch(
      `${API_URL}/AdminNotifications/summary`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading admin notifications"
    );
  }

  return await response.json();
}

export async function markAdminNotificationRead(
  item: AdminNotificationItem
) {
  const response =
    await fetch(
      `${API_URL}/AdminNotifications/read`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          type: item.type,
          signature: item.signature,
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error marking notification as read"
    );
  }

  return await response.json();
}

export async function markAllAdminNotificationsRead(
  items: AdminNotificationItem[]
) {
  const response =
    await fetch(
      `${API_URL}/AdminNotifications/read-all`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          items: items.map((item) => ({
            type: item.type,
            signature: item.signature,
          })),
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error marking notifications as read"
    );
  }

  return await response.json();
}