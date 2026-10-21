'use strict';
/* Local, per-installation invitation. Serialized in the service worker so that
 * simultaneous new tabs cannot display it twice. Never contacts a server. */
const ProjectWelcome = (() => {
    let pending = Promise.resolve();
    function claim() {
        const result = pending.then(async () => {
            const key = 'projectMobileWelcomeShown';
            const stored = await chrome.storage.local.get(key);
            if (stored[key]) return { claimed: false };
            await chrome.storage.local.set({ [key]: true });
            return { claimed: true };
        });
        pending = result.catch(() => {});
        return result;
    }
    return Object.freeze({ claim });
})();
