/** Draw a name label above an entity's head */
export function drawNameLabel(ctx, name, x, y) {
  ctx.save();
  ctx.font = 'Bold 11px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillText(name, x + 1, y + 1);
  ctx.fillStyle = '#FFF';
  ctx.fillText(name, x, y);
  ctx.restore();
}
