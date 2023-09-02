// app/javascript/javascripts/helpers/isInCharacterRect.js

function isInCharacterRect(characterRect, point) {
  if (characterRect === null) return false;
  return point.x >= characterRect.x && point.x <= characterRect.x + characterRect.width
      && point.y >= characterRect.y && point.y <= characterRect.y + characterRect.height;
}

export default isInCharacterRect;
