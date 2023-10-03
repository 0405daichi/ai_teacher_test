// camera.js

import { Modal } from 'bootstrap';
import { createStream, processImage, initResizableRect } from '../helpers/cameraFunctions.js';

document.addEventListener("turbolinks:load", function() {
  // DOM取得
  const cameraApp1 = document.getElementById('cameraApp1');
  const cameraModalElement = document.getElementById('cameraModal');
  const cameraPreview = document.getElementById("cameraPreview");
  const preview = document.getElementById("preview");
  const maskRect = document.getElementById("maskRect");
  const captureButton = document.getElementById("captureButton");
  const closeCamera = document.getElementById("closeCamera");
  const imageInputButtonFromCamera = document.getElementById('imageInputButtonFromCamera');
  const inputButton = document.getElementById('imageInput');
  const trimmingImageModalElement = document.getElementById("trimmingImageModal");
  let imageCapture;
  let stream;
  let track
  const cameraModal = new Modal(cameraModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  // カメラアプリ起動処理
  cameraApp1.addEventListener('click', async () => {
    cameraModal.show();
    
    stream = await createStream(cameraPreview);
    // console.log("Stream object: ", stream);
    
    track = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);

    // カメラアプリ終了処理
    closeCamera.addEventListener('click', async () => {
      cameraModal.hide();
      track.stop();
    });
  });

  // 撮影範囲設定path
  const place = [];
  place.push(cameraModalElement, trimmingImageModalElement);
  place.forEach(element => {
    const resizableRects = element.querySelector('.resizable-rect');
    const lightDarkAreas = element.querySelector('.light-dark-area');

    initResizableRect(resizableRects, lightDarkAreas);
  });

  // 撮影ボタンクリック時の処理
  captureButton.addEventListener("click", async () => {
    const photo = await imageCapture.takePhoto();
    const imageBitmap = await createImageBitmap(photo);
    
    // 元の画像をプレビューに表示
    const originalImageUrl = URL.createObjectURL(photo);
    // preview.src = originalImageUrl;
    // カメラアプリ終了処理
    closeCamera.addEventListener('click', async () => {
      cameraModal.hide();
      track.stop();
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // カメラの実際の解像度を取得
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();

    // 画面とカメラの解像度の比率を計算
    const ratioX = settings.width / window.innerWidth;
    const ratioY = settings.height / window.innerHeight;

    // maskRectの位置とサイズを取得（SVG内の座標系で）
    const svgRect = maskRect.getBoundingClientRect();  

    // 実際の座標を計算（解像度の比率を考慮）
    const x = svgRect.x * ratioX;
    const y = svgRect.y * ratioY;
    const width = svgRect.width * ratioX;
    const height = svgRect.height * ratioY;

    // canvasのサイズをmaskRectのサイズに合わせる（解像度の比率を考慮）
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // imageBitmapからmaskRectの範囲だけを切り出して描画
    ctx.drawImage(imageBitmap, x, y, width, height, svgRect.x, svgRect.y, svgRect.width, svgRect.height);

    canvas.toBlob(async (blob) => {
      const result = await processImage(blob);
      // console.log('Response:', result);

      const questionInputForm = document.getElementById("questionInputForm");
      questionInputForm.value = result.text;
      const questionForm = document.getElementById("questionForm");
      submitFormAndShowModal(questionForm);
    }, 'image/png');
  });

  // 画像選択ボタンがクリック時の処理
  // ボタンがクリックされたら、隠れたinputタグをクリックさせる
  // imageInputButtonFromCamera.addEventListener('click', function () {
  //   inputButton.click();
  // });

  // 画像が選択されたらプレビューに表示
  inputButton.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('preview');
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    cameraModal.hide();
    track.stop();

    const trimmingImageModal = new Modal(trimmingImageModalElement, {
      keyboard: false,
      backdrop: 'true'
    });
    trimmingImageModal.show();
  });
});


function submitFormAndShowModal(formElement) {
  // デフォルトの送信プロセスをキャンセル
  formElement.addEventListener('submit', function(e) {
    e.preventDefault();

    // FormDataを作成
    var formData = new FormData(formElement);

    // データをサーバに送信
    fetch('/questions/get_answer', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // 既存のモーダルを閉じる
      var questionModal = new Modal(document.getElementById('questionModal'));
      questionModal.hide();
      var questionModalButton = document.getElementById('questionModalButton');
      questionModalButton.style.display = "block";

      // 新しいモーダルの中身を設定
      var content = data.content;
      var modalBody = document.getElementById('answerModalBody');
      modalBody.innerHTML = '';

      var index = 0;
      function typeWriter() {
        if (index < content.length) {
          modalBody.innerHTML += content.charAt(index);
          index++;
          setTimeout(typeWriter, 50); // 50ミリ秒ごとに文字を追加
        }
      }
      typeWriter();

      // 新しいモーダルを表示
      var answerModalElement = document.getElementById('answerModal');
      var answerModal = new Modal(answerModalElement);
      answerModal.show();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('エラーが発生しました。');
    });
  });
}
