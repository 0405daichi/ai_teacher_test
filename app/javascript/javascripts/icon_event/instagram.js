// instagram.js

import { Modal } from 'bootstrap';
import { openCamera, takePhoto, closeCamera, processImage, initResizableRect, adjustOverlayElements } from '../helpers/cameraFunctions.js';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';
// ライブラリをインポート
import marked from 'marked';
import katex from 'katex';


// KaTeXのオプションを設定
const katexOptions = {
  throwOnError: false, // LaTeXのパースエラーを無視する
  errorColor: "#cc0000", // エラーの色を設定
  delimiters: [ // 数式のデリミタを設定
    {left: "$$", right: "$$", display: true},
    {left: "\\[", right: "\\]", display: true},
    {left: "$", right: "$", display: false},
    {left: "\\(", right: "\\)", display: false}
  ]
};

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
      if (openEnd) 
      {
        instagramModal.show();
        // Homeボタンに相当する要素を取得
        const homeButton = instagramModalElement.querySelector('.circle1');

        // Homeボタンをクリックしてアクティブ状態にする
        homeButton.click();
      }
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
          currentCardId = cardId;
          if (data.can_edit_own_post) {
            const editButton = document.querySelector('.edit-card-buttons .edit');
            if (editButton) {
              editButton.style.display = 'block';

              // 編集ボタンにイベントリスナーを追加
              editButton.addEventListener('click', function() {
                window.location.href = `/questions/${currentCardId}/edit`;
              });
            }
          }

          const cardContentModalElement = document.querySelector('.card-content');
          let contentHtml = convertTextToHtml(data.question);

          // 画像がある場合は画像を含むHTMLを追加
          if (data.image_url) {
            contentHtml = `<img src="${data.image_url}" alt="Question Image" style="width: 100%; height: auto; margin-bottom: 30px">` + contentHtml;
          }

          document.querySelector('#cardContentModal .card-content-question').innerHTML = contentHtml;

          // 各回答の内容を確認し、カルーセルのスライドに設定
          const answers = [
            { content: data.answer_1, element: '.answer-1', defaultText: "わかりやすい回答を作成しましょう" },
            { content: data.answer_2, element: '.answer-2', defaultText: "よりわかりやすい回答を作成しましょう" },
            { content: data.answer_3, element: '.answer-3', defaultText: "回答を例え話で作成しましょう" }
          ];

          answers.forEach(answer => {
            const answerElement = document.querySelector(`#cardContentModal ${answer.element}`);
            if (!answer.content) {
              // 回答が空の場合、デフォルトのテキストとボタンを表示
              answerElement.innerHTML = `
                <p>${answer.defaultText}</p>
                <div class="custom-button" style="background-color: transparent; border-radius: 50%; border: solid 1px black; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.05 -0.05 3 3" height="30" width="30"><g id="send-email--mail-send-email-paper-airplane"><path id="Vector" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="m1.203984714285714 2.278675 0.45115507142857136 0.4490857142857143c0.027680499999999997 0.02835785714285714 0.062289928571428566 0.04901 0.10040214285714286 0.059905714285714284 0.03811221428571428 0.010895714285714285 0.07840771428571429 0.01164142857142857 0.11689899999999999 0.002175 0.03873157142857143 -0.009010714285714285 0.07449478571428571 -0.027819285714285713 0.10385107142857142 -0.05464428571428571 0.02935835714285714 -0.026824999999999998 0.05132171428571428 -0.06073428571428571 0.0637792857142857 -0.09849642857142855L2.7809549999999996 0.4161002857142857c0.015473571428571429 -0.04160671428571429 0.01866357142857143 -0.08677835714285714 0.009197142857142857 -0.1301457857142857 -0.00946642857142857 -0.0433695 -0.031174999999999998 -0.08310757857142856 -0.06255714285714285 -0.11449427857142856 -0.03138214285714285 -0.03138690714285714 -0.07113285714285714 -0.053101278571428566 -0.11448785714285713 -0.06256232142857142 -0.04337571428571428 -0.009461042857142856 -0.08855357142857143 -0.0062708357142857146 -0.13014785714285712 0.00919155L0.2623526428571428 0.8589779285714285c-0.039062999999999994 0.013342071428571427 -0.07385347142857143 0.03687557142857143 -0.10077665714285713 0.06816449999999999 -0.026923185714285713 0.031288928571428565 -0.04500240714285714 0.06920021428571428 -0.052368821428571424 0.10981471428571427 -0.007603592857142856 0.03693978571428571 -0.005911028571428571 0.07518871428571429 0.004925857142857142 0.11131235714285714 0.010836885714285713 0.036121571428571426 0.030478378571428568 0.06898685714285714 0.057159828571428574 0.09563992857142857L0.7383420714285714 1.8109588571428568l-0.018626285714285713 0.7181311428571427 0.48426892857142856 -0.250415Z" stroke-width="0.1"></path><path id="Vector_2" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="M2.714752142857143 0.16360039285714284 0.738350357142857 1.8109402142857143" stroke-width="0.1"></path></g></svg>
                </div>
              `;
              const customButton = document.querySelector(`#cardContentModal .custom-button`);
              customButton.classList.add('active');
            } else {
              var te = convertTextToHtml(answer.content);
              // 回答がある場合、その内容を表示
              console.log("これパースできてる？？", te);
              answerElement.innerHTML = convertTextToHtml(answer.content);
            }
          });

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
    circle.addEventListener('click', () => {
      // 全てのcircleのアクティブスタイルをリセットする
      circles.forEach(el => el.classList.remove('active'));

      // 現在のcircleにアクティブスタイルを適用する
      circle.classList.add('active');

      const category = circle.dataset.category;

      // 全てのカードを非表示にする
      document.querySelectorAll('.cards').forEach(el => el.style.display = "none");

      // 対応するカードを表示する
      const cardsToShow = document.querySelector(`.${category}-cards`);
      if (cardsToShow) {
        cardsToShow.style.display = "block";
        cardsPanel.scrollTo(0, 0); // スクロール位置をトップに戻す
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
  let simpleCameraImageCapture;
  let simpleCameraStream;
  let simpleCameraTrack;

  const simpleCameraModalElement = document.querySelector('.simple-camera-modal');
  const simpleCameraPreview = simpleCameraModalElement.querySelector(".preview");
  const simpleCameraCaptureButton = simpleCameraModalElement.querySelector('.capture-button');
  const simpleCameraModal = new Modal(simpleCameraModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  const resizableRects = simpleCameraModalElement.querySelector('.resizable-rect');
  const lightDarkAreas = simpleCameraModalElement.querySelector('.light-dark-area');
  initResizableRect(resizableRects, lightDarkAreas, simpleCameraPreview);
  
  cameraCircle.addEventListener('click', async () => {
    instagramModal.hide();
    simpleCameraModal.show();
    // simpleCameraStream = await openCamera(simpleCameraPreview);    
    // simpleCameraTrack = simpleCameraStream.getVideoTracks()[0];
    // simpleCameraImageCapture = new ImageCapture(simpleCameraTrack);
    openCamera(simpleCameraModalElement, simpleCameraPreview);

    setBackButtonListener(async () => {
      // ここに戻るボタンが押されたときの処理を記述
      if (simpleCameraModal._isShown == true) {
        simpleCameraModal.hide();
        // simpleCameraTrack.stop();
        closeCamera();
        instagramModal.show();
      }
    }, simpleCameraModalElement, '.return-button');

    setCaptureButtonListener(async () => {
      const maskRect = simpleCameraModalElement.querySelector('.mask-rect');
      const svgRect = maskRect.getBoundingClientRect();
      // const photo = await simpleCameraImageCapture.takePhoto();
      // const photo = takePhoto();
      const imageBitmap = await takePhoto();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      simpleCameraModal.hide();
      // simpleCameraTrack.stop();
      closeCamera();
      
      let scale, offsetX, offsetY;
      // プレビュー画面と実際の画像のアスペクト比を比較し、どちらの辺が基準になるか決定
      if (imageBitmap.width / imageBitmap.height > simpleCameraPreview.offsetWidth / simpleCameraPreview.offsetHeight) {
        // 画像は高さを基準にプレビュー領域を覆う
        scale = imageBitmap.height / simpleCameraPreview.offsetHeight;
        offsetX = (simpleCameraPreview.offsetWidth - (imageBitmap.width / scale)) / 2;
        offsetY = 0;
      } else {
        // 画像は幅を基準にプレビュー領域を覆う
        scale = imageBitmap.width / simpleCameraPreview.offsetWidth;
        offsetX = 0;
        offsetY = (simpleCameraPreview.offsetHeight - (imageBitmap.height / scale)) / 2;
      }

      // プレビュー上のmaskRectの実際の画像上での相対位置を計算
      const realX = (svgRect.left - simpleCameraPreview.offsetLeft - offsetX) * scale;
      const realY = (svgRect.top - simpleCameraPreview.offsetTop - offsetY) * scale;
      const realWidth = svgRect.width * scale;
      const realHeight = svgRect.height * scale;

      // CanvasのサイズをmaskRectのサイズに合わせる
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;

      // imageBitmapから実際のmaskRectの範囲だけを切り出して描画
      // 注意: トリミングされた範囲をキャンバスにフィットさせるため、
      // drawImageの最後の4つのパラメーターはキャンバスのサイズを使用します。
      ctx.drawImage(imageBitmap, realX, realY, realWidth, realHeight, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        console.log("blob", blob);
        // const result = await processImage(blob);
        const imageUrl = URL.createObjectURL(blob);
        console.log('image:', imageUrl);
        // searchQuery.value = result.text;
        // // 新しい 'input' イベントを作成
        // const event = new Event('input', {
        //   bubbles: true, // イベントをバブリングさせる
        //   cancelable: true, // イベントをキャンセル可能にする
        // });

        // // テキストエリア要素でイベントを発火
        // searchQuery.dispatchEvent(event);
      }, 'image/png');
    }, simpleCameraModalElement, '.capture-button');
  });
  
  // 撮影ボタンクリック時の処理
  // simpleCameraCaptureButton.addEventListener("click", async () => {
  //   const maskRect = simpleCameraModalElement.querySelector('.mask-rect');
  //   const svgRect = maskRect.getBoundingClientRect();
  //   // const photo = await simpleCameraImageCapture.takePhoto();
  //   // const photo = takePhoto();
  //   const imageBitmap = await takePhoto();
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');

  //   simpleCameraModal.hide();
  //   // simpleCameraTrack.stop();
  //   closeCamera();
    
  //   // プレビューと実際の写真のアスペクト比を比較
  //   const previewAspectRatio = simpleCameraPreview.offsetWidth / simpleCameraPreview.offsetHeight;
  //   const imageAspectRatio = imageBitmap.width / imageBitmap.height;

  //   // 実際の画像の表示領域を計算
  //   let displayWidth, displayHeight, offsetX, offsetY;
  //   if (previewAspectRatio > imageAspectRatio) {
  //       displayHeight = simpleCameraPreview.offsetHeight;
  //       displayWidth = displayHeight * imageAspectRatio;
  //       offsetX = (simpleCameraPreview.offsetWidth - displayWidth) / 2;
  //       offsetY = 0;
  //   } else {
  //       displayWidth = simpleCameraPreview.offsetWidth;
  //       displayHeight = displayWidth / imageAspectRatio;
  //       offsetX = 0;
  //       offsetY = (simpleCameraPreview.offsetHeight - displayHeight) / 2;
  //   }

  //   // プレビュー上のmaskRectの相対位置を再計算
  //   const adjustedX = (svgRect.left - simpleCameraPreview.offsetLeft - offsetX) * (imageBitmap.width / displayWidth);
  //   const adjustedY = (svgRect.top - simpleCameraPreview.offsetTop - offsetY) * (imageBitmap.height / displayHeight);
  //   const adjustedWidth = svgRect.width * (imageBitmap.width / displayWidth);
  //   const adjustedHeight = svgRect.height * (imageBitmap.height / displayHeight);

  //   // CanvasのサイズをmaskRectのサイズに合わせる
  //   canvas.width = svgRect.width;
  //   canvas.height = svgRect.height;

  //   // imageBitmapから調整したmaskRectの範囲だけを切り出して描画
  //   ctx.drawImage(imageBitmap, adjustedX, adjustedY, adjustedWidth, adjustedHeight, 0, 0, svgRect.width, svgRect.height);
    
  //   canvas.toBlob(async (blob) => {
  //     console.log("blob", blob);
  //     // const result = await processImage(blob);
  //     const imageUrl = URL.createObjectURL(blob);
  //     console.log('image:', imageUrl);
  //     // searchQuery.value = result.text;
  //     // // 新しい 'input' イベントを作成
  //     // const event = new Event('input', {
  //     //   bubbles: true, // イベントをバブリングさせる
  //     //   cancelable: true, // イベントをキャンセル可能にする
  //     // });

  //     // // テキストエリア要素でイベントを発火
  //     // searchQuery.dispatchEvent(event);
  //   }, 'image/png');
  // });

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

  imageCircle.addEventListener('click', function () {
    inputImageButton.click();
  });
  
  // グローバル変数としてオリジナルの画像ファイルを保持
  let originalImageFile = null;

  // 画像が選択されたらプレビューに表示し、ファイルを保持
  inputImageButton.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      instagramModal.hide();
      trimmingImageModal.show();
      initResizableRect(resizableRectsTrim, lightDarkAreasTrim, imagePreview);

      setBackButtonListener(async () => {
        // ここに戻るボタンが押されたときの処理を記述
        if (trimmingImageModal._isShown == true) {
          const preview = trimmingImageModalElement.querySelector('.preview');
          preview.src = '';
          inputImageButton.value = '';
          trimmingImageModal.hide();
          instagramModal.show();
        }
      }, trimmingImageModalElement, '.return-from-trimming');
      
      setWriteOutButtonListener(async () => {
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
            //   searchQuery.value = result.text;

            //   // 新しい 'input' イベントを作成して発火
            //   const event = new Event('input', {
            //     bubbles: true,
            //     cancelable: true,
            //   });
            //   searchQuery.dispatchEvent(event);
            //   trimmingImageModal.hide();
            // }
          }, 'image/png');
        };
      }, trimmingImageModalElement, '.write-out-image');
    }
  });

  // "読み込む"ボタンのクリックイベント
  // trimmingImageModalElement.querySelector('.write-out-image').addEventListener('click', function() {
  //   const previewImage = trimmingImageModalElement.querySelector('.preview');
  //   const maskRect = trimmingImageModalElement.querySelector('.mask-rect');
  
  //   // canvas要素を作成
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  
  //   // プレビュー画像とコンテナのアスペクト比を計算
  //   const imageAspectRatio = imagePreview.naturalWidth / imagePreview.naturalHeight;
  //   const containerAspectRatio = imagePreview.offsetWidth / imagePreview.offsetHeight;
  
  //   // 実際の表示サイズとコンテナ内でのオフセットを計算
  //   let renderWidth, renderHeight, offsetX, offsetY;
  //   if (containerAspectRatio > imageAspectRatio) {
  //     // コンテナの幅が画像の幅よりも広い場合
  //     renderHeight = imagePreview.offsetHeight;
  //     renderWidth = imageAspectRatio * renderHeight;
  //     offsetX = (imagePreview.offsetWidth - renderWidth) / 2;
  //     offsetY = 0;
  //   } else {
  //     // コンテナの高さが画像の高さよりも高い場合
  //     renderWidth = imagePreview.offsetWidth;
  //     renderHeight = renderWidth / imageAspectRatio;
  //     offsetX = 0;
  //     offsetY = (imagePreview.offsetHeight - renderHeight) / 2;
  //   }
  
  //   // SVG内でのmaskRectの位置とサイズを取得
  //   const svgRect = maskRect.getBoundingClientRect();
  
  //   // 実際の座標を計算
  //   const x = (svgRect.left - imagePreview.offsetLeft - offsetX) * (imagePreview.naturalWidth / renderWidth);
  //   const y = (svgRect.top - imagePreview.offsetTop - offsetY) * (imagePreview.naturalHeight / renderHeight);
  //   const width = svgRect.width * (imagePreview.naturalWidth / renderWidth);
  //   const height = svgRect.height * (imagePreview.naturalHeight / renderHeight);
  
  //   // canvasのサイズをmaskRectのサイズに合わせる
  //   canvas.width = svgRect.width;
  //   canvas.height = svgRect.height;
  
  //   // 画像をロードして切り取り範囲を描画
  //   const image = new Image();
  //   image.src = imagePreview.src;

  //   // 画像をトリミングして処理する部分
  //   image.onload = async function() {
  //     // 切り取り範囲をキャンバスに描画
  //     ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

  //     // canvasからblobを生成
  //     canvas.toBlob(async (blob) => {
  //       // processImage関数でOCR処理
  //       // const result = await processImage(blob);
  //       const imageUrl = URL.createObjectURL(blob);
  //       console.log('image:', imageUrl);
  //       // if (result && result.text) {
  //       //   searchQuery.value = result.text;

  //       //   // 新しい 'input' イベントを作成して発火
  //       //   const event = new Event('input', {
  //       //     bubbles: true,
  //       //     cancelable: true,
  //       //   });
  //       //   searchQuery.dispatchEvent(event);
  //       //   trimmingImageModal.hide();
  //       // }
  //     }, 'image/png');
  //   };
  // });
});

function setBackButtonListener(listener, element, buttonSelector) {
  var returnButton = element.querySelector(buttonSelector);

  // 以前のイベントリスナーを削除
  returnButton.replaceWith(returnButton.cloneNode(true));

  // 新しいイベントリスナーを追加
  returnButton = element.querySelector(buttonSelector);
  returnButton.addEventListener('click', listener);
}

function convertNewlines(text) {
  return text.replace(/\n/g, '<br>');
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
