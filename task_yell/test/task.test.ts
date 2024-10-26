import {
  createTask,
  readTasks,
  readSingleTask,
  updateTask,
  deleteTask,
} from "@/lib/tasks";
import { Task } from "@/lib/types";
import {
  createData,
  readData,
  readSingleData,
  updateData,
  deleteData,
} from "@/firebase/firestore";

// Firebase 認証をモック
jest.mock("@/firebase/client-app", () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  },
  db: jest.fn(),
  storage: jest.fn(),
  firebaseApp: jest.fn(),
}));

jest.mock("@/firebase/firestore", () => ({
  createData: jest.fn(),
  readData: jest.fn(),
  readSingleData: jest.fn(),
  updateData: jest.fn(),
  deleteData: jest.fn(),
}));

describe("Task CRUD operations", () => {
  const mockTask: Task = {
    title: "Test Task",
    description: "This is a test task",
    due: new Date(),
    importance: "high",
    reccurence: ["weekly"],
  };

  const mockUserId = "mockUserId";

  it("should create a task", async () => {
    (createData as jest.Mock).mockResolvedValue("mockTaskId");

    await createTask(mockUserId, mockTask);
    expect(createData).toHaveBeenCalledWith(
      `users/${mockUserId}/tasks`,
      mockTask
    );
  });

  it("should read all tasks", async () => {
    (readData as jest.Mock).mockResolvedValue([mockTask]);

    const tasks = await readTasks(mockUserId);
    expect(tasks).toEqual([mockTask]);
    expect(readData).toHaveBeenCalledWith(`users/${mockUserId}/tasks`);
  });

  it("should read a single task", async () => {
    (readSingleData as jest.Mock).mockResolvedValue(mockTask);

    const task = await readSingleTask(mockUserId, "mockTaskId");
    expect(task).toEqual(mockTask);
    expect(readSingleData).toHaveBeenCalledWith(
      `users/${mockUserId}/tasks`,
      "mockTaskId"
    );
  });

  it("should update a task", async () => {
    (updateData as jest.Mock).mockResolvedValue(undefined);

    await updateTask(mockUserId, "mockTaskId", { title: "Updated Task" });
    expect(updateData).toHaveBeenCalledWith(
      `users/${mockUserId}/tasks`,
      "mockTaskId",
      {
        title: "Updated Task",
      }
    );
  });

  it("should delete a task", async () => {
    (deleteData as jest.Mock).mockResolvedValue(undefined);

    await deleteTask(mockUserId, "mockTaskId");
    expect(deleteData).toHaveBeenCalledWith(
      `users/${mockUserId}/tasks`,
      "mockTaskId"
    );
  });
});
