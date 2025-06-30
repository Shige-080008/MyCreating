// ui.js

// Firebase Firestoreの登録・更新・卒業関数をインポート
import { addPlayer, updatePlayer, deletePlayer } from './firestore.js';
// 認証のログイン状態をインポート（編集・卒業ボタンの表示制御用）
import { currentUser } from './auth.js';

// HTML要素への参照を保持する変数群
let regYearInput; // 登録フォームの入学年入力フィールド
let regNameInput; // 登録フォームの選手名入力フィールド
let regPosi1Input; // 登録フォームの守備位置1選択フィールド
let regPosi2Input; // 登録フォームの守備位置2選択フィールド
let regPosi3Input; // 登録フォームの守備位置3選択フィールド
let regThrowInput; // 登録フォームの送球入力フィールド
let regDandouInput; // 登録フォームの弾道入力フィールド
let regMeetInput; // 登録フォームのミート入力フィールド
let regPowerInput; // 登録フォームのパワー入力フィールド
let regSpeedInput; // 登録フォームの走力入力フィールド
let regArmInput; // 登録フォームの肩力入力フィールド
let regDefenseInput; // 登録フォームの守備力入力フィールド
let regCatchInput; // 登録フォームの捕球入力フィールド
let regMemoInput; // 登録フォームのメモ入力フィールド
let regButton; // 登録ボタン
let clearButton; // クリアボタン

let playerListBody; // 選手リストを表示するテーブルのtbody要素
let authStatus; // 認証ステータスを表示する要素
let authButton; // 認証（ログイン/ログアウト）ボタン
let registRow; // 選手登録用のテーブル行

// 守備位置のソート順序を定義
const positionOrder = {
    '投手': 1,
    '捕手': 2,
    '一塁手': 3,
    '二塁手': 4,
    '三塁手': 5,
    '遊撃手': 6,
    '外野手': 7,
    '': 8, // 'なし' または空の選択
};

/**
 * UI要素を取得し、それらへの参照をグローバル変数に格納する関数
 * 他のモジュールからUI要素にアクセスできるように、オブジェクトとして返します
 */
export function getUIElements() {
    // 登録用の入力フィールドへの参照を取得
    regYearInput = document.getElementById('reginput-year');
    regNameInput = document.getElementById('reginput-name');
    regPosi1Input = document.getElementById('reginput-posi1');
    regPosi2Input = document.getElementById('reginput-posi2');
    regPosi3Input = document.getElementById('reginput-posi3');
    regThrowInput = document.getElementById('reginput-throw');
    regDandouInput = document.getElementById('reginput-dandou');
    regMeetInput = document.getElementById('reginput-meet');
    regPowerInput = document.getElementById('reginput-power');
    regSpeedInput = document.getElementById('reginput-speed');
    regArmInput = document.getElementById('reginput-arm');
    regDefenseInput = document.getElementById('reginput-defense');
    regCatchInput = document.getElementById('reginput-catch');
    regMemoInput = document.getElementById('reginput-memo');
    regButton = document.getElementById('reg-button');
    clearButton = document.getElementById('clear-button');

    // その他のUI要素への参照を取得
    playerListBody = document.querySelector('#table-player tbody');
    authStatus = document.getElementById('auth-state');
    authButton = document.getElementById('auth-button');
    registRow = document.getElementById('regist-row');

    // 取得したUI要素をオブジェクトとして返す
    return {
        regYear: regYearInput,
        regName: regNameInput,
        regPosition1: regPosi1Input,
        regPosition2: regPosi2Input,
        regPosition3: regPosi3Input,
        regThrow: regThrowInput,
        regDandou: regDandouInput,
        regMeet: regMeetInput,
        regPower: regPowerInput,
        regSpeed: regSpeedInput,
        regArmStrength: regArmInput,
        regDefense: regDefenseInput,
        regCatching: regCatchInput,
        regMemo: regMemoInput,
        regButton: regButton,
        clearButton: clearButton,
        playerListBody: playerListBody,
        authStatus: authStatus,
        authButton: authButton,
        registRow: registRow,
    };
}

