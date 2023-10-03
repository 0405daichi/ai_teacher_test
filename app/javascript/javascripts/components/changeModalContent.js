// // app/javascript/javascripts/components/changeModalContent.js

// // import { Modal } from 'bootstrap';

// // let parentModalBody = null;
// // let parentModalFooter = null;
// // let parentModalContent = null;
// // let parentModal = null;

// // document.addEventListener('turbolinks:load', () => {
// //   parentModalBody = document.querySelector('.modal-body');
// //   parentModalFooter = document.querySelector('.modal-footer');
// //   parentModalContent = document.getElementById('myModal');
// //   parentModal = new Modal(parentModalContent, {
// //     keyboard: false,
// //     backdrop: 'true'
// //   });
// // });

// function changeModalContentToForm(formId, formLabel, inputId, modalBody, modalFooter, myModal, displayOptions = true) {
//   // // 既存の内容を削除
//   // modalBody.innerHTML = '';
//   // modalFooter.innerHTML = '';

//   // // オプションの配列
//   // const options = ['答えだけ', '解説も', '翻訳', '口語訳', '現代語訳', '要約', '添削'];

//   // // オプションのHTMLを生成
//   // const optionsHtml = options.map((option, index) => `
//   //   <div class="option ${index === 0 ? 'active' : ''}" data-option="${option}">
//   //     ${option}
//   //   </div>
//   // `).join('');

//   // // 新しい内容を追加
//   // modalBody.innerHTML = `
//   // ${displayOptions ? '<div class="option-carousel">' + optionsHtml + '</div>' : ''}
//   // <form id="${formId}">
//   //   <div class="mb-3">
//   //     <label for="${inputId}" class="form-label">${formLabel}</label>
//   //     <div class="d-flex">
//   //       <input type="text" class="form-control mr-2" id="${inputId}">
//   //       <button type="button" id="photoButton" class="btn btn-primary">写真で入力</button>
//   //     </div>
//   //   </div>
//   //   <button type="submit" class="btn btn-primary">Submit</button>
//   //   <button type="button" class="btn btn-secondary" id="closeButton">Close</button>
//   // </form>
//   // `;

//   // // オプションにクリックイベントを追加
//   // const optionElements = document.querySelectorAll('.option-carousel .option');
//   // optionElements.forEach(optionElement => {
//   //   optionElement.addEventListener('click', function() {
//   //     // 既存のアクティブなオプションの色をリセット
//   //     document.querySelector('.option-carousel .option.active').classList.remove('active');

//   //     // 新しく選択されたオプションの色を設定
//   //     this.classList.add('active');
//   //   });
//   // });

//   // const inputField = document.getElementById(inputId);

//   // inputField.addEventListener('input', function() {
//   //   if (this.value !== '') {
//   //     myModal._config.backdrop = 'static'; // Prevent the modal from closing when clicking outside of it
//   //   } else {
//   //     myModal._config.backdrop = 'true'; // Allow the modal to close when clicking outside of it again
//   //   }
//   // });

//   // document.getElementById('closeButton').addEventListener('click', function(event) {
//   //   if (inputField.value !== '') {
//   //     const shouldClose = window.confirm('入力した内容は破棄されます。');
//   //     if (shouldClose) {
//   //       inputField.value = '';  // Clear the input field
//   //       myModal._config.backdrop = 'true'; // Allow the modal to close when clicking outside of it again
//   //       myModal.hide();  // Close the modal
//   //     } else {
//   //       event.preventDefault();  // Prevent the modal from closing
//   //       event.stopImmediatePropagation(); // Also prevent Bootstrap from closing it
//   //     }
//   //   } else {
//   //     myModal.hide();  // Close the modal
//   //   }
//   // });

//   // // 新しいフォームが追加された後でsubmitイベントを監視
//   // document.getElementById(formId).addEventListener('submit', function(event) {
//   //   event.preventDefault();  // ページのリロードを防ぐ
//   //   console.log(document.getElementById(inputId).value);
//   //   this.reset();  // フォームをリセット
//   // });

//   // // 「写真で入力」ボタンがクリックされたら新しいモーダルを表示
//   // document.getElementById('photoButton').addEventListener('click', function() {
//   //   myModal.hide(); // Close the current modal

//   //   const newModalElement = document.createElement('div');
//   //   newModalElement.className = 'modal fade';
//   //   newModalElement.tabIndex = -1;
//   //   newModalElement.setAttribute('aria-hidden', 'true');

//   //   const newModalDialog = document.createElement('div');
//   //   newModalDialog.className = 'modal-dialog modal-dialog-centered';

//   //   const newModalContent = document.createElement('div');
//   //   newModalContent.className = 'modal-content';

//   //   const newModalBody = document.createElement('div');
//   //   newModalBody.className = 'modal-body';
//   //   newModalBody.innerHTML = `
//   //     <button type="button" id="selectPhoto" class="btn btn-primary">写真を選ぶ</button>
//   //     <button type="button" id="takePhoto" class="btn btn-primary">写真を撮る</button>
//   //     <button type="button" id="backButton" class="btn btn-secondary">戻る</button>
//   //   `;

//   //   newModalContent.appendChild(newModalBody);
//   //   newModalDialog.appendChild(newModalContent);
//   //   newModalElement.appendChild(newModalDialog);
//   //   document.body.appendChild(newModalElement);

//   //   // Create a new modal with the photo options and show it
//   //   const newModal = new Modal(newModalElement, {backdrop: 'static'});
//   //   newModal.show();

//   //   // 戻るボタンがクリックされたら、元のモーダルを再表示する前に状態を復元
//   //   document.getElementById('backButton').addEventListener('click', function() {
//   //     newModal.hide(); // Close the current modal
//   //     // 元のモーダルの状態を復元
//   //     if (displayOptions){
//   //       changeModalContentToForm('questionForm', 'Enter your question:', 'questionInput', modalBody, modalFooter, parentModal, displayOptions);
//   //     } else {
//   //       changeModalContentToForm('searchForm', 'Search your question:', 'searchInput', modalBody, modalFooter, parentModal, displayOptions);
//   //     }
//   //   });
//   // });
// }

// export default changeModalContentToForm;