// rgstPlayer.js

import { getUIElements } from './ui.js';
import { addPlayer } from './firestore.js';
import { currentUser } from './auth.js';
import { transGrade, applyGradeColor } from './viewPlayer.js'; // Import the functions

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

// References to the new span elements for displaying grades
let regThrowGradeSpan;
let regDandouGradeSpan;
let regMeetGradeSpan;
let regPowerGradeSpan;
let regSpeedGradeSpan;
let regArmGradeSpan;
let regDefenseGradeSpan;
let regCatchGradeSpan;

/**
 * Updates the grade display for a given input element and its corresponding span.
 * @param {HTMLInputElement} inputElement - The input field for the stat.
 * @param {HTMLElement} gradeSpanElement - The span element to display the grade.
 * @param {string} statType - The type of stat (e.g., 'throwing', 'meet').
 */
function updateRegGradeDisplay(inputElement, gradeSpanElement, statType) {
    const value = parseInt(inputElement.value);
    const grade = transGrade(statType, value);
    gradeSpanElement.textContent = grade;
    applyGradeColor(gradeSpanElement, statType, grade);
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
    regseikakuInput.value = '性格';
    highlightEmptyFields(); // クリア後にもハイライトを更新

    // Clear grade displays and remove colors
    updateRegGradeDisplay(regThrowInput, regThrowGradeSpan, 'throwing');
    updateRegGradeDisplay(regDandouInput, regDandouGradeSpan, 'dandou');
    updateRegGradeDisplay(regMeetInput, regMeetGradeSpan, 'meet');
    updateRegGradeDisplay(regPowerInput, regPowerGradeSpan, 'power');
    updateRegGradeDisplay(regSpeedInput, regSpeedGradeSpan, 'speed');
    updateRegGradeDisplay(regArmInput, regArmGradeSpan, 'armStrength');
    updateRegGradeDisplay(regDefenseInput, regDefenseGradeSpan, 'defense');
    updateRegGradeDisplay(regCatchInput, regCatchGradeSpan, 'catching');
}

// 登録フォームの入力フィールドに値が入力されたときに、未入力があったら登録行のinputタグの背景色をすべて赤くする関数
export function highlightEmptyFields() {
    const inputs = [
        regYearInput,
        regNameInput,
        regPosi1Input,
        regThrowInput,
        regDandouInput,
        regMeetInput,
        regPowerInput,
        regSpeedInput,
        regArmInput,
        regDefenseInput,
        regCatchInput,
        regseikakuInput
    ];

    inputs.forEach(input => {
        if (!input.value || (input === regseikakuInput && input.value === '性格') || (input.type === 'number' && isNaN(parseInt(input.value)))) {
            input.style.backgroundColor = '#FFDDDD'; // 赤色にハイライト
        } else {
            input.style.backgroundColor = ''; // ハイライト解除
        }
    });
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

    // 登録ボタンクリック時にも強制的にハイライト処理を実行し、最新の状態を反映
    highlightEmptyFields();

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

    // 必須項目チェック（アラートメッセージ用）
    let errorMessage = '必須項目を入力してください（';
    let errorCount = 0;

    if(!name) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '選手名'; }
    if(isNaN(enrollmentYear)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '入学年'; }
    if(!position1) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += 'メインポジション'; }
    if(isNaN(throwing)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '送球'; }
    if(isNaN(dandou)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '弾道'; }
    if(isNaN(meet)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += 'ミート'; }
    if(isNaN(power)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += 'パワー'; }
    if(isNaN(speed)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '走力'; }
    if(isNaN(armStrength)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '肩力'; }
    if(isNaN(defense)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '守備力'; }
    if(isNaN(catching)) { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '捕球'; }
    if(!seikaku || seikaku == '性格') { errorCount++; if (errorCount > 1) errorMessage += '、'; errorMessage += '性格'; }


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

    // Get references to the new grade display spans
    regThrowGradeSpan = document.querySelector('#regist-row td:nth-child(4) .grade-display');
    regDandouGradeSpan = document.querySelector('#regist-row td:nth-child(5) .grade-display');
    regMeetGradeSpan = document.querySelector('#regist-row td:nth-child(6) .grade-display');
    regPowerGradeSpan = document.querySelector('#regist-row td:nth-child(7) .grade-display');
    regSpeedGradeSpan = document.querySelector('#regist-row td:nth-child(8) .grade-display');
    regArmGradeSpan = document.querySelector('#regist-row td:nth-child(9) .grade-display');
    regDefenseGradeSpan = document.querySelector('#regist-row td:nth-child(10) .grade-display');
    regCatchGradeSpan = document.querySelector('#regist-row td:nth-child(11) .grade-display');

    // Attach event listeners for grade display updates
    regThrowInput.addEventListener('input', () => updateRegGradeDisplay(regThrowInput, regThrowGradeSpan, 'throwing'));
    regDandouInput.addEventListener('input', () => updateRegGradeDisplay(regDandouInput, regDandouGradeSpan, 'dandou'));
    regMeetInput.addEventListener('input', () => updateRegGradeDisplay(regMeetInput, regMeetGradeSpan, 'meet'));
    regPowerInput.addEventListener('input', () => updateRegGradeDisplay(regPowerInput, regPowerGradeSpan, 'power'));
    regSpeedInput.addEventListener('input', () => updateRegGradeDisplay(regSpeedInput, regSpeedGradeSpan, 'speed'));
    regArmInput.addEventListener('input', () => updateRegGradeDisplay(regArmInput, regArmGradeSpan, 'armStrength'));
    regDefenseInput.addEventListener('input', () => updateRegGradeDisplay(regDefenseInput, regDefenseGradeSpan, 'defense'));
    regCatchInput.addEventListener('input', () => updateRegGradeDisplay(regCatchInput, regCatchGradeSpan, 'catching'));

    // Initialize the grade displays on load
    updateRegGradeDisplay(regThrowInput, regThrowGradeSpan, 'throwing');
    updateRegGradeDisplay(regDandouInput, regDandouGradeSpan, 'dandou');
    updateRegGradeDisplay(regMeetInput, regMeetGradeSpan, 'meet');
    updateRegGradeDisplay(regPowerInput, regPowerGradeSpan, 'power');
    updateRegGradeDisplay(regSpeedInput, regSpeedGradeSpan, 'speed');
    updateRegGradeDisplay(regArmInput, regArmGradeSpan, 'armStrength');
    updateRegGradeDisplay(regDefenseInput, regDefenseGradeSpan, 'defense');
    updateRegGradeDisplay(regCatchInput, regCatchGradeSpan, 'catching');

    // 各入力フィールドに 'input' イベントリスナーを追加
    const inputsToMonitor = [
        regYearInput,
        regNameInput,
        regPosi1Input,
        regPosi2Input,
        regPosi3Input,
        regThrowInput,
        regDandouInput,
        regMeetInput,
        regPowerInput,
        regSpeedInput,
        regArmInput,
        regDefenseInput,
        regCatchInput,
        regseikakuInput
    ];

    inputsToMonitor.forEach(input => {
        input.addEventListener('input', highlightEmptyFields);
        // select要素の場合は 'change' イベントもリッスンする
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', highlightEmptyFields);
        }
    });

    regButton.addEventListener('click', handleRegSubmit);
    clearButton.addEventListener('click', clearRegForm);

    // 初期ロード時に一度ハイライトを適用
    highlightEmptyFields();
}