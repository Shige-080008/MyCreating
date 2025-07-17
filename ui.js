// ui.js

// HTML要素への参照を保持する変数群
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

let playerListBody;
let authStatus;
let authButton;
let registRow;

/**
 * UI要素を取得し、それらへの参照をグローバル変数に格納する関数
 * 他のモジュールからUI要素にアクセスできるように、オブジェクトとして返します
 */
export function getUIElements() {
    regYearInput = document.getElementById('rgstInput-year');
    regNameInput = document.getElementById('rgstInput-name');
    regPosi1Input = document.getElementById('rgstInput-posi1');
    regPosi2Input = document.getElementById('rgstInput-posi2');
    regPosi3Input = document.getElementById('rgstInput-posi3');
    regThrowInput = document.getElementById('rgstInput-throw');
    regDandouInput = document.getElementById('rgstInput-dandou');
    regMeetInput = document.getElementById('rgstInput-meet');
    regPowerInput = document.getElementById('rgstInput-power');
    regSpeedInput = document.getElementById('rgstInput-speed');
    regArmInput = document.getElementById('rgstInput-arm');
    regDefenseInput = document.getElementById('rgstInput-defense');
    regCatchInput = document.getElementById('rgstInput-catch');
    regMemoInput = document.getElementById('rgstInput-memo');
    regseikakuInput = document.getElementById('rgstInput-seikaku');
    regButton = document.getElementById('reg-button');
    clearButton = document.getElementById('clear-button');

    playerListBody = document.querySelector('#table-player tbody');
    authStatus = document.getElementById('auth-state');
    authButton = document.getElementById('auth-button');
    registRow = document.getElementById('regist-row');

    return {
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
        regMemoInput,
        regseikakuInput,
        regButton,
        clearButton,
        playerListBody,
        authStatus,
        authButton,
        registRow,
    };
}

/**
 * UIの初期化を行う関数
 * フォームの数値入力フィールドの増減ボタンにイベントリスナーを設定します
 
export function initUI() {
    const elements = getUIElements(); // 要素への参照を確保

}*/