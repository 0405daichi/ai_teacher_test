import { Modal } from 'bootstrap';

const modalElement = document.getElementById('questionOrSearch');
const myModal = new Modal(modalElement, {
  keyboard: false,
  backdrop: 'true'
});
const questionModalElement = document.getElementById('questionModal');
const questionModal = new Modal(questionModalElement, {
  keyboard: false,
  backdrop: 'true'
});
const searchModalElement = document.getElementById('searchModal');
const searchModal = new Modal(searchModalElement, {
  keyboard: false,
  backdrop: 'true'
});

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

