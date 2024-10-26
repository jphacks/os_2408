// src/firebase/firestore.ts
import { db } from "./client-app";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  //追加
  type WithFieldValue,
  type DocumentData,
  getDoc,
} from "firebase/firestore";

/** dataが WithFieldValue<DocumentData> を拡張するように制約を追加 */
export async function createData<T extends WithFieldValue<DocumentData>>(
  collectionName: string,
  data: T,
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function readData<T>(collectionName: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
}

export async function readSingleData<T>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as T) : null;
}

export async function updateData<T>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

export async function deleteData(
  collectionName: string,
  id: string,
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}
