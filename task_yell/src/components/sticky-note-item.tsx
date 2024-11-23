"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Brain,
} from "lucide-react";
import { StickyNote } from "@/components/types";

type Props = {
  note: StickyNote;
  setDraggedStickyNote: (note: StickyNote | null) => void;
  generateStickyNote: (note: StickyNote) => void;
  editStickyNote: (note: StickyNote) => void;
  deleteStickyNote: (id: string) => void;
}

export function StickyNoteItem({
  note,
  setDraggedStickyNote, generateStickyNote,
  editStickyNote, deleteStickyNote
}: Props
) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-yellow-200 dark:bg-yellow-700 p-4 rounded shadow-md"
      draggable
      onDragStart={(e) => {
        setDraggedStickyNote(note);
        const dragEvent = e as DragEvent;
        if (dragEvent.dataTransfer) {
          dragEvent.dataTransfer.effectAllowed = "move";
          dragEvent.dataTransfer.setData("text/plain", note.id.toString());
        }
        if (e.currentTarget) {
          (e.currentTarget as HTMLElement).style.opacity = "0.5";
        }
      }}
      onDragEnd={(e) => {
        setDraggedStickyNote(null);
        if (e.currentTarget) {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }
      }}
    >
      <h3 className="font-semibold mb-2">{note.title}</h3>
      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => generateStickyNote(note)}
        >
          <Brain className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editStickyNote(note)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteStickyNote(note.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}