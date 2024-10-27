"use server";

import { splitWantToDo } from "@/lib/ai";

export async function generateStickyNoteServer(note: string) {
  return await splitWantToDo({ title: note, id: "" });
}
