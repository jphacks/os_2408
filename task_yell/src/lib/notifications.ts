import { Notification } from "./types";
import {
  createData,
  readData,
  readSingleData,
  updateData,
  deleteData,
} from "../firebase/firestore";
import { doc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client-app";
const COLLECTION_NAME = "notifications";

export async function createNotification(
  notification: Notification,
): Promise<string> {
  return createData(COLLECTION_NAME, {
    ...notification,
    eventOrTaskRef: doc(db, notification.eventOrTaskRef),
  });
}

export async function readNotification(): Promise<Notification[]> {
  return (await readData<Notification>(COLLECTION_NAME)).map(
    (notification) => ({
      ...notification,
      datetime: (notification.datetime as unknown as Timestamp).toDate(),
    }),
  );
}

export async function readSingleNotification(
  id: string,
): Promise<Notification | null> {
  return readSingleData<Notification>(COLLECTION_NAME, id).then(
    (notification) =>
      notification && {
        ...notification,
        datetime: (notification.datetime as unknown as Timestamp).toDate(),
      },
  );
}

export async function updateNotification(
  id: string,
  NotificationData: Partial<Notification>,
): Promise<void> {
  return updateData<Notification>(COLLECTION_NAME, id, NotificationData);
}

export async function deleteNotification(id: string): Promise<void> {
  return deleteData(COLLECTION_NAME, id);
}
