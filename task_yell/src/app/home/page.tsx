"use client";

import { DateTimeInput } from "@/components/date-time-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/firebase/auth";
import { auth } from "@/firebase/client-app";
import { createEvent, readEvents } from "@/lib/events";
import { Category, Priority } from "@/lib/types";
import {
  createWantTodo,
  deleteWantTodo,
  readWantTodos,
  updateWantTodo,
} from "@/lib/want-todo";
import {
  AngleIcon,
  ListBulletIcon,
  Pencil1Icon,
  ViewGridIcon,
} from "@radix-ui/react-icons";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getHours,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  MapPinIcon,
  Menu,
  Trash2,
  UserPlusIcon,
  X,
  Bell,
  Users,
  Download,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  priority: Priority;
  category: Category;
};

type Event = {
  id: string;
  title: string;
  start: Date | null;
  end: Date | null;
  description: string;
  category: Category;
  priority: Priority;
  location: string | null;
  invitees: string;
  isTask: boolean;
  isLocked: boolean;
};

type StickyNote = {
  id: string;
  title: string;
};

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-100 dark:bg-blue-900",
  medium: "bg-yellow-100 dark:bg-yellow-900",
  high: "bg-red-100 dark:bg-red-900",
};

function EventCreator({
  onSave,
  onCancel,
  initialTitle = "",
  targetDate,
  events,
}: {
  onSave: (event: Event) => void;
  onCancel: () => void;
  initialTitle?: string;
  targetDate: Date;
  events: Event[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(targetDate);
  const [endTime, setEndTime] = useState(targetDate);
  const [location, setLocation] = useState("");
  const [invitees, setInvitees] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isTask, setIsTask] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const handleSave = () => {
    if (targetDate) {
      const newEvent: Event = {
        id: "",
        title,
        start: startTime,
        end: endTime,
        description,
        category,
        priority,
        location,
        invitees,
        isTask,
        isLocked,
      };
      onSave(newEvent);
    }
  };

  // 選択された日のスケジュールを描画する関数
  const renderDaySchedule = () => {
    // 選択された日のイベントをフィルタリング
    const dayEvents = events.filter(
      (event) => event.start && isSameDay(event.start, startTime),
    );
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const sortedEvents = dayEvents.sort((a, b) =>
      a.start && b.start ? a.start.getTime() - b.start.getTime() : 0,
    );

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">
          {format(startTime, "yyyy年MM月dd日 (E)", { locale: ja })}
          のスケジュール
        </h3>
        <div
          className="relative"
          style={{ height: "600px", overflowY: "auto" }}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex items-center h-12 border-t border-gray-200 dark:border-gray-700"
            >
              <span className="w-12 text-xs text-gray-500">{`${hour.toString().padStart(2, "0")}:00`}</span>
              <div className="flex-1 relative">
                {sortedEvents
                  .filter(
                    (event) => event.start && getHours(event.start) === hour,
                  )
                  .map((event, index) => {
                    if (!event.start || !event.end) {
                      return <></>;
                    }
                    const startMinutes = event.start.getMinutes();
                    const duration =
                      (event.end.getTime() - event.start.getTime()) /
                      (1000 * 60);
                    const height = `${duration}px`;
                    const top = `${startMinutes}px`;
                    const width = index === 0 ? "200%" : "150%";
                    const left =
                      index === 0 ? "0%" : `${50 * Math.min(index, 3)}%`;
                    const zIndex = index + 1;

                    return (
                      <div
                        key={event.id}
                        className={`absolute p-1 text-xs rounded-sm ${priorityColors[event.priority]} overflow-hidden border border-gray-300 dark:border-gray-600`}
                        style={{
                          top,
                          height,
                          minHeight: "20px",
                          width,
                          left,
                          zIndex,
                        }}
                      >
                        <div className="font-semibold truncate">
                          {event.title}
                        </div>
                        <div className="truncate">{`${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex space-x-4">
      <div className="w-2/5">{renderDaySchedule()}</div>
      <div className="w-3/5 space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-task"
            checked={isTask}
            onCheckedChange={(checked) => setIsTask(checked as boolean)}
          />
          <Label htmlFor="is-task">タスクにする</Label>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Pencil1Icon className="w-6 h-6" />
          <Input
            placeholder="タイトルを追加"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {isTask ? (
          <DateTimeInput
            className="w-full"
            date={startTime}
            onChanged={(date) => setStartTime(date)}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <DateTimeInput
              className="w-full"
              date={startTime}
              onChanged={(date) => setStartTime(date)}
            />
            <DateTimeInput
              className="w-full"
              date={endTime}
              onChanged={(date) => setEndTime(date)}
            />
          </div>
        )}

        <div className="flex flex-row gap-2">
          <ListBulletIcon className="w-6 h-6" />
          <Textarea
            className="h-32"
            placeholder="説明を追加"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <UserPlusIcon className="text-gray-500 h-6 w-6" />
          <Input
            placeholder="招待"
            value={invitees}
            onChange={(e) => setInvitees(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <MapPinIcon className="text-gray-500 h-6 w-6" />
          <Input
            placeholder="場所または会議URLを追加"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <ViewGridIcon className="w-6 h-6" />
          <Select
            value={category}
            onValueChange={(value: Category) => setCategory(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">仕事</SelectItem>
              <SelectItem value="personal">個人</SelectItem>
              <SelectItem value="shopping">買い物</SelectItem>
              <SelectItem value="health">健康</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <AngleIcon className="w-6 h-6" />
          <Select
            value={priority}
            onValueChange={(value: Priority) => setPriority(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="重要度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="is-locked"
            checked={isLocked}
            onCheckedChange={(checked) => setIsLocked(checked as boolean)}
          />
          <Label htmlFor="is-locked">ロックする</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </div>
  );
}

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
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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

  /**
   * ハンバーガーメニューの詳細
   */
  const menuItems = [
    {
      icon: Bell,
      label: "通知",
      onClick: () => {
        return setIsNotificationsOpen(!isNotificationsOpen);
      },
    },
    { icon: Users, label: "友達", onClick: () => console.log("友達") },
    {
      icon: Download,
      label: "インポート",
      onClick: () => {
        if (auth.currentUser) {
          router.push(
            `/api/auth/google-cal?userId=${encodeURIComponent(auth.currentUser.uid)}`,
          );
        }
      },
    },
    {
      icon: LogOut,
      label: "ログアウト",
      onClick: async () => {
        await signOut();
        router.refresh();
      },
    },
  ];

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

  const addEvent = async (newEvent: Event) => {
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
    setRemovedStickyNote(null);
    if (auth.currentUser) {
      await createEvent(auth.currentUser.uid, {
        ...newEvent,
        attendees: newEvent.invitees
          .split(",")
          .map((invitee) => invitee.trim()),
        category: newEvent.category,
        priority: newEvent.priority,
        reccurence: [],
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };

  const getTodoCountForDay = (day: Date) => {
    return todos.filter((todo) => isSameDay(todo.date, day)).length;
  };

  const getEventCountForDay = (day: Date) => {
    return events.filter((event) => event.start && isSameDay(event.start, day))
      .length;
  };

  const getTaskIndicatorStyle = (todoCount: number, eventCount: number) => {
    const count = todoCount + eventCount;
    if (count === 0) return "";
    const baseColor = isDarkMode ? "bg-red-" : "bg-red-";
    const intensity = Math.min(count * 100, 900);
    const colorClass = `${baseColor}${intensity}`;
    return `${colorClass} ${count >= 3 ? "animate-pulse" : ""}`;
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weeks = Math.ceil(days.length / 7);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-7 gap-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 dark:text-gray-300 p-2"
            >
              {day}
            </div>
          ))}
        </div>
        {Array.from({ length: weeks }).map((_, weekIndex) => {
          const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7);
          const maxEventsInWeek = Math.max(
            ...weekDays.map(
              (day) => getTodoCountForDay(day) + getEventCountForDay(day),
            ),
          );
          const weekHeight =
            maxEventsInWeek > 2 ? Math.min(maxEventsInWeek * 20, 100) : "auto";

          return (
            <div
              key={weekIndex}
              className="grid grid-cols-7 gap-1"
              style={{ minHeight: "100px", height: weekHeight }}
            >
              {weekDays.map((day) => {
                const todoCount = getTodoCountForDay(day);
                const eventCount = getEventCountForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const dayItems = [
                  ...todos.filter((todo) => isSameDay(todo.date, day)),
                  ...events.filter(
                    (event) => event.start && isSameDay(event.start, day),
                  ),
                ];

                return (
                  <motion.div
                    key={day.toISOString()}
                    className={`p-1 border rounded-md cursor-pointer transition-all duration-300 overflow-hidden ${isSelected ? "border-blue-300 dark:border-blue-600" : ""} ${
                      !isCurrentMonth
                        ? "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700"
                        : ""
                    } ${getTaskIndicatorStyle(todoCount, eventCount)} hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => handleDateSelect(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add(
                        "bg-blue-100",
                        "dark:bg-blue-800",
                      );
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove(
                        "bg-blue-100",
                        "dark:bg-blue-800",
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove(
                        "bg-blue-100",
                        "dark:bg-blue-800",
                      );
                      if (draggedStickyNote) {
                        handleDateSelect(day);
                        setIsEventModalOpen(true);
                        deleteStickyNote(draggedStickyNote.id);
                      }
                    }}
                  >
                    <div className="text-right text-sm">{format(day, "d")}</div>
                    {(todoCount > 0 || eventCount > 0) && (
                      <div className="mt-1 space-y-1">
                        {dayItems.slice(0, 2).map((item, index) => (
                          <div
                            key={index}
                            className={`text-xs p-1 rounded ${"text" in item ? priorityColors[item.priority] : priorityColors[item.priority]}`}
                          >
                            {"text" in item ? item.text : item.title}
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <div className="text-xs text-center font-bold">
                            +{dayItems.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const StickyNoteItem = ({ note }: { note: StickyNote }) => (
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
  );

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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {/* CSS変更する必要あるかも */}
            <Menu className="h-6 w-6" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>設定</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Label htmlFor="dark-mode">ダークモード</Label>
            </div>
          </div>
          <nav className="mt-8">
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={item.onClick}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </Button>
                  {item.label === "通知" && isNotificationsOpen && (
                    <div className="ml-7 mt-2 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">電話番号</Label>
                        <Input id="phone" placeholder="電話番号を入力" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifications"
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                        <Label htmlFor="notifications">通知を有効にする</Label>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

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
          {renderCalendar()}
        </div>

        <div className="w-full lg:w-1/2 pl-2 bg-white dark:bg-gray-800 overflow-auto lg:block hidden">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 dark:text-white">
            付箋
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
              placeholder="付箋を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredStickyNotes.map((note) => (
                <StickyNoteItem key={note.id} note={note} />
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
                  {format(selectedDate, "yyyy年MM月dd日", { locale: ja })}の付箋
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
                    の付箋
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
                    placeholder="新しい付箋のタイトルを入力"
                    className="w-full"
                  />
                  <Button onClick={addStickyNote} className="w-full">
                    追加
                  </Button>
                  {filteredStickyNotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredStickyNotes.map((note) => (
                        <StickyNoteItem key={note.id} note={note} />
                      ))}
                    </div>
                  ) : (
                    <p className="dark:text-gray-300">
                      この日の付箋はありません。
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={!!editingStickyNote}
        onOpenChange={() => setEditingStickyNote(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>付箋を編集</DialogTitle>
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
    </div>
  );
}
