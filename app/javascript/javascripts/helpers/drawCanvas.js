// app/javascript/javascripts/helpers/drawCanvas.js

function drawCanvas(canvas, ctx, image, characterImage) {
  // canvasのサイズをウィンドウのサイズに合わせる
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // コンテキストをリセット
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // canvasの中心に移動
  ctx.translate(canvas.width/2, canvas.height/2);

  // 企業ロゴ（背景）を描画
  if (image.complete) {
    ctx.drawImage(image, -image.width/2, -image.height/2);
  }
  
  // キャラクター（前景）を描画
  if (characterImage.complete) {
    const xPos = -characterImage.width/2;
    const yPos = -characterImage.height/2;
    ctx.drawImage(characterImage, xPos, yPos);
    return { x: xPos, y: yPos, width: characterImage.width, height: characterImage.height };
  }
}

export default drawCanvas;
