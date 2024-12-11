"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/firebase/client-app";
import { createEvent, readEvents } from "@/lib/events";
import { createNotification } from "@/lib/notifications";
import {
  createWantTodo,
  deleteWantTodo,
  readWantTodos,
  updateWantTodo,
} from "@/lib/want-todo";
import { addMonths, format, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { generateStickyNoteServer } from "./actions";
import { Event, Todo, StickyNote } from "@/components/types";
import { Navigation } from "@/components/navigation";
import { EditWantodoDialog } from "@/components/edit-wantodo-dialog";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { CalendarRenderer } from "@/components/calendar-renderer";
import { WantodoView } from "@/components/wantodo-view";

export default function Home() {
  const [todos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [newStickyNote, setNewStickyNote] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStickyNote, setEditingStickyNote] = useState<StickyNote | null>(
    null,
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [draggedStickyNote, setDraggedStickyNote] = useState<StickyNote | null>(
    null,
  );
  const [removedStickyNote, setRemovedStickyNote] = useState<StickyNote | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    // サインインしていない場合、サインインページにリダイレクト
    auth.authStateReady().then(() => {
      if (!auth.currentUser) {
        router.push("/signin");
      } else {
        readEvents(auth.currentUser.uid).then((events) => {
          setEvents(
            events.map((event) => {
              return {
                ...event,
                invitees: event.attendees.join(", "),
                isTask: false,
                isLocked: false,
                category: event.category || "other",
                priority: event.priority || "medium",
              };
            }),
          );
        });

        readWantTodos(auth.currentUser.uid).then((todos) => {
          setStickyNotes(
            todos.map((todo) => {
              return {
                id: todo.id,
                title: todo.title,
              };
            }),
          );
        });
      }
    });
  }, [router]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const addStickyNote = async () => {
    if (newStickyNote.trim()) {
      const newNote: StickyNote = { id: "", title: newStickyNote };
      setStickyNotes([...stickyNotes, newNote]);
      setNewStickyNote("");
      if (auth.currentUser) {
        await createWantTodo(auth.currentUser.uid, newNote);
      }
    }
  };

  const editStickyNote = (note: StickyNote) => {
    setEditingStickyNote(note);
  };

  const generateStickyNote = async (note: StickyNote) => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const generated = await generateStickyNoteServer(note.title);
      // Firestoreに追加
      if (generated) {
        const items = await Promise.all(
          generated.map(async (item) => ({
            id: await createWantTodo(uid, item),
            title: item.title,
          })),
        );
        setStickyNotes([...stickyNotes, ...items]);
      }
    }
  };

  const updateStickyNote = async (updatedNote: StickyNote) => {
    const updatedNotes = stickyNotes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note,
    );
    setStickyNotes(updatedNotes);
    setEditingStickyNote(null);
    if (auth.currentUser) {
      await updateWantTodo(auth.currentUser.uid, updatedNote.id, {
        title: updatedNote.title,
      });
    }
  };

  const deleteStickyNote = async (id: string) => {
    const noteToRemove = stickyNotes.find((note) => note.id === id);
    if (noteToRemove) {
      setRemovedStickyNote(noteToRemove);
      setStickyNotes(stickyNotes.filter((note) => note.id !== id));
    }
    if (draggedStickyNote && draggedStickyNote.id === id) {
      setDraggedStickyNote(null);
    }
    if (auth.currentUser) {
      await deleteWantTodo(auth.currentUser.uid, id);
    }
  };

  const addEvent = async (
    newEvent: Event,
    notification: { date: Date | null; type: "call" | "push" },
  ) => {
    console.log("addEvent", newEvent);
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
    setRemovedStickyNote(null);
    if (auth.currentUser) {
      const id = await createEvent(auth.currentUser.uid, {
        ...newEvent,
        attendees: newEvent.invitees
          .split(",")
          .map((invitee) => invitee.trim()),
        category: newEvent.category,
        priority: newEvent.priority,
        reccurence: [],
      });
      if (notification.date) {
        await createNotification({
          id: "",
          userId: auth.currentUser.uid,
          eventOrTaskRef: `users/${auth.currentUser.uid}/events/${id}`,
          datetime: notification.date,
          type: notification.type,
        });
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const filteredStickyNotes = useMemo(() => {
    return stickyNotes.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [stickyNotes, searchTerm]);

  return (
    <div
      className={`relative h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden ${isDarkMode ? "dark" : ""}`}
    >
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="flex flex-col lg:flex-row h-full pt-20 px-4">
        <div className="w-full lg:w-1/2 pr-2 overflow-auto">
          <div className="mb-4 flex justify-between items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl lg:text-2xl font-bold dark:text-white">
              {format(currentMonth, "yyyy年MM月", { locale: ja })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <CalendarRenderer
            todos={todos}
            events={events}
            stickyNotes={stickyNotes}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            handleDateSelect={handleDateSelect}
            isDarkMode={isDarkMode}
            draggedStickyNote={draggedStickyNote}
            deleteStickyNote={deleteStickyNote}
            setIsEventModalOpen={setIsEventModalOpen}
          />
        </div>

        <div className="w-full lg:w-1/2 pl-2 bg-white dark:bg-gray-800 overflow-auto lg:block hidden">
          <WantodoView
            newStickyNote={newStickyNote}
            setNewStickyNote={setNewStickyNote}
            addStickyNote={addStickyNote}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredStickyNotes={filteredStickyNotes}
            setDraggedStickyNote={setDraggedStickyNote}
            generateStickyNote={generateStickyNote}
            editStickyNote={editStickyNote}
            deleteStickyNote={deleteStickyNote}
          />
        </div>
      </div>

      <EditWantodoDialog
        editingStickyNote={editingStickyNote}
        setEditingStickyNote={setEditingStickyNote}
        updateStickyNote={updateStickyNote}
      />

      <CreateEventDialog
        stickyNotes={stickyNotes}
        setStickyNotes={setStickyNotes}
        isEventModalOpen={isEventModalOpen}
        setIsEventModalOpen={setIsEventModalOpen}
        selectedDate={selectedDate}
        events={events}
        addEvent={addEvent}
        removedStickyNote={removedStickyNote}
        setRemovedStickyNote={setRemovedStickyNote}
        draggedStickyNote={draggedStickyNote}
      />
    </div>
  );
}
