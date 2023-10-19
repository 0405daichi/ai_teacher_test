// search.js

import { Modal } from 'bootstrap';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

document.addEventListener("turbolinks:load", function() {
  const searchApp = document.querySelector('.search-icon');
  const searchModalElement = document.querySelector('.searchModal');
  const searchModal = new Modal(searchModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  const searchQuery = document.getElementById('searchQuery');
  const searchResults = document.getElementById('searchResults');

  // 検索アプリ起動処理
  searchApp.addEventListener('click', async () => {
    if (await fadeOutCirclesSequentially())
    {
      if (await fadeInCirclesSequentially()) searchModal.show();
    }
  });

  // 検索機能
  if (!searchQuery) return; // searchQueryが存在しない場合は終了

  searchQuery.addEventListener('input', async (event) => {
    event.preventDefault();

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

    // 質問と回答の詳細を表示するモーダル
    const detailModalElement = document.querySelector('.detailModal');
    const detailModal = new Modal(detailModalElement, {
      keyboard: false,
      backdrop: 'true'
    });

    if (response.ok) {
      const data = await response.json();
      const similarQuestions = data.similar_questions;
  
      searchResults.innerHTML = ''; // 検索結果をクリア
      similarQuestions.forEach(questionData => {
        const question = questionData.question;
        const answer = questionData.answer;
  
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-3';
  
        card.innerHTML = `
        <div class="card mt-3">
          <div class="card-header">
            質問: <span class="question-content"></span>
          </div>
          <div class="card-body">
            回答: <span class="answer-content"></span>
          </div>
        </div>`;
  
        card.querySelector('.question-content').textContent = truncateText(question.content);
        card.querySelector('.answer-content').textContent = truncateText(answer.content);

        card.addEventListener('click', () => {
          // 詳細モーダルの内容を更新
          document.querySelector('.detail-question-content').textContent = question.content;
          document.querySelector('.detail-answer-content').textContent = answer.content;
          // 詳細モーダルを表示
          detailModal.show();
        });
  
        searchResults.appendChild(card);
      });
    } else {
      console.error(`Error: ${response.status}`);
    }
  });
});

// テキスト内の改行をHTMLに変換する関数
function convertNewlines(text) {
  return text.replace(/\n/g, '<br>');
}

// テキスト内容を制限する関数
function truncateText(text, maxLength = 30) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}
