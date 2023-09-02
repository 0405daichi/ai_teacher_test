// app/javascript/javascripts/modals.js

import { Modal } from 'bootstrap';

function createModal(id) {
  const modalElement = document.getElementById(id);
  return new Modal(modalElement, {
    keyboard: false,
    backdrop: 'true'
  });
}

export function handleModalButtons() {
  const myModal = createModal('questionOrSearch');
  const questionModal = createModal('questionModal');
  const searchModal = createModal('searchModal');
  const photoModal = createModal('inputPhotoModal');

  const questionButton = document.getElementById('questionButton');
  if (questionButton) {
    questionButton.addEventListener('click', () => {
      myModal.hide(); // 最初のモーダルを閉じます
      questionModal.show(); // 質問モーダルを表示します
    });
  }
  
  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      myModal.hide(); // 最初のモーダルを閉じます
      searchModal.show(); // 検索モーダルを表示します
    });
  }
  // モーダルに関するすべてのボタンイベントリスナー
}