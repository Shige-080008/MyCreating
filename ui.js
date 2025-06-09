// Firestoreの登録・更新・削除関数をインポート
import { addPlayer, updatePlayer, deletePlayer } from './firestore.js';
// 認証のログイン状態をインポート（編集・削除ボタンの表示制御用）
import { currentLoggedInUser } from './auth.js';

// HTML要素への参照を保持する変数群
let enrollmentYearEl; 
let nameEl; 
let throwingEl; 
let dandouEl; 
let meetEl; 
let powerEl; 
let speedEl; 
let armStrengthEl; 
let defenseEl; 
let catchingEl; 
let registerButtonEl; 
let playerListDivEl; 
let playerFormEl; 
let authStatusDivEl;
let authButtonEl;

let editingPlayerId = null; // 現在編集中の選手のID

/**
 * UI要素を取得し、それらへの参照をグローバル変数に格納する関数
 * 他のモジュールからUI要素にアクセスできるように、オブジェクトとして返します
 */
export function getUIElements() {
    enrollmentYearEl = document.getElementById('enrollmentYear');
    nameEl = document.getElementById('name');
    throwingEl = document.getElementById('throwing');
    dandouEl = document.getElementById('dandou');
    meetEl = document.getElementById('meet');
    powerEl = document.getElementById('power');
    speedEl = document.getElementById('speed');
    armStrengthEl = document.getElementById('armStrength');
    defenseEl = document.getElementById('defense');
    catchingEl = document.getElementById('catching');
    registerButtonEl = document.getElementById('registerButton');
    playerListDivEl = document.getElementById('playerList');
    playerFormEl = document.getElementById('playerForm');
    authStatusDivEl = document.getElementById('authStatus');
    authButtonEl = document.getElementById('authButton');

    return {
        enrollmentYear: enrollmentYearEl,
        name: nameEl,
        throwing: throwingEl,
        dandou: dandouEl,
        meet: meetEl,
        power: powerEl,
        speed: speedEl,
        armStrength: armStrengthEl,
        defense: defenseEl,
        catching: catchingEl,
        registerButton: registerButtonEl,
        playerListDiv: playerListDivEl,
        playerForm: playerFormEl,
        authStatusDiv: authStatusDivEl,
        authButton: authButtonEl,
    };
}

/**
 * UIの初期化を行う関数
 * フォームのイベントリスナーを設定します
 */
export function initUI() {
    // getUIElementsを呼び出して要素への参照を確保
    getUIElements(); 

    // フォーム送信時のイベントリスナーを設定
    playerFormEl.addEventListener('submit', handlePlayerFormSubmit);
}

/**
 * フォーム送信時の処理
 * @param {Event} event - submitイベントオブジェクト
 */
async function handlePlayerFormSubmit(event) {
    event.preventDefault(); 

    if (!currentLoggedInUser) {
        alert('選手を登録・更新するにはログインが必要です。');
        return;
    }

    // 各入力フィールドから値を取得し、数値に変換
    const enrollmentYear = parseInt(enrollmentYearEl.value);
    const name = nameEl.value;
    const throwing = parseInt(throwingEl.value);
    const dandou = parseInt(dandouEl.value);
    const meet = parseInt(meetEl.value);
    const power = parseInt(powerEl.value);
    const speed = parseInt(speedEl.value);
    const armStrength = parseInt(armStrengthEl.value);
    const defense = parseInt(defenseEl.value);
    const catching = parseInt(catchingEl.value);

    // 入力値のバリデーション
    if (!name || isNaN(enrollmentYear) || isNaN(throwing) || isNaN(dandou) || 
        isNaN(meet) || isNaN(power) || isNaN(speed) || isNaN(armStrength) || 
        isNaN(defense) || isNaN(catching)) {
        alert('全ての項目を正しく入力してください！');
        return;
    }

    const playerData = {
        enrollmentYear: enrollmentYear,
        name: name,
        throwing: throwing,
        dandou: dandou,
        meet: meet,
        power: power,
        speed: speed,
        armStrength: armStrength,
        defense: defense,
        catching: catching,
    };

    if (editingPlayerId) {
        await updatePlayer(editingPlayerId, playerData);
        editingPlayerId = null;
        registerButtonEl.textContent = '選手を登録する';
    } else {
        await addPlayer(playerData);
    }

    clearForm();
}

/**
 * フォームの入力フィールドをすべてクリアする関数
 */
export function clearForm() {
    enrollmentYearEl.value = '';
    nameEl.value = '';
    throwingEl.value = '';
    dandouEl.value = '';
    meetEl.value = '';
    powerEl.value = '';
    speedEl.value = '';
    armStrengthEl.value = '';
    defenseEl.value = '';
    catchingEl.value = '';
}

/**
 * 選手リストのUI（表示）を更新する関数
 * @param {Array} playersData - 表示する選手データの配列
 */
export function updatePlayerListUI(playersData = []) {
    playerListDivEl.innerHTML = ''; // 現在の選手リストをクリア

    if (playersData.length === 0) {
        playerListDivEl.textContent = 'まだ選手がいません。';
        return;
    }

    let playerIndex = 1; 
    playersData.forEach((player) => { 
        const playerEntry = document.createElement('p');
        playerEntry.textContent = 
            `${playerIndex}. 入学年:${player.enrollmentYear} 選手名:${player.name} ` + 
            `送球:${player.throwing} 弾道:${player.dandou} ミート:${player.meet} ` +
            `パワー:${player.power} 走力:${player.speed} 肩力:${player.armStrength} ` +
            `守備力:${player.defense} 捕球:${player.catching}`;

        // ログインしている場合のみ、編集・削除ボタンを表示
        if (currentLoggedInUser) {
            const editButton = document.createElement('button');
            editButton.textContent = '編集';
            editButton.style.marginLeft = '5px';
            editButton.addEventListener('click', () => {
                // 編集対象の選手データをフォームにセット
                enrollmentYearEl.value = player.enrollmentYear;
                nameEl.value = player.name;
                throwingEl.value = player.throwing;
                dandouEl.value = player.dandou;
                meetEl.value = player.meet;
                powerEl.value = player.power;
                speedEl.value = player.speed;
                armStrengthEl.value = player.armStrength;
                defenseEl.value = player.defense;
                catchingEl.value = player.catching;
                editingPlayerId = player.id; // 編集中の選手IDをセット
                registerButtonEl.textContent = '選手を更新する'; // ボタンのテキストを変更
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', async () => {
                await deletePlayer(player.id); // 削除関数を呼び出し
            });

            playerEntry.appendChild(editButton);
            playerEntry.appendChild(deleteButton);
        }
        playerListDivEl.appendChild(playerEntry);
        playerIndex++;
    });
}

/**
 * 編集中の選手IDを取得する関数
 * @returns {string|null} 編集中の選手ID、またはnull
 */
export function getEditingPlayerId() {
    return editingPlayerId;
}

/**
 * 編集中の選手IDを設定する関数
 * @param {string|null} id - 設定する選手ID
 */
export function setEditingPlayerId(id) {
    editingPlayerId = id;
}