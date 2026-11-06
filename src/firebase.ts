// Firebase configuration for VLS Chapter 3
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyB5gE-KgX0QLMk_Bj8iJjGyRjv636IzK3w",
  authDomain: "ch-3-23019.firebaseapp.com",
  projectId: "ch-3-23019",
  storageBucket: "ch-3-23019.firebasestorage.app",
  messagingSenderId: "270567233450",
  appId: "1:270567233450:web:5a96d02da7b7297ea47dd3",
  measurementId: "G-G46K6R47YM"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics safely
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported or privacy blocked
    });
}

