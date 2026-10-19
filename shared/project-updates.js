'use strict';
/* Runs exclusively in the extension worker / Android background WebView. */
(() => {
    const P = SpeedDialProject, key = 'projectUpdateState', claimKey = 'projectUpdatePrompt';
    let pending;
    let claimQueue = Promise.resolve();
    let stateQueue = Promise.resolve();
    const version = s => /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(String(s))
        ? String(s).replace(/^v/, '').split('.').map(Number) : null;
    const newer = (a, b) => {
        a = version(a); b = version(b);
        if (!a || !b || [...a, ...b].some(n => !Number.isSafeInteger(n))) return false;
        for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
        return false;
    };
    function release(data) {
        if (!data || data.draft || data.prerelease || !version(data.tag_name)) return null;
        const tag = data.tag_name;
        if (data.html_url !== P.repository + '/releases/tag/' + tag) return null;
        const assets = {};
        for (const name of [P.androidAsset, P.extensionAsset]) {
            const asset = (Array.isArray(data.assets) ? data.assets : []).find(a => a.name === name && a.state === 'uploaded' && a.size > 0);
            const url = P.repository + '/releases/download/' + tag + '/' + name;
            if (asset?.browser_download_url === url) assets[name] = url;
        }
        return { tag, url: data.html_url, assets };
    }
    const read = async () => (await chrome.storage.local.get(key))[key] || {};
    const write = state => chrome.storage.local.set({ [key]: state });
    function mutate(fn) {
        const next = stateQueue.then(async () => {
            const state = fn(await read());
            await write(state);
            return state;
        });
        stateQueue = next.catch(() => {});
        return next;
    }
    const candidate = (state, platform) => {
        const r = state.release, name = platform === 'android' ? P.androidAsset : P.extensionAsset;
        if (!r || !newer(r.tag, P.version) || state.skippedTag === r.tag || !r.assets?.[name]) return null;
        // Revalidate persisted metadata as strictly as the network response.
        if (r.url !== P.repository + '/releases/tag/' + r.tag ||
            r.assets[name] !== P.repository + '/releases/download/' + r.tag + '/' + name) return null;
        return { tag: r.tag, url: r.url, download: r.assets[name] };
    };
    async function perform() {
        let state = await read();
        const now = Date.now();
        // A clock moving backwards cannot cause a second request inside the interval.
        if (Number.isFinite(state.lastAttemptAt) && now - state.lastAttemptAt < P.week) return state;
        if (globalThis.navigator?.onLine === false) return state;
        // Serialize with Skip so a simultaneous choice cannot be overwritten.
        state = await mutate(saved => ({ ...saved, lastAttemptAt: now }));
        // The timestamp is durable before I/O, including process death.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(P.api, {
                headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' },
                credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal
            });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const body = await response.text();
            if (body.length > 1024 * 1024) throw new Error('Release metadata too large');
            const valid = release(JSON.parse(body));
            if (!valid) throw new Error('Invalid stable release metadata');
            state = { ...state, release: valid, lastSuccessAt: now, error: false };
        } catch (_) {
            state = { ...state, error: true };
        } finally { clearTimeout(timer); }
        // Another page may have skipped a cached release while the request was in flight.
        return mutate(saved => {
            if (saved.skippedTag !== undefined) state.skippedTag = saved.skippedTag;
            return state;
        });
    }
    async function check(platform) {
        if (!pending) pending = perform().finally(() => { pending = undefined; });
        const state = await pending;
        return { success: true, update: candidate(state, platform), lastAttemptAt: state.lastAttemptAt || null, error: !!state.error };
    }
    async function claimImpl(tag, platform) {
        const state = await read(), update = candidate(state, platform);
        if (!update || update.tag !== tag) return { success: true, claimed: false };
        const session = await chrome.storage.session.get(claimKey);
        if (session[claimKey] === tag) return { success: true, claimed: false };
        await chrome.storage.session.set({ [claimKey]: tag });
        return { success: true, claimed: true };
    }
    function claim(tag, platform) {
        const next = claimQueue.then(() => claimImpl(tag, platform));
        claimQueue = next.catch(() => {});
        return next;
    }
    async function skip(tag) {
        await mutate(state => state.release?.tag === tag && newer(tag, P.version) ? { ...state, skippedTag: tag } : state);
        return { success: true };
    }
    globalThis.ProjectUpdates = Object.freeze({ check, claim, skip, newer, release });
})();
