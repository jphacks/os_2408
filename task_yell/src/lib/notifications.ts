import { Notification } from "./types";
import {
  createData,
  readData,
  readSingleData,
  updateData,
  deleteData,
} from "../firebase/firestore";
const COLLECTION_NAME = "notifications";

export async function createNotification(notification:Notification ): Promise<string> {
  return createData(COLLECTION_NAME, notification);
}

export async function readNotification(): Promise<Notification[]> {
  return readData<Notification>(COLLECTION_NAME);
}

export async function readSingleNotification(id: string): Promise<Notification | null> {
  return readSingleData<Notification>(COLLECTION_NAME, id);
}

export async function updateNotification(
  id: string,
  NotificationData: Partial<Notification>
): Promise<void> {
  return updateData<Notification>(COLLECTION_NAME, id, NotificationData);
}

export async function deleteNotification(id: string): Promise<void> {
  return deleteData(COLLECTION_NAME, id);
}
