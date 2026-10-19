'use strict';
window.androidBack=()=>{
    const dialog=document.querySelector('.dialog-backdrop');
    if(dialog){const cancel=dialog.querySelector('#dialogCancel');if(cancel)cancel.click();else dialog.click();return true;}
    const modal=document.querySelector('.modal.active');
    if(modal){modal.classList.remove('active');return true;}
    const menu=[...document.querySelectorAll('.context-menu')].find(e=>getComputedStyle(e).display!=='none');
    if(menu){menu.style.display='none';return true;}
    if(window.androidCloseDrawer?.())return true;
    return false;
};
document.addEventListener('DOMContentLoaded',()=>{
    const menus=[
        ['contextMenu','contextMenuTarget','tiles','tileSortMode','_swapTiles'],
        ['folderContextMenu','folderContextMenuTarget','folders','folderSortMode','_swapFolders'],
        ['noteContextMenu','noteContextMenuTarget','notes','noteSortMode','_swapNotes'],
        ['noteFolderContextMenu','noteFolderContextMenuTarget','noteFolders','noteFolderSortMode','_swapNoteFolders']
    ];
    for(const [menuId,targetKey,listKey,sortKey,swap] of menus){
        const menu=document.getElementById(menuId);if(!menu)continue;
        for(const [direction,key] of [[-1,'moveEarlier'],[1,'moveLater']]){
            const item=document.createElement('div');item.className='context-menu-item android-reorder';item.setAttribute('role','button');
            item.dataset.i18n=key;item.textContent=translateKey(document.documentElement.lang,key);
            item.dataset.direction=String(direction);
            item.onclick=async e=>{
                e.stopPropagation();const sd=window._speedDial;if(!sd)return;
                const id=sd[targetKey], selected=sd[listKey].find(x=>x.id===id);if(!selected)return;
                const list=sd[listKey].filter(x=>listKey==='folders'||listKey==='noteFolders'?(x.parentId||'')===(selected.parentId||''):(x.folderId||'')===(selected.folderId||''));
                const next=list[list.findIndex(x=>x.id===id)+direction];sd.hideAllContextMenus();
                if(next){sd.settings[sortKey]='manual';sd._touchSettings();await chrome.storage.sync.set({[sortKey]:'manual'});await sd[swap](id,next.id);}
            };
            menu.appendChild(item);
        }
        new MutationObserver(()=>{
            if(getComputedStyle(menu).display==='none')return;
            const r=menu.getBoundingClientRect(),left=Math.max(8,Math.min(r.left,innerWidth-r.width-8)),top=Math.max(8,Math.min(r.top,innerHeight-r.height-8));
            if(Math.abs(r.left-left)>1)menu.style.left=left+'px';
            if(Math.abs(r.top-top)>1)menu.style.top=top+'px';
        }).observe(menu,{attributes:true,attributeFilter:['style']});
    }
    if(location.pathname.endsWith('options.html')){
        const info=document.createElement('p');info.className='android-info';
        info.dataset.i18n='androidScheduleInfo';info.textContent=tui('androidScheduleInfo');
        document.querySelector('h1')?.after(info);
        const note=document.querySelector('#autoSync')?.closest('.form-group')?.querySelector('small');
        if(note)note.removeAttribute('data-i18n');
    }
    let timer,held=false,x,y,target;
    document.addEventListener('touchstart',e=>{
        held=false;
        if(e.touches.length!==1)return;
        target=e.target.closest('.tile,.folder-tab,.note-folder-tab,.note-item,.note');
        if(!target)return;
        x=e.touches[0].clientX;y=e.touches[0].clientY;held=false;
        timer=setTimeout(()=>{held=true;target.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y}));},550);
    },{passive:true});
    document.addEventListener('touchmove',e=>{if(e.touches.length&&Math.hypot(e.touches[0].clientX-x,e.touches[0].clientY-y)>12)clearTimeout(timer);},{passive:true});
    document.addEventListener('touchend',()=>clearTimeout(timer),{passive:true});
    document.addEventListener('touchcancel',()=>clearTimeout(timer),{passive:true});
    document.addEventListener('click',e=>{if(held){e.preventDefault();e.stopImmediatePropagation();held=false;}},true);
});
