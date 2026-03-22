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
    this._loadImageSprites();
  }

  /** Load PNG sprite assets for dinos and animals */
  _loadImageSprites() {
    const sprites = [
      'dino-trex', 'dino-tricera', 'dino-stego', 'dino-brachio',
      'dino-ptero', 'dino-veloci', 'dino-ankylo', 'dino-spino',
      'dino-parasauro', 'dino-diplo', 'dino-compy', 'dino-pachy',
      'animal-seahorse',
    ];
    for (const name of sprites) {
      const img = new Image();
      img.src = `assets/sprites/${name}.png`;
      // Set immediately as placeholder (draws once loaded)
      this.cache.set(name, img);
    }
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
    // Ria & Lisa — load PNG assets, keep procedural as fallback
    this._loadCharacterPNG('ria', '../our-mom-baby/assets/child-ria.png', '#4CAF50', '#2E7D32', '#3E2723', 'bob');
    this._loadCharacterPNG('lisa', '../our-mom-baby/assets/fairy-lisa.png', '#FF69B4', '#E91E63', '#5D4037', 'pigtails');
  }

  _loadCharacterPNG(name, pngPath, bodyColor, bodyDark, hairColor, hairStyle) {
    // Render procedural fallback first
    this._renderGirl(name, bodyColor, bodyDark, hairColor, hairStyle);
    // Then try to load PNG asset, resized to sprite dimensions
    const img = new Image();
    img.onload = () => {
      // Resize to ~48x64 sprite size while preserving aspect ratio
      const targetH = 64;
      const aspect = img.width / img.height;
      const targetW = Math.round(targetH * aspect);
      const [c, cctx] = this._mk(targetW, targetH);
      cctx.drawImage(img, 0, 0, targetW, targetH);
      this.cache.set(`${name}-idle`, c);
    };
    img.src = pngPath;
  }

  _renderGirl(name, bodyColor, bodyDark, hairColor, hairStyle) {
    const [c, ctx] = this._mk(48, 64);
    const cx = 24;
    const headY = 18;
    const bodyY = 38;
    const skinColor = '#FDDCB5';
    const eyeColor = name === 'lisa' ? '#6B4226' : '#2E4A1E';

    // --- Hair back layer ---
    ctx.fillStyle = hairColor;
    if (hairStyle === 'pigtails') {
      ctx.beginPath();
      ctx.arc(cx, headY, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 17, headY + 4, 6, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 17, headY + 4, 6, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(cx - 17, headY - 5, 3, 0, Math.PI * 2);
      ctx.arc(cx + 17, headY - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, headY - 1, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 14, headY + 6, 5, 10, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 14, headY + 6, 5, 10, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Body ---
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx - 11, bodyY - 6);
    ctx.quadraticCurveTo(cx - 14, bodyY + 12, cx - 12, bodyY + 16);
    ctx.lineTo(cx + 12, bodyY + 16);
    ctx.quadraticCurveTo(cx + 14, bodyY + 12, cx + 11, bodyY - 6);
    ctx.closePath();
    ctx.fill();

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

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 12, bodyY - 2, 5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 12, bodyY - 2, 5, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // --- Head ---
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(cx, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // --- Hair front ---
    ctx.fillStyle = hairColor;
    if (hairStyle === 'pigtails') {
      ctx.beginPath();
      ctx.arc(cx, headY, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 12, headY - 8);
      ctx.quadraticCurveTo(cx - 6, headY - 2, cx, headY - 6);
      ctx.quadraticCurveTo(cx + 6, headY - 2, cx + 12, headY - 8);
      ctx.lineTo(cx + 15, headY - 12);
      ctx.arc(cx, headY, 16, -0.4, Math.PI + 0.4, true);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, headY - 1, 16, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 14, headY - 6);
      ctx.quadraticCurveTo(cx - 7, headY - 1, cx, headY - 4);
      ctx.quadraticCurveTo(cx + 7, headY - 1, cx + 14, headY - 6);
      ctx.lineTo(cx + 16, headY - 10);
      ctx.arc(cx, headY - 1, 16, -0.2, Math.PI + 0.2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Eyes ---
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 3, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 3, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(cx - 6, headY + 3.5, 2, 0, Math.PI * 2);
    ctx.arc(cx + 6, headY + 3.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 4.5, headY + 1.5, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 7.5, headY + 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 7, headY + 4.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 5, headY + 4.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

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

    // Nose
    ctx.fillStyle = 'rgba(200,140,100,0.4)';
    ctx.beginPath();
    ctx.arc(cx, headY + 5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
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

    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx - 6, bodyY + 18, 5, 4);
    ctx.fillRect(cx + 1, bodyY + 18, 5, 4);

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
    // Bori - black Chow Chow (larger, fluffier)
    this._renderChowChow('bori');
    // Jopssal - spotted puppy (distinct spots)
    this._renderSpottedPuppy('jopssal');
    // Ikdol - orange pteranodon
    this._renderPteranodon('ikdol', '#FF8C00', '#E67300');
    // Gosun - white cat with black patches
    this._renderCat('gosun', '#FFFFFF', '#333333');
    // Azzi twins - white and sky-blue rabbits
    this._renderRabbit('azzi_white', '#FFFFFF', '#F5F5F5', '#FFB6C1');
    this._renderRabbit('azzi_blue', '#B0E0FF', '#87CEEB', '#FFB6C1');
    // NPC versions (with "?" bubble)
    this._renderCompanionNPC('bori');
    this._renderCompanionNPC('jopssal');
    this._renderCompanionNPC('ikdol');
    this._renderCompanionNPC('gosun');
    this._renderCompanionNPC('azzi_white');
    this._renderCompanionNPC('azzi_blue');
  }

  _renderChowChow(name) {
    const [c, ctx] = this._mk(52, 50);
    const cx = 26, cy = 25;

    // Fluffy body (chow chow is very fluffy)
    ctx.fillStyle = '#2a2a2a';
    // Fur outline (bigger circle for fluffiness)
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy mane around neck
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 2, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head (round chow face)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 6, 11, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy cheeks
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 18, cy - 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small rounded ears
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 19, cy - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (small, characteristic of chow chow)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 7, 3, 0, Math.PI * 2);
    ctx.arc(cx + 15, cy - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 7, 1.8, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 7, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 8.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 15, cy - 8.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Blue-black tongue (chow chow signature!)
    ctx.fillStyle = '#4a3a6a';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy + 1, 3, 4, 0, 0, Math.PI);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy - 2, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy tail (curled up)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Legs (thick, fluffy)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(cx - 10, cy + 12, 6, 8);
    ctx.fillRect(cx - 2, cy + 12, 6, 8);
    ctx.fillRect(cx + 6, cy + 12, 6, 8);
    ctx.fillRect(cx + 14, cy + 12, 6, 8);

    // Paws
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(cx - 7, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 1, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 17, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderSpottedPuppy(name) {
    const [c, ctx] = this._mk(52, 48);
    const cx = 26, cy = 24;

    // Body (cream/beige)
    ctx.fillStyle = '#F5E6D3';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 4, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brown spots on body
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy + 1, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 7, 5, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#F5E6D3';
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Brown patch over one eye
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(cx + 7, cy - 6, 6, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Floppy ears
    ctx.fillStyle = '#A0784C';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 6, 5, 10, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 20, cy - 6, 5, 10, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (big, puppy eyes)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy - 5, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 16, cy - 5, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3010';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 4.5, 2.2, 0, Math.PI * 2);
    ctx.arc(cx + 17, cy - 4.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 4, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 17, cy - 4, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 6, 1, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 6, 1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 20, cy - 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Happy mouth
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + 17, cy + 1, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Tongue
    ctx.fillStyle = '#FF8A9E';
    ctx.beginPath();
    ctx.ellipse(cx + 17, cy + 4, 2.5, 3, 0, 0, Math.PI);
    ctx.fill();

    // Wagging tail
    ctx.strokeStyle = '#F5E6D3';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy - 10, cx - 18, cy - 16);
    ctx.stroke();
    // Brown tip
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy - 12);
    ctx.quadraticCurveTo(cx - 19, cy - 16, cx - 18, cy - 16);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#F5E6D3';
    ctx.fillRect(cx - 10, cy + 12, 5, 7);
    ctx.fillRect(cx - 3, cy + 12, 5, 7);
    ctx.fillRect(cx + 4, cy + 12, 5, 7);
    ctx.fillRect(cx + 11, cy + 12, 5, 7);

    // Paws
    ctx.fillStyle = '#E8D5BF';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 1, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 6, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 13, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderPteranodon(name, bodyColor, darkColor) {
    const [c, ctx] = this._mk(64, 48);
    const cx = 32, cy = 24;

    // Wings (larger span)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx - 28, cy - 20, cx - 30, cy + 4);
    ctx.lineTo(cx - 20, cy + 4);
    ctx.lineTo(cx - 12, cy + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + 28, cy - 20, cx + 30, cy + 4);
    ctx.lineTo(cx + 20, cy + 4);
    ctx.lineTo(cx + 12, cy + 2);
    ctx.fill();

    // Wing membrane lines
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 22, cy + 2);
    ctx.moveTo(cx - 6, cy - 2); ctx.lineTo(cx - 26, cy - 4);
    ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 22, cy + 2);
    ctx.moveTo(cx + 6, cy - 2); ctx.lineTo(cx + 26, cy - 4);
    ctx.stroke();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#FFE0A0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 4, 9, 0, Math.PI * 2);
    ctx.fill();

    // Crest (signature pteranodon feature - bigger)
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 13);
    ctx.lineTo(cx + 4, cy - 22);
    ctx.lineTo(cx + 8, cy - 14);
    ctx.lineTo(cx + 18, cy - 11);
    ctx.fill();

    // Beak (longer, more pointed)
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy - 5);
    ctx.lineTo(cx + 32, cy - 2);
    ctx.lineTo(cx + 22, cy);
    ctx.fill();
    // Beak line
    ctx.strokeStyle = '#E68900';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy - 3);
    ctx.lineTo(cx + 30, cy - 2);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 17, cy - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 18, cy - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 17, cy - 6.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Small feet
    ctx.fillStyle = '#E68900';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 12);
    ctx.lineTo(cx - 8, cy + 18);
    ctx.lineTo(cx - 2, cy + 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 12);
    ctx.lineTo(cx, cy + 18);
    ctx.lineTo(cx + 6, cy + 14);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderCat(name, bodyColor, patchColor) {
    const [c, ctx] = this._mk(52, 48);
    const cx = 26, cy = 24;

    // Body (rounder, fluffier)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 4, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black patches on body
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy + 2, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 7, 5, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Head (round cat head)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Black patch on head (over one eye)
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 7, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Pointed ears
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy - 12);
    ctx.lineTo(cx + 1, cy - 22);
    ctx.lineTo(cx + 8, cy - 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 12);
    ctx.lineTo(cx + 19, cy - 22);
    ctx.lineTo(cx + 17, cy - 12);
    ctx.fill();

    // Inner ears (pink)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 13);
    ctx.lineTo(cx + 2, cy - 19);
    ctx.lineTo(cx + 7, cy - 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - 13);
    ctx.lineTo(cx + 18, cy - 19);
    ctx.lineTo(cx + 17, cy - 13);
    ctx.fill();

    // Left ear black patch
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 16);
    ctx.lineTo(cx + 1, cy - 22);
    ctx.lineTo(cx + 5, cy - 15);
    ctx.fill();

    // Eyes (big green cat eyes)
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 5, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 14, cy - 5, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupils (vertical slits)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 5, 1, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 14, cy - 5, 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 6.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy - 6.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Nose (pink triangle)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 2);
    ctx.lineTo(cx + 8.5, cy);
    ctx.lineTo(cx + 11.5, cy);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 1); ctx.lineTo(cx - 4, cy - 3);
    ctx.moveTo(cx + 5, cy); ctx.lineTo(cx - 4, cy + 1);
    ctx.moveTo(cx + 5, cy + 1); ctx.lineTo(cx - 3, cy + 3);
    ctx.moveTo(cx + 15, cy - 1); ctx.lineTo(cx + 24, cy - 3);
    ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 24, cy + 1);
    ctx.moveTo(cx + 15, cy + 1); ctx.lineTo(cx + 23, cy + 3);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 8, cy + 2);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 12, cy + 2);
    ctx.stroke();

    // Curvy tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy - 6, cx - 18, cy - 16);
    ctx.stroke();
    // Black tip
    ctx.strokeStyle = patchColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy - 12);
    ctx.quadraticCurveTo(cx - 19, cy - 16, cx - 18, cy - 16);
    ctx.stroke();

    // Legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(cx - 8, cy + 12, 5, 6);
    ctx.fillRect(cx - 2, cy + 12, 5, 6);
    ctx.fillRect(cx + 4, cy + 12, 5, 6);
    ctx.fillRect(cx + 10, cy + 12, 5, 6);

    // Paws
    ctx.fillStyle = '#FFE0E0';
    ctx.beginPath();
    ctx.ellipse(cx - 6, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 6, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderRabbit(name, bodyColor, shadowColor, innerEarColor) {
    const [c, ctx] = this._mk(48, 52);
    const cx = 24, cy = 26;

    // Body (round, plump)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body shadow
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 10, 5, 0, 0, Math.PI);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 10, 0, Math.PI * 2);
    ctx.fill();

    // Long ears (upright, floppy)
    ctx.fillStyle = bodyColor;
    // Left ear
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 24, 4, 12, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // Right ear (slightly tilted)
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 23, 4, 11, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = innerEarColor;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 23, 2.5, 8, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 22, 2.5, 7, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (big, round, cute)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 7, 3.5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 4, cy - 7, 3.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris
    ctx.fillStyle = name === 'azzi_white' ? '#8B4513' : '#4169E1';
    ctx.beginPath();
    ctx.arc(cx - 3.5, cy - 7, 2, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, cy - 7, 2, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx - 3.5, cy - 7, 1, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, cy - 7, 1, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 4.5, cy - 8, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 3.5, cy - 8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Nose (small pink triangle)
    ctx.fillStyle = '#FF9999';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3);
    ctx.lineTo(cx - 1.5, cy - 1.5);
    ctx.lineTo(cx + 1.5, cy - 1.5);
    ctx.fill();

    // Mouth (Y shape)
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 1.5);
    ctx.lineTo(cx, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 2, cy + 1.5);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 2, cy + 1.5);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 2); ctx.lineTo(cx - 10, cy - 3);
    ctx.moveTo(cx - 3, cy - 1); ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 3, cy - 2); ctx.lineTo(cx + 10, cy - 3);
    ctx.moveTo(cx + 3, cy - 1); ctx.lineTo(cx + 10, cy);
    ctx.stroke();

    // Front paws
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy + 13, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, cy + 13, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Paw pads
    ctx.fillStyle = innerEarColor;
    ctx.beginPath();
    ctx.arc(cx - 5, cy + 13, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy + 13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cotton tail (behind body)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }



  /**
   * Render NPC version of companion (with "?" indicator)
   */
  _renderCompanionNPC(type) {
    const sprite = this.cache.get(`${type}-idle`);
    if (!sprite) return;
    const padding = 12;
    const [c, ctx] = this._mk(sprite.width + padding, sprite.height + padding + 16);

    // Draw "?" bubble above
    const bubbleX = c.width / 2;
    const bubbleY = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6B00';
    ctx.fillText('?', bubbleX, bubbleY);

    // Draw the companion sprite below the bubble (slightly transparent)
    ctx.globalAlpha = 0.75;
    ctx.drawImage(sprite, padding / 2, padding / 2 + 16);
    ctx.globalAlpha = 1;

    this.cache.set(`${type}-npc`, c);
  }
}
