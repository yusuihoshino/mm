
// 他要素
const sidebarShowBtn = document.getElementById("sidebar-show-btn");
const sidebarCloseBtn = document.getElementById("sidebar-close-btn");

const sidebar = document.getElementById("sidebar");

const fontSizeSlider = document.getElementById("font-size-slider");
const stopBgColorPicker = document.getElementById("stop-bg-color");


const memo = document.getElementById("memo-text");

// 音声ファイル
const start_audio = new Audio("start.wav");
const stop_audio = new Audio("stop.wav");
const delete_audio = new Audio("delete.wav");
const swipe_audio = new Audio("swipe.wav");
const tap_audio = new Audio("tap.wav");

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
  memo.style.fontSize = `${e.target.value}rem`;
  memo.style.lineHeight = `${e.target.value*2}rem`;
});

