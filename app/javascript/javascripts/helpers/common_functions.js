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
    event.preventDefault();
    toggleOverlay('show', 'generate');

    // フォームデータを取得
    var formData = $(formSelector).serialize();

    // Ajaxリクエストを送信
    $.ajax({
      url: actionUrl,
      type: "POST",
      data: formData,
      dataType: "json", // JSON形式のレスポンスを期待
      success: function(response) {
        toggleOverlay('hide');
        // レスポンスの内容に応じた処理を実装
        switch (response.status) {
          case "success":
            // 成功時の処理
            // HTMLをDOMに挿入
            const $newHTML = $(".answer-" + response.answer_type + " .answer-content").hide().html(response.content);

            // 数学式をレンダリングするために純粋なDOM要素を取得し使用
            renderMathInElement($newHTML[0], {
              delimiters: [
                  {left: "$$", right: "$$", display: true},
                  {left: "\\[", right: "\\]", display: true},
                  {left: "\\(", right: "\\)", display: false},
                  {left: "$", right: "$", display: false},
              ]
            });

            var html = marked.parse($newHTML[0].innerHTML);
            $newHTML[0].innerHTML = html;

            // フェードイン効果を適用
            $newHTML.fadeIn(1000);
            break;
          case "limit":
            // APIリクエストの制限に関する処理
            setTimeout(() => {
              alert("アクセスが集中しています。\r\n1分後再試行してください。");
            }, 1000);
            break;
          case "login_required":
            // ログインが必要な場合の処理
            setTimeout(() => {
              if (confirm("質問を生成するにはログインが必要です。\r\nログインページへ移動しますか？")) {
                window.location.href = "/users/sign_in";
              }
            }, 1000);
            break;
          default:
            // エラーが発生した場合の処理
            alert("回答の保存に失敗しました。");
            break;
        }
      },
      error: function(xhr, status, error) {
        toggleOverlay('hide');
        alert(`エラーが発生しました: ${error}`);
      }
    });
  });
}

function setupCustomButtons(buttonSelector, formSelector, actionUrl) {
  $(buttonSelector).click(function(event) {
    event.preventDefault();
    toggleOverlay('show', 'generate');

    // フォームデータを取得
    var formData = $(formSelector).serialize();

    // Ajaxリクエストを送信
    $.ajax({
      url: actionUrl,
      type: "POST",
      data: formData,
      dataType: "json", // JSON形式のレスポンスを期待
      success: function(response) {
        toggleOverlay('hide');
        // レスポンスの内容に応じた処理を実装
        switch (response.status) {
          case "success":
            // 成功時の処理
            const $newHTML = $(".answer-" + response.answer_type + " .answer-content").hide().html(response.content);

            // 数学式をレンダリングするために純粋なDOM要素を取得し使用
            renderMathInElement($newHTML[0], {
              delimiters: [
                  {left: "$$", right: "$$", display: true},
                  {left: "\\[", right: "\\]", display: true},
                  {left: "\\(", right: "\\)", display: false},
                  {left: "$", right: "$", display: false},
              ]
            });

            var html = marked.parse($newHTML[0].innerHTML);
            $newHTML[0].innerHTML = html;

            // フェードイン効果を適用
            $newHTML.fadeIn(1000);
            break;
          case "limit":
            // APIリクエストの制限に関する処理
            setTimeout(() => {
              alert("アクセスが集中しています。\r\n1分後再試行してください。");
            }, 1000);
            break;
          case "login_required":
            // ログインが必要な場合の処理
            setTimeout(() => {
              if (confirm("質問を生成するにはログインが必要です。\r\nログインページへ移動しますか？")) {
                window.location.href = "/users/sign_in";
              }
            }, 1000);
            break;
          case "no_answer":
            // ログインが必要な場合の処理
            setTimeout(() => {
              alert("回答生成中にエラーが発生しました。");
            }, 1000);
            break;
          default:
            // エラーが発生した場合の処理
            alert("回答の保存に失敗しました。");
            break;
        }
      },
      error: function(xhr, status, error) {
        toggleOverlay('hide');
        alert(`エラーが発生しました: ${error}`);
      }
    });
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
  
  // setupRegenerateAnswerButton('#cardContentModal .re-generate-answer-button', '#cardContentModal #regenerate-form', '/questions/add_new_answer');

  setupCustomButtons('#cardContentModal .custom-button', '#cardContentModal #add-ans-form', '/questions/add_new_answer');
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
  // setupRegenerateAnswerButton('#card-show-page .re-generate-answer-button', '#card-show-page #regenerate-form', '/questions/add_new_answer');

  // card-show-pageのカスタムボタンの設定
  setupCustomButtons('#card-show-page .custom-button', '#card-show-page #add-ans-form', '/questions/add_new_answer');
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