// No background collection, authentication, alarms or analytics in comparison mode.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    sender.id !== chrome.runtime.id ||
    message.type !== 'OPEN_SIDE_PANEL' ||
    !Number.isInteger(message.windowId)
  )
    return
  chrome.sidePanel.open({ windowId: message.windowId }).then(
    () => sendResponse({ success: true }),
    () => sendResponse({ success: false })
  )
  return true
})
