import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DayOfWeek, Exercise, Session, SessionEntry } from '../types';

interface GymDB extends DBSchema {
  exercises: {
    key: number;
    value: Exercise;
    indexes: { 'by-day': DayOfWeek };
  };
  sessions: {
    key: number;
    value: Session;
    indexes: { 'by-day': DayOfWeek; 'by-date': string };
  };
  sessionEntries: {
    key: number;
    value: SessionEntry;
    indexes: { 'by-session': number; 'by-exercise': number };
  };
}

const DB_NAME = 'gymapp';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<GymDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<GymDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GymDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Exercises store
        const exerciseStore = db.createObjectStore('exercises', {
          keyPath: 'id',
          autoIncrement: true,
        });
        exerciseStore.createIndex('by-day', 'trainingDayId');

        // Sessions store
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sessionStore.createIndex('by-day', 'trainingDayId');
        sessionStore.createIndex('by-date', 'date');

        // Session entries store
        const entryStore = db.createObjectStore('sessionEntries', {
          keyPath: 'id',
          autoIncrement: true,
        });
        entryStore.createIndex('by-session', 'sessionId');
        entryStore.createIndex('by-exercise', 'exerciseId');
      },
      async blocked() {
        console.warn('DB upgrade blocked by another tab');
      },
    });
  }
  return dbPromise;
}
