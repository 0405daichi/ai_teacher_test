// instagram.js

import { Modal } from 'bootstrap';
import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

document.addEventListener("turbolinks:load", function() {
  const instagramApp = document.querySelector('.instagram-icon');
  const instagramModalElement = document.querySelector('.instagramModal');
  const instagramModal = new Modal(instagramModalElement, {
    keyboard: false,
    backdrop: 'true'
  });

  const cards = document.querySelectorAll('.cards .card');
  const cardContentModalElement = document.getElementById('cardContentModal');
  const cardContentModal = new Modal(cardContentModalElement, {
    keyboard: true,
    backdrop: 'true'
  });

  // インスタグラムアプリ起動処理
  instagramApp.addEventListener('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true)
    {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) instagramModal.show();
    }
  });

  cards.forEach(card => {
    card.addEventListener('click', function() {
      console.log(cardContentModal);
      if (cardContentModal._isShown !== true) {
        const questionElement = card.querySelector(".card-body");
        const questionContent = questionElement.textContent.trim();
        const answerElement = card.querySelector(".card-answer");
        const answerContent = answerElement.textContent.trim();
        const question = cardContentModalElement.querySelector(".card-content-question");
        const answer = cardContentModalElement.querySelector(".card-content-answer");
        question.textContent = questionContent;
        answer.textContent = answerContent;

        cardContentModal.show();
      }
    });
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

function convertNewlines(text) {
  return text.replace(/\n/g, '<br>');
}