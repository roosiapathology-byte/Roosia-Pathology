// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDj80lLjEhDg6kyQfw-iIHe1fUhN9fVn-o",
  authDomain: "roosia-pathology.firebaseapp.com",
  projectId: "roosia-pathology",
  storageBucket: "roosia-pathology.firebasestorage.app",
  messagingSenderId: "314581074001",
  appId: "1:314581074001:web:6e1ffc72aa15211d04f870"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore Database
const db = getFirestore(app);

// Save Booking Function
window.saveBookingToFirebase = async function (bookingData) {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      createdAt: serverTimestamp(),
      status: "pending"
    });

    console.log("Booking saved:", docRef.id);

    return true;
  } catch (error) {
    console.error("Firebase Error:", error);

    return false;
  }
};
