// optionHandleFunctions.jsに追加するコード

// パネルの開閉状態を追跡する変数
let isPanelOpen = false;

// 現代語訳・口語訳オプションのUI要素にイベントリスナーを追加する関数を拡張
function handleAncientTranslationOption(modalElement) {
  // 既存の処理を維持
  updateSelectedOption(modalElement, '現代語訳・口語訳');
  updateUIElementDisplay(modalElement, '.how-to-answer', 'none');
  updateUIElementDisplay(modalElement, '.translate', 'none');
  updateUIElementDisplay(modalElement, '.ancient-translation-options', 'block');
  updateUIElementDisplay(modalElement, '.wrap-up-options', 'none');

  // 新しいUIの動作を追加
  const ancientTranslationOptions = modalElement.querySelector('.ancient-translation-options');
  setupAncientTranslationOptions(ancientTranslationOptions);
}

// 現代語訳・口語訳オプションのための新しいUIの動作を設定する関数
function setupAncientTranslationOptions(ancientTranslationOptions) {
  const otherOptionRadioButton = ancientTranslationOptions.querySelector('.other-option');
  const noImageOptionRadioButton = ancientTranslationOptions.querySelector('.no-image-option');
  const noImageOptions = ancientTranslationOptions.querySelector('.no_image_options');

  otherOptionRadioButton.addEventListener('change', () => {
    noImageOptions.style.display = otherOptionRadioButton.checked ? 'none' : 'block';
  });

  noImageOptionRadioButton.addEventListener('change', () => {
    noImageOptions.style.display = noImageOptionRadioButton.checked ? 'block' : 'none';
  });
}

// パネルの開閉とバリデーションのロジックを含む関数
function setupPanelToggleAndValidation(modalElement) {
  document.querySelector('.circle-quarter').addEventListener('click', function() {
    const activeOptionElement = modalElement.querySelector('.option-carousel .option.active');
    const isActiveOptionTranslation = activeOptionElement && activeOptionElement.dataset.option === '現代語訳・口語訳';

    if (isPanelOpen && isActiveOptionTranslation) {
      const workNameInput = modalElement.querySelector('input[name="work_name"]');
      const textTypeSelect = modalElement.querySelector('select[name="text_type"]');
      const otherRadioButton = modalElement.querySelector('input[name="option_select"][value="other"]');
      
      if (!otherRadioButton.checked) {
        if (!workNameInput.value || !textTypeSelect) {
          alert("作品名や種類を明確にして下さい。");
          return;
        }
      }
    }

    // パネルと背景の表示を切り替え
    togglePanelAndBackground();
    isPanelOpen = !isPanelOpen;
  });
}

// パネルと背景の表示を切り替える関数
function togglePanelAndBackground() {
  document.getElementById('option-panel').classList.toggle('panelactive');
  document.querySelector('.circle-bg').classList.toggle('circleactive');
  const gear = document.querySelector('.gear');
  gear.classList.toggle('rotateLeft');
  const svg = gear.querySelector('.ai-Gear');
  svg.classList.toggle('stroke-black');
}

// ページ読み込み時や適切なタイミングでこれらの関数を呼び出す
document.addEventListener('DOMContentLoaded', function() {
  const modalElement = document.querySelector('.cameraModal');
  if (modalElement) {
    handleAncientTranslationOption(modalElement);
    setupPanelToggleAndValidation(modalElement);
  }
});
