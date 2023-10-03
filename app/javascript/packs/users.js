// // app/javascript/packs/users.js

// document.addEventListener('turbolinks:load', function() {
//   const userButton = document.getElementById('user-button');
//   const userPage = document.querySelector('.user-page');
//   const likedQuestionsPage = document.querySelector('.liked-questions-page');

//   if (userButton) {
//     userButton.addEventListener('click', function(event) {
//       event.preventDefault();

//       // マイページがまだ表示されていなければスライドインさせます
//       if (userPage.style.transform === 'translateX(100%)' || userPage.style.transform === '') {
//         setTimeout(() => {
//           // いいね一覧ページが開いていれば閉じる
//           if (likedQuestionsPage.style.transform === 'translateX(0%)') {
//             likedQuestionsPage.style.transform = 'translateX(100%)';
//           }
          
//           userPage.style.transform = 'translateX(0%)';
//         }, 0);
//       }
//       // マイページがすでに表示されている場合は、スライドアウトさせます
//       else {
//         setTimeout(() => {
//           userPage.style.transform = 'translateX(100%)';
//         }, 0);
//       }
//     });
//   }
// });
