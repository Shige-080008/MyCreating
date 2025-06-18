// Firebase Firestoreの関数をインポート
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
// UI関連の関数をインポート（データ変更時にUIを更新するため）
import { updatePlayerListUI, getUIElements } from './ui.js';
// 認証関連の変数をインポート（登録・更新・削除時にユーザーIDを使用するため）
import { currentUser } from './auth.js'; // currentLoggedInUser を currentUser に変更

let db;
let unsubscribePlayers = null; // unsubscribeFromPlayers を unsubscribePlayers に短縮
let playerListTbody;           // playerListTableBody を playerListTbody に短縮

/**
 * Firestore機能を初期化する関数
 * @param {object} firestoreDb - Firestoreデータベースオブジェクト
 */
export function initFirestore(firestoreDb) {
    db = firestoreDb;
    const elements = getUIElements();
    playerListTbody = elements.playerListTbody; // playerListTableBody を playerListTbody に変更

    // アプリケーション起動時にリアルタイム監視を開始
    startListeningToPlayers();
}

/**
 * Firestoreに新しい選手データを追加する関数
 * @param {object} playerData - 追加する選手データ
 */
export async function addPlayer(playerData) {
    if (!currentUser) { // currentLoggedInUser を currentUser に変更
        alert('選手を登録するにはログインが必要です。');
        return;
    }
    try {
        const docRef = await addDoc(collection(db, "players"), {
            ...playerData,
            memo: playerData.memo || '', // memoフィールドを追加、もし値がなければ空文字列
            registeredBy: currentUser.uid // 登録ユーザーIDを追加 // currentLoggedInUser を currentUser に変更
        });
        alert(`〇選手を登録しました ID：${docRef.id}`);
    } catch (e) {
        alert(`✖選手の登録に失敗しました。詳細: ${e.message}`);
    }
}

/**
 * Firestoreの選手データを更新する関数
 * @param {string} id - 更新する選手のドキュメントID
 * @param {object} playerData - 更新する選手データ
 */
export async function updatePlayer(id, playerData) {
    if (!currentUser) { // currentLoggedInUser を currentUser に変更
        alert('選手を更新するにはログインが必要です。');
        return;
    }
    try {
        const playerRef = doc(db, "players", id);
        // playerDataには、ステータスとmemoが含まれる可能性がある
        await updateDoc(playerRef, playerData);
        alert(`選手を更新しました ID：${id}`);
    } catch (e) {
        console.error(`選手更新エラー：${e}`);
        alert(`選手の更新に失敗しました。（詳細：${e.message}）`);
    }
}

/**
 * Firestoreから選手データを削除する関数
 * @param {string} id - 削除する選手のドキュメントID
 */
export async function deletePlayer(id) {
    if (!currentUser) { // currentLoggedInUser を currentUser に変更
        alert('選手を削除するにはログインが必要です。');
        return;
    }
    if (confirm('本当にこの選手を削除しますか？')) {
        try {
            await deleteDoc(doc(db, "players", id));
            console.log(`選手を削除しました。（ID：${id}）`);
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
        if (playerListTbody) { // playerListTableBody を playerListTbody に変更
             playerListTbody.innerHTML = '<tr><td colspan="12">初期化中...</td></tr>'; // colSpanを12に変更 // playerListTableBody を playerListTbody に変更
        }
        return;
    }

    // 以前のリスナーがあれば解除
    if (unsubscribePlayers) { // unsubscribeFromPlayers を unsubscribePlayers に変更
        unsubscribePlayers(); // unsubscribeFromPlayers を unsubscribePlayers に変更
    }

    // クエリを作成 (入学年でソート)
    const playersCollection = collection(db, "players");
    const q = query(playersCollection, orderBy("enrollmentYear"));

    // リアルタイムリスナーを開始
    unsubscribePlayers = onSnapshot(q, (querySnapshot) => { // unsubscribeFromPlayers を unsubscribePlayers に変更
        const playersData = [];
        querySnapshot.forEach((doc) => {
            playersData.push({ id: doc.id, ...doc.data() });
        });

        // データが取得されたらUIを更新
        updatePlayerListUI(playersData);
    }, (error) => {
        console.error("データの読み込みエラー (onSnapshot):", error);
        // エラー時でも登録行は表示されるようにするため、<tbody>の内容を直接操作しない
        if (playerListTbody) { // playerListTableBody を playerListTbody に変更
            // エラーメッセージを表示するが、既存の登録行は残す
            const errorRow = playerListTbody.querySelector('.error-message-row'); // playerListTableBody を playerListTbody に変更
            if (errorRow) {
                errorRow.remove(); // 既存のエラーメッセージがあれば削除
            }
            const newErrorRow = playerListTbody.insertRow(0); // テーブルの先頭に挿入 // playerListTableBody を playerListTbody に変更
            newErrorRow.classList.add('error-message-row');
            const cell = newErrorRow.insertCell();
            cell.colSpan = 12; // colSpanを12に変更
            cell.textContent = `データの読み込みに失敗しました。詳細: ${error.message}`;
            cell.style.color = 'red';
        }
    });
}