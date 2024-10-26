import {
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
export async function createEvent(event: Event): Promise<Event[] | null> {
  // event.start ~ event.end とコンフリクトする予定があるかどうかを確認する
  const events = await readEvents();
  const isConflict = events.some(
    (e) => event.start <= e.end && event.end >= e.start
  );
  if (!isConflict) {
    await updateData<Event>(COLLECTION_NAME, event.title, event);
  }
  return isConflict ? events : null;
}

export async function readEvents(): Promise<Event[]> {
  return readData<Event>(COLLECTION_NAME);
}

export async function readSingleEvent(id: string): Promise<Event | null> {
  return readSingleData<Event>(COLLECTION_NAME, id);
}

export async function updateEvent(
  id: string,
  eventData: Partial<Event>
): Promise<void> {
  return updateData<Event>(COLLECTION_NAME, id, eventData);
}

export async function deleteEvent(id: string): Promise<void> {
  return deleteData(COLLECTION_NAME, id);
}
