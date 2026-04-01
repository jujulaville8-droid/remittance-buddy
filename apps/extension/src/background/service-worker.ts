import { isAuthenticated } from '../lib/auth';

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.sidePanel.open({ windowId: message.windowId }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'CHECK_AUTH') {
    isAuthenticated().then((authenticated) => {
      sendResponse({ authenticated });
    });
    return true;
  }
});

chrome.alarms.create('refresh-rates', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-rates') {
    // TODO: Refresh cached rates for user's default corridor
  }
});
