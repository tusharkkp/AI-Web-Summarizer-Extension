function getSelectedText() {
  return window.getSelection().toString().trim();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_SELECTED_TEXT") {
    sendResponse({
      selectedText: getSelectedText(),
    });
  }
});
