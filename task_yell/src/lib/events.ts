import {
  createData,
  deleteData,
  readData,
  readSingleData,
  updateData,
} from "../firebase/firestore";
import { Event } from "./types";
const COLLECTION_NAME = "events";

/**
 * 既存のイベントと衝突しなければ、新しいイベントを作成する。
 *
 * @param event 作成されるイベント
 * @returns 競合がない場合はnull, そうでない場合はマージエディターで必要なので該当日時のイベントのリスト
 */
export async function createEvent(
  userId: string,
  event: Event,
): Promise<Event[] | null> {
  // event.start ~ event.end とコンフリクトする予定があるかどうかを確認する
  const events = await readEvents(userId);
  let isConflict = false;
  if (event.start && event.end) {
    isConflict = events.some(
      (e) => e.start && event.start && e.end && event.end && event.start <= e.end && event.end >= e.start,
    );
  }
  if (isConflict) {
    return events;
  } else {
    await createData<Event>(`users/${userId}/${COLLECTION_NAME}`, event);
    return null;
  }
}

export async function readEvents(userId: string): Promise<Event[]> {
  return readData<Event>(`users/${userId}/${COLLECTION_NAME}`);
}

export async function readSingleEvent(
  userId: string,
  id: string,
): Promise<Event | null> {
  return readSingleData<Event>(`users/${userId}/${COLLECTION_NAME}`, id);
}

export async function updateEvent(
  userId: string,
  id: string,
  eventData: Partial<Event>,
): Promise<void> {
  return updateData<Event>(`users/${userId}/${COLLECTION_NAME}`, id, eventData);
}

export async function deleteEvent(userId: string, id: string): Promise<void> {
  return deleteData(`users/${userId}/${COLLECTION_NAME}`, id);
}
