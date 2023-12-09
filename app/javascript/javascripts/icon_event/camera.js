// camera.js

import { Modal } from 'bootstrap';
import { createStream, processImage, initResizableRect } from '../helpers/cameraFunctions.js';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

document.addEventListener("turbolinks:load", function() {
  // DOM取得
  const cameraApp1 = document.getElementById('cameraApp1');
  const cameraModalElement = document.getElementById('cameraModal');
  const cameraPreview = document.getElementById("cameraPreview");
  const maskRect = document.getElementById("maskRect");
  const captureButton = document.getElementById("captureButton");
  const closeCamera = document.getElementById("closeCamera");
  const trimmingImageModalElement = document.querySelector(".trimming-image-modal");
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
    const preview = element.querySelector('.preview');

    initResizableRect(resizableRects, lightDarkAreas, preview);
  });

  // 撮影ボタンクリック時の処理
  captureButton.addEventListener("click", async () => {
    const photo = await imageCapture.takePhoto();
    const imageBitmap = await createImageBitmap(photo);
    
    // 元の画像をプレビューに表示
    const originalImageUrl = URL.createObjectURL(photo);
    console.log(originalImageUrl);
    // preview.src = originalImageUrl;
    // カメラアプリ終了処理
    cameraModal.hide();
    cameraTrack.stop();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const maskRect = cameraModalElement.querySelector('.mask-rect');
    const svgRect = maskRect.getBoundingClientRect();

    // プレビューと実際の写真のアスペクト比を比較
    const previewAspectRatio = cameraPreview.offsetWidth / cameraPreview.offsetHeight;
    const imageAspectRatio = imageBitmap.width / imageBitmap.height;

    // 実際の画像の表示領域を計算
    let displayWidth, displayHeight, offsetX, offsetY;
    if (previewAspectRatio > imageAspectRatio) {
        displayHeight = cameraPreview.offsetHeight;
        displayWidth = displayHeight * imageAspectRatio;
        offsetX = (cameraPreview.offsetWidth - displayWidth) / 2;
        offsetY = 0;
    } else {
        displayWidth = cameraPreview.offsetWidth;
        displayHeight = displayWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (cameraPreview.offsetHeight - displayHeight) / 2;
    }

    // プレビュー上のmaskRectの相対位置を再計算
    const adjustedX = (svgRect.left - cameraPreview.offsetLeft - offsetX) * (imageBitmap.width / displayWidth);
    const adjustedY = (svgRect.top - cameraPreview.offsetTop - offsetY) * (imageBitmap.height / displayHeight);
    const adjustedWidth = svgRect.width * (imageBitmap.width / displayWidth);
    const adjustedHeight = svgRect.height * (imageBitmap.height / displayHeight);

    // CanvasのサイズをmaskRectのサイズに合わせる
    canvas.width = svgRect.width;
    canvas.height = svgRect.height;

    // imageBitmapから調整したmaskRectの範囲だけを切り出して描画
    ctx.drawImage(imageBitmap, adjustedX, adjustedY, adjustedWidth, adjustedHeight, 0, 0, svgRect.width, svgRect.height);

    console.log("imageBitmap.offsetWidth", imageBitmap.offsetWidth);
    console.log("imageBitmap.offsetHeight", imageBitmap.offsetHeight);
    console.log("imageBitmap.naturalWidth", imageBitmap.naturalWidth);
    console.log("imageBitmap.naturalHeight", imageBitmap.naturalHeight);
    console.log("imageBitmap.width", imageBitmap.width);
    console.log("imageBitmap.height", imageBitmap.height);
    console.log("cameraPreview.offsetWidth", cameraPreview.offsetWidth);
    console.log("cameraPreview.offsetHeight", cameraPreview.offsetHeight);
    console.log("cameraPreview.naturalWidth", cameraPreview.naturalWidth);
    console.log("cameraPreview.naturalHeight", cameraPreview.naturalHeight);
    console.log("cameraPreview.width", cameraPreview.width);
    console.log("cameraPreview.height", cameraPreview.height);
    console.log("imageAspectRatio", imageAspectRatio);
    console.log("previewAspectRatio", previewAspectRatio);
    console.log("adjustedX", adjustedX);
    console.log("adjustedY", adjustedY);
    console.log("adjustedWidth", adjustedWidth);
    console.log("adjustedHeight", adjustedHeight);

    canvas.toBlob(async (blob) => {
      // const result = await processImage(blob);
      // BlobをObject URLに変換
      const imageUrl = URL.createObjectURL(blob);
      console.log('image:', imageUrl);
      // console.log('Response:', result.text);

      // const questionForm = cameraModalElement.querySelector(".question-form");
      // const questionInputForm = questionForm.querySelector(".question-input-form");
      // questionInputForm.value = result.text;
      // submitFormAndShowModal(questionForm);
    }, 'image/png');
  });



  // 画像選択ボタンがクリック時の処理
  const imageInputButtonFromCamera = document.querySelector('.image-input-button-from-camera');
  const inputButton = imageInputButtonFromCamera.querySelector('.image-input');
  const writeOutImageButton = trimmingImageModalElement.querySelector('.write-out-image');
  let originalImageFile = null;
  const trimmingImageModal = new Modal(trimmingImageModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  imageInputButtonFromCamera.addEventListener('click', function () {
    inputButton.click();
    return false;
  });
  // グローバル変数としてオリジナルの画像ファイルを保持

  // 画像が選択されたらプレビューに表示
  inputButton.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = trimmingImageModalElement.querySelector('.preview');
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      cameraModal.hide();
      cameraTrack.stop();


      setBackButtonListener(async () => {
        // ここに戻るボタンが押されたときの処理を記述
        if (trimmingImageModal._isShown == true) {
          const preview = trimmingImageModalElement.querySelector('.preview');
          preview.src = '';
          trimmingImageModal.hide();

          inputButton.value = '';
          
          cameraModal.show();
          stream = await createStream(cameraPreview);
          
          cameraTrack = stream.getVideoTracks()[0];
          imageCapture = new ImageCapture(cameraTrack);
          
          closeCamera.addEventListener('click', async () => {
            cameraModal.hide();
            cameraTrack.stop();
          });
        }
      }, trimmingImageModalElement, '.return-from-trimming');

      trimmingImageModal.show();
    }
  });

  // "読み込む"ボタンのクリックイベント
  writeOutImageButton.addEventListener('click', function() {
    const maskRect = trimmingImageModalElement.querySelector('.mask-rect');
    const preview = trimmingImageModalElement.querySelector('.preview');

    // canvas要素を作成
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // プレビュー画像とコンテナのアスペクト比を計算
    const imageAspectRatio = preview.naturalWidth / preview.naturalHeight;
    const containerAspectRatio = preview.offsetWidth / preview.offsetHeight;
  
    // 実際の表示サイズとコンテナ内でのオフセットを計算
    let renderWidth, renderHeight, offsetX, offsetY;
    if (containerAspectRatio > imageAspectRatio) {
      // コンテナの幅が画像の幅よりも広い場合
      renderHeight = preview.offsetHeight;
      renderWidth = imageAspectRatio * renderHeight;
      offsetX = (preview.offsetWidth - renderWidth) / 2;
      offsetY = 0;
    } else {
      // コンテナの高さが画像の高さよりも高い場合
      renderWidth = preview.offsetWidth;
      renderHeight = renderWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (preview.offsetHeight - renderHeight) / 2;
    }
  
    // SVG内でのmaskRectの位置とサイズを取得
    const svgRect = maskRect.getBoundingClientRect();
  
    // 実際の座標を計算
    const x = (svgRect.left - preview.offsetLeft - offsetX) * (preview.naturalWidth / renderWidth);
    const y = (svgRect.top - preview.offsetTop - offsetY) * (preview.naturalHeight / renderHeight);
    const width = svgRect.width * (preview.naturalWidth / renderWidth);
    const height = svgRect.height * (preview.naturalHeight / renderHeight);
  
    // canvasのサイズをmaskRectのサイズに合わせる
    canvas.width = svgRect.width;
    canvas.height = svgRect.height;

    // 画像をロードして切り取り範囲を描画
    const image = new Image();
    image.src = preview.src;

    // 画像をトリミングして処理する部分
    image.onload = function() {
      // 切り取り範囲をキャンバスに描画
      ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

      // canvasからblobを生成してOCR処理
      canvas.toBlob(async (blob) => {
        const result = await processImage(blob);
        const imageUrl = URL.createObjectURL(blob);
        console.log('image:', imageUrl);
        if (result && result.text) {
          const result = await processImage(blob);
          // BlobをObject URLに変換
          const imageUrl = URL.createObjectURL(blob);
          console.log('image:', imageUrl);
          console.log('Response:', result.text);

          const questionForm = cameraModalElement.querySelector(".question-form");
          const questionInputForm = questionForm.querySelector(".question-input-form");
          questionInputForm.value = result.text;
          submitFormAndShowModal(questionForm);
          trimmingImageModal.hide();
        }
      }, 'image/png');
    };
  });

  // 入力画面
  // DOM取得
  const writeButton = document.querySelector('.write-button');
  const writeQuestionModalElement = document.querySelector('.write-question-modal');
  const returnCameraFromWrite = writeQuestionModalElement.querySelector(".return-camera-from-write");
  const cameraCircle = writeQuestionModalElement.querySelector('.camera-circle');
  const imageCircle = writeQuestionModalElement.querySelector('.image-circle');
  const writeSubmitButton = writeQuestionModalElement.querySelector(".write-submit");
  const writeQuestionModal = new Modal(writeQuestionModalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  const simpleCameraModalElement = document.querySelector('.simple-camera-modal');
  const simpleCameraPreview = simpleCameraModalElement.querySelector(".preview");
  const simpleCameraCaptureButton = simpleCameraModalElement.querySelector('.capture-button');
  const simpleCameraModal = new Modal(simpleCameraModalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  let simpleCameraImageCapture;
  let simpleCameraStream;
  let simpleCameraTrack;

  // 入力画面起動
  writeButton.addEventListener('click', async () => {
    cameraModal.hide();
    cameraTrack.stop();
    writeQuestionModal.show();
    console.log("show write modal");
  });
  
  returnCameraFromWrite.addEventListener('click', async () => {
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

  cameraCircle.addEventListener('click', async () => {
    writeQuestionModal.hide();
    simpleCameraModal.show();
    simpleCameraStream = await createStream(simpleCameraPreview);    
    simpleCameraTrack = simpleCameraStream.getVideoTracks()[0];
    simpleCameraImageCapture = new ImageCapture(simpleCameraTrack);

    setBackButtonListener(async () => {
      // ここに戻るボタンが押されたときの処理を記述
      if (simpleCameraModal._isShown == true) {
        simpleCameraModal.hide();
        simpleCameraTrack.stop();
        writeQuestionModal.show();
      }
    }, simpleCameraModalElement, '.return-button');
  });

  const resizableRects = simpleCameraModalElement.querySelector('.resizable-rect');
  const lightDarkAreas = simpleCameraModalElement.querySelector('.light-dark-area');
  const maskRectWrite = simpleCameraModalElement.querySelector(".mask-rect");
  const writeQuery = writeQuestionModalElement.querySelector(".question-input-form")
  
  initResizableRect(resizableRects, lightDarkAreas, simpleCameraPreview);
  
  // 撮影ボタンクリック時の処理
  simpleCameraCaptureButton.addEventListener("click", async () => {
    const photo = await simpleCameraImageCapture.takePhoto();
    const imageBitmap = await createImageBitmap(photo);
    
    // 元の画像をプレビューに表示
    const originalImageUrl = URL.createObjectURL(photo);
    console.log(originalImageUrl);
    // preview.src = originalImageUrl;
    // カメラアプリ終了処理
    simpleCameraModal.hide();
    simpleCameraTrack.stop();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgRect = maskRect.getBoundingClientRect();
    
    // プレビューと実際の写真のアスペクト比を比較
    const previewAspectRatio = simpleCameraPreview.offsetWidth / simpleCameraPreview.offsetHeight;
    const imageAspectRatio = imageBitmap.width / imageBitmap.height;

    // 実際の画像の表示領域を計算
    let displayWidth, displayHeight, offsetX, offsetY;
    if (previewAspectRatio > imageAspectRatio) {
        displayHeight = simpleCameraPreview.offsetHeight;
        displayWidth = displayHeight * imageAspectRatio;
        offsetX = (simpleCameraPreview.offsetWidth - displayWidth) / 2;
        offsetY = 0;
    } else {
        displayWidth = simpleCameraPreview.offsetWidth;
        displayHeight = displayWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (simpleCameraPreview.offsetHeight - displayHeight) / 2;
    }

    // プレビュー上のmaskRectの相対位置を再計算
    const adjustedX = (svgRect.left - simpleCameraPreview.offsetLeft - offsetX) * (imageBitmap.width / displayWidth);
    const adjustedY = (svgRect.top - simpleCameraPreview.offsetTop - offsetY) * (imageBitmap.height / displayHeight);
    const adjustedWidth = svgRect.width * (imageBitmap.width / displayWidth);
    const adjustedHeight = svgRect.height * (imageBitmap.height / displayHeight);

    // CanvasのサイズをmaskRectのサイズに合わせる
    canvas.width = svgRect.width;
    canvas.height = svgRect.height;

    // imageBitmapから調整したmaskRectの範囲だけを切り出して描画
    ctx.drawImage(imageBitmap, adjustedX, adjustedY, adjustedWidth, adjustedHeight, 0, 0, svgRect.width, svgRect.height);
    
    canvas.toBlob(async (blob) => {
      console.log("blob", blob);
      // const result = await processImage(blob);
      const imageUrl = URL.createObjectURL(blob);
      console.log('image:', imageUrl);
      // writeQuery.value = result.text;
      // // 新しい 'input' イベントを作成
      // const event = new Event('input', {
      //   bubbles: true, // イベントをバブリングさせる
      //   cancelable: true, // イベントをキャンセル可能にする
      // });

      // // テキストエリア要素でイベントを発火
      // writeQuery.dispatchEvent(event);
    }, 'image/png');
  });

  writeSubmitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (writeQuery.value !== ''){
      const questionForm = writeQuestionModalElement.querySelector(".question-form-from-write");
      console.log(questionForm);
      writeQuestionModal.hide();
      
      submitFormAndShowModal(questionForm);
    }
  });

  const writeImageInputButton = writeQuestionModalElement.querySelector('.image-input-write');
  // 入力画面から画像を選択しトリミング画面を開く
  const imagePreview = trimmingImageModalElement.querySelector('.preview');
  const resizableRectsTrim = trimmingImageModalElement.querySelector('.resizable-rect');
  const lightDarkAreasTrim = trimmingImageModalElement.querySelector('.light-dark-area');

  imageCircle.addEventListener('click', function () {
    writeImageInputButton.click();
    return false;
  });
  
  writeImageInputButton.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      writeQuestionModal.hide();
      trimmingImageModal.show();
      initResizableRect(resizableRectsTrim, lightDarkAreasTrim, imagePreview);

      setBackButtonListener(async () => {
        // ここに戻るボタンが押されたときの処理を記述
        if (trimmingImageModal._isShown == true) {
          const preview = trimmingImageModalElement.querySelector('.preview');
          preview.src = '';
          writeImageInputButton.value = '';
          trimmingImageModal.hide();
          writeQuestionModal.show();
        }
      }, trimmingImageModalElement, '.return-from-trimming');
    }
  });

  // "読み込む"ボタンのクリックイベント
  trimmingImageModalElement.querySelector('.write-out-image').addEventListener('click', function() {
    const previewImage = trimmingImageModalElement.querySelector('.preview');
    const maskRect = trimmingImageModalElement.querySelector('.mask-rect');
  
    // canvas要素を作成
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // プレビュー画像とコンテナのアスペクト比を計算
    const imageAspectRatio = imagePreview.naturalWidth / imagePreview.naturalHeight;
    const containerAspectRatio = imagePreview.offsetWidth / imagePreview.offsetHeight;
  
    // 実際の表示サイズとコンテナ内でのオフセットを計算
    let renderWidth, renderHeight, offsetX, offsetY;
    if (containerAspectRatio > imageAspectRatio) {
      // コンテナの幅が画像の幅よりも広い場合
      renderHeight = imagePreview.offsetHeight;
      renderWidth = imageAspectRatio * renderHeight;
      offsetX = (imagePreview.offsetWidth - renderWidth) / 2;
      offsetY = 0;
    } else {
      // コンテナの高さが画像の高さよりも高い場合
      renderWidth = imagePreview.offsetWidth;
      renderHeight = renderWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (imagePreview.offsetHeight - renderHeight) / 2;
    }
  
    // SVG内でのmaskRectの位置とサイズを取得
    const svgRect = maskRect.getBoundingClientRect();
  
    // 実際の座標を計算
    const x = (svgRect.left - imagePreview.offsetLeft - offsetX) * (imagePreview.naturalWidth / renderWidth);
    const y = (svgRect.top - imagePreview.offsetTop - offsetY) * (imagePreview.naturalHeight / renderHeight);
    const width = svgRect.width * (imagePreview.naturalWidth / renderWidth);
    const height = svgRect.height * (imagePreview.naturalHeight / renderHeight);
  
    // canvasのサイズをmaskRectのサイズに合わせる
    canvas.width = svgRect.width;
    canvas.height = svgRect.height;
  
    // 画像をロードして切り取り範囲を描画
    const image = new Image();
    image.src = imagePreview.src;

    // 画像をトリミングして処理する部分
    image.onload = async function() {
      // 切り取り範囲をキャンバスに描画
      ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

      // canvasからblobを生成
      canvas.toBlob(async (blob) => {
        // processImage関数でOCR処理
        // const result = await processImage(blob);
        const imageUrl = URL.createObjectURL(blob);
        console.log('image:', imageUrl);
        // if (result && result.text) {
        //   writeQuery.value = result.text;

        //   // 新しい 'input' イベントを作成して発火
        //   const event = new Event('input', {
        //     bubbles: true,
        //     cancelable: true,
        //   });
        //   writeQuery.dispatchEvent(event);
        //   trimmingImageModal.hide();
        // }
      }, 'image/png');
    };
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

function setBackButtonListener(listener, element, buttonSelector) {
  var returnButton = element.querySelector(buttonSelector);

  // 以前のイベントリスナーを削除
  returnButton.replaceWith(returnButton.cloneNode(true));

  // 新しいイベントリスナーを追加
  returnButton = element.querySelector(buttonSelector);
  returnButton.addEventListener('click', listener);
}
