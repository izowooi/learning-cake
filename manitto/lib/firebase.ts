import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let database: Database | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 매번 새로 초기화
    return initializeApp(firebaseConfig, `server-${Date.now()}`);
  }

  if (!app && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  }
  return app || getApps()[0];
}

export function getFirebaseDatabase(): Database {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 새 인스턴스 반환
    return getDatabase(getFirebaseApp());
  }

  if (!database) {
    database = getDatabase(getFirebaseApp());
  }
  return database;
}
