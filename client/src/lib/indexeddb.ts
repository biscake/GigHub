import type { EncryptedE2eeKey } from "../types/crypto";

const indexedDB = window.indexedDB;

let db: IDBDatabase;

const request = indexedDB.open("GigHubDatabase", 1);

request.onerror = (error) => {
  console.error("An error occurred with IndexedDB");
  console.error(error);
}

request.onupgradeneeded = () => {
  const db = request.result;

  db.createObjectStore("keys", { keyPath: 'id' });
}

request.onsuccess = () => {
  db = request.result;
  console.log("IndexedDB connected");
}

export const storeEncryptedE2eeKey = (key: EncryptedE2eeKey): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readwrite");
    const store = transaction.objectStore("keys");

    const request = store.put({
      id: 'e2ee-private-key',
      key: key
    })

    request.onsuccess = () => {
      console.log("Encrypted e2ee key added to indexedDB");
      resolve();
    }

    request.onerror = () => {
      console.log("Failed to store encrypted e2ee key in indexedDB");
      reject(request.error);
    }
  })
}

export const retrieveEncryptedE2eeKey = (): Promise<EncryptedE2eeKey> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys");
    const store = transaction.objectStore("keys");

    const request = store.get("e2ee-private-key");

    request.onerror = () => {
      console.error("Failed to get encrypted e2ee key from indexedDB");
      reject(request.error);
    }

    request.onsuccess = () => {
      console.log("Successfully retrieved encrypted e2ee key from indexedDB");
      resolve(request.result);
    }
  })
} 

export const deleteEncryptedE2eeKey = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = db
    .transaction(["keys"], "readwrite")
    .objectStore("keys")
    .delete("e2ee-private-key");
    request.onsuccess = () => {
      console.log("Encrypted e2ee key successfully deleted from indexedDB");
      resolve();
    };

    request.onerror = () => {
      console.log("Failed to delete encrypted e2ee key from indexedDB");
      reject(request.error);
    }
  })
}