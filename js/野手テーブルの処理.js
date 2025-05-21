function rank(text){
    // name="meet_lev"のinput要素を取得
    val = document.getElementsByName(`${text}`);
    status = val[0].value;
    // 「status」がテキストボックス内の値
    if(status < 30){
        document.getElementById(text).innerHTML = "G";
        document.getElementById(`${text}`).style.color = "#C0C0C0";
    }else if(status < 40){
        document.getElementById(text).innerHTML = "F";
        document.getElementById(`${text}`).style.color = "#3399ff";
    }else if(status < 50){
        document.getElementById(text).innerHTML = "E";
        document.getElementById(`${text}`).style.color = "#aaff33";
    }else if (status < 60){
        document.getElementById(text).innerHTML = "D";
        document.getElementById(`${text}`).style.color = "#ffdd55";
    }else if (status < 70){
        document.getElementById(text).innerHTML = "C";
        document.getElementById(`${text}`).style.color = "#ff9900";
    }else if (status < 80){
        document.getElementById(text).innerHTML = "B";
        document.getElementById(`${text}`).style.color = "red";
    }else if (status < 90){
        document.getElementById(text).innerHTML = "A";
        document.getElementById(`${text}`).style.color = "magenta";
    }else{						
        document.getElementById(text).innerHTML = "S";
        document.getElementById(`${text}`).style.color = "pink";
    }

}

function status1(text, flag) {
    if (text.value == "") {
        // テキストボックスが空の場合、0を代入
        text.value = "0";
    }
    
    n = parseInt(text.value) + flag;
    // 変数nが0未満の場合、111を代入
    if (n < 0) {
        n = 111;
    }
    // 変数nが111を超えた場合、0を代入
    if (n > 111) {
        n = 0;
    }
    // テキストボックスに、変数nの値を代入
    text.value = n;
    // 上下ボタンを押したときG~Sのランクを表示
    rank(text.name);
}

function status2(text, flag) {
    if (text.value == "") {
        // テキストボックスが空の場合、-を代入
        text.value = "ー";
    }
    // text.valueはG,F,E,D,C,B,A,Sのいずれか
    // 変数nに、text.valueのインデックスを代入
    n = "GFEDCBAS".indexOf(text.value) + flag;
    // 変数nが0未満の場合、8を代入
    if (n < 0) {
        n = 7;
    }
    // 変数nが8を超えた場合、0を代入
    if (n > 7) {
        n = 0;
    }
    // テキストボックスに、変数nの値を代入
    text.value = "GFEDCBAS".charAt(n);

    // テキストボックスの文字色を変更
    switch (text.value) {
        case "G":
            // うすい灰色
            text.style.color = "crimson";
            break;
        case "F":
            text.style.color = "crimson";
            break;
        case "E":
            text.style.color = "#C0C0C0";
            break;
        case "D":
            text.style.color = "#C0C0C0";
            break;
        case "C":
            text.style.color = "#C0C0C0";
            break;
        case "B":
            text.style.color = "#1499db";
            break;
        case "A":
            text.style.color = "#1499db";
            break;
        case "S":
            text.style.color = "#dbba14";
            break;
    }
}
