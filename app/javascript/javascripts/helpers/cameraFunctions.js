// app/javascript/javascripts/helpers/cameraFunctions.js
import { toggleOverlay } from './common_functions.js';

// 調べている間は「起動中」などのモーダルを表示する ※必須
// capabilitiesは設定され得る値なのでsettings(実際に使用されている値)と違う場合があるかも知れない ※必須
// 起動時にデバイスでサポートされている最大の解像度を調べる関数
let currentStream = null;
let currentCameraModal = null;

// カメラの設定を保持するオブジェクト
const cameraSettings = {
  isInitialized: false,
  maxWidth: null,
  maxHeight: null
};

// カメラの最大解像度を取得し、ストリームを保持する
async function initializeCamera() {
  if (sessionStorage.getItem('isCameraInitialized') === 'true') {
    return; // すでに初期化されている場合は何もしない
  }

  try {
    toggleOverlay('show', 'camera-setting');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = stream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities();
  
    cameraSettings.maxWidth = capabilities.width.max;
    cameraSettings.maxHeight = capabilities.height.max;
    cameraSettings.isInitialized = true;

    videoTrack.stop();
    toggleOverlay('hide');
  } catch (error) {
    toggleOverlay('hide');
    if (error.name === 'NotAllowedError') {
      // ユーザーがアクセスを拒否した場合
      alert('宿題カメラを使用するには設定からカメラへのアクセスを許可してください。');
    } else {
      // その他のエラー
      console.error('カメラの初期化に失敗しました。', error);
    }
  }
}

// 現在のページがホームページであるかどうかを確認する
function isHomePage() {
  return window.location.pathname === '/';
}

// ページがホームページの場合のみカメラの初期化を実行
if (isHomePage()) {
  initializeCamera();
}


// カメラを開く
export async function openCamera(modalElement, cameraPreviewElement) {
  // カメラの初期化が完了していない場合はユーザーに確認し、リロードを促す
  if (!cameraSettings.isInitialized) {
    const reload = confirm('カメラが設定されていません。\r\nアプリを再起動しますか？');
    if (reload) {
      window.location.reload();
    }
    return;
  }

  try {
    toggleOverlay('show', 'camera-setting');
    // ビデオトラックの初期設定
    let videoConstraints = {
      facingMode: 'environment', // 外部カメラの使用
      width: cameraSettings.maxWidth,
      height: cameraSettings.maxHeight
    };
    
    // グローバルストリームに保存
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints
    });
    cameraPreviewElement.srcObject = currentStream;

    // モーダル要素をグローバル変数に保存
    currentCameraModal = modalElement;
    toggleOverlay('hide');
    $('#camera-alert').show();
  } catch (error) {
    toggleOverlay('hide');
    console.error('カメラへのアクセスに失敗しました。', error);

    // カメラへのアクセスが拒否された場合の処理
    if (error.name === 'NotAllowedError') {
      alert('宿題カメラを使用するには設定からカメラへのアクセスを許可してください。');
    } else {
      // その他のエラーに対する処理
      const reload = confirm('カメラへのアクセスに失敗しました。\r\nアプリを再起動しますか？');
      if (reload) {
        window.location.reload();
      }
    }
  }
}


// 撮影する
export async function takePhoto() {
  if (!currentStream) {
    console.error('カメラが起動していません。');
    return;
  }

  const videoTrack = currentStream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(videoTrack);

  try {
    const blob = await imageCapture.takePhoto();
    const imageBitmap = await createImageBitmap(blob);
    const originalImageUrl = URL.createObjectURL(blob);
    return imageBitmap;
  } catch (error) {
    console.error('写真の撮影に失敗しました。', error);
  }
}

