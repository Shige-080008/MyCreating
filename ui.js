// ui.js

// Firebase Firestoreの登録・更新・削除関数をインポート
import { addPlayer, updatePlayer, deletePlayer } from './firestore.js';
// 認証のログイン状態をインポート（編集・削除ボタンの表示制御用）
import { currentUser } from './auth.js'; // currentLoggedInUser を currentUser に変更

// HTML要素への参照を保持する変数群 (ID名を変更)
let regYearEl;      // regEnrollmentYearEl を regYearEl に短縮
let regNameEl;      // regNameEl (変更なし、短いので)
let regThrowEl;     // regThrowingEl を regThrowEl に短縮
let regDandouEl;    // regDandouEl (変更なし、短いので)
let regMeetEl;      // regMeetEl (変更なし、短いので)
let regPowerEl;     // regPowerEl (変更なし、短いので)
let regSpeedEl;     // regSpeedEl (変更なし、短いので)
let regArmEl;       // regArmStrengthEl を regArmEl に短縮
let regDefenseEl;   // regDefenseEl (変更なし、短いので)
let regCatchEl;     // regCatchingEl を regCatchEl に短縮
let regMemoEl;      // regMemoEl (変更なし、短いので)
let regBtnEl;       // regRegisterButtonEl を regBtnEl に短縮
let clearBtnEl;     // regClearButtonEl を clearBtnEl に短縮

let playerListTbodyEl; // playerListTableBodyEl を playerListTbodyEl に短縮
let authStatusEl;      // authStatusDivEl を authStatusEl に短縮
let authBtnEl;         // authButtonEl を authBtnEl に短縮
let regRowEl;          // registrationRowEl を regRowEl に短縮

/**
 * UI要素を取得し、それらへの参照をグローバル変数に格納する関数
 * 他のモジュールからUI要素にアクセスできるように、オブジェクトとして返します
 */
export function getUIElements() {
    // 登録用の入力フィールド
    regYearEl = document.getElementById('reg-year');         // ID名変更
    regNameEl = document.getElementById('reg-name');         // ID名変更
    regThrowEl = document.getElementById('reg-throw');       // ID名変更
    regDandouEl = document.getElementById('reg-dandou');     // ID名変更
    regMeetEl = document.getElementById('reg-meet');         // ID名変更
    regPowerEl = document.getElementById('reg-power');       // ID名変更
    regSpeedEl = document.getElementById('reg-speed');       // ID名変更
    regArmEl = document.getElementById('reg-arm');           // ID名変更
    regDefenseEl = document.getElementById('reg-defense');   // ID名変更
    regCatchEl = document.getElementById('reg-catch');       // ID名変更
    regMemoEl = document.getElementById('reg-memo');         // ID名変更
    regBtnEl = document.getElementById('reg-btn');           // ID名変更
    clearBtnEl = document.getElementById('clear-btn');       // ID名変更

    playerListTbodyEl = document.querySelector('#player-list-table tbody'); // tbodyを選択
    authStatusEl = document.getElementById('auth-status');
    authBtnEl = document.getElementById('auth-btn');         // ID名変更
    regRowEl = document.getElementById('reg-row');           // ID名変更

    return {
        regYear: regYearEl,           // プロパティ名変更
        regName: regNameEl,           // プロパティ名変更
        regThrow: regThrowEl,         // プロパティ名変更
        regDandou: regDandouEl,       // プロパティ名変更
        regMeet: regMeetEl,           // プロパティ名変更
        regPower: regPowerEl,         // プロパティ名変更
        regSpeed: regSpeedEl,         // プロパティ名変更
        regArm: regArmEl,             // プロパティ名変更
        regDefense: regDefenseEl,     // プロパティ名変更
        regCatch: regCatchEl,         // プロパティ名変更
        regMemo: regMemoEl,           // プロパティ名変更
        regBtn: regBtnEl,             // プロパティ名変更
        clearBtn: clearBtnEl,         // プロパティ名変更
        playerListTbody: playerListTbodyEl, // プロパティ名変更
        authStatusEl: authStatusEl,   // プロパティ名変更
        authBtn: authBtnEl,           // プロパティ名変更
        regRowEl: regRowEl,           // プロパティ名変更
    };
}

/**
 * UIの初期化を行う関数
 * フォームのイベントリスナーを設定します
 */
export function initUI() {
    // getUIElementsを呼び出して要素への参照を確保
    getUIElements();  

    // 登録ボタンのイベントリスナーを設定
    regBtnEl.addEventListener('click', handleRegSubmit); // regRegisterButtonEl と handleRegistrationFormSubmit を変更
    // クリアボタンのイベントリスナーを設定
    clearBtnEl.addEventListener('click', clearRegForm); // regClearButtonEl と clearRegistrationForm を変更
}

