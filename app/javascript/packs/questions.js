// // app/javascript/packs/questions.js

// import { Modal } from 'bootstrap';

// document.addEventListener("turbolinks:load", function () {
//   // 新しい画像要素を選択する
//   const CompanyImageElement = document.getElementById("home-image");
//   const newImageElement = document.getElementById("second-home-image");

//   // モーダル要素を選択する
//   const modalElement = document.getElementById("input-options-modal");

//   // 新しいブートストラップモーダルインスタンスを作成
//   var inputOptionsModal = new Modal(modalElement);

//   // モーダルのボタンと各入力フォームを選択する
//   const questionFormContainer = document.getElementById("question-form-container");
//   const searchInputButton = document.getElementById("open-search-modal-button");
//   const questionInputButton = document.getElementById("open-question-modal-button");
//   const searchFormContainer = document.getElementById("search-form-container");

//   // 新しい画像要素にクリックイベントリスナーを追加する
//   newImageElement.addEventListener("click", function () {
//     // クリックイベントが発生したら、モーダルを表示する
//     inputOptionsModal.show();
//   });

//   // 書いて入力ボタンにクリックイベントリスナーを追加する
//   questionInputButton.addEventListener("click", function () {
//     if (searchFormContainer.style.display == "block"){
//       searchFormContainer.style.display = "none";
//     }
//     // クリックイベントが発生したら、現在のモーダルを閉じて、質問フォームを表示する
//     inputOptionsModal.hide();
//     questionFormContainer.style.display = "block";
    
//     // 画像を小さくし、右上に移動する
//     CompanyImageElement.classList.add("small-image");
    
//     // コンテナの高さを変更する
//     const containerElement = document.querySelector(".container");
//     containerElement.style.height = "5vh";
//   });
  
//   // 検索ボタンにクリックイベントリスナーを追加する
//   searchInputButton.addEventListener("click", function () {
//     if (questionFormContainer.style.display == "block"){
//       questionFormContainer.style.display = "none";
//     }
//     // クリックイベントが発生したら、検索フォームを表示する
//     inputOptionsModal.hide();
//     searchFormContainer.style.display = "block";

//     // 画像を小さくする
//     CompanyImageElement.classList.add("small-image");

//     // コンテナの高さを変更する
//     const containerElement = document.querySelector(".container");
//     containerElement.style.height = "5vh";
//   });

//   const questionForm = document.getElementById("question-form");

//   if (questionForm) {
//     // 既存のイベントリスナーがある場合は削除してから新しいイベントリスナーを登録
//     questionForm.removeEventListener("submit", onSubmit);
//     questionForm.addEventListener("submit", onSubmit);
//   }
// });

// function onSubmit(event) {
//   console.log("Submit event listener called");
//   event.preventDefault();
//   const formData = new FormData(event.target);

//   // スピナーを表示
//   document.getElementById("loading-spinner").classList.remove("d-none");

//   // フォームデータを非同期で送信
//   console.log("Sending request to /questions/get_answer");
//   fetch("/questions/get_answer", {
//     method: "POST",
//     body: formData,
//     headers: {
//       "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content
//     },
//   })
//     .then((response) => response.json())
//     .then((question) => {
//       console.log("Question submitted:", question);
//       displayQuestionCard(question);

//       // スピナーを非表示に戻す
//       document.getElementById("loading-spinner").classList.add("d-none");
//     })
//     .catch((error) => {
//       console.error("Submit question failed:", error);

//       // エラーが発生した場合もスピナーを非表示に戻す
//       document.getElementById("loading-spinner").classList.add("d-none");
//     });
// }

// // 新しい質問のカードを表示する関数
// function displayQuestionCard(question) {
//   const formattedQuestion = convertNewlines(question.content);
//   const formattedAnswer = convertNewlines(question.answer.content);
//   const card = `
//     <div class="col-md-6 mb-3">
//       <div class="card">
//         <div class="card-body">
//           <p class="card-text">${formattedQuestion}</p>
//           <p class="card-text"><strong>回答：</strong>${formattedAnswer}</p>
//         </div>
//       </div>
//     </div>`;
//   document.getElementById("questions-list").insertAdjacentHTML("afterbegin", card);
// }

// function convertNewlines(text) {
//   return text.replace(/\n/g, '<br>');
// }
