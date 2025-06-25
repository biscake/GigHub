import type { StoredConversationMeta, StoredMessage } from "../types/chat";
import type { EncryptedE2EEKeyWithSalt, StoredE2EEEntry, StoredE2EEPublicKey } from "../types/crypto";

const indexedDB = window.indexedDB;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("gighub-db", 3);

      request.onerror = () => {
        reject(request.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains("keys")) {
          db.createObjectStore("keys", { keyPath: "userId" });
        }

        if (!db.objectStoreNames.contains("chat-history")) {
          const chatHistoryStore = db.createObjectStore("chat-history", { keyPath: "id" });
          chatHistoryStore.createIndex("localUserId_conversationId_sentAt", ["localUserId", "conversationKey", "sentAt"], { unique: false });
        }

        if (!db.objectStoreNames.contains("public-keys")) {
          const publicKeysStore = db.createObjectStore("public-keys", { keyPath: ["userId", "deviceId"] });
          publicKeysStore.createIndex("userId", "userId", { unique: false });
          publicKeysStore.createIndex("userId-deviceId", ["userId", "deviceId"], { unique: true });
        }

        if (!db.objectStoreNames.contains("conversation-meta")) {
          const convoStore = db.createObjectStore("conversation-meta", { keyPath: ["conversationKey", "localUserId"] });
          convoStore.createIndex("localUserId", "localUserId");
        }

        if (!db.objectStoreNames.contains("chat-meta")) {
          db.createObjectStore("chat-meta");
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

export const updateEncryptedE2EEKey = async (userId: number, key: EncryptedE2EEKeyWithSalt): Promise<void> => {
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

export const getEncryptedE2EEEntry = async (userId: number): Promise<StoredE2EEEntry> => {
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

export const storeEncryptedE2EEKey = async (data: StoredE2EEEntry): Promise<void> => {
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

export const storeChatMessages = async (messages: StoredMessage[]): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("chat-history", "readwrite");
  const store = transaction.objectStore("chat-history");

  return new Promise((resolve, reject) => {
    for (const message of messages) {
      store.put(message);
    }

    transaction.oncomplete = () => {
      console.log("All chat messages successfully stored in IndexedDB");
      resolve();
    };

    transaction.onerror = () => {
      console.log("Failed to store one or more chat messages in IndexedDB");
      reject(transaction.error);
    };
  })
}

export const getMessagesBefore = async (userId: number, targetUserId: number, beforeDateISOString: string, limit: number = 30): Promise<StoredMessage[]> => {
  const conversationKey = `${userId}-${targetUserId}`
  const db = await getDB();
  const tx = db.transaction("chat-history", "readonly");
  const store = tx.objectStore("chat-history");
  const index = store.index("localUserId_conversationId_sentAt");

  const messages: StoredMessage[] = [];

  const range = IDBKeyRange.bound(
    [userId, conversationKey, ""],
    [userId, conversationKey, beforeDateISOString],
    false,
    true
  );

  index.openCursor(range, "prev").onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
    if (cursor && messages.length < limit) {
      messages.push(cursor.value);
      cursor.continue();
    }
  };

  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(messages);
  });
}

export const getMessagesByPage = async (localUserId: number, conversationKey: string, offset = 0, pageSize: number = 30): Promise<StoredMessage[]> => {
  if (pageSize <= 0) throw new Error("Invalid page size");

  const db = await getDB();
  const tx = db.transaction("chat-history", "readonly");
  const store = tx.objectStore("chat-history");
  const index = store.index("localUserId_conversationId_sentAt");

  const messages: StoredMessage[] = [];
  const range = IDBKeyRange.bound(
    [localUserId, conversationKey, ''],
    [localUserId, conversationKey, '\uffff'],
    false,
    false
  );

  return new Promise((resolve, reject) => {
    const request = index.openCursor(range, "prev");
    let skipped = false;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
  
      if (!cursor) {
        resolve(messages);
        return;
      }

      if (!skipped && offset > 0) {
        skipped = true;
        cursor.advance(offset);
        return;
      } 

      messages.push(cursor.value);

      if (messages.length >= pageSize) {
        resolve(messages);
        return;
      }

      cursor.continue();
    }

    request.onerror = () => {
      console.error("Failed to get messages by page");
      reject(request.error);
    }
  })
}

