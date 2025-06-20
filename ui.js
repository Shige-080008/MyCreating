// ui.js

// Firebase Firestoreの登録・更新・削除関数をインポート
import { addPlayer, updatePlayer, deletePlayer } from './firestore.js';
// 認証のログイン状態をインポート（編集・削除ボタンの表示制御用）
import { currentUser } from './auth.js';

// HTML要素への参照を保持する変数群
let regYearEl;
let regNameEl;
let regThrowEl;
let regDandouEl;
let regMeetEl;
let regPowerEl;
let regSpeedEl;
let regArmEl;
let regDefenseEl;
let regCatchEl;
let regMemoEl;
let regBtnEl;
let clearBtnEl;

let playerListTbodyEl;
let authStatusEl;
let authBtnEl;
let regRowEl;

/**
 * UI要素を取得し、それらへの参照をグローバル変数に格納する関数
 * 他のモジュールからUI要素にアクセスできるように、オブジェクトとして返します
 */
export function getUIElements() {
    // 登録用の入力フィールド
    regYearEl = document.getElementById('regist_year');
    regNameEl = document.getElementById('regist_name');
    regThrowEl = document.getElementById('regist_throw');
    regDandouEl = document.getElementById('regist_dandou');
    regMeetEl = document.getElementById('regist_meet');
    regPowerEl = document.getElementById('regist_power');
    regSpeedEl = document.getElementById('regist_speed');
    regArmEl = document.getElementById('regist_arm');
    regDefenseEl = document.getElementById('regist_defense');
    regCatchEl = document.getElementById('regist_catch');
    regMemoEl = document.getElementById('regist_memo');
    regBtnEl = document.getElementById('regist_btn');
    clearBtnEl = document.getElementById('clear-btn');

    playerListTbodyEl = document.querySelector('#player-list-table tbody');
    authStatusEl = document.getElementById('auth-status');
    authBtnEl = document.getElementById('auth-btn');
    regRowEl = document.getElementById('regist_row');

    return {
        regYear: regYearEl,
        regName: regNameEl,
        regThrow: regThrowEl,
        regDandou: regDandouEl,
        regMeet: regMeetEl,
        regPower: regPowerEl,
        regSpeed: regSpeedEl,
        regArm: regArmEl,
        regDefense: regDefenseEl,
        regCatch: regCatchEl,
        regMemo: regMemoEl,
        regBtn: regBtnEl,
        clearBtn: clearBtnEl,
        playerListTbody: playerListTbodyEl,
        authStatusEl: authStatusEl,
        authBtn: authBtnEl,
        regRowEl: regRowEl,
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
    regBtnEl.addEventListener('click', handleRegSubmit);
    // クリアボタンのイベントリスナーを設定
    clearBtnEl.addEventListener('click', clearRegForm);
}

/**
 * 登録フォーム（テーブル内の登録行）送信時の処理
 * @param {Event} event - クリックイベントオブジェクト
 */
async function handleRegSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('選手を登録するにはログインが必要です。');
        return;
    }

    // 各入力フィールドから値を取得し、数値に変換
    const enrollmentYear = parseInt(regYearEl.value);
    const name = regNameEl.value;
    const throwing = parseInt(regThrowEl.value);
    const dandou = parseInt(regDandouEl.value);
    const meet = parseInt(regMeetEl.value);
    const power = parseInt(regPowerEl.value);
    const speed = parseInt(regSpeedEl.value);
    const armStrength = parseInt(regArmEl.value);
    const defense = parseInt(regDefenseEl.value);
    const catching = parseInt(regCatchEl.value);
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

    // 登録処理に選手名を渡すように変更
    await addPlayer(playerData, name);
    clearRegForm();
}

/**
 * 登録フォームの入力フィールドをすべてクリアする関数
 */
export function clearRegForm() {
    regYearEl.value = '';
    regNameEl.value = '';
    regThrowEl.value = '';
    regDandouEl.value = '';
    regMeetEl.value = '';
    regPowerEl.value = '';
    regSpeedEl.value = '';
    regArmEl.value = '';
    regDefenseEl.value = '';
    regCatchEl.value = '';
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
    Array.from(playerListTbodyEl.children).forEach(child => {
        if (child.id !== 'regist_row') {
            child.remove();
        }
    });

    // エラーメッセージがあれば削除
    const errorRow = playerListTbodyEl.querySelector('.error-message-row');
    if (errorRow) {
        errorRow.remove();
    }

    if (playersData.length === 0) {
        const noPlayerRow = playerListTbodyEl.insertRow(0);
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
        const row = playerListTbodyEl.insertRow(index);
        row.dataset.playerId = player.id; // 行に選手IDをデータ属性として保持

        // 学年と入学年
        const playerInfoCell = row.insertCell();
        playerInfoCell.classList.add('player-info-cell');
        const gradeP = document.createElement('p');
        gradeP.classList.add('player-grade');
        gradeP.textContent = `${player.calculatedGrade}年生`;

        const enrollmentYearP = document.createElement('p');
        enrollmentYearP.classList.add('enrollment-year');
        enrollmentYearP.textContent = `(入学${player.enrollmentYear}年)`;
        playerInfoCell.appendChild(gradeP);
        playerInfoCell.appendChild(enrollmentYearP);

        // 選手名 (テキスト表示)
        const nameCell = row.insertCell(); // Get the cell for the name
        nameCell.textContent = player.name;
        nameCell.classList.add('name-cell'); // Add this class

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
            if (currentUser) {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = player[stat.key];
                input.min = stat.min;
                input.max = stat.max;
                input.dataset.field = stat.key;
                input.dataset.playerId = player.id;
                input.classList.add('stat-input');

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
        if (currentUser) {
            const textarea = document.createElement('textarea');
            textarea.value = player.memo || ''; // メモがなければ空文字列
            textarea.maxLength = 200;
            textarea.rows = 2; // 表示行数を調整
            textarea.classList.add('memo-textarea');
            textarea.dataset.field = 'memo';
            textarea.dataset.playerId = player.id;
            memoCell.appendChild(textarea);
        } else {
            const memoDiv = document.createElement('div');
            memoDiv.classList.add('memo-display');
            memoDiv.textContent = player.memo || '-'; // メモがなければハイフン表示
            memoCell.appendChild(memoDiv);
        }


        // 操作ボタン
        const actionCell = row.insertCell();
        actionCell.classList.add('action-buttons');

        // ログインしている場合のみ、更新・削除ボタンを表示
        if (currentUser) {
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
                // 更新処理に選手名を渡すように変更
                await updatePlayer(player.id, updatedData, player.name);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', async () => {
                // 削除関数に選手名を渡すように変更
                await deletePlayer(player.id, player.name); // 削除関数を呼び出し
            });

            actionCell.appendChild(updateRowButton);
            actionCell.appendChild(deleteButton);
        } else {
            actionCell.textContent = '-'; // 未ログイン時は何も表示しないか、'-'などを表示
        }
    });

    // 最後に登録行を再度追加 (DOM操作で移動されるため、毎回明示的に最後にする)
    playerListTbodyEl.appendChild(regRowEl);
}