// カメラを閉じる
export async function closeCamera() {
  if (currentStream) {
    $('#camera-alert').hide();
    resetAllElementPositions();
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
    currentCameraModal = null;
  }
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
  
  const data = await response.json();

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
    // newWidth = Math.max(100, Math.min(window.innerWidth - 100, newWidth));
    // newHeight = Math.max(100, Math.min(window.innerHeight - 100, newHeight));

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

export async function initializeDraggableRect(resizableRect, lightDarkArea, preview) {
  const moveIcon = lightDarkArea.querySelector('.move-icon');
  const maskRect = lightDarkArea.querySelector('#maskRect');
  let isDragging = false;
  let startX, startY;

  // タッチイベントとマウスイベントの処理を統一するためのヘルパー関数
  function getPointerPosition(e) {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  function startDrag(e) {
    isDragging = true;
    const pos = getPointerPosition(e);
    startX = pos.x;
    startY = pos.y;
    e.preventDefault(); // テキスト選択の防止
  }

  function doDrag(e) {
    if (!isDragging) return;
    const pos = getPointerPosition(e);
    let dx = pos.x - startX;
    let dy = pos.y - startY;
    startX = pos.x;
    startY = pos.y;

    let resizableRectStyle = window.getComputedStyle(resizableRect);
    let resizableX = parseFloat(resizableRectStyle.left);
    let resizableY = parseFloat(resizableRectStyle.top);

    let maskRectTransform = maskRect.getAttribute('transform');
    let [maskX, maskY] = maskRectTransform.match(/translate\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/).slice(1, 3);

    const previewRect = preview.getBoundingClientRect();
    const maxWidth = previewRect.width;
    const maxHeight = previewRect.height;

    // 移動範囲の制限
    resizableX = Math.max(maskX * -1, Math.min(resizableX, maxWidth - (maskRect.getBoundingClientRect().width / 2 )));
    resizableY = Math.max(maskY * -1, Math.min(resizableY, maxHeight - (maskRect.getBoundingClientRect().height / 2 )));

    // 新しい位置を設定
    resizableRect.style.left = `${resizableX + dx}px`;
    resizableRect.style.top = `${resizableY + dy}px`;
    maskRect.setAttribute('x', `${resizableX + dx}px`);
    maskRect.setAttribute('y', `${resizableY + dy}px`);

    // move-icon をマウスの位置に追従させる
    moveIcon.style.left = `${resizableX + dx}px`;
    moveIcon.style.top = `${resizableY + dy}px`;
    moveIcon.style.transform = 'translate(-50%, -50%)'; // 中心をマウスに合わせる
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
  }

  // マウスイベントリスナー
  moveIcon.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', endDrag);

  // タッチイベントリスナーを追加
  moveIcon.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', doDrag);
  document.addEventListener('touchend', endDrag);
}

export async function resetAllElementPositions() {
  // 全ての mask-rect をリセット
  document.querySelectorAll('.mask-rect').forEach(maskRect => {
    maskRect.setAttribute('x', '50%');
    maskRect.setAttribute('y', '50%');
    maskRect.setAttribute('width', '280'); // 元の幅
    maskRect.setAttribute('height', '180'); // 元の高さ
    maskRect.setAttribute('transform', 'translate(-140, -90)');
  });

  // 全ての resizable-rect をリセット
  document.querySelectorAll('.resizable-rect').forEach(resizableRect => {
    resizableRect.style.width = '280px'; // 元の幅
    resizableRect.style.height = '180px'; // 元の高さ
    resizableRect.style.left = '50%';
    resizableRect.style.top = '50%';
    resizableRect.style.transform = 'translate(-50%, -50%)';
  });

  // 全ての path をリセット
  document.querySelectorAll('.resizable-rect path').forEach(path => {
    if (path.classList.contains('top-left-corner')) {
      path.setAttribute('d', 'M 2,22 Q 2,2 22,2');
    } else if (path.classList.contains('top-right-corner')) {
      path.setAttribute('d', 'M 278,22 Q 278,2 258,2');
    } else if (path.classList.contains('bottom-right-corner')) {
      path.setAttribute('d', 'M 258,178 Q 278,178 278,158');
    } else if (path.classList.contains('bottom-left-corner')) {
      path.setAttribute('d', 'M 22,178 Q 2,178 2,158');
    }
  });

  // 全ての move-icon をリセット
  document.querySelectorAll('.move-icon').forEach(moveIcon => {
    moveIcon.style.left = '50%';
    moveIcon.style.top = '50%';
    moveIcon.style.transform = 'translate(-50%, -50%)';
  });
}