/**
 * 登録フォーム（テーブル内の登録行）送信時の処理
 * @param {Event} event - クリックイベントオブジェクト
 */
async function handleRegSubmit(event) { // handleRegistrationFormSubmit を handleRegSubmit に変更
    event.preventDefault();  

    if (!currentUser) { // currentLoggedInUser を currentUser に変更
        alert('選手を登録するにはログインが必要です。');
        return;
    }

    // 各入力フィールドから値を取得し、数値に変換
    const enrollmentYear = parseInt(regYearEl.value);     // regEnrollmentYearEl を regYearEl に変更
    const name = regNameEl.value;
    const throwing = parseInt(regThrowEl.value);          // regThrowingEl を regThrowEl に変更
    const dandou = parseInt(regDandouEl.value);
    const meet = parseInt(regMeetEl.value);
    const power = parseInt(regPowerEl.value);
    const speed = parseInt(regSpeedEl.value);
    const armStrength = parseInt(regArmEl.value);         // regArmStrengthEl を regArmEl に変更
    const defense = parseInt(regDefenseEl.value);
    const catching = parseInt(regCatchEl.value);          // regCatchingEl を regCatchEl に変更
    const memo = regMemoEl.value;

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
        memo: memo,
    };

    // 登録処理
    await addPlayer(playerData);
    clearRegForm(); // clearRegistrationForm を clearRegForm に変更
}

/**
 * 登録フォームの入力フィールドをすべてクリアする関数
 */
export function clearRegForm() { // clearRegistrationForm を clearRegForm に変更
    regYearEl.value = '';     // regEnrollmentYearEl を regYearEl に変更
    regNameEl.value = '';
    regThrowEl.value = '';    // regThrowingEl を regThrowEl に変更
    regDandouEl.value = '';
    regMeetEl.value = '';
    regPowerEl.value = '';
    regSpeedEl.value = '';
    regArmEl.value = '';      // regArmStrengthEl を regArmEl に変更
    regDefenseEl.value = '';
    regCatchEl.value = '';    // regCatchingEl を regCatchEl に変更
    regMemoEl.value = '';
}

/**
 * 数値ステータスをアルファベットランクに変換する関数
 * @param {string} statType - ステータスの種類 ('throwing', 'meet', 'power', ...)
 * @param {number} value - ステータスの数値
 * @returns {string} アルファベットランク
 */
function convertStatToGrade(statType, value) {
    // 入力値が不正な場合（NaNなど）は空文字列を返す
    if (isNaN(value)) {
        return '';
    }

    if (statType === 'throwing') {
        const grades = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
        // 送球は0～7の数値がG～Sに対応
        if (value >= 0 && value <= 7) {
            return grades[value];
        }
    } else if (['meet', 'power', 'speed', 'armStrength', 'defense', 'catching'].includes(statType)) {
        // view.htmlのrank関数に合わせて分類
        if (value >= 90) return 'S';
        if (value >= 80) return 'A';
        if (value >= 70) return 'B';
        if (value >= 60) return 'C';
        if (value >= 50) return 'D';
        if (value >= 40) return 'E';
        if (value >= 20) return 'F';
        if (value >= 1) return 'G';
        if (value === 0) return 'G'; // 0の場合もGとする
    } else if (statType === 'dandou') {
        // 弾道は数値そのまま表示
        return value.toString();
    }
    return ''; // 不明な場合は空文字列
}

/**
 * アルファベットランクに基づいて要素に色を適用する関数
 * @param {HTMLElement} element - 色を適用するDOM要素
 * @param {string} statType - ステータスの種類 ('throwing', 'meet', ...)
 * @param {string} grade - アルファベットランク (例: 'A', 'S', 'G')
 */
function applyGradeColor(element, statType, grade) {
    // 既存のクラスを一度クリア
    element.classList.remove('grade-G', 'grade-F', 'grade-E', 'grade-D', 'grade-C', 'grade-B', 'grade-A', 'grade-S',
                             'grade-throwing-G', 'grade-throwing-F', 'grade-throwing-E', 'grade-throwing-D',
                             'grade-throwing-C', 'grade-throwing-B', 'grade-throwing-A', 'grade-throwing-S');

    // 特定のステータスに合わせたクラスを追加 (例: throwing-G)
    // それ以外のステータスは汎用的なクラス (例: grade-G)
    if (statType === 'throwing') {
        element.classList.add(`grade-${statType}-${grade}`);
    } else if (['meet', 'power', 'speed', 'armStrength', 'defense', 'catching'].includes(statType)) {
        element.classList.add(`grade-${grade}`);
    }
    element.classList.add('stat-grade'); // 基本のスタイルも追加
}

