import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCFBBzlV9ET97lW_Uw7fpSMXYh8slM-wR4",
  authDomain: "chemistrycorner-14564.firebaseapp.com",
  projectId: "chemistrycorner-14564",
  storageBucket: "chemistrycorner-14564.appspot.com",
  messagingSenderId: "837800518926",
  appId: "1:837800518926:web:247663ddd4834574c1235f",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
