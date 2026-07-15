const NATIVE_HOST = 'com.chatgpt_browser_bridge.host';
const DEFAULT_SETTINGS = {
  maxTextChars: 18000,
  autoInsertResult: true,
  requireConfirmation: true,
  autoExecuteAllTools: true,
  autoSubmitResults: true
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get('settings');
  const settings = current.settings || {};
  await chrome.storage.local.set({
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
      autoExecuteAllTools: settings.autoExecuteAllTools ?? true,
      autoSubmitResults: settings.autoSubmitResults ?? true
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(error => sendResponse({ ok:false, error:error.message }));
  return true;
});

async function handleMessage(message) {
  switch (message?.type) {
    case 'GET_SETTINGS': return { ok:true, ...(await chrome.storage.local.get('settings')) };
    case 'SAVE_SETTINGS': {
      const current = await chrome.storage.local.get('settings');
      await chrome.storage.local.set({
        settings: {
          ...DEFAULT_SETTINGS,
          ...(current.settings || {}),
          ...(message.settings || {})
        }
      });
      return { ok:true };
    }
    case 'OPEN_GOOGLE_SEARCH': {
      const query = String(message.query || '').trim();
      if (!query) throw new Error('Пустой поисковый запрос');
      const tab = await chrome.tabs.create({url:`https://www.google.com/search?q=${encodeURIComponent(query)}`, active:true});
      return {ok:true, tabId:tab.id};
    }
    case 'OPEN_AVITO_SEARCH': {
      const query = String(message.query || '').trim();
      if (!query) throw new Error('Пустой поисковый запрос');
      const locationPath = String(message.locationPath || 'rossiya').replace(/^\/+|\/+$/g,'') || 'rossiya';
      const tab = await chrome.tabs.create({url:`https://www.avito.ru/${locationPath}?q=${encodeURIComponent(query)}`, active:true});
      return {ok:true, tabId:tab.id};
    }
    case 'EXECUTE_LOCAL_TOOL': {
      const spec = message.spec || {};
      return await chrome.runtime.sendNativeMessage(NATIVE_HOST, spec);
    }
    case 'PING_NATIVE_HOST':
      return await chrome.runtime.sendNativeMessage(NATIVE_HOST, {version:1,id:crypto.randomUUID(),tool:'bridge.describe'});
    default: return {ok:false,error:'Неизвестный тип сообщения'};
  }
}
