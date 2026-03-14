/**
 * SpriteCache - pre-renders game sprites to offscreen canvases
 */
export class SpriteCache {
  constructor() {
    this.cache = new Map();
  }

  init() {
    this._renderCharacters();
    this._renderCompanions();
  }

  get(name) {
    return this.cache.get(name);
  }

  draw(ctx, name, x, y, scale = 1, flipX = false) {
    const sprite = this.cache.get(name);
    if (!sprite) return;
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }

  _mk(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return [c, c.getContext('2d')];
  }

  _renderCharacters() {
    // Ria - 6yo girl, green outfit
    this._renderGirl('ria', '#4CAF50', '#2E7D32', '#3E2723', 'bob');
    // Lisa - 4yo girl, pink outfit, pigtails
    this._renderGirl('lisa', '#FF69B4', '#E91E63', '#5D4037', 'pigtails');
  }

  _renderGirl(name, bodyColor, bodyDark, hairColor, hairStyle) {
    const [c, ctx] = this._mk(48, 64);
    const cx = 24;
    const headY = 18; // bigger head, chibi style
    const bodyY = 38;
    const skinColor = '#FDDCB5';
    const eyeColor = name === 'lisa' ? '#6B4226' : '#2E4A1E';

    // --- Hair back layer (behind head) ---
    ctx.fillStyle = hairColor;
    if (hairStyle === 'pigtails') {
      // Back hair volume
      ctx.beginPath();
      ctx.arc(cx, headY, 17, 0, Math.PI * 2);
      ctx.fill();
      // Pigtail left
      ctx.beginPath();
      ctx.ellipse(cx - 17, headY + 4, 6, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Pigtail right
      ctx.beginPath();
      ctx.ellipse(cx + 17, headY + 4, 6, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Hair ties
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(cx - 17, headY - 5, 3, 0, Math.PI * 2);
      ctx.arc(cx + 17, headY - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Bob cut back volume
      ctx.beginPath();
      ctx.arc(cx, headY - 1, 17, 0, Math.PI * 2);
      ctx.fill();
      // Side hair
      ctx.beginPath();
      ctx.ellipse(cx - 14, headY + 6, 5, 10, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 14, headY + 6, 5, 10, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Body (dress) ---
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx - 11, bodyY - 6);
    ctx.quadraticCurveTo(cx - 14, bodyY + 12, cx - 12, bodyY + 16);
    ctx.lineTo(cx + 12, bodyY + 16);
    ctx.quadraticCurveTo(cx + 14, bodyY + 12, cx + 11, bodyY - 6);
    ctx.closePath();
    ctx.fill();

    // Dress collar / detail
    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.moveTo(cx - 6, bodyY - 6);
    ctx.lineTo(cx, bodyY - 2);
    ctx.lineTo(cx + 6, bodyY - 6);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(cx - 13, bodyY + 2, 4, 8, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 13, bodyY + 2, 4, 8, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Sleeves
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 12, bodyY - 2, 5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 12, bodyY - 2, 5, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // --- Head (face) ---
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(cx, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // --- Hair front layer ---
    ctx.fillStyle = hairColor;
    if (hairStyle === 'pigtails') {
      // Bangs
      ctx.beginPath();
      ctx.arc(cx, headY, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
      // Fringe detail
      ctx.beginPath();
      ctx.moveTo(cx - 12, headY - 8);
      ctx.quadraticCurveTo(cx - 6, headY - 2, cx, headY - 6);
      ctx.quadraticCurveTo(cx + 6, headY - 2, cx + 12, headY - 8);
      ctx.lineTo(cx + 15, headY - 12);
      ctx.arc(cx, headY, 16, -0.4, Math.PI + 0.4, true);
      ctx.closePath();
      ctx.fill();
    } else {
      // Bob cut bangs
      ctx.beginPath();
      ctx.arc(cx, headY - 1, 16, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      // Straight fringe
      ctx.beginPath();
      ctx.moveTo(cx - 14, headY - 6);
      ctx.quadraticCurveTo(cx - 7, headY - 1, cx, headY - 4);
      ctx.quadraticCurveTo(cx + 7, headY - 1, cx + 14, headY - 6);
      ctx.lineTo(cx + 16, headY - 10);
      ctx.arc(cx, headY - 1, 16, -0.2, Math.PI + 0.2, true);
      ctx.closePath();
      ctx.fill();
      // Hair clip (green)
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Eyes (big, cute anime-style) ---
    // Eye whites
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 3, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 3, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(cx - 6, headY + 3.5, 2, 0, Math.PI * 2);
    ctx.arc(cx + 6, headY + 3.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine (two highlights per eye)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 4.5, headY + 1.5, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 7.5, headY + 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 7, headY + 4.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 5, headY + 4.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes (top)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 2, 4.5, 5, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 2, 4.5, 5, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Blush
    ctx.fillStyle = 'rgba(255,140,140,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose (tiny dot)
    ctx.fillStyle = 'rgba(200,140,100,0.4)';
    ctx.beginPath();
    ctx.arc(cx, headY + 5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (happy smile)
    ctx.strokeStyle = '#E57373';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, headY + 8, 3, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // --- Legs ---
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 6, bodyY + 14, 5, 8);
    ctx.fillRect(cx + 1, bodyY + 14, 5, 8);

    // Socks
    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx - 6, bodyY + 18, 5, 4);
    ctx.fillRect(cx + 1, bodyY + 18, 5, 4);

    // Shoes
    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.ellipse(cx - 4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderCompanions() {
    // Bori - black Chow Chow
    this._renderDog('bori', '#333333', '#1a1a1a');
    // Jopssal - spotted puppy
    this._renderDog('jopssal', '#D4A574', '#8B6F47');
    // Ikdol - orange pteranodon
    this._renderPteranodon('ikdol', '#FF8C00', '#E67300');
    // Gosun - white cat with black patches
    this._renderCat('gosun', '#FFFFFF', '#333333');
  }

  _renderDog(name, bodyColor, darkColor) {
    const [c, ctx] = this._mk(40, 36);
    const cx = 20, cy = 18;

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 4, 9, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 12, 4, 6, -0.4, 0, Math.PI * 2);
    ctx.ellipse(cx + 16, cy - 12, 4, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 7, cy - 5, 3, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 5, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 17, cy - 3, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots for jopssal
    if (name === 'jopssal') {
      ctx.fillStyle = '#8B6F47';
      ctx.beginPath();
      ctx.arc(cx - 4, cy + 2, 4, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy + 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy);
    ctx.quadraticCurveTo(cx - 18, cy - 10, cx - 14, cy - 14);
    ctx.stroke();

    // Legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(cx - 8, cy + 10, 4, 6);
    ctx.fillRect(cx - 1, cy + 10, 4, 6);
    ctx.fillRect(cx + 6, cy + 10, 4, 6);
    ctx.fillRect(cx + 13, cy + 10, 4, 6);

    this.cache.set(`${name}-idle`, c);
  }

  _renderPteranodon(name, bodyColor, darkColor) {
    const [c, ctx] = this._mk(56, 40);
    const cx = 28, cy = 20;

    // Wings
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx - 24, cy - 16, cx - 26, cy + 4);
    ctx.lineTo(cx - 10, cy + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + 24, cy - 16, cx + 26, cy + 4);
    ctx.lineTo(cx + 10, cy + 2);
    ctx.fill();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#FFE0A0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Crest
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 9);
    ctx.lineTo(cx + 6, cy - 16);
    ctx.lineTo(cx + 15, cy - 8);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 3);
    ctx.lineTo(cx + 26, cy);
    ctx.lineTo(cx + 18, cy + 1);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 15, cy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderCat(name, bodyColor, patchColor) {
    const [c, ctx] = this._mk(40, 36);
    const cx = 20, cy = 18;

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black patches on body
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy + 2, 5, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy + 6, 4, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Black patch on head (over one eye)
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 6, 5, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ears (triangles)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 10);
    ctx.lineTo(cx + 2, cy - 18);
    ctx.lineTo(cx + 8, cy - 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 10);
    ctx.lineTo(cx + 18, cy - 18);
    ctx.lineTo(cx + 16, cy - 9);
    ctx.fill();

    // Inner ears (pink)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 11);
    ctx.lineTo(cx + 3, cy - 16);
    ctx.lineTo(cx + 7, cy - 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 10);
    ctx.lineTo(cx + 17, cy - 16);
    ctx.lineTo(cx + 16, cy - 10);
    ctx.fill();

    // Left ear black patch
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 14);
    ctx.lineTo(cx + 2, cy - 18);
    ctx.lineTo(cx + 5, cy - 13);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#90EE90'; // green cat eyes
    ctx.beginPath();
    ctx.ellipse(cx + 7, cy - 4, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 13, cy - 4, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupils (vertical slits)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 7, cy - 4, 1, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 13, cy - 4, 1, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose (tiny pink triangle)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 1);
    ctx.lineTo(cx + 9, cy + 1);
    ctx.lineTo(cx + 11, cy + 1);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 1); ctx.lineTo(cx - 1, cy - 3);
    ctx.moveTo(cx + 6, cy); ctx.lineTo(cx - 1, cy + 1);
    ctx.moveTo(cx + 14, cy - 1); ctx.lineTo(cx + 21, cy - 3);
    ctx.moveTo(cx + 14, cy); ctx.lineTo(cx + 21, cy + 1);
    ctx.stroke();

    // Tail (curvy)
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 2);
    ctx.quadraticCurveTo(cx - 18, cy - 6, cx - 14, cy - 14);
    ctx.stroke();
    // Black tip on tail
    ctx.strokeStyle = patchColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 11);
    ctx.quadraticCurveTo(cx - 15, cy - 14, cx - 14, cy - 14);
    ctx.stroke();

    // Legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(cx - 6, cy + 10, 4, 5);
    ctx.fillRect(cx - 1, cy + 10, 4, 5);
    ctx.fillRect(cx + 5, cy + 10, 4, 5);
    ctx.fillRect(cx + 10, cy + 10, 4, 5);

    // Paws
    ctx.fillStyle = '#FFE0E0';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy + 15, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 1, cy + 15, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 7, cy + 15, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, cy + 15, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }
}
