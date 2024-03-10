// camera.js

import { Modal } from 'bootstrap';
import { openCamera, takePhoto, closeCamera, processImage, initResizableRect } from '../helpers/cameraFunctions.js';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';
import { handleOption, resetFormToDefault } from '../helpers/optionHandleFunction.js';
import { submitFormAndShowModal } from '../helpers/formSubmitFunction.js';
// ライブラリをインポート
import marked from 'marked';

document.addEventListener("turbolinks:load", function() {
  if ($('#svg-camera').length === 0) return;
  //////////
  // カメラモーダル
  //////////
  const cameraModal = $('#cameraModal')[0];
  // オプションハンドル
  handleOption(cameraModal);
  resetFormToDefault(cameraModal);
  $('#cameraModal .close-camera-modal').on('click', function () {
    resetFormToDefault(cameraModal);
  });
  handleNoImageButtonClick(cameraModal, ".question-form-from-camera", '#cameraModal');

  // カメラアプリ起動処理
  $('#svg-camera').on('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true) {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) {
        if (window.innerWidth <= 768) {
          // スマートフォンやタブレットで見られている可能性が高い
          $('#cameraModal').modal('show');
          setupPanelToggleAndValidation();
          setTimeout(() => {
            openCamera($('#cameraModal')[0], $("#cameraModal .preview")[0]);
          }, 500); // 500ミリ秒の遅延
        } else {
          // PCで見られている可能性が高い
          $('.camera-modal-pc').modal('show');
        }
      }
    }

    $('#cameraModal .close-camera-modal').click(async function() {
      console.log("Camera click");
      $('#cameraModal').modal('hide');
      closeCamera();
    });
  });

  // 撮影範囲設定path
  const places = ['#cameraModal', '.trimming-image-modal', '.simple-camera-modal'];
  $.each(places, function(index, element) {
    const resizableRects = $(element).find('.resizable-rect');
    const lightDarkAreas = $(element).find('.light-dark-area');
    const preview = $(element).find('.preview');

    initResizableRect(resizableRects[0], lightDarkAreas[0], preview[0]);
  });

  $("#captureButton").click(async function() {
    const imageBitmap = await takePhoto();
    console.log(`imageBitmap${imageBitmap}`)
    
    $('#cameraModal').modal('hide');
    closeCamera();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const maskRect = $('#cameraModal .mask-rect')[0]; // jQueryで要素を選択し、DOM要素にアクセス
    const svgRect = maskRect.getBoundingClientRect();
    const preview = $("#cameraPreview");

    let scale, offsetX, offsetY;
    if (imageBitmap.width / imageBitmap.height > preview.outerWidth() / preview.outerHeight()) {
      scale = imageBitmap.height / preview.outerHeight();
      offsetX = (preview.outerWidth() - (imageBitmap.width / scale)) / 2;
      offsetY = 0;
    } else {
      scale = imageBitmap.width / preview.outerWidth();
      offsetX = 0;
      offsetY = (preview.outerHeight() - (imageBitmap.height / scale)) / 2;
    }

    const realX = (svgRect.left - preview.offset().left - offsetX) * scale;
    const realY = (svgRect.top - preview.offset().top - offsetY) * scale;
    const realWidth = svgRect.width * scale;
    const realHeight = svgRect.height * scale;

    canvas.width = realWidth; // 元の画像の解像度に合わせたサイズ
    canvas.height = realHeight;

    // 実際の切り取り領域をCanvasに描画
    ctx.drawImage(imageBitmap, realX, realY, realWidth, realHeight, 0, 0, realWidth, realHeight);

    canvas.toBlob(async (blob) => {
      console.log(blob)
      // const result = await processImage(blob);
      const imageUrl = URL.createObjectURL(blob);
      console.log('image:', imageUrl);
      // console.log('Response:', result.text);

      // const questionForm = $(".question-form-from-camera")[0]; // jQueryで要素を選択し、DOM要素にアクセス
      // const questionInputForm = $(questionForm).find(".question-input-form")[0];
      // questionInputForm.value = result.text;

      // const imageInput = $(questionForm).find('.hidden-question-image')[0];

      // const dataTransfer = new DataTransfer();
      // dataTransfer.items.add(new File([blob], "image.png", { type: "image/png" }));
      // imageInput.files = dataTransfer.files;
      // submitFormAndShowModal(questionForm, result.text);
    }, 'image/png');
  });

  //////////
  // カメラモーダルからの画像選択
  //////////
  $('.image-input-button-from-camera').on('click', function (e) {
    $('.image-input-button-from-camera .image-input')[0].click();
    e.stopPropagation();
  });

  // PC用
  $('.image-input-button-from-camera-pc').on('click', function (e) {
    $('.image-input-button-from-camera .image-input')[0].click();
    e.stopPropagation();
  });

  // 画像が選択されたらプレビューに表示
  $('.image-input-button-from-camera .image-input').on('change', function(e) {
    const cameraModal = $('#cameraModal');
    const trimmingImageModal = $('.trimming-image-modal');
    const preview = $('.trimming-image-modal .preview');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.attr('src', e.target.result);
      };
      reader.readAsDataURL(file);

      if (window.innerWidth <= 768) {
        cameraModal.modal('hide');
        closeCamera();
      } else {
        $('.camera-modal-pc').modal('hide');
      }


      setBackButtonListener(async () => {
        // ここに戻るボタンが押されたときの処理を記述
        if (trimmingImageModal.hasClass('show')) {
          $('.image-input-button-from-camera .image-input').val('');
          preview.attr('src', '');
          trimmingImageModal.modal('hide');
          cameraModal.modal('show');
          setTimeout(() => {
            openCamera(cameraModal[0], $('#cameraModal .preview')[0]);
          }, 500); // 500ミリ秒の遅延
          
          $('#cameraModal .close-camera-modal').click(async function() {
            cameraModal.modal('hide');
            closeCamera();
          });
        }
      }, trimmingImageModal[0], '.return-from-trimming');

      setWriteOutButtonListener(async () => {
        const preview = $('.trimming-image-modal .preview');
        const maskRect = $('.trimming-image-modal .mask-rect')[0];
        const svgRect = maskRect.getBoundingClientRect();
        
        // canvas要素を作成
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');
        
        // プレビュー画像とコンテナのアスペクト比を計算
        const imageAspectRatio = preview[0].naturalWidth / preview[0].naturalHeight;
        const containerAspectRatio = preview.outerWidth() / preview.outerHeight();
        
        // 実際の表示サイズとコンテナ内でのオフセットを計算
        let renderWidth, renderHeight, offsetX, offsetY;
        if (containerAspectRatio > imageAspectRatio) {
          // コンテナの幅が画像の幅よりも広い場合
          renderHeight = preview.outerHeight();
          renderWidth = imageAspectRatio * renderHeight;
          offsetX = (preview.outerWidth() - renderWidth) / 2;
          offsetY = 0;
        } else {
          // コンテナの高さが画像の高さよりも高い場合
          renderWidth = preview.outerWidth();
          renderHeight = renderWidth / imageAspectRatio;
          offsetX = 0;
          offsetY = (preview.outerHeight() - renderHeight) / 2;
        }
        
        // 実際の座標を計算
        const realX = (svgRect.left - preview.offset().left - offsetX) * (preview[0].naturalWidth / renderWidth);
        const realY = (svgRect.top - preview.offset().top - offsetY) * (preview[0].naturalHeight / renderHeight);
        const realWidth = svgRect.width * (preview[0].naturalWidth / renderWidth);
        const realHeight = svgRect.height * (preview[0].naturalHeight / renderHeight);

        canvas.width = realWidth; // 元の画像の解像度に合わせたサイズ
        canvas.height = realHeight;
        
        // 画像をロードして切り取り範囲を描画
        const image = new Image();
        image.src = preview.attr('src');

        image.onload = function() {
          // 切り取り範囲をキャンバスに描画
          // ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
          // 実際の切り取り領域をCanvasに描画
          ctx.drawImage(image, realX, realY, realWidth, realHeight, 0, 0, realWidth, realHeight);
          
          // canvasからblobを生成してOCR処理（この部分は省略された処理に対する例示です）
          canvas.toBlob(async (blob) => {
            const imageUrl = URL.createObjectURL(blob);
            console.log('image:', imageUrl);
            // const result = await processImage(blob);
            // if (result && result.text) {
            //   $(".question-form-from-camera").find(".question-input-form").val(result.text);

            //   const dataTransfer = new DataTransfer();
            //   dataTransfer.items.add(new File([blob], "image.png", { type: "image/png" }));
            //   $(".question-form-from-camera").find('.hidden-question-image')[0].files = dataTransfer.files;
            //   submitFormAndShowModal($(".question-form-from-camera")[0], result.text);
            //   $('#trimmingImageModal').modal('hide');
            // }
          }, 'image/png');
        };
      }, trimmingImageModal[0], '.write-out-image');

      $('#trimmingImageModal').modal('show');
    }
  });

  //////////
  // 質問入力モーダル
  //////////
  const writeQuestionModal = $('.write-question-modal')[0];
  // オプションハンドル
  handleOption(writeQuestionModal);
  resetFormToDefault(writeQuestionModal);
  $(".write-question-modal #closeWrite").on('click', () => {
    resetFormToDefault(writeQuestionModal);
  });
  handleNoImageButtonClick(writeQuestionModal, ".question-form-from-write", '.write-question-modal');

  // 入力画面起動
  $('.write-button').on('click', async () => {
    $('#cameraModal').modal('hide');
    closeCamera();
    $('.write-question-modal').modal('show');
  });

  // 入力画面起動（PC用）
  $('.write-button-pc').on('click', async () => {
    $('.camera-modal-pc').modal('hide');
    $('.write-question-modal').modal('show');
    $('.write-question-modal .camera-circle').hide();
  });
  
  $('.return-camera-from-write').on('click', async () => {
    const writeQuestionModal = $('.write-question-modal');
    if (writeQuestionModal.hasClass('show')) {
      writeQuestionModal.modal('hide');
      // PC用と場合分け
      if (window.innerWidth <= 768) {
        $('#cameraModal').modal('show');

        // カメラを開く前に少し待つ
        setTimeout(() => {
          openCamera($('#cameraModal')[0], $("#cameraModal .preview")[0]);
        }, 500); // 500ミリ秒の遅延
      } else {
        $('.camera-modal-pc').modal('show');
      }
      resetFormToDefault(writeQuestionModal[0]);
    }
  });

  $('.write-question-modal .camera-circle').on('click', async () => {
    console.log("camera")
    const writeQuestionModal = $('.write-question-modal').eq(0);
    const simpleCameraModal = $('.simple-camera-modal');
    const preview = $(".simple-camera-modal .preview");
    console.log(preview);
    writeQuestionModal.modal('hide');
    simpleCameraModal.modal('show');  
    setTimeout(() => {
      openCamera(simpleCameraModal[0], preview[0]);
    }, 500); // 500ミリ秒の遅延

    setBackButtonListener(async () => {
      // ここに戻るボタンが押されたときの処理を記述
      if (simpleCameraModal.hasClass('show')) {
        simpleCameraModal.modal('hide');
        closeCamera();
        writeQuestionModal.modal('show');
      }
    }, simpleCameraModal[0], '.return-button');

    setCaptureButtonListener(async () => {
      // 撮影ボタンが押されたときの処理を記述
      const imageBitmap = await takePhoto();

      simpleCameraModal.modal('hide');
      closeCamera();

      const maskRect = $('.simple-camera-modal .mask-rect')[0];
      const svgRect = maskRect.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      let scale, offsetX, offsetY;
      // プレビュー画面と実際の画像のアスペクト比を比較し、どちらの辺が基準になるか決定
      if (imageBitmap.width / imageBitmap.height > preview.outerWidth() / preview.outerHeight()) {
        // 画像は高さを基準にプレビュー領域を覆う
        scale = imageBitmap.height / preview.outerHeight();
        offsetX = (preview.outerWidth() - (imageBitmap.width / scale)) / 2;
        offsetY = 0;
      } else {
        // 画像は幅を基準にプレビュー領域を覆う
        scale = imageBitmap.width / preview.outerWidth();
        offsetX = 0;
        offsetY = (preview.outerHeight() - (imageBitmap.height / scale)) / 2;
      }

      // プレビュー上のmaskRectの実際の画像上での相対位置を計算
      const realX = (svgRect.left - preview.offset().left - offsetX) * scale;
      const realY = (svgRect.top - preview.offset().top - offsetY) * scale;
      const realWidth = svgRect.width * scale;
      const realHeight = svgRect.height * scale;

      // CanvasのサイズをmaskRectのサイズに合わせる
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;

      ctx.drawImage(imageBitmap, realX, realY, realWidth, realHeight, 0, 0, realWidth, realHeight);
      
      canvas.toBlob(async (blob) => {
        console.log("blob", blob);
        const result = await processImage(blob);
        const imageUrl = URL.createObjectURL(blob);
        console.log('image:', imageUrl);
        $('.write-question-modal .question-input-form').val(result.text);

        // // 新しい 'input' イベントを作成
        const event = new Event('input', {
          bubbles: true, // イベントをバブリングさせる
          cancelable: true, // イベントをキャンセル可能にする
        });

        // // テキストエリア要素でイベントを発火
        $('.write-question-modal .question-input-form')[0].dispatchEvent(event);
      }, 'image/png');
    }, simpleCameraModal[0], '.capture-button');
  });

  $('.write-question-modal .write-submit').on('click', async (event) => {
    event.preventDefault();
    if ($('.write-question-modal .question-input-form').val() !== ''){
      $('.write-question-modal').modal('hide');
      
      submitFormAndShowModal($('.write-question-modal .question-form-from-write')[0], $('.write-question-modal .question-input-form').value);
    }
  });

  $('.write-question-modal .image-circle').on('click', function (e) {
    console.log("Click");
    $('.write-question-modal .image-input-write')[0].click();
    e.stopPropagation();
  });
  
  $('.write-question-modal .image-input-write').on('change', function(e) {
    const writeQuestionModal = $('.write-question-modal').eq(0);
    const trimmingImageModal = $('.trimming-image-modal');
    const preview = $('.trimming-image-modal .preview');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.attr('src', e.target.result);
      };
      reader.readAsDataURL(file);
      
      writeQuestionModal.modal('hide');
      trimmingImageModal.modal('show');

      setBackButtonListener(async () => {
        // ここに戻るボタンが押されたときの処理を記述
        if (trimmingImageModal.hasClass('show')) {
          $('.write-question-modal .image-input-write').val('');
          preview.attr('src', '');
          trimmingImageModal.modal('hide');
          writeQuestionModal.modal('show');
        }
      }, trimmingImageModal[0], '.return-from-trimming');
      
      setWriteOutButtonListener(async () => {
        const maskRect = $('.trimming-image-modal .mask-rect')[0];
        const svgRect = maskRect.getBoundingClientRect();
      
        // canvas要素を作成
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
      
        // プレビュー画像とコンテナのアスペクト比を計算
        const imageAspectRatio = preview[0].naturalWidth / preview[0].naturalHeight;
        const containerAspectRatio = preview.outerWidth() / preview.outerHeight();
      
        // 実際の表示サイズとコンテナ内でのオフセットを計算
        let renderWidth, renderHeight, offsetX, offsetY;
        if (containerAspectRatio > imageAspectRatio) {
          // コンテナの幅が画像の幅よりも広い場合
          renderHeight = preview.outerHeight();
          renderWidth = imageAspectRatio * renderHeight;
          offsetX = (preview.outerWidth() - renderWidth) / 2;
          offsetY = 0;
        } else {
          // コンテナの高さが画像の高さよりも高い場合
          renderWidth = preview.outerWidth();
          renderHeight = renderWidth / imageAspectRatio;
          offsetX = 0;
          offsetY = (preview.outerHeight() - renderHeight) / 2;
        }
      
        // 実際の座標を計算
        const realX = (svgRect.left - preview.offset().left - offsetX) * (preview[0].naturalWidth / renderWidth);
        const realY = (svgRect.top - preview.offset().top - offsetY) * (preview[0].naturalHeight / renderHeight);
        const realWidth = svgRect.width * (preview[0].naturalWidth / renderWidth);
        const realHeight = svgRect.height * (preview[0].naturalHeight / renderHeight);
      
        canvas.width = realWidth; // 元の画像の解像度に合わせたサイズ
        canvas.height = realHeight;
      
        // 画像をロードして切り取り範囲を描画
        const image = new Image();
        image.src = preview.attr('src');

        // 画像をトリミングして処理する部分
        image.onload = async function() {
          // 切り取り範囲をキャンバスに描画
          ctx.drawImage(image, realX, realY, realWidth, realHeight, 0, 0, realWidth, realHeight);

          // canvasからblobを生成
          canvas.toBlob(async (blob) => {
            // processImage関数でOCR処理
            const result = await processImage(blob);
            const imageUrl = URL.createObjectURL(blob);
            console.log('image:', imageUrl);
            if (result && result.text) {
              $('.write-question-modal .question-input-form').val(result.text);

              // 新しい 'input' イベントを作成して発火
              const event = new Event('input', {
                bubbles: true,
                cancelable: true,
              });
              $('.write-question-modal .question-input-form')[0].dispatchEvent(event);
              trimmingImageModal.hide();
            }
          }, 'image/png');
        };
      }, trimmingImageModal[0], '.write-out-image');
    }
  });
});

