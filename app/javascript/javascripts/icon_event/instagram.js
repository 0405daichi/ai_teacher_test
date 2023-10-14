// instagram.js

import { Modal } from 'bootstrap';

document.addEventListener("turbolinks:load", function() {
  const instagramApp = document.querySelector('.instagram-icon');
  const instagramModalElement = document.querySelector('.instagramModal');
  const instagramModal = new Modal(instagramModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  // 検索アプリ起動処理
  instagramApp.addEventListener('click', async () => {
    instagramModal.show();
  });

  // const circlesContainer = instagramModalElement.querySelector('.top-circles');

  // circlesContainer.addEventListener('click', (e) => {
  //     if (e.target.classList.contains('circle') && !e.target.classList.contains('add-btn')) {
  //         circlesContainer.scrollBy({ 
  //             top: 0, 
  //             left: e.target.offsetWidth + 10, 
  //             behavior: 'smooth' 
  //         });
  //     }
  // });
});
