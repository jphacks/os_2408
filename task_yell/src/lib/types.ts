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
