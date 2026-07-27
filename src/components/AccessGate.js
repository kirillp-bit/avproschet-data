// Экран входа по паролю. Статическая проверка на стороне клиента:
// защищает интерфейс от случайного доступа, но не является серверной авторизацией.
const STORAGE_KEY = 'avproschet.access';
// SHA-256 от пароля «2464» — сам пароль в коде не хранится.
const PASSWORD_HASH = '764228040735fc9457b382a4e4533ff9306c6d1372fc5b143ae54eca265fd706';
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export function mountAccessGate(onUnlock) {
  if (typeof document === 'undefined') return;
  if (isUnlocked()) {
    onUnlock?.();
    return;
  }

  const overlay = document.createElement('section');
  overlay.className = 'accessGate';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Вход в АВ-ПРОСЧЁТ');
  overlay.innerHTML = `
    <div class="accessGateGlow" aria-hidden="true"></div>
    <form class="accessGateCard" novalidate>
      <div class="accessGateLogo" aria-hidden="true">П</div>
      <h1>АВ-ПРОСЧЁТ</h1>
      <p class="muted">Внутренний пресейл-калькулятор ООО «П-Медиа». Введите пароль для входа.</p>
      <label class="accessGateField">
        <span>Пароль</span>
        <input type="password" inputmode="numeric" autocomplete="current-password" placeholder="••••" autofocus />
      </label>
      <p class="accessGateError" role="alert" hidden></p>
      <button class="btn primary accessGateSubmit" type="submit">Войти</button>
    </form>`;
  document.body.appendChild(overlay);
  document.documentElement.classList.add('accessLocked');

  const form = overlay.querySelector('form');
  const input = overlay.querySelector('input');
  const error = overlay.querySelector('.accessGateError');
  const button = overlay.querySelector('.accessGateSubmit');
  let attempts = 0;
  let lockedUntil = 0;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (Date.now() < lockedUntil) return;
    const value = (input.value || '').trim();
    if (!value) {
      showError('Введите пароль');
      input.focus();
      return;
    }
    button.disabled = true;
    const ok = await verify(value);
    button.disabled = false;
    if (ok) {
      persistUnlock();
      overlay.classList.add('isLeaving');
      window.setTimeout(() => {
        overlay.remove();
        document.documentElement.classList.remove('accessLocked');
        onUnlock?.();
      }, 260);
      return;
    }
    attempts += 1;
    input.value = '';
    input.focus();
    if (attempts >= MAX_ATTEMPTS) {
      attempts = 0;
      lockedUntil = Date.now() + LOCK_SECONDS * 1000;
      showError(`Слишком много попыток. Повторите через ${LOCK_SECONDS} сек.`);
      button.disabled = true;
      window.setTimeout(() => { button.disabled = false; hideError(); }, LOCK_SECONDS * 1000);
    } else {
      showError(`Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - attempts}.`);
    }
  });

  input.addEventListener('input', hideError);

  function showError(text) {
    error.textContent = text;
    error.hidden = false;
  }
  function hideError() {
    error.hidden = true;
    error.textContent = '';
  }
}

function isUnlocked() {
  try {
    return globalThis.sessionStorage?.getItem(STORAGE_KEY) === '1' || globalThis.localStorage?.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistUnlock() {
  try { globalThis.sessionStorage?.setItem(STORAGE_KEY, '1'); } catch { /* игнорируем */ }
  try { globalThis.localStorage?.setItem(STORAGE_KEY, '1'); } catch { /* игнорируем */ }
}

async function verify(password) {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqual(hex, PASSWORD_HASH);
  }
  return false;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
