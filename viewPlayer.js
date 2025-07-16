// viewPlayer.js

import { getUIElements } from './ui.js';
import { currentUser } from './auth.js';
import { updatePlayer, deletePlayer } from './firestore.js'; // 編集・削除のためにインポート

let playerListBody;

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
const BallHenkaDirections = [
    { dir: 'left', symbol: '←' },
    { dir: 'downLeft', symbol: '↙' },
    { dir: 'down', symbol: '↓' },
    { dir: 'downRight', symbol: '↘' },
    { dir: 'right', symbol: '→' }
];

// 性格と上がりやすいパラメータのマップ
const seikakuStatMap = {
    '天才肌': ['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'],
    'ごくふつう': ['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'],
    '内気': ['defense', 'catching', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'],
    'したたか': ['speed', 'catching', 'BallHenka1_up', 'BallHenka1_down', 'BallHenka1_left', 'BallHenka1_right', 'BallHenka1_downLeft', 'BallHenka1_downRight', 'BallHenka2_value'],
    'クール': ['meet', 'defense', 'control'],
    'お調子者': ['speed', 'armStrength', 'pitSpeed'],
    'やんちゃ': ['meet', 'power', 'pitSpeed'],
    '熱血漢': ['power', 'armStrength', 'stamina']
};

/**
 * 数値ステータスをアルファベットランクに変換する関数
 * @param {string} statType - ステータスの種類 ('throwing', 'meet', 'power', ...)
 * @param {number} value - ステータスの数値
 * @returns {string} アルファベットランク
 */
function transGrade(statType, value) {
    if (isNaN(value)) {
        return '';
    }

    if (statType === 'throwing') {
        const grades = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
        if (value >= 0 && value <= 7) {
            return grades[value];
        }
    } else if (['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed'].includes(statType)) {
        if (value >= 90) return 'S';
        if (value >= 80) return 'A';
        if (value >= 70) return 'B';
        if (value >= 60) return 'C';
        if (value >= 50) return 'D';
        if (value >= 40) return 'E';
        if (value >= 20) return 'F';
        if (value >= 1) return 'G';
        if (value === 0) return 'G';
    } else if (statType === 'dandou') {
        return value.toString();
    }
    return '';
}

/**
 * アルファベットランクに基づいて要素に色を適用する関数
 * @param {HTMLElement} element - 色を適用するDOM要素
 * @param {string} statType - ステータスの種類 ('throwing', 'meet', ...)
 * @param {string} grade - アルファベットランク (例: 'A', 'S', 'G')
 */
function applyGradeColor(element, statType, grade) {
    element.classList.remove('grade-G', 'grade-F', 'grade-E', 'grade-D', 'grade-C', 'grade-B', 'grade-A', 'grade-S',
         'grade-throwing-G', 'grade-throwing-F', 'grade-throwing-E', 'grade-throwing-D', 'grade-throwing-C', 'grade-throwing-B', 'grade-throwing-A', 'grade-throwing-S');

    if (statType === 'throwing') {
        element.classList.add(`grade-${statType}-${grade}`);
    } else if (['meet', 'power', 'speed', 'armStrength', 'defense', 'catching', 'control', 'stamina', 'pitSpeed'].includes(statType)) {
        element.classList.add(`grade-${grade}`);
    }
    element.classList.add('stat-grade');
}

/**
 * 性格に応じてパラメータ入力欄にハイライトを適用する関数
 * @param {object} player - 選手データオブジェクト
 * @param {HTMLElement} rowElement - 選手データの行要素
 * @param {HTMLElement} [pitRowElement] - 投手詳細データの行要素 (投手の場合のみ)
 */
function seikakuColor(player, rowElement, pitRowElement = null) {
    rowElement.querySelectorAll('.seikaku-color').forEach(el => {
        el.classList.remove('seikaku-color');
    });
    if (pitRowElement) {
        pitRowElement.querySelectorAll('.seikaku-color').forEach(el => {
            el.classList.remove('seikaku-color');
        });
    }

    const seikaku = player.seikaku;
    if (seikaku && seikakuStatMap[seikaku]) {
        const statsToHighlight = seikakuStatMap[seikaku];

        statsToHighlight.forEach(statField => {
            let inputElement = rowElement.querySelector(`[data-field="${statField}"]`);
            if (inputElement) {
                inputElement.classList.add('seikaku-color');
            } else if (pitRowElement) {
                inputElement = pitRowElement.querySelector(`[data-field="${statField}"]`);
                if (inputElement) {
                    inputElement.classList.add('seikaku-color');
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
function createpitStats(player) {
    const pitSpeed = player.pitSpeed || '';
    const control = player.control || '';
    const stamina = player.stamina || '';
    const BallHenka1 = player.BallHenka1 || {};
    const BallHenka2 = player.BallHenka2 || { type: '', value: '' };

    const controlGrade = transGrade('control', control);
    const staminaGrade = transGrade('stamina', stamina);
    const pitSpeedGrade = transGrade('pitSpeed', pitSpeed);

    const BallHenka2Options = `
        <option value="">なし</option>
        ${BallHenkaDirections.map(b => `<option value="${b.dir}" ${BallHenka2.type === b.dir ? 'selected' : ''}>${b.symbol}</option>`).join('')}
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
                <div class="BallHenka1-group">
                    <label>変化量:</label>
                    ${BallHenkaDirections.map(b => `
                        <span>${b.symbol}</span><input type="number" min="0" max="7" value="${BallHenka1[b.dir] || ''}" data-field="BallHenka1_${b.dir}">
                    `).join('')}
                </div>
                <div class="BallHenka2-group">
                    <label>第二変化量:</label>
                    <select data-field="BallHenka2_type">
                        ${BallHenka2Options}
                    </select>
                    <input type="number" min="0" max="7" value="${BallHenka2.value || ''}" data-field="BallHenka2_value" class="BallHenka2-group">
                </div>
            </div>
        </div>
    `;
}

/**
 * 選手データと学年に基づいて、テーブルの行要素を作成する関数
 * @param {object} player - 選手データオブジェクト
 * @returns {Array<HTMLElement>} 作成された行要素の配列 ([選手行, 投手詳細行(あれば)])
 */
function createPlayerRow(player) {
    const row = document.createElement('tr');
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

    const playerInfoCell = row.insertCell();
    playerInfoCell.classList.add('grade-cell');
    const gradeP = document.createElement('p');
    gradeP.classList.add('data-grade');
    gradeP.textContent = `${player.calculatedGrade}年生`;
    const YearP = document.createElement('p');
    YearP.classList.add('data-year');
    YearP.textContent = `${player.enrollmentYear}年`;
    playerInfoCell.appendChild(gradeP);
    playerInfoCell.appendChild(YearP);

    const nameCell = row.insertCell();
    nameCell.classList.add('name-cell');
    const nameText = document.createElement(`p`);
    nameText.classList.add('name-text');
    nameText.textContent = player.name;
    nameCell.appendChild(nameText);

    if (currentUser) {
        const seikakuSelect = document.createElement('select');
        seikakuSelect.classList.add('input-seikaku');
        seikakuSelect.dataset.playerId = player.id;
        seikakuSelect.dataset.field = 'seikaku';
        const personalities = ['性格を選択', '天才肌', 'ごくふつう', '内気', 'したたか', 'クール', 'お調子者', 'やんちゃ', '熱血漢'];
        personalities.forEach(seikaku => {
            const option = document.createElement('option');
            option.value = seikaku;
            option.textContent = seikaku === '性格を選択' ? '性格を選択' : seikaku;
            if (player.seikaku === seikaku) {
                option.selected = true;
            }
            seikakuSelect.appendChild(option);
        });
        seikakuSelect.addEventListener('change', async (e) => {
            const updatedValue = e.target.value;
            const playerId = e.target.dataset.playerId;
            const field = e.target.dataset.field;
            const updatedData = { [field]: updatedValue };
            await updatePlayer(playerId, updatedData, player.name);
        });
        nameCell.appendChild(seikakuSelect);
    }

    const positionCell = row.insertCell();
    positionCell.classList.add('position-cell');
    if (currentUser) {
        const positionsContainer = document.createElement('div');
        positionsContainer.classList.add('position-edit');

        const Select_mainPosi = document.createElement('select');
        Select_mainPosi.classList.add('input-position');
        Select_mainPosi.dataset.playerId = player.id;
        Select_mainPosi.dataset.field = 'positions_0';
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

        const Select_subPosi1 = document.createElement('select');
        Select_subPosi1.classList.add('input-position', 'select-subPosi');
        Select_subPosi1.dataset.playerId = player.id;
        Select_subPosi1.dataset.field = 'positions_1';
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

        if (player.positions[0] !== '投手') {
            const Select_subPosi2 = document.createElement('select');
            Select_subPosi2.classList.add('input-position', 'select-subPosi');
            Select_subPosi2.dataset.playerId = player.id;
            Select_subPosi2.dataset.field = 'positions_2';
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
            const detailButton = document.createElement('button');
            detailButton.textContent = '詳細';
            detailButton.classList.add('detail-btn');
            detailButton.addEventListener('click', () => {
                const pitStatsRow = document.getElementById(`pitStats-row-${player.id}`);
                if (pitStatsRow) {
                    pitStatsRow.classList.toggle('hidden');
                }
            });
            positionsContainer.appendChild(detailButton);
        }
        positionCell.appendChild(positionsContainer);
    } else {
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
        cell.classList.add('data-cell');

        if (currentUser) {
            const gradeSpan = document.createElement('span');
            gradeSpan.classList.add('grade-display');
            const grade = transGrade(stat.field, stat.value);
            gradeSpan.textContent = grade;
            applyGradeColor(gradeSpan, stat.field, grade);
            cell.appendChild(gradeSpan);

            const inputContainer = document.createElement('div');
            inputContainer.classList.add('input-set');

            const input = document.createElement('input');
            input.type = 'number';
            input.value = stat.value;
            input.dataset.playerId = player.id;
            input.dataset.field = stat.field;
            input.classList.add('edit-input');

            const decreBtn = document.createElement('button');
            decreBtn.textContent = '-';
            decreBtn.classList.add('decrease-btn');
            decreBtn.addEventListener('click', () => {
                input.stepDown();
                input.dispatchEvent(new Event('change'));
            });

            const increBtn = document.createElement('button');
            increBtn.textContent = '+';
            increBtn.classList.add('increase-btn');
            increBtn.addEventListener('click', () => {
                input.stepUp();
                input.dispatchEvent(new Event('change'));
            });

            inputContainer.appendChild(decreBtn);
            inputContainer.appendChild(input);
            inputContainer.appendChild(increBtn);
            cell.appendChild(inputContainer);

            let inputTypingTimer;
            input.addEventListener('change', async (e) => {
                clearTimeout(inputTypingTimer);
                const updatedValue = parseInt(e.target.value);
                const playerId = e.target.dataset.playerId;
                const field = e.target.dataset.field;

                const newGrade = transGrade(field, updatedValue);
                gradeSpan.textContent = newGrade;
                applyGradeColor(gradeSpan, field, newGrade);
                
                inputTypingTimer = setTimeout( async() => {
                    const updatedData = { [field]: updatedValue };
                    await updatePlayer(playerId, updatedData, player.name);
                }, 400); 
            });
        } else {
            const gradeSpan = document.createElement('span');
            gradeSpan.classList.add('grade-display');
            const grade = transGrade(stat.field, stat.value);
            gradeSpan.textContent = grade;
            applyGradeColor(gradeSpan, stat.field, grade);
            cell.appendChild(gradeSpan);

            const valueSpan = document.createElement('span');
            valueSpan.textContent = stat.value;
            cell.appendChild(valueSpan);
        }
    });

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

        let memoTypingTimer;
        memoInput.addEventListener('input', () => {
            clearTimeout(memoTypingTimer);
            memoTypingTimer = setTimeout(async () => {
                const updatedValue = memoInput.value;
                const playerId = memoInput.dataset.playerId;
                const field = memoInput.dataset.field;
                const updatedData = { [field]: updatedValue };
                await updatePlayer(playerId, updatedData, player.name);
            }, 5000);
        });
    } else {
        memoCell.textContent = player.memo || '記載事項なし。';
    }

    const actionCell = row.insertCell();
    actionCell.classList.add('action-cell');
    let pitStatsRow = null;

    if (currentUser) {
        const updtBtn = document.createElement('button');
        updtBtn.textContent = '更新';
        updtBtn.classList.add('update-btn');
        updtBtn.addEventListener('click', async () => {
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
            if (player.positions.includes('投手')) {
                const pitcherContainer = document.getElementById(`pitStats-row-${player.id}`);
                if (pitcherContainer) {
                    updatedData.pitSpeed = parseInt(pitcherContainer.querySelector('[data-field="pitSpeed"]').value);
                    updatedData.control = parseInt(pitcherContainer.querySelector('[data-field="control"]').value);
                    updatedData.stamina = parseInt(pitcherContainer.querySelector('[data-field="stamina"]').value);

                    const BallHenka1 = {};
                    BallHenkaDirections.forEach(b => {
                        const input = pitcherContainer.querySelector(`[data-field="BallHenka1_${b.dir}"]`);
                        if (input && !isNaN(parseInt(input.value))) {
                            BallHenka1[b.dir] = parseInt(input.value);
                        }
                    });
                    updatedData.BallHenka1 = BallHenka1;

                    const BallHenka2Type = pitcherContainer.querySelector('[data-field="BallHenka2_type"]').value;
                    const BallHenka2Value = parseInt(pitcherContainer.querySelector('[data-field="BallHenka2_value"]').value);
                    updatedData.BallHenka2 = {
                        type: BallHenka2Type,
                        value: isNaN(BallHenka2Value) ? '' : BallHenka2Value
                    };
                }
            }
            await updatePlayer(player.id, updatedData, player.name);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '卒業';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', async () => {
            await deletePlayer(player.id, player.name);
        });

        actionCell.appendChild(updtBtn);
        actionCell.appendChild(deleteButton);
    } else {
        actionCell.textContent = '-';
    }

    if (player.positions && player.positions.includes('投手')) {
        pitStatsRow = document.createElement('tr');
        pitStatsRow.id = `pitStats-row-${player.id}`;
        pitStatsRow.classList.add('pitStats-row', 'hidden');

        const pitcherStatsCell = document.createElement('td');
        pitcherStatsCell.setAttribute('colspan', '14');
        pitcherStatsCell.innerHTML = createpitStats(player);
        pitStatsRow.appendChild(pitcherStatsCell);
    }
    
    // 性格に応じたハイライトを適用
    seikakuColor(player, row, pitStatsRow);

    return [row, pitStatsRow].filter(Boolean); // nullを除外して返す
}

/**
 * 選手リストのUI（表示）を更新する関数
 * @param {Array} playersData - 表示する選手データの配列
 */
export function updatePlayerListUI(playersData = []) {
    const elements = getUIElements();
    playerListBody = elements.playerListBody;
    const registRow = elements.registRow; // ui.jsから取得

    Array.from(playerListBody.children).forEach(child => {
        if (child.id !== 'regist-row') {
            child.remove();
        }
    });

    const errorRow = playerListBody.querySelector('.error-message-row');
    if (errorRow) {
        errorRow.remove();
    }

    if (playersData.length === 0) {
        const noPlayerRow = document.createElement('tr');
        const cell = noPlayerRow.insertCell();
        cell.colSpan = 13;
        cell.textContent = 'まだ選手がいません。';
        noPlayerRow.classList.add('no-player');
        playerListBody.appendChild(noPlayerRow);
        playerListBody.appendChild(registRow);
        return;
    }

    const all_years = playersData.map(player => player.enrollmentYear);
    const latest_year = all_years.length > 0 ? Math.max(...all_years) : null;

    const playersGrade = playersData.map(player => {
        let grade = null;
        if (latest_year !== null) {
            grade = (latest_year - player.enrollmentYear) + 1;
        }
        return { ...player, calculatedGrade: grade };
    }).filter(player => player.calculatedGrade >= 1 && player.calculatedGrade <= 3);

    playersGrade.sort((a, b) => {
        if (a.calculatedGrade !== b.calculatedGrade) {
            return b.calculatedGrade - a.calculatedGrade;
        }
        const posA = a.positions && a.positions.length > 0 ? a.positions[0] : '';
        const posB = b.positions && b.positions.length > 0 ? b.positions[0] : '';
        if (positionOrder[posA] !== positionOrder[posB]) {
            return positionOrder[posA] - positionOrder[posB];
        }
        if (a.enrollmentYear !== b.enrollmentYear) {
            return b.enrollmentYear - a.enrollmentYear;
        }
        return a.name.localeCompare(b.name);
    });

    const rowsToAppend = [];

    playersGrade.forEach(player => {
        const [playerRow, pitStatsRow] = createPlayerRow(player);
        rowsToAppend.push(playerRow);
        if (pitStatsRow) {
            rowsToAppend.push(pitStatsRow);
        }
    });

    Array.from(playerListBody.children).forEach(child => {
        if (child.id !== 'regist-row') {
            child.remove();
        }
    });

    rowsToAppend.forEach(row => playerListBody.appendChild(row));
    playerListBody.appendChild(registRow);
}