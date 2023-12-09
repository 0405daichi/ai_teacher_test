// write.js

import { Modal } from 'bootstrap';
import { createStream, processImage, initResizableRect } from '../helpers/cameraFunctions.js';

document.addEventListener("turbolinks:load", function() {
  
});

function submitFormAndShowModal(formElement) {
  // FormDataを作成
  var formData = new FormData(formElement);

  // データをサーバに送信
  fetch('/questions/get_answer', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.content);

    // 新しいモーダルの中身を設定
    var content = convertNewlines(data.content);
    var answerModalElement = document.getElementById('answerModal');
    var answerModal = new Modal(answerModalElement);
    var modalBody = answerModalElement.querySelector('.answer-modal-body');
    modalBody.innerHTML = '';

    var index = 0;
    function typeWriter() {
      if (index < content.length) {
        // <br>マーカーの検出
        if (content.substr(index, 4) === '<br>') {
          modalBody.innerHTML += '<br>';
          index += 4;
        } else {
          modalBody.innerHTML += content.charAt(index);
          index++;
        }
        setTimeout(typeWriter, 50); // 50ミリ秒ごとに文字を追加
      }
    }
    typeWriter();

    // 新しいモーダルを表示
    answerModal.show();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('エラーが発生しました。', error);
  });
}

function convertNewlines(text) {
  return text.replace(/\n/g, '<br>');
}

function setBackButtonListener(listener, element, buttonSelector) {
  var returnButton = element.querySelector(buttonSelector);

  // 以前のイベントリスナーを削除
  returnButton.replaceWith(returnButton.cloneNode(true));

  // 新しいイベントリスナーを追加
  returnButton = element.querySelector(buttonSelector);
  returnButton.addEventListener('click', listener);
}