export const updateMessageReadAt = async (messageId: string, readAtISOString: string): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("chat-history", "readwrite");
  const store = transaction.objectStore("chat-history");

  return new Promise((resolve, reject) => {
    const getRequest = store.get(messageId);
    getRequest.onsuccess = () => {
      const updateRequest = store.put({
        ...getRequest.result,
        readAt: new Date(readAtISOString)
      })

      updateRequest.onsuccess = () => {
        console.log(`ReadAt for message ${messageId} updated`);
        resolve();
      }

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      }
    };

    getRequest.onerror = () => {
      reject(getRequest.error)
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

export const storeConversationMeta = async (meta: StoredConversationMeta): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("conversation-meta", "readwrite");
  const store = transaction.objectStore("conversation-meta");

  return new Promise((resolve, reject) => {
    const request = store.put(meta);

    request.onsuccess = () => {
      console.log("Conversation meta saved successfully");
      resolve();
    }

    request.onerror = () => {
      console.log("Failed to save conversation meta chat messages");
      reject(request.error);
    }
  })
}

export const getConversationMeta = async (fromUserId: number, toUserId: number): Promise<StoredConversationMeta | undefined> => {
  const conversationKey = `${fromUserId}-${toUserId}`;
  const db = await getDB();
  const transaction = db.transaction("conversation-meta");
  const store = transaction.objectStore("conversation-meta");
  const index = store.index("localUserId");
  const range = IDBKeyRange.only(fromUserId);

  return new Promise((resolve) => {
    const request = index.openCursor(range);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        resolve(undefined);
        return;
      }

      if (cursor.value.conversationKey === conversationKey) {
        resolve(cursor.value);
        return;
      }

      cursor.continue();
    };

    request.onerror = () => {
      resolve(undefined);
    };
  });
}

export const getAllConversationMeta = async (): Promise<StoredConversationMeta[]> => {
  const db = await getDB();
  const transaction = db.transaction("conversation-meta");
  const store = transaction.objectStore("conversation-meta");
  const index = store.index("localUserId");
  const result: StoredConversationMeta[] = [];

  return new Promise((resolve) => {
    const request = index.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        resolve(result);
        return;
      }

      result.push(cursor.value);

      cursor.continue();
    };

    request.onerror = () => {
      resolve([]);
    };
  });
}

export const clearConversationMeta = async (): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("conversation-meta", "readwrite");
  const store = transaction.objectStore("conversation-meta");

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const updateAllConversationMetaSyncDate = async (dateISOString: string): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("conversation-meta", "readwrite");
  const store = transaction.objectStore("conversation-meta");

  return new Promise((resolve, reject) => {
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        resolve();
        return;
      }

      const value = cursor.value;
      value.lastSyncedAt = dateISOString;
      const updateRequest = cursor.update(value);

      updateRequest.onsuccess = () => {
        cursor.continue();
      };

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      };
    };
  })
}

export const storeE2EEPublicKey = async (data: StoredE2EEPublicKey): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("public-keys", "readwrite");
  const store = transaction.objectStore("public-keys");
  
  return new Promise((resolve, reject) => {
    const request = store.put(data);

    request.onsuccess = () => {
      console.log("E2EE public key successfully stored in indexedDB");
      resolve();
    }

    request.onerror = () => {
      console.log("Failed to store E2EE public key in indexedDB");
      reject(request.error);
    }
  })
}

export const getAllUserE2EEPublicKeys = async (userId: number): Promise<StoredE2EEPublicKey[]> => {
  const db = await getDB();
  const transaction = db.transaction("public-keys");
  const store = transaction.objectStore("public-keys");
  const index = store.index("userId");
  const range = IDBKeyRange.only(userId);

  return new Promise((resolve, reject) => {
    const request = index.getAll(range);
    request.onsuccess = () => {
      resolve(request.result as StoredE2EEPublicKey[]);
    };

    request.onerror = () => {
      reject(request.error);
    }
  })
}

export const getUserDeviceE2EEPublicKey = async (userId: number, deviceId: string): Promise<StoredE2EEPublicKey | null> => {
  const db = await getDB();
  const transaction = db.transaction("public-keys");
  const store = transaction.objectStore("public-keys");
  const index = store.index("userId-deviceId");
  const range = IDBKeyRange.only([userId, deviceId]);

  return new Promise((resolve) => {
    const request = index.get(range);
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      resolve(null);
    }
  })
}

export const setGlobalSyncMeta = async (dateISOString: string): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("chat-meta", "readwrite");
  const store = transaction.objectStore("chat-meta");

  return new Promise((resolve, reject) => {
    const request = store.put(dateISOString, "lastSyncedAt");

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const getGlobalSyncMeta = async (): Promise<string> => {
  const db = await getDB();
  const transaction = db.transaction("chat-meta");
  const store = transaction.objectStore("chat-meta");

  return new Promise((resolve, reject) => {
    const request = store.get("lastSyncedAt");

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const clearGlobalChatMeta = async (): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction("chat-meta", "readwrite");
  const store = transaction.objectStore("chat-meta");

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const clearUserData = async (): Promise<void> => {
  await clearChatMessages();
  await clearConversationMeta();
  await clearGlobalChatMeta();
}