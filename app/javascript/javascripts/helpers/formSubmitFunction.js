
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
  accelerateRotation();
  toggleOverlay('show', 'generate');
  formElement.value = question;
  
  // FormDataを作成
  var formData = new FormData(formElement);

  // データをサーバに送信
  fetch('/questions/get_answer', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      // エラーレスポンスを処理
      return response.json().then(data => {
        throw new Error(data.message || "未知のエラーが発生しました。");
      });
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    toggleOverlay('hide');
    decelerateRotation();
    if (data.prompt_login) {
      // ログインが必要な場合、確認ダイアログを表示
      setTimeout(() => {
        const confirmLogin = confirm("質問を生成するにはログインが必要です。ログインページへ移動しますか？");
        if (confirmLogin) {
          // ユーザーがOKを選択した場合、ログインページへリダイレクト
          window.location.href = "/users/sign_in";
        }
      }, 1000); // ユーザー体験を考慮して、わずかな遅延後に表示
    } else if (data.user_id) {
      setTimeout(() => {
        if (data.show_survey) {
          // アンケートモーダルを表示する処理
          showSurveyModal(data.user_id, data.question_id);
        } else {
          // アンケートをスキップして回答表示処理を直接実行
          fetchCardDetails(data.question_id);
        }
      }, 1000);
    }
  })
  .catch(error => {
    // console.error('Error:', error);
    // エラーメッセージをアラートで表示
    toggleOverlay('hide');
    alert(`エラーが発生しました`);
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

