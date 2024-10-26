import { Event } from "./types";
import {
  createData,
  readData,
  readSingleData,
  updateData,
  deleteData,
} from "../firebase/firestore";
const COLLECTION_NAME = "events";

export async function createEvent(event: Event): Promise<string> {
  return createData(COLLECTION_NAME, event);
}

export async function readEvents(): Promise<Event[]> {
  return readData<Event>(COLLECTION_NAME);
}

export async function readSingleEvent(id: string): Promise<Event | null> {
  return readSingleData<Event>(COLLECTION_NAME, id);
}

export async function updateEvent(
  id: string,
  eventData: Partial<Event>,
): Promise<void> {
  return updateData<Event>(COLLECTION_NAME, id, eventData);
}

export async function deleteEvent(id: string): Promise<void> {
  return deleteData(COLLECTION_NAME, id);
}
