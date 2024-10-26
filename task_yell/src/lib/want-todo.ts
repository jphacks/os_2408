import {
  createData,
  deleteData,
  readData,
  readSingleData,
  updateData,
} from "@/firebase/firestore";
import { WantTodo } from "@/lib/types";
const COLLECTION_NAME = "want-todos";

/**
 * 新規WantTodoを作成します。
 *
 * @param wantTodo - 作成する `WantTodo` オブジェクト。
 */
export async function createWantTodo(userId: string, wantTodo: WantTodo): Promise<void> {
  await createData<WantTodo>(`users/${userId}/${COLLECTION_NAME}`, wantTodo);
}

/**
 * 全WantTodoを取得
 *
 * @returns 全WantTodo
 */
export async function readWantTodos(userId: string): Promise<WantTodo[]> {
  return readData<WantTodo>(`users/${userId}/${COLLECTION_NAME}`);
}

/**
 * 指定されたIDのWantTodoを取得します。
 *
 * @param id - 取得するイベントのID。
 * @returns 指定されたIDのWantTodo。
 */
export async function readSingleWantTodo(userId: string, id: string): Promise<WantTodo | null> {
  return readSingleData<WantTodo>(`users/${userId}/${COLLECTION_NAME}`, id);
}

/**
 * 指定されたIDのWantTodoを更新します。
 *
 * @param id 更新するイベントのID。
 * @param wantTodoData 新規WantTodoデータ。
 */
export async function updateWantTodo(
  userId: string,
  id: string,
  wantTodoData: Partial<WantTodo>,
): Promise<void> {
  return updateData<WantTodo>(`users/${userId}/${COLLECTION_NAME}`, id, wantTodoData);
}

/**
 * 指定されたIDのWantTodoを削除します。
 *
 * @param id - 削除するWantTodoのID。
 */
export async function deleteWantTodo(userId: string, id: string): Promise<void> {
  return deleteData(`users/${userId}/${COLLECTION_NAME}`, id);
}
