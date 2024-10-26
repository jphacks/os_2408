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
export async function createWantTodo(wantTodo: WantTodo): Promise<void> {
  await createData<WantTodo>(COLLECTION_NAME, wantTodo);
}

/**
 * 全WantTodoを取得
 *
 * @returns 全WantTodo
 */
export async function readWantTodos(): Promise<WantTodo[]> {
  return readData<WantTodo>(COLLECTION_NAME);
}

/**
 * 指定されたIDのWantTodoを取得します。
 *
 * @param id - 取得するイベントのID。
 * @returns 指定されたIDのWantTodo。
 */
export async function readSingleWantTodo(id: string): Promise<WantTodo | null> {
  return readSingleData<WantTodo>(COLLECTION_NAME, id);
}

/**
 * 指定されたIDのWantTodoを更新します。
 *
 * @param id 更新するイベントのID。
 * @param wantTodoData 新規WantTodoデータ。
 */
export async function updateEvent(
  id: string,
  wantTodoData: Partial<WantTodo>,
): Promise<void> {
  return updateData<WantTodo>(COLLECTION_NAME, id, wantTodoData);
}

/**
 * 指定されたIDのWantTodoを削除します。
 *
 * @param id - 削除するWantTodoのID。
 */
export async function deleteWantTodo(id: string): Promise<void> {
  return deleteData(COLLECTION_NAME, id);
}
