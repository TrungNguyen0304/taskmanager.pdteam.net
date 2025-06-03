
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDZb5yKlepg6PJXR1ZXSkawLZsC0cKygcg",
  authDomain: "backend-api-5a7e6.firebaseapp.com",
  projectId: "backend-api-5a7e6",
  storageBucket: "backend-api-5a7e6.firebasestorage.app",
  messagingSenderId: "868163805151",
  appId: "1:868163805151:web:b8ded0868ab1c939e3ee6a",
  measurementId: "G-LVFTLC22NP"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };