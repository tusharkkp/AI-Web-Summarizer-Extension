if (!globalThis.__aiWebSummarizerContentScriptLoaded) {
  globalThis.__aiWebSummarizerContentScriptLoaded = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "GET_SELECTED_TEXT") {
      sendResponse({
        selectedText: window.getSelection().toString().trim(),
      });
    }
  });
}
