(() => {
  'use strict';

  const configuredCounter = Number(window.SZ_METRIKA_COUNTER_ID);
  const hasCounter = Number.isSafeInteger(configuredCounter) && configuredCounter > 0;
  const status = document.getElementById('counter-state');
  const hint = document.getElementById('counter-hint');
  const enableButton = document.getElementById('enable-metrika');
  const log = document.getElementById('event-log');
  let enabled = false;
  let events = 0;

  document.getElementById('year').textContent = new Date().getFullYear();

  function setState(label, type, message) {
    status.textContent = label;
    status.className = 'state ' + type;
    hint.textContent = message;
  }

  function appendLog(message) {
    if (!events) log.replaceChildren();
    events++;
    const node = document.createElement('li');
    node.textContent = new Date().toLocaleTimeString('ru-RU') + ' · ' + message;
    log.prepend(node);
  }

  function initializeMetrika() {
    if (!hasCounter) {
      setState('Счётчик не указан', 'warn', 'Откройте config.js и замените 0 на номер своего счётчика.');
      return;
    }
    if (enabled) return;

    // Официальная схема асинхронной загрузки счётчика. Только после явного согласия пользователя.
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym(configuredCounter, 'init', {
      clickmap: false,
      trackLinks: false,
      accurateTrackBounce: true,
      webvisor: false
    });
    enabled = true;
    enableButton.disabled = true;
    enableButton.textContent = 'Метрика включена';
    setState('Метрика включена', 'ok', `Инициализирован счётчик №${configuredCounter}. Доставка данных зависит от сети и блокировщиков.`);
    appendLog('Инициализирован счётчик Метрики №' + configuredCounter);
  }

  function fireTestGoal(goal) {
    if (!enabled || typeof window.ym !== 'function') {
      appendLog(`${goal}: только локальный тест (Метрика не включена)`);
      setState(hasCounter ? 'Не активирована' : 'Счётчик не указан', 'warn', 'Для отправки цели добавьте ID счётчика и нажмите «Включить Метрику».');
      return;
    }
    try {
      window.ym(configuredCounter, 'reachGoal', goal);
      appendLog(`${goal}: вызвана функция reachGoal — проверьте поступление в Метрике`);
    } catch (error) {
      appendLog(`${goal}: ошибка вызова ${error?.message || 'неизвестная'}`);
      setState('Ошибка отправки', 'err', 'Проверьте консоль браузера и доступность Яндекс Метрики.');
    }
  }

  enableButton.addEventListener('click', initializeMetrika);
  document.getElementById('test-button').addEventListener('click', () => fireTestGoal('sz_test_button'));
  document.getElementById('test-form').addEventListener('submit', event => {
    event.preventDefault();
    fireTestGoal('sz_test_form');
  });
  document.getElementById('clear-log').addEventListener('click', () => {
    events = 0;
    log.replaceChildren();
    const node = document.createElement('li');
    node.textContent = 'Журнал очищен';
    log.appendChild(node);
  });

  if (hasCounter) {
    setState('Ожидает включения', 'warn', `Счётчик №${configuredCounter} указан. Для начала сбора тестовой статистики включите Метрику.`);
  } else {
    setState('Счётчик не указан', 'warn', 'Сайт работает без Метрики. После создания счётчика укажите его номер в config.js.');
  }
})();
