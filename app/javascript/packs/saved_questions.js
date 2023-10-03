// // app/javascript/packs/saved_questions.js

// document.addEventListener("turbolinks:load", () => {
//   setTimeout(() => {
//     const saveButtons = document.querySelectorAll('.save-button');
//     const modal = document.getElementById('loginModal');
//     const close = document.getElementById('modalClose');
//     const loginButton = document.getElementById('login-button');
//     const modalMessage = document.getElementById('modalMessage');

//     saveButtons.forEach((button) => {
//       button.addEventListener('click', async (event) => {
//         event.preventDefault();
//         event.stopPropagation();

//         const questionId = button.dataset.questionId;
//         const isSaved = button.dataset.tooltip === '保存を解除する';
//         const url = isSaved ? button.href : `/questions/${questionId}/save`;
//         const method = isSaved ? 'DELETE' : 'POST';

//         const response = await fetch(url, {
//           method: method,
//           headers: {
//             'X-Requested-With': 'XMLHttpRequest',
//             'Content-Type': 'application/json',
//             'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
//           },
//           credentials: 'same-origin'
//         });

//         if (response.ok) {
//           const data = await response.json();

//           if (data.status === 'success' && data.action === 'created') {
//             button.classList.remove('btn-primary');
//             button.classList.add('btn-secondary');
//             button.dataset.tooltip = '保存を解除する';
//             button.href = `/saved_questions/${data.save_id}/unsave`;
//           } else if (data.status === 'success') {
//             button.classList.remove('btn-secondary');
//             button.classList.add('btn-primary');
//             button.dataset.tooltip = '保存する';
//             button.href = `/questions/${questionId}/save`;
//           }
//         } else if (response.status === 422) {
//           const data = await response.json();
//           console.log(`Validation error - message: ${data.message}`);
//           alert('保存に失敗しました。');
//         } else {
//           console.log(`Fetch error - status code: ${response.status}`);
//           if (response.status === 401) {
//             modal.style.display = "block";
//             modalMessage.textContent = '保存をするにはログインが必要です。';
//           } else {
//             alert('保存に失敗しました。');
//           }
//         }
//       });
//     });

//     // ログインボタンがクリックされたときの挙動
//     loginButton.onclick = function() {
//       window.location.href = '/users/sign_in';
//     }

//     // モーダルのクローズボタンをクリックしたときの挙動
//     close.onclick = function() {
//       modal.style.display = "none";
//     }

//     // モーダル以外の場所をクリックしたときの挙動
//     window.onclick = function(event) {
//       if (event.target == modal) {
//         modal.style.display = "none";
//       }
//     }
//   }, 1000);
// });
