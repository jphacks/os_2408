"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase/client-app";
import { createEvent, readEvents } from "@/lib/events";
import { createNotification } from "@/lib/notifications";
import {
  createWantTodo,
  deleteWantTodo,
  readWantTodos,
  updateWantTodo,
} from "@/lib/want-todo";
import {
  addMonths,
  format,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateStickyNoteServer } from "./actions";
import { Event, Todo, StickyNote } from "@/components/types";
import { Navigation } from "@/components/navigation";
import { EditWantodoDialog } from "@/components/edit-wantodo-dialog";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { StickyNoteItem } from "@/components/sticky-note-item";
import { CalendarRenderer } from "@/components/calendar-renderer";

export default function Home() {
  const [todos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [newStickyNote, setNewStickyNote] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<
    "minimized" | "partial" | "full"
  >("partial");
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
  const dragControls = useDragControls();
  const modalRef = useRef<HTMLDivElement>(null);
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

  const handleStatusBarClick = () => {
    setModalState((prevState) => {
      if (prevState === "minimized") return "partial";
      if (prevState === "partial") return "full";
      return "partial";
    });
  };

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
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: modalState === "minimized" ? 0 : 1,
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-end justify-center z-50 lg:hidden"
            style={{
              backgroundColor:
                modalState === "minimized"
                  ? "transparent"
                  : "rgba(0, 0, 0, 0.5)",
              pointerEvents: modalState === "minimized" ? "none" : "auto",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget && modalState !== "minimized") {
                setIsModalOpen(false);
              }
            }}
          >
            <motion.div
              ref={modalRef}
              initial={{ y: "100%" }}
              animate={{
                y:
                  modalState === "minimized"
                    ? "calc(100% - 40px)"
                    : modalState === "partial"
                      ? "calc(100% - 400px)"
                      : "0%",
                height:
                  modalState === "full"
                    ? "100%"
                    : modalState === "partial"
                      ? "400px"
                      : "40px",
                transition: {
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                },
              }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 200) {
                  setIsModalOpen(false);
                } else if (info.offset.y < -20) {
                  setModalState("full");
                } else if (info.offset.y > 20 && info.offset.y <= 100) {
                  setModalState("partial");
                } else if (info.offset.y > 100) {
                  setModalState("minimized");
                }
              }}
              className="bg-white dark:bg-gray-800 w-full sm:w-96 md:w-[512px] rounded-t-xl shadow-lg overflow-hidden"
              style={{
                maxWidth: "calc(100% - 2rem)",
                margin: "0 1rem",
                height: modalState === "full" ? "calc(100% - 2rem)" : "auto",
                maxHeight: "calc(100% - 2rem)",
                zIndex: 60,
              }}
            >
              <div
                className="h-10 flex items-center justify-start cursor-pointer overflow-x-auto whitespace-nowrap px-4"
                onClick={handleStatusBarClick}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <ChevronUp className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  {format(selectedDate, "yyyy年MM月dd日", { locale: ja })}
                  のwanTODO
                </span>
                {filteredStickyNotes.length > 0 && (
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    （{filteredStickyNotes.length}件）
                  </span>
                )}
              </div>
              <div
                className="p-4 overflow-y-auto"
                style={{ maxHeight: "calc(100% - 40px)" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    {format(selectedDate, "yyyy年MM月dd日", { locale: ja })}
                    のwanTODO
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={newStickyNote}
                    onChange={(e) => setNewStickyNote(e.target.value)}
                    placeholder="新しいwanTODOのタイトルを入力"
                    className="w-full"
                  />
                  <Button onClick={addStickyNote} className="w-full">
                    追加
                  </Button>
                  {filteredStickyNotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredStickyNotes.map((note) => (
                        <StickyNoteItem
                          key={note.id} note={note}
                          setDraggedStickyNote={setDraggedStickyNote}
                          generateStickyNote={generateStickyNote}
                          editStickyNote={editStickyNote}
                          deleteStickyNote={deleteStickyNote}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="dark:text-gray-300">
                      この日のwanTODOはありません。
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
