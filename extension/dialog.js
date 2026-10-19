'use strict';

/* ============================================================
   dialog.js — DialogService (prompt/confirm/alert/choice).
   Ширина модалки согласована с формой плитки (max-width: 500px).

   v6.5.5:
   - Кнопки в choice() размещаются В ОДНУ СТРОКУ
     (flex-wrap: nowrap, flex: 1 — равная ширина).

   v6.5.4:
   - Добавлен метод choice(message, options).

   v6.5.0:
   - Исправлен артефакт '#okBtn'.replace(...) в alert().
   ============================================================ */

const DialogService = (() => {
    function ensureHost() {
        let host = document.getElementById('dialogHost');
        if (!host) {
            host = document.createElement('div');
            host.id = 'dialogHost';
            host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10000;';
            document.body.appendChild(host);
        }
        return host;
    }

    function buildModal(innerHTML) {
        const wrap = document.createElement('div');
        wrap.className = 'dialog-backdrop';
        wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;pointer-events:auto;z-index:10000;';

        const box = document.createElement('div');
        box.className = 'modal-content dialog-box';
        box.style.cssText = 'background:var(--modal, #2d2d2d);color:var(--text, #e0e0e0);border-radius:20px;border:1px solid var(--border,rgba(255,255,255,.1));padding:22px;min-width:320px;width:90%;max-width:500px;box-sizing:border-box;box-shadow:0 24px 60px rgba(0,0,0,.5);';
        box.innerHTML = innerHTML;

        wrap.appendChild(box);
        ensureHost().appendChild(wrap);
        return { wrap, box };
    }

    function close(wrap) {
        if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }

    function actionsHTML(okLabel = null, cancelLabel = null, okClass = 'primary') {
        /* v6.9.2: локализация кнопок диалогов по языку документа */
        if (okLabel === null) okLabel = tui('ok');
        if (cancelLabel === null) cancelLabel = tui('cancel');
        return `
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
                ${cancelLabel ? `<button type="button" id="dialogCancel" class="dialog-btn secondary">${cancelLabel}</button>` : ''}
                <button type="button" id="dialogOk" class="dialog-btn ${okClass}">${okLabel}</button>
            </div>
            <style>
                .dialog-btn { padding: 8px 16px; border: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 500; transition: transform .12s ease, filter .12s ease; }
                .dialog-btn:active { transform: scale(0.96); filter: brightness(0.9); }
                .dialog-btn.primary { background: var(--accent, #35c2b5); color: #07201d; font-weight: 650; }
                .dialog-btn.danger { background: #f5576c; color: #fff; }
                .dialog-btn.secondary { background: rgba(128,128,128,.3); color: var(--text, #e0e0e0); }
            </style>
        `;
    }

    async function prompt(message, defaultValue = '', options = {}) {
        return new Promise(resolve => {
            const { wrap, box } = buildModal(`
                <h3 style="margin:0 0 12px;font-size:16px"></h3>
                <input type="text" id="dialogInput" style="width:100%;padding:8px;border:1px solid var(--border,#444);border-radius:10px;background:var(--tile,#2d2d2d);color:var(--text,#e0e0e0);font-size:13px">
                ${actionsHTML(tui('ok'), tui('cancel'), 'primary')}
            `);
            box.querySelector('h3').textContent = message;

            const input = box.querySelector('#dialogInput');
            input.value = defaultValue;
            if (options.placeholder) input.placeholder = options.placeholder;
            if (options.type) input.type = options.type;

            const okBtn = box.querySelector('#dialogOk');
            const cancelBtn = box.querySelector('#dialogCancel');

            const onKey = (e) => {
                if (e.key === 'Enter') { e.preventDefault(); finish(input.value); }
                if (e.key === 'Escape') { e.preventDefault(); finish(null); }
            };

            const finish = (val) => {
                wrap.removeEventListener('keydown', onKey);
                close(wrap);
                resolve(val);
            };

            okBtn.onclick = () => finish(input.value);
            if (cancelBtn) cancelBtn.onclick = () => finish(null);
            wrap.addEventListener('keydown', onKey);
            setTimeout(() => input.focus(), 50);
        });
    }

    async function confirm(message) {
        return new Promise(resolve => {
            const { wrap, box } = buildModal(`
                <h3 style="margin:0 0 12px;font-size:16px"></h3>
                ${actionsHTML(tui('delete'), tui('cancel'), 'danger')}
            `);
            box.querySelector('h3').textContent = message;

            const okBtn = box.querySelector('#dialogOk');
            const cancelBtn = box.querySelector('#dialogCancel');

            const onKey = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); finish(false); }
            };

            const finish = (val) => {
                document.removeEventListener('keydown', onKey);
                close(wrap);
                resolve(val);
            };

            okBtn.onclick = () => finish(true);
            if (cancelBtn) cancelBtn.onclick = () => finish(false);
            document.addEventListener('keydown', onKey);
        });
    }

    async function alert(message) {
        return new Promise(resolve => {
            const { wrap, box } = buildModal(`
                <h3 style="margin:0 0 12px;font-size:16px"></h3>
                ${actionsHTML('OK', null, 'primary')}
            `);
            box.querySelector('h3').textContent = message;

            const okBtn = box.querySelector('#dialogOk');

            const onKey = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); finish(); }
            };

            const finish = () => {
                document.removeEventListener('keydown', onKey);
                close(wrap);
                resolve();
            };

            okBtn.onclick = finish;
            document.addEventListener('keydown', onKey);
        });
    }

    /**
     * v6.5.5: диалог с N кнопками произвольных подписей.
     * Кнопки размещаются В ОДНУ СТРОКУ (flex-wrap: nowrap, flex: 1).
     *
     * @param {string} message
     * @param {Array<{label:string,value:*,variant?:'primary'|'danger'|'secondary'}>} options
     * @returns {Promise<*>} value выбранной опции или null при Esc/клике мимо.
     *
     * Пример:
     *   const r = await DialogService.choice('Закладка существует', [
     *       { label: 'Отмена', value: 'cancel', variant: 'secondary' },
     *       { label: 'Дублировать', value: 'add', variant: 'secondary' },
     *       { label: 'Редактировать', value: 'edit', variant: 'primary' },
     *   ]);
     */
    async function choice(message, options = []) {
        return new Promise(resolve => {
            const wrap = document.createElement('div');
            wrap.className = 'dialog-backdrop';
            wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;pointer-events:auto;z-index:10000;';

            const box = document.createElement('div');
            box.className = 'modal-content dialog-box';
            box.style.cssText = 'background:var(--modal, #2d2d2d);color:var(--text, #e0e0e0);border-radius:12px;padding:20px;min-width:320px;width:90%;max-width:500px;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,.5);';

            const h = document.createElement('h3');
            h.textContent = message;
            h.style.cssText = 'margin:0 0 12px;font-size:16px;line-height:1.4;';
            box.appendChild(h);

            // v6.5.5: одна строка, равные кнопки
            const actions = document.createElement('div');
            actions.style.cssText =
                'display:flex;gap:6px;justify-content:stretch;margin-top:14px;' +
                'flex-wrap:nowrap;align-items:stretch;';
            box.appendChild(actions);

            const onKey = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); finish(null); }
            };

            const finish = (val) => {
                document.removeEventListener('keydown', onKey);
                if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
                resolve(val);
            };

            const list = options || [];
            list.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = opt.label;
                const variant = opt.variant || 'secondary';

                let css =
                    'flex:1 1 0;min-width:0;padding:8px 6px;border:none;border-radius:6px;' +
                    'cursor:pointer;font-size:12px;line-height:1.2;' +
                    'transition:transform .12s ease,filter .12s ease;' +
                    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
                if (variant === 'primary') css += 'background:var(--accent,#35c2b5);color:#07201d;';
                else if (variant === 'danger') css += 'background:#f5576c;color:#fff;';
                else css += 'background:rgba(128,128,128,.3);color:var(--text,#e0e0e0);';
                btn.style.cssText = css;

                btn.onmouseover = () => { btn.style.filter = 'brightness(1.1)'; };
                btn.onmouseout = () => { btn.style.filter = ''; };
                btn.onclick = () => finish(opt.value);

                actions.appendChild(btn);
            });

            wrap.appendChild(box);
            wrap.onclick = (e) => { if (e.target === wrap) finish(null); };

            ensureHost().appendChild(wrap);
            document.addEventListener('keydown', onKey);
        });
    }

    return { prompt, confirm, alert, choice };
})();

if (typeof self !== 'undefined') self.DialogService = DialogService;
if (typeof window !== 'undefined') window.DialogService = DialogService;