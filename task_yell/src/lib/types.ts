export type Priority = "low" | "medium" | "high";
export type Category = "work" | "personal" | "shopping" | "health" | "other";

export interface WantTodo {
  id: string;
  title: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  attendees: string[];
  start: Date | null;
  end: Date | null;
  priority: Priority | null;
  category: Category | null;
  location: string | null;
  reccurence: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due: Date;
  importance: "high" | "medium" | "low";
  reccurence: string[];
  priority: Priority | null;
  category: Category | null;
}

export interface Notification {
  id: string;
  datetime: Date;
  type: "call" | "push";
  eventOrTaskRef: string;
  userId: string;
}
