'use strict';

/* ============================================================
   profiles.js — управление профилями.
   v6.5.0: tombstones сохраняются при переключении.
   ============================================================ */

async function getProfilesData() {
    try {
        const data = await api.storage.local.get(['profiles', 'activeProfile']);
        return {
            profiles: data.profiles || { default: { speedDialData: null } },
            active: data.activeProfile || 'default'
        };
    } catch (e) {
        logError('profiles.getProfilesData', e.message);
        return { profiles: { default: { speedDialData: null } }, active: 'default' };
    }
}

async function getProfiles() {
    const data = await getProfilesData();
    return {
        success: true,
        profiles: Object.keys(data.profiles),
        active: data.active
    };
}

async function switchProfile(profileName) {
    if (!profileName || typeof profileName !== 'string') {
        return { success: false, error: tbg('badProfileName') };
    }

    try {
        const { profiles, active } = await getProfilesData();

        if (!profiles[profileName]) {
            logWarn('profiles.switchProfile', `Профиль «${profileName}» не найден`);
            return { success: false, error: tbg('profileNotFound') };
        }

        if (active === profileName) {
            return { success: true, profile: profileName };
        }

        logInfo('profiles.switchProfile', `Переключение: ${active} → ${profileName}`);

        const currentData = await loadDataFromIDB();
        if (currentData) {
            profiles[active] = { speedDialData: currentData };
        }

        const target = profiles[profileName]?.speedDialData;
        if (target) {
            await saveDataToIDB(target);
        } else {
            await saveDataToIDB({
                tiles: [], folders: [], notes: [], noteFolders: [],
                folderPasswords: {}, tombstones: {},
                headerHidden: false, sidebarCollapsed: false
            });
        }

        activeProfile = profileName;
        await api.storage.local.set({
            profiles,
            activeProfile: profileName
        });

        notifyTabs('profileChanged', { profile: profileName });
        logInfo('profiles.switchProfile', `Активный профиль: ${profileName}`);
        return { success: true, profile: profileName };
    } catch (e) {
        logError('profiles.switchProfile', e.message, { profileName });
        return { success: false, error: e.message };
    }
}

self.getProfilesData = getProfilesData;
self.getProfiles = getProfiles;
self.switchProfile = switchProfile;