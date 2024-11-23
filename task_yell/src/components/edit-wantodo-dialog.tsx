"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StickyNote } from "./types";

type Props = {
  editingStickyNote: StickyNote | null;
  setEditingStickyNote: (stickyNote: StickyNote | null) => void;
  updateStickyNote: (stickyNote: StickyNote) => void;
}

export function EditWantodoDialog({ editingStickyNote, setEditingStickyNote, updateStickyNote }: Props) {
  return (
    <Dialog
      open={!!editingStickyNote}
      onOpenChange={() => setEditingStickyNote(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>wanTODOを編集</DialogTitle>
        </DialogHeader>
        {editingStickyNote && (
          <div className="space-y-4">
            <Input
              type="text"
              value={editingStickyNote.title}
              onChange={(e) =>
                setEditingStickyNote({
                  ...editingStickyNote,
                  title: e.target.value,
                })
              }
              placeholder="タイトルを入力"
            />
            <Button
              onClick={() =>
                editingStickyNote && updateStickyNote(editingStickyNote)
              }
            >
              更新
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}