// write.js

import { Modal } from 'bootstrap';
import { createStream, processImage, initResizableRect } from '../helpers/cameraFunctions.js';
// ライブラリをインポート
import marked from 'marked';
import katex from 'katex';

// KaTeXのオプションを設定
const katexOptions = {
  throwOnError: false, // LaTeXのパースエラーを無視する
  errorColor: "#cc0000", // エラーの色を設定
  delimiters: [ // 数式のデリミタを設定
    {left: "$$", right: "$$", display: true},
    {left: "\\[", right: "\\]", display: true},
    {left: "$", right: "$", display: false},
    {left: "\\(", right: "\\)", display: false}
  ]
};

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

    // 新しいモーダルの中身を設定
    var content = convertTextToHtml(data.content);
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

function convertTextToHtml(text) {
  // MarkdownをHTMLに変換
  let html = marked.parse(text);

  // LaTeX表現を探して、KaTeXでHTMLに変換
  html = html.replace(/\\\((.*?)\\\)/g, (match, formula) => {
    return katex.renderToString(formula, katexOptions);
  });

  // 改行を<br>に置き換え
  return html.replace(/\n/g, '<br>');
}