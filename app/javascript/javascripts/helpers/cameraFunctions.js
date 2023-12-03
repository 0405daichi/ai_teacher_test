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

// pcとスマホ版の共通コード
export async function initResizableRect(rect, lightDarkArea, preview) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let startWidth = 0, startHeight = 0;
  let initialCenterX = 0, initialCenterY = 0;

  function startDrag(e) {
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;
    startWidth = parseFloat(window.getComputedStyle(rect).width);
    startHeight = parseFloat(window.getComputedStyle(rect).height);

    const rectBound = rect.getBoundingClientRect();
    initialCenterX = rectBound.left + startWidth / 2;
    initialCenterY = rectBound.top + startHeight / 2;
  }

  function duringDrag(e) {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const newDistX = Math.abs(clientX - initialCenterX);
    const newDistY = Math.abs(clientY - initialCenterY);

    const initialDistX = Math.abs(startX - initialCenterX);
    const initialDistY = Math.abs(startY - initialCenterY);

    const deltaX = newDistX - initialDistX;
    const deltaY = newDistY - initialDistY;

    let newWidth = startWidth + deltaX * 2;
    let newHeight = startHeight + deltaY * 2;

    const previewRect = preview.getBoundingClientRect();

    // プレビュー画像の範囲内でのみリサイズを許可
    newWidth = Math.max(100, Math.min(newWidth, previewRect.width - (rect.getBoundingClientRect().left - previewRect.left)));
    newHeight = Math.max(100, Math.min(newHeight, previewRect.height - (rect.getBoundingClientRect().top - previewRect.top)));

    rect.style.width = `${newWidth}px`;
    rect.style.height = `${newHeight}px`;

    // pathの位置とmask-rectの位置とサイズを更新
    const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    corners.forEach(corner => {
      const path = rect.querySelector(`.${corner}-corner`);
      const maskRect = lightDarkArea.querySelector('.mask-rect');

      let pathD = '';
      let maskRectTransform = `translate(-${newWidth / 2}, -${newHeight / 2})`;

      switch (corner) {
        case 'top-left':
          pathD = `M 2,22 Q 2,2 22,2`;
          break;
        case 'top-right':
          pathD = `M ${newWidth - 2},22 Q ${newWidth - 2},2 ${newWidth - 22},2`;
          break;
        case 'bottom-right':
          pathD = `M ${newWidth - 22},${newHeight - 2} Q ${newWidth - 2},${newHeight - 2} ${newWidth - 2},${newHeight - 22}`;
          break;
        case 'bottom-left':
          pathD = `M 22,${newHeight - 2} Q 2,${newHeight - 2} 2,${newHeight - 22}`;
          break;
      }

      path.setAttribute("d", pathD);
      maskRect.setAttribute("width", newWidth);
      maskRect.setAttribute("height", newHeight);
      maskRect.setAttribute("transform", maskRectTransform);
    });
  }

  function endDrag() {
    isDragging = false;
  }

  rect.addEventListener("mousedown", startDrag);
  rect.addEventListener("touchstart", startDrag);
  window.addEventListener("mousemove", duringDrag);
  window.addEventListener("touchmove", duringDrag);
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);
}

// カメラプレビューの位置とサイズを取得して調整する関数
export async function adjustOverlayElements(rect, lightDarkArea, preview) {
  const previewRect = cameraPreview.getBoundingClientRect();
  const maskRect = lightDarkArea.querySelector('.mask-rect');
  // 四つ角のパスを調整
  const newWidth = previewRect.width / 2;
  const newHeight = previewRect.height / 2;
  lightDarkArea.style.width = `${previewRect.width}px`;
  lightDarkArea.style.height = `${previewRect.height}px`;
  rect.style.width = `${newWidth}px`;
  rect.style.height = `${newHeight}px`;
  rect.style.left = `${newWidth}px`;
  rect.style.top = `${newHeight}px`;
  maskRect.setAttribute("width", newWidth);
  maskRect.setAttribute("height", newHeight);
  maskRect.setAttribute("transform", `translate(-${newWidth / 2}, -${newHeight / 2})`);

  // pathの位置とmask-rectの位置とサイズを更新
  const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
  corners.forEach(corner => {
    const path = rect.querySelector(`.${corner}-corner`);

    let pathD = '';

    switch (corner) {
      case 'top-left':
        pathD = `M 2,22 Q 2,2 22,2`;
        break;
      case 'top-right':
        pathD = `M ${newWidth - 2},22 Q ${newWidth - 2},2 ${newWidth - 22},2`;
        break;
      case 'bottom-right':
        pathD = `M ${newWidth - 22},${newHeight - 2} Q ${newWidth - 2},${newHeight - 2} ${newWidth - 2},${newHeight - 22}`;
        break;
      case 'bottom-left':
        pathD = `M 22,${newHeight - 2} Q 2,${newHeight - 2} 2,${newHeight - 22}`;
        break;
    }

    path.setAttribute("d", pathD);
  });
  
  // ウィンドウのリサイズ時に調整を行う
  window.addEventListener('resize', () => adjustOverlayElements(rect, lightDarkArea, preview));
}

function calculateDisplayedImageSize(preview) {
  const naturalAspectRatio = preview.naturalWidth / preview.naturalHeight;
  const containerAspectRatio = preview.offsetWidth / preview.offsetHeight;
  let displayedWidth, displayedHeight;

  if (containerAspectRatio > naturalAspectRatio) {
    // 高さに基づいて幅を計算
    displayedHeight = preview.offsetHeight;
    displayedWidth = displayedHeight * naturalAspectRatio;
  } else {
    // 幅に基づいて高さを計算
    displayedWidth = preview.offsetWidth;
    displayedHeight = displayedWidth / naturalAspectRatio;
  }

  return { width: displayedWidth, height: displayedHeight };
}
// // 四つ角のパス要素を更新する関数
// function updateCorners(newWidth, newHeight) {
  
// }
