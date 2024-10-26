import { GeoPoint } from "firebase/firestore";
import {
  createEvent,
  readEvents,
  readSingleEvent,
  updateEvent,
  deleteEvent,
} from "../src/lib/events";
import { Event } from "../src/lib/types";

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

  it("should create an event", async () => {
    const { createData } = require("../src/firebase/firestore");
    (createData as jest.Mock).mockResolvedValue("mockEventId");

    const eventId = await createEvent(mockEvent);
    expect(eventId).toBe("mockEventId");
    expect(createData).toHaveBeenCalledWith("events", mockEvent);
  });

  it("should read all events", async () => {
    const { readData } = require("../src/firebase/firestore");
    (readData as jest.Mock).mockResolvedValue([mockEvent]);

    const events = await readEvents();
    expect(events).toEqual([mockEvent]);
    expect(readData).toHaveBeenCalledWith("events");
  });

  it("should read a single event", async () => {
    const { readSingleData } = require("../src/firebase/firestore");
    (readSingleData as jest.Mock).mockResolvedValue(mockEvent);

    const event = await readSingleEvent("mockEventId");
    expect(event).toEqual(mockEvent);
    expect(readSingleData).toHaveBeenCalledWith("events", "mockEventId");
  });

  it("should update an event", async () => {
    const { updateData } = require("../src/firebase/firestore");
    (updateData as jest.Mock).mockResolvedValue(undefined);

    await updateEvent("mockEventId", { title: "Updated Event" });
    expect(updateData).toHaveBeenCalledWith("events", "mockEventId", {
      title: "Updated Event",
    });
  });

  it("should delete an event", async () => {
    const { deleteData } = require("../src/firebase/firestore");
    (deleteData as jest.Mock).mockResolvedValue(undefined);

    await deleteEvent("mockEventId");
    expect(deleteData).toHaveBeenCalledWith("events", "mockEventId");
  });
});
