'use strict';
// Android navigation uses the original models/forms, with no desktop header.
if (typeof SpeedDial !== 'undefined') {
    document.body.classList.add('android-home');
    const button=document.createElement('button');
    button.id='androidMenuButton';button.className='android-menu-button';button.type='button';
    button.dataset.i18nAria='openMenu';button.setAttribute('aria-label','Open menu');button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','androidDrawer');
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    const shade=document.createElement('div');shade.id='androidDrawerShade';shade.className='android-drawer-shade';shade.hidden=true;
    const drawer=document.createElement('nav');drawer.id='androidDrawer';drawer.className='android-drawer';drawer.hidden=true;
    drawer.dataset.i18nAria='appMenu';
    const heading=document.createElement('div');heading.className='android-drawer-heading';heading.textContent='Private SpeedDial';
    const close=document.createElement('button');close.type='button';close.className='android-drawer-close';close.textContent='✕';close.dataset.i18nAria='closeMenu';heading.append(close);drawer.append(heading);
    const search=document.querySelector('.search-container');
    const searchLabel=document.createElement('label');searchLabel.htmlFor='searchInput';searchLabel.dataset.i18n='localSearchLabel';searchLabel.className='android-search-label';drawer.append(searchLabel,search);
    const notes=document.createElement('details');notes.id='androidNotes';notes.className='android-menu-section';
    const notesSummary=document.createElement('summary');notesSummary.dataset.i18n='notes';notes.append(notesSummary,document.getElementById('notesSidebar'));drawer.append(notes);
    const top=document.createElement('div');top.id='androidTopRow';top.className='android-top-row';top.append(button,document.getElementById('foldersBarWrap'));
    const actions=document.createElement('div');actions.className='android-menu-actions';drawer.append(actions);
    const open=()=>{drawer.hidden=false;shade.hidden=false;button.setAttribute('aria-expanded','true');document.body.classList.add('android-drawer-open');close.focus();};
    const shut=()=>{drawer.hidden=true;shade.hidden=true;button.setAttribute('aria-expanded','false');document.body.classList.remove('android-drawer-open');button.focus();};
    window.androidCloseDrawer=()=>{if(drawer.hidden)return false;shut();return true;};
    button.onclick=open;shade.onclick=shut;close.onclick=shut;
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden){e.preventDefault();shut();}});
    drawer.addEventListener('keydown',e=>{
        if(e.key!=='Tab')return;
        const all=[...drawer.querySelectorAll('button,input,summary,select,textarea,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
        const first=all[0],last=all[all.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    const item=(id,label,action)=>{
        const b=document.createElement('button');b.type='button';b.id=id;b.className='android-menu-item';b.dataset.i18n=label;
        b.onclick=()=>{shut();const sd=window._speedDial;if(sd)action(sd);};actions.append(b);
    };
    item('androidAddTile','addTile',sd=>sd.showAddTileModal());
    item('androidSync','sync',sd=>sd.syncWithServer());
    item('androidSettings','settings',()=>chrome.runtime.sendMessage({action:'openOptionsAsPopup'}));
    item('androidProfile','profile',()=>AndroidHost.openUrl(chrome.runtime.getURL('options.html')+'#profilesTable'));
    item('androidTheme','switchTheme',sd=>sd.toggleTheme());
    item('androidBackground','appearanceMenu',sd=>sd.openBackgroundGallery());
    item('androidBrowserExtension','browserExtension',()=>AndroidHost.openUrl('https://github.com/rukazax/Private_SpeedDial'));
    document.body.append(shade,drawer,top);
    document.getElementById('androidStaging')?.remove();
    document.querySelector('.web-search-container')?.remove();
    document.getElementById('collapseSidebar')?.remove();
    document.getElementById('sidebarResizer')?.remove();
    document.getElementById('addNote').dataset.i18n='noteAddShort';
    document.getElementById('addNote').dataset.i18nAria='addNote';
    const updateWidth=()=>{
        let cover=innerWidth;
        try{cover=AndroidHost.primaryScreenWidth();}catch(e){}
        const reference=Math.min(cover,innerWidth),gap=12,tile=Math.max(1,(reference-32-gap)/2);
        const columns=Math.max(2,Math.floor((innerWidth-32+gap+0.1)/(tile+gap)));
        const style=document.documentElement.style;
        style.setProperty('--android-tile-width',tile+'px');
        style.setProperty('--android-columns',String(columns));
    };
    window.addEventListener('resize',updateWidth);updateWidth();
    document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')shut();});
    const originalSwitchFolder=SpeedDial.prototype.switchFolder;
    SpeedDial.prototype.switchFolder=function(...args){const result=originalSwitchFolder.apply(this,args);shut();return result;};
    const originalDesign=SpeedDial.prototype.applyDesignSettings;
    SpeedDial.prototype.applyDesignSettings=function(...args){originalDesign.apply(this,args);updateWidth();};
}

if (typeof SettingsPage !== 'undefined') {
    document.body.classList.add('android-settings');
    document.querySelector('h1')?.setAttribute('tabindex','-1');
    const back=document.createElement('button');back.type='button';back.className='android-settings-back';back.dataset.i18n='back';back.onclick=()=>AndroidHost.home();
    document.querySelector('.container')?.prepend(back);
    const hash=location.hash;
    if(hash){const target=document.querySelector(hash);const section=target?.closest('details');if(section)section.open=true;}
}
