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

  // Intersection Observerのコールバック関数
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      // entry.isIntersectingがtrueの場合、要素がビューポートに入った
      if (entry.isIntersecting) {
        const adName = entry.target.getAttribute('data-ad-name'); // 広告名を取得

        // Google Analyticsへイベントを送信
        gtag('event', 'impression', {
          'event_category': 'Advertisement',
          'event_label': adName,
          'non_interaction': true
        });

        // インプレッションを記録したら、その要素の監視を停止
        observer.unobserve(entry.target);
      }
    });
  };

  // Intersection Observerのインスタンスを作成し、監視を開始
  const observer = new IntersectionObserver(observerCallback);
  document.querySelectorAll('.ad-banner').forEach((ad) => {
    observer.observe(ad);
  });

  document.querySelectorAll('.ad-banner').forEach((ad) => {
    ad.addEventListener('click', function() {
      const adName = this.getAttribute('data-ad-name'); // 広告名を取得
  
      // Google Analyticsへクリックイベントを送信
      gtag('event', 'click', {
        'event_category': 'Advertisement',
        'event_label': adName
      });
    });
  });
});