/**
 * UIの初期化を行う関数
 * フォームのイベントリスナーを設定します
 */
export function initUI() {
    // getUIElementsを呼び出して要素への参照を確保
    getUIElements();

    // 登録ボタンのクリックイベントリスナーを設定
    regButton.addEventListener('click', handleRegSubmit);
    // クリアボタンのクリックイベントリスナーを設定
    clearButton.addEventListener('click', clearRegForm);

    // 新規登録フォームの数値入力フィールドの増減ボタンにイベントリスナーを追加
    document.querySelectorAll('#regist-row .input-set').forEach(container => {
        const input = container.querySelector('input[type="number"]');
        const decrementBtn = container.querySelector('.decrease-btn');
        const incrementBtn = container.querySelector('.increase-btn');

        // 減算ボタンがクリックされたら入力値を1減らす
        decrementBtn.addEventListener('click', () => {
            input.stepDown(); // 値を1減らす
            input.dispatchEvent(new Event('input')); // inputイベントを手動で発火させる（これにより、関連する処理が実行される）
        });
        // 加算ボタンがクリックされたら入力値を1増やす
        incrementBtn.addEventListener('click', () => {
            input.stepUp(); // 値を1増やす
            input.dispatchEvent(new Event('input')); // inputイベントを手動で発火させる
        });
    });
}

/**
 * 登録フォーム（テーブル内の登録行）送信時の処理
 * @param {Event} event - クリックイベントオブジェクト
 */
