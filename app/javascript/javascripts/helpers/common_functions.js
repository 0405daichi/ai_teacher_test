// app/javascript/javascripts/helpers/common_functions.js
import marked from 'marked';

let currentIndex = 0; // 現在のスライドのインデックス

function setupIndicatorsAndSlides(indicatorSelector, slideSelector, textArray, answerTypeSelector) {
  $(indicatorSelector).each(function(index) {
    $(this).on('click', function() {
      const $slides = $(slideSelector);
      if (index < 0 || index >= $slides.length) return; // 範囲外なら何もしない

      $slides.removeClass('active');
      $slides.eq(index).addClass('active');

      if (textArray && textArray.length > index) {
        const $whatsGenerateDiv = $('.whats-generate-content');
        const text = textArray[index];
        $whatsGenerateDiv.text(text).hide().fadeIn(500);
      }

      if(answerTypeSelector) {
        $(answerTypeSelector).val(index + 1); // スライドインデックス + 1
      }

      $(indicatorSelector).removeClass('active');
      $(this).addClass('active');
    });
  });
}

function setupRegenerateAnswerButton(buttonSelector, formSelector, actionUrl) {
  $(buttonSelector).on('click', function(event) {
    toggleOverlay('show', 'generate');
  });
}

function setupCustomButtons(buttonSelector) {
  $(buttonSelector).click(function(e) {
    toggleOverlay('show', 'generate');
  });
}

function setupModal(cardId) {
  $('#cardContentModal .current-card-id').text(cardId);
  
  $('#cardContentModal .card-content-close').on('click', function () {
    $('#cardContentModal').modal('hide');
    $('#cardContentModal').remove();
  });
}

// インデックスごとに異なるテキストを格納する配列
const texts = ["わかりやすく", "もっとわかりやすく", "例え話"];

function showTextForIndex(index) {
  const $whatsGenerateDiv = $('.whats-generate-content');
  // インジケーターのインデックスに対応するテキストを取得
  const text = texts[index];
  
  // 既存のテキストをクリアして新しいテキストを設定、
  // そしてテキストを隠した後にfadeInを使って表示
  $whatsGenerateDiv.text(text).hide().fadeIn(500); // 1000ミリ秒（1秒）かけて表示
}  

function setCardDetailsModal(cardId) {
  setupModal(cardId); // モーダルの基本設定
  setupIndicatorsAndSlides('#cardContentModal .indicator', '#cardContentModal .custom-slide', texts, '#cardContentModal .generate-div .add-ans-form .answer_type');
  
  setupRegenerateAnswerButton('#cardContentModal .re-generate-answer-button', '#cardContentModal #regenerate-form', '/questions/add_new_answer');

  setupCustomButtons('#cardContentModal .custom-button');
}

function showCardDetailsModal(cardId) {
  if (!$("#cardContentModal").hasClass('show')) {
    setCardDetailsModal(cardId);
    $('#cardContentModal').modal('show');
    showTextForIndex(0)
  }
}

function fetchCardDetails(cardId) {
  const id = cardId;
  $.ajax({
    url: `/questions/${id}`,
    type: 'GET',
    headers: {
      'Accept': 'application/javascript',
      'X-Requested-With': 'XMLHttpRequest'
    },
    success: function() {
      showCardDetailsModal(id);
    },
    error: function(error) {
      const reload = confirm('カードを開くのに失敗しました。\r\nアプリを再起動しますか？');
      if (reload) {
        window.location.reload();
      }
      return;
    }
  });
}

window.showCardDetailsModal = showCardDetailsModal;
window.fetchCardDetails = fetchCardDetails;

document.addEventListener('DOMContentLoaded', () => {
  // card-show-pageのインジケーターとスライドの設定
  setupIndicatorsAndSlides('#card-show-page .indicator', '#card-show-page .custom-slide', texts, '#card-show-page .generate-div .add-ans-form .answer_type');

  // card-show-pageのre-generate-answer-buttonの設定を行う
  setupRegenerateAnswerButton('#card-show-page .re-generate-answer-button', '#card-show-page #regenerate-form', '/questions/add_new_answer');

  // card-show-pageのカスタムボタンの設定
  setupCustomButtons('#card-show-page .custom-button');
  showTextForIndex(0)
  document.querySelectorAll('.answer-content').forEach(function(el) {
    renderMathInElement(el, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "\\[", right: "\\]", display: true},
        {left: "\\(", right: "\\)", display: false},
        {left: "$", right: "$", display: false},
      ]
    });
  
    // marked.jsを使用してMarkdownをHTMLに変換
    var html = marked.parse(el.innerHTML);
    el.innerHTML = html;
  });
});


function convertTextToHtml(text) {
  // MarkdownをHTMLに変換
  let html = marked.parse(text);

  // 改行を<br>に置き換え
  return html;
}

function isUserLoggedIn() {
  return document.body.classList.contains('user-logged-in');
}

window.isUserLoggedIn = isUserLoggedIn;

export function toggleOverlay(action, messageType) {
  const overlay = $('#loading-overlay');
  const messageElement = overlay.find('.loading-message');
  let message = '';

  // メッセージタイプに応じたメッセージを設定
  switch(messageType) {
    case 'generate':
      message = '回答を考えています...';
      break;
    case 'camera-setting':
      message = 'カメラを起動しています...';
      break;
    default:
      message = '処理中です...';
  }

  // メッセージを更新
  messageElement.text(message);

  // アクションに応じたオーバーレイの表示・非表示
  if(action === 'show') {
    overlay.fadeIn();
  } else if(action === 'hide') {
    overlay.fadeOut();
  }
}
window.toggleOverlay = toggleOverlay;