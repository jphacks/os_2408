export interface WantTodo {
  title: string;
}

export interface Event {
  title: string;
  description: string;
  attendees: string[];
  start: Date;
  end: Date;
  importance: "high" | "medium" | "low";
  location: FirebaseFirestore.GeoPoint;
  reccurence: string[];
}

export interface Task {
  title: string;
  description: string;
  due: Date;
  importance: "high" | "medium" | "low";
  reccurence: string[];
}

export interface Notification {
  datetime: Date;
  type: "call" | "push";
  eventOrTaskRef: string;
  userId: string;
}
