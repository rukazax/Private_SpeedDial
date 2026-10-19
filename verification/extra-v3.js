(async()=>{
 const p=window._settingsPage,backup=await loadDataFromIDB(),checks=[],check=(n,v)=>{checks.push({name:n,pass:!!v});if(!v)throw Error(n);};
 const originalClick=HTMLInputElement.prototype.click;
 async function fileImport(method,text,name){HTMLInputElement.prototype.click=function(){if(this.type!=='file')return originalClick.call(this);const dt=new DataTransfer();dt.items.add(new File([text],name));this.files=dt.files;this.dispatchEvent(new Event('change'));};try{return await p[method]();}finally{HTMLInputElement.prototype.click=originalClick;}}
 try{
 check('JSON file import',await fileImport('importBookmarks',JSON.stringify({tiles:[{id:'json-v3',title:'JSON',url:'https://example.test/json'}],notes:[],folders:[]}),'test.json'));
 check('JSON data saved',(await loadDataFromIDB()).tiles[0].id==='json-v3');
 check('malformed JSON rejected',!await fileImport('importBookmarks','{broken','bad.json'));
 check('invalid JSON arrays rejected',!await fileImport('importBookmarks','{"tiles":"wrong"}','bad.json'));
 check('failed import preserves data',(await loadDataFromIDB()).tiles[0].id==='json-v3');
 check('HTML file import',await fileImport('importFromHTML','<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><DT><H3>Folder</H3><DL><DT><A HREF="https://example.test/html">HTML test</A></DL></DL>','test.html'));
 check('CSV file import',await fileImport('importFromCSV','title,url\nCSV test,https://example.test/csv','test.csv'));
 check('FVD file import',await fileImport('importFromFVD',JSON.stringify({groups:[{id:1,title:'FVD'}],dials:[{id:2,title:'FVD test',url:'https://example.test/fvd',group_id:1}]}),'test.json'));
 const d=await loadDataFromIDB();check('all import formats retained',d.tiles.some(t=>t.url.endsWith('/html'))&&d.tiles.some(t=>t.url.endsWith('/csv'))&&d.tiles.some(t=>t.url.endsWith('/fvd')));
 const html=await chrome.runtime.sendMessage({action:'exportToHTML'});check('HTML export includes imported bookmark',html.success&&html.html.includes('https://example.test/html'));
 document.getElementById('themeOpacity').value='0';document.getElementById('modalOpacity').value='0';const s=p.collect();check('zero opacity persists',s.themeOpacity===0&&s.modalOpacity===0);
 return {checks};
 }finally{HTMLInputElement.prototype.click=originalClick;await saveDataToIDB(backup);}
})()
