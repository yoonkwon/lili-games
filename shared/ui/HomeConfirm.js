/**
 * Shared home confirmation dialog
 * Shows a styled popup asking if the user wants to navigate to the game hub
 */
export function showHomeConfirm() {
  if (document.getElementById('home-confirm')) return;
  const overlay = document.createElement('div');
  overlay.id = 'home-confirm';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '999',
  });
  const box = document.createElement('div');
  Object.assign(box.style, {
    background: '#FFF', borderRadius: '20px', padding: '28px 24px', textAlign: 'center',
    maxWidth: '300px', width: '85%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    fontFamily: '"Apple SD Gothic Neo","Segoe UI",sans-serif',
  });
  box.innerHTML = `
    <div style="font-size:36px;margin-bottom:12px">🏠</div>
    <div style="font-size:18px;font-weight:700;color:#333;margin-bottom:8px">다른 게임 하러 갈까요?</div>
    <div style="font-size:14px;color:#888;margin-bottom:20px">진행 중이던 게임은 종료돼요.</div>
    <div style="display:flex;gap:10px;justify-content:center">
      <button id="home-cancel" style="flex:1;padding:12px;border:none;border-radius:12px;font-size:16px;font-weight:700;background:#EEE;color:#555;cursor:pointer">취소</button>
      <button id="home-ok" style="flex:1;padding:12px;border:none;border-radius:12px;font-size:16px;font-weight:700;background:linear-gradient(135deg,#667eea,#764ba2);color:#FFF;cursor:pointer">이동하기</button>
    </div>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.getElementById('home-cancel').onclick = () => overlay.remove();
  document.getElementById('home-ok').onclick = () => { window.location.href = '../'; };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
