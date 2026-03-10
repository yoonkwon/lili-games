/**
 * SpriteCache - Pre-renders all game entities to offscreen canvases at startup.
 * Entities use drawImage() instead of redrawing path commands every frame.
 */
import { CHICK_COLORS } from './entity/Chick.js';

const PRED = [
  { name:'fox', body:'#FF8C42', belly:'#FFFFFF', tail:'#FF8C42', tip:'#FFFFFF', ear:'#FFB380' },
  { name:'weasel', body:'#8B6914', belly:'#F5DEB3', tail:'#8B6914', tip:'#5C4A0E', ear:'#C4A44A' },
  { name:'raccoon', body:'#808080', belly:'#C8C8C8', tail:'#808080', tip:'#404040', ear:'#A0A0A0' },
];

export class SpriteCache {
  constructor() { this.sprites = new Map(); this.ready = false; }

  init() {
    this._renderChicken(); this._renderChicks(); this._renderEggs();
    this._renderPredators(); this._renderDogs(); this._renderNest(); this._renderUI();
    this.ready = true;
  }

  get(name) { return this.sprites.get(name); }

  draw(ctx, name, x, y, scaleX = 1, scaleY = 1) {
    const s = this.sprites.get(name);
    if (!s) return false;
    ctx.save(); ctx.translate(x, y);
    if (scaleX !== 1 || scaleY !== 1) ctx.scale(scaleX, scaleY);
    ctx.drawImage(s.canvas, -s.width / 2, -s.height / 2);
    ctx.restore(); return true;
  }

  _mk(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    return { canvas: c, ctx: c.getContext('2d'), width: w, height: h };
  }
  _put(n, o) { this.sprites.set(n, o); }
  _lit(hex, a) { const n=parseInt(hex.replace('#',''),16); return `rgb(${Math.min(255,(n>>16)+a)},${Math.min(255,((n>>8)&0xFF)+a)},${Math.min(255,(n&0xFF)+a)})` }
  _drk(hex, a) { const n=parseInt(hex.replace('#',''),16); return `rgb(${Math.max(0,(n>>16)-a)},${Math.max(0,((n>>8)&0xFF)-a)},${Math.max(0,(n&0xFF)-a)})` }

  _ellipse(ctx, x, y, rx, ry, col) { ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fillStyle=col; ctx.fill(); }

  // ── Chicken ──
  _renderChicken() {
    this._chickenFrame('chicken-idle', 0, false);
    this._chickenFrame('chicken-idle-blink', 0, true);
    this._chickenFrame('chicken-squish', 0.15, false);
    this._chickenFrame('chicken-lay', 0.35, false);
    this._chickenHat('chicken-hat-crown', 1);
    this._chickenHat('chicken-hat-ribbon', 2);
    this._chickenHat('chicken-hat-flower', 3);
  }

