// camera.js

import { Modal } from 'bootstrap';
import { createStream, processImage, initResizableRect } from '../helpers/cameraFunctions.js';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

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
  let cameraTrack;
  const cameraModal = new Modal(cameraModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  // カメラアプリ起動処理
  cameraApp1.addEventListener('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true)
    {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) cameraModal.show();
    }
    
    stream = await createStream(cameraPreview);
    // console.log("Stream object: ", stream);
    
    cameraTrack = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(cameraTrack);

    // カメラアプリ終了処理
    closeCamera.addEventListener('click', async () => {
      cameraModal.hide();
      cameraTrack.stop();
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
    cameraModal.hide();
    cameraTrack.stop();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // カメラの実際の解像度を取得
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    if (!settings.width || !settings.height) {
      console.warn("Width and height information is not available");
    }
    const capabilities = track.getCapabilities();
    console.log("Capabilities:", capabilities);
    console.log("capabilities.width", capabilities.width);
    console.log("capabilities.height", capabilities.height);

    // 画面とカメラの解像度の比率を計算
    const ratioX = capabilities.width.max / window.innerWidth;
    const ratioY = capabilities.height.max / window.innerHeight;

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
      // BlobをObject URLに変換
      const imageUrl = URL.createObjectURL(blob);
      console.log('image:', imageUrl);
      console.log('Response:', result.text);

      const questionForm = cameraModalElement.querySelector(".question-form");
      const questionInputForm = questionForm.querySelector(".question-input-form");
      questionInputForm.value = result.text;
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
      const preview = trimmingImageModalElement.querySelector('.preview');
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    cameraModal.hide();
    cameraTrack.stop();

    const trimmingImageModal = new Modal(trimmingImageModalElement, {
      keyboard: false,
      backdrop: 'true'
    });
    trimmingImageModal.show();
  });

  // DOM取得
  const writeButton = document.querySelector('.write-button');
  const writeQuestionModalElement = document.querySelector('.writeQuestionModal');
  const writeToCameraButton = writeQuestionModalElement.querySelector(".write-to-camera");
  const writeSubmitButton = writeQuestionModalElement.querySelector(".write-submit");
  const writeQuestionModal = new Modal(writeQuestionModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  // カメラアプリ起動処理
  writeButton.addEventListener('click', async () => {
    console.log(cameraModal._isShown);
    if (cameraModal._isShown == true) 
    {
      cameraModal.hide();
      cameraTrack.stop();
      writeQuestionModal.show();
      console.log("show write modal");
    }
  });
  
  writeToCameraButton.addEventListener('click', async () => {
    if (writeQuestionModal._isShown == true) 
    {
      writeQuestionModal.hide();
      cameraModal.show();
      stream = await createStream(cameraPreview);
      
      cameraTrack = stream.getVideoTracks()[0];
      imageCapture = new ImageCapture(cameraTrack);

      closeCamera.addEventListener('click', async () => {
        cameraModal.hide();
        cameraTrack.stop();
      });
    }
  });

  writeSubmitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const questionForm = writeQuestionModalElement.querySelector(".question-form-from-write");
    console.log(questionForm);
    writeQuestionModal.hide();
    
    submitFormAndShowModal(questionForm);
  });
});


function submitFormAndShowModal(formElement) {
  // FormDataを作成
  var formData = new FormData(formElement);

  // データをサーバに送信
  fetch('/questions/get_answer', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.content);

    // 新しいモーダルの中身を設定
    var content = convertNewlines(data.content);
    var answerModalElement = document.getElementById('answerModal');
    var answerModal = new Modal(answerModalElement);
    var modalBody = answerModalElement.querySelector('.answer-modal-body');
    modalBody.innerHTML = '';

    var index = 0;
    function typeWriter() {
      if (index < content.length) {
        // <br>マーカーの検出
        if (content.substr(index, 4) === '<br>') {
          modalBody.innerHTML += '<br>';
          index += 4;
        } else {
          modalBody.innerHTML += content.charAt(index);
          index++;
        }
        setTimeout(typeWriter, 50); // 50ミリ秒ごとに文字を追加
      }
    }
    typeWriter();

    // 新しいモーダルを表示
    answerModal.show();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('エラーが発生しました。', error);
  });
}

function convertNewlines(text) {
  return text.replace(/\n/g, '<br>');
}