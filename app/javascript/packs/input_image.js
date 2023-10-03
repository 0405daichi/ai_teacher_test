// // app/javascript/packs/input_image.js

// import { Modal } from 'bootstrap';

// document.addEventListener('DOMContentLoaded', function () {
//   const questionInputContainer = document.getElementById("question-form-container");
//   const searchInputContainer = document.getElementById("search-form-container");
//   const openImageModalButtonQuestion = questionInputContainer.querySelector(".open-image-modal-btn");
//   console.log(openImageModalButtonQuestion);
//   const openImageModalButtonSearch = searchInputContainer.querySelector(".open-image-modal-btn");
//   console.log(openImageModalButtonSearch);
//   const modalElement = document.getElementById('image-upload-modal');
//   const selectFromLibraryButton = document.getElementById('select-from-library-button');
//   const imageFileInput = document.getElementById('image-file-input');
//   const captureFromCameraButton = document.getElementById('capture-from-camera-button');
//   const cameraInput = document.getElementById('camera-input');
//   const modalBody = document.querySelector('.image-upload-modal-body');

//   if (modalElement) {
//     const imageUploadModal = new Modal(modalElement);

//     openImageModalButtonQuestion.addEventListener('click', function () {
//       console.log('Open image modal button clicked.');
//       imageUploadModal.show();
//     });
    
//     openImageModalButtonSearch.addEventListener('click', function () {
//       console.log('Open image modal button clicked.');
//       imageUploadModal.show();
//     });

//     selectFromLibraryButton.addEventListener('click', function () {
//       console.log('Select from library button clicked.');
//       imageFileInput.click();
//     });

//     captureFromCameraButton.addEventListener('click', function () {
//       console.log('Capture from camera button clicked.');
//       cameraInput.click();
//     });

//     const displayImagePreview = function (file, elementToAppend) {
//       console.log(elementToAppend);
//       // ファイルが画像であることを確認
//       if (!file.type.startsWith('image/')) {
//         console.log('Not an image file.');
//         return;
//       }

//       // FileReaderを作成
//       var reader = new FileReader();

//       // ファイルをデータURLとして読み込む
//       reader.readAsDataURL(file);

//       // ファイルが読み込まれたときの処理
//       reader.onload = function(e) {
//         // console.log(e.target.result);
//         // 画像をプレビューとして表示する
//         var img = document.createElement('img');
//         img.src = e.target.result;
//         console.log('Image created with src:', img.src);
//         img.classList.add('img-preview'); // プレビュー画像のスタイル調整のためのクラスを追加

//         // モーダル内の既存のプレビューを削除
//         const existingPreview = document.querySelector('.img-preview');
//         if (existingPreview) {
//           elementToAppend.remove();
//           console.log('Removed existing preview.');
//         }

//         // モーダルに画像を追加
//         elementToAppend.appendChild(img);

//         // "問題文を書き出す" ボタンを作成
//         var button = document.createElement('button');
//         button.classList.add('btn', 'write-out', 'btn-primary', 'mt-2');
//         button.textContent = '問題文を書き出す';

//         button.addEventListener('click', function() {
//           console.log('Extracting text from image...');
        
//           // フォームデータを作成
//           const formData = new FormData();
//           formData.append('image', file); // ファイルを追加
        
//           // バックエンドにリクエストを送信
//           fetch('/ocr', {
//             method: 'POST',
//             body: formData,
//           })
//             .then(response => response.json())
//             .then(data => {
//               console.log('Response:', data);
        
//               // モーダルを閉じる
//               imageUploadModal.hide();
              
//               // 抽出したテキストを質問入力フォームに表示する
//               if (questionInputContainer.style.display == "block"){
//                 var questionForm = questionInputContainer.querySelector('#question-input');
//                 console.log(questionForm);
//                 questionForm.value = data.text;
//               } else if (searchInputContainer.style.display == "block"){
//                 var questionForm = searchInputContainer.querySelector('#search-query');
//                 questionForm.value = data.text;
//               }
        
//               // モーダル内のボタンを削除
//               const existingButton = modalBody.querySelector('.write-out');
//               if (existingButton) {
//                 existingButton.remove();
//               }
//             })
//             .catch(error => {
//               console.error('Error:', error);
//             });
//         });

//         // モーダルにボタンを追加
//         const existingButton = document.querySelector('.btn-primary');
//         if (existingButton) {
//           existingButton.remove();
//         }
//         modalBody.appendChild(button);
//       };
//     };

//     imageFileInput.addEventListener('change', function(e) {
//       console.log("ok");
//       // 選択されたファイルを取得
//       var file = e.target.files[0];
//       displayImagePreview(file, modalBody);
//     });

//     cameraInput.addEventListener('change', function(e) {
//       // 撮影された写真を取得
//       var file = e.target.files[0];
//       displayImagePreview(file, modalBody);
//     });

//     // モーダルが閉じる際のイベントハンドラを追加
//     modalElement.addEventListener('hidden.bs.modal', function () {
//       // モーダル内のプレビュー画像を削除
//       const existingPreview = document.querySelector('.img-preview');
//       if (existingPreview) {
//         existingPreview.remove();
//       }

//       // モーダル内のボタンを削除
//       const existingButton = document.querySelector('.btn-primary');
//       if (existingButton) {
//         existingButton.remove();
//       }

//       // 選択したファイル
//       imageFileInput.value = null;
//       cameraInput.value = null;
//     });
//   }
// });
