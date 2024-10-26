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
export async function createTask(task: Task): Promise<void> {
  await createData(COLLECTION_NAME, task);
}

/**
 * 全タスクを取得する。
 *
 * @returns 全タスク
 */
export async function readTasks(): Promise<Task[]> {
  return readData<Task>(COLLECTION_NAME);
}

/**
 * 指定されたIDのタスクを取得する。
 *
 * @param id - 取得するタスクのID。
 * @returns 指定されたIDのタスク。
 */
export async function readSingleTask(id: string): Promise<Task | null> {
  return readSingleData<Task>(COLLECTION_NAME, id);
}

/**
 * 指定されたIDのタスクを更新する。
 *
 * @param id 更新するタスクのID
 * @param taskData 新規タスクデータ
 */
export async function updateTask(
  id: string,
  taskData: Partial<Task>,
): Promise<void> {
  await updateData<Task>(COLLECTION_NAME, id, taskData);
}

/**
 * 指定されたIDのタスクを削除します。
 *
 * @param id 削除するタスクのID。
 */
export async function deleteTask(id: string): Promise<void> {
  await deleteData(COLLECTION_NAME, id);
}
