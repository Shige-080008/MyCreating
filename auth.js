// auth.js

// Firebase Authenticationの関数をインポート
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// Firestore関連の関数をインポート（認証状態によってFirestoreの監視を開始するため）
import { startListeningToPlayers } from './firestore.js'; 
// UI関連の関数をインポート（認証状態によってUIを更新するため）
import { getUIElements, clearRegistrationForm } from './ui.js';

let auth;
let googleProvider;
let signInWithPopupFunc;
let signOutFunc;
let onAuthStateChangedFunc;
export let currentLoggedInUser = null; 

let authButton;
let authStatusDiv;
let registrationRow; // 新規登録用の行の参照

/**
 * ログイン/ログアウトボタンがクリックされた時の処理
 * initAuth 関数よりも上に移動
 */
async function handleAuthButtonClick() { // この関数定義を上に移動
    if (currentLoggedInUser) {
        // ログアウト処理
        try {
            await signOutFunc(auth);
            alert('ログアウトしました');
            startListeningToPlayers(); 
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    } else {
        // ログイン処理
        try {
            const result = await signInWithPopupFunc(auth, googleProvider);
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
    registrationRow = elements.registrationRow;

    // ログイン/ログアウトボタンのイベントリスナーを設定
    authButton.addEventListener('click', handleAuthButtonClick); // ここで参照されるので、定義が上にあるべき

    // 認証状態の監視を開始
    setupAuthStateObserver();
}

/**
 * 認証状態の変更を監視し、UIを更新する関数
 */
function setupAuthStateObserver() {
    onAuthStateChangedFunc(auth, (user) => { 
        currentLoggedInUser = user; 

        if (user) {
            authStatusDiv.textContent = `ログイン中 (${user.email})`;
            authButton.textContent = 'ログアウト';
            registrationRow.style.display = 'table-row'; 
        } else {
            authStatusDiv.textContent = '未ログイン';
            authButton.textContent = 'Googleでログイン';
            registrationRow.style.display = 'none'; 
            clearRegistrationForm(); 
        }
        // ログイン状態が変わったら、選手リストの表示を更新
        startListeningToPlayers(); 
    });
}
