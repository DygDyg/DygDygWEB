chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !['DYG_NEW_TAB_BRIDGE', 'DYG_NEW_TAB_PAGE'].includes(message.source)) return false;

  if (message.type === 'SEARCH_DEFAULT_PROVIDER') {
    chrome.search.query({ text: String(message.query || ''), disposition: 'CURRENT_TAB' }, () => {
      const error = chrome.runtime.lastError;
      sendResponse({ ok: !error, error: error?.message || '' });
    });
    return true;
  }

  if (message.type !== 'GET_GOOGLE_DRIVE_TOKEN') return false;

  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id || '';
  if (!clientId || clientId.includes('PASTE_CHROME_EXTENSION_OAUTH_CLIENT_ID')) {
    sendResponse({
      ok: false,
      error: 'В manifest.json нужно заменить OAuth client_id на Client ID типа Chrome extension из Google Cloud Console.'
    });
    return false;
  }

  chrome.identity.getAuthToken({ interactive: Boolean(message.interactive) }, result => {
    const error = chrome.runtime.lastError;
    if (error) {
      sendResponse({ ok: false, error: error.message || 'Не удалось получить Google token' });
      return;
    }

    const token = typeof result === 'string' ? result : result?.token;
    sendResponse({ ok: Boolean(token), token: token || '', error: token ? '' : 'Google token пустой' });
  });

  return true;
});
