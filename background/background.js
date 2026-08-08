importScripts("../utils/constants.js");

const CONTEXT_MENU_ID = "summarize-selected-text";

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "Summarize with AI",
      contexts: ["selection"],
    });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText?.trim()) {
    return;
  }

  await chrome.storage.local.set({
    [PENDING_SELECTION_STORAGE_KEY]: info.selectionText.trim(),
  });

  await chrome.action.setBadgeBackgroundColor({ color: "#4f46e5" });
  await chrome.action.setBadgeText({ text: "1" });

  try {
    await chrome.action.openPopup();
  } catch (error) {
    // Some Chrome versions do not allow a service worker to open the popup.
    // The badge tells the user to open it manually; popup.js will consume the selection.
    console.info(
      "Open the extension popup to summarize the selected text.",
      error.message,
    );
  }
});

async function requestSummary(text, options = {}) {
  let response;

  try {
    response = await fetch(`${BACKEND_URL}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, options }),
    });
  } catch (error) {
    console.error("Could not reach the backend:", error);
    throw new Error(
      "Could not connect to the backend. Make sure it is running on port 3000.",
    );
  }

  const data = await response.json().catch(() => null);
  console.log("Backend status:", response.status);

  if (!response.ok) {
    throw new Error(
      data?.message || `Backend request failed (HTTP ${response.status}).`,
    );
  }

  if (!data?.result) {
    throw new Error("The backend returned an empty summary.");
  }

  return data.result;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SUMMARIZE_TEXT") {
    return;
  }

  requestSummary(message.text, message.options)
    .then((result) => sendResponse({ success: true, result }))
    .catch((error) => sendResponse({ success: false, message: error.message }));

  return true;
});
