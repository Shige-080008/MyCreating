// Firebase Firestoreの必要な関数をインポート
// onSnapshot を追加
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js"; 

// Firestoreのデータベースを保持する変数
let db;
// Authentication関連の変数
let auth;
let googleProvider;
let signInWithPopupFunc; 
let signOutFunc;
let onAuthStateChangedFunc;
let currentLoggedInUser = null; 

// HTMLの要素を取得するための変数
let enrollmentYearInput; 
let playerNameInput; 
let throwingInput; 
let trajectoryInput; 
let meetInput; 
let powerInput; 
let speedInput; 
let armStrengthInput; 
let defenseInput; 
let catchingInput; 
let registerButton; 
let playerListDiv; 
let playerForm; 

// 認証UI要素
let authStatusDiv;
let authButton;

// 現在編集中の選手のIDを覚えておくための変数（最初は空っぽ）
let editingPlayerId = null; 

// Firestoreのリスナーを解除するための関数を保持する変数
let unsubscribeFromPlayers = null;


export function initApp(firestoreDb, firebaseAuth, provider, signInPopupFn, signOutFn, onAuthChangedFn) {
    db = firestoreDb; 
    auth = firebaseAuth; 
    googleProvider = provider; 
    signInWithPopupFunc = signInPopupFn; 
    signOutFunc = signOutFn;
    onAuthStateChangedFunc = onAuthChangedFn;
    
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

    // 認証UI要素を取得
    authStatusDiv = document.getElementById('authStatus');
    authButton = document.getElementById('authButton');

    // 初回ロード時に選手リストを読み込む（onSnapshotでリアルタイム監視を開始）
    startListeningToPlayers();

    // 認証状態の変化を監視
    onAuthStateChangedFunc(auth, (user) => {
        currentLoggedInUser = user; // ユーザー情報を更新

        if (user) {
            authStatusDiv.textContent = `ログイン中 (UID: ${user.uid}, メール: ${user.email})`;
            authButton.textContent = 'ログアウト';
            registerButton.disabled = false;
            playerForm.style.display = 'block';
        } else {
            authStatusDiv.textContent = '未ログイン';
            authButton.textContent = 'Googleでログイン';
            registerButton.disabled = true;
            playerForm.style.display = 'none';
        }
        // ログイン状態が変わったら、表示中の編集/削除ボタンを更新するだけ
        // loadPlayers() を直接呼び出すのではなく、onSnapshotで受け取ったデータに基づいて更新
        updatePlayerListUI(); 
    });

    // ログイン/ログアウトボタンのクリックイベント
    authButton.addEventListener('click', () => {
        if (currentLoggedInUser) {
            signOutFunc(auth).then(() => {
                alert('ログアウトしました');
                startListeningToPlayers();
            }).catch(error => {
                console.error('ログアウトエラー:', error);
            });
        } else {
            signInWithPopupFunc(auth, googleProvider)
                .then((result) => {
                    alert('Googleでログインしました:', result.user.email);
                    startListeningToPlayers();
                })
                .catch((error) => {
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
                });
        }
    });

    playerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        if (!currentLoggedInUser) {
            alert('選手を登録・更新するにはログインが必要です。');
            return;
        }

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

        if (!name || isNaN(enrollmentYear) || isNaN(throwing) || isNaN(trajectory) || 
            isNaN(meet) || isNaN(power) || isNaN(speed) || isNaN(armStrength) || 
            isNaN(defense) || isNaN(catching)) {
            alert('全ての項目を正しく入力してください！');
            return;
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
            catching: catching,
            registeredBy: currentLoggedInUser.uid 
        };

        if (editingPlayerId) {
            await updatePlayer(editingPlayerId, playerData);
            editingPlayerId = null; 
            registerButton.textContent = '選手を登録する'; 
        } else {
            await addPlayer(playerData);
        }

        clearForm();
        // loadPlayers() を直接呼び出さない (onSnapshotが自動的に更新するため)
    });
}

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

async function addPlayer(playerData) {
    try {
        const docRef = await addDoc(collection(db, "players"), playerData);
        alert("〇選手を登録しました ID: " + docRef.id);
    } catch (e) {
        alert('✖選手の登録に失敗しました。詳細: ' + e.message); 
    }
}

async function updatePlayer(id, playerData) {
    try {
        const playerRef = doc(db, "players", id);
        await updateDoc(playerRef, playerData);
        alert(`選手を更新しました ID: ${id}`);
    } catch (e) {
        console.error("選手更新エラー: ", e);
        alert('選手の更新に失敗しました。詳細: ' + e.message);
    }
}

// loadPlayers() を onSnapshot を使ったリアルタイム監視に置き換える
function startListeningToPlayers() {
    if (!db) {
        console.error("Firestore database (db) is not initialized.");
        playerListDiv.textContent = '初期化中...';
        return;
    }

    playerListDiv.innerHTML = '読み込み中...'; 

    // 以前のリスナーがあれば解除
    if (unsubscribeFromPlayers) {
        unsubscribeFromPlayers();
    }

    // クエリを作成 (入学年でソート)
    const playersCollection = collection(db, "players");
    const q = query(playersCollection, orderBy("enrollmentYear"));

    // リアルタイムリスナーを開始
    unsubscribeFromPlayers = onSnapshot(q, (querySnapshot) => {
        const playersData = [];
        querySnapshot.forEach((doc) => {
            playersData.push({ id: doc.id, ...doc.data() }); 
        });

        // データが取得されたらUIを更新
        updatePlayerListUI(playersData); 
    }, (error) => {
        console.error("データの読み込みエラー (onSnapshot):", error);
        playerListDiv.textContent = `データの読み込みに失敗しました。詳細: ${error.message}`; 
    });
}

// ユーザーインターフェースを更新する独立した関数
function updatePlayerListUI(playersData = []) {
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

        // ログインしている場合のみ編集・削除ボタンを表示
        if (currentLoggedInUser) {
            const editButton = document.createElement('button');
            editButton.textContent = '編集';
            editButton.style.marginLeft = '5px';
            editButton.addEventListener('click', () => {
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

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', async () => {
                await deletePlayer(player.id); 
            });

            playerEntry.appendChild(editButton);
            playerEntry.appendChild(deleteButton);
        }
        playerListDiv.appendChild(playerEntry);
        playerIndex++;
    });
}


async function deletePlayer(id) {
    if (!currentLoggedInUser) {
        alert('選手を削除するにはログインが必要です。');
        return;
    }

    if (confirm('本当にこの選手を削除しますか？')) { 
        try {
            await deleteDoc(doc(db, "players", id));
            console.log("選手を削除しました ID: ", id);
            // loadPlayers() を呼び出す代わりに、onSnapshotが自動的に更新を処理します。
        } catch (e) {
            console.error("選手削除エラー: ", e);
            alert('選手の削除に失敗しました。詳細: ' + e.message); 
        }
    }
}
