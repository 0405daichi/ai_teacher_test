import { fadeOutCirclesSequentially, fadeInCirclesSequentially } from '../helpers/openApp.js';

document.addEventListener("turbolinks:load", function() {
  $('#svg-game').on('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true) {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) {
        $('.ad-modal-1').modal('show');
      }
    }
  });

  $('#svg-plus').on('click', async () => {
    const open = await fadeOutCirclesSequentially();
    if (open == true) {
      const openEnd = await fadeInCirclesSequentially();
      if (openEnd) {
        $('.ad-modal-2').modal('show');
      }
    }
  });
});