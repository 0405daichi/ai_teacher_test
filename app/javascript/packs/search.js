// // app/javascript/packs/search.js
// document.addEventListener("DOMContentLoaded", () => {
//   const searchQuery = document.getElementById('search-query'); // ここを修正
//   const searchResults = document.getElementById('questions-list');
//   const searchForm = document.getElementById('search-form-container');

//   if (searchForm) {
//     searchQuery.addEventListener('input', async (event) => {
//       event.preventDefault();

//       const url = `/questions/search?query=${encodeURIComponent(searchQuery.value)}`;
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
//         },
//         credentials: 'same-origin'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const similarQuestions = data.similar_questions;

//         searchResults.innerHTML = ''; // 検索結果をクリア
//         similarQuestions.forEach(questionData => {
//           const question = questionData.question; // questionData から question を取得
//           const answer = questionData.answer; // questionData から answer を取得

//           const card = document.createElement('div');
//           card.className = 'col-md-4 mb-3';
          
//           card.innerHTML = `
//           <div class="card mt-3">
//             <div class="card-header">
//               質問: <span class="question-content"></span>
//             </div>
//             <div class="card-body">
//               回答: <span class="answer-content"></span>
//             </div>
//           </div>`;
          
//           card.querySelector('.question-content').innerHTML = convertNewlines(question.content);
//           card.querySelector('.answer-content').innerHTML = convertNewlines(answer.content);

//           searchResults.appendChild(card);
//         });        
//       } else {
//         console.error(`Error: ${response.status}`);
//       }
//     });
//   }
// });

// function convertNewlines(text) {
//   return text.replace(/\n/g, '<br>');
// }