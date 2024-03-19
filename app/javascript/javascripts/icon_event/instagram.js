// app/javascript/javascripts/icon_event/instagram.js

import { Modal } from 'bootstrap';
import { openCamera, takePhoto, closeCamera, processImage, initResizableRect, adjustOverlayElements } from '../helpers/cameraFunctions.js';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';
// ライブラリをインポート
import marked from 'marked';

document.addEventListener("turbolinks:load", function() {
  const instagramApp = document.querySelector('.instagram-icon');
  const instagramModalElement = document.querySelector('.instagramModal');

  if ($('#svg-search').length === 0) return;

  // インスタグラムアプリ起動処理
  $('#svg-search').on('click', async (e) => {
    const open = await fadeOutCirclesSequentially();
    if (open == true) {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) {
        $('.instagramModal').modal('show');
  
        // 現在のカードの内容を保存
        const originalCardsContent = $("#all-cards").html();
        // 既に表示されているカードの数を取得
        var existingCardsCount = $("#all-cards").children().length;
  
        // 最新の質問を取得して表示
        $.ajax({
          url: '/refresh_all_cards',
          type: 'GET',
          dataType: 'script',
          data: { existing_cards_count: existingCardsCount },
          success: function(response) {
            // 成功時の処理はここに記述（refresh_all_card.js.erb で処理される）
          },
          error: function(xhr, status, error) {
            // 失敗時には元のカードの内容を再表示
            $("#all-cards").html(originalCardsContent);
            console.error('最新の質問の取得に失敗しました。', error);
          }
        });
  
        $(".instagramModal .card").each(function() {
          const card = $(this); // 現在のカードを取得
          card.find('.card-body').on('click', function() {
            if (!isUserLoggedIn()) {
              const confirmLogin = confirm("回答を表示するにはログインが必要です。ログインページへ移動しますか？");
              if (confirmLogin) {
                // ユーザーがOKを選択した場合、ログインページへリダイレクト
                window.location.href = "/users/sign_in";
              }
            } else {
              console.log('ユーザー詳細ページ分岐')
              const id = card.data('card-id'); // このカードのdata-card-id属性からIDを取得
              fetchCardDetails(id);
            }
          });
        });

        $("#user-search-cards .search-results").empty();
        $("#no-results-message").hide(); // メッセージを隠す
        $('.instagramModal .search-textarea').val('');

        $('.instagramModal .circle1')[0].click();
        e.stopPropagation();
      }
    }
  });  

  // jQueryを使用したコード
  $('.option-circle').click(function() {
    // 全てのcircleのアクティブスタイルをリセットする
    $('.option-circle').removeClass('active');

    // 現在のcircleにアクティブスタイルを適用する
    $(this).addClass('active');

    // 全てのカードを非表示にする
    $('.cards').css('display', 'none');
    
    // 対応するカードを表示する
    const category = $(this).data('category');
    const cardsToShow = $(`.${category}-cards`);
    if (cardsToShow.length == 0 && !isUserLoggedIn()) {
      $('.auth-buttons-container').show();
      $('.instagramModal .cards-panel').css('height', '100%');
    }
    if (cardsToShow.length > 0) {
      $('.auth-buttons-container').hide();
      $('.instagramModal .cards-panel').css('height', 'auto');
      cardsToShow.css('display', 'block');
      $('.cards-panel-modal-body').scrollTop(0); // スクロール位置をトップに戻す
    }
  });

  const modalBody = document.querySelector('.instagramModal .modal-body');

  modalBody.addEventListener('scroll', function() {
    const scrollHeight = this.scrollHeight;
    const scrollTop = this.scrollTop;
    const containerHeight = this.clientHeight;

    if (scrollTop + containerHeight >= scrollHeight) {
      let activeCategory = $('.bottom-circles .circle.option-circle.active').data('category');
      loadMoreCards(activeCategory);
    }
  });
  
  function loadMoreCards(activeCategory) {
    let existingCardsCount = $(`.${activeCategory}-cards .card`).length;
    console.log(existingCardsCount);
    
    $.ajax({
      url: '/add_more_cards',
      type: 'GET',
      dataType: 'script',
      data: {
        category: activeCategory,
        existing_cards_count: existingCardsCount
      },
      success: function(response) {
        // 成功時の処理はサーバー側のスクリプトで行われます。
      },
      error: function(xhr, status, error) {
        console.error('カードのロードに失敗しました。', error);
      }
    });
  }  

  $('.instagramModal .search-form').on('submit', function(event) {
    event.preventDefault(); // フォームの送信を阻止
    triggerSearch();
  });

  $('.instagramModal .search-textarea').on('input', triggerSearch);

  async function triggerSearch() {
    console.log("input")
    const url = `/questions/search?query=${encodeURIComponent($('.instagramModal .search-textarea').val().trim())}`;
    try {
      $.ajax({
        url: url,
        method: 'GET',
        headers: {
          'Accept': 'application/javascript',
          'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        credentials: 'same-origin'
      });
    } catch (error) {
      console.error("Search failed: ", error);
    }
  }

  const cameraCircle = document.querySelector('.camera-circle');

  const simpleCameraModalElement = document.querySelector('.simple-camera-modal');
  const simpleCameraPreview = simpleCameraModalElement.querySelector(".preview");
  const simpleCameraCaptureButton = simpleCameraModalElement.querySelector('.capture-button');
  const simpleCameraModal = new Modal(simpleCameraModalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  
  $('.instagramModal .camera-circle').on('click', async () => {
    const instagramModal = $('.instagramModal');
    const simpleCameraModal = $('.simple-camera-modal');
    const preview = $(".simple-camera-modal .preview");
    instagramModal.modal('hide');
    simpleCameraModal.modal('show');
    setTimeout(() => {
      openCamera(simpleCameraModal[0], preview[0]);
    }, 500); // 500ミリ秒の遅延

    setBackButtonListener(async () => {
      // ここに戻るボタンが押されたときの処理を記述
      if (simpleCameraModal.hasClass('show')) {
        simpleCameraModal.modal('hide');
        closeCamera();
        instagramModal.modal('show');
      }
    }, simpleCameraModal[0], '.return-button');

    setCaptureButtonListener(async () => {
      const imageBitmap = await takePhoto();

      simpleCameraModal.modal('hide');
      closeCamera();

      const maskRect = $('.simple-camera-modal .mask-rect')[0];
      const svgRect = maskRect.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
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
        $('.instagramModal .search-textarea').val(result.text);

        // 新しい 'input' イベントを作成
        const event = new Event('input', {
          bubbles: true, // イベントをバブリングさせる
          cancelable: true, // イベントをキャンセル可能にする
        });

        // テキストエリア要素でイベントを発火
        $('.instagramModal .search-textarea')[0].dispatchEvent(event);
      }, 'image/png');
    }, simpleCameraModal[0], '.capture-button');
  });
  
  const imageCircle = document.querySelector('.image-circle');
  const trimmingImageModalElement = document.querySelector(".trimming-image-modal");
  const inputImageButton = instagramModalElement.querySelector('.image-input-search');
  const imagePreview = trimmingImageModalElement.querySelector('.preview');

  const resizableRectsTrim = trimmingImageModalElement.querySelector('.resizable-rect');
  const lightDarkAreasTrim = trimmingImageModalElement.querySelector('.light-dark-area');
  // const maskRect = searchCameraModalElement.querySelector(".mask-rect");
  const trimmingImageModal = new Modal(trimmingImageModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  $('.instagramModal .image-circle').on('click', function (e) {
    console.log("Click");
    $('.instagramModal .image-input-search')[0].click();
    e.stopPropagation();
  });

  // 画像が選択されたらプレビューに表示し、ファイルを保持
  $('.instagramModal .image-input-search').on('change', function(e) {
    const instagramModal = $('.instagramModal');
    const trimmingImageModal = $('.trimming-image-modal');
    const preview = $('.trimming-image-modal .preview');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.attr('src', e.target.result);
      };
      reader.readAsDataURL(file);
      
      instagramModal.modal('hide');
      trimmingImageModal.modal('show');

      setBackButtonListener(async () => {
        // ここに戻るボタンが押されたときの処理を記述
        if (trimmingImageModal.hasClass('show')) {
          $('.instagramModal .image-input-search').val('');
          preview.attr('src', '');
          trimmingImageModal.modal('hide');
          instagramModal.modal('show');
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
              $('.instagramModal .search-textarea').val(result.text);

              // 新しい 'input' イベントを作成して発火
              const event = new Event('input', {
                bubbles: true,
                cancelable: true,
              });
              $('.instagramModal .search-textarea')[0].dispatchEvent(event);
              trimmingImageModal.hide();
              preview.attr('src', '');
            }
          }, 'image/png');
        };
      }, trimmingImageModal[0], '.write-out-image');
    }
  });


  ///////////

  const circle5 = document.querySelector('.search-circle');
  if (circle5) {
    const inputCircleContainer = document.querySelector('.input-circle-container');
    circle5.addEventListener('click', () => {
      inputCircleContainer.classList.add('move-up');
    });
  
    const searchQuery = document.querySelector('.search-textarea');
    const firstHeight = '52';
    let lastHeight = firstHeight; // 初期値をfirstHeightに設定
  
    // inputイベント時の高さ調整
    searchQuery.addEventListener('input', adjustHeight);
  
    // 初期ロード時の高さ調整
    adjustHeight();
  
    // textarea以外の部分がクリックされた時の挙動
    document.body.addEventListener('click', function(e) {
        if (!e.target.closest('#searchQuery') || e.target.closest('#searchQuery') == null) {
          // searchQuery.style.height = 'auto';
          searchQuery.style.height = firstHeight + 'px';
        }
    });
  
    // textareaにフォーカスが当たった時の挙動
    searchQuery.addEventListener('focus', function() {
      if (searchQuery.value === "") { // 入力内容が空の場合
        // searchQuery.style.height = 'auto';
        searchQuery.style.height = firstHeight + 'px'; // 初期の高さに設定
      } else {
        // searchQuery.style.height = 'auto';
        searchQuery.style.height = lastHeight + 'px';
      }
    });
  
    // textareaのclickイベントでbodyのclickイベントをキャンセル
    searchQuery.addEventListener('click', function(e) {
        e.stopPropagation();
    });
  
    // textareaの高さを調整する関数
    function adjustHeight() {
        // searchQuery.style.height = 'auto';
        searchQuery.style.height = searchQuery.scrollHeight + 'px';
        lastHeight = searchQuery.scrollHeight;
    }
  }
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

function revealText(text, index, element) {
  element.innerHTML = '';
  if (index < text.length) {
    // 次の文字を追加
    element.innerHTML += text[index];
    // 次の文字へ
    setTimeout(() => revealText(text, index + 1, element), 30); // 100ミリ秒ごとに次の文字を表示
  }
}

function convertTextToHtml(text) {
  // MarkdownをHTMLに変換
  let html = marked.parse(text);

  // 改行を<br>に置き換え
  return html;
}
