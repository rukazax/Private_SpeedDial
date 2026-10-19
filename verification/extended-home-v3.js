(async()=>{
 const sd=window._speedDial,backup=await loadDataFromIDB(),checks=[],check=(n,v)=>{checks.push({name:n,pass:!!v});if(!v)throw Error(n);};
 const confirm=async p=>{await new Promise(r=>setTimeout(r,20));document.getElementById('dialogOk').click();await p;};
 try{
 sd.folders=[{id:'parent',name:'Parent',parentId:''},{id:'child',name:'Child',parentId:'parent'}];sd.tiles=[{id:'child-tile',title:'Child',url:'https://example.test/child',folderId:'child'},{id:'parent-tile',title:'Parent',url:'https://example.test/parent',folderId:'parent'}];await sd.saveData();sd.switchFolder('child');await new Promise(r=>setTimeout(r,400));check('folder selection filters bookmarks',document.querySelectorAll('[data-tile-id]').length===1&&document.querySelector('[data-tile-id]').dataset.tileId==='child-tile');
 await confirm(sd.deleteFolder('parent'));check('nested folders survive parent deletion',sd.folders[0].parentId===''&&sd.tiles.find(t=>t.id==='parent-tile').folderId==='');
 sd.noteFolders=[{id:'nf',name:'Note folder'}];sd.notes=[{id:'n',title:'Note',content:'text',folderId:'nf'}];await sd.saveData();await confirm(sd.deleteNoteFolder('nf'));check('notes survive folder deletion',sd.notes[0].folderId===''&&sd.noteFolders.length===0);
 await confirm(sd.deleteNote('n'));check('note deletion and tombstone',sd.notes.length===0&&!!sd.tombstones.n);
 const now=Date.now();sd.tiles=Array.from({length:110},(_,i)=>({id:'page-'+i,title:'Bookmark '+i,url:'https://example.test/'+i,order:i,createdAt:now,updatedAt:now}));sd.folders=[];sd.currentFolder='all';sd.tilesLimit=50;sd.searchQuery='';sd.renderAll();await new Promise(r=>setTimeout(r,150));
 window.scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,400));window.scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,400));window.__pagingInfo={count:document.querySelectorAll('.tile').length,limit:sd.tilesLimit,scroll:scrollY,height:document.documentElement.scrollHeight,viewport:innerHeight,sentinel:document.getElementById('scrollSentinel').getBoundingClientRect().toJSON(),root:sd.scrollObserver?.root?.id};check('scroll pagination beyond 100 bookmarks',document.querySelectorAll('.tile').length===110);window.scrollTo(0,0);
 sd.showEditTileModal('page-0');document.getElementById('tileAutoColor').checked=false;document.getElementById('tileOpacity').value='0';document.getElementById('tileIconOpacity').value='0';await sd.saveTileFromForm({preventDefault(){},target:document.getElementById('tileForm')});check('bookmark zero opacity saved',sd.tiles.find(t=>t.id==='page-0').opacity===0&&sd.tiles.find(t=>t.id==='page-0').iconOpacity===0);
 sd.showEditTileModal('page-0');check('bookmark zero opacity reopens correctly',document.getElementById('tileOpacity').value==='0');sd.hideModal('tileModal');
 return {checks};
 }finally{await saveDataToIDB(backup);await sd.loadData();await sd.renderAll();window.scrollTo(0,0);}
})()
