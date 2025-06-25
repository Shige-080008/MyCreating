// auth.js

// Firebase Authenticationの必要な関数をインポート
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// Firestore関連の関数をインポート（認証状態によってFirestoreの監視を開始するため）
import { startListeningToPlayers } from './firestore.js';
// UI関連の関数をインポート（認証状態によってUIを更新するため）
import { getUIElements, clearRegForm } from './ui.js';

let auth; // Firebase Authオブジェクトを保持する変数
let googleProvider; // GoogleAuthProviderオブジェクトを保持する変数
let signInPopupFn; // signInWithPopup関数を保持する変数
let signOutFn; // signOut関数を保持する変数
let onAuthChangedFn; // onAuthStateChanged関数を保持する変数
export let currentUser = null; // 現在ログインしているユーザー情報を保持する変数

let authButton; // 認証ボタン要素を保持する変数
let authStatus; // 認証ステータス表示要素を保持する変数
let registRow; // 選手登録行要素を保持する変数

/**
 * ログイン/ログアウトボタンがクリックされた時の処理
 */
async function handleAuthClick() {
    if (currentUser) {
        // ユーザーがログインしている場合、ログアウト処理を実行
        try {
            await signOutFn(auth); // Firebaseからログアウト
            alert('ログアウトしました');
            startListeningToPlayers(); // ログアウト後、選手リストの表示を更新
        } catch (error) {
            console.error('ログアウトエラー:', error); // エラーをコンソールに出力
        }
    } else {
        // ユーザーがログインしていない場合、Googleログイン処理を実行
        try {
            const result = await signInPopupFn(auth, googleProvider); // Googleポップアップでログイン
            alert(`Googleでログインしました：${result.user.email}`);
            startListeningToPlayers(); // ログイン後、選手リストの表示を更新
        } catch (error) {
            const errorCode = error.code; // エラーコード
            const errorMessage = error.message; // エラーメッセージ
            console.error('Googleログインエラー:', errorCode, errorMessage); // エラーをコンソールに出力
            // エラーコードに応じたユーザーへの通知
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
    auth = firebaseAuth; // Authオブジェクトをセット
    googleProvider = provider; // Providerオブジェクトをセット
    signInPopupFn = signInPopupFunc; // signInWithPopup関数をセット
    signOutFn = signOutFunc; // signOut関数をセット
    onAuthChangedFn = onAuthChangedFunc; // onAuthStateChanged関数をセット

    // UI要素の取得
    const elements = getUIElements();
    authButton = elements.authButton;
    authStatus = elements.authStatus;
    registRow = elements.registRow;

    // ログイン/ログアウトボタンのイベントリスナーを設定
    authButton.addEventListener('click', handleAuthClick);

    // 認証状態の監視を開始
    setupAuthStateObserver();
}

/**
 * 認証状態の変更を監視し、UIを更新する関数
 */
function setupAuthStateObserver() {
    // 認証状態の変化を監視
    onAuthChangedFn(auth, (user) => {
        currentUser = user; // 現在のユーザー情報を更新

        if (user) {
            // ログインしている場合
            authStatus.textContent = `ログイン中 (${user.email})`; // ログイン状態とメールアドレスを表示
            authStatus.style.color = 'green'; // 文字色を緑に設定
            authButton.textContent = 'ログアウト'; // ボタンのテキストを「ログアウト」に変更
            registRow.style.display = 'table-row'; // 選手登録行を表示
        } else {
            // ログインしていない場合
            authStatus.textContent = '未ログイン'; // ログイン状態を表示
            authButton.textContent = 'Googleでログイン'; // ボタンのテキストを「Googleでログイン」に変更
            registRow.style.display = 'none'; // 選手登録行を非表示
            clearRegForm(); // 登録フォームの内容をクリア
        }
        // ログイン状態が変わったら、選手リストの表示を更新
        startListeningToPlayers();
    });
}