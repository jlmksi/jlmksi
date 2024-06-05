// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3FKMzBKOqxKnYIJeU7TimVsZDeOZ2K64",
  authDomain: "restaurant-order-9fd1f.firebaseapp.com",
  projectId: "restaurant-order-9fd1f",
  storageBucket: "restaurant-order-9fd1f.appspot.com",
  messagingSenderId: "911452281381",
  appId: "1:911452281381:web:14d56045f7a2b00ace3dcc",
  measurementId: "G-VFB4GPC024"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
