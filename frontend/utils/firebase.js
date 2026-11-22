// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "projects-bbdba.firebaseapp.com",
  projectId: "projects-bbdba",
  storageBucket: "projects-bbdba.firebasestorage.app",
  messagingSenderId: "435899266668",
  appId: "1:435899266668:web:016f3ad32e5bf7b977ca49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()