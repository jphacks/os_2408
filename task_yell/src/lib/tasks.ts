import {
  createData,
  deleteData,
  readData,
  readSingleData,
  updateData,
} from "@/firebase/firestore";
import { Task } from "@/lib/types";
const COLLECTION_NAME = "tasks";

/**
 * 指定されたTaskを作成する。
 * Eventと違い、競合が発生しない。
 *
 * @param task 作成されるタスク
 */
export async function createTask(userId: string, task: Task): Promise<void> {
  await createData(`users/${userId}/${COLLECTION_NAME}`, task);
}

/**
 * 全タスクを取得する。
 *
 * @returns 全タスク
 */
export async function readTasks(userId: string): Promise<Task[]> {
  return readData<Task>(`users/${userId}/${COLLECTION_NAME}`);
}

/**
 * 指定されたIDのタスクを取得する。
 *
 * @param id - 取得するタスクのID。
 * @returns 指定されたIDのタスク。
 */
export async function readSingleTask(
  userId: string,
  id: string,
): Promise<Task | null> {
  return readSingleData<Task>(`users/${userId}/${COLLECTION_NAME}`, id);
}

/**
 * 指定されたIDのタスクを更新する。
 *
 * @param id 更新するタスクのID
 * @param taskData 新規タスクデータ
 */
export async function updateTask(
  userId: string,
  id: string,
  taskData: Partial<Task>,
): Promise<void> {
  await updateData<Task>(`users/${userId}/${COLLECTION_NAME}`, id, taskData);
}

/**
 * 指定されたIDのタスクを削除します。
 *
 * @param id 削除するタスクのID。
 */
export async function deleteTask(userId: string, id: string): Promise<void> {
  await deleteData(`users/${userId}/${COLLECTION_NAME}`, id);
}
