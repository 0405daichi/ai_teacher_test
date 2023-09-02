// app/javascript/packs/likes.js
document.addEventListener("turbolinks:load", () => {
  setTimeout(() => {
    const likeButtons = document.querySelectorAll('[data-tooltip="いいねする"], [data-tooltip="いいねを取り消す"]');
    const modal = document.getElementById('loginModal');
    const close = document.getElementById('modalClose');
    const loginButton = document.getElementById('login-button');
    const modalMessage = document.getElementById('modalMessage');

    likeButtons.forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const questionId = button.getAttribute('data-question-id');
        const isLiked = button.dataset.tooltip === 'いいねを取り消す';
        const url = isLiked ? button.href : `/questions/${questionId}/like`;
        const method = isLiked ? 'DELETE' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
          },
          credentials: 'same-origin'
        });

        if (response.ok) {
          const data = await response.json();
          const icon = button.querySelector('i');

          if (data.status === 'success' && data.action === 'created') {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.dataset.tooltip = 'いいねを取り消す';
            button.href = `/questions/${data.like_id}/unlike`;
          } else if (data.status === 'success') {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.dataset.tooltip = 'いいねする';
            button.removeAttribute('href');
          }
        } else if (response.status === 422) {
          const data = await response.json();
          console.log(`Validation error - message: ${data.message}`);
          alert('いいねに失敗しました。');
        } else {
          console.log(`Fetch error - status code: ${response.status}`);
          if (response.status === 401) {
            modal.style.display = "block";
            modalMessage.textContent = 'いいねを押すにはログインが必要です。';
          } else {
            alert('いいねに失敗しました。');
          }
        }
      });
    });

    // ログインボタンがクリックされたときの挙動
    loginButton.onclick = function() {
      window.location.href = '/users/sign_in';
    }

    // モーダルのクローズボタンをクリックしたときの挙動
    close.onclick = function() {
      modal.style.display = "none";
    }

    // モーダル以外の場所をクリックしたときの挙動
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }, 1000);
});
