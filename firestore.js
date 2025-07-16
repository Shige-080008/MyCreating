// firestore.js

// Firebase Firestoreの必要な関数をインポート
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
// UI関連の関数をインポート（データ変更時にUIを更新するため）
import { getUIElements } from './ui.js';
import { updatePlayerListUI} from './viewPlayer.js';
// 認証関連の変数をインポート（登録・更新・卒業時にユーザーIDを使用するため）
import { currentUser } from './auth.js';

let db; // Firestoreデータベースインスタンスを保持する変数
let unsubscribePlayers = null; // リアルタイムリスナーの解除関数を保持する変数
let playerListBody; // 選手リストの<tbody>要素を保持する変数

/**
 * Firestore機能を初期化する関数
 * @param {object} firestoreDb - Firestoreデータベースオブジェクト
 */
export function initFirestore(firestoreDb) {
    db = firestoreDb; // データベースインスタンスをセット
    const elements = getUIElements(); // UI要素を取得
    playerListBody = elements.playerListBody; // 選手リストの<tbody>要素を取得

    // アプリケーション起動時にリアルタイム監視を開始
    startListeningToPlayers();
}

/**
 * Firestoreに新しい選手データを追加する関数
 * @param {object} playerData - 追加する選手データ
 * @param {string} playerName - 追加する選手の名前 (アラートメッセージ用)
 */
export async function addPlayer(playerData, playerName) {
    // ログインしていない場合は処理を中断
    if (!currentUser) {
        alert('選手を登録するにはログインが必要です。');
        return;
    }
    try {
        // ドキュメント名を「入学年_名前」で生成
        const documentName = `${playerData.enrollmentYear}_${playerName}`;
        // ドキュメントへの参照を作成（明示的にドキュメントIDを指定）
        const playerRef = doc(db, "players", documentName);

        // setDoc を使用してドキュメントを登録または上書き
        await setDoc(playerRef, {
            ...playerData, // 受け取った選手データを展開
            memo: playerData.memo || '', // メモがなければ空文字列
            positions: playerData.positions || [], // 守備位置がなければ空の配列
        });
        alert(`〇選手「${playerName}」を登録しました`); // 成功メッセージ
    } catch (e) {
        alert(`✖選手の登録に失敗しました。詳細: ${e.message}`); // 失敗メッセージ
    }
}

/**
 * Firestoreの選手データを更新する関数
 * @param {string} id - 更新する選手のドキュメントID
 * @param {object} playerData - 更新する選手データ
 * @param {string} playerName - 更新する選手の名前 (アラートメッセージ用)
 */
export async function updatePlayer(id, playerData, playerName) {
    // ログインしていない場合は処理を中断
    if (!currentUser) {
        alert('選手を更新するにはログインが必要です。');
        return;
    }
    try {
        // 更新するドキュメントへの参照を作成
        const playerRef = doc(db, "players", id);
        // updateDoc を使用してドキュメントを更新
        await updateDoc(playerRef, playerData);
        alert(`選手「${playerName}」を更新しました`); // 成功メッセージ
    } catch (e) {
        console.error(`選手更新エラー：${e}`); // エラーをコンソールに出力
        alert(`選手の更新に失敗しました。（詳細：${e.message}）`); // 失敗メッセージ
    }
}

/**
 * Firestoreから選手データを卒業させる関数
 * @param {string} id - 卒業させる選手のドキュメントID
 * @param {string} playerName - 卒業させる選手の名前 (確認メッセージ用)
 */
export async function deletePlayer(id, playerName) {
    // ログインしていない場合は処理を中断
    if (!currentUser) {
        alert('選手を卒業させるにはログインが必要です。');
        return;
    }
    // 卒業の確認メッセージ
    if (confirm(`本当に${playerName}選手を卒業させますか？`)) {
        try {
            // deleteDoc を使用してドキュメントを卒業
            await deleteDoc(doc(db, "players", id));
            console.log(`選手「${playerName}」を卒業しました。`); // 成功メッセージをコンソールに出力
        } catch (e) {
            console.error(`選手卒業エラー：${e}`); // エラーをコンソールに出力
            alert(`選手の卒業に失敗しました。（詳細：${e.message}）`); // 失敗メッセージ
        }
    }
}

/**
 * Firestoreの選手データをリアルタイムで監視し、UIを更新する関数
 */
export function startListeningToPlayers() {
    // dbが初期化されていない場合はエラーを出力し、処理を中断
    if (!db) {
        console.error("Firestore database (db) is not initialized.");
        if (playerListBody) {
             playerListBody.innerHTML = '<tr><td colspan="13">初期化中...</td></tr>'; // 初期化中のメッセージを表示
        }
        return;
    }

    // 以前のリスナーがあれば解除し、重複監視を防ぐ
    if (unsubscribePlayers) {
        unsubscribePlayers();
    }

    // "players"コレクションへの参照を作成
    const playersCollection = collection(db, "players");
    // 入学年でソートするクエリを作成
    const q = query(playersCollection, orderBy("enrollmentYear"));

    // リアルタイムリスナーを開始 (onSnapshot)
    unsubscribePlayers = onSnapshot(q, (querySnapshot) => {
        const playersData = []; // 選手データを格納する配列
        // 各ドキュメントをループしてデータを取得
        querySnapshot.forEach((doc) => {
            playersData.push({ id: doc.id, ...doc.data() }); // ドキュメントIDとデータを配列に追加
        });

        // 取得したデータでUIを更新
        updatePlayerListUI(playersData);
    }, (error) => {
        // データ読み込みエラー時の処理
        console.error("データの読み込みエラー (onSnapshot):", error);
        if (playerListBody) {
            // 既存のエラーメッセージがあれば卒業
            const errorRow = playerListBody.querySelector('.error-message-row');
            if (errorRow) {
                errorRow.remove();
            }
            // 新しいエラーメッセージ行をテーブルの先頭に追加
            const newErrorRow = playerListBody.insertRow(0);
            newErrorRow.classList.add('error-message-row');
            const cell = newErrorRow.insertCell();
            cell.colSpan = 13; // 全ての列を結合
            cell.textContent = `データの読み込み中にエラーが発生しました: ${error.message}`;
            cell.style.color = 'red';
            cell.style.textAlign = 'center';
        }
    });
}