'use strict';

/* ============================================================
   theme-init.js — синхронное применение темы ДО отрисовки CSS.
   v6.5.0: без изменений логики, добавлена обработка ошибок.
   ============================================================ */

(function () {
    try {
        const dark = matchMedia('(prefers-color-scheme: dark)').matches;
        const light = matchMedia('(prefers-color-scheme: light)').matches;
        let theme = 'dark';
        if (light && !dark) theme = 'light';

        const apply = (t) => {
            const bg = t === 'dark' ? '#1a1a1a' : '#f5f5f5';
            document.documentElement.style.backgroundColor = bg;
            document.documentElement.dataset.theme = t;
        };

        apply(theme);

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get({ theme: 'auto' }, (s) => {
                if (!s) return;
                if (s.theme === 'dark') apply('dark');
                else if (s.theme === 'light') apply('light');
            });
        }
    } catch (e) {
        /* silent */
    }
})();