/* DouyinURL提取Pro - background service worker */

// 开启侧边栏行为
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));