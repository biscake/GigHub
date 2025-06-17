import type { StoredMessage } from "../types/chat";
import type { EncryptedE2EEKeyWithSalt, StoredE2EEEntry } from "../types/crypto";

const indexedDB = window.indexedDB;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("gighub-db", 1);

      request.onerror = () => {
        reject(request.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("keys")) {
          db.createObjectStore("keys", { keyPath: "userId" });
        }

        if (!db.objectStoreNames.contains("chat-history")) {
          db.createObjectStore("chat-history", { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        db.onclose = () => {
          dbPromise = null;
        };

        resolve(db);
      };
    });
  }

  return dbPromise;
}

export const updateEncryptedE2eeKey = async (userId: number, key: EncryptedE2EEKeyWithSalt): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");

  return new Promise((resolve, reject) => {
    const getRequest = store.get(userId);

    getRequest.onsuccess = () => {
      const data: StoredE2EEEntry = getRequest.result;

      if (data) {
        data.encryptedPrivateKey = key.encryptedPrivateKey;
        data.iv = key.iv;
        data.salt = key.salt;

        const updateRequest = store.put(data)
        
        updateRequest.onsuccess = () => {
          console.log("Encrypted e2ee key updated");
          resolve();
        }

        updateRequest.onerror = () => {
          console.log("Failed to update encrypted e2ee key in indexedDB");
          reject(updateRequest.error);
        }
      }
    }

    getRequest.onerror = () => {
      console.log("Error retrieving entries from indexedDB");
      reject(getRequest.error);
    }
  })
}

export const getEncryptedE2eeEntry = async (userId: number): Promise<StoredE2EEEntry> => {
  const db = await getDB();
  const transaction = db.transaction("keys");
  const store = transaction.objectStore("keys");

  return new Promise((resolve, reject) => {
    const request = store.get(userId);

    request.onerror = () => {
      console.error("Failed to get entry from indexedDB");
      reject(request.error);
    }

    request.onsuccess = () => {
      console.log("Successfully retrieved encrypted e2ee key from indexedDB");
      const data: StoredE2EEEntry = request.result;

      resolve(data);
    }
  })
} 

export const deleteEncryptedE2eeKey = async (userId: number): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");

  return new Promise((resolve, reject) => {
    const getRequest = store.get(userId);

    getRequest.onsuccess = () => {
      const data: StoredE2EEEntry = getRequest.result;

      if (!data) {
        resolve();
      };

      const deleteRequest = store.put({
        ...data,
        encryptedPrivateKey: null,
        iv: null,
        keySalt: null
      })

      deleteRequest.onsuccess = () => {
        console.log("Encrypted E2EE key successfully deleted from indexedDB");
        resolve();
      }

      deleteRequest.onerror = () => {
        console.log("Failed to delete encrypted E2EE key fom indexedDB");
        reject(deleteRequest.error);
      }
    };

    getRequest.onerror = () => {
      console.log("Failed to retrieve entries from indexedDB");
      reject(getRequest.error);
    }
  })
}

export const storeEncryptedE2eeKey = async (data: StoredE2EEEntry): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");
  
  return new Promise((resolve, reject) => {
    const request = store.put(data);

    request.onsuccess = () => {
      console.log("E2EE entry successfully stored in indexedDB");
      resolve();
    }

    request.onerror = () => {
      console.log("Failed to store E2EE entry in indexedDB");
      reject();
    }
  })
}

export const addChatMessage = async (message: StoredMessage): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("chat-history", "readwrite");
  const store = transaction.objectStore("chat-history");

  return new Promise((resolve, reject) => {
    const request = store.put(message);

    request.onsuccess = () => {
      console.log("Chat message successfully stored in indexedDB");
      resolve();
    }

    request.onerror = () => {
      console.log("Failed to store chat message in indexedDB");
      reject();
    }
  })
}

export const getChatMessagesForUser = async (userId: number): Promise<StoredMessage[]> => {
  const db = await getDB();
  const transaction = db.transaction("chat-history", "readwrite");
  const store = transaction.objectStore("chat-history");
  const index = store.index("localUserId");

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.only(userId));

    request.onsuccess = () => {
      console.log("Get messages for user successfully");
      resolve(request.result);
    }

    request.onerror = () => {
      console.log("Failed to get messages for user");
      reject(request.error);
    }
  })
}

export const clearChatMessages = async (): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("chat-history", "readwrite");
  const store = transaction.objectStore("chat-history");

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => {
      console.log("Chat messages cleared successfully");
      resolve();
    }

    request.onerror = () => {
      console.log("Failed to clear chat messages");
      reject(request.error);
    }
  })
}