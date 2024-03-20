function setPlaceholder(selectedOption, inputForm) {
  switch (selectedOption) {
    case '質問':
      inputForm.placeholder = "問題や質問を入力してください。";
      break;
    case '直訳・翻訳':
      inputForm.placeholder = "訳したい文章や単語を入力してください。";
      break;
    case '現代語訳・口語訳':
      inputForm.placeholder = "現代語訳または口語訳したい文章や単語を入力してください。";
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

function resetOptionsActiveState(options) {
  options.forEach((option, index) => {
    if (index === 0) { // デフォルトで最初のオプション（「質問」）をアクティブにする
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

function updateUIElementDisplay(element, elementClass, displayState) {
  const elem = element.querySelector(elementClass);
  if (elem) {
    elem.style.display = displayState;
  }
}

function updateOptionActiveState(optionElements) {
  optionElements.forEach(option => {
    option.addEventListener('click', () => {
      optionElements.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
    });
  });
}  

function updateSelectedOption(modalElement, optionValue) {
  const selectedOption = modalElement.querySelector('.selected-option');
  const questionInputForm = modalElement.querySelector('.question-input-form');
  selectedOption.value = optionValue;
  setPlaceholder(selectedOption.value, questionInputForm);
}  

// optionHandleFunctions.jsに追加するコード

// パネルの開閉状態を追跡する変数
let isPanelOpen = false;

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
function setupPanelToggleAndValidation() {
  const cameraModal = document.querySelector('.cameraModal')
  cameraModal.querySelector('.circle-quarter').addEventListener('click', function() {
    const activeOptionElement = cameraModal.querySelector('.option-carousel .option.active');
    const isActiveOptionTranslation = activeOptionElement && activeOptionElement.dataset.option === '現代語訳・口語訳';

    if (isPanelOpen && isActiveOptionTranslation) {
      const workNameInput = cameraModal.querySelector('input[name="work_name"]');
      const textTypeSelect = cameraModal.querySelector('select[name="text_type"]');
      const otherRadioButton = cameraModal.querySelector('input[name="option_select"][value="other"]');
      
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

window.setupPanelToggleAndValidation = setupPanelToggleAndValidation;

// パネルと背景の表示を切り替える関数
function togglePanelAndBackground() {
  document.getElementById('option-panel').classList.toggle('panelactive');
  document.querySelector('.circle-bg').classList.toggle('circleactive');
  const gear = document.querySelector('.gear');
  gear.classList.toggle('rotateLeft');
  const svg = gear.querySelector('.ai-Gear');
  svg.classList.toggle('stroke-black');
}

function handleQuestionOption(modalElement) {
  updateSelectedOption(modalElement, '質問');
  
  updateUIElementDisplay(modalElement, '.how-to-answer', 'block');
  updateUIElementDisplay(modalElement, '.translate', 'none');
  updateUIElementDisplay(modalElement, '.ancient-translation-options', 'none');
  updateUIElementDisplay(modalElement, '.wrap-up-options', 'none');

  const answerOptions = modalElement.querySelectorAll('.container .answerOption');
  updateOptionActiveState(answerOptions);
  answerOptions.forEach(function(option) {
    option.addEventListener('click', function() {
      var value = this.getAttribute('data-value');
      // 'answerType'の隠しフィールドの値を更新
      modalElement.querySelector('#answerType').value = value == 0 ? "withExplain" : value == 1 ? "onlyAnswer" : "hint";
    });
  });
}

function handleTranslateOption(modalElement) {
  updateSelectedOption(modalElement, '直訳・翻訳');

  updateUIElementDisplay(modalElement, '.how-to-answer', 'none');
  updateUIElementDisplay(modalElement, '.translate', 'block');
  updateUIElementDisplay(modalElement, '.ancient-translation-options', 'none');
  updateUIElementDisplay(modalElement, '.wrap-up-options', 'none');

  // 言語の初期値（適切な初期値を設定してください）
  let fromLanguage = "English";
  let toLanguage = "Japanese";

  // HTMLCollectionまたはNodeListを配列に変換
  const fromLanguageSelect = modalElement.querySelector('.form-select[name="fromLanguage"]');
  const toLanguageSelect = modalElement.querySelector('.form-select[name="toLanguage"]');
  const switchLanguageButton = modalElement.querySelector('#switchLanguage');

  // fromLanguage用のイベントリスニング
  fromLanguageSelect.addEventListener('change', function(event) {
    const oldFromLanguage = fromLanguage;
    fromLanguage = event.target.value;

    if (fromLanguage === toLanguage) {
      toLanguage = oldFromLanguage;
      toLanguageSelect.value = toLanguage;  // 同じインデックスのtoLanguageSelect要素を更新
    }
  });
  
  // toLanguage用のイベントリスニング
  toLanguageSelect.addEventListener('change', function(event) {
    const oldToLanguage = toLanguage;
    toLanguage = event.target.value;

    if (fromLanguage === toLanguage) {
      fromLanguage = oldToLanguage;
      fromLanguageSelect.value = fromLanguage;  // 同じインデックスのfromLanguageSelect要素を更新
    }
  });

  // switchLanguage用のイベントリスニング
  switchLanguageButton.addEventListener('click', function() {
    const temp = fromLanguage;
    fromLanguage = toLanguage;
    toLanguage = temp;

    fromLanguageSelect.value = fromLanguage;  // 同じインデックスのfromLanguageSelect要素を更新
    toLanguageSelect.value = toLanguage;      // 同じインデックスのtoLanguageSelect要素を更新
  });

  const translateOptions = modalElement.querySelectorAll('.container .translateOption');
  updateOptionActiveState(translateOptions);
}

function handleAncientTranslationOption(modalElement) {
  updateSelectedOption(modalElement, '現代語訳・口語訳');

  updateUIElementDisplay(modalElement, '.how-to-answer', 'none');
  updateUIElementDisplay(modalElement, '.translate', 'none');
  updateUIElementDisplay(modalElement, '.ancient-translation-options', 'block');
  updateUIElementDisplay(modalElement, '.wrap-up-options', 'none');

  const translateAncientOptions = modalElement.querySelectorAll('.container .translate-ancient-option');
  const translateAncientOptionGroup = modalElement.querySelector('.ancient-translation-options');
  updateOptionActiveState(translateAncientOptions);
  setupAncientTranslationOptions(translateAncientOptionGroup);
}  

function handleWrapUpOption(modalElement) {
  updateSelectedOption(modalElement, '要約');

  updateUIElementDisplay(modalElement, '.how-to-answer', 'none');
  updateUIElementDisplay(modalElement, '.translate', 'none');
  updateUIElementDisplay(modalElement, '.ancient-translation-options', 'none');
  updateUIElementDisplay(modalElement, '.wrap-up-options', 'block');

  // HTMLCollectionまたはNodeListを配列に変換
  const delimiterSelect = modalElement.querySelector('.form-select[name="delimiter"]');
  const wordCountSelect = modalElement.querySelector('.form-select[id="word-count"]');
  const characterCountSelect = modalElement.querySelector('.form-select[id="character-count"]');
  delimiterSelect.addEventListener('change', function(event) {
    // この要素が属している.wrap-up-options要素を取得
    const wrapUpOptions = this.closest('.wrap-up-options');

    // wrapUpOptions内の要素に対してのみ操作を行う
    const wordCountText = wrapUpOptions.querySelector('#word-count-text');
    const characterCountText = wrapUpOptions.querySelector('#character-count-text');

    if (event.target.value === '日本語') {
      characterCountSelect.style.display = 'block';
      wordCountSelect.style.display = 'none';
      characterCountText.style.display = 'block';
      wordCountText.style.display = 'none';
    } else {
      wordCountSelect.style.display = 'block';
      characterCountSelect.style.display = 'none';
      wordCountText.style.display = 'block';
      characterCountText.style.display = 'none';
    }
  });
}  

function checkCorrectOption(modalElement) {
  updateSelectedOption(modalElement, '添削');

  updateUIElementDisplay(modalElement, '.how-to-answer', 'none');
  updateUIElementDisplay(modalElement, '.translate', 'none');
  updateUIElementDisplay(modalElement, '.ancient-translation-options', 'none');
  updateUIElementDisplay(modalElement, '.wrap-up-options', 'none');
}  

function updateUIElements(modalElement, selectedOption) {
  switch (selectedOption) {
    case '質問':
      handleQuestionOption(modalElement);
      break;
    case '直訳・翻訳':
      handleTranslateOption(modalElement);
      break;
    case '現代語訳・口語訳':
      handleAncientTranslationOption(modalElement);
      break;
    case '要約':
      handleWrapUpOption(modalElement);
      break;
    case '添削':
      checkCorrectOption(modalElement);
      break;
    default:
      handleQuestionOption(modalElement);
      break;
  }
}

function handleOptionClick(modalElement, allOptions, option) {
  // すべてのオプションから 'active' クラスを削除
  allOptions.forEach(opt => opt.classList.remove('active'));

  // クリックしたオプションに 'active' クラスを追加
  option.classList.add('active');

  // UI要素の表示切り替え処理
  updateUIElements(modalElement, option.dataset.option);
}

export async function handleOption(modalElement) {
  const modalOptions = modalElement.querySelectorAll('.option-carousel .option');
  modalOptions.forEach(option => {
    option.addEventListener('click', () => handleOptionClick(modalElement, modalOptions, option));
  });  
}

export async function resetFormToDefault(modalElement) {
  // テキストフィールドのリセット
  const textInputs = modalElement.querySelectorAll('.form-control');
  textInputs.forEach(input => {
    input.value = ''; // テキストフィールドを空にする
  });

  // セレクトボックスのリセット
  const selectInputs = modalElement.querySelectorAll('.form-select');
  selectInputs.forEach(select => {
    if (select.name == 'toLanguage')
    {
      select.selectedIndex = 1;
    } else {
      select.selectedIndex = 0; // セレクトボックスの最初のオプションを選択
    }
  });

  // ラジオボタンのリセット
  const noImageOption = modalElement.querySelector('.no-image-option');
  if (noImageOption) {
    noImageOption.checked = true; // 「詳細を指定」オプションをデフォルトに設定
    noImageOption.dispatchEvent(new Event('change'));
  }

  const panelOptions = [];
  const modalOptions = modalElement.querySelectorAll('.option-carousel .option');
  const answerOptions = modalElement.querySelectorAll('.container .answerOption');
  const translateOptions = modalElement.querySelectorAll('.container .translateOption');
  const translateAncientOptions = modalElement.querySelectorAll('.container .translate-ancient-option');
  panelOptions.push(modalOptions, answerOptions, translateOptions, translateAncientOptions);
  // オプションのアクティブ状態をリセット
  panelOptions.forEach(option => resetOptionsActiveState(option));

  // 既定のオプションのUIを表示する（この例では「質問」オプション）
  handleQuestionOption(modalElement);
}