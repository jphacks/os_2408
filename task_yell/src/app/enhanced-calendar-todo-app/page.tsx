"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, CalendarIcon, ChevronLeft, ChevronRight, Edit, Trash2, MapPinIcon, UserPlusIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isToday, isFuture, parseISO, getHours } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Priority = "low" | "medium" | "high";
type Category = "work" | "personal" | "shopping" | "health" | "other";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  date: Date;
  priority: Priority;
  category: Category;
};

type Event = {
  id: number;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  category: Category;
  priority: Priority;
  start: Date;
  end: Date;
  location: string;
  invitees: string;
  isTask: boolean;
  isLocked: boolean;
};

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-100 dark:bg-blue-900",
  medium: "bg-yellow-100 dark:bg-yellow-900",
  high: "bg-red-100 dark:bg-red-900",
};

const categoryIcons: Record<Category, JSX.Element> = {
  work: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
  ),
  personal: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  shopping: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  ),
  health: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  other: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

function EventCreator({ onSave, onCancel }: { onSave: (event: Event) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [location, setLocation] = useState("");
  const [invitees, setInvitees] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isTask, setIsTask] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4)
      .toString()
      .padStart(2, "0");
    const minutes = ((i % 4) * 15).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  const handleTimeChange = (time: string, isStart: boolean) => {
    if (isStart) {
      setStartTime(time);
      // 終了時間を自動的に1時間後に設定
      const [hours, minutes] = time.split(":").map(Number);
      const endDate = new Date(2000, 0, 1, hours + 1, minutes);
      setEndTime(format(endDate, "HH:mm"));
    } else {
      setEndTime(time);
    }
  };

  const handleSave = () => {
    if (date) {
      const newEvent: Event = {
        id: Date.now(),
        title,
        description,
        date,
        startTime,
        endTime,
        category,
        priority,
        start: new Date(`${format(date, "yyyy-MM-dd")}T${startTime}`),
        end: new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`),
        location,
        invitees,
        isTask,
        isLocked,
      };
      onSave(newEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="is-task" checked={isTask} onCheckedChange={(checked) => setIsTask(checked as boolean)} />
        <Label htmlFor="is-task">タスクにする</Label>
      </div>

      <Input placeholder="タイトルを追加" value={title} onChange={(e) => setTitle(e.target.value)} />

      {!isTask && (
        <>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="text-gray-500" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{date ? format(date, "yyyy年MM月dd日 (E)", { locale: ja }) : "日付を選択"}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={startTime} onValueChange={(value) => handleTimeChange(value, true)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="開始時間" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>-</span>
            <Select value={endTime} onValueChange={(value) => handleTimeChange(value, false)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="終了時間" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea placeholder="説明を追加" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="flex items-center space-x-2">
            <UserPlusIcon className="text-gray-500" />
            <Input placeholder="招待" value={invitees} onChange={(e) => setInvitees(e.target.value)} />
          </div>

          <div className="flex items-center space-x-2">
            <MapPinIcon className="text-gray-500" />
            <Input placeholder="場所または会議URLを追加" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
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

          <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="重要度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-locked" checked={isLocked} onCheckedChange={(checked) => setIsLocked(checked as boolean)} />
            <Label htmlFor="is-locked">ロックする</Label>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
}

export default function page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todoDate, setTodoDate] = useState<Date>(selectedDate);
  const [selectedDateTodos, setSelectedDateTodos] = useState<Todo[]>([]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("other");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEffect(() => {
    const filteredTodos = todos.filter((todo) => isSameDay(todo.date, selectedDate));
    setSelectedDateTodos(filteredTodos);
  }, [selectedDate, todos]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTodo = (id: number) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    setTodos(updatedTodos);
    if (selectedDate) {
      const updatedSelectedDateTodos = selectedDateTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
      setSelectedDateTodos(updatedSelectedDateTodos);
    }
  };

  const editTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const deleteTodo = (id: number) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    setSelectedDateTodos(selectedDateTodos.filter((todo) => todo.id !== id));
  };

  const addEvent = (newEvent: Event) => {
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getTodoCountForDay = (day: Date) => {
    return todos.filter((todo) => isSameDay(todo.date, day)).length;
  };

  const getEventCountForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.start, day)).length;
  };

  const getTaskIndicatorStyle = (todoCount: number, eventCount: number) => {
    const count = todoCount + eventCount;
    if (count === 0) return "";
    const baseColor = isDarkMode ? "bg-red-" : "bg-red-";
    const intensity = Math.min(count * 100, 900);
    const colorClass = `${baseColor}${intensity}`;
    if (count >= 3) {
      return `${colorClass} animate-bounce shadow-lg`;
    }
    return colorClass;
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(days[0]);

    return (
      <div className="grid grid-cols-7 gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-300 p-2">
            {day}
          </div>
        ))}
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}
        {days.map((day) => {
          const todoCount = getTodoCountForDay(day);
          const eventCount = getEventCountForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <motion.div
              key={day.toISOString()}
              className={`p-2 border rounded-md cursor-pointer transition-all duration-300 ${isSelected ? "border-blue-300 dark:border-blue-600" : ""} ${
                !isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""
              } ${getTaskIndicatorStyle(todoCount, eventCount)} hover:bg-gray-100 dark:hover:bg-gray-700`}
              onClick={() => handleDateSelect(day)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">{format(day, "d")}</div>
              {(todoCount > 0 || eventCount > 0) && <div className="text-xs text-center mt-1 font-bold">{todoCount + eventCount}</div>}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTodoDate(date);
    setIsEventModalOpen(true);
  };

  const TodoItem = ({ todo }: { todo: Todo }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center p-2 rounded ${todo.completed ? "bg-gray-200 dark:bg-gray-700" : priorityColors[todo.priority]} transition-colors duration-200`}
    >
      <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
      <label htmlFor={`todo-${todo.id}`} className={`ml-2 flex-grow ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
        {todo.text}
      </label>
      <div className="flex items-center space-x-2">
        {categoryIcons[todo.category]}
        <span className="text-sm text-gray-500 dark:text-gray-400">{format(todo.date, "yyyy/MM/dd", { locale: ja })}</span>
        <Button variant="ghost" size="icon" onClick={() => editTodo(todo)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  const EventItem = ({ event }: { event: Event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center p-2 rounded ${priorityColors[event.priority]} transition-colors duration-200`}
    >
      <div className="flex-grow">
        <h4 className="font-semibold">{event.title}</h4>
        {!event.isTask && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              {categoryIcons[event.category]}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} - {format(event.end, "HH:mm", { locale: ja })}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => todo.text.toLowerCase().includes(searchTerm.toLowerCase()) || format(todo.date, "yyyy/MM/dd").includes(searchTerm));
  }, [todos, searchTerm]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase()) || format(event.start, "yyyy/MM/dd").includes(searchTerm)
    );
  }, [events, searchTerm]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => b.start.getTime() - a.start.getTime());
  }, [filteredEvents]);

  const recentTodos = todos
    .filter((todo) => isToday(todo.date) || isFuture(todo.date))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className={`relative h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      {/* ハンバーガーメニューとその中身 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="h-6 w-6" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>設定</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Label htmlFor="dark-mode">ダークモード</Label>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col lg:flex-row h-full pt-20 px-4">
        {/* 以下divタグが全体ページ左側 */}
        <div className="w-full lg:w-1/2 pr-2 overflow-auto">
          <div className="mb-4 flex justify-between items-center">
            {/* カレンダーを先月に移動するボタン */}
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* 現在表示中の月 */}
            <h2 className="text-xl lg:text-2xl font-bold dark:text-white">{format(currentMonth, "yyyy年MM月", { locale: ja })}</h2>

            {/* カレンダーを次月にするボタン */}
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* カレンダーをレンダリング */}
          {renderCalendar()}
        </div>

        {/* 以下divタグが全体ページ右側 */}
        <div className="w-full lg:w-1/2 pl-2 bg-white dark:bg-gray-800 overflow-auto lg:block hidden">
          <h3 className="text-lg font-semibold mt-8 mb-4 dark:text-white">イベント</h3>
          <AnimatePresence>
            {sortedEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </AnimatePresence>
        </div>

        {/* 以下のdivタグ部分はスマホ画面のみ表示 */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:hidden">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">直近のTODO</h3>
          {recentTodos.length > 0 ? (
            <ul className="space-y-2">
              {recentTodos.map((todo) => (
                <li key={todo.id}>
                  <TodoItem todo={todo} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="dark:text-gray-300">直近のTODOはありません。</p>
          )}
        </div>
      </div>

      {/* 以下、カレンダーの日を押した時に出るダイアログ。 */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{format(selectedDate, "yyyy年MM月dd日", { locale: ja })}の予定</DialogTitle>
          </DialogHeader>
          <EventCreator onSave={addEvent} onCancel={() => setIsEventModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
