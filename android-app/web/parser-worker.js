'use strict';

/* ============================================================
   parser-worker.js — Web Worker: parse HTML / CSV.

   v6.6.0:
   - parseHTML: поддержка href без кавычек, одинарных и двойных.
   - parseCSV: корректный RFC-4180-подобный разбор — кавычки,
     экранированные кавычки, запятые внутри кавычек, переносы
     строк внутри кавычек.
   - Лимит 100 000 элементов.
   ============================================================ */

const MAX_ITEMS = 100000;

function makeTile(url, title, idx) {
    let host;
    try { host = new URL(url).hostname; }
    catch (e) { return null; }
    return {
        id: `imported_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 8)}`,
        title: title || host,
        url,
        icon: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
        bgColor: '#4CAF50',
        textColor: '#fff',
        folderId: '',
        tags: [],
        opacity: 100,
        iconOpacity: 100,
        showTitle: true,
        bgImage: '',
        reminder: null,
        autoColor: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}

function _decodeHtmlEntities(str) {
    return String(str)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/gi, "'")
        .replace(/&nbsp;/g, ' ');
}

function parseHTML(html) {
    const tiles = [];
    // v6.6.0: три варианта — двойные, одинарные, без кавычек
    const re = /<a\s+[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
    let m, idx = 0;
    while ((m = re.exec(html)) !== null) {
        const url = m[1] || m[2] || m[3] || '';
        if (!/^https?:\/\//i.test(url)) continue;
        let title = (m[4] || '').replace(/<[^>]+>/g, '');
        title = _decodeHtmlEntities(title).replace(/\s+/g, ' ').trim();
        const t = makeTile(url, title, idx++);
        if (t) tiles.push(t);
        if (tiles.length >= MAX_ITEMS) break;
    }
    return tiles;
}

/* ============================================================
   CSV: корректный разбор с кавычками и запятыми.
   Возвращает массив строк (каждая — массив полей).
   ============================================================ */

function _parseCSVText(text) {
    const rows = [];
    let row = [];
    let field = '';
    let i = 0;
    let inQuotes = false;
    const len = text.length;

    const pushField = () => { row.push(field); field = ''; };
    const pushRow = () => { pushField(); rows.push(row); row = []; };

    while (i < len) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i += 2;
                    continue;
                }
                inQuotes = false;
                i++;
                continue;
            }
            field += ch;
            i++;
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
            i++;
            continue;
        }
        if (ch === ',') {
            pushField();
            i++;
            continue;
        }
        if (ch === '\r') {
            // CRLF или CR
            if (text[i + 1] === '\n') i++;
            pushRow();
            i++;
            continue;
        }
        if (ch === '\n') {
            pushRow();
            i++;
            continue;
        }
        field += ch;
        i++;
    }

    // последняя строка без \n
    if (field.length > 0 || row.length > 0) {
        pushRow();
    }

    return rows;
}

function parseCSV(csv) {
    const tiles = [];
    const rows = _parseCSVText(csv);
    let idx = 0;

    for (const row of rows) {
        if (!row || row.length < 2) continue;

        // v6.6.0: угадываем, в каком столбце URL
        let url = '';
        let title = '';

        const col0 = (row[0] || '').trim();
        const col1 = (row[1] || '').trim();

        if (/^https?:\/\//i.test(col1)) {
            url = col1;
            title = col0;
        } else if (/^https?:\/\//i.test(col0)) {
            url = col0;
            title = col1;
        } else {
            // иногда URL во втором столбце без протокола — не рискуем
            continue;
        }

        const t = makeTile(url, title, idx++);
        if (t) tiles.push(t);
        if (tiles.length >= MAX_ITEMS) break;
    }
    return tiles;
}

/* v6.7.0: доступ из service worker (importScripts) без Web Worker */
self.parseHTML = parseHTML;
self.parseCSV = parseCSV;
