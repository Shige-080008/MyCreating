// Firebase Firestoreの登録・更新・削除関数をインポート
import { addPlayer, updatePlayer, deletePlayer } from './firestore.js';
// 認証のログイン状態をインポート（編集・削除ボタンの表示制御用）
import { currentLoggedInUser } from './auth.js';

// HTML要素への参照を保持する変数群 (ID名を変更)
let regEnrollmentYearEl; // 登録用入学年
let regNameEl;         // 登録用選手名
let regThrowingEl;     // 登録用送球
let regDandouEl;       // 登録用弾道
let regMeetEl;         // 登録用ミート
let regPowerEl;       // 登録用パワー
let regSpeedEl;        // 登録用走力
let regArmStrengthEl;  // 登録用肩力
let regDefenseEl;      // 登録用守備力
let regCatchingEl;     // 登録用捕球
let regMemoEl;         // 登録用メモ  <-- 追加
let regRegisterButtonEl; // 登録ボタン
let regClearButtonEl;    // クリアボタン

let playerListTableBodyEl; // tbody要素
let authStatusDivEl;
let authButtonEl;
let registrationRowEl; // 新規登録行のDOM要素

/**
 * UI要素を取得し、それらへの参照をグローバル変数に格納する関数
 * 他のモジュールからUI要素にアクセスできるように、オブジェクトとして返します
 */
export function getUIElements() {
    // 登録用の入力フィールド
    regEnrollmentYearEl = document.getElementById('reg-enrollment-year');
    regNameEl = document.getElementById('reg-player-name');
    regThrowingEl = document.getElementById('reg-player-throwing');
    regDandouEl = document.getElementById('reg-player-dandou');
    regMeetEl = document.getElementById('reg-player-meet');
    regPowerEl = document.getElementById('reg-player-power');
    regSpeedEl = document.getElementById('reg-player-speed');
    regArmStrengthEl = document.getElementById('reg-player-armstrength');
    regDefenseEl = document.getElementById('reg-player-defense');
    regCatchingEl = document.getElementById('reg-player-catching');
    regMemoEl = document.getElementById('reg-player-memo'); // <-- 追加
    regRegisterButtonEl = document.getElementById('reg-player-register-button');
    regClearButtonEl = document.getElementById('reg-player-clear-button');

    playerListTableBodyEl = document.querySelector('#player-list-table tbody'); // tbodyを選択
    authStatusDivEl = document.getElementById('auth-status');
    authButtonEl = document.getElementById('auth-button');
    registrationRowEl = document.getElementById('registration-row'); // 新規登録行を取得

    return {
        registrationEnrollmentYear: regEnrollmentYearEl,
        registrationName: regNameEl,
        registrationThrowing: regThrowingEl,
        registrationDandou: regDandouEl,
        registrationMeet: regMeetEl,
        registrationPower: regPowerEl,
        registrationSpeed: regSpeedEl,
        registrationArmStrength: regArmStrengthEl,
        registrationDefense: regDefenseEl,
        registrationCatching: regCatchingEl,
        registrationMemo: regMemoEl, // <-- 追加
        registrationRegisterButton: regRegisterButtonEl,
        registrationClearButton: regClearButtonEl,
        playerListTableBody: playerListTableBodyEl,
        authStatusDiv: authStatusDivEl,
        authButton: authButtonEl,
        registrationRow: registrationRowEl, // 登録行も返す
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
    regRegisterButtonEl.addEventListener('click', handleRegistrationFormSubmit);
    // クリアボタンのイベントリスナーを設定
    regClearButtonEl.addEventListener('click', clearRegistrationForm);
}

/**
 * 登録フォーム（テーブル内の登録行）送信時の処理
 * @param {Event} event - クリックイベントオブジェクト
 */
async function handleRegistrationFormSubmit(event) {
    event.preventDefault();  

    if (!currentLoggedInUser) {
        alert('選手を登録するにはログインが必要です。');
        return;
    }

    // 各入力フィールドから値を取得し、数値に変換
    const enrollmentYear = parseInt(regEnrollmentYearEl.value);
    const name = regNameEl.value;
    const throwing = parseInt(regThrowingEl.value);
    const dandou = parseInt(regDandouEl.value);
    const meet = parseInt(regMeetEl.value);
    const power = parseInt(regPowerEl.value);
    const speed = parseInt(regSpeedEl.value);
    const armStrength = parseInt(regArmStrengthEl.value);
    const defense = parseInt(regDefenseEl.value);
    const catching = parseInt(regCatchingEl.value);
    const memo = regMemoEl.value; // <-- 追加

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
        memo: memo, // <-- 追加
    };

    // 登録処理
    await addPlayer(playerData);
    clearRegistrationForm(); // 登録後にフォームをクリア
}

