// folder.js

import { Modal } from 'bootstrap';

document.addEventListener("turbolinks:load", function() {
  const folderApp = document.querySelector('.folder-icon');
  const folderModalElement = document.querySelector('.folderModal');
  const folderModal = new Modal(folderModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  // 検索アプリ起動処理
  folderApp.addEventListener('click', async () => {
    folderModal.show();
  });
});

// テキスト内容を制限する関数
function truncateText(text, maxLength = 30) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}
