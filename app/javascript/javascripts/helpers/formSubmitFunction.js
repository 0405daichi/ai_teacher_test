
function refreshCard(user_id, question_id) {
  fetch(`/refresh_card/${user_id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/javascript',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'same-origin'
  })
  .then(response => {
    console.log(response);
    if (!response.ok) {
      response.text().then(text => console.log(text)); // エラーレスポンスのボディを出力
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(script => {
    console.log(script);
    eval(script);
    const cards = [];
    const card = document.querySelector(`#card-${question_id}`);
    console.log(card);
    cards.push(card);
    // setInstagram(cards);
  })
  .catch(error => console.error('Error:', error));
};

export async function submitFormAndShowModal(formElement, question) {
  formElement.value = question;
  
  // FormDataを作成
  var formData = new FormData(formElement);

  // データをサーバに送信
  fetch('/questions/get_answer', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    console.log(!data.user_id);
    if (data.user_id !== "" || data.user_id !== null) {
      if (data.show_survey) {
        // アンケートモーダルを表示する処理
        showSurveyModal(data.user_id, data.question_id);
      } else {
        // アンケートをスキップして回答表示処理を直接実行
        refreshCard(data.user_id, data.question_id);
        fetchCardDetails(data.user_id);
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('エラーが発生しました。', error);
  });
}

function showSurveyModal(user_id, question_id) {
  // アンケートモーダルを表示
  $('#survey-modal').modal('show');

  // 新しいイベントリスナーを追加
  $('#survey-modal #submit-button').on('click', handleFormSubmit);

  function handleFormSubmit(event) {
    event.preventDefault(); // フォームのデフォルト送信をキャンセル
  
    // フォームデータを取得 (jQueryを使用)
    var formData = $('#survey-form').serialize();
  
    // jQueryの$.ajaxを使用してフォームデータをサーバに非同期で送信
    $.ajax({
      url: '/survey_responses',
      type: 'POST',
      data: formData,
      processData: false,  // jQueryがデータを処理しないようにする
      contentType: false,   // contentTypeをfalseに設定してブラウザにcontentTypeを設定させる
      success: function(data) {
        if(data.success) {
          // アンケートモーダルを非表示にする
          $('#survey-modal').modal('hide');
          // 送信成功時の処理（例: ユーザーに質問の回答を表示）
          refreshCard(user_id, question_id); // user_id, question_idを適切に定義する必要がある
          fetchCardDetails(user_id); // user_idを適切に定義する必要がある
        } else {
          // エラーメッセージを表示するなどの処理
          alert('エラーが発生しました。');
        }
      },
      error: function(xhr, status, error) {
        console.error('送信エラー:', error);
      }
    });
  }  
}

