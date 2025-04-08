// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2HX447XAztbxY7VtOFA6GVJ4_m-C3aT8",
  authDomain: "tradeay.firebaseapp.com",
  projectId: "tradeay",
  storageBucket: "tradeay.firebasestorage.app",
  messagingSenderId: "479482587116",
  appId: "1:479482587116:web:eb49d90be8ffbdc28102c9",
  measurementId: "G-C7YG0QK2PG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);