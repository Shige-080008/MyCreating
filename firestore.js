// firestore.js

// Firebase Firestoreの関数をインポート
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
// UI関連の関数をインポート（データ変更時にUIを更新するため）
import { updatePlayerListUI, getUIElements } from './ui.js';
// 認証関連の変数をインポート（登録・更新・削除時にユーザーIDを使用するため）
import { currentUser } from './auth.js';

let db;
let unsubscribePlayers = null;
let playerListBody;

/**
 * Firestore機能を初期化する関数
 * @param {object} firestoreDb - Firestoreデータベースオブジェクト
 */
export function initFirestore(firestoreDb) {
    db = firestoreDb;
    const elements = getUIElements();
    playerListBody = elements.playerListBody;

    // アプリケーション起動時にリアルタイム監視を開始
    startListeningToPlayers();
}

/**
 * Firestoreに新しい選手データを追加する関数
 * @param {object} playerData - 追加する選手データ
 * @param {string} playerName - 追加する選手の名前
 */
export async function addPlayer(playerData, playerName) {
    if (!currentUser) {
        alert('選手を登録するにはログインが必要です。');
        return;
    }
    try {
        const docRef = await addDoc(collection(db, "players"), {
            ...playerData,
            memo: playerData.memo || '',
            registeredBy: currentUser.uid
        });
        // 選手名を使用するように変更
        alert(`〇選手「${playerName}」を登録しました`);
    } catch (e) {
        alert(`✖選手の登録に失敗しました。詳細: ${e.message}`);
    }
}

/**
 * Firestoreの選手データを更新する関数
 * @param {string} id - 更新する選手のドキュメントID
 * @param {object} playerData - 更新する選手データ
 * @param {string} playerName - 更新する選手の名前
 */
export async function updatePlayer(id, playerData, playerName) {
    if (!currentUser) {
        alert('選手を更新するにはログインが必要です。');
        return;
    }
    try {
        const playerRef = doc(db, "players", id);
        // playerDataには、ステータスとmemoが含まれる可能性がある
        await updateDoc(playerRef, playerData);
        // 選手名を使用するように変更
        alert(`選手「${playerName}」を更新しました`);
    } catch (e) {
        console.error(`選手更新エラー：${e}`);
        alert(`選手の更新に失敗しました。（詳細：${e.message}）`);
    }
}

/**
 * Firestoreから選手データを削除する関数
 * @param {string} id - 削除する選手のドキュメントID
 * @param {string} playerName - 削除する選手の名前
 */
export async function deletePlayer(id, playerName) {
    if (!currentUser) {
        alert('選手を削除するにはログインが必要です。');
        return;
    }
    if (confirm(`本当に選手「${playerName}」を削除しますか？`)) { // 確認メッセージに選手名を追加
        try {
            await deleteDoc(doc(db, "players", id));
            // 選手名を使用するように変更
            console.log(`選手「${playerName}」を削除しました。`);
        } catch (e) {
            console.error(`選手削除エラー：${e}`);
            alert(`選手の削除に失敗しました。（詳細：${e.message}）`);
        }
    }
}

/**
 * Firestoreの選手データをリアルタイムで監視し、UIを更新する関数
 */
export function startListeningToPlayers() {
    if (!db) {
        console.error("Firestore database (db) is not initialized.");
        if (playerListBody) {
             playerListBody.innerHTML = '<tr><td colspan="12">初期化中...</td></tr>';
        }
        return;
    }

    // 以前のリスナーがあれば解除
    if (unsubscribePlayers) {
        unsubscribePlayers();
    }

    // クエリを作成 (入学年でソート)
    const playersCollection = collection(db, "players");
    const q = query(playersCollection, orderBy("enrollmentYear"));

    // リアルタイムリスナーを開始
    unsubscribePlayers = onSnapshot(q, (querySnapshot) => {
        const playersData = [];
        querySnapshot.forEach((doc) => {
            playersData.push({ id: doc.id, ...doc.data() });
        });

        // データが取得されたらUIを更新
        updatePlayerListUI(playersData);
    }, (error) => {
        console.error("データの読み込みエラー (onSnapshot):", error);
        // エラー時でも登録行は表示されるようにするため、<tbody>の内容を直接操作しない
        if (playerListBody) {
            // エラーメッセージを表示するが、既存の登録行は残す
            const errorRow = playerListBody.querySelector('.error-message-row');
            if (errorRow) {
                errorRow.remove();
            }
            const newErrorRow = playerListBody.insertRow(0);
            newErrorRow.classList.add('error-message-row');
            const cell = newErrorRow.insertCell();
            cell.colSpan = 12;
            cell.textContent = `データの読み込みに失敗しました。詳細: ${error.message}`;
            cell.style.color = 'red';
        }
    });
}