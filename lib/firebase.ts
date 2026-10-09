import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCO4DMBiP5LZSKbgJMtU9wXRu1YaSXCWJ4",
  authDomain: "prolash-ec7ba.firebaseapp.com",
  projectId: "prolash-ec7ba",
  storageBucket: "prolash-ec7ba.firebasestorage.app",
  messagingSenderId: "7866322187",
  appId: "1:7866322187:web:a030e2ec224ad14892660e",
  measurementId: "G-L4NH9MSWZD",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
