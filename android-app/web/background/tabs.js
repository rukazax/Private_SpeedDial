'use strict';
function notifyTabs(action,payload={}) { api.tabs.sendMessage(1,{action,...payload}).catch(()=>{}); }
