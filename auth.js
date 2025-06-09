// Firebase Authenticationの関数をインポート
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// Firestore関連の関数をインポート（認証状態によってFirestoreの監視を開始するため）
import { startListeningToPlayers } from './firestore.js'; // ★ここを追加
// UI関連の関数をインポート（認証状態によってUIを更新するため）
import { getUIElements, updatePlayerListUI, clearForm } from './ui.js';

let auth;
let googleProvider;
let signInWithPopupFunc;
let signOutFunc;
let onAuthStateChangedFunc;
export let currentLoggedInUser = null; 

let authButton;
let authStatusDiv;
let registerButton;
let playerForm;

/**
 * 認証機能を初期化する関数
 * @param {object} firebaseAuth - Firebase Authオブジェクト
 * @param {object} provider - GoogleAuthProviderオブジェクト
 * @param {function} signInPopupFn - signInWithPopup関数
 * @param {function} signOutFn - signOut関数
 * @param {function} onAuthChangedFn - onAuthStateChanged関数
 */
export function initAuth(firebaseAuth, provider, signInPopupFn, signOutFn, onAuthChangedFn) {
    auth = firebaseAuth;
    googleProvider = provider;
    signInWithPopupFunc = signInPopupFn;
    signOutFunc = signOutFn;
    onAuthStateChangedFunc = onAuthChangedFn;

    // UI要素の取得
    const elements = getUIElements();
    authButton = elements.authButton;
    authStatusDiv = elements.authStatusDiv;
    registerButton = elements.registerButton;
    playerForm = elements.playerForm;

    // 認証状態の監視を開始
    setupAuthStateObserver();

    // ログイン/ログアウトボタンのイベントリスナーを設定
    authButton.addEventListener('click', handleAuthButtonClick);
}

/**
 * 認証状態の変更を監視し、UIを更新する関数
 */
function setupAuthStateObserver() {
    onAuthStateChangedFunc(auth, (user) => {
        currentLoggedInUser = user; // ユーザー情報を更新

        if (user) {
            authStatusDiv.textContent = `ログイン中 (${user.email})`;
            authButton.textContent = 'ログアウト';
            registerButton.disabled = false;
            playerForm.style.display = 'block';
        } else {
            authStatusDiv.textContent = '未ログイン';
            authButton.textContent = 'Googleでログイン';
            registerButton.disabled = true;
            playerForm.style.display = 'none';
            clearForm(); // ログアウト時にフォームをクリア
        }
        // ログイン状態が変わったら、選手リストの表示を更新
        // ここでFirestoreの監視を再開することで、確実に最新データを表示
        // ★修正点1: 認証状態変更時に常にデータ監視を開始
        startListeningToPlayers(); 
    });
}

/**
 * ログイン/ログアウトボタンがクリックされた時の処理
 */
async function handleAuthButtonClick() {
    if (currentLoggedInUser) {
        // ログアウト処理
        try {
            await signOutFunc(auth);
            alert('ログアウトしました');
            // ログアウト後、Firestoreの監視を再開してデータ表示を更新
            // ★修正点2: ログアウト成功時にもデータ監視を開始
            startListeningToPlayers(); 
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    } else {
        // ログイン処理
        try {
            const result = await signInWithPopupFunc(auth, googleProvider);
            alert(`Googleでログインしました：${result.user.email}`);
            // ログイン後、Firestoreの監視を再開してデータ表示を更新
            // ★修正点3: ログイン成功時にもデータ監視を開始
            startListeningToPlayers(); 
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Googleログインエラー:', errorCode, errorMessage);
            if (errorCode === 'auth/popup-closed-by-user') {
                alert('Googleログインがキャンセルされました。');
            } else if (errorCode === 'auth/cancelled-popup-request') {
                alert('既にログインリクエストが処理中です。');
            } else {
                alert(`ログインエラー: ${errorMessage}`);
            }
        }
    }
}