/**
 * 登録フォームの入力フィールドをすべてクリアする関数
 */
export function clearRegistrationForm() {
    regEnrollmentYearEl.value = '';
    regNameEl.value = '';
    regThrowingEl.value = '';
    regDandouEl.value = '';
    regMeetEl.value = '';
    regPowerEl.value = '';
    regSpeedEl.value = '';
    regArmStrengthEl.value = '';
    regDefenseEl.value = '';
    regCatchingEl.value = '';
    regMemoEl.value = ''; // <-- 追加
}

/**
 * 数値ステータスをアルファベットランクに変換する関数
 * @param {string} statType - ステータスの種類 ('throwing', 'meet', 'power', ...)
 * @param {number} value - ステータスの数値
 * @returns {string} アルファベットランク
 */
function convertStatToGrade(statType, value) {
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
    element.className = '';
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
    // 登録行は残すため、registrationRowEl以外のtr要素を削除
    Array.from(playerListTableBodyEl.children).forEach(child => {
        if (child.id !== 'registration-row') {
            child.remove();
        }
    });

    // エラーメッセージがあれば削除
    const errorRow = playerListTableBodyEl.querySelector('.error-message-row');
    if (errorRow) {
        errorRow.remove();
    }

    if (playersData.length === 0) {
        const noPlayerRow = playerListTableBodyEl.insertRow(0); // 登録行の前に挿入
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
        const row = playerListTableBodyEl.insertRow(index); // 取得したデータの順に挿入
        row.dataset.playerId = player.id; // 行に選手IDをデータ属性として保持

        // 学年と入学年
        const playerInfoCell = row.insertCell();
        playerInfoCell.classList.add('player-info-cell');
        const gradeP = document.createElement('p');
        gradeP.classList.add('player-grade');
        gradeP.textContent = `${player.calculatedGrade}年生`;
         
        const enrollmentYearP = document.createElement('p');
        enrollmentYearP.classList.add('player-enrollment-year');
        enrollmentYearP.textContent = `(${player.enrollmentYear}年入学)`;  
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
            if (currentLoggedInUser) {
                // ログイン中は編集可能なinputタグを表示
                const input = document.createElement('input');
                input.type = 'number';
                input.value = player[stat.key];
                input.min = stat.min;
                input.max = stat.max;
                input.dataset.field = stat.key; // Firestoreのフィールド名をデータ属性として保持
                input.dataset.playerId = player.id; // 選手IDをデータ属性として保持
                cell.appendChild(input);
            } else {
                // 未ログイン中はアルファベットランクと数値を両方表示
                const container = document.createElement('div');
                container.classList.add('stat-display-container');

                const gradeSpan = document.createElement('span');
                const gradeValue = convertStatToGrade(stat.key, player[stat.key]);
                gradeSpan.textContent = gradeValue;
                 
                // 弾道は数値そのままなので、色をつけない
                if (stat.key !== 'dandou') {
                    applyGradeColor(gradeSpan, stat.key, gradeValue);
                } else {
                    gradeSpan.classList.add('stat-grade'); // 弾道も見た目は大きく
                }

                const valueSpan = document.createElement('span');
                valueSpan.classList.add('stat-value');
                valueSpan.textContent = `(${player[stat.key]})`; // 数値を括弧で囲んで表示

                container.appendChild(gradeSpan);
                container.appendChild(valueSpan);
                cell.appendChild(container);
            }
        });

        // メモ列の追加
        const memoCell = row.insertCell();
        if (currentLoggedInUser) {
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
        if (currentLoggedInUser) {
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
    playerListTableBodyEl.appendChild(registrationRowEl);

    // ログイン状態に応じて登録行の表示/非表示を更新
    if (currentLoggedInUser) {
        registrationRowEl.style.display = 'table-row';
    } else {
        registrationRowEl.style.display = 'none';
        clearRegistrationForm(); // 非表示にする際はクリア
    }
}
