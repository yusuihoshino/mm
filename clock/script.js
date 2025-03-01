// ボタン
const timeH = document.getElementById("timeH");
const timeM = document.getElementById("timeM");
const timeS = document.getElementById("timeS");
const timeT = document.getElementById("timeT");
const dividers = document.querySelectorAll('#divider');

// 他要素
const sidebarShowBtn = document.getElementById("sidebar-show-btn");
const sidebarCloseBtn = document.getElementById("sidebar-close-btn");

const sidebar = document.getElementById("sidebar");

const display = document.getElementById("stopwatch-display");
const deleteBtn = document.getElementById("delete-btn");

const fontSizeSlider = document.getElementById("font-size-slider");
const stopBgColorPicker = document.getElementById("stop-bg-color");
const countBgColorPicker = document.getElementById("count-bg-color");

const fontSelector = document.getElementById('fontSelector');


// 音声ファイル
const start_audio = new Audio("../sound/start.wav");
const stop_audio = new Audio("../sound/stop.wav");
const delete_audio = new Audio("../sound/delete.wav");
const swipe_audio = new Audio("../sound/swipe.wav");
const tap_audio = new Audio("../sound/tap.wav");

let running = false;
let elapsedTime = 0;
let interval;
let keydownHandled = false;

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 初期設定: ストップ状態
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
document.body.style.backgroundColor = stopBgColorPicker.value; // stopとdelete時の背景色
document.body.classList.remove("dark-mode"); // ダークモード無効化


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// リセットボタン
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ディスプレイ更新
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
setInterval(updateDisplay, 10);
function updateDisplay(time) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const tenthsOfMilliseconds = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
  
  document.title = `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; // タブに時間を表示

  timeH.textContent = `${String(hours).padStart(2, "0")}`;
  timeM.textContent = `${String(minutes % 60).padStart(2, "0")}`;
  timeS.textContent = `${String(seconds).padStart(2, "0")}`;
  timeT.textContent = `${String(tenthsOfMilliseconds).padStart(2, "0")}`;
}

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 背景色のリアルタイム変更
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
function updateBackgroundColor() {
  let picker;
  let bgColor;
  if (running) {
    picker = countBgColorPicker;
  } else {
    picker = stopBgColorPicker;
  }
  bgColor = picker.value
  document.body.style.backgroundColor = bgColor;

  const rgbColor = hexToRgb(bgColor);
  const luminance = getLuminance(rgbColor); // 輝度を計算
  if (luminance < 0.5) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

stopBgColorPicker.addEventListener("input", () => {
  updateBackgroundColor();
});



function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

// 照度計算
function getLuminance(color) {
  const rgb = color.match(/\d+/g); // RGBの数値を取り出す
  const r = parseInt(rgb[0], 10) / 255;
  const g = parseInt(rgb[1], 10) / 255;
  const b = parseInt(rgb[2], 10) / 255;
  // 輝度の計算（加重平均）
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// サイドバーの表示非表示
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
function toggleSidebar() {
  playAudio(swipe_audio);
  sidebar.classList.toggle("active");
  sidebarShowBtn.classList.toggle("disable");
}

sidebarShowBtn.addEventListener("click", toggleSidebar);
sidebarCloseBtn.addEventListener("click", toggleSidebar);

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// キー入力でボタン操作
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyS") {
    if (!keydownHandled) {
      toggleSidebar();
      keydownHandled = true;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyS") {
  }

  keydownHandled = false;
});


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// フォント変更
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

fontSelector.addEventListener('change', (event) => {
  const selectedIndex = event.target.selectedIndex;
  const className = `font${selectedIndex}`;  // font+selectedIndexのクラス名を動的に生成
  
  // timeH, timeM, timeS, timeT に対してクラスを追加
  [timeH, timeM, timeS, timeT].forEach(element => {
    element.classList.add(className);
  });
});


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// サウンド再生
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
function playAudio(audioElement) {
  if (!audioElement.paused) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  audioElement.play();
}

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// フォントサイズ調整
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
fontSizeSlider.addEventListener("input", (e) => {
  timeH.style.fontSize = `${e.target.value}rem`;
  timeM.style.fontSize = `${e.target.value}rem`;
  timeS.style.fontSize = `${e.target.value}rem`;
  timeT.style.fontSize = `${e.target.value}rem`;
  dividers.forEach(divider => {
    divider.style.fontSize = `${e.target.value}rem`;
  });
});
