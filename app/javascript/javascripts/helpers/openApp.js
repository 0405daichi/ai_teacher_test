// openApp.js

let fadeSequence = []; // フェードアウトした順序を保存する配列

export async function fadeOutCirclesSequentially() {
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
          resolve(true);
        }
      }, 100);
    });
  });
}

export async function fadeInCirclesSequentially() {
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
        resolve(true);
      }
    }, 100);
  });
}

export async function moveToCenterAndResetRotation() {
  return new Promise((resolve, reject) => {
    const circleContainer = document.getElementById('circles');
    circleContainer.addEventListener('click', function listener(event) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const clickedCircle = event.target.closest('.rotating-circle');
      if (!clickedCircle) return;

      const circleStyles = window.getComputedStyle(clickedCircle);
      const circleX = parseFloat(circleStyles.left);
      const circleY = parseFloat(circleStyles.top);
      const currentAngle = parseFloat(clickedCircle.dataset.angle);

      let startTime;
      function animate(time) {
        if (!startTime) startTime = time;
        
        const progress = (time - startTime) / 1000;
        if (progress < 1) {
          // XとYの座標を計算
          const newX = circleX + (centerX - circleX) * progress;
          const newY = circleY + (centerY - circleY) * progress;

          // 回転角度を計算
          const newAngle = currentAngle + (270 - currentAngle) * progress;
  
          clickedCircle.style.left = `${newX}px`;
          clickedCircle.style.top = `${newY}px`;
          clickedCircle.style.transform = `rotate(${newAngle}deg)`;
  
          requestAnimationFrame(animate);
        } else {
          clickedCircle.style.left = `${centerX}px`;
          clickedCircle.style.top = `${centerY}px`;
          clickedCircle.style.transform = 'rotate(270deg)';
          circleContainer.removeEventListener('click', listener);
          resolve(true);
        }
      }
      requestAnimationFrame(animate);
    });
  });
}

