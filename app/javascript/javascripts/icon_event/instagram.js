// instagram.js

import { Modal } from 'bootstrap';
import { createStream, processImage, initResizableRect } from '../helpers/cameraFunctions.js';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

document.addEventListener("turbolinks:load", function() {
  const instagramApp = document.querySelector('.instagram-icon');
  const instagramModalElement = document.querySelector('.instagramModal');
  const instagramModal = new Modal(instagramModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  const cards = document.querySelectorAll('.cards .card');
  const cardContentModalElement = document.getElementById('cardContentModal');
  const cardContentModal = new Modal(cardContentModalElement, {
    keyboard: true,
    backdrop: 'true'
  });

  // インスタグラムアプリ起動処理
  instagramApp.addEventListener('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true)
    {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) instagramModal.show();
    }
  });

  let isLikedMap = {}; // カードIDをキーとして、いいねの状態を保持
  let currentCardId = null; // 現在のカードIDを保持するグローバル変数
  const likedSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="-0.715 -0.715 40 40" height="40" width="40"><g id="heart--reward-social-rating-media-heart-it-like-favorite-love"><path id="Vector" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="M19.2962955 34.114063 4.21440615 20.45303735c-8.19670355 -8.19670355 3.8524266999999996 -23.934337999999997 15.08188935 -11.2021606 11.229379999999999 -12.7321774 23.224099 3.0601162499999996 15.081972 11.2021606L19.2962955 34.114063Z" stroke-width="0"></path></g></svg>';
  const notLikedSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.715 -0.715 40 40" height="40" width="40"><g id="heart--reward-social-rating-media-heart-it-like-favorite-love"><path id="Vector" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="M19.2962955 34.114063 4.21440615 20.45303735c-8.19670355 -8.19670355 3.8524266999999996 -23.934337999999997 15.08188935 -11.2021606 11.229379999999999 -12.7321774 23.224099 3.0601162499999996 15.081972 11.2021606L19.2962955 34.114063Z" stroke-width="1"></path></g></svg>';

  // いいねボタンの状態といいねの数を更新する関数
  function updateLikeButton(cardId, isLiked, likeCount) {
    // 同一カードIDの全てのいいねボタンとカウントを選択
    const likeButtons = document.querySelectorAll(`.card[data-card-id="${cardId}"] .like`);
    const likeCounts = document.querySelectorAll(`.card[data-card-id="${cardId}"] .like-count`);
    const cardLikeButton = document.querySelector('#cardContentModal .like');
    const cardLikeCount = document.querySelector('#cardContentModal .like-count');
    cardLikeButton.innerHTML = isLiked ? likedSvg : notLikedSvg;
    cardLikeCount.textContent = likeCount;

    likeButtons.forEach(button => {
      button.innerHTML = isLiked ? likedSvg : notLikedSvg;
    });
    
    likeCounts.forEach(count => {
      count.textContent = likeCount;
    });
  }

  // いいねのトグル機能
  function toggleLike(cardId, isLiked) {
    const url = isLiked ? `/questions/${cardId}/unlike` : `/questions/${cardId}/like`;
    const method = isLiked ? 'DELETE' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      return response.json();
    })
    .then(data => {
      updateLikeButton(cardId, !isLiked, data.like_count);
    })
    .catch(error => console.error('Error:', error));
  }

  instagramModalElement.querySelectorAll('.card-body').forEach(cardBody => {
    cardBody.addEventListener('click', (event) => {
      const cardId = cardBody.parentElement.querySelector('.card-id').textContent.trim();
      currentCardId = cardId; // グローバル変数を更新
  
      fetch(`/questions/${cardId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (cardContentModal._isShown !== true) {
          document.querySelector('#cardContentModal .card-content-question').textContent = data.question;
          document.querySelector('#cardContentModal .card-content-answer').textContent = data.answer;

          // いいねボタンの状態を更新
          const likeButton = document.querySelector('#cardContentModal .like');
          likeButton.innerHTML = data.is_liked ? likedSvg : notLikedSvg;
          const likeCount = document.querySelector('#cardContentModal .like-count');
          const likeCountInstagram = document.querySelector(`.instagramModal .card[data-card-id="${cardId}"] .like-count`);
          likeCount.textContent = likeCountInstagram.textContent;
          
          const bookmarkButton = document.querySelector('#cardContentModal .bookmark');
          bookmarkButton.innerHTML = data.is_bookmarked ? savedSvg : notSavedSvg;
          const bookmarkCount = document.querySelector('#cardContentModal .bookmark-count');
          const bookmarkCountInstagram = document.querySelector(`.instagramModal .card[data-card-id="${cardId}"] .bookmark-count`);
          bookmarkCount.textContent = bookmarkCountInstagram.textContent;
  
          // モーダルを表示
          cardContentModal.show();
        }
      })
      .catch(error => console.error('Error:', error));
    });
  });
  
  // イベントリスナーを設定
  instagramModalElement.querySelectorAll('.instagramModal .like').forEach(likeElement => {
    likeElement.addEventListener('click', event => {
      event.preventDefault();
      const cardId = likeElement.closest('.card').dataset.cardId;
      const isLiked = likeElement.querySelector('svg').getAttribute('fill') === 'red';
      toggleLike(cardId, isLiked);
    });
  });

  cardContentModalElement.querySelector('.card-content .like').addEventListener('click', event => {
    event.preventDefault();
    const isLiked = cardContentModalElement.querySelector('.card-content .like').querySelector('svg').getAttribute('fill') === 'red';
    console.log(cardContentModalElement.querySelector('.card-content .like').querySelector('svg'));
    console.log(cardContentModalElement.querySelector('.card-content .like').querySelector('svg').getAttribute('fill'));
    console.log(isLiked);
    toggleLike(currentCardId, isLiked);
  });

  // SVGアイコンの定義
  const savedSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="-0.715 -0.715 40 40" height="40" width="40"><g id="bookmark--bookmarks-tags-favorite"><path id="Vector" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="m30.305 37.192499999999995 -11.02 -11.02 -11.02 11.02v-33.06c0 -0.7306811 0.2902668 -1.43141535 0.8069119499999999 -1.948079785C9.58858465 1.667758535 10.2893189 1.3775 11.02 1.3775h16.53c0.730626 0 1.4314979999999997 0.290258535 1.9480604999999998 0.806920215C30.014623 2.70108465 30.305 3.4018189 30.305 4.1325v33.06Z" stroke-width="0"></path></g></svg>'; // 保存されている状態のSVG
  const notSavedSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.715 -0.715 40 40" height="40" width="40"><g id="bookmark--bookmarks-tags-favorite"><path id="Vector" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="m30.305 37.192499999999995 -11.02 -11.02 -11.02 11.02v-33.06c0 -0.7306811 0.2902668 -1.43141535 0.8069119499999999 -1.948079785C9.58858465 1.667758535 10.2893189 1.3775 11.02 1.3775h16.53c0.730626 0 1.4314979999999997 0.290258535 1.9480604999999998 0.806920215C30.014623 2.70108465 30.305 3.4018189 30.305 4.1325v33.06Z" stroke-width="1"></path></g></svg>'; // 保存されていない状態のSVG

  // 保存ボタンの状態を更新する関数
  function updateSaveButton(cardId, isSaved, saveCount) {
    // 同一カードIDの全ての保存ボタンとカウントを選択
    const bookmarkButtons = document.querySelectorAll(`.card[data-card-id="${cardId}"] .bookmark`);
    const bookmarkCounts = document.querySelectorAll(`.card[data-card-id="${cardId}"] .bookmark-count`);
    const cardBookmarkButton = document.querySelector('#cardContentModal .bookmark');
    const cardBookmarkCount = document.querySelector('#cardContentModal .bookmark-count');
    cardBookmarkButton.innerHTML = isSaved ? savedSvg : notSavedSvg;
    cardBookmarkCount.textContent = saveCount;

    bookmarkButtons.forEach(button => {
      button.innerHTML = isSaved ? savedSvg : notSavedSvg;
    });

    bookmarkCounts.forEach(count => {
      count.textContent = saveCount;
    });
  }

  // 保存のトグル機能
  function toggleSave(cardId, isSaved) {
    const url = isSaved ? `/questions/${cardId}/unsave` : `/questions/${cardId}/save`;
    const method = isSaved ? 'DELETE' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to toggle save');
      }
      return response.json();
    })
    .then(data => {
      updateSaveButton(cardId, !isSaved, data.save_count);
    })
    .catch(error => console.error('Error:', error));
  }

  // イベントリスナーの設定
  instagramModalElement.querySelectorAll('.instagramModal .bookmark').forEach(bookmarkElement => {
    bookmarkElement.addEventListener('click', event => {
      event.preventDefault();
      const cardId = bookmarkElement.closest('.card').dataset.cardId;
      const isSaved = bookmarkElement.querySelector('svg').getAttribute('fill') === 'green'; // 保存されている状態の判定
      toggleSave(cardId, isSaved);
    });
  });

  cardContentModalElement.querySelector('.card-content .bookmark').addEventListener('click', event => {
    const isSaved = cardContentModalElement.querySelector('.card-content .bookmark').querySelector('svg').getAttribute('fill') === 'green';
    toggleSave(currentCardId, isSaved);
  });

  const circles = document.querySelectorAll('.option-circle');
  const cardsPanel = document.querySelector('.cards-panel-modal-body'); // カードパネルの要素を取得

  circles.forEach(circle => {
    circle.addEventListener('click', (e) => {
      // Get the category from the clicked circle
      const category = circle.dataset.category;

      // Hide all cards
      // document.querySelectorAll('.cards').forEach(el => el.classList.add('invisible'));
      document.querySelectorAll('.cards').forEach(el => el.style.display = "none");

      // Show the corresponding cards
      const cardsToShow = document.querySelector(`.${category}-cards`);
      if (cardsToShow) {
        // cardsToShow.classList.remove('invisible');
        cardsToShow.style.display = "block";
        cardsPanel.scrollTo(0, 0); // カードパネルのスクロール位置をトップに戻す
      }
      else 
      {
        console.log(category);
      }
    });
  });

  const searchForm = document.querySelector('.search-form');
  const searchQuery = document.querySelector('.search-textarea');
  const searchResults = document.querySelector('.search-results');

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // フォームの送信を阻止
    triggerSearch();
  });

  searchQuery.addEventListener('input', triggerSearch);

  async function triggerSearch() {
    console.log("input")
    if (searchQuery.value.trim() === "") {
      searchResults.innerHTML = ''; // 検索ボックスが空の場合、結果をクリア
      return;
    }

    const url = `/questions/search?query=${encodeURIComponent(searchQuery.value.trim())}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
      },
      credentials: 'same-origin'
    });

    if (response.ok) {
      const html = await response.text();
      searchResults.innerHTML = html;

      // いいねボタンの状態といいねの数を更新する関数
      function updateLikeButton(cardId, isLiked, likeCount) {
        // 同一カードIDの全てのいいねボタンとカウントを選択
        const likeButtons = document.querySelectorAll(`.card[data-card-id="${cardId}"] .like`);
        const likeCounts = document.querySelectorAll(`.card[data-card-id="${cardId}"] .like-count`);
        const cardLikeButton = document.querySelector('#cardContentModal .like');
        const cardLikeCount = document.querySelector('#cardContentModal .like-count');
        cardLikeButton.innerHTML = isLiked ? likedSvg : notLikedSvg;
        cardLikeCount.textContent = likeCount;

        likeButtons.forEach(button => {
          button.innerHTML = isLiked ? likedSvg : notLikedSvg;
        });
        
        likeCounts.forEach(count => {
          count.textContent = likeCount;
        });
      }

      // いいねのトグル機能
      function toggleLike(cardId, isLiked) {
        const url = isLiked ? `/questions/${cardId}/unlike` : `/questions/${cardId}/like`;
        const method = isLiked ? 'DELETE' : 'POST';

        fetch(url, {
          method: method,
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to toggle like');
          }
          return response.json();
        })
        .then(data => {
          updateLikeButton(cardId, !isLiked, data.like_count);
        })
        .catch(error => console.error('Error:', error));
      }

      searchResults.querySelectorAll('.card-body').forEach(cardBody => {
        cardBody.addEventListener('click', (event) => {
          const cardId = cardBody.parentElement.querySelector('.card-id').textContent.trim();
          currentCardId = cardId; // グローバル変数を更新

          fetch(`/questions/${cardId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (cardContentModal._isShown !== true) {
              document.querySelector('#cardContentModal .card-content-question').textContent = data.question;
              document.querySelector('#cardContentModal .card-content-answer').textContent = data.answer;

              // いいねボタンの状態を更新
              const likeButton = document.querySelector('#cardContentModal .like');
              likeButton.innerHTML = data.is_liked ? likedSvg : notLikedSvg;
              const likeCount = document.querySelector('#cardContentModal .like-count');
              const likeCountInstagram = document.querySelector(`.instagramModal .card[data-card-id="${cardId}"] .like-count`);
              likeCount.textContent = likeCountInstagram.textContent;
              
              const bookmarkButton = document.querySelector('#cardContentModal .bookmark');
              bookmarkButton.innerHTML = data.is_bookmarked ? savedSvg : notSavedSvg;
              const bookmarkCount = document.querySelector('#cardContentModal .bookmark-count');
              const bookmarkCountInstagram = document.querySelector(`.instagramModal .card[data-card-id="${cardId}"] .bookmark-count`);
              bookmarkCount.textContent = bookmarkCountInstagram.textContent;

              // モーダルを表示
              cardContentModal.show();
            }
          })
          .catch(error => console.error('Error:', error));
        });
      });

      // イベントリスナーを設定
      searchResults.querySelectorAll('.instagramModal .like').forEach(likeElement => {
        likeElement.addEventListener('click', event => {
          event.preventDefault();
          const cardId = likeElement.closest('.card').dataset.cardId;
          const isLiked = likeElement.querySelector('svg').getAttribute('fill') === 'red';
          toggleLike(cardId, isLiked);
        });
      });

      // 保存ボタンの状態を更新する関数
      function updateSaveButton(cardId, isSaved, saveCount) {
        // 同一カードIDの全ての保存ボタンとカウントを選択
        const bookmarkButtons = document.querySelectorAll(`.card[data-card-id="${cardId}"] .bookmark`);
        const bookmarkCounts = document.querySelectorAll(`.card[data-card-id="${cardId}"] .bookmark-count`);
        const cardBookmarkButton = document.querySelector('#cardContentModal .bookmark');
        const cardBookmarkCount = document.querySelector('#cardContentModal .bookmark-count');
        cardBookmarkButton.innerHTML = isSaved ? savedSvg : notSavedSvg;
        cardBookmarkCount.textContent = saveCount;

        bookmarkButtons.forEach(button => {
          button.innerHTML = isSaved ? savedSvg : notSavedSvg;
        });

        bookmarkCounts.forEach(count => {
          count.textContent = saveCount;
        });
      }

      // 保存のトグル機能
      function toggleSave(cardId, isSaved) {
        const url = isSaved ? `/questions/${cardId}/unsave` : `/questions/${cardId}/save`;
        const method = isSaved ? 'DELETE' : 'POST';

        fetch(url, {
          method: method,
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to toggle save');
          }
          return response.json();
        })
        .then(data => {
          updateSaveButton(cardId, !isSaved, data.save_count);
        })
        .catch(error => console.error('Error:', error));
      }

      // イベントリスナーの設定
      searchResults.querySelectorAll('.instagramModal .bookmark').forEach(bookmarkElement => {
        bookmarkElement.addEventListener('click', event => {
          event.preventDefault();
          const cardId = bookmarkElement.closest('.card').dataset.cardId;
          const isSaved = bookmarkElement.querySelector('svg').getAttribute('fill') === 'green'; // 保存されている状態の判定
          toggleSave(cardId, isSaved);
        });
      });
    }
  }

  const cameraCircle = document.querySelector('.camera-circle');
  const searchCameraModalElement = document.querySelector('.search-camera-modal');
  const cameraPreview = searchCameraModalElement.querySelector(".camera-preview");
  const captureButton = searchCameraModalElement.querySelector('.search-camera-capture-button');
  const searchCameraModal = new Modal(searchCameraModalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  let imageCapture;
  let stream;
  let cameraTrack;

  cameraCircle.addEventListener('click', async () => {
    searchCameraModal.show();
    stream = await createStream(cameraPreview);    
    cameraTrack = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(cameraTrack);
  });

  const resizableRects = searchCameraModalElement.querySelector('.resizable-rect');
  const lightDarkAreas = searchCameraModalElement.querySelector('.light-dark-area');
  const maskRect = searchCameraModalElement.querySelector(".mask-rect");
  
  initResizableRect(resizableRects, lightDarkAreas);
  
  // 撮影ボタンクリック時の処理
  captureButton.addEventListener("click", async () => {
    const photo = await imageCapture.takePhoto();
    const imageBitmap = await createImageBitmap(photo);
    
    // 元の画像をプレビューに表示
    const originalImageUrl = URL.createObjectURL(photo);
    console.log("origin", originalImageUrl);
    // preview.src = originalImageUrl;
    // カメラアプリ終了処理
    searchCameraModal.hide();
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
      const imageUrl = URL.createObjectURL(blob);
      console.log('image:', imageUrl);
      searchQuery.value = result.text;
      // 新しい 'input' イベントを作成
      const event = new Event('input', {
        bubbles: true, // イベントをバブリングさせる
        cancelable: true, // イベントをキャンセル可能にする
      });

      // テキストエリア要素でイベントを発火
      searchQuery.dispatchEvent(event);
    }, 'image/png');
  });

  const imageCircle = document.querySelector('.image-circle');
  const searchTrimmingImageModalElement = document.querySelector('.search-trimming-image-modal');
  const inputImageButton = document.querySelector('.image-input-search');

  const resizableRectsSe = searchTrimmingImageModalElement.querySelector('.resizable-rect');
  const lightDarkAreasSe = searchTrimmingImageModalElement.querySelector('.light-dark-area');
  // const maskRect = searchCameraModalElement.querySelector(".mask-rect");
  const trimmingImageModal = new Modal(searchTrimmingImageModalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  
  initResizableRect(resizableRectsSe, lightDarkAreasSe);

  // 画像が選択されたらプレビューに表示
  inputImageButton.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = searchTrimmingImageModalElement.querySelector('.preview');
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      trimmingImageModal.show();
    }
  });

  // "読み込む"ボタンのクリックイベント
  searchTrimmingImageModalElement.querySelector('.search-write-out-image').addEventListener('click', function() {
    const previewImage = searchTrimmingImageModalElement.querySelector('.preview');
    const maskRect = searchTrimmingImageModalElement.querySelector('.mask-rect');
  
    // canvas要素を作成
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // プレビュー画像とコンテナのアスペクト比を計算
    const imageAspectRatio = previewImage.naturalWidth / previewImage.naturalHeight;
    const containerAspectRatio = previewImage.offsetWidth / previewImage.offsetHeight;
  
    // 実際の表示サイズとコンテナ内でのオフセットを計算
    let renderWidth, renderHeight, offsetX, offsetY;
    if (containerAspectRatio > imageAspectRatio) {
      // コンテナの幅が画像の幅よりも広い場合
      renderHeight = previewImage.offsetHeight;
      renderWidth = imageAspectRatio * renderHeight;
      offsetX = (previewImage.offsetWidth - renderWidth) / 2;
      offsetY = 0;
    } else {
      // コンテナの高さが画像の高さよりも高い場合
      renderWidth = previewImage.offsetWidth;
      renderHeight = renderWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (previewImage.offsetHeight - renderHeight) / 2;
    }
  
    // SVG内でのmaskRectの位置とサイズを取得
    const svgRect = maskRect.getBoundingClientRect();
  
    // 実際の座標を計算
    const x = (svgRect.left - previewImage.offsetLeft - offsetX) * (previewImage.naturalWidth / renderWidth);
    const y = (svgRect.top - previewImage.offsetTop - offsetY) * (previewImage.naturalHeight / renderHeight);
    const width = svgRect.width * (previewImage.naturalWidth / renderWidth);
    const height = svgRect.height * (previewImage.naturalHeight / renderHeight);
  
    // canvasのサイズをmaskRectのサイズに合わせる
    canvas.width = svgRect.width;
    canvas.height = svgRect.height;
  
    // 画像をロードして切り取り範囲を描画
    const image = new Image();
    image.src = previewImage.src;
    // 画像をトリミングして処理する部分
    image.onload = async function() {
      // 切り取り範囲をキャンバスに描画
      ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

      // canvasからblobを生成
      canvas.toBlob(async (blob) => {
        // processImage関数でOCR処理
        const result = await processImage(blob);
        if (result && result.text) {
          searchQuery.value = result.text;

          // 新しい 'input' イベントを作成して発火
          const event = new Event('input', {
            bubbles: true,
            cancelable: true,
          });
          searchQuery.dispatchEvent(event);
          trimmingImageModal.hide();
        }
      }, 'image/png');
    };
  });
  
  const returnSearchButton = searchCameraModalElement.querySelector('.return-search-button');
  
  returnSearchButton.addEventListener('click', async () => {
    if (searchCameraModal._isShown == true) 
    {
      searchCameraModal.hide();
      cameraTrack.stop();
    }
  });
});
