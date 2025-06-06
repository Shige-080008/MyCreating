// Firebase Firestoreの必要な関数をインポート
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js"; 

// Firestoreのデータベースを保持する変数
let db;

// HTMLの要素を取得するための変数
let enrollmentYearInput; // 入学年
let playerNameInput; // 選手名
let throwingInput; // 送球
let trajectoryInput; // 弾道
let meetInput; // ミート
let powerInput; // パワー
let speedInput; // 走力
let armStrengthInput; // 肩力
let defenseInput; // 守備力
let catchingInput; // 捕球力
let registerButton; // 登録ボタン
let playerListDiv; // 選手リストを表示するためのdiv
let playerForm; // 選手登録フォーム

// 現在編集中の選手のIDを覚えておくための変数（最初は空っぽ）
let editingPlayerId = null; 

// HTMLからデータベース情報を受け取るための関数
export function initApp(firestoreDb) {
    db = firestoreDb; 
    
    // HTMLの要素を取得する
    playerForm = document.getElementById('playerForm');
    enrollmentYearInput = document.getElementById('enrollmentYearInput');
    playerNameInput = document.getElementById('playerNameInput');
    throwingInput = document.getElementById('throwingInput');
    trajectoryInput = document.getElementById('trajectoryInput');
    meetInput = document.getElementById('meetInput');
    powerInput = document.getElementById('powerInput');
    speedInput = document.getElementById('speedInput');
    armStrengthInput = document.getElementById('armStrengthInput');
    defenseInput = document.getElementById('defenseInput');
    catchingInput = document.getElementById('catchingInput');
    registerButton = document.getElementById('registerButton');
    playerListDiv = document.getElementById('playerList');

    // データベース情報を受け取ったら、すぐに選手を読み込む
    loadPlayers();

    // フォームが送信された時の動き（登録ボタンのクリックと同じ）
    playerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // フォームの標準の送信動作（ページがリロードされるの）を止める

        // 全ての入力値を取得し、数値に変換する
        const enrollmentYear = parseInt(enrollmentYearInput.value);
        const name = playerNameInput.value;
        const throwing = parseInt(throwingInput.value);
        const trajectory = parseInt(trajectoryInput.value);
        const meet = parseInt(meetInput.value);
        const power = parseInt(powerInput.value);
        const speed = parseInt(speedInput.value);
        const armStrength = parseInt(armStrengthInput.value);
        const defense = parseInt(defenseInput.value);
        const catching = parseInt(catchingInput.value);

        // 全ての項目がちゃんと入力されているかチェック
        if (!name || isNaN(enrollmentYear) || isNaN(throwing) || isNaN(trajectory) || 
            isNaN(meet) || isNaN(power) || isNaN(speed) || isNaN(armStrength) || 
            isNaN(defense) || isNaN(catching)) {
            alert('全ての項目を正しく入力してください！');
            return; // これ以上処理しない
        }

        const playerData = {
            enrollmentYear: enrollmentYear,
            name: name,
            throwing: throwing,
            trajectory: trajectory,
            meet: meet,
            power: power,
            speed: speed,
            armStrength: armStrength,
            defense: defense,
            catching: catching
        };

        if (editingPlayerId) {
            await updatePlayer(editingPlayerId, playerData);
            editingPlayerId = null; 
            registerButton.textContent = '選手を登録する'; 
        } else {
            await addPlayer(playerData);
        }

        clearForm();
        loadPlayers(); 
    });
}

// フォームの入力欄を空にする関数
function clearForm() {
    enrollmentYearInput.value = '';
    playerNameInput.value = '';
    throwingInput.value = '';
    trajectoryInput.value = '';
    meetInput.value = '';
    powerInput.value = '';
    speedInput.value = '';
    armStrengthInput.value = '';
    defenseInput.value = '';
    catchingInput.value = '';
}

// 新しい選手をデータベースに追加する関数
async function addPlayer(playerData) {
    try {
        const docRef = await addDoc(collection(db, "players"), playerData);
        alert("〇選手を登録しました ID: " + docRef.id);
    } catch (e) {
        alert('✖選手の登録に失敗しました。詳細: ' + e.message); 
    }
}

// 既存の選手をデータベースで更新する関数（編集機能） (変更なし)
async function updatePlayer(id, playerData) {
    try {
        const playerRef = doc(db, "players", id);
        await updateDoc(playerRef, playerData);
        alert("選手を更新しました ID: "+ id);
    } catch (e) {
        alert('選手の更新に失敗しました。詳細: ' + e.message);
    }
}


// データベースから選手データを読み込んで表示する関数
async function loadPlayers() {
    if (!db) {
        console.error("Firestore database (db) is not initialized.");
        playerListDiv.textContent = '初期化中...';
        return;
    }

    playerListDiv.innerHTML = '読み込み中...'; 

    try {
        const querySnapshot = await getDocs(collection(db, "players")); 
        
        const playersData = [];
        querySnapshot.forEach((doc) => {
            playersData.push({ id: doc.id, ...doc.data() }); 
        });

        // 入学年でソート（小さい順）
        playersData.sort((a, b) => a.enrollmentYear - b.enrollmentYear);

        playerListDiv.innerHTML = ''; 

        if (playersData.length === 0) {
            playerListDiv.textContent = 'まだ選手がいません。';
            return;
        }

        let playerIndex = 1; 
        playersData.forEach((player) => { 
            const playerEntry = document.createElement('p');
            playerEntry.textContent = 
                `${playerIndex}. 入学年:${player.enrollmentYear} 選手名:${player.name} ` + 
                `送球:${player.throwing} 弾道:${player.trajectory} ミート:${player.meet} ` +
                `パワー:${player.power} 走力:${player.speed} 肩力:${player.armStrength} ` +
                `守備力:${player.defense} 捕球:${player.catching}`;

            // 編集ボタン
            const editButton = document.createElement('button');
            editButton.textContent = '編集';
            editButton.style.marginLeft = '5px';
            editButton.addEventListener('click', () => {
                // 編集ボタンを押したら、その選手のデータを入力欄に戻す
                enrollmentYearInput.value = player.enrollmentYear;
                playerNameInput.value = player.name;
                throwingInput.value = player.throwing;
                trajectoryInput.value = player.trajectory;
                meetInput.value = player.meet;
                powerInput.value = player.power;
                speedInput.value = player.speed;
                armStrengthInput.value = player.armStrength;
                defenseInput.value = player.defense;
                catchingInput.value = player.catching;
                editingPlayerId = player.id;
                registerButton.textContent = '選手を更新する';
            });

            // 削除ボタン
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', async () => {
                await deletePlayer(player.id); 
            });

            playerEntry.appendChild(editButton);
            playerEntry.appendChild(deleteButton);
            playerListDiv.appendChild(playerEntry);
            playerIndex++;
        });
    } catch (e) {
        console.error("データの読み込みエラー:", e);
        playerListDiv.textContent = `データの読み込みに失敗しました。詳細: ${e.message}`; 
    }
}

// 選手を削除する関数 (変更なし)
async function deletePlayer(id) {
    if (confirm('本当にこの選手を削除しますか？')) { 
        try {
            await deleteDoc(doc(db, "players", id));
            console.log("選手を削除しました ID: ", id);
            loadPlayers(); 
        } catch (e) {
            console.error("選手削除エラー: ", e);
            alert('選手の削除に失敗しました。詳細: ' + e.message); 
        }
    }
}
