
import type { Anime, MyListItem, ListStatus, OngoingAnime, CompleteAnime, AnimeDetail } from '../types';

const DB_NAME = 'otokonimeDB';
const DB_VERSION = 1;
const STORE_NAME = 'my_lists';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IDB Error:', request.error);
      reject(new Error('Failed to open DB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'slug' });
        store.createIndex('list_status', 'list_status', { unique: false });
      }
    };
  });
  return dbPromise;
}

async function performTransaction<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  const db = await getDB();
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    
    transaction.onerror = () => {
      console.error('Transaction Error:', transaction.error);
      reject(transaction.error);
    };
    
    const request = callback(store);

    if (request) {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            console.error('Request Error:', request.error);
            reject(request.error);
        }
    } else {
        transaction.oncomplete = () => resolve(undefined);
    }
  });
}


export const myListDB = {
  addToList: async (anime: Anime, status: ListStatus): Promise<void> => {
    // The anime object from DetailPage is an AnimeDetail which has more info.
    const detailAnime = anime as AnimeDetail;

    const itemData: Partial<MyListItem> = {
      title: anime.title,
      slug: anime.slug,
      poster: anime.poster,
      rating: anime.rating,
      genres: detailAnime.genres,
      list_status: status,
      added_at: new Date(),
    };

    // For ongoing anime from the detail page, derive current_episode from the episode list.
    // The first episode in the list is the most recent one.
    if (detailAnime.status === 'Ongoing' && detailAnime.episode_lists && detailAnime.episode_lists.length > 0) {
      itemData.current_episode = detailAnime.episode_lists[0].episode;
    } else {
      // For complete anime, or ongoing anime without a listed episode yet, use the episode_count.
      itemData.episode_count = detailAnime.episode_count;
    }

    const cleanItem = Object.fromEntries(
      Object.entries(itemData).filter(([, v]) => v !== undefined)
    );

    // Ensure the keyPath property exists before attempting to write to the database.
    if (!cleanItem.slug) {
        console.error('Cannot add item to list: slug is missing.', anime);
        throw new Error('Cannot add item to list: slug is missing.');
    }

    await performTransaction('readwrite', store => store.put(cleanItem as unknown as MyListItem));
  },

  removeFromList: async (slug: string): Promise<void> => {
    await performTransaction('readwrite', store => store.delete(slug));
  },

  getItem: async (slug: string): Promise<MyListItem | undefined> => {
    return await performTransaction('readonly', store => store.get(slug)) as MyListItem | undefined;
  },
  
  getAll: async (): Promise<MyListItem[]> => {
     return (await performTransaction('readonly', store => store.getAll()) as MyListItem[]) || [];
  }
};