  _chickenFrame(name, sq, blink = false) {
    const c = this._mk(170, 170), ctx = c.ctx;
    ctx.translate(85, 85);
    const sx = 1+sq*0.3, sy = 1-sq;
    ctx.scale(sx, sy);
    // Shadow
    ctx.save(); ctx.scale(1/sx,1/sy);
    this._ellipse(ctx,0,55,50,10,'rgba(0,0,0,0.12)'); ctx.restore();
    // Feet (smaller, cuter)
    for (let s=-1;s<=1;s+=2) { ctx.save(); ctx.translate(s*16,48);
      ctx.strokeStyle='#FFa040'; ctx.lineWidth=2.5; ctx.lineCap='round';
      for (let t=-1;t<=1;t++) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(t*6,8); ctx.stroke(); }
      ctx.restore(); }
    // Tail (fluffier, rounder)
    ctx.save(); ctx.translate(-38,-12);
    ['#F0B830','#FFD866','#E8B840'].forEach((col,i)=>{ ctx.save(); ctx.rotate(-0.25+i*0.25);
      ctx.beginPath(); ctx.ellipse(-10,-6+i*4,16,7,-0.4,0,Math.PI*2); ctx.fillStyle=col; ctx.fill(); ctx.restore(); });
    ctx.restore();
    // Body (rounder, softer)
    ctx.beginPath(); ctx.ellipse(0,12,46,40,0,0,Math.PI*2);
    const bg=ctx.createRadialGradient(-8,-2,8,0,12,46);
    bg.addColorStop(0,'#FFF2D0'); bg.addColorStop(0.4,'#FFD866'); bg.addColorStop(1,'#F0B830');
    ctx.fillStyle=bg; ctx.fill();
    // Belly (bigger, softer glow)
    ctx.beginPath(); ctx.ellipse(3,20,30,26,0.05,0,Math.PI*2);
    const bl=ctx.createRadialGradient(3,16,3,3,20,30);
    bl.addColorStop(0,'rgba(255,252,240,0.8)'); bl.addColorStop(1,'rgba(255,252,240,0)');
    ctx.fillStyle=bl; ctx.fill();
    // Wings (rounder, softer)
    for (let s=-1;s<=1;s+=2) { ctx.save(); ctx.translate(s*34,8); ctx.rotate(s*0.15);
      ctx.beginPath(); ctx.ellipse(s*6,3,18,13,s*0.2,0,Math.PI*2);
      const wg=ctx.createRadialGradient(s*3,0,2,s*6,3,18);
      wg.addColorStop(0,'#FFE89A'); wg.addColorStop(1,'#F0B830'); ctx.fillStyle=wg; ctx.fill();
      ctx.strokeStyle='rgba(200,160,60,0.2)'; ctx.lineWidth=0.8;
      for (let f=0;f<2;f++) { ctx.beginPath(); ctx.ellipse(s*(5+f*3),3+f*2,12-f*3,9-f*2,s*0.2,0,Math.PI*2); ctx.stroke(); }
      ctx.restore(); }
    // Head (BIGGER for cute proportions)
    ctx.save(); ctx.translate(3,-36);
    ctx.beginPath(); ctx.ellipse(0,0,32,28,0,0,Math.PI*2);
    const hg=ctx.createRadialGradient(-6,-6,4,0,0,32);
    hg.addColorStop(0,'#FFFAF0'); hg.addColorStop(0.5,'#FFE89A'); hg.addColorStop(1,'#FFD866');
    ctx.fillStyle=hg; ctx.fill();
    // Comb (smaller, cuter, more rounded)
    [{x:-6,y:-26,r:6},{x:1,y:-30,r:7},{x:8,y:-26,r:6}].forEach(b=>{
      this._ellipse(ctx,b.x,b.y,b.r,b.r*0.9,'#FF5555');
      this._ellipse(ctx,b.x-1.5,b.y-2,b.r*0.35,b.r*0.35,'rgba(255,210,210,0.6)'); });
    // Eyes (BIGGER, more sparkly for cuteness)
    for (let s=-1;s<=1;s+=2) { const ex=s*11,ey=-4;
      if (blink) {
        // Cute smile blink (^_^)
        ctx.beginPath(); ctx.arc(ex,ey,6,0.1,Math.PI-0.1);
        ctx.strokeStyle='#444'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.stroke();
      } else {
        // Big sparkly eyes
        ctx.beginPath(); ctx.ellipse(ex,ey,9,9,0,0,Math.PI*2); ctx.fillStyle='#FFFFFF'; ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=0.5; ctx.stroke();
        // Iris (dark, big)
        this._ellipse(ctx,ex+s*1.5,ey,5.5,6,'#2a1a0a');
        // Main highlight (big, top-left)
        this._ellipse(ctx,ex-s*1+1,ey-3.5,3,3,'#FFFFFF');
        // Secondary highlight (small, bottom-right)
        this._ellipse(ctx,ex+s*2.5,ey+1.5,1.5,1.5,'#FFFFFF');
        // Tiny sparkle
        this._ellipse(ctx,ex-s*3,ey-5,1,1,'rgba(255,255,255,0.7)');
      } }
    // Blush (BIGGER, more prominent pink)
    for (let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.ellipse(s*20,7,10,6,0,0,Math.PI*2);
      const blush=ctx.createRadialGradient(s*20,7,1,s*20,7,10);
      blush.addColorStop(0,'rgba(255,130,140,0.5)'); blush.addColorStop(1,'rgba(255,150,160,0)');
      ctx.fillStyle=blush; ctx.fill(); }
    // Beak (smaller, rounder, cuter)
    ctx.beginPath(); ctx.moveTo(5,3); ctx.quadraticCurveTo(16,6,5,10); ctx.closePath();
    ctx.fillStyle='#FF9933'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(5,10); ctx.quadraticCurveTo(14,8,5,14); ctx.closePath();
    ctx.fillStyle='#E88020'; ctx.fill();
    // Wattle (smaller)
    this._ellipse(ctx,5,17,4,5,'#FF5555');
    this._ellipse(ctx,4,16,2.5,3,'rgba(255,140,140,0.5)');
    ctx.restore();
    this._put(name, c);
  }

  _chickenHat(name, idx) {
    const c=this._mk(60,60), ctx=c.ctx; ctx.translate(30,30);
    if (idx===1) { // Crown
      ctx.beginPath(); ctx.moveTo(-14,5); ctx.lineTo(-14,-5); ctx.lineTo(-7,0); ctx.lineTo(0,-10);
      ctx.lineTo(7,0); ctx.lineTo(14,-5); ctx.lineTo(14,5); ctx.closePath();
      const g=ctx.createLinearGradient(0,-10,0,5); g.addColorStop(0,'#FFD700'); g.addColorStop(1,'#FFA500');
      ctx.fillStyle=g; ctx.fill(); ctx.strokeStyle='#B8860B'; ctx.lineWidth=1; ctx.stroke();
      this._ellipse(ctx,0,-3,2.5,2.5,'#FF4444'); this._ellipse(ctx,-9,0,2,2,'#4488FF'); this._ellipse(ctx,9,0,2,2,'#44FF44');
    } else if (idx===2) { // Ribbon
      ctx.beginPath(); ctx.ellipse(-10,0,10,6,-0.3,0,Math.PI*2); ctx.fillStyle='#FF69B4'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(10,0,10,6,0.3,0,Math.PI*2); ctx.fill();
      this._ellipse(ctx,0,0,4,4,'#FF1493');
      ctx.strokeStyle='#FF69B4'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(-3,3); ctx.quadraticCurveTo(-8,15,-5,20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3,3); ctx.quadraticCurveTo(8,15,5,20); ctx.stroke();
    } else { // Flower
      ctx.beginPath(); ctx.moveTo(0,6); ctx.quadraticCurveTo(2,0,0,-2);
      ctx.strokeStyle='#4CAF50'; ctx.lineWidth=2.5; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(4,2,5,3,0.5,0,Math.PI*2); ctx.fillStyle='#66BB6A'; ctx.fill();
      ['#FF69B4','#FF9EC4','#FFB6D9','#FF7EB3','#FFA0CC'].forEach((col,p)=>{
        ctx.save(); ctx.translate(0,-5); ctx.rotate(p*Math.PI*2/5);
        ctx.beginPath(); ctx.ellipse(0,-8,5,8,0,0,Math.PI*2); ctx.fillStyle=col; ctx.fill(); ctx.restore(); });
      this._ellipse(ctx,0,-5,4,4,'#FFD700'); this._ellipse(ctx,-1,-6,1.5,1.5,'rgba(255,255,255,0.5)');
    }
    this._put(name, c);
  }

  // ── Chicks ──
  _renderChicks() {
    for (let i=0;i<10;i++) {
      this._chickFrame(`chick-${i}`,CHICK_COLORS[i],false,false);
      this._chickFrame(`chick-blink-${i}`,CHICK_COLORS[i],true,false);
      this._chickFrame(`chick-angry-${i}`,CHICK_COLORS[i],false,true);
    }
    this._chickAcc('chick-acc-bow',1); this._chickAcc('chick-acc-glasses',2); this._chickAcc('chick-acc-hat',3);
  }

  _chickFrame(name, col, blink, angry) {
    const c=this._mk(70,80), ctx=c.ctx; ctx.translate(35,40);
    this._ellipse(ctx,0,30,20,5,'rgba(0,0,0,0.1)'); // shadow
    // Feet (tiny, cute)
    for (let s=-1;s<=1;s+=2) { ctx.save(); ctx.translate(s*8,26);
      ctx.strokeStyle='#FFa040'; ctx.lineWidth=2; ctx.lineCap='round';
      for (let t=-1;t<=1;t++) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(t*3.5,5); ctx.stroke(); }
      ctx.restore(); }
    // Body (rounder, chubbier)
    ctx.beginPath(); ctx.ellipse(0,10,22,18,0,0,Math.PI*2);
    const bg=ctx.createRadialGradient(-5,4,3,0,10,22);
    bg.addColorStop(0,this._lit(col,50)); bg.addColorStop(0.5,col); bg.addColorStop(1,this._drk(col,25));
    ctx.fillStyle=bg; ctx.fill();
    // Belly highlight
    ctx.beginPath(); ctx.ellipse(2,14,13,10,0.05,0,Math.PI*2);
    const belly=ctx.createRadialGradient(2,12,2,2,14,13);
    belly.addColorStop(0,'rgba(255,255,240,0.5)'); belly.addColorStop(1,'rgba(255,255,240,0)');
    ctx.fillStyle=belly; ctx.fill();
    // Wings (tiny, stubby, cute)
    for (let s=-1;s<=1;s+=2) { ctx.save(); ctx.translate(s*18,8); ctx.rotate(s*0.25);
      ctx.beginPath(); ctx.ellipse(s*2,0,9,7,s*0.15,0,Math.PI*2);
      const wg=ctx.createRadialGradient(0,-1,1,s*2,0,9);
      wg.addColorStop(0,this._lit(col,20)); wg.addColorStop(1,this._drk(col,15));
      ctx.fillStyle=wg; ctx.fill(); ctx.restore(); }
    // Head (BIGGER ratio for cuteness)
    ctx.beginPath(); ctx.ellipse(0,-10,18,16,0,0,Math.PI*2);
    const hg=ctx.createRadialGradient(-4,-14,3,0,-10,18);
    hg.addColorStop(0,this._lit(col,60)); hg.addColorStop(0.6,col); hg.addColorStop(1,this._drk(col,10));
    ctx.fillStyle=hg; ctx.fill();
    // Fluff (rounder poof)
    this._ellipse(ctx,0,-26,6,7,this._lit(col,35));
    this._ellipse(ctx,-4,-24,4,5,this._lit(col,25));
    this._ellipse(ctx,4,-24,3.5,4.5,this._lit(col,20));
    // Eyes (BIGGER, sparkly)
    for (let s=-1;s<=1;s+=2) { const ex=s*7,ey=-13;
      if (blink) {
        // Cute ^_^ blink
        ctx.beginPath(); ctx.arc(ex,ey,4,0.15,Math.PI-0.15);
        ctx.strokeStyle='#444'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke();
      } else if (angry) {
        // Big angry eyes
        this._ellipse(ctx,ex,ey,5,5.5,'#FFF');
        this._ellipse(ctx,ex+s*0.5,ey,3,3.5,'#222');
        this._ellipse(ctx,ex-s*0.5,ey-2,1.5,1.5,'#FFF');
        ctx.strokeStyle='#444'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(ex-5,ey-6+s*2); ctx.lineTo(ex+5,ey-6-s*2); ctx.stroke();
      } else {
        // Big sparkly baby eyes
        this._ellipse(ctx,ex,ey,5,5.5,'#FFFFFF');
        ctx.beginPath(); ctx.ellipse(ex,ey,5,5.5,0,0,Math.PI*2);
        ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=0.5; ctx.stroke();
        this._ellipse(ctx,ex+s*0.5,ey,3,3.5,'#2a1a0a');
        this._ellipse(ctx,ex-s*1,ey-2.5,1.8,1.8,'#FFFFFF');
        this._ellipse(ctx,ex+s*2,ey+1,1,1,'#FFFFFF');
        this._ellipse(ctx,ex-s*2.5,ey-4,0.7,0.7,'rgba(255,255,255,0.6)');
      } }
    // Blush (prominent, gradient)
    for (let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.ellipse(s*13,-7,6,4,0,0,Math.PI*2);
      const blush=ctx.createRadialGradient(s*13,-7,1,s*13,-7,6);
      blush.addColorStop(0,'rgba(255,130,140,0.45)'); blush.addColorStop(1,'rgba(255,150,160,0)');
      ctx.fillStyle=blush; ctx.fill(); }
    // Beak (small, rounded, cute)
    ctx.beginPath(); ctx.moveTo(3,-10); ctx.quadraticCurveTo(11,-8,3,-6); ctx.closePath();
    ctx.fillStyle='#FF9933'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(3,-6); ctx.quadraticCurveTo(9,-5.5,3,-3); ctx.closePath();
    ctx.fillStyle='#E88020'; ctx.fill();
    this._put(name, c);
  }

  _chickAcc(name, type) {
    const c=this._mk(30,30), ctx=c.ctx; ctx.translate(15,15);
    if (type===1) { // Bow
      ctx.beginPath(); ctx.ellipse(-5,0,5,3,-0.3,0,Math.PI*2); ctx.fillStyle='#FF69B4'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(5,0,5,3,0.3,0,Math.PI*2); ctx.fill();
      this._ellipse(ctx,0,0,2,2,'#FF1493');
    } else if (type===2) { // Glasses
      ctx.strokeStyle='#333'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(-6,0,4,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(6,0,4,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2,0); ctx.lineTo(2,0); ctx.stroke();
    } else { // Hat
      ctx.fillStyle='#8B4513'; ctx.fillRect(-5,-4,10,4); ctx.fillRect(-3,-10,6,6);
      ctx.fillStyle='#FFD700'; ctx.fillRect(-3,-5,6,1.5);
    }
    this._put(name, c);
  }

  // ── Eggs ──
  _renderEggs() { this._eggFrame('egg-normal',false); this._eggFrame('egg-golden',true); }

  _eggFrame(name, golden) {
    const c=this._mk(40,50), ctx=c.ctx; ctx.translate(20,25);
    const r=golden?16:14, rY=r*1.3;
    if (golden) {
      ctx.beginPath(); ctx.ellipse(0,0,r+8,rY+8,0,0,Math.PI*2);
      const gg=ctx.createRadialGradient(0,0,r*0.5,0,0,r+8);
      gg.addColorStop(0,'rgba(255,215,0,0.4)'); gg.addColorStop(1,'rgba(255,215,0,0)');
      ctx.fillStyle=gg; ctx.fill();
    }
    ctx.beginPath(); ctx.ellipse(0,0,r,rY,0,0,Math.PI*2);
    const eg=ctx.createRadialGradient(-r*0.25,-rY*0.3,r*0.1,0,0,r);
    if (golden) { eg.addColorStop(0,'#FFF8B0'); eg.addColorStop(0.4,'#FFD700'); eg.addColorStop(1,'#DAA520'); }
    else { eg.addColorStop(0,'#FFFFFF'); eg.addColorStop(0.5,'#FFF8DC'); eg.addColorStop(1,'#EDE0C8'); }
    ctx.fillStyle=eg; ctx.fill();
    ctx.beginPath(); ctx.ellipse(-r*0.25,-rY*0.3,r*0.3,rY*0.25,-0.3,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fill();
    this._put(name, c);
  }

  // ── Predators ──
  _renderPredators() {
    ['fox','weasel','raccoon'].forEach((n,i)=>{
      this._predFrame(`predator-${n}`,PRED[i],false);
      this._predFrame(`predator-${n}-scared`,PRED[i],true);
    });
  }

  _predFrame(name, t, scared) {
    const c=this._mk(180,110), ctx=c.ctx; ctx.translate(90,55);
    const isR=t.name==='raccoon';
    // Tail (fluffy, rounder)
    ctx.save(); ctx.translate(-32,-2);
    ctx.beginPath(); ctx.ellipse(-10,0,18,11,-0.15,0,Math.PI*2); ctx.fillStyle=t.tail; ctx.fill();
    if (isR) { for (let s=0;s<4;s++) {
      ctx.beginPath(); ctx.ellipse(-6-s*5,0,4,10-s,-0.2,0,Math.PI*2);
      ctx.fillStyle=s%2===0?'#404040':t.tail; ctx.fill(); }
    } else { ctx.beginPath(); ctx.ellipse(-22,0,10,9,-0.15,0,Math.PI*2); ctx.fillStyle=t.tip; ctx.fill(); }
    ctx.restore();
    // Body (chubbier, rounder)
    ctx.beginPath(); ctx.ellipse(0,2,35,24,0,0,Math.PI*2);
    const bg=ctx.createRadialGradient(-6,-4,4,0,2,35);
    bg.addColorStop(0,this._lit(t.body,25)); bg.addColorStop(1,t.body); ctx.fillStyle=bg; ctx.fill();
    // Belly (bigger, softer)
    ctx.beginPath(); ctx.ellipse(5,8,20,15,0,0,Math.PI*2);
    const belly=ctx.createRadialGradient(5,6,3,5,8,20);
    belly.addColorStop(0,t.belly); belly.addColorStop(1,this._lit(t.body,10));
    ctx.fillStyle=belly; ctx.fill();
    // Legs (stubby, cute)
    for (let s=-1;s<=1;s+=2) this._ellipse(ctx,s*14,22,7,8,this._drk(t.body,20));
    // Head (BIGGER for cute proportions)
    ctx.beginPath(); ctx.ellipse(28,-10,22,20,0,0,Math.PI*2);
    const hg=ctx.createRadialGradient(24,-15,4,28,-10,22);
    hg.addColorStop(0,this._lit(t.body,35)); hg.addColorStop(1,t.body); ctx.fillStyle=hg; ctx.fill();
    // Ears (rounder)
    for (let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.ellipse(28+s*14,-28,8,11,s*0.2,0,Math.PI*2); ctx.fillStyle=t.body; ctx.fill();
      ctx.beginPath(); ctx.ellipse(28+s*14,-27,5,7,s*0.2,0,Math.PI*2); ctx.fillStyle=t.ear; ctx.fill(); }
    if (isR) { // Raccoon mask (rounder)
      ctx.beginPath(); ctx.ellipse(28,-12,20,9,0,0,Math.PI*2);
      ctx.fillStyle='rgba(30,30,30,0.6)'; ctx.fill(); }
    // Muzzle (rounder, cuter)
    this._ellipse(ctx,42,-4,11,9,t.belly);
    // Nose (round, shiny)
    this._ellipse(ctx,48,-5,4.5,3.5,'#333');
    this._ellipse(ctx,47,-6.5,2,1.2,'rgba(255,255,255,0.4)');
    // Eyes (BIGGER, rounder, sparkly)
    for (let s=-1;s<=1;s+=2) { const ex=28+s*9,ey=-14;
      if (scared) {
        // Swirly scared eyes
        ctx.strokeStyle='#444'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*1.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex,ey,2,Math.PI,Math.PI*2.5); ctx.stroke();
      } else {
        // Big round eyes
        this._ellipse(ctx,ex,ey,5.5,6,'#FFFFFF');
        ctx.beginPath(); ctx.ellipse(ex,ey,5.5,6,0,0,Math.PI*2);
        ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=0.5; ctx.stroke();
        this._ellipse(ctx,ex+1.5,ey,3,3.5,'#332211');
        this._ellipse(ctx,ex,ey-2.5,1.8,1.8,'#FFFFFF');
        this._ellipse(ctx,ex+2.5,ey+1,1,1,'#FFFFFF');
      } }
    // Blush (cute pink cheeks)
    if (!scared) { for (let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.ellipse(28+s*18,-2,6,4,0,0,Math.PI*2);
      const blush=ctx.createRadialGradient(28+s*18,-2,1,28+s*18,-2,6);
      blush.addColorStop(0,'rgba(255,140,150,0.35)'); blush.addColorStop(1,'rgba(255,150,160,0)');
      ctx.fillStyle=blush; ctx.fill(); } }
    this._put(name, c);
  }

  // ── Dogs ──
  _renderDogs() {
    this._renderBori('dog-bori', false);
    this._renderBori('dog-bori-attack', true);
    this._renderJopssal('dog-jopssal', false);
    this._renderJopssal('dog-jopssal-attack', true);
  }

  _renderBori(name, attacking=false) {
    const c=this._mk(130,80), ctx=c.ctx; ctx.translate(55,40);
    // Shadow
    this._ellipse(ctx,0,20,28,6,'rgba(0,0,0,0.15)');
    // Tail
    ctx.save(); ctx.translate(-22,-10);
    this._ellipse(ctx,-5,-5,12,10,'#1a1a1a');
    this._ellipse(ctx,-3,-6,8,7,'#2a2a2a');
    ctx.restore();
    // Body
    ctx.beginPath(); ctx.ellipse(0,2,30,22,0,0,Math.PI*2);
    const bg=ctx.createRadialGradient(-5,-4,4,0,2,30);
    bg.addColorStop(0,'#2a2a2a'); bg.addColorStop(1,'#111111');
    ctx.fillStyle=bg; ctx.fill();
    // Chest
    this._ellipse(ctx,8,5,18,16,'#1e1e1e');
    // Legs
    for(let s=-1;s<=1;s+=2) this._ellipse(ctx,s*12,18,8,8,'#151515');
    // Head
    ctx.beginPath(); ctx.ellipse(22,-8,20,18,0,0,Math.PI*2);
    const hg=ctx.createRadialGradient(18,-12,3,22,-8,20);
    hg.addColorStop(0,'#2a2a2a'); hg.addColorStop(1,'#111111');
    ctx.fillStyle=hg; ctx.fill();
    // Mane
    this._ellipse(ctx,18,-2,22,18,'#1a1a1a');
    // Ears
    for(let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.ellipse(22+s*14,-22,6,8,s*0.3,0,Math.PI*2);
      ctx.fillStyle='#1a1a1a'; ctx.fill();
    }
    // Muzzle
    this._ellipse(ctx,34,-2,10,8,'#222222');
    // Nose
    this._ellipse(ctx,40,-3,4,3,'#333');
    this._ellipse(ctx,39,-4.5,1.5,1,'rgba(255,255,255,0.3)');
    // Eyes
    for(let s=-1;s<=1;s+=2) {
      const ex=26+s*7, ey=-12;
      this._ellipse(ctx,ex,ey,4,4.5,'#FFFFFF');
      this._ellipse(ctx,ex+1,ey,2.5,3,'#1a0a00');
      this._ellipse(ctx,ex,ey-1.5,1.2,1.2,'#FFF');
    }
    // Tongue (attack frame)
    if (attacking) {
      ctx.beginPath(); ctx.ellipse(38,4,4,6,0.2,0,Math.PI*2);
      ctx.fillStyle='#FF6B6B'; ctx.fill();
    }
    this._put(name, c);
  }

  _renderJopssal(name, attacking=false) {
    const c=this._mk(120,80), ctx=c.ctx; ctx.translate(45,40);
    // Shadow
    this._ellipse(ctx,0,16,22,5,'rgba(0,0,0,0.12)');
    // Tail
    ctx.save(); ctx.translate(-18,-6); ctx.rotate(-0.3);
    ctx.beginPath(); ctx.ellipse(-8,0,14,7,-0.3,0,Math.PI*2); ctx.fillStyle='#F5E6C8'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16,0,8,5,-0.2,0,Math.PI*2); ctx.fillStyle='#FFFFFF'; ctx.fill();
    ctx.restore();
    // Body
    ctx.beginPath(); ctx.ellipse(0,2,24,16,0,0,Math.PI*2);
    const bg=ctx.createRadialGradient(-4,-3,3,0,2,24);
    bg.addColorStop(0,'#FFFFF0'); bg.addColorStop(1,'#F5E6C8');
    ctx.fillStyle=bg; ctx.fill();
    // Spots
    const spots=[[5,-2,8,6],[-8,5,6,5],[12,6,5,4],[-3,8,7,4]];
    for(let si=0;si<spots.length;si++) {
      const[sx,sy,srx,sry]=spots[si];
      ctx.beginPath(); ctx.ellipse(sx,sy,srx,sry,si*0.4,0,Math.PI*2);
      ctx.fillStyle='rgba(210,180,100,0.4)'; ctx.fill();
    }
    // Legs
    for(let s=-1;s<=1;s+=2) this._ellipse(ctx,s*10,14,5,6,'#EDE0C8');
    // Belly
    this._ellipse(ctx,3,6,14,10,'#FFFFFF');
    // Head
    ctx.beginPath(); ctx.ellipse(20,-6,16,14,0,0,Math.PI*2);
    const hg=ctx.createRadialGradient(17,-10,3,20,-6,16);
    hg.addColorStop(0,'#FFFFF8'); hg.addColorStop(1,'#F5E6C8');
    ctx.fillStyle=hg; ctx.fill();
    // Head spots
    ctx.beginPath(); ctx.ellipse(16,-12,8,6,-0.3,0,Math.PI*2);
    ctx.fillStyle='rgba(210,180,100,0.35)'; ctx.fill();
    // Ears
    for(let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.moveTo(20+s*10,-16); ctx.lineTo(20+s*16,-32); ctx.lineTo(20+s*5,-20); ctx.closePath();
      ctx.fillStyle='#F5E6C8'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(20+s*10.5,-17); ctx.lineTo(20+s*14,-28); ctx.lineTo(20+s*7,-20); ctx.closePath();
      ctx.fillStyle='#FFD0D0'; ctx.fill();
    }
    // Muzzle
    this._ellipse(ctx,32,-2,9,6,'#FFFFFF');
    // Nose
    this._ellipse(ctx,38,-3,3.5,2.5,'#FF8080');
    this._ellipse(ctx,37,-4,1.2,0.8,'rgba(255,255,255,0.4)');
    // Eyes
    for(let s=-1;s<=1;s+=2) {
      const ex=22+s*7, ey=-10;
      this._ellipse(ctx,ex,ey,4.5,5,'#FFFFFF');
      this._ellipse(ctx,ex+1,ey,2.5,3,'#3a2a10');
      this._ellipse(ctx,ex,ey-2,1.3,1.3,'#FFF');
    }
    // Blush
    for(let s=-1;s<=1;s+=2) {
      ctx.beginPath(); ctx.ellipse(22+s*14,0,5,3,0,0,Math.PI*2);
      const blush=ctx.createRadialGradient(22+s*14,0,1,22+s*14,0,5);
      blush.addColorStop(0,'rgba(255,150,140,0.4)'); blush.addColorStop(1,'rgba(255,150,160,0)');
      ctx.fillStyle=blush; ctx.fill();
    }
    // Tongue (attack frame)
    if (attacking) {
      ctx.beginPath(); ctx.ellipse(36,3,3,5,0.2,0,Math.PI*2);
      ctx.fillStyle='#FF6B6B'; ctx.fill();
    }
    this._put(name, c);
  }

  // ── Nest ──
  _renderNest() {
    const c=this._mk(200,160), ctx=c.ctx; ctx.translate(100,90);
    const w=140, h=70, hw=w/2;

    // Shadow under nest
    ctx.beginPath(); ctx.ellipse(0,h*0.4,hw*0.8,10,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fill();

    // Nest base - bowl shape made of twigs
    ctx.beginPath();
    ctx.moveTo(-hw,-h*0.15);
    ctx.quadraticCurveTo(-hw-8,h*0.3,-hw*0.6,h*0.45);
    ctx.quadraticCurveTo(0,h*0.6,hw*0.6,h*0.45);
    ctx.quadraticCurveTo(hw+8,h*0.3,hw,-h*0.15);
    ctx.closePath();
    const bg=ctx.createLinearGradient(-hw,0,hw,0);
    bg.addColorStop(0,'#8B6914'); bg.addColorStop(0.3,'#A0722A'); bg.addColorStop(0.5,'#B8860B');
    bg.addColorStop(0.7,'#A0722A'); bg.addColorStop(1,'#8B6914');
    ctx.fillStyle=bg; ctx.fill();

    // Twig texture - curved lines
    ctx.save(); ctx.clip();
    ctx.strokeStyle='rgba(90,60,10,0.4)'; ctx.lineWidth=2; ctx.lineCap='round';
    for (let i=0;i<12;i++) {
      const y0=-h*0.1+i*6;
      ctx.beginPath();
      ctx.moveTo(-hw+5,y0);
      ctx.quadraticCurveTo(-hw*0.3+Math.sin(i)*10,y0+3+Math.cos(i)*4,0,y0+2);
      ctx.quadraticCurveTo(hw*0.3+Math.cos(i)*8,y0-2+Math.sin(i)*3,hw-5,y0+1);
      ctx.stroke();
    }
    // Cross twigs
    for (let i=0;i<8;i++) {
      const x0=-hw*0.7+i*hw*0.2;
      ctx.beginPath();
      ctx.moveTo(x0,-h*0.15);
      ctx.quadraticCurveTo(x0+Math.sin(i*2)*8,h*0.15,x0-5+Math.cos(i)*6,h*0.5);
      ctx.stroke();
    }
    ctx.restore();

    // Rim - messy twig ring around top
    ctx.beginPath(); ctx.ellipse(0,-h*0.15,hw+2,12,0,0,Math.PI*2);
    const rg=ctx.createRadialGradient(0,-h*0.15,hw*0.6,0,-h*0.15,hw+4);
    rg.addColorStop(0,'#C49A3C'); rg.addColorStop(0.5,'#A0722A'); rg.addColorStop(1,'#7A5518');
    ctx.fillStyle=rg; ctx.fill();

    // Scattered straw/twigs on rim
    ctx.strokeStyle='#C49A3C'; ctx.lineWidth=2.5; ctx.lineCap='round';
    const twigs = [
      [-hw+5,-h*0.2,-hw-12,-h*0.35], [hw-5,-h*0.2,hw+14,-h*0.3],
      [-hw*0.5,-h*0.25,-hw*0.6,-h*0.45], [hw*0.4,-h*0.22,hw*0.55,-h*0.42],
      [-hw*0.2,-h*0.2,-hw*0.1,-h*0.4], [hw*0.1,-h*0.22,hw*0.2,-h*0.38],
    ];
    for (const [x1,y1,x2,y2] of twigs) {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    // Some lighter straw
    ctx.strokeStyle='#D4AA4C'; ctx.lineWidth=1.5;
    const straw = [
      [-hw+15,-h*0.18,-hw+2,-h*0.4], [hw-12,-h*0.18,hw-3,-h*0.38],
      [0,-h*0.2,5,-h*0.42], [-20,-h*0.2,-25,-h*0.4],
    ];
    for (const [x1,y1,x2,y2] of straw) {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }

    // Soft lining inside (feathery center)
    ctx.beginPath(); ctx.ellipse(0,h*0.05,hw*0.65,h*0.25,0,0,Math.PI*2);
    const inner=ctx.createRadialGradient(0,0,5,0,h*0.05,hw*0.6);
    inner.addColorStop(0,'#F5E6C8'); inner.addColorStop(0.6,'#E8D5A8'); inner.addColorStop(1,'#C49A3C');
    ctx.fillStyle=inner; ctx.fill();

    this._put('nest-empty', c);
  }

  // ── UI ──
  _renderUI() {
    const p=this._mk(44,44), pc=p.ctx; pc.translate(22,22);
    pc.fillStyle='rgba(0,0,0,0.4)'; pc.beginPath(); pc.arc(0,0,20,0,Math.PI*2); pc.fill();
    pc.fillStyle='#FFF'; pc.fillRect(-7,-9,5,18); pc.fillRect(2,-9,5,18);
    this._put('ui-pause', p);

    const s=this._mk(20,20), sc=s.ctx; sc.translate(10,10);
    sc.fillStyle='#4CAF50'; sc.beginPath();
    sc.moveTo(0,-8); sc.lineTo(-7,-4); sc.lineTo(-7,2); sc.quadraticCurveTo(0,9,0,9);
    sc.quadraticCurveTo(0,9,7,2); sc.lineTo(7,-4); sc.closePath(); sc.fill();
    sc.strokeStyle='#2E7D32'; sc.lineWidth=1; sc.stroke();
    this._put('ui-shield', s);
  }
}
