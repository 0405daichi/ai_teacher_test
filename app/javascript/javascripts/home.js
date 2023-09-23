// app/javascript/javascripts/home.js

import logo from '../images/yahoo-rogo-removebg-preview.png';
import character from '../images/math.png';
import { Modal } from 'bootstrap';
import drawCanvas from './helpers/drawCanvas';
import isInCharacterRect from './helpers/isInCharacterRect';

document.addEventListener('turbolinks:load', () => {
  const canvas = document.querySelector('.homeCanvas');
  const modalElement = document.getElementById('questionOrSearch');
  const myModal = new Modal(modalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  const questionModalElement = document.getElementById('questionModal');
  const questionModal = new Modal(questionModalElement, {
    keyboard: false,
    backdrop: 'true'
  });
  const searchModalElement = document.getElementById('searchModal');
  const searchModal = new Modal(searchModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  const questionButton = document.getElementById('questionButton');
  const questionModalButton = document.getElementById('questionModalButton')
  if (questionButton) {
    questionButton.addEventListener('click', () => {
      myModal.hide(); // 最初のモーダルを閉じます
      questionModal.show(); // 質問モーダルを表示します
      questionModalButton.style.display = "block";
    });
  }
  
  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      myModal.hide(); // 最初のモーダルを閉じます
      searchModal.show(); // 検索モーダルを表示します
    });
  }

  // 質問オプション用エリア
  const howToAnswer = document.querySelectorAll('.how-to-answer');
  howToAnswer.forEach(function(value){value.style.display = 'block';});

  // 言語選択エリア
  const selectLanguageArea = document.querySelectorAll('.selectLanguage');
  selectLanguageArea.forEach(function(value){value.style.display = 'none';});

  // 直訳・翻訳オプション選択時の設定エリア
  const howToTranslateArea = document.querySelectorAll('.how-to-translate');
  howToTranslateArea.forEach(function(value){value.style.display = 'none';});

  // 要約オプション用エリア
  const wrapUpOptionsArea = document.querySelectorAll('.wrap-up-options');
  wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});

  const characterCountSelect = document.querySelectorAll('#character-count');
  characterCountSelect.forEach(function(value){value.style.display = 'block';});
  const wordCountSelect = document.querySelectorAll('#word-count');
  wordCountSelect.forEach(function(value){value.style.display = 'none';});

  // 質問フォーム
  const questionInputForm = document.querySelectorAll('questionInputForm');

  // オプションの選択
  const options = document.querySelectorAll('.option-carousel .option');
  const selectedOption = document.querySelector('.selected-option');

  const ansOptions = document.querySelectorAll('.container .answerOption');
  
  if (ansOptions){
    ansOptions.forEach(option => {
      option.addEventListener('click', () => {
        ansOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      })
    })
  }
  
  const translateOptions = document.querySelectorAll('.container .translateOption');

  if (translateOptions){
    translateOptions.forEach(option => {
      option.addEventListener('click', () => {
        translateOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      })
    })
  }
  
  if (options) {
    options.forEach(option => {
      option.addEventListener('click', () => {
        // すべてのオプションから 'active' クラスを削除
        options.forEach(opt => opt.classList.remove('active'));

        // クリックしたオプションに 'active' クラスを追加
        option.classList.add('active');

        if (option.dataset.option === '質問'){
          selectedOption.value = '質問';
          setPlaceholder(selectedOption.value, questionInputForm);
          howToAnswer.forEach(function(value){value.style.display = 'block';});
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});
          selectLanguageArea.forEach(function(value){value.style.display = 'none';})
          howToTranslateArea.forEach(function(value){value.style.display = 'none';})
        }
        // 直訳・翻訳オプションが選択されたときに設定領域を表示
        else if (option.dataset.option === '直訳・翻訳') {
          selectedOption.value = '直訳・翻訳';
          setPlaceholder(selectedOption.value, questionInputForm);
          selectLanguageArea.forEach(function(value){value.style.display = 'block';})
          howToTranslateArea.forEach(function(value){value.style.display = 'block';})
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});
          howToAnswer.forEach(function(value){value.style.display = 'none';});

          // 言語の初期値（適切な初期値を設定してください）
          let fromLanguage = "English";
          let toLanguage = "Japanese";

          // HTMLCollectionまたはNodeListを配列に変換
          const fromLanguageSelects = Array.from(document.querySelectorAll('.form-select[name="fromLanguage"]'));
          const toLanguageSelects = Array.from(document.querySelectorAll('.form-select[name="toLanguage"]'));
          const switchLanguageButtons = Array.from(document.querySelectorAll('#switchLanguage'));

          // fromLanguage用のイベントリスニング
          fromLanguageSelects.forEach((fromLanguageSelect, index) => {
            fromLanguageSelect.addEventListener('change', function(event) {
              const oldFromLanguage = fromLanguage;
              fromLanguage = event.target.value;

              if (fromLanguage === toLanguage) {
                toLanguage = oldFromLanguage;
                toLanguageSelects[index].value = toLanguage;  // 同じインデックスのtoLanguageSelect要素を更新
              }
            });
          });

          // toLanguage用のイベントリスニング
          toLanguageSelects.forEach((toLanguageSelect, index) => {
            toLanguageSelect.addEventListener('change', function(event) {
              const oldToLanguage = toLanguage;
              toLanguage = event.target.value;

              if (fromLanguage === toLanguage) {
                fromLanguage = oldToLanguage;
                fromLanguageSelects[index].value = fromLanguage;  // 同じインデックスのfromLanguageSelect要素を更新
              }
            });
          });

          // switchLanguage用のイベントリスニング
          switchLanguageButtons.forEach((switchLanguageButton, index) => {
            switchLanguageButton.addEventListener('click', function() {
              const temp = fromLanguage;
              fromLanguage = toLanguage;
              toLanguage = temp;

              fromLanguageSelects[index].value = fromLanguage;  // 同じインデックスのfromLanguageSelect要素を更新
              toLanguageSelects[index].value = toLanguage;      // 同じインデックスのtoLanguageSelect要素を更新
            });
          });
        } 
        else if (option.dataset.option === '口語訳'){
          selectedOption.value = '口語訳';
          setPlaceholder(selectedOption.value, questionInputForm);
          selectLanguageArea.forEach(function(value){value.style.display = 'none';})
          howToTranslateArea.forEach(function(value){value.style.display = 'none';})
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});
          howToAnswer.forEach(function(value){value.style.display = 'none';});
        }
        else if (option.dataset.option === '現代語訳'){
          selectedOption.value = '現代語訳';
          setPlaceholder(selectedOption.value, questionInputForm);
          selectLanguageArea.forEach(function(value){value.style.display = 'none';})
          howToTranslateArea.forEach(function(value){value.style.display = 'none';})
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});
          howToAnswer.forEach(function(value){value.style.display = 'none';});
        }
        // 要約オプションが選択されたときに設定領域を表示
        else if (option.dataset.option === '要約') {
          selectedOption.value = '要約';
          setPlaceholder(selectedOption.value, questionInputForm);
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'block';});
          selectLanguageArea.forEach(function(value){value.style.display = 'none';})
          howToTranslateArea.forEach(function(value){value.style.display = 'none';})
          howToAnswer.forEach(function(value){value.style.display = 'none';});
          
          // HTMLCollectionまたはNodeListを配列に変換
          const delimiterSelect = Array.from(document.querySelectorAll('.form-select[name="delimiter"]'));
          const wordCountSelect = Array.from(document.querySelectorAll('.form-select[id="word-count"]'));
          const characterCountSelect = Array.from(document.querySelectorAll('.form-select[id="character-count"]'));
          delimiterSelect.forEach(delimiter => {
            delimiter.addEventListener('change', function(event) {
              // この要素が属している.wrap-up-options要素を取得
              const wrapUpOptions = this.closest('.wrap-up-options');

              // wrapUpOptions内の要素に対してのみ操作を行う
              const wordCountText = wrapUpOptions.querySelector('#word-count-text');
              const characterCountText = wrapUpOptions.querySelector('#character-count-text');
              if (delimiter.value === '日本語') {
                characterCountText.style.display = 'block';
                wordCountText.style.display = 'none';
              } else {
                wordCountText.style.display = 'block';
                characterCountText.style.display = 'none';
              }

              if (event.target.value === '日本語') {
                characterCountSelect.forEach(function(value){value.style.display = 'block';});
                characterCountText.textContent = '文字';
                wordCountSelect.forEach(function(value){value.style.display = 'none';});
                wordCountText.textContent = '';
              } else {
                wordCountSelect.forEach(function(value){value.style.display = 'block';});
                wordCountText.textContent = '単語';
                characterCountSelect.forEach(function(value){value.style.display = 'none';});
                characterCountText.textContent = '';
              }
            });
          });
        }
        else if (option.dataset.option === '添削') {
          selectedOption.value = '添削';
          questionInputForm.placeholder = "添削したい文章を入力してください。";
          selectLanguageArea.forEach(function(value){value.style.display = 'none';})
          howToTranslateArea.forEach(function(value){value.style.display = 'none';})
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});
          howToAnswer.forEach(function(value){value.style.display = 'none';});
        }
        else {
          selectLanguageArea.forEach(function(value){value.style.display = 'none';})
          howToTranslateArea.forEach(function(value){value.style.display = 'none';})
          wrapUpOptionsArea.forEach(function(value){value.style.display = 'none';});
          howToAnswer.forEach(function(value){value.style.display = 'none';});
        }
      });
    });
  }

  const photoModalElement = document.getElementById('inputPhotoModal');
  const photoModal = new Modal(photoModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  // 質問モーダルの閉じるボタン
  const questionCloseButton = document.getElementById('closeQuestionButton');
  if (questionCloseButton) {
    questionCloseButton.addEventListener('click', (event) => {
      if (questionInputForm.value) {
        const result = window.confirm('入力した内容は破棄されます。');
        if (result) {
          questionModal.hide();
          questionModalButton.style.display = "block";
        } else {
          event.preventDefault();
        }
      } else {
        questionModal.hide();
        questionModalButton.style.display = "block";
      }
    });
  }

  // 検索モーダルの閉じるボタン
  const searchCloseButton = document.getElementById('closeSearchButton');
  const searchInputForm = document.getElementById('searchInputForm');
  if (searchCloseButton) {
    searchCloseButton.addEventListener('click', (event) => {
      if (searchInputForm.value) {
        const result = window.confirm('入力した内容は破棄されます。');
        if (result) {
          searchModal.hide();
        } else {
          event.preventDefault();
        }
      } else {
        searchModal.hide();
      }
    });
  }

  document.querySelectorAll('textarea').forEach(function (elem) {
    elem.addEventListener('input', function () {
      if (elem.value === ""){
        if (elem.id === "questionInputForm"){
          setPlaceholder(selectedOption.value, questionInputForm);
        } else if (elem.id === "searchInputForm"){
          setPlaceholder('検索', searchInputForm);
        }
      }
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });

  // モーダルの参照を保存する変数を追加
  let previousModal = null;

  const photoButtons = document.querySelectorAll('.photoButton');
  if (photoButtons) {
    photoButtons.forEach(button => {
      button.addEventListener('click', () => {
        // それぞれのモーダルを閉じ、前のモーダルを保存
        if (questionModal._isShown) {
          previousModal = questionModal;
          console.log(previousModal);
          questionModal.hide();
        } else if (searchModal._isShown) {
          previousModal = searchModal;
          searchModal.hide();
        }

        // 写真入力モーダルを開きます
        photoModal.show();
      });
    });
  }

  // '戻る'ボタンが押されたら、前のモーダルを表示する
  const backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (previousModal) {
        // 写真入力モーダルを閉じます
        photoModal.hide();

        // 前のモーダルを表示します
        previousModal.show();
      }
    });
  }

  // '写真を選ぶ' ボタンがクリックされたときに画像を選択するダイアログを開く
  const selectPhotoButton = document.getElementById('selectPhoto');
  const photoInput = document.getElementById('photoInput');
  if (selectPhotoButton) {
    selectPhotoButton.addEventListener('click', () => {
      if (photoInput) {
        photoInput.click();
      }
    });
  }

  // '写真を撮る' ボタンがクリックされたときにカメラを開く
  // const takePhotoButton = document.getElementById('takePhoto');
  // if (takePhotoButton) {
  //   takePhotoButton.addEventListener('click', () => {
  //     if (photoInput) {
  //       photoInput.setAttribute('capture', 'camera');
  //       photoInput.click();
  //     }
  //   });
  // }

  // カメラプレビュー、撮影ボタン、写真プレビュー要素を取得
  // const cameraPreview = document.getElementById("cameraPreview");
  // const captureButton = document.getElementById("captureButton");
  // const writeButton = document.getElementById("writeButton");
  // const imageInputButton = document.getElementById("imageInputButton");
  // const preview = document.getElementById("preview");
  // const maskRect = document.getElementById("maskRect");

  let stream, imageCapture;

  // 「写真を撮る」ボタンがクリックされたときの処理
  // document.getElementById("takePhoto").addEventListener("click", async () => {
  //   const cameraModalElement = document.getElementById('cameraModal');
  //   const cameraModal = new Modal(cameraModalElement, {
  //     keyboard: false,
  //     backdrop: 'true'
  //   });
  //   cameraModal.show();
  //   // カメラのストリームを取得
  //   stream = await navigator.mediaDevices.getUserMedia({
  //     video: {
  //       facingMode: 'environment', // 外部カメラの使用
  //       width: 1280, // 明示的な幅設定
  //       height: 720  // 明示的な高さ設定
  //     }
  //   });
  //   cameraPreview.srcObject = stream;

  //   // カメラプレビューと撮影ボタンを表示
  //   cameraPreview.style.display = "block";
  //   captureButton.style.display = "block";
  //   writeButton.style.display = "block";
  //   imageInputButton.style.display = "block";

  //   // ImageCaptureオブジェクトを作成
  //   const track = stream.getVideoTracks()[0];
  //   imageCapture = new ImageCapture(track);

  //   // 写真プレビューを非表示
  //   preview.style.display = "none";
  // });

  // 「撮影」ボタンがクリックされたときの処理
  // captureButton.addEventListener("click", async () => {
  //   // 画像をキャプチャ
  //   const photo = await imageCapture.takePhoto({
  //     imageWidth: 1280, // 明示的な幅設定
  //     imageHeight: 720  // 明示的な高さ設定
  //   });

  //   // Blobを読み込んで表示
  //   const imageBitmap = await createImageBitmap(photo);

  //   // 元の画像をプレビューに表示
  //   const originalImageUrl = URL.createObjectURL(photo);
  //   preview.src = originalImageUrl;

  //   const canvas = document.createElement("canvas");
  //   const ctx = canvas.getContext("2d");

  //   // カメラの実際の解像度を取得
  //   const track = stream.getVideoTracks()[0];
  //   const settings = track.getSettings();

  //   // 画面とカメラの解像度の比率を計算
  //   const ratioX = settings.width / window.innerWidth;
  //   const ratioY = settings.height / window.innerHeight;

  //   // maskRectの位置とサイズを取得（SVG内の座標系で）
  //   const svgRect = maskRect.getBoundingClientRect();  

  //   // 実際の座標を計算（解像度の比率を考慮）
  //   const x = svgRect.x * ratioX;
  //   const y = svgRect.y * ratioY;
  //   const width = svgRect.width * ratioX;
  //   const height = svgRect.height * ratioY;

  //   // canvasのサイズをmaskRectのサイズに合わせる（解像度の比率を考慮）
  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;

  //   // imageBitmapからmaskRectの範囲だけを切り出して描画
  //   ctx.drawImage(imageBitmap, x, y, width, height, svgRect.x, svgRect.y, svgRect.width, svgRect.height);

  //   // canvasからBlobを生成
  //   canvas.toBlob((blob) => {
  //     const formData = new FormData();
  //     formData.append('image', blob, 'image.png'); // Blobをフォームデータに追加
      
  //     /* 画像読み込み処理 */
  //     fetch('/ocr', {
  //       method: 'POST',
  //       body: formData,
  //     })
  //       .then(response => response.json())
  //       .then(data => {
  //         console.log('Response:', data);
    
  //         // モーダルを閉じる
  //         imageUploadModal.hide();
          
  //         // 抽出したテキストを質問入力フォームに表示する
  //         if (questionInputContainer.style.display == "block"){
  //           var questionForm = questionInputContainer.querySelector('#question-input');
  //           console.log(questionForm);
  //           questionForm.value = data.text;
  //         } else if (searchInputContainer.style.display == "block"){
  //           var questionForm = searchInputContainer.querySelector('#search-query');
  //           questionForm.value = data.text;
  //         }
    
  //         // モーダル内のボタンを削除
  //         const existingButton = modalBody.querySelector('.write-out');
  //         if (existingButton) {
  //           existingButton.remove();
  //         }
  //       })
  //       .catch(error => {
  //         console.error('Error:', error);
  //       });
  //   }, 'image/png');

  //   // UIの切り替え
  //   cameraPreview.style.display = "none";
  //   captureButton.style.display = "none";
  //   preview.style.display = "block";

  //   // ストリームを停止
  //   stream.getTracks().forEach(track => track.stop());
  // });

  let file = null;
  const loadImageButton = document.getElementById('loadImage');
  const previewBody = document.getElementById('previewBody');
  // 画像が選択されたらプレビューを表示する
  if (photoInput) {
    photoInput.addEventListener('change', () => {
      file = photoInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewBody.style.display = 'block';
          const preview = document.getElementById('preview');
          if (preview) {
            preview.src = e.target.result;

            // プレビューが表示されたら「画像を読み込む」ボタンを表示する
            if (loadImageButton) {
              loadImageButton.style.display = 'block';
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // '画像を読み込む' ボタンが押されたらOCR分析を行い結果を質問欄に入力する
  if (loadImageButton) {
    loadImageButton.addEventListener('click', (e) => {
      if (previousModal) {
        // input要素が存在し、画像が設定されている場合
        if(photoInput && photoInput.value){
          // デフォルトのフォーム送信を防止
          e.preventDefault();
          
          // 写真入力モーダルを閉じる
          photoModal.hide();
          
          // '画像を読み込む' ボタンとプレビュー画像を隠す
          previewBody.style.display = 'none';
          loadImageButton.style.display = 'none';
          const preview = document.getElementById('preview');
          if (preview) {
            preview.src = '';
          }
  
          // 前のモーダルを表示する
          previousModal.show();
          
          // OCR分析の非同期通信
          if (file) {
            const formData = new FormData();
            formData.append('image', file);
  
            fetch('/ocr', {
              method: 'POST',
              body: formData,
              headers: {
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
              },
            })
            .then(response => response.json())
            .then(data => {
              // OCR結果を質問欄に入力する
              if (questionInputForm) {
                questionInputForm.value = data.text;
                questionInputForm.dispatchEvent(new Event('input', { bubbles: true }));
              }
            })
            .catch(error => console.error('Error:', error));
          }
        } else {
          // ユーザーに警告を表示
          alert("画像を選択してください");
        }
      }
    });
  }

  document.getElementById('questionForm').addEventListener('submit', function(e) {
    e.preventDefault(); // デフォルトの送信プロセスをキャンセル

    // 以降は同じコード
    var formData = new FormData(this);
    fetch('/questions/get_answer', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // 既存のモーダルを閉じる
      questionModal.hide();
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

  const modalBody = document.querySelector(".search-modal-body");

  searchInputForm.addEventListener("input", async function() {
    const query = this.value;

    try {
      const response = await fetch(`/questions/search?query=${query}`);
      if (response.ok) {
        const data = await response.json();
        modalBody.innerHTML = ""; // 既存のカードを削除

        // カードを追加
        data.similar_questions.forEach(function(item) {
          const question = item.question.content;
          const answer = item.answer.content;
          const similarity = item.similarity;
          modalBody.innerHTML += `
            <div class="card">
              <div class="card-header">類似度: ${similarity}</div>
              <div class="card-body">
                <h5 class="card-title">${question}</h5>
                <p class="card-text">${answer}</p>
              </div>
            </div>
          `;
        });
      } else {
        console.log("Network response was not ok.");
      }
    } catch (error) {
      console.log("Fetch error: ", error);
    }
  });

  // if (canvas) {
  //   const ctx = canvas.getContext('2d');
  //   const image = new Image();
  //   const characterImage = new Image();
  //   image.src = logo;
  //   characterImage.src = character;
  //   let characterRect = null;

  //   image.onload = function() {
  //     characterRect = drawCanvas(canvas, ctx, image, characterImage);
  //   };
  //   characterImage.onload = function() {
  //     characterRect = drawCanvas(canvas, ctx, image, characterImage);
  //   };

  //   canvas.addEventListener('click', function(event) {
  //     const rect = canvas.getBoundingClientRect();
  //     const x = event.clientX - rect.left - canvas.width/2;
  //     const y = event.clientY - rect.top - canvas.height/2;

  //     if (isInCharacterRect(characterRect, {x: x, y: y})) {
  //       myModal.show();
  //     }
  //   });

  //   window.addEventListener('resize', function() {
  //     characterRect = drawCanvas(canvas, ctx, image, characterImage);
  //   });
  // }
});

function setPlaceholder(selectedOption, inputForm) {
  switch (selectedOption) {
    case '質問':
      inputForm.placeholder = "問題や質問を入力してください。";
      break;
    case '直訳・翻訳':
      inputForm.placeholder = "訳したい文章や単語を入力してください。";
      break;
    case '口語訳':
      inputForm.placeholder = "口語訳したい文章や単語を入力してください。";
      break;
    case '現代語訳':
      inputForm.placeholder = "現代語訳したい文章や単語を入力してください。";
      break;
    case '要約':
      inputForm.placeholder = "要約したい文章を入力してください。";
      break;
    case '添削':
      inputForm.placeholder = "添削したい文章を入力してください。";
      break;
    case '検索':
      inputForm.placeholder = "見つけたい問題を入力してください。";
      break;
    default:
      break;
  }  
}
