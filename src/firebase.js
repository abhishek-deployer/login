import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDn7undGG4s6U1jDSP3MOy3DDQ1RJS_BqE",
  authDomain: "nextphone-684d1.firebaseapp.com",
  projectId: "nextphone-684d1",
  storageBucket: "nextphone-684d1.appspot.com",
  messagingSenderId: "51940085038",
  appId: "1:51940085038:web:6ebe3bec9523f9d003febf",
  measurementId: "G-5FPP7FCFPQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);