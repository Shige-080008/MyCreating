// auth.js

// Firebase Authenticationの関数をインポート
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// Firestore関連の関数をインポート（認証状態によってFirestoreの監視を開始するため）
import { startListeningToPlayers } from './firestore.js';
// UI関連の関数をインポート（認証状態によってUIを更新するため）
import { getUIElements, clearRegForm } from './ui.js';

let auth;
let googleProvider;
let signInPopupFn;
let signOutFn;
let onAuthChangedFn;
export let currentUser = null;

let authButton;
let authStatusDisplay;
let registrationRow;

/**
 * ログイン/ログアウトボタンがクリックされた時の処理
 */
async function handleAuthClick() {
    if (currentUser) {
        // ログアウト処理
        try {
            await signOutFn(auth);
            alert('ログアウトしました');
            startListeningToPlayers();
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    } else {
        // ログイン処理
        try {
            const result = await signInPopupFn(auth, googleProvider);
            alert(`Googleでログインしました：${result.user.email}`);
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


/**
 * 認証機能を初期化する関数
 * @param {object} firebaseAuth - Firebase Authオブジェクト
 * @param {object} provider - GoogleAuthProviderオブジェクト
 * @param {function} signInPopupFunc - signInWithPopup関数
 * @param {function} signOutFunc - signOut関数
 * @param {function} onAuthChangedFunc - onAuthStateChanged関数
 */
export function initAuth(firebaseAuth, provider, signInPopupFunc, signOutFunc, onAuthChangedFunc) {
    auth = firebaseAuth;
    googleProvider = provider;
    signInPopupFn = signInPopupFunc;
    signOutFn = signOutFunc;
    onAuthChangedFn = onAuthChangedFunc;

    // UI要素の取得
    const elements = getUIElements();
    authButton = elements.authButton;
    authStatusDisplay = elements.authStatusDisplay;
    registrationRow = elements.registrationRow;

    // ログイン/ログアウトボタンのイベントリスナーを設定
    authButton.addEventListener('click', handleAuthClick);

    // 認証状態の監視を開始
    setupAuthStateObserver();
}

/**
 * 認証状態の変更を監視し、UIを更新する関数
 */
function setupAuthStateObserver() {
    onAuthChangedFn(auth, (user) => {
        currentUser = user;

        if (user) {
            authStatusDisplay.textContent = `ログイン中 (${user.email})`;
            authButton.textContent = 'ログアウト';
            registrationRow.style.display = 'table-row';
        } else {
            authStatusDisplay.textContent = '未ログイン';
            authButton.textContent = 'Googleでログイン';
            registrationRow.style.display = 'none';
            clearRegForm();
        }
        // ログイン状態が変わったら、選手リストの表示を更新
        startListeningToPlayers();
    });
}