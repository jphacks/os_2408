import {
  createNotification,
  readNotification,
  readSingleNotification,
  updateNotification,
  deleteNotification,
} from "../src/lib/notifications";
import { Notification } from "../src/lib/types";
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

describe("Notification CRUD operations", () => {
  const mockNotification: Notification = {
    datetime: new Date(),
    type: "push",
    eventOrTaskRef: "mockEventId",
    userId: "mockUserId",
  };

  it("should create a notification", async () => {
    (createData as jest.Mock).mockResolvedValue("mockNotificationId");

    const notificationId = await createNotification(mockNotification);
    expect(notificationId).toBe("mockNotificationId");
    expect(createData).toHaveBeenCalledWith("notifications", mockNotification);
  });

  it("should read all notifications", async () => {
    (readData as jest.Mock).mockResolvedValue([mockNotification]);

    const notifications = await readNotification();
    expect(notifications).toEqual([mockNotification]);
    expect(readData).toHaveBeenCalledWith("notifications");
  });

  it("should read a single notification", async () => {
    (readSingleData as jest.Mock).mockResolvedValue(mockNotification);

    const notification = await readSingleNotification("mockNotificationId");
    expect(notification).toEqual(mockNotification);
    expect(readSingleData).toHaveBeenCalledWith(
      "notifications",
      "mockNotificationId",
    );
  });

  it("should update a notification", async () => {
    (updateData as jest.Mock).mockResolvedValue(undefined);

    await updateNotification("mockNotificationId", {
      eventOrTaskRef: "Updated Event ID",
    });
    expect(updateData).toHaveBeenCalledWith(
      "notifications",
      "mockNotificationId",
      {
        eventOrTaskRef: "Updated Event ID",
      },
    );
  });

  it("should delete a notification", async () => {
    (deleteData as jest.Mock).mockResolvedValue(undefined);

    await deleteNotification("mockNotificationId");
    expect(deleteData).toHaveBeenCalledWith(
      "notifications",
      "mockNotificationId",
    );
  });
});
