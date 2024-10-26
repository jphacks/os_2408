import { GeoPoint } from "firebase/firestore";
import {
  createEvent,
  readEvents,
  readSingleEvent,
  updateEvent,
  deleteEvent,
} from "../src/lib/events";
import { Event } from "../src/lib/types";
import {
  createData,
  readData,
  readSingleData,
  updateData,
  deleteData,
} from "../src/firebase/firestore";

// Firebase 認証をモック
jest.mock("../src/firebase/client-app", () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  },
  db: jest.fn(),
  storage: jest.fn(),
  firebaseApp: jest.fn(),
}));

jest.mock("../src/firebase/firestore", () => ({
  createData: jest.fn(),
  readData: jest.fn(),
  readSingleData: jest.fn(),
  updateData: jest.fn(),
  deleteData: jest.fn(),
}));

describe("Event CRUD operations", () => {
  const mockEvent: Event = {
    title: "Test Event",
    description: "This is a test event",
    attendees: ["test@example.com"],
    start: new Date(),
    end: new Date(),
    importance: "high",
    location: new GeoPoint(37.7749, -122.4194),
    reccurence: ["weekly"],
  };

  const mockUserId = "mockUserId";

  it("should create an event", async () => {
    (createData as jest.Mock).mockResolvedValue("mockEventId");
    (readData as jest.Mock).mockResolvedValue([]);

    const result = await createEvent(mockUserId, mockEvent);
    expect(result).toBeNull();
    expect(createData).toHaveBeenCalledWith(
      `users/${mockUserId}/events`,
      mockEvent,
    );
  });

  it("should read all events", async () => {
    (readData as jest.Mock).mockResolvedValue([mockEvent]);

    const events = await readEvents(mockUserId);
    expect(events).toEqual([mockEvent]);
    expect(readData).toHaveBeenCalledWith(`users/${mockUserId}/events`);
  });

  it("should read a single event", async () => {
    (readSingleData as jest.Mock).mockResolvedValue(mockEvent);

    const event = await readSingleEvent(mockUserId, "mockEventId");
    expect(event).toEqual(mockEvent);
    expect(readSingleData).toHaveBeenCalledWith(
      `users/${mockUserId}/events`,
      "mockEventId",
    );
  });

  it("should update an event", async () => {
    (updateData as jest.Mock).mockResolvedValue(undefined);

    await updateEvent(mockUserId, "mockEventId", { title: "Updated Event" });
    expect(updateData).toHaveBeenCalledWith(
      `users/${mockUserId}/events`,
      "mockEventId",
      {
        title: "Updated Event",
      },
    );
  });

  it("should delete an event", async () => {
    (deleteData as jest.Mock).mockResolvedValue(undefined);

    await deleteEvent(mockUserId, "mockEventId");
    expect(deleteData).toHaveBeenCalledWith(
      `users/${mockUserId}/events`,
      "mockEventId",
    );
  });
});
