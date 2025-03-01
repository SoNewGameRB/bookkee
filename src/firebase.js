import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// 🔹 這裡替換為你的 Firebase 設定（在 Firebase 控制台 Web 註冊時取得）
const firebaseConfig = {
    apiKey: "AIzaSyBVEZa6ROzILT6YfOJXdfSVs8M35dflPpo",
    authDomain: "booeekk-x0.firebaseapp.com",
    projectId: "booeekk-x0",
    storageBucket: "booeekk-x0.firebasestorage.app",
    messagingSenderId: "443205335095",
    appId: "1:443205335095:web:670959c501d891e72ea7b2",
    measurementId: "G-F3YQL2KHXX"
  };

// 🔥 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, signInWithPopup };