async function handleRegSubmit(event) {
    event.preventDefault(); // デフォルトのフォーム送信動作をキャンセル

    // ログインしていない場合は処理を中断
    if (!currentUser) {
        alert('選手を登録するにはログインが必要です。');
        return;
    }

    // 各入力フィールドから値を取得し、数値に変換
    const enrollmentYear = parseInt(regYearInput.value);
    const name = regNameInput.value;
    const position1 = regPosi1Input.value;
    const position2 = regPosi2Input.value;
    const position3 = regPosi3Input.value;
    const throwing = parseInt(regThrowInput.value);
    const dandou = parseInt(regDandouInput.value);
    const meet = parseInt(regMeetInput.value);
    const power = parseInt(regPowerInput.value);
    const speed = parseInt(regSpeedInput.value);
    const armStrength = parseInt(regArmInput.value);
    const defense = parseInt(regDefenseInput.value);
    const catching = parseInt(regCatchInput.value);
    const memo = regMemoInput.value;

    // 入力値のバリデーション（必須項目のチェック）
    if (!name || isNaN(enrollmentYear) || !position1 || isNaN(throwing) || isNaN(dandou) ||
        isNaN(meet) || isNaN(power) || isNaN(speed) || isNaN(armStrength) ||
        isNaN(defense) || isNaN(catching)) {
        alert('全ての項目を正しく入力してください！');
        return;
    }

    // 選手データをオブジェクトとしてまとめる
    const playerData = {
        enrollmentYear: enrollmentYear,
        name: name,
        positions: [position1, position2, position3].filter(p => p !== ''), // 空でない守備位置のみ配列に格納
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

    // Firestoreに選手データを追加する関数を呼び出し、選手名も渡す
    await addPlayer(playerData, name);
    clearRegForm(); // 登録フォームをクリア
}

/**
 * 登録フォームの入力フィールドをすべてクリアする関数
 */
export function clearRegForm() {
    regYearInput.value = '';
    regNameInput.value = '';
    regPosi1Input.value = '';
    regPosi2Input.value = '';
    regPosi3Input.value = '';
    regThrowInput.value = '';
    regDandouInput.value = '';
    regMeetInput.value = '';
    regPowerInput.value = '';
    regSpeedInput.value = '';
    regArmInput.value = '';
    regDefenseInput.value = '';
    regCatchInput.value = '';
    regMemoInput.value = '';
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
        // ミート、パワーなどのステータス変換
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
    // まず、既存の選手データ行をすべて卒業
    // 登録行は残すため、registRow以外のtr要素を卒業
    Array.from(playerListBody.children).forEach(child => {
        if (child.id !== 'regist-row') {
            child.remove();
        }
    });

    // エラーメッセージがあれば卒業
    const errorRow = playerListBody.querySelector('.error-message-row');
    if (errorRow) {
        errorRow.remove();
    }

    // 選手データがない場合のメッセージ表示
    if (playersData.length === 0) {
        const noPlayerRow = playerListBody.insertRow(0); // テーブルの先頭に新しい行を挿入
        const cell = noPlayerRow.insertCell(); // セルを挿入
        cell.colSpan = 13; // 全ての列を結合
        cell.textContent = 'まだ選手がいません。'; // メッセージを設定
        noPlayerRow.classList.add('no-player-message'); // クラスを追加
    }

    // 全ての選手データから最も新しい入学年を取得
    const all_years = playersData.map(player => player.enrollmentYear);
    const latest_year = all_years.length > 0 ? Math.max(...all_years) : null;

    // 各選手に学年を割り当てる
    const playersGrade = playersData.map(player => {
        let grade = null;
        if (latest_year !== null) {
            grade = (latest_year - player.enrollmentYear) + 1; // 学年を計算
        }
        return { ...player, calculatedGrade: grade }; // 計算した学年をデータに追加
    }).filter(player => player.calculatedGrade >= 1 && player.calculatedGrade <= 3); // 1年生から3年生までをフィルタリング

    // 学年（降順）、守備位置（優先順位）、入学年（降順）、選手名（昇順）でソート
    playersGrade.sort((a, b) => {
        // 学年でソート（3年生 > 2年生 > 1年生）
        if (a.calculatedGrade !== b.calculatedGrade) {
            return b.calculatedGrade - a.calculatedGrade;
        }
        // 同学年の場合、守備位置でソート
        const posA = a.positions && a.positions.length > 0 ? a.positions[0] : '';
        const posB = b.positions && b.positions.length > 0 ? b.positions[0] : '';
        if (positionOrder[posA] !== positionOrder[posB]) {
            return positionOrder[posA] - positionOrder[posB];
        }
        // 同一守備位置の場合、入学年でソート（新しい入学年が上位）
        if (a.enrollmentYear !== b.enrollmentYear) {
            return b.enrollmentYear - a.enrollmentYear;
        }
        // 同一入学年の場合、選手名でソート
        return a.name.localeCompare(b.name);
    });

    // ソートされた選手データを元にテーブルの行を作成・更新
    playersGrade.forEach((player, index) => {
        const row = playerListBody.insertRow(index); // 新しい行を挿入
        // 追加した新しい行に背景色を設定
        if (player.positions[0] == '投手') {
            row.classList.add('toushu-row'); // 行にクラスを追加
        } else if (player.positions[0] == '捕手') {
            row.classList.add('hosyu-row'); // 捕手の行にクラスを追加
        } else if (player.positions[0] == '外野手') {
            row.classList.add('gaiyasyu-row'); // 外野手の行にクラスを追加
        } else {
            row.classList.add('naiyasyu-row'); // 内野手の行にクラスを追加
        }
        row.dataset.playerId = player.id; // 行に選手IDをデータ属性として保持

        // 学年と入学年セルの作成
        const playerInfoCell = row.insertCell();
        playerInfoCell.classList.add('grade-cell');
        const gradeP = document.createElement('p');
        gradeP.classList.add('data-grade');
        gradeP.textContent = `${player.calculatedGrade}年生`;

        const enrollmentYearP = document.createElement('p');
        enrollmentYearP.classList.add('data-year');
        enrollmentYearP.textContent = `(入学${player.enrollmentYear}年)`;
        playerInfoCell.appendChild(gradeP);
        playerInfoCell.appendChild(enrollmentYearP);

        // 選手名セル (テキスト表示)
        const nameCell = row.insertCell();
        nameCell.textContent = player.name;
        nameCell.classList.add('name-cell');

        // 守備位置の表示または編集UI
        const positionCell = row.insertCell();
        positionCell.classList.add('position-cell');
        if (currentUser) {
            // ログイン中の場合、編集用のドロップダウンを表示
            const positionsContainer = document.createElement('div');
            positionsContainer.classList.add('position-edit');

            const allPositions = ["投手", "捕手", "一塁手", "二塁手", "三塁手", "遊撃手", "外野手"];

            for (let i = 0; i < 3; i++) {
                const select = document.createElement('select');
                select.dataset.field = `position${i + 1}`; // データ属性にフィールド名を設定
                select.dataset.playerId = player.id; // データ属性に選手IDを設定
                select.classList.add('position-select-input');

                // 最初のオプション（"選択" または "なし"）を追加
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = i === 0 ? "選択" : "なし";
                select.appendChild(defaultOption);

                // 全ての守備位置オプションを追加
                allPositions.forEach(pos => {
                    const option = document.createElement('option');
                    option.value = pos;
                    option.textContent = pos;
                    select.appendChild(option);
                });

                // 現在の守備位置を設定
                if (player.positions && player.positions[i]) {
                    select.value = player.positions[i];
                } else {
                    select.value = "";
                }
                positionsContainer.appendChild(select);
            }
            positionCell.appendChild(positionsContainer);
        } else {
            // 未ログイン時はテキスト表示
            const positionDiv = document.createElement('div');
            positionDiv.classList.add('position-display');
            if (player.positions && player.positions.length > 0) {
                // メインポジションとサブポジションを略称で表示
                positionDiv.innerHTML = player.positions.map((pos, idx) => {
                    if (idx === 0) return `<span class="main-position">${pos.charAt(0)}</span>`;
                    return `<span class="sub-position">&nbsp;/ ${pos.charAt(0)}</span>`;
                }).join('');
            } else {
                positionDiv.textContent = '-'; // 守備位置がない場合はハイフン
            }
            positionCell.appendChild(positionDiv);
        }

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
            cell.classList.add('state-cell'); // 親要素にクラスを追加

            const gradeSpan = document.createElement('span'); // ランク表示用のspan
            gradeSpan.classList.add('stat-grade');

            const valueSpan = document.createElement('span'); // 数値表示用のspan
            valueSpan.classList.add('stat-value');

            // 初期表示のランクと数値を設定
            const initialGradeValue = convertStatToGrade(stat.key, player[stat.key]);
            gradeSpan.textContent = initialGradeValue;
            valueSpan.textContent = player[stat.key]; // 数値のみを表示

            // 弾道以外のランクに色を適用
            if (stat.key !== 'dandou') {
                applyGradeColor(gradeSpan, stat.key, initialGradeValue);
            }

            cell.appendChild(gradeSpan); // ランク表示を追加

            // ログイン中の場合のみ、入力欄と増減ボタンを表示
            if (currentUser) {
                const inputContainer = document.createElement('div');
                inputContainer.classList.add('input-set');

                const decrementBtn = document.createElement('button');
                decrementBtn.type = 'button';
                decrementBtn.classList.add('decrease-btn');
                decrementBtn.textContent = '-';
                inputContainer.appendChild(decrementBtn);

                const input = document.createElement('input');
                input.type = 'number';
                input.value = player[stat.key];
                input.min = stat.min;
                input.max = stat.max;
                input.dataset.field = stat.key; // データ属性にフィールド名を設定
                input.dataset.playerId = player.id; // データ属性に選手IDを設定
                input.classList.add('stat-input');
                inputContainer.appendChild(input);

                const incrementBtn = document.createElement('button');
                incrementBtn.type = 'button';
                incrementBtn.classList.add('increase-btn');
                incrementBtn.textContent = '+';
                inputContainer.appendChild(incrementBtn);

                // inputの値が変更されたらランク表示を更新するイベントリスナー
                input.addEventListener('input', (e) => {
                    const newValue = parseInt(e.target.value);
                    const newGrade = convertStatToGrade(stat.key, newValue);
                    gradeSpan.textContent = newGrade;

                    // 弾道以外のランクに色を再適用
                    if (stat.key !== 'dandou') {
                        applyGradeColor(gradeSpan, stat.key, newGrade);
                    } else {
                           gradeSpan.classList.add('stat-grade'); // 弾道も見た目は大きく
                    }
                });

                // 既存の選手データの増減ボタンイベントリスナー
                decrementBtn.addEventListener('click', () => {
                    input.stepDown();
                    input.dispatchEvent(new Event('input')); // inputイベントを発火させてランク表示を更新
                });
                incrementBtn.addEventListener('click', () => {
                    input.stepUp();
                    input.dispatchEvent(new Event('input')); // inputイベントを発火させてランク表示を更新
                });

                cell.appendChild(inputContainer); // 入力フィールドとボタンのコンテナを追加
            } else {
                // 未ログイン時は数値spanを表示
                cell.appendChild(valueSpan);
            }
        });

        // メモ列の追加
        const memoCell = row.insertCell();
        if (currentUser) {
            // ログイン中の場合、編集用のtextareaを表示
            const textarea = document.createElement('textarea');
            textarea.value = player.memo || ''; // メモがなければ空文字列
            textarea.maxLength = 200; // 最大文字数
            textarea.rows = 2; // 表示行数
            textarea.classList.add('memo-textarea');
            textarea.dataset.field = 'memo'; // データ属性にフィールド名を設定
            textarea.dataset.playerId = player.id; // データ属性に選手IDを設定
            memoCell.appendChild(textarea);
        } else {
            // 未ログイン時はテキスト表示
            const memoDiv = document.createElement('div');
            memoDiv.classList.add('memo-display');
            memoDiv.textContent = player.memo || '-'; // メモがなければハイフン表示
            memoCell.appendChild(memoDiv);
        }


        // 操作ボタン列の追加
        const actionCell = row.insertCell();
        actionCell.classList.add('action-buttons');

        // ログインしている場合のみ、更新・卒業ボタンを表示
        if (currentUser) {
            const updateButton = document.createElement('button');
            updateButton.textContent = '更新';
            updateButton.classList.add('update-btn');
            updateButton.addEventListener('click', async () => {
                // その行の全てのinputとtextarea、selectから最新のデータを取得して更新
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
                // 守備位置のselectからデータを収集
                const update_Posi = [];
                row.querySelectorAll('.position-select-input').forEach(selectEl => {
                    if (selectEl.value !== '') { // 空でない選択値のみを追加
                        update_Posi.push(selectEl.value);
                    }
                });
                updatedData.positions = update_Posi;

                // 更新処理に選手名を渡すように変更
                await updatePlayer(player.id, updatedData, player.name);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '卒業';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', async () => {
                // 卒業関数に選手名を渡すように変更
                await deletePlayer(player.id, player.name); // 卒業関数を呼び出し
            });

            actionCell.appendChild(updateButton);
            actionCell.appendChild(deleteButton);
        } else {
            actionCell.textContent = '-'; // 未ログイン時は何も表示しないか、'-'などを表示
        }
    });

    // 最後に登録行を再度追加 (DOM操作で移動されるため、毎回明示的に最後にする)
    // これにより、選手が追加・卒業されても登録行が常に一番下になる
    playerListBody.appendChild(registRow);
}