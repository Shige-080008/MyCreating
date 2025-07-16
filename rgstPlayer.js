// rgstPlayer.js

import { getUIElements } from './ui.js';
import { addPlayer } from './firestore.js';
import { currentUser } from './auth.js';

let regYearInput;
let regNameInput;
let regPosi1Input;
let regPosi2Input;
let regPosi3Input;
let regThrowInput;
let regDandouInput;
let regMeetInput;
let regPowerInput;
let regSpeedInput;
let regArmInput;
let regDefenseInput;
let regCatchInput;
let regMemoInput;
let regseikakuInput;
let regButton;
let clearButton;

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
 * 登録フォーム（テーブル内の登録行）送信時の処理
 * @param {Event} event - クリックイベントオブジェクト
 */
async function handleRegSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('選手を登録するにはログインが必要です。');
        return;
    }

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

    // 必須項目チェック
    let errorMessage = '必須項目を入力してください（';
    let errorCount = 0;

    if(!name) {  // 選手名が未入力の場合、赤色にハイライト
        regNameInput.style.backgroundColor = '#FFDDDD';
        errorMessage += '選手名';
        errorCount++;
    } else { regNameInput.style.backgroundColor = ''; }

    if(isNaN(enrollmentYear)) {  // 入学年が未入力または不正な場合、赤色にハイライト
        regYearInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '入学年';
        errorCount++;
    } else { regYearInput.style.backgroundColor = ''; }

    if(!position1) {  // 守備位置1が未選択の場合、赤色にハイライト
        regPosi1Input.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += 'メインポジション';
        errorCount++;
    } else { regPosi1Input.style.backgroundColor = ''; }
    
    if(isNaN(throwing)) {  // 送球が未入力または不正な場合、赤色にハイライト
        regThrowInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '送球';
        errorCount++;
    } else { regThrowInput.style.backgroundColor = ''; }

    if(isNaN(dandou)) {  // 弾道が未入力または不正な場合、赤色にハイライト
         regDandouInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '弾道';
        errorCount++;
    } else { regDandouInput.style.backgroundColor = ''; }

    if(isNaN(meet)) {  // ミートが未入力または不正な場合、赤色にハイライト
        regMeetInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += 'ミート';
        errorCount++;
    } else { regMeetInput.style.backgroundColor = ''; }

    if(isNaN(power)) {  // パワーが未入力または不正な場合、赤色にハイライト
        regPowerInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += 'パワー';
        errorCount++;
    } else { regPowerInput.style.backgroundColor = ''; }

    if(isNaN(speed)) {  // 走力が未入力または不正な場合、赤色にハイライト
        regSpeedInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '走力';
        errorCount++;
    } else { regSpeedInput.style.backgroundColor = ''; }

    if(isNaN(armStrength)) {  // 肩力が未入力または不正な場合、赤色にハイライト
        regArmInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '肩力';
        errorCount++;
    } else { regArmInput.style.backgroundColor = ''; }

    if(isNaN(defense)) {  // 守備力が未入力または不正な場合、赤色にハイライト
        regDefenseInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '守備力';
        errorCount++;
    } else { regDefenseInput.style.backgroundColor = ''; }

    if(isNaN(catching)) {  // 捕球が未入力または不正な場合、赤色にハイライト
        regCatchInput.style.backgroundColor = '#FFDDDD';
        if (errorCount > 0) { errorMessage += '、'; } // 既にエラーがある場合はカンマを追加
        errorMessage += '捕球';
        errorCount++;
    } else { regCatchInput.style.backgroundColor = ''; }

    if(!seikaku || seikaku == '性格を選択') {  // 性格が未選択の場合、赤色にハイライト
        regseikakuInput.style.backgroundColor = '#FFDDDD';
    } else { regseikakuInput.style.backgroundColor = ''; }

    // エラーがあった場合はアラートを表示し、処理を中断
    if (errorCount > 0) {
        errorMessage += ')';
        alert(errorMessage);
        return; // エラーがある場合はここで処理を終了
    }

    const playerData = {
        enrollmentYear: enrollmentYear,
        name: name,
        positions: [position1, position2, position3].filter(p => p !== ''),
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

    await addPlayer(playerData, name);
    clearRegForm();
}

/**
 * 登録フォームのイベントリスナーを初期化する関数
 */
export function initRegistFormListeners() {
    const elements = getUIElements();
    regYearInput = elements.regYearInput;
    regNameInput = elements.regNameInput;
    regPosi1Input = elements.regPosi1Input;
    regPosi2Input = elements.regPosi2Input;
    regPosi3Input = elements.regPosi3Input;
    regThrowInput = elements.regThrowInput;
    regDandouInput = elements.regDandouInput;
    regMeetInput = elements.regMeetInput;
    regPowerInput = elements.regPowerInput;
    regSpeedInput = elements.regSpeedInput;
    regArmInput = elements.regArmInput;
    regDefenseInput = elements.regDefenseInput;
    regCatchInput = elements.regCatchInput;
    regMemoInput = elements.regMemoInput;
    regseikakuInput = elements.regseikakuInput;
    regButton = elements.regButton;
    clearButton = elements.clearButton;

    regButton.addEventListener('click', handleRegSubmit);
    clearButton.addEventListener('click', clearRegForm);
}