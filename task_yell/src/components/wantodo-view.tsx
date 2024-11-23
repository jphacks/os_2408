"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
import { StickyNote } from "@/components/types";
import { StickyNoteItem } from "@/components/sticky-note-item";

type Props = {
  newStickyNote: string;
  setNewStickyNote: (note: string) => void;
  addStickyNote: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredStickyNotes: StickyNote[];
  setDraggedStickyNote: (note: StickyNote | null) => void;
  generateStickyNote: (note: StickyNote) => void;
  editStickyNote: (note: StickyNote) => void;
  deleteStickyNote: (id: string) => void;
}

export function WantodoView({
  newStickyNote, setNewStickyNote,
  addStickyNote,
  searchTerm, setSearchTerm,
  filteredStickyNotes,
  setDraggedStickyNote,
  generateStickyNote,
  editStickyNote,
  deleteStickyNote
}: Props
) {
  return (
    <>
      <h2 className="text-xl lg:text-2xl font-bold mb-4 dark:text-white">
        wanTODO
      </h2>
      <div className="flex flex-col lg:flex-row mb-4 space-y-2 lg:space-y-0 lg:space-x-2">
        <Input
          type="text"
          value={newStickyNote}
          onChange={(e) => setNewStickyNote(e.target.value)}
          placeholder="タイトルを入力"
          className="flex-grow"
        />
        <Button onClick={addStickyNote} className="w-full lg:w-auto">
          追加
        </Button>
      </div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="wanTODOを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredStickyNotes.map((note) => (
            <StickyNoteItem
              key={note.id} note={note}
              setDraggedStickyNote={setDraggedStickyNote}
              generateStickyNote={generateStickyNote}
              editStickyNote={editStickyNote}
              deleteStickyNote={deleteStickyNote}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}