"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
} from "date-fns";
import { ja } from "date-fns/locale";
import { EventCreator } from "@/components/event-creator";
import { Event, StickyNote } from "@/components/types";

type Props = {
  stickyNotes: StickyNote[];
  setStickyNotes: (notes: StickyNote[]) => void;
  isEventModalOpen: boolean;
  setIsEventModalOpen: (isOpen: boolean) => void;
  selectedDate: Date;
  events: Event[];
  addEvent: (newEvent: Event, notification: { date: Date | null; type: "call" | "push" }) => void;
  removedStickyNote: StickyNote | null;
  setRemovedStickyNote: (note: StickyNote | null) => void;
  draggedStickyNote: StickyNote | null;
};

export function CreateEventDialog({
  stickyNotes, setStickyNotes,
  isEventModalOpen, setIsEventModalOpen,
  selectedDate,
  events, addEvent,
  removedStickyNote, setRemovedStickyNote,
  draggedStickyNote,
}: Props) {
  return (
    <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {format(selectedDate, "yyyy年MM月dd日", { locale: ja })}の予定
          </DialogTitle>
        </DialogHeader>
        <EventCreator
          events={events}
          onSave={addEvent}
          onCancel={() => {
            if (removedStickyNote) {
              setStickyNotes([...stickyNotes, removedStickyNote]);
              setRemovedStickyNote(null);
            }
            setIsEventModalOpen(false);
          }}
          initialTitle={draggedStickyNote ? draggedStickyNote.title : ""}
          targetDate={selectedDate}
        />
      </DialogContent>
    </Dialog>
  )
}