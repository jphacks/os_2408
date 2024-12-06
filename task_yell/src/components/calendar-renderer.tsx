"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { motion } from "framer-motion";
import { Event, Todo, StickyNote } from "@/components/types";
import { priorityColors } from "@/components/priority-colors";

type Props = {
  todos: Todo[];
  events: Event[];
  stickyNotes: StickyNote[];
  currentMonth: Date;
  selectedDate: Date;
  handleDateSelect: (date: Date) => void;
  isDarkMode: boolean;
  draggedStickyNote: StickyNote | null;
  deleteStickyNote: (id: string) => void;
  setIsEventModalOpen: (isOpen: boolean) => void;
};

function getDaysInMonth(date: Date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

function getTodoCountForDay(todos: Todo[], day: Date) {
  return todos.filter((todo) => isSameDay(todo.date, day)).length;
}

function getEventCountForDay(events: Event[], day: Date) {
  return events.filter((event) => event.start && isSameDay(event.start, day))
    .length;
}

function getTaskIndicatorStyle(
  isDarkMode: boolean,
  todoCount: number,
  eventCount: number,
) {
  const count = todoCount + eventCount;
  if (count === 0) return "";
  const baseColor = isDarkMode ? "bg-red-" : "bg-red-";
  const intensity = Math.min(count * 100, 900);
  const colorClass = `${baseColor}${intensity}`;
  return `${colorClass} ${count >= 3 ? "animate-pulse" : ""}`;
}

export function CalendarRenderer({
  todos,
  events,
  currentMonth,
  selectedDate,
  handleDateSelect,
  isDarkMode,
  draggedStickyNote,
  deleteStickyNote,
  setIsEventModalOpen,
}: Props) {
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
            (day) =>
              getTodoCountForDay(todos, day) + getEventCountForDay(events, day),
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
              const todoCount = getTodoCountForDay(todos, day);
              const eventCount = getEventCountForDay(events, day);
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
                  } ${getTaskIndicatorStyle(isDarkMode, todoCount, eventCount)} hover:bg-gray-100 dark:hover:bg-gray-700`}
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
}
