/**
 * Korean postposition (조사) helper
 * Determines correct particle based on whether the last character has a final consonant (받침)
 */

function hasBatchim(str) {
  if (!str) return false;
  const last = str.charCodeAt(str.length - 1);
  // Korean syllable block range: 0xAC00 ~ 0xD7A3
  if (last < 0xAC00 || last > 0xD7A3) return false;
  return (last - 0xAC00) % 28 !== 0;
}

/** 은/는 */
export function eunNeun(noun) {
  return hasBatchim(noun) ? '은' : '는';
}

/** 이/가 */
export function iGa(noun) {
  return hasBatchim(noun) ? '이' : '가';
}

/** 을/를 */
export function eulReul(noun) {
  return hasBatchim(noun) ? '을' : '를';
}

/** 아/야 (호칭) */
export function aYa(noun) {
  return hasBatchim(noun) ? '아' : '야';
}

/** noun + 조사 합치기 */
export function pp(noun, type) {
  switch (type) {
    case '은는': return noun + eunNeun(noun);
    case '이가': return noun + iGa(noun);
    case '을를': return noun + eulReul(noun);
    case '아야': return noun + aYa(noun);
    default: return noun;
  }
}
