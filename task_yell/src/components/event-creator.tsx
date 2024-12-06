"use client";

import { z } from "zod";
import { DateTimeInput } from "@/components/date-time-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Category, Priority } from "@/lib/types";
import {
  AngleIcon,
  ListBulletIcon,
  Pencil1Icon,
  ViewGridIcon,
} from "@radix-ui/react-icons";
import {
  format,
  getHours,
  isSameDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  MapPinIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { Event } from "@/components/types";
import { priorityColors } from "./priority-colors";

export function EventCreator({
  onSave,
  onCancel,
  initialTitle = "",
  targetDate,
  events,
}: {
  onSave: (
    event: Event,
    notification: { date: Date | null; type: "call" | "push" },
  ) => void;
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
  const [notificationDate, setNotificationDate] = useState<Date | null>(null);
  const [notificationType, setNotificationType] = useState<"call" | "push">(
    "call",
  );
  // Zod スキーマの定義
  const eventSchema = z.object({
    title: z.string().nonempty("タイトルは空白にできません。"),
    start: z.date(),
    end: z.date(),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.string().optional(),
    location: z.string().optional(),
    invitees: z.array(z.string()).optional(),
    isTask: z.boolean(),
    isLocked: z.boolean(),
  });


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
        // バリデーションの実行
    const result = eventSchema.safeParse(newEvent);
    if (!result.success) {
      alert(result.error.errors.map((err) => err.message).join("\n"));
      return;
    }
      onSave(newEvent, { date: notificationDate, type: notificationType });
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
        {notificationDate && (
          <>
            <div className="flex flex-row gap-2 items-center">
              <DateTimeInput
                className="w-full"
                date={notificationDate}
                onChanged={(date) => setNotificationDate(date)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="notification-type"
                checked={notificationType === "call"}
                onCheckedChange={(checked) => {
                  setNotificationType(checked ? "call" : "push");
                }}
              />
              <Label htmlFor="notification-type">電話で通知</Label>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            id="notification-enabled"
            checked={notificationDate !== null}
            onCheckedChange={(checked) => {
              if (checked) {
                setNotificationDate(startTime);
              } else {
                setNotificationDate(null);
              }
            }}
          />
          <Label htmlFor="notification-enabled">通知を有効化</Label>
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
