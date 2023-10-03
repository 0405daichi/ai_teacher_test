// //app/javascript/packs/liked_questions.js

// document.addEventListener('turbolinks:load', function() {
//   const likedQuestionsButton = document.getElementById('liked-questions-button');
//   const likedQuestionsPage = document.querySelector('.liked-questions-page');
//   const userPage = document.querySelector('.user-page');

//   if (likedQuestionsButton) {
//     likedQuestionsButton.addEventListener('click', function(event) {
//       event.preventDefault();

//       // いいね一覧ページがまだ表示されていなければスライドインさせます
//       if (likedQuestionsPage.style.transform === 'translateX(100%)' || likedQuestionsPage.style.transform === '') {
//         setTimeout(() => {
//           // マイページが開いていれば閉じる
//           if (userPage.style.transform === 'translateX(0%)') {
//             userPage.style.transform = 'translateX(100%)';
//           }

//           likedQuestionsPage.style.transform = 'translateX(0%)';

//           // ユーザIDを取得し、そのユーザがいいねした質問一覧を非同期で取得
//           const userId = likedQuestionsButton.dataset.userId;
//           fetch(`/users/${userId}/likes`)
//             .then(response => response.text())
//             .then(html => {
//               // いいねした質問一覧のページに取得したHTMLを追加
//               likedQuestionsPage.innerHTML = html;
//             })
//             .catch(error => console.error('Error:', error));
//         }, 0);
//       }
//       // いいね一覧ページがすでに表示されている場合は、スライドアウトさせます
//       else {
//         setTimeout(() => {
//           likedQuestionsPage.style.transform = 'translateX(100%)';
//         }, 0);
//       }
//     });
//   }
// });
