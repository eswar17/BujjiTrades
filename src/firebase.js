// ✅ Updated Firebase config setup for BujjiTrades (with Firestore)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgqCsuWyfIL-iCdO42Y6l-BgKsKz78O3Y",
  authDomain: "bujjitrades.firebaseapp.com",
  projectId: "bujjitrades",
  storageBucket: "bujjitrades.firebasestorage.app",
  messagingSenderId: "451863775882",
  appId: "1:451863775882:web:18a63d81c805276df67b73",
  measurementId: "G-49YP767QB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
