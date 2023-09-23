// cameraFunctions.js

export async function createStream(cameraPreview) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment', // 外部カメラの使用
      width: 1280,
      height: 720
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
  });

  const data = await response.json();
  return data;
}
