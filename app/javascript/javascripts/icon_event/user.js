// user.js

import { Modal } from 'bootstrap';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

document.addEventListener("turbolinks:load", function() {
  if ($('#svg-user').length === 0) return;
  const userApp = document.querySelector('#svg-user');
  const userModalElement = document.querySelector('.user-modal');
  const userModal = new Modal(userModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  userApp.addEventListener('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true)
    {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) 
      {
        userModal.show();
      }
    }
  });

  if (isUserLoggedIn()) {
    userModalElement.querySelectorAll('.notification-item').forEach(function(item) {
      item.addEventListener('click', function() {
        expandNotification(this);
      });
    });
  
    // ボタンがクリックされたら
    userModalElement.querySelector('.circle-quarter').addEventListener('click', function() {
      const circleBg = userModalElement.querySelector('.circle-bg');
      circleBg.classList.toggle('circleactive'); // 丸背景のアニメーション
  
      // user-content-boxの表示を切り替え
      const notificationsContainer = userModalElement.querySelector('.notifications-container');
      const userContent = userModalElement.querySelector('.user-content-box');
      if (userContent && notificationsContainer) {
        notificationsContainer.style.display = notificationsContainer.style.display === 'none' ? 'block' : 'none';
        userContent.style.display = userContent.style.display === 'none' ? 'block' : 'none';
      }
  
      // 歯車のアニメーション
      var gear = userModalElement.querySelector('.gear');
      gear.classList.toggle('rotateLeft');
  
      var svg = gear.querySelector('.ai-Gear'); // 必要なpath要素の正確なセレクター
      svg.classList.toggle('stroke-black');
    });
  
    const feedbackMessage = userModalElement.querySelector(".feedback-form").querySelector(".form-control");
    const submitButton = userModalElement.querySelector("#submit-button");
    submitButton.disabled = true;
    
    feedbackMessage.addEventListener("input", function() {
      submitButton.disabled = this.value.trim() === "";
    });
  }
});

function expandNotification(element) {
  const announcementId = element.dataset.id;

  if (!element.classList.contains('expanded-notification')) {
    fetch(`/announcements/${announcementId}/detail`)
      .then(response => response.text())
      .then(html => {
        element.innerHTML = html;
        element.classList.add('expanded-notification');
        const userModalElement = document.querySelector('.user-modal');
        const userModalElementClose = userModalElement.querySelector('.user-modal-close');
        userModalElementClose.style.display = 'none';

        const closeButton = element.querySelector('.close-button');
        if (closeButton) {
          closeButton.addEventListener('click', function(event) {
            event.stopPropagation();
            element.classList.remove('expanded-notification');
            userModalElementClose.style.display = 'block';

            // タイトルと時間を再表示
            element.innerHTML = `<div class="notification-content">
                                   <strong>${element.dataset.title}</strong>
                                   <p class="notification-time">${element.dataset.time}</p>
                                 </div>`;
          });
        }
      });
  }
}


