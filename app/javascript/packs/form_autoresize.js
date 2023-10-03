// // app/javascript/packs/form_autoresize.js
// document.addEventListener("turbolinks:load", () => {
//   const inputArea = document.getElementById("search-input");

//   if (inputArea) {
//     inputArea.style.resize = "none"; // ユーザーがリサイズできないようにする

//     const resizeInputArea = () => {
//       inputArea.style.height = "auto"; // 入力エリアの高さをリセット
//       inputArea.style.height = inputArea.scrollHeight + "px"; // 入力エリアの高さを内容に合わせて調整
//     };

//     inputArea.addEventListener("input", resizeInputArea); // 入力エリアに対してイベントリスナーを追加
//     resizeInputArea(); // 初期表示時にサイズを調整
//   }
// });
