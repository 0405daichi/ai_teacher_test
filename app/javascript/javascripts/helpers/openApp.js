// openApp.js

let fadeSequence = []; // フェードアウトした順序を保存する配列

export async function fadeOutCirclesSequentially() {
  showOverlay();
  return new Promise((resolve, reject) => {
    const circleContainer = document.getElementById('circles');
    circleContainer.addEventListener('click', function listener(event) {
      const clickedCircle = event.target.closest('.rotating-circle');
      if (!clickedCircle) return;

      const allCircles = Array.from(document.querySelectorAll('.rotating-circle'));
      const clickedIndex = allCircles.indexOf(clickedCircle);

      fadeSequence = []; // 配列を初期化
      let nextFadeIndex = (clickedIndex + 1) % allCircles.length;
      let fadeOutInterval = setInterval(() => {
        allCircles[nextFadeIndex].classList.add('fade-out');
        fadeSequence.push(nextFadeIndex); // フェードアウトした順序を保存

        nextFadeIndex = (nextFadeIndex + 1) % allCircles.length;

        if (nextFadeIndex === clickedIndex) {
          clearInterval(fadeOutInterval);
          circleContainer.removeEventListener('click', listener);
          hideOverlay();
          resolve(true);
        }
      }, 100);
    });
  });
}

export async function fadeInCirclesSequentially() {
  showOverlay();
  return new Promise((resolve, reject) => {
    const allCircles = Array.from(document.querySelectorAll('.rotating-circle'));
    if (allCircles.length === 0) {
      reject(new Error('No circles found.'));
      return;
    }

    if (fadeSequence.length === 0) {
      reject(new Error('No fade-out sequence found.'));
      return;
    }

    let i = 0;
    let fadeInInterval = setInterval(() => {
      const index = fadeSequence[i];
      allCircles[index].classList.remove('fade-out');

      i++;
      if (i >= fadeSequence.length) {
        clearInterval(fadeInInterval);
        hideOverlay();
        resolve(true);
      }
    }, 100);
  });
}

function showOverlay() {
  document.getElementById("overlay").style.display = "block";
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
}
