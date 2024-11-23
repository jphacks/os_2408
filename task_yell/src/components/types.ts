import { Category, Priority } from "@/lib/types";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  priority: Priority;
  category: Category;
};

export type Event = {
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

export type StickyNote = {
  id: string;
  title: string;
};
