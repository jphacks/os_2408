import {
  createWantTodo,
  readWantTodos,
  readSingleWantTodo,
  updateWantTodo,
  deleteWantTodo,
} from "../src/lib/want-todo";
import { WantTodo } from "../src/lib/types";
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

describe("WantTodo CRUD operations", () => {
  const mockUserId = "testUserId";
  const mockWantTodo: WantTodo = {
    title: "Test WantTodo",
  };

  it("should create a wantTodo", async () => {
    (createData as jest.Mock).mockResolvedValue("mockWantTodoId");

    await createWantTodo(mockUserId, mockWantTodo);

    expect(createData).toHaveBeenCalledWith(
      `users/${mockUserId}/want-todos`,
      mockWantTodo,
    );
  });

  it("should read all wantTodos", async () => {
    (readData as jest.Mock).mockResolvedValue([mockWantTodo]);

    const wantTodo = await readWantTodos(mockUserId);
    expect(wantTodo).toEqual([mockWantTodo]);
    expect(readData).toHaveBeenCalledWith(`users/${mockUserId}/want-todos`);
  });

  it("should read a single wantTodo", async () => {
    (readSingleData as jest.Mock).mockResolvedValue(mockWantTodo);

    const wantTodo = await readSingleWantTodo(mockUserId, "mockWantTodoId");
    expect(wantTodo).toEqual(mockWantTodo);
    expect(readSingleData).toHaveBeenCalledWith(
      `users/${mockUserId}/want-todos`,
      "mockWantTodoId",
    );
  });

  it("should update a wantTodo", async () => {
    (updateData as jest.Mock).mockResolvedValue(undefined);

    await updateWantTodo(mockUserId, "mockWantTodoId", {
      title: "Updated WantTodo",
    });
    expect(updateData).toHaveBeenCalledWith(
      `users/${mockUserId}/want-todos`,
      "mockWantTodoId",
      {
        title: "Updated WantTodo",
      },
    );
  });

  it("should delete a wantTodo", async () => {
    (deleteData as jest.Mock).mockResolvedValue(undefined);

    await deleteWantTodo(mockUserId, "mockWantTodoId");
    expect(deleteData).toHaveBeenCalledWith(
      `users/${mockUserId}/want-todos`,
      "mockWantTodoId",
    );
  });
});
