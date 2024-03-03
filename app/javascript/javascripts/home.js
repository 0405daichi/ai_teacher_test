// app/javascript/javascripts/home.js

import { write } from "@popperjs/core";
import { closeCamera } from './helpers/cameraFunctions';

document.addEventListener('turbolinks:load', () => {
  if ($('.center-point').length === 0) return;

  const faqIcon = document.querySelector('.faq-icon');
  const crossIcon = document.querySelector('.cross-icon');
  const circleBg = document.querySelector('.circle-bg-question');
  const faqContent = document.querySelector('#faq-contents');

  // FAQアイコンのクリックイベント
  faqIcon.addEventListener('click', function() {
    circleBg.classList.add('circleactive'); // 円を拡大
    faqContent.classList.add('visible'); // FAQコンテンツを表示

    faqIcon.style.display = 'none'; // FAQアイコンを非表示
    crossIcon.style.display = 'block'; // クロスアイコンを表示
  });

  // クロスアイコンのクリックイベント
  crossIcon.addEventListener('click', function() {
    circleBg.classList.remove('circleactive'); // 円の拡大を解除
    faqContent.classList.remove('visible'); // FAQコンテンツを非表示

    crossIcon.style.display = 'none'; // クロスアイコンを非表示
    faqIcon.style.display = 'block'; // FAQアイコンを再表示
  });
  
  // モーダルの開閉状態を追跡する変数
  let isModalOpen = false;

  // 全てのモーダル要素を取得
  const modals = document.querySelectorAll('.modal');

  // 各モーダルのイベントを監視
  modals.forEach(modal => {
      modal.addEventListener('shown.bs.modal', function() {
          isModalOpen = true; // モーダルが開かれたらフラグをtrueに設定
      });
      modal.addEventListener('hidden.bs.modal', function() {
          isModalOpen = false; // モーダルが閉じられたらフラグをfalseに設定
      });
  });
  
  const numCircles = 5;
  const circleContainer = document.getElementById('circles');
  const radius = 100;
  let rotationSpeed = 0.1; // この値を変更することで回転速度が変わります
  let centerRotationSpeed = -0.1; // 中心の画像の回転速度（他の円とは逆方向）
  // 中心の画像を取得
  const centerPoint = document.querySelector('.center-point');
  centerPoint.dataset.angle = 0;

  // 'svg-container'の子要素として配置されたSVGを全て取得
  const svgElements = document.querySelector('#svg-container').children;

  // 回転を加速させる関数
  function accelerateRotation() {
    rotationSpeed = 5; // 加速させたい回転速度に調整
    centerRotationSpeed = -5; // 中心の回転も加速
  }

  // 回転を減速させて元の速度に戻す関数
  function decelerateRotation() {
    // 目標の回転速度
    const targetRotationSpeed = 0.1;
    const targetCenterRotationSpeed = -0.1;
  
    // 減速処理を行う関数
    function step() {
      // 現在の回転速度と目標の回転速度の差を計算
      const speedDifference = rotationSpeed - targetRotationSpeed;
      const centerSpeedDifference = centerRotationSpeed - targetCenterRotationSpeed;
  
      // 差が十分に小さくなったら、目標の回転速度に設定して終了
      if (Math.abs(speedDifference) < 0.01 && Math.abs(centerSpeedDifference) < 0.01) {
        rotationSpeed = targetRotationSpeed;
        centerRotationSpeed = targetCenterRotationSpeed;
      } else {
        // 現在の回転速度を少し減速させる
        rotationSpeed -= speedDifference * 0.1; // ここの係数を調整して減速率を変更
        centerRotationSpeed -= centerSpeedDifference * 0.1; // 係数を調整
  
        // 次のフレームで再度減速処理を実行
        requestAnimationFrame(step);
      }
    }
  
    // 減速処理の開始
    step();
  }  

  window.accelerateRotation = accelerateRotation;
  window.decelerateRotation = decelerateRotation;

  for (let i = 0; i < numCircles; i++) {
    const angle = (i * 360) / numCircles;
    const circle = document.createElement('div');
    circle.className = 'rotating-circle';
    circle.dataset.angle = angle;
    setCirclePosition(circle, radius, angle);

    // 取得したSVG要素の一つをcircleに追加
    // SVGが直接innerHTMLとして扱えるようにするためにouterHTMLを使用
    if(svgElements[i % svgElements.length]) { // エラー回避のために存在確認
      const svgElement = svgElements[i % svgElements.length].outerHTML;
      circle.innerHTML = svgElement; // SVGをHTMLとして追加
      circleContainer.appendChild(circle);
    }
  }

  // 自動で回転させる
  setInterval(() => {
    Array.from(document.querySelectorAll('.rotating-circle')).forEach((circle, j) => {
      const currentAngle = parseFloat(circle.dataset.angle);
      const newAngle = currentAngle + rotationSpeed;
      setCirclePosition(circle, radius, newAngle);
      circle.dataset.angle = newAngle;
    });

    const currentCenterAngle = parseFloat(centerPoint.dataset.angle);
    const newCenterAngle = currentCenterAngle + centerRotationSpeed;
    centerPoint.dataset.angle = newCenterAngle;
    centerPoint.style.transform = `translate(-50%, -50%) rotate(${newCenterAngle}deg)`;
  }, 16); // 約60FPSで更新

  // スクロールで中心の画像を回転させる
  window.addEventListener('wheel', function(event) {
    if (isModalOpen) return; // モーダルが開いている場合は何もしない
    const scrollDelta = event.deltaY * 0.1; // スクロールの量に基づく回転量
    rotateCenterPoint(scrollDelta);
  });

  // ホイールで回転させる
  window.addEventListener('wheel', function(event) {
    if (isModalOpen) return; // モーダルが開いている場合は何もしない
    const scrollDelta = event.deltaY * 0.1;  // スクロールの方向と量
    Array.from(document.querySelectorAll('.rotating-circle')).forEach((circle) => {
      const currentAngle = parseFloat(circle.dataset.angle);
      const newAngle = currentAngle + scrollDelta;
      setCirclePosition(circle, radius, newAngle);
      circle.dataset.angle = newAngle;
    });
  });

  let initialTouchY = null;
  let touchVelocity = 0; // タッチによる回転速度
  const friction = 0.95; // 摩擦係数

  // タッチ開始時の処理
  window.addEventListener('touchstart', function(event) {
    if (isModalOpen) return; // モーダルが開いている場合は何もしない
    initialTouchY = event.touches[0].clientY;
  });

  // タッチ中の処理
  window.addEventListener('touchmove', function(event) {
    if (isModalOpen) return; // モーダルが開いている場合は何もしない
    if (initialTouchY === null) return;

    const touchY = event.touches[0].clientY;
    const touchDelta = initialTouchY - touchY;
    touchVelocity = touchDelta * 0.1; // タッチによる回転加速度を設定

    // 回転速度に基づいて更新
    updateCircles(touchVelocity);
    rotateCenterPoint(touchVelocity);

    initialTouchY = touchY;
  });

  // タッチ終了時の処理
  window.addEventListener('touchend', function() {
    if (isModalOpen) return; // モーダルが開いている場合は何もしない
    initialTouchY = null;
    animateDeceleration(); // 減速アニメーションを開始
  });

  function animateDeceleration() {
    if (Math.abs(touchVelocity) > 0.1) {
      updateCircles(touchVelocity);
      rotateCenterPoint(touchVelocity);
      touchVelocity *= friction; // 摩擦により速度を減少
      requestAnimationFrame(animateDeceleration);
    }
  }

  function updateCircles(delta) {
    Array.from(document.querySelectorAll('.rotating-circle')).forEach((circle) => {
      const currentAngle = parseFloat(circle.dataset.angle);
      const newAngle = currentAngle + delta;
      setCirclePosition(circle, radius, newAngle);
      circle.dataset.angle = newAngle;
    });
  }

  // 中心の画像を回転させる関数
  function rotateCenterPoint(delta) {
    const currentAngle = parseFloat(centerPoint.dataset.angle) || 0;
    const newAngle = currentAngle - delta;
    centerPoint.dataset.angle = newAngle;
    centerPoint.style.transform = `translate(-50%, -50%) rotate(${newAngle}deg)`;
  }

  function setCirclePosition(circle, r, a) {
    const x = r * Math.cos(a * Math.PI / 180);
    const y = r * Math.sin(a * Math.PI / 180);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    circle.style.left = `${centerX + x}px`;
    circle.style.top = `${centerY + y}px`;
    circle.style.transform = `rotate(${270-a}deg)`; 
  }

  // 質問モーダルの閉じるボタン
  const questionCloseButton = document.getElementById('closeQuestionButton');
  if (questionCloseButton) {
    questionCloseButton.addEventListener('click', (event) => {
      if (questionInputForm.value) {
        const result = window.confirm('入力した内容は破棄されます。');
        if (result) {
          questionModal.hide();
          questionModalButton.style.display = "block";
        } else {
          event.preventDefault();
        }
      } else {
        questionModal.hide();
        questionModalButton.style.display = "block";
      }
    });
  }

  // 検索モーダルの閉じるボタン
  const searchCloseButton = document.getElementById('closeSearchButton');
  const searchInputForm = document.getElementById('searchInputForm');
  if (searchCloseButton) {
    searchCloseButton.addEventListener('click', (event) => {
      if (searchInputForm.value) {
        const result = window.confirm('入力した内容は破棄されます。');
        if (result) {
          searchModal.hide();
        } else {
          event.preventDefault();
        }
      } else {
        searchModal.hide();
      }
    });
  }

  document.querySelectorAll('textarea').forEach(function (elem) {
    elem.addEventListener('input', function () {
      if (elem.value === ""){
        if (elem.id === "questionInputForm"){
          setPlaceholder($('.write-question-modal .selected-option').val(), $('.write-question-modal .question-input-form')[0]);
        } else if (elem.id === "searchInputForm"){
          setPlaceholder('検索', searchInputForm);
        }
      }
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });

  // モーダルの参照を保存する変数を追加
  let previousModal = null;

  const photoButtons = document.querySelectorAll('.photoButton');
  if (photoButtons) {
    photoButtons.forEach(button => {
      button.addEventListener('click', () => {
        // それぞれのモーダルを閉じ、前のモーダルを保存
        if (questionModal._isShown) {
          previousModal = questionModal;
          console.log(previousModal);
          questionModal.hide();
        } else if (searchModal._isShown) {
          previousModal = searchModal;
          searchModal.hide();
        }

        // 写真入力モーダルを開きます
        photoModal.show();
      });
    });
  }

  // '戻る'ボタンが押されたら、前のモーダルを表示する
  const backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (previousModal) {
        // 写真入力モーダルを閉じます
        photoModal.hide();

        // 前のモーダルを表示します
        previousModal.show();
      }
    });
  }

  const writeModalElement = document.querySelector(".write-question-modal");
  const textarea = writeModalElement.querySelector('.question-input-form');
  const firstHeight = textarea.scrollHeight;
  let lastHeight = firstHeight; // 初期値をfirstHeightに設定

  // textareaの高さを調整する関数
  function adjustHeight() {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      lastHeight = textarea.scrollHeight;
  }

  // inputイベント時の高さ調整
  textarea.addEventListener('input', adjustHeight);

  // 初期ロード時の高さ調整
  adjustHeight();

  // textarea以外の部分がクリックされた時の挙動
  document.body.addEventListener('click', function(e) {
      if (!e.target.closest('#questionInputForm') || e.target.closest('#questionInputForm') == null) {
        textarea.style.height = 'auto';
        textarea.style.height = firstHeight + 'px';
      }
  });

  // textareaにフォーカスが当たった時の挙動
  textarea.addEventListener('focus', function() {
    if (textarea.value === "") { // 入力内容が空の場合
      textarea.style.height = 'auto';
      textarea.style.height = firstHeight + 'px'; // 初期の高さに設定
    } else {
      textarea.style.height = 'auto';
      textarea.style.height = lastHeight + 'px';
    }
  });

  // textareaのclickイベントでbodyのclickイベントをキャンセル
  textarea.addEventListener('click', function(e) {
      e.stopPropagation();
  });

  $('.modal').on('hidden.bs.modal', function () {
    // ここにすべてのモーダルが閉じた後に実行したい関数やコードを記述します
    closeCamera();
    console.log("閉じました。");
  });
});

function setPlaceholder(selectedOption, inputForm) {
  switch (selectedOption) {
    case '質問':
      inputForm.placeholder = "問題や質問を入力してください。";
      break;
    case '直訳・翻訳':
      inputForm.placeholder = "訳したい文章や単語を入力してください。";
      break;
    case '口語訳':
      inputForm.placeholder = "口語訳したい文章や単語を入力してください。";
      break;
    case '現代語訳':
      inputForm.placeholder = "現代語訳したい文章や単語を入力してください。";
      break;
    case '要約':
      inputForm.placeholder = "要約したい文章を入力してください。";
      break;
    case '添削':
      inputForm.placeholder = "添削したい文章を入力してください。";
      break;
    case '検索':
      inputForm.placeholder = "見つけたい問題を入力してください。";
      break;
    default:
      break;
  }  
}
