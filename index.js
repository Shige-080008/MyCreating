// index.js

// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 各モジュールの初期化関数をインポート
import { initAuth } from './auth.js';
import { initFirestore } from './firestore.js';
import { initRegistFormListeners } from './rgstPlayer.js'; // 登録フォームのイベントリスナー

// Firebase構成オブジェクト（ご自身のFirebaseプロジェクトの設定に合わせてください）
const firebaseConfig = {
    apiKey: "AIzaSyAu3yhKb2VPjfSGLjHbDc6k7NkWV8pdU3c",
    authDomain: "kanzakiapp.firebaseapp.com",
    projectId: "kanzakiapp",
    storageBucket: "kanzakiapp.firebasestorage.app",
    messagingSenderId: "449151069520",
    appId: "1:449151069520:web:8829b6b5b70db2b1ed1055"
};

// Firebaseアプリケーションを初期化
const app = initializeApp(firebaseConfig);

// Firebase AuthとFirestoreのインスタンスを取得
const auth = getAuth(app);
const db = getFirestore(app);

// Google認証プロバイダを初期化
const googleProvider = new GoogleAuthProvider();

// 各モジュールを初期化
document.addEventListener('DOMContentLoaded', () => {
    initRegistFormListeners(); // 登録フォームのイベントリスナー設定
    initAuth(auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged); // 認証モジュールの初期化
    initFirestore(db); // Firestoreモジュールの初期化
    // リアルタイムリスナーはfirestore.jsのinitFirestore内で開始される
});