import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "@radix-ui/react-icons";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";

export function DateTimeInput({ className }: { className?: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4)
      .toString()
      .padStart(2, "0");
    const minutes = ((i % 4) * 15).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const handleTimeChange = (time: string) => setTime(time);

  return (
    <div className={`flex flex-row ${className}`}>
      <div className="flex flex-row items-center gap-2 w-full">
        <CalendarIcon className="text-gray-500 w-6 h-6" />
        <div className="flex flex-row w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {date
                  ? format(date, "yyyy年MM月dd日 (E)", { locale: ja })
                  : "日付を選択"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={date ?? undefined}
                onSelect={(day) => setDate(day ?? undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select
            value={"startTime"}
            onValueChange={(value) => handleTimeChange(value)}
          >
            <SelectTrigger className="flex-grow">
              <SelectValue placeholder="開始時間" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