/**
 * 選手リストのUI（表示）を更新する関数
 * @param {Array} playersData - 表示する選手データの配列
 */
export function updatePlayerListUI(playersData = []) {
    // まず、既存の選手データ行をすべて削除
    // 登録行は残すため、regRowEl以外のtr要素を削除
    Array.from(playerListTbodyEl.children).forEach(child => { // playerListTableBodyEl を playerListTbodyEl に変更
        if (child.id !== 'reg-row') { // registrationRow を regRow に変更
            child.remove();
        }
    });

    // エラーメッセージがあれば削除
    const errorRow = playerListTbodyEl.querySelector('.error-message-row'); // playerListTableBodyEl を playerListTbodyEl に変更
    if (errorRow) {
        errorRow.remove();
    }

    if (playersData.length === 0) {
        const noPlayerRow = playerListTbodyEl.insertRow(0); // 登録行の前に挿入 // playerListTableBodyEl を playerListTbodyEl に変更
        const cell = noPlayerRow.insertCell();
        cell.colSpan = 12; // 全ての列を結合 (メモ列が追加されたため11から12へ変更)
        cell.textContent = 'まだ選手がいません。';
        noPlayerRow.classList.add('no-player-message');
    }

    // 全ての選手データから最も新しい入学年を取得
    const allEnrollmentYears = playersData.map(player => player.enrollmentYear);
    const latestEnrollmentYear = allEnrollmentYears.length > 0 ? Math.max(...allEnrollmentYears) : null;

    // 各選手に学年を割り当てる
    const playersWithGrade = playersData.map(player => {
        let grade = null;
        if (latestEnrollmentYear !== null) {
            grade = (latestEnrollmentYear - player.enrollmentYear) + 1;
        }
        return { ...player, calculatedGrade: grade };
    }).filter(player => player.calculatedGrade >= 1 && player.calculatedGrade <= 3); // 1年生から3年生までをフィルタリング

    // 学年（降順）、入学年（降順）、選手名（昇順）でソート
    playersWithGrade.sort((a, b) => {
        // 学年でソート（3年生 > 2年生 > 1年生）
        if (a.calculatedGrade !== b.calculatedGrade) {
            return b.calculatedGrade - a.calculatedGrade;
        }
        // 同学年の場合、入学年でソート（新しい入学年が上位）
        if (a.enrollmentYear !== b.enrollmentYear) {
            return b.enrollmentYear - a.enrollmentYear;
        }
        // 同一入学年の場合、選手名でソート
        return a.name.localeCompare(b.name);
    });

    playersWithGrade.forEach((player, index) => {  
        const row = playerListTbodyEl.insertRow(index); // 取得したデータの順に挿入 // playerListTableBodyEl を playerListTbodyEl に変更
        row.dataset.playerId = player.id; // 行に選手IDをデータ属性として保持

        // 学年と入学年
        const playerInfoCell = row.insertCell();
        playerInfoCell.classList.add('player-info-cell');
        const gradeP = document.createElement('p');
        gradeP.classList.add('player-grade');
        gradeP.textContent = `${player.calculatedGrade}年生`;
          
        const enrollmentYearP = document.createElement('p');
        enrollmentYearP.classList.add('player-enrollment-year');
        enrollmentYearP.textContent = `(入学${player.enrollmentYear}年)`;  
        playerInfoCell.appendChild(gradeP);
        playerInfoCell.appendChild(enrollmentYearP);
          
        // 選手名 (テキスト表示)
        row.insertCell().textContent = player.name;

        // 各ステータスをアルファベットランクと数値、またはinputタグとして描画
        const stats = [
            { key: 'throwing', min: 0, max: 7 },
            { key: 'dandou', min: 1, max: 4 },
            { key: 'meet', min: 1, max: 100 },
            { key: 'power', min: 1, max: 100 },
            { key: 'speed', min: 1, max: 100 },
            { key: 'armStrength', min: 1, max: 100 },
            { key: 'defense', min: 1, max: 100 },
            { key: 'catching', min: 1, max: 100 }
        ];

        stats.forEach(stat => {
            const cell = row.insertCell();
            cell.classList.add('stat-cell-container'); // 親要素にクラスを追加

            const gradeSpan = document.createElement('span');
            gradeSpan.classList.add('stat-grade');

            const valueSpan = document.createElement('span');
            valueSpan.classList.add('stat-value');

            // 初期表示のランクと数値を設定
            const initialGradeValue = convertStatToGrade(stat.key, player[stat.key]);
            gradeSpan.textContent = initialGradeValue;
            valueSpan.textContent = player[stat.key]; // 数値のみを表示

            // 弾道以外のランクに色を適用
            if (stat.key !== 'dandou') {
                applyGradeColor(gradeSpan, stat.key, initialGradeValue);
            }

            cell.appendChild(gradeSpan);
            
            // ログイン中の場合のみ、入力欄を表示
            if (currentUser) { // currentLoggedInUser を currentUser に変更
                const input = document.createElement('input');
                input.type = 'number';
                input.value = player[stat.key];
                input.min = stat.min;
                input.max = stat.max;
                input.dataset.field = stat.key;
                input.dataset.playerId = player.id;
                input.classList.add('stat-input'); // 新しいクラスを追加

                // inputの値が変更されたらランク表示を更新するイベントリスナー
                input.addEventListener('input', (e) => {
                    const newValue = parseInt(e.target.value);
                    const newGrade = convertStatToGrade(stat.key, newValue);
                    gradeSpan.textContent = newGrade;
                    // valueSpan.textContent = newValue; // 数値はinput自身が表示するため不要
                    
                    // 弾道以外のランクに色を再適用
                    if (stat.key !== 'dandou') {
                        applyGradeColor(gradeSpan, stat.key, newGrade);
                    } else {
                           gradeSpan.classList.add('stat-grade'); // 弾道も見た目は大きく
                    }
                });
                cell.appendChild(input); // inputを直接セルの子要素として追加
            } else {
                // 未ログイン時は数値spanを表示
                cell.appendChild(valueSpan);
            }
        });

        // メモ列の追加
        const memoCell = row.insertCell();
        if (currentUser) { // currentLoggedInUser を currentUser に変更
            const textarea = document.createElement('textarea');
            textarea.value = player.memo || ''; // メモがなければ空文字列
            textarea.maxLength = 200;
            textarea.rows = 2; // 表示行数を調整
            textarea.classList.add('player-memo-textarea');
            textarea.dataset.field = 'memo';
            textarea.dataset.playerId = player.id;
            memoCell.appendChild(textarea);
        } else {
            const memoDiv = document.createElement('div');
            memoDiv.classList.add('player-memo-display');
            memoDiv.textContent = player.memo || '-'; // メモがなければハイフン表示
            memoCell.appendChild(memoDiv);
        }


        // 操作ボタン
        const actionCell = row.insertCell();
        actionCell.classList.add('action-buttons');

        // ログインしている場合のみ、更新・削除ボタンを表示
        if (currentUser) { // currentLoggedInUser を currentUser に変更
            const updateRowButton = document.createElement('button');
            updateRowButton.textContent = '更新';
            updateRowButton.classList.add('update-btn');
            updateRowButton.addEventListener('click', async () => {
                // その行の全てのinputとtextareaから最新のデータを取得して更新
                const updatedData = {};
                // 各inputのdataset.fieldを使ってデータを収集
                stats.forEach(stat => {
                    const inputEl = row.querySelector(`input[data-field="${stat.key}"]`);
                    if (inputEl) {
                        updatedData[stat.key] = parseInt(inputEl.value);
                    }
                });
                // メモのtextareaからデータを収集
                const memoTextarea = row.querySelector('textarea[data-field="memo"]');
                if (memoTextarea) {
                    updatedData.memo = memoTextarea.value;
                }
                await updatePlayer(player.id, updatedData);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', async () => {
                await deletePlayer(player.id); // 削除関数を呼び出し
            });

            actionCell.appendChild(updateRowButton);
            actionCell.appendChild(deleteButton);
        } else {
            actionCell.textContent = '-'; // 未ログイン時は何も表示しないか、'-'などを表示
        }
    });

    // 最後に登録行を再度追加 (DOM操作で移動されるため、毎回明示的に最後にする)
    playerListTbodyEl.appendChild(regRowEl); // playerListTableBodyEl と registrationRowEl を変更

    // ログイン状態に応じて登録行の表示/非表示を更新
    if (currentUser) { // currentLoggedInUser を currentUser に変更
        regRowEl.style.display = 'table-row'; // registrationRowEl を regRowEl に変更
    } else {
        // ここに以前の `registrationRowEl.style.display = 'none';` があったと思われますが、
        // auth.jsで既に処理されているため、二重の記述は不要です。
    }
}