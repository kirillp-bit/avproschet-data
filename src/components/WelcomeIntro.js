export function mountWelcomeIntro() {
  if (typeof document === 'undefined') return;
  const key = 'avproschetIntroSeen';
  const reduceMotion = globalThis.window?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  try {
    if (globalThis.sessionStorage?.getItem(key) === '1') return;
    globalThis.sessionStorage?.setItem(key, '1');
  } catch {
    // Welcome-анимация не должна ломать приложение, если sessionStorage недоступен.
  }
  const overlay = document.createElement('section');
  overlay.className = `welcomeIntro${reduceMotion ? ' reduced' : ''}`;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Добро пожаловать в АВ-ПРОСЧЁТ');
  overlay.innerHTML = `
    <div class="welcomeGlow" aria-hidden="true"></div>
    <div class="welcomeCard">
      <div class="welcomeLogo" aria-hidden="true">АВ-ПРОСЧЁТ</div>
      <p>Добро пожаловать в АВ-ПРОСЧЁТ</p>
      <div class="welcomeLoader" aria-hidden="true"><span></span></div>
      <button class="btn ghost small welcomeSkip" type="button">Пропустить</button>
    </div>`;
  document.body.appendChild(overlay);
  const app = document.getElementById('app');
  app?.classList?.add('appEntering');
  const close = () => {
    overlay.classList.add('isLeaving');
    globalThis.window?.setTimeout?.(() => {
      overlay.remove();
      app?.classList?.remove('appEntering');
      app?.setAttribute?.('tabindex', '-1');
      app?.focus?.({ preventScroll: true });
    }, reduceMotion ? 50 : 420);
  };
  overlay.querySelector('.welcomeSkip')?.addEventListener('click', close);
  globalThis.window?.setTimeout?.(close, reduceMotion ? 200 : 2100);
}
