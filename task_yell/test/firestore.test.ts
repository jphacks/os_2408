import { GeoPoint } from "firebase/firestore";
import {
  createData,
  readData,
  readSingleData,
  updateData,
  deleteData,
} from "../src/firebase/firestore";
import {
  createEvent,
  readEvents,
  readSingleEvent,
  updateEvent,
  deleteEvent,
} from "../src/lib/events";
import { Event } from "../src/lib/types";

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

    reccurence: ["weekly"],
  };

  it("should create an event", async () => {
    (createData as jest.Mock).mockResolvedValue("mockEventId");

    const eventId = await createEvent(mockEvent);
    expect(eventId).toBe("mockEventId");
    expect(createData).toHaveBeenCalledWith("events", mockEvent);
  });

  it("should read all events", async () => {
    (readData as jest.Mock).mockResolvedValue([mockEvent]);

    const events = await readEvents();
    expect(events).toEqual([mockEvent]);
    expect(readData).toHaveBeenCalledWith("events");
  });

  it("should read a single event", async () => {
    (readSingleData as jest.Mock).mockResolvedValue(mockEvent);

    const event = await readSingleEvent("mockEventId");
    expect(event).toEqual(mockEvent);
    expect(readSingleData).toHaveBeenCalledWith("events", "mockEventId");
  });

  it("should update an event", async () => {
    (updateData as jest.Mock).mockResolvedValue(undefined);

    await updateEvent("mockEventId", { title: "Updated Event" });
    expect(updateData).toHaveBeenCalledWith("events", "mockEventId", {
      title: "Updated Event",
    });
  });

  it("should delete an event", async () => {
    (deleteData as jest.Mock).mockResolvedValue(undefined);

    await deleteEvent("mockEventId");
    expect(deleteData).toHaveBeenCalledWith("events", "mockEventId");
  });
});
