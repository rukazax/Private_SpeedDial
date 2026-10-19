'use strict';
(() => {
    const P = SpeedDialProject;
    const platform = typeof AndroidHost === 'object' ? 'android' : 'extension';
    const tr = (key, vars) => typeof tui === 'function' ? tui(key, vars) : key;
    const send = (action, more = {}) => chrome.runtime.sendMessage({ action, platform, ...more });
    const open = url => {
        if (platform === 'android') AndroidHost.openUrl(url);
        else chrome.tabs.create({ url });
    };
    async function share(button) {
        const data = { title: 'Private SpeedDial', text: 'Private SpeedDial', url: P.repository };
        if (platform === 'android') { AndroidHost.shareApp(tr('projectShare')); return; }
        if (navigator.share) {
            try { await navigator.share(data); return; }
            catch (e) { if (e.name === 'AbortError') return; }
        }
        try {
            await navigator.clipboard.writeText(P.repository);
            button.textContent = tr('projectCopied');
            setTimeout(() => { button.textContent = tr('projectShare'); }, 2500);
        } catch (_) {
            // A selectable URL remains available if clipboard permission is denied.
            const input = document.createElement('input');
            input.value = P.repository; input.readOnly = true;
            input.setAttribute('aria-label', tr('projectRepository'));
            button.after(input); input.focus(); input.select();
        }
    }
    function settings() {
        const form = document.getElementById('settingsForm');
        if (!form || document.getElementById('projectSettings')) return;
        const section = document.createElement('section');
        section.className = 'form-section'; section.id = 'projectSettings';
        const heading = document.createElement('h2'); heading.dataset.i18n = 'projectHeading'; heading.textContent = tr('projectHeading');
        const links = document.createElement('p'); links.className = 'project-links';
        const repo = document.createElement('a'); repo.href = P.repository; repo.target = '_blank'; repo.rel = 'noopener noreferrer';
        repo.dataset.i18n = 'projectRepository'; repo.textContent = tr('projectRepository');
        const downloads = document.createElement('a'); downloads.href = P.latest; downloads.target = '_blank'; downloads.rel = 'noopener noreferrer';
        downloads.dataset.i18n = 'projectDownloads'; downloads.textContent = tr('projectDownloads');
        const button = document.createElement('button'); button.type = 'button'; button.id = 'projectShare';
        button.dataset.i18n = 'projectShare'; button.textContent = tr('projectShare'); button.onclick = () => share(button);
        const description = document.createElement('p'); description.className = 'project-description'; description.dataset.i18n = 'projectWeekly'; description.textContent = tr('projectWeekly');
        links.append(repo, downloads, button); section.append(heading, links, description);
        form.querySelector('.form-actions')?.before(section);
        if (!section.isConnected) form.append(section);
        if (platform === 'android') {
            // Match the Android settings' expandable sections, even after layout.js has run.
            const details = document.createElement('details'); details.className = 'android-settings-section';
            const summary = document.createElement('summary'); summary.dataset.i18n = 'projectHeading'; summary.textContent = heading.textContent;
            section.replaceWith(details); details.id = section.id; const content = document.createElement('div'); content.className = 'android-settings-content';
            content.append(links, description); details.append(summary, content);
        }
    }
    async function startup() {
        settings();
        if (typeof DialogService === 'undefined') return;
        try {
            const result = await send('projectCheckUpdates');
            if (!result?.update) return;
            const update = result.update;
            // Never cover an edit dialog, locked profile or opened Android drawer.
            let timer;
            const attempt = async () => {
                if (document.visibilityState === 'hidden' ||
                    document.querySelector('.dialog-backdrop') || document.body.classList.contains('android-drawer-open') ||
                    [...document.querySelectorAll('.modal,.loading-overlay')].some(e => getComputedStyle(e).display !== 'none')) return;
                clearInterval(timer); document.removeEventListener('visibilitychange', attempt);
                const claim = await send('projectClaimUpdate', { tag: update.tag });
                if (!claim?.claimed) return;
                if (location.pathname.endsWith('/popup.html')) document.body.style.width = '380px';
                const choice = await DialogService.choice(tr('projectUpdateAvailable', { version: update.tag }), [
                    { label: tr('projectSkip'), value: 'skip', variant: 'secondary' },
                    { label: tr('projectUpdate'), value: 'update', variant: 'primary' }
                ]);
                if (choice === 'skip') await send('projectSkipUpdate', { tag: update.tag });
                else if (choice === 'update') open(update.download);
            };
            timer = setInterval(attempt, 1500); document.addEventListener('visibilitychange', attempt); await attempt();
        } catch (_) { /* Offline / worker restart must not interrupt normal use. */ }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(startup, 750), { once: true });
    else setTimeout(startup, 750);
})();
