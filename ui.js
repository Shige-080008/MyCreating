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
let regseikakuInput; // 登録フォームの性格選択フィールド
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

// 投手変化球の方向定義をグローバルスコープに移動
const breakingBallDirections = [
    { dir: 'left', symbol: '←' },
    { dir: 'downLeft', symbol: '↙' },
    { dir: 'down', symbol: '↓' },
    { dir: 'downRight', symbol: '↘' },
    { dir: 'right', symbol: '→' }
];

// 性格と上がりやすいパラメータのマップ
const seikakuStatMap = {
    '天才肌': ['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'], // 全てのパラメータ
    'ごくふつう': ['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'], // 全てのパラメータ
    '内気': ['defense', 'catching', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'], // 守備力、捕球、変化量
    'したたか': ['speed', 'catching', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'], // 走力、捕球、変化量
    'クール': ['meet', 'defense', 'control'], // ミート、守備力、コントロール
    'お調子者': ['speed', 'armStrength', 'pitSpeed'], // 走力、肩力、球速
    'やんちゃ': ['meet', 'power', 'pitSpeed'], // ミート、パワー、球速
    '熱血漢': ['power', 'armStrength', 'stamina'] // パワー、肩力、スタミナ
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
    regseikakuInput = document.getElementById('reginput-seikaku');
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
        regseikaku: regseikakuInput,
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
        const decreBtn = container.querySelector('.decrease-btn');
        const increBtn = container.querySelector('.increase-btn');

        // 減算ボタンがクリックされたら入力値を1減らす
        decreBtn.addEventListener('click', () => {
            input.stepDown(); // 値を1減らす
            input.dispatchEvent(new Event('input')); // inputイベントを手動で発火させる（これにより、関連する処理が実行される）
        });
        // 加算ボタンがクリックされたら入力値を1増やす
        increBtn.addEventListener('click', () => {
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
    const seikaku = regseikakuInput.value;

    // 入力値のバリデーション（必須項目のチェック）
    if (!name || isNaN(enrollmentYear) || !position1 || isNaN(throwing) || isNaN(dandou) ||
        isNaN(meet) || isNaN(power) || isNaN(speed) || isNaN(armStrength) ||
        isNaN(defense) || isNaN(catching) || !seikaku || seikaku === '性格を選択') {
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
        seikaku: seikaku,
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
    regseikakuInput.value = '性格を選択';
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
    } else if (['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed'].includes(statType)) {
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
         'grade-throwing-G', 'grade-throwing-F', 'grade-throwing-E', 'grade-throwing-D', 'grade-throwing-C', 'grade-throwing-B', 'grade-throwing-A', 'grade-throwing-S');

    // 特定のステータスに合わせたクラスを追加 (例: throwing-G)
    // それ以外のステータスは汎用的なクラス (例: grade-G)
    if (statType === 'throwing') {
        element.classList.add(`grade-${statType}-${grade}`);
    } else if (['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed'].includes(statType)) {
        element.classList.add(`grade-${grade}`);
    }
    element.classList.add('stat-grade'); // 基本のスタイルも追加
}

/**
 * 性格に応じてパラメータ入力欄にハイライトを適用する関数
 * @param {object} player - 選手データオブジェクト
 * @param {HTMLElement} rowElement - 選手データの行要素
 * @param {HTMLElement} [pitcherRowElement] - 投手詳細データの行要素 (投手の場合のみ)
 */
function applyseikakuHighlight(player, rowElement, pitcherRowElement = null) {
    // まず、既存のハイライトを全て削除する
    rowElement.querySelectorAll('.seikaku-highlight').forEach(el => {
        el.classList.remove('seikaku-highlight');
    });
    if (pitcherRowElement) {
        pitcherRowElement.querySelectorAll('.seikaku-highlight').forEach(el => {
            el.classList.remove('seikaku-highlight');
        });
    }

    const seikaku = player.seikaku;
    if (seikaku && seikakuStatMap[seikaku]) {
        const statsToHighlight = seikakuStatMap[seikaku];

        statsToHighlight.forEach(statField => {
            // 選手行内の入力フィールドを検索
            let inputElement = rowElement.querySelector(`[data-field="${statField}"]`);
            if (inputElement) {
                inputElement.classList.add('seikaku-highlight');
            } else if (pitcherRowElement) {
                // 投手詳細行内の入力フィールドを検索
                inputElement = pitcherRowElement.querySelector(`[data-field="${statField}"]`);
                if (inputElement) {
                    inputElement.classList.add('seikaku-highlight');
                }
            }
        });
    }
}

/**
 * 投手ステータス表示用のHTMLを生成するヘルパー関数
 * @param {object} player - 選手データオブジェクト
 * @returns {string} 投手ステータス表示用のHTML文字列
 */
function createPitcherStatsRowHtml(player) {
    const pitSpeed = player.pitSpeed || ''; // pitSpeed を使用
    const control = player.control || '';
    const stamina = player.stamina || '';
    const BallHenka1 = player.BallHenka1 || {};
    const BallHenka2 = player.BallHenka2 || { type: '', value: '' };

    const controlGrade = convertStatToGrade('control', control);
    const staminaGrade = convertStatToGrade('stamina', stamina);
    const pitSpeedGrade = convertStatToGrade('pitSpeed', pitSpeed);

    // 第二変化量のオプションを生成
    const secondBreakingBallOptions = `
        <option value="">なし</option>
        ${breakingBallDirections.map(b => `<option value="${b.dir}" ${BallHenka2.type === b.dir ? 'selected' : ''}>${b.symbol}</option>`).join('')}
    `;

    return `
        <strong>${player.name}の投手能力</strong>
        <div class="pitcher-container">
            <div class="pit-stat1">
                <div>
                    <label>球速:</label>
                    <input type="number" min="100" max="180" value="${pitSpeed}" data-field="pitSpeed"> km/h
                </div>
                <div>
                    <label>コントロール:</label>
                    <input type="number" min="1" max="100" value="${control}" data-field="control"> <span class="grade-display grade-${controlGrade}">${controlGrade}</span>
                </div>
                <div>
                    <label>スタミナ:</label><input type="number" min="1" max="100" value="${stamina}" data-field="stamina"> <span class="grade-display grade-${staminaGrade}">${staminaGrade}</span>
                </div>
            </div>
            <div class="pit-stat2">
                <div class="ball-group">
                    <label>変化量:</label>
                    ${breakingBallDirections.map(b => `
                        <span>${b.symbol}</span><input type="number" min="0" max="7" value="${BallHenka1[b.dir] || ''}" data-field="BallHenka1_${b.dir}">
                    `).join('')}
                </div>
                <div class="breaking-ball2-group">
                    <label>第二変化量:</label>
                    <select data-field="BallHenka2_type">
                        ${secondBreakingBallOptions}
                    </select>
                    <input type="number" min="0" max="7" value="${BallHenka2.value || ''}" data-field="BallHenka2_value" class="breaking-ball2-value">
                </div>
            </div>
        </div>
    `;
}

/**
 * 選手リストのUI（表示）を更新する関数
 * @param {Array} playersData - 表示する選手データの配列
 */
export function updatePlayerListUI(playersData = []) {
    // まず、既存の選手データ行をすべて削除
    // 登録行は残すため、registRow以外のtr要素を削除
    Array.from(playerListBody.children).forEach(child => {
        if (child.id !== 'regist-row') {
            child.remove();
        }
    });

    // エラーメッセージがあれば削除
    const errorRow = playerListBody.querySelector('.error-message-row');
    if (errorRow) {
        errorRow.remove();
    }

    // 選手データがない場合のメッセージ表示
    if (playersData.length === 0) {
        const noPlayerRow = document.createElement('tr'); // 新しい行を作成
        const cell = noPlayerRow.insertCell(); // セルを挿入
        cell.colSpan = 13; // 全ての列を結合
        cell.textContent = 'まだ選手がいません。'; // メッセージを設定
        noPlayerRow.classList.add('no-player'); // クラスを追加
        playerListBody.appendChild(noPlayerRow); // テーブルボディに追加
        playerListBody.appendChild(registRow); // 登録行を最後に追加
        return; // 選手がいない場合はここで処理を終了
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

    // ここから変更されたロジック
    const rowsToAppend = []; // ここに選手とピッチャー能力の行を順番に貯めていくよ

    // ソートされた選手データを元にテーブルの行を作成・更新
    playersGrade.forEach((player, index) => {
        const row = document.createElement('tr'); // 新しい選手の行を作るよ
        if (player.positions[0] == '投手') {
            row.classList.add('toushu-row');
        } else if (player.positions[0] == '捕手') {
            row.classList.add('hosyu-row');
        } else if (player.positions[0] == '外野手') {
            row.classList.add('gaiyasyu-row');
        } else {
            row.classList.add('naiyasyu-row');
        }
        row.dataset.playerId = player.id;

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
        nameCell.classList.add('name-cell');
        const nameText = document.createElement(`p`);
        nameText.classList.add('name-text'); // スタイル用のクラスを追加
        nameText.textContent = player.name;
        nameCell.appendChild(nameText);        

        // 性格セレクトボックスの作成
        if (currentUser) {
            // ログイン中の場合、選手の性格を選択できるセレクトボックスを表示
            const seikakuSelect = document.createElement('select');
            seikakuSelect.classList.add('input-seikaku');
            seikakuSelect.dataset.playerId = player.id;
            seikakuSelect.dataset.field = 'seikaku'; // セレクトボックスのデータ属性を設定
            // 性格の選択肢を追加
            const personalities = ['性格を選択', '天才肌', 'ごくふつう', '内気', 'したたか', 'クール', 'お調子者', 'やんちゃ', '熱血漢'];
            personalities.forEach(seikaku => {
                const option = document.createElement('option');
                option.value = seikaku;
                option.textContent = seikaku === '性格を選択' ? '性格を選択' : seikaku;
                if (player.seikaku === seikaku) {
                    option.selected = true; // 選手の性格が選択肢と一致する場合、選択状態にする
                }
                seikakuSelect.appendChild(option);
            });
            // セレクトボックスの変更イベントリスナーを設定
            nameCell.addEventListener('change', async (e) => {
                const updatedValue = e.target.value;
                const playerId = e.target.dataset.playerId;
                const field = e.target.dataset.field;
                const updatedData = { [field]: updatedValue };
                await updatePlayer(playerId, updatedData, player.name); // 更新処理に選手名を渡すように変更
            });
            nameCell.appendChild(seikakuSelect);
        }

        // 守備位置の表示または編集UI
        const positionCell = row.insertCell();
        positionCell.classList.add('position-cell');
        if (currentUser) {
            // ログイン中の場合、編集用のドロップダウンを表示
            const positionsContainer = document.createElement('div');
            positionsContainer.classList.add('position-edit');

            // メインポジション
            const Select_mainPosi = document.createElement('select');
            Select_mainPosi.classList.add('input-position');
            Select_mainPosi.dataset.playerId = player.id;
            Select_mainPosi.dataset.field = 'positions_0'; // 配列の0番目を編集
            ['', '投手', '捕手', '一塁手', '二塁手', '三塁手', '遊撃手', '外野手'].forEach(pos => {
                const option = document.createElement('option');
                option.value = pos;
                option.textContent = pos === '' ? '選択' : pos;
                if (player.positions[0] === pos) {
                    option.selected = true;
                }
                Select_mainPosi.appendChild(option);
            });
            positionsContainer.appendChild(Select_mainPosi);

            // サブポジション1
            const Select_subPosi1 = document.createElement('select');
            Select_subPosi1.classList.add('input-position', 'select-subPosi');
            Select_subPosi1.dataset.playerId = player.id;
            Select_subPosi1.dataset.field = 'positions_1'; // 配列の1番目を編集
            ['', '投手', '捕手', '一塁手', '二塁手', '三塁手', '遊撃手', '外野手'].forEach(pos => {
                const option = document.createElement('option');
                option.value = pos;
                option.textContent = pos === '' ? '選択' : pos;
                if (player.positions[1] === pos) {
                    option.selected = true;
                }
                Select_subPosi1.appendChild(option);
            });
            positionsContainer.appendChild(Select_subPosi1);

            // メイン守備位置が投手じゃなければ、サブポジション2を追加
            if (player.positions[0] !== '投手') {
                const Select_subPosi2 = document.createElement('select');
                Select_subPosi2.classList.add('input-position', 'select-subPosi');
                Select_subPosi2.dataset.playerId = player.id;
                Select_subPosi2.dataset.field = 'positions_2'; // 配列の2番目を編集
                ['', '投手', '捕手', '一塁手', '二塁手', '三塁手', '遊撃手', '外野手'].forEach(pos => {
                    const option = document.createElement('option');
                    option.value = pos;
                    option.textContent = pos === '' ? 'なし' : pos;
                    if (player.positions[2] === pos) {
                        option.selected = true;
                    }
                    Select_subPosi2.appendChild(option);
                });
                positionsContainer.appendChild(Select_subPosi2);
            } else {
                // 投手の場合は、サブポジション2の位置に、代わりに詳細ボタン<button class="detail-btn">詳細</button>を追加
                const detailButton = document.createElement('button');
                detailButton.textContent = '詳細';
                detailButton.classList.add('detail-btn');
                detailButton.addEventListener('click', () => {
                const pitcherStatsRow = document.getElementById(`pitcher-stats-row-${player.id}`);
                    if (pitcherStatsRow) {
                        pitcherStatsRow.classList.toggle('hidden');
                    }
                });
                positionsContainer.appendChild(detailButton);
            }
            positionCell.appendChild(positionsContainer);
        } else {
            // 未ログインの場合、テキストで表示
            const mainPosiTxt = document.createElement('span');
            mainPosiTxt.classList.add('main-position');
            mainPosiTxt.textContent = player.positions[0].substr(0,1);
            positionCell.appendChild(mainPosiTxt);

            if (player.positions.length > 1) {
                const subPosiTxt = document.createElement('span');
                subPosiTxt.classList.add('sub-position');
                subPosiTxt.textContent = ` /${player.positions.slice(1).map(pos => pos.substr(0, 1)).join(', ')}`;
                positionCell.appendChild(subPosiTxt);
            }
        }

        // 各ステータスセルの作成と内容の追加 (送球、弾道、ミート、パワー、走力、肩力、守備力、捕球)
        const statsToDisplay = [
            { field: 'throwing', label: '送球', value: player.throwing },
            { field: 'dandou', label: '弾道', value: player.dandou },
            { field: 'meet', label: 'ミート', value: player.meet },
            { field: 'power', label: 'パワー', value: player.power },
            { field: 'speed', label: '走力', value: player.speed },
            { field: 'armStrength', label: '肩力', value: player.armStrength },
            { field: 'defense', label: '守備力', value: player.defense },
            { field: 'catching', label: '捕球', value: player.catching }
        ];

        statsToDisplay.forEach(stat => {
            const cell = row.insertCell();
            cell.classList.add('data-cell'); // スタイル用のクラスを追加

            if (currentUser) {
                // アルファベットランク表示用のspan
                const gradeSpan = document.createElement('span');
                gradeSpan.classList.add('grade-display');
                const grade = convertStatToGrade(stat.field, stat.value);
                gradeSpan.textContent = grade;
                applyGradeColor(gradeSpan, stat.field, grade);
                cell.appendChild(gradeSpan);

                // ログイン中の場合、編集可能な入力フィールドを表示
                const inputContainer = document.createElement('div');
                inputContainer.classList.add('input-set'); // 増減ボタン用のコンテナ

                const input = document.createElement('input');
                input.type = 'number';
                input.value = stat.value;
                input.dataset.playerId = player.id;
                input.dataset.field = stat.field;
                input.classList.add('edit-input');

                // 増減ボタン
                const decreBtn = document.createElement('button');
                decreBtn.textContent = '-';
                decreBtn.classList.add('decrease-btn');
                decreBtn.addEventListener('click', () => {
                    input.stepDown();
                    input.dispatchEvent(new Event('change')); // changeイベントを発火
                });

                const increBtn = document.createElement('button');
                increBtn.textContent = '+';
                increBtn.classList.add('increase-btn');
                increBtn.addEventListener('click', () => {
                    input.stepUp();
                    input.dispatchEvent(new Event('change')); // changeイベントを発火
                });

                inputContainer.appendChild(decreBtn);
                inputContainer.appendChild(input);
                inputContainer.appendChild(increBtn);
                cell.appendChild(inputContainer);

                let inputTypingTimer;
                input.addEventListener('change', async (e) => {
                    clearTimeout(inputTypingTimer);
                    // 入力値を整数に変換
                    const updatedValue = parseInt(e.target.value);
                    const playerId = e.target.dataset.playerId;
                    const field = e.target.dataset.field;

                    const newGrade = convertStatToGrade(field, updatedValue); // ランクを再計算
                    gradeSpan.textContent = newGrade; // ランクを更新
                    applyGradeColor(gradeSpan, field, newGrade); // 色も更新
                    
                    // 1.5秒入力がなければ更新
                    inputTypingTimer = setTimeout( async() => {
                        // Firestoreを更新
                        const updatedData = { [field]: updatedValue }; // 更新するフィールドと値をオブジェクトにまとめる
                        await updatePlayer(playerId, updatedData, player.name); // 更新処理に選手名を渡すように変更
                    }, 400); 
                });
            } else {
                // 未ログインの場合、テキストとランクを表示
                const gradeSpan = document.createElement('span');
                gradeSpan.classList.add('grade-display');
                const grade = convertStatToGrade(stat.field, stat.value);
                gradeSpan.textContent = grade;
                applyGradeColor(gradeSpan, stat.field, grade);
                cell.appendChild(gradeSpan);

                const valueSpan = document.createElement('span');
                valueSpan.textContent = stat.value;
                cell.appendChild(valueSpan);
            }
        });

        // メモセル
        const memoCell = row.insertCell();
        memoCell.classList.add('memo-cell');
        if (currentUser) {
            const memoInput = document.createElement('textarea');
            memoInput.value = player.memo || '';
            memoInput.dataset.playerId = player.id;
            memoInput.dataset.field = 'memo';
            memoInput.classList.add('edit-textarea');
            memoInput.placeholder = 'メモ';
            memoCell.appendChild(memoInput);

            // メモ入力値変更時のイベントリスナーを設定 (debounceで最適化)
            let memoTypingTimer;
            memoInput.addEventListener('input', () => {
                clearTimeout(memoTypingTimer);
                memoTypingTimer = setTimeout(async () => {
                    const updatedValue = memoInput.value;
                    const playerId = memoInput.dataset.playerId;
                    const field = memoInput.dataset.field;
                    const updatedData = { [field]: updatedValue };
                    await updatePlayer(playerId, updatedData, player.name); // 更新処理に選手名を渡すように変更
                }, 5000); // 5秒入力がなければ更新
            });
        } else {
            memoCell.textContent = player.memo || '記載事項なし。'; // 未ログイン時はテキスト表示
        }

        // 操作セル
        const actionCell = row.insertCell();
        actionCell.classList.add('action-cell');
        if (currentUser) {
            const updateButton = document.createElement('button');
            updateButton.textContent = '更新';
            updateButton.classList.add('update-btn');
            updateButton.addEventListener('click', async () => {
                // 現在の入力フィールドから最新のデータを取得
                const updatedData = {
                    enrollmentYear: parseInt(row.querySelector('[data-field="enrollmentYear"]') ? row.querySelector('[data-field="enrollmentYear"]').value : player.enrollmentYear),
                    name: row.querySelector('[data-field="name"]') ? row.querySelector('[data-field="name"]').value : player.name,
                    positions: [
                        row.querySelector('[data-field="positions_0"]') ? row.querySelector('[data-field="positions_0"]').value : player.positions[0] || '',
                        row.querySelector('[data-field="positions_1"]') ? row.querySelector('[data-field="positions_1"]').value : player.positions[1] || '',
                        row.querySelector('[data-field="positions_2"]') ? row.querySelector('[data-field="positions_2"]').value : player.positions[2] || ''
                    ].filter(p => p !== ''),
                    throwing: parseInt(row.querySelector('[data-field="throwing"]') ? row.querySelector('[data-field="throwing"]').value : player.throwing),
                    dandou: parseInt(row.querySelector('[data-field="dandou"]') ? row.querySelector('[data-field="dandou"]').value : player.dandou),
                    meet: parseInt(row.querySelector('[data-field="meet"]') ? row.querySelector('[data-field="meet"]').value : player.meet),
                    power: parseInt(row.querySelector('[data-field="power"]') ? row.querySelector('[data-field="power"]').value : player.power),
                    speed: parseInt(row.querySelector('[data-field="speed"]') ? row.querySelector('[data-field="speed"]').value : player.speed),
                    armStrength: parseInt(row.querySelector('[data-field="armStrength"]') ? row.querySelector('[data-field="armStrength"]').value : player.armStrength),
                    defense: parseInt(row.querySelector('[data-field="defense"]') ? row.querySelector('[data-field="defense"]').value : player.defense),
                    catching: parseInt(row.querySelector('[data-field="catching"]') ? row.querySelector('[data-field="catching"]').value : player.catching),
                    memo: row.querySelector('[data-field="memo"]') ? row.querySelector('[data-field="memo"]').value : player.memo
                };
               // 投手の場合、投手能力のフィールドも取得
                if (player.positions.includes('投手')) {
                    const pitcherStatsContainer = document.getElementById(`pitcher-stats-row-${player.id}`);
                    if (pitcherStatsContainer) {
                        updatedData.pitSpeed = parseInt(pitcherStatsContainer.querySelector('[data-field="pitSpeed"]').value); // pitSpeed を使用
                        updatedData.control = parseInt(pitcherStatsContainer.querySelector('[data-field="control"]').value);
                        updatedData.stamina = parseInt(pitcherStatsContainer.querySelector('[data-field="stamina"]').value);

                        const BallHenka1 = {};
                        breakingBallDirections.forEach(b => { // ここで breakingBallDirections が利用可能になりました
                            const input = pitcherStatsContainer.querySelector(`[data-field="BallHenka1_${b.dir}"]`);
                            if (input && !isNaN(parseInt(input.value))) {
                                BallHenka1[b.dir] = parseInt(input.value);
                            }
                        });
                        updatedData.BallHenka1 = BallHenka1;

                        const BallHenka2Type = pitcherStatsContainer.querySelector('[data-field="BallHenka2_type"]').value;
                        const BallHenka2Value = parseInt(pitcherStatsContainer.querySelector('[data-field="BallHenka2_value"]').value);
                        updatedData.BallHenka2 = {
                            type: BallHenka2Type,
                            value: isNaN(BallHenka2Value) ? '' : BallHenka2Value
                        };
                    }
                }
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

        // メインの選手行をリストに追加するよ
        rowsToAppend.push(row);

        // 投手の場合、詳細情報を表示する行を追加
        let pitcherStatsRow = null;
        if (player.positions && player.positions.includes('投手')) {
            pitcherStatsRow = document.createElement('tr');
            pitcherStatsRow.id = `pitcher-stats-row-${player.id}`;
            pitcherStatsRow.classList.add('pitcher-stats-row', 'hidden'); // 初期は非表示

            const pitcherStatsCell = document.createElement('td');
            pitcherStatsCell.setAttribute('colspan', '14'); // 全ての列をまたぐように設定 (列数に合わせて変更)
            pitcherStatsCell.innerHTML = createPitcherStatsRowHtml(player);
            pitcherStatsRow.appendChild(pitcherStatsCell);

            // ピッチャー能力の行を、メインの選手行のすぐ後にリストに追加するよ
            rowsToAppend.push(pitcherStatsRow);
        }
        // 性格に応じたハイライトを適用
        applyseikakuHighlight(player, row, pitcherStatsRow);
    });

    // ここまで変更されたロジック

    // playerListBodyを再度クリアする（registRowは含まない）
    // これは、新しい行をまとめて追加する前に、残っている可能性のある古い行を確実に取り除くためだよ
    Array.from(playerListBody.children).forEach(child => {
        if (child.id !== 'regist-row') {
            child.remove();
        }
    });

    // 集めたすべての行をplayerListBodyにまとめて追加するよ
    rowsToAppend.forEach(row => playerListBody.appendChild(row));

    // 最後に、registRow（選手登録の行）がテーブルの一番最後にくるようにするよ
    playerListBody.appendChild(registRow);
}