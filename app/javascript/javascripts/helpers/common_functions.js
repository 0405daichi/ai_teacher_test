// app/javascript/javascripts/helpers/common_functions.js
import marked from 'marked';

let currentIndex = 0; // 現在のスライドのインデックス

function showSlide(index) {
  const $slides = $('#cardContentModal .custom-slide');
  const $indicators = $('#cardContentModal .indicator');

  if (index < 0 || index >= $slides.length) return; // 範囲外なら何もしない

  // 全てのスライドを非表示にする
  $slides.removeClass('active');

  // 新しいスライドを表示
  $slides.eq(index).addClass('active');

  // answer-type要素にvalueを設定
  $('#cardContentModal .generate-div .add-ans-form .answer_type').val(index + 1); // スライドインデックス + 1
  console.log($('#cardContentModal .generate-div .add-ans-form .answer_type'));

  // インジケーターの更新
  $indicators.removeClass('active'); // 全てのインジケーターからactiveを削除
  $indicators.eq(index).addClass('active'); // 新しいインジケーターにactiveを追加
  currentIndex = index; // インデックスの更新
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
  $('#cardContentModal .current-card-id').text(cardId);
  
  $('#cardContentModal .card-content-close').on('click', function () {
    $('#cardContentModal').modal('hide');
    $('#cardContentModal').remove();
  });

  $('#cardContentModal .indicator').each(function(index) {
    $(this).on('click', function() {
      showSlide(index); // インジケーターがクリックされたら、対応するスライドを表示
      showTextForIndex(index);
    });
  });

  $('#cardContentModal .re-generate-answer-button').on('click', function(event) {
    event.preventDefault();

    $('#loading-overlay').fadeIn();
  
    // フォームデータを取得
    var formData = $('#cardContentModal #regenerate-form').serialize();
  
    // Ajaxリクエストを送信
    $.ajax({
      url: "/questions/add_new_answer", // フォームのアクションURL
      type: "POST", // HTTPメソッド
      data: formData, // 送信するデータ
      dataType: "script", // 期待するレスポンスのタイプ
      success: function(script) {
        $('#loading-overlay').fadeOut();
      },
      error: function(xhr, status, error) {
        // エラー時の処理
        console.error("Error: " + status + " " + error);
      }
    });
  });  

  // '.custom-button'がクリックされたときのイベントハンドラを定義
  $('.custom-button').click(function(e) {
    e.preventDefault(); // デフォルトのフォーム送信を防止
  
    // クリックされた'.custom-button'の最も近い親フォーム要素を探し
    var form = $(this).closest('form');
  
    // フォームデータをシリアライズ
    var formData = form.serialize();
  
    // Ajaxリクエストを送信
    $.ajax({
      url: form.attr('action'), // フォームのアクション属性からURLを取得
      type: "POST", // HTTPメソッド
      data: formData, // 送信するデータ
      dataType: "script", // 期待するレスポンスのタイプ
  
      // 成功時のコールバック
      success: function(response) {
        // 成功時の処理をここに記述
        // 例: 成功メッセージの表示、フォームフィールドのクリアなど
      },
  
      // エラー時の処理
      error: function(xhr, status, error) {
        console.error("Error: " + status + " " + error);
        // エラーメッセージの表示やフォームの状態を元に戻す処理など
      }
    });
  });  
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
      const reload = confirm('カードを開くのに失敗しました。アプリを再起動しますか？');
      if (reload) {
        window.location.reload();
      }
      return;
    }
  });
}

window.showCardDetailsModal = showCardDetailsModal;
window.fetchCardDetails = fetchCardDetails;

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
