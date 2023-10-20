// cameraFunctions.js

let maxWidth = 0;
let maxHeight = 0;
// 調べている間は「起動中」などのモーダルを表示する ※必須
// capabilitiesは設定され得る値なのでsettings(実際に使用されている値)と違う場合があるかも知れない ※必須
// 起動時にデバイスでサポートされている最大の解像度を調べる関数
async function fetchMaxResolution() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const videoTrack = stream.getVideoTracks()[0];
  const capabilities = videoTrack.getCapabilities();
  
  maxWidth = capabilities.width.max;
  maxHeight = capabilities.height.max;

  videoTrack.stop();
  // alert(`width:${maxWidth} height:${maxHeight}`);
}

fetchMaxResolution()

export async function createStream(cameraPreview) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment', // 外部カメラの使用
      width: maxWidth,
      height: maxHeight
    }
  });
  cameraPreview.srcObject = stream;
  return stream;
}

export async function processImage(blob) {
  const formData = new FormData();
  formData.append('image', blob, 'image.png');

  const response = await fetch('/ocr', {
    method: 'POST',
    body: formData,
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
    }
  });
  console.log("読み込み後：", response); // オブジェクトそのまま出力
  
  const data = await response.json();

  console.log("読み込み後json：", data); // オブジェクトそのまま出力
  return data;
}

export async function initResizableRect(rect, lightDarkArea) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let startWidth = 0, startHeight = 0;
  let initialCenterX = 0, initialCenterY = 0;

  // PC向けのマウスイベント
  rect.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", drag);
  window.addEventListener("mouseup", endDrag);

  // スマホ向けのタッチイベント
  rect.addEventListener("touchstart", startDrag);
  window.addEventListener("touchmove", drag);
  window.addEventListener("touchend", endDrag);

  function startDrag(e) {
    // タッチイベントかマウスイベントかを判断
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    isDragging = true;
    startX = clientX;
    startY = clientY;
    startWidth = parseFloat(window.getComputedStyle(rect).width);
    startHeight = parseFloat(window.getComputedStyle(rect).height);

    // 矩形の中心座標を計算
    const rectBound = rect.getBoundingClientRect();
    initialCenterX = rectBound.left + startWidth / 2;
    initialCenterY = rectBound.top + startHeight / 2;
  }

  function drag(e) {
    if (!isDragging) return;

    // タッチイベントかマウスイベントかを判断
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    // 新しいマウス座標から中心までの距離
    const newDistX = Math.abs(e.clientX - initialCenterX);
    const newDistY = Math.abs(e.clientY - initialCenterY);

    // 初期マウス座標から中心までの距離
    const initialDistX = Math.abs(startX - initialCenterX);
    const initialDistY = Math.abs(startY - initialCenterY);

    // 拡大または縮小を決定
    const deltaX = newDistX - initialDistX;
    const deltaY = newDistY - initialDistY;

    let newWidth = startWidth + deltaX * 2;
    let newHeight = startHeight + deltaY * 2;

    newWidth = Math.max(100, Math.min(window.innerWidth - 100, newWidth));
    newHeight = Math.max(100, Math.min(window.innerHeight - 100, newHeight));

    rect.style.width = `${newWidth}px`;
    rect.style.height = `${newHeight}px`;

    // 新しい幅と高さに基づいてpath要素を更新
    const topLeftCorner = rect.querySelector('.top-left-corner');
    const topRightCorner = rect.querySelector('.top-right-corner');
    const bottomRightCorner = rect.querySelector('.bottom-right-corner');
    const bottomLeftCorner = rect.querySelector('.bottom-left-corner');

    topLeftCorner.setAttribute("d", `M 2,22 Q 2,2 22,2`);
    topRightCorner.setAttribute("d", `M ${newWidth - 2},22 Q ${newWidth - 2},2 ${newWidth - 22},2`);
    bottomRightCorner.setAttribute("d", `M ${newWidth - 22},${newHeight - 2} Q ${newWidth - 2},${newHeight - 2} ${newWidth - 2},${newHeight - 22}`);
    bottomLeftCorner.setAttribute("d", `M 22,${newHeight - 2} Q 2,${newHeight - 2} 2,${newHeight - 22}`);

    // 新しい幅と高さに基づいてmaskのrectを更新
    const maskRect = lightDarkArea.querySelector('.mask-rect');
    maskRect.setAttribute("width", newWidth);
    maskRect.setAttribute("height", newHeight);
    maskRect.setAttribute("transform", `translate(-${newWidth / 2}, -${newHeight / 2})`);
  }

  function endDrag() {
    isDragging = false;
  }
}
