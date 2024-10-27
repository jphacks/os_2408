"use client";

import { useState, useEffect } from "react";
import { format, parse, addMinutes, isBefore } from "date-fns";
import { ja } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type Event = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  isNew?: boolean;
};

type Category = "work" | "personal" | "shopping" | "health" | "other";
type Priority = "low" | "medium" | "high";

const categoryColors: Record<Category, string> = {
  work: "bg-blue-200 dark:bg-blue-800",
  personal: "bg-green-200 dark:bg-green-800",
  shopping: "bg-yellow-200 dark:bg-yellow-800",
  health: "bg-red-200 dark:bg-red-800",
  other: "bg-purple-200 dark:bg-purple-800",
};

const priorityBorders: Record<Priority, string> = {
  low: "border-l-4 border-gray-400",
  medium: "border-l-4 border-yellow-400",
  high: "border-l-4 border-red-400",
};

export default function DailyScheduleEditor({
  date = new Date(),
  initialEvents = [],
  newEvent,
}: {
  date?: Date;
  initialEvents?: Event[];
  newEvent?: Event;
}) {
  const [events, setEvents] = useState<Event[]>([
    ...initialEvents,
    ...(newEvent ? [newEvent] : []),
  ]);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsAddEventDialogOpen(true);
  };

  const handleUpdateEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.map((e) =>
        e.id === editingEvent.id ? editingEvent : e
      );
      setEvents(updatedEvents);
      setEditingEvent(null);
      setIsAddEventDialogOpen(false);
    }
  };

  const handleDeleteEvent = (id: number) => {
    const updatedEvents = events.filter((e) => e.id !== id);
    setEvents(updatedEvents);
  };

  const isOverlapping = (event: Event) => {
    return events.some(
      (e) =>
        e.id !== event.id &&
        ((event.start >= e.start && event.start < e.end) ||
          (event.end > e.start && event.end <= e.end) ||
          (event.start <= e.start && event.end >= e.end))
    );
  };

  const getEventStyle = (
    event: Event,
    index: number,
    overlappingCount: number
  ) => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    const duration = endMinutes - startMinutes;
    const top = (startMinutes / 1440) * 100; // 1440 minutes in a day
    const height = (duration / 1440) * 100;

    // 配置スタイル：重複イベントのインデックスによって左右に分ける
    const width = overlappingCount > 1 ? `${100 / overlappingCount}%` : "100%";
    const left = `${(index % overlappingCount) * (100 / overlappingCount)}%`;

    return {
      top: `${top}%`,
      height: `${height}%`,
      left,
      width,
    };
  };

  const renderEvents = () => {
    const sortedEvents = [...events].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    const renderedEvents: JSX.Element[] = [];

    sortedEvents.forEach((event, index) => {
      const overlappingEvents = sortedEvents.filter(
        (e) => isOverlapping(event) && e.id !== event.id
      );
      const overlappingCount = overlappingEvents.length + 1;
      const style = getEventStyle(event, index, overlappingCount);

      renderedEvents.push(
        <motion.div
          key={event.id}
          className={`absolute p-1 text-xs rounded border border-white ${isOverlapping(event) ? "bg-red-500" : "bg-blue-500"} text-white`}
          style={style}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => handleEditEvent(event)}
        >
          <div className="font-semibold">{event.title}</div>
          <div>
            {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
          </div>
        </motion.div>
      );
    });

    return renderedEvents;
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateEventCheck = () => {
    if (!editingEvent?.start || !editingEvent?.end) {
      setErrorMessage("数値が入力されていません");
      return;
    }
    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id ? editingEvent : e
    );
    setEvents(updatedEvents);
    setEditingEvent(null);
    setIsAddEventDialogOpen(false);
    setErrorMessage(null);
  };

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold dark:text-white">
          {format(date, "yyyy年MM月dd日 (EEEE)", { locale: ja })}
        </h2>
        <Button variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative h-[1440px]">
        {" "}
        {/* 1440px = 24 hours * 60px per hour */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute w-full h-[60px]"
            style={{ top: `${(hour / 24) * 100}%` }}
          >
            <div className="absolute left-0 -mt-3 w-16 text-right pr-2 text-sm text-gray-500 dark:text-gray-400">
              {`${hour.toString().padStart(2, "0")}:00`}
            </div>
            <div className="ml-16 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
        {renderEvents()}
      </div>

      <Dialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "予定を編集" : "新しい予定を追加"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">タイトル</Label>
              <Input
                id="event-title"
                value={editingEvent?.title || ""}
                onChange={(e) =>
                  editingEvent &&
                  setEditingEvent({ ...editingEvent, title: e.target.value })
                }
                placeholder="予定のタイトル"
              />
            </div>
            <div>
              <div>
                <Label htmlFor="event-start">開始時間</Label>
                <Input
                  id="event-start"
                  type="time"
                  value={
                    editingEvent?.start
                      ? format(editingEvent.start, "HH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    if (editingEvent) {
                      const timeValue = e.target.value;
                      if (!timeValue) return; // 入力がクリアされた場合、処理を中断
                      const [hours, minutes] = timeValue.split(":").map(Number);
                      const newDate = new Date(editingEvent.start);
                      newDate.setHours(hours, minutes);
                      setEditingEvent({ ...editingEvent, start: newDate });
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="event-end">終了時間</Label>
                <Input
                  id="event-end"
                  type="time"
                  value={
                    editingEvent?.end ? format(editingEvent.end, "HH:mm") : ""
                  }
                  onChange={(e) => {
                    if (editingEvent) {
                      const timeValue = e.target.value;
                      if (!timeValue) return; // 入力がクリアされた場合、処理を中断
                      const [hours, minutes] = timeValue.split(":").map(Number);
                      const newDate = new Date(editingEvent.end);
                      newDate.setHours(hours, minutes);
                      setEditingEvent({ ...editingEvent, end: newDate });
                    }
                  }}
                />
              </div>
              <div className="flex justify-between">
                <Button onClick={handleUpdateEventCheck}>
                  {editingEvent?.isNew ? "追加" : "更新"}
                </Button>
                {!editingEvent?.isNew && (
                  <Button
                    variant="destructive"
                    onClick={() =>
                      editingEvent && handleDeleteEvent(editingEvent.id)
                    }
                  >
                    削除
                  </Button>
                )}
              </div>
              {errorMessage && (
                <p className="text-red-500 mt-2">{errorMessage}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