function setBackButtonListener(listener, element, buttonSelector) {
  var returnButton = element.querySelector(buttonSelector);

  // 以前のイベントリスナーを削除
  returnButton.replaceWith(returnButton.cloneNode(true));

  // 新しいイベントリスナーを追加
  returnButton = element.querySelector(buttonSelector);
  returnButton.addEventListener('click', listener);
}

// 撮影ボタンのイベントリスナーを設定する関数
function setCaptureButtonListener(listener, element, buttonSelector) {
  let captureButton = element.querySelector(buttonSelector);

  // 以前のイベントリスナーを削除
  captureButton.replaceWith(captureButton.cloneNode(true));

  // 新しいイベントリスナーを追加
  captureButton = element.querySelector(buttonSelector);
  captureButton.addEventListener('click', listener);
}

// 画像読み込みボタンのイベントリスナーを設定する関数
function setWriteOutButtonListener(listener, element, buttonSelector) {
  let writeOutButton = element.querySelector(buttonSelector);

  // 以前のイベントリスナーを削除
  writeOutButton.replaceWith(writeOutButton.cloneNode(true));

  // 新しいイベントリスナーを追加
  writeOutButton = element.querySelector(buttonSelector);
  writeOutButton.addEventListener('click', listener);
}

function convertTextToHtml(text) {
  // MarkdownをHTMLに変換
  let html = marked.parse(text);

  return html
}

function handleNoImageButtonClick(modalElement, formSelector, modal) {
  const noImageButton = modalElement.querySelector('.no_image_button .button');
  const otherRadioButton = modalElement.querySelector('input[name="option_select"][value="other"]');
  const workNameInput = modalElement.querySelector('input[name="work_name"]');
  const textTypeSelect = modalElement.querySelector('select[name="text_type"]');
  const ancientType = modalElement.querySelector('.translate-ancient-option.active');

  noImageButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!otherRadioButton.checked && (workNameInput.value && textTypeSelect)) {
      const questionForm = modalElement.querySelector(formSelector);
      const questionTitle = textTypeSelect.value + "：「${workNameInput.value}」の" + ancientType.value 
      $(modal).modal('hide');
      closeCamera();
      submitFormAndShowModal(questionForm, questionTitle);
    } else {
      alert("作品名や種類を明確にして下さい。");
    }
  